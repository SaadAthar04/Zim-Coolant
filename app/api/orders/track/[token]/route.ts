import { NextRequest, NextResponse } from 'next/server'
import { orderOperations, getDb, type Order } from '@/lib/database'
import { readOrderToken } from '@/lib/order-token'
import { sendCustomerOrderEmail, sendAdminCancelledEmail } from '@/lib/email/order-emails'

// The customer's own view of their order, opened from the link in their email.
//
// Authorisation is the signed token itself: it proves the holder received an
// email we sent for this order. Only the fields that customer already knows are
// returned — never the internal id, and never another order.

const publicView = (order: Order) => ({
  order_number: order.order_number,
  status: order.status,
  created_at: order.created_at,
  customer_name: order.customer_name,
  shipping_address: order.shipping_address,
  shipping_city: order.shipping_city,
  payment_method: order.payment_method,
  items: order.items,
  subtotal: order.subtotal,
  shipping_cost: order.shipping_cost,
  tax_amount: order.tax_amount,
  total_amount: order.total_amount,
  courier_name: order.courier_name,
  tracking_number: order.tracking_number,
  tracking_url: order.tracking_url,
  /**
   * Only before we confirm it. The Shipping Policy and Terms of 22 September
   * 2026 both read "You may cancel only before we confirm the order", so a
   * confirmed order has to be cancelled by talking to the shop.
   */
  can_cancel: order.status === 'pending',
})

// GET /api/orders/track/[token]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const orderId = readOrderToken(token)

    // A forged, malformed or expired token is answered identically to a missing
    // order, so nothing can be learned by probing.
    if (!orderId) {
      return NextResponse.json({ error: 'This link is not valid or has expired.' }, { status: 404 })
    }

    const order = orderOperations.getById(orderId)
    if (!order) {
      return NextResponse.json({ error: 'This link is not valid or has expired.' }, { status: 404 })
    }

    return NextResponse.json({ data: publicView(order) })
  } catch (error) {
    console.error('Error reading a tracked order:', error)
    return NextResponse.json({ error: 'Failed to load the order' }, { status: 500 })
  }
}

// POST /api/orders/track/[token] { action: 'cancel' }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json().catch(() => ({}))

    if (body.action !== 'cancel') {
      return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
    }

    const orderId = readOrderToken(token)
    if (!orderId) {
      return NextResponse.json({ error: 'This link is not valid or has expired.' }, { status: 404 })
    }

    const order = orderOperations.getById(orderId)
    if (!order) {
      return NextResponse.json({ error: 'This link is not valid or has expired.' }, { status: 404 })
    }

    if (order.status === 'cancelled') {
      return NextResponse.json({ error: 'This order is already cancelled.' }, { status: 409 })
    }
    if (order.status !== 'pending') {
      return NextResponse.json(
        {
          error:
            'This order has already been confirmed, so it can no longer be cancelled online. ' +
            'Please contact us on WhatsApp at +92 333-1632138.',
        },
        { status: 409 }
      )
    }

    // Cancelling and restocking move together: stock must not be returned for an
    // order that failed to cancel, nor held against one that did.
    const db = getDb()
    const now = new Date().toISOString()
    const giveBack = db.prepare(`
      UPDATE products
      SET stock_quantity = stock_quantity + ?, updated_at = ?
      WHERE id = ?
    `)

    db.transaction(() => {
      db.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?').run(
        'cancelled',
        now,
        order.id
      )
      for (const item of order.items) {
        if (item.product_id && item.quantity > 0) {
          giveBack.run(item.quantity, now, item.product_id)
        }
      }
    })()

    // Sent after the transaction commits, so no email can describe a
    // cancellation that was rolled back.
    sendCustomerOrderEmail(order.id, 'cancelled', { byCustomer: true }).catch((err) =>
      console.error(`[track] Cancellation email failed for ${order.id}:`, err)
    )
    sendAdminCancelledEmail(order.id, { byCustomer: true }).catch((err) =>
      console.error(`[track] Admin cancellation email failed for ${order.id}:`, err)
    )

    const updated = orderOperations.getById(order.id)!
    return NextResponse.json({
      message: 'Your order has been cancelled.',
      data: publicView(updated),
    })
  } catch (error) {
    console.error('Error cancelling a tracked order:', error)
    return NextResponse.json({ error: 'Failed to cancel the order' }, { status: 500 })
  }
}
