import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { orderOperations } from '@/lib/database'
import {
  previewOrderEmail,
  sendCustomerOrderEmail,
  CUSTOMER_EMAIL_LABEL,
  type CustomerEmailKind,
} from '@/lib/email/order-emails'

const KINDS = Object.keys(CUSTOMER_EMAIL_LABEL) as CustomerEmailKind[]

const readKind = (request: NextRequest, fallback?: string) => {
  const { searchParams } = new URL(request.url)
  const kind = (searchParams.get('kind') || fallback || '') as CustomerEmailKind
  return KINDS.includes(kind) ? kind : null
}

// GET /api/orders/[id]/emails?kind=dispatched - renders the email without
// sending it, so the shop can see exactly what the customer will receive.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const kind = readKind(request)
    if (!kind) {
      return NextResponse.json(
        { error: `Unknown email. Use one of: ${KINDS.join(', ')}.` },
        { status: 400 }
      )
    }

    const preview = previewOrderEmail(id, kind)
    if (!preview) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ data: preview })
  } catch (error) {
    console.error('Error previewing the order email:', error)
    return NextResponse.json({ error: 'Failed to preview the email' }, { status: 500 })
  }
}

// POST /api/orders/[id]/emails { kind } - re-sends one order email. Useful when
// a customer mistypes their address, or a message lands in spam.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const kind = readKind(request, body.kind)
    if (!kind) {
      return NextResponse.json(
        { error: `Unknown email. Use one of: ${KINDS.join(', ')}.` },
        { status: 400 }
      )
    }

    const order = orderOperations.getById(id)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    if (!order.customer_email) {
      return NextResponse.json(
        { error: 'This order has no email address on it.' },
        { status: 400 }
      )
    }

    // Awaited here, unlike the automatic sends: an admin who pressed "resend"
    // is waiting to be told whether it worked.
    const sent = await sendCustomerOrderEmail(id, kind)

    return sent
      ? NextResponse.json({
          message: `${CUSTOMER_EMAIL_LABEL[kind]} email re-sent to ${order.customer_email}.`,
        })
      : NextResponse.json(
          { error: 'The email could not be sent. Check the email log for the reason.' },
          { status: 502 }
        )
  } catch (error) {
    console.error('Error re-sending the order email:', error)
    return NextResponse.json({ error: 'Failed to send the email' }, { status: 500 })
  }
}
