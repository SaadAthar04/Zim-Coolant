import { NextRequest, NextResponse } from 'next/server';
import { orderOperations } from '@/lib/database';

// GET /api/orders - Get orders with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const status = searchParams.get('status');
    const stats = searchParams.get('stats');

    // Return dashboard stats
    if (stats === 'true') {
      const totalOrders = orderOperations.count(['confirmed', 'completed'], 'paid');
      const totalSales = orderOperations.getTotalSales();
      const allPaidOrders = orderOperations.getConfirmedAndPaid();

      return NextResponse.json({
        data: {
          totalOrders,
          totalSales,
          totalCustomers: allPaidOrders.length,
        }
      });
    }

    // Filter by status
    if (status) {
      const statuses = status.split(',');
      const orders = orderOperations.getByStatus(statuses);
      return NextResponse.json({ data: orders });
    }

    // Get all orders with optional limit
    const orders = orderOperations.getAll(limit ? parseInt(limit) : undefined);
    return NextResponse.json({ data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const requiredFields = ['customer_name', 'customer_email', 'items', 'subtotal', 'shipping_cost', 'tax_amount', 'total_amount'];
    for (const field of requiredFields) {
      if (body[field] === undefined) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const order = orderOperations.create({
      customer_name: body.customer_name,
      customer_email: body.customer_email,
      customer_phone: body.customer_phone,
      shipping_address: body.shipping_address,
      items: body.items,
      subtotal: body.subtotal,
      shipping_cost: body.shipping_cost,
      tax_amount: body.tax_amount,
      total_amount: body.total_amount,
      status: body.status || 'pending',
      payment_status: body.payment_status || 'pending'
    });

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
