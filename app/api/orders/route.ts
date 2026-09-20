import { NextRequest, NextResponse } from 'next/server';
import { orderOperations, productOperations, placeOrder, type OrderItem } from '@/lib/database';
import { requireAdmin } from '@/lib/admin-auth';
import { isEmailConfigured, sendOrderEmails } from '@/lib/email';
import {
  MAX_QUANTITY_PER_ITEM,
  PAYMENT_METHOD,
  shippingCostFor,
  taxFor,
} from '@/lib/store-config';

// GET /api/orders - admin only. Orders hold customer names, phone numbers and
// home addresses, so this must never be readable by the public.
export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const status = searchParams.get('status');
    const stats = searchParams.get('stats');

    if (stats === 'true') {
      return NextResponse.json({
        data: {
          totalOrders: orderOperations.count(['confirmed', 'completed'], 'paid'),
          totalSales: orderOperations.getTotalSales(),
          totalCustomers: orderOperations.getConfirmedAndPaid().length,
        },
      });
    }

    if (status) {
      return NextResponse.json({ data: orderOperations.getByStatus(status.split(',')) });
    }

    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return NextResponse.json({
      data: orderOperations.getAll(
        Number.isFinite(parsedLimit) && parsedLimit! > 0 ? parsedLimit : undefined
      ),
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Pakistani mobile and landline formats, allowing +92, spaces and dashes. */
const PHONE_PATTERN = /^[+\d][\d\s()-]{7,19}$/;

const clean = (value: unknown, max = 500) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

/**
 * POST /api/orders - place an order.
 *
 * The browser sends only who the customer is and what they picked. Every price,
 * the shipping charge and the total are worked out here from the database, so a
 * tampered cart cannot change what is charged, and stock is checked before the
 * order is accepted.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // An order entered by the shop (a phone order, say) often has no email
    // address, and does not need a "you have a new order" notification sent
    // back to the shop that just typed it in.
    const isAdminOrder = requireAdmin(request);

    const customer = {
      name: clean(body.customer_name, 120),
      email: clean(body.customer_email, 160).toLowerCase(),
      phone: clean(body.customer_phone, 30),
      address: clean(body.shipping_address, 500),
      city: clean(body.shipping_city, 100),
      postalCode: clean(body.shipping_postal_code, 20),
      notes: clean(body.order_notes, 1000),
    };

    const fieldErrors: Record<string, string> = {};
    if (customer.name.length < 2) fieldErrors.customer_name = 'Please enter your full name.';
    if (customer.email) {
      if (!EMAIL_PATTERN.test(customer.email))
        fieldErrors.customer_email = 'Please enter a valid email address.';
    } else if (!isAdminOrder) {
      fieldErrors.customer_email = 'Please enter a valid email address.';
    }
    if (!PHONE_PATTERN.test(customer.phone))
      fieldErrors.customer_phone = 'Please enter a valid phone number.';
    if (customer.address.length < 10)
      fieldErrors.shipping_address = 'Please enter your full delivery address.';
    if (customer.city.length < 2) fieldErrors.shipping_city = 'Please enter your city.';

    if (!Array.isArray(body.items) || body.items.length === 0) {
      fieldErrors.items = 'Your cart is empty.';
    }

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        { error: 'Please check the highlighted fields.', fieldErrors },
        { status: 400 }
      );
    }

    const items: OrderItem[] = [];
    const stockDeductions: Array<{ productId: string; quantity: number }> = [];

    for (const raw of body.items) {
      const productId = clean(raw?.product_id, 64);
      const quantity = Number(raw?.quantity);

      if (!productId || !Number.isInteger(quantity) || quantity < 1) {
        return NextResponse.json({ error: 'Your cart contains an invalid item.' }, { status: 400 });
      }
      if (quantity > MAX_QUANTITY_PER_ITEM) {
        return NextResponse.json(
          { error: `You can order at most ${MAX_QUANTITY_PER_ITEM} of one item.` },
          { status: 400 }
        );
      }

      const product = productOperations.getById(productId);
      if (!product) {
        return NextResponse.json(
          { error: 'One of the products in your cart is no longer available.' },
          { status: 400 }
        );
      }

      // Honour the colour only when the product actually has one.
      const requested = clean(raw?.colour, 10).toLowerCase();
      const hasColours = Boolean(product.red_image_url);
      let colour = '';
      if (hasColours) {
        if (requested !== 'green' && requested !== 'red') {
          return NextResponse.json(
            { error: `Please choose a colour for ${product.name}.` },
            { status: 400 }
          );
        }
        colour = requested;
      }

      if (product.stock_quantity < quantity) {
        return NextResponse.json(
          {
            error:
              product.stock_quantity === 0
                ? `${product.name} is out of stock.`
                : `Only ${product.stock_quantity} of ${product.name} are left in stock.`,
          },
          { status: 409 }
        );
      }

      const price = product.price;
      items.push({
        product_id: product.id,
        product_name: product.name,
        colour,
        volume: product.volume,
        image_url:
          colour === 'red' && product.red_image_url ? product.red_image_url : product.image_url,
        quantity,
        price,
        line_total: price * quantity,
      });
      stockDeductions.push({ productId: product.id, quantity });
    }

    const subtotal = items.reduce((total, item) => total + item.line_total, 0);
    const shippingCost = shippingCostFor(subtotal);
    const taxAmount = taxFor(subtotal);
    const totalAmount = subtotal + shippingCost + taxAmount;

    const order = placeOrder(
      {
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        shipping_address: customer.address,
        shipping_city: customer.city,
        shipping_postal_code: customer.postalCode,
        order_notes: customer.notes,
        payment_method: PAYMENT_METHOD,
        items,
        subtotal,
        shipping_cost: shippingCost,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        status: 'pending',
        payment_status: 'pending',
      },
      stockDeductions
    );

    // The order is safely recorded; email must not be able to fail it.
    sendOrderEmails(order, { notifyShop: !isAdminOrder }).catch((err) =>
      console.error('[orders] Unexpected email failure:', err)
    );

    // Tells the confirmation screen whether it can honestly promise an email.
    return NextResponse.json(
      { data: order, meta: { emailConfigured: isEmailConfigured() } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
