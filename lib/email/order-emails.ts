import 'server-only'

// Order emails, centralised.
//
// Order creation, the admin status change, and the admin resend button all come
// through here, so a resent email is byte-for-byte the one the customer
// originally received.
//
// Everything is rendered from the *stored* order row. Line prices and totals are
// never recalculated from the live catalogue: a price rise next month must not
// rewrite the receipt for an order placed today.

import {
  orderOperations,
  lowStockAfterOrder,
  LOW_STOCK_THRESHOLD,
  type Order,
} from '@/lib/database'
import { orderTrackingUrl } from '@/lib/order-token'
import { sendEmail, ADMIN_NOTIFY, SITE_URL } from './mailer'
import {
  orderReceivedEmail,
  orderConfirmedEmail,
  orderDispatchedEmail,
  orderDeliveredEmail,
  orderCancelledEmail,
  adminNewOrderEmail,
  adminOrderCancelledEmail,
  adminLowStockEmail,
  type EmailContent,
} from './templates'

/** The customer-facing emails, keyed by the order status that triggers them. */
export type CustomerEmailKind =
  | 'received'
  | 'confirmed'
  | 'dispatched'
  | 'delivered'
  | 'cancelled'

/** Which status transition sends which email. */
export const EMAIL_FOR_STATUS: Record<string, CustomerEmailKind> = {
  confirmed: 'confirmed',
  dispatched: 'dispatched',
  delivered: 'delivered',
  cancelled: 'cancelled',
}

export const CUSTOMER_EMAIL_LABEL: Record<CustomerEmailKind, string> = {
  received: 'Order received',
  confirmed: 'Order confirmed',
  dispatched: 'Order dispatched',
  delivered: 'Order delivered',
  cancelled: 'Order cancelled',
}

const templateKey = (kind: CustomerEmailKind) => `order_${kind}`

/**
 * Renders one customer email for an order that is already stored.
 *
 * Returns null when the order does not exist, so callers can distinguish a
 * missing order from a send failure.
 */
export function buildCustomerEmail(
  order: Order,
  kind: CustomerEmailKind,
  options: { byCustomer?: boolean } = {}
): EmailContent {
  const siteUrl = SITE_URL()

  // A cancelled or delivered order has nothing left to track.
  const trackUrl =
    kind === 'cancelled' || kind === 'delivered'
      ? undefined
      : orderTrackingUrl(order.id, siteUrl)

  const o = { siteUrl, trackUrl }

  switch (kind) {
    case 'received':
      return orderReceivedEmail(order, o)
    case 'confirmed':
      return orderConfirmedEmail(order, o)
    case 'dispatched':
      return orderDispatchedEmail(order, o)
    case 'delivered':
      return orderDeliveredEmail(order, o)
    case 'cancelled':
      return orderCancelledEmail(order, { ...o, byCustomer: options.byCustomer })
  }
}

/** Renders without sending, for the admin preview. */
export function previewOrderEmail(orderId: string, kind: CustomerEmailKind) {
  const order = orderOperations.getById(orderId)
  if (!order) return null
  return buildCustomerEmail(order, kind)
}

/**
 * Sends one customer email. Never throws; returns whether it was accepted.
 *
 * The order is re-read here so a status or tracking number written moments ago
 * is reflected in the email rather than a stale copy passed in by the caller.
 */
export async function sendCustomerOrderEmail(
  orderId: string,
  kind: CustomerEmailKind,
  options: { byCustomer?: boolean } = {}
): Promise<boolean> {
  const order = orderOperations.getById(orderId)
  if (!order) {
    console.warn(`[email] Order ${orderId} not found; ${kind} email not sent.`)
    return false
  }
  if (!order.customer_email) {
    console.warn(`[email] Order ${order.order_number} has no email address.`)
    return false
  }

  const { subject, html } = buildCustomerEmail(order, kind, options)

  return sendEmail({
    to: order.customer_email,
    subject,
    html,
    template: templateKey(kind),
    relatedOrderId: order.id,
  })
}

/** Tells the shop an order has come in. */
export async function sendAdminNewOrderEmail(orderId: string): Promise<boolean> {
  const order = orderOperations.getById(orderId)
  if (!order) return false

  const { subject, html } = adminNewOrderEmail(order, { siteUrl: SITE_URL() })

  return sendEmail({
    to: ADMIN_NOTIFY(),
    subject,
    html,
    template: 'admin_new_order',
    relatedOrderId: order.id,
    // So the shop can answer the customer straight from the notification.
    replyTo: order.customer_email,
  })
}

export async function sendAdminCancelledEmail(
  orderId: string,
  options: { byCustomer?: boolean } = {}
): Promise<boolean> {
  const order = orderOperations.getById(orderId)
  if (!order) return false

  const { subject, html } = adminOrderCancelledEmail(order, {
    siteUrl: SITE_URL(),
    byCustomer: options.byCustomer,
  })

  return sendEmail({
    to: ADMIN_NOTIFY(),
    subject,
    html,
    template: 'admin_order_cancelled',
    relatedOrderId: order.id,
  })
}

/** Warns the shop about anything that has just dropped to the threshold. */
export async function sendLowStockAlert(productIds: string[]): Promise<boolean> {
  const low = lowStockAfterOrder(productIds)
  if (low.length === 0) return false

  const { subject, html } = adminLowStockEmail(low, {
    siteUrl: SITE_URL(),
    threshold: LOW_STOCK_THRESHOLD,
  })

  return sendEmail({
    to: ADMIN_NOTIFY(),
    subject,
    html,
    template: 'admin_low_stock',
  })
}

/**
 * Everything that goes out when an order is placed.
 *
 * Deliberately not awaited by the checkout route: the order is already safely
 * recorded, and the customer should not wait on an SMTP round trip. Each send
 * is isolated so one failure cannot suppress the others.
 */
export async function sendNewOrderEmails(
  orderId: string,
  options: { notifyShop?: boolean; productIds?: string[] } = {}
) {
  const { notifyShop = true, productIds = [] } = options

  const results = await Promise.allSettled([
    sendCustomerOrderEmail(orderId, 'received'),
    notifyShop ? sendAdminNewOrderEmail(orderId) : Promise.resolve(false),
    // Alerting must never be able to break the order flow.
    productIds.length > 0 ? sendLowStockAlert(productIds) : Promise.resolve(false),
  ])

  const value = (i: number) =>
    results[i].status === 'fulfilled' && (results[i] as PromiseFulfilledResult<boolean>).value

  return {
    customer: value(0),
    shop: value(1),
    lowStock: value(2),
  }
}
