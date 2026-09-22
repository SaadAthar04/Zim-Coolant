import { NextRequest, NextResponse } from 'next/server';
import {
  orderOperations,
  deleteOrderRestoringStock,
  ORDER_STATUSES,
} from '@/lib/database';
import { requireAdmin } from '@/lib/admin-auth';
import {
  EMAIL_FOR_STATUS,
  sendCustomerOrderEmail,
  sendAdminCancelledEmail,
} from '@/lib/email/order-emails';

// GET /api/orders/[id] - Get a single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const order = orderOperations.getById(id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

// PUT /api/orders/[id] - Update an order
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const existingOrder = orderOperations.getById(id);
    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    let order;

    // Courier details are written before the status, so the dispatch email
    // below is built from an order that already carries its tracking number
    // rather than an empty one.
    if (
      body.courier_name !== undefined ||
      body.tracking_number !== undefined ||
      body.tracking_url !== undefined
    ) {
      order = orderOperations.updateTracking(id, {
        courier_name: body.courier_name ?? existingOrder.courier_name,
        tracking_number: body.tracking_number ?? existingOrder.tracking_number,
        tracking_url: body.tracking_url ?? existingOrder.tracking_url,
      });
    }

    // Update status
    let statusChangedTo: string | null = null;
    if (body.status !== undefined) {
      if (!(ORDER_STATUSES as readonly string[]).includes(body.status)) {
        return NextResponse.json(
          { error: `Unknown status. Use one of: ${ORDER_STATUSES.join(', ')}.` },
          { status: 400 }
        );
      }
      // Only a real transition notifies the customer — re-saving an order that
      // is already 'dispatched' must not email them a second time.
      if (body.status !== existingOrder.status) statusChangedTo = body.status;
      order = orderOperations.updateStatus(id, body.status);
    }

    // Update payment status
    if (body.payment_status !== undefined) {
      order = orderOperations.updatePaymentStatus(id, body.payment_status);
    }

    if (!order) {
      order = orderOperations.getById(id);
    }

    // Correcting a tracking number on an already-dispatched order is not a
    // status change, but the customer still needs the new details.
    if (!statusChangedTo && body.resendDispatch && existingOrder.status === 'dispatched') {
      sendCustomerOrderEmail(id, 'dispatched').catch((err) =>
        console.error(`[orders] Dispatch re-send failed for ${id}:`, err)
      );
    }

    // Fired after every write, never awaited: a mail server that is slow or
    // down must not make the admin's status change appear to fail.
    if (statusChangedTo) {
      const kind = EMAIL_FOR_STATUS[statusChangedTo];
      if (kind) {
        sendCustomerOrderEmail(id, kind).catch((err) =>
          console.error(`[orders] ${kind} email failed for ${id}:`, err)
        );
      }
      if (statusChangedTo === 'cancelled') {
        sendAdminCancelledEmail(id).catch((err) =>
          console.error(`[orders] Admin cancellation email failed for ${id}:`, err)
        );
      }
    }

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

// DELETE /api/orders/[id] - Delete an order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Also returns the items to stock unless the order was already completed.
    const deleted = deleteOrderRestoringStock(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Order deleted' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
