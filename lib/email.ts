// Order emails.
//
// Two messages go out when an order is placed: a notification to the shop so
// they can pack it, and a confirmation to the customer (the checkout screen
// promises one).
//
// Sending is best effort and never blocks an order. If SMTP is not configured,
// or the provider rejects the message, the order is still recorded and the
// failure is logged for the client to chase.
//
// Configure in .env:
//   SMTP_USER=someone@gmail.com
//   SMTP_PASS=<16-character Gmail App Password, not the account password>
//   ORDER_NOTIFICATION_EMAIL=meelanahmad321@gmail.com   (optional override)
//   SMTP_HOST / SMTP_PORT / SMTP_SECURE                 (optional, non-Gmail)

import type { Order, OrderItem } from './database'
import { PAYMENT_METHOD_LABEL, formatPrice } from './store-config'

const SHOP_NAME = 'ZIM Chemicals'
const SITE_URL = 'https://www.zimchemicals.com'

/** Where new-order notifications go. */
const notificationAddress = () =>
  process.env.ORDER_NOTIFICATION_EMAIL || 'meelanahmad321@gmail.com'

export const isEmailConfigured = () =>
  Boolean(process.env.SMTP_USER && process.env.SMTP_PASS)

async function getTransport() {
  if (!isEmailConfigured()) return null

  // Imported lazily so a missing dependency cannot break the order route.
  const nodemailer = await import('nodemailer')

  const host = process.env.SMTP_HOST
  if (host) {
    return nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
    })
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  })
}

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const variantLabel = (item: OrderItem) =>
  [item.volume, item.colour ? item.colour[0].toUpperCase() + item.colour.slice(1) : '']
    .filter(Boolean)
    .join(' · ')

function itemRows(items: OrderItem[]) {
  return items
    .map((item) => {
      const variant = variantLabel(item)
      return `
        <tr>
          <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb">
            <strong>${escapeHtml(item.product_name)}</strong>
            ${variant ? `<br><span style="color:#6b7280;font-size:13px">${escapeHtml(variant)}</span>` : ''}
          </td>
          <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:center">${item.quantity}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:right">${formatPrice(item.price)}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:right"><strong>${formatPrice(item.line_total)}</strong></td>
        </tr>`
    })
    .join('')
}

function totalsBlock(order: Order) {
  const rows: string[] = [
    `<tr><td style="padding:4px 8px;text-align:right;color:#6b7280">Subtotal</td><td style="padding:4px 8px;text-align:right">${formatPrice(order.subtotal)}</td></tr>`,
    `<tr><td style="padding:4px 8px;text-align:right;color:#6b7280">Delivery</td><td style="padding:4px 8px;text-align:right">${
      order.shipping_cost === 0 ? 'Free' : formatPrice(order.shipping_cost)
    }</td></tr>`,
  ]
  if (order.tax_amount > 0) {
    rows.push(
      `<tr><td style="padding:4px 8px;text-align:right;color:#6b7280">Tax</td><td style="padding:4px 8px;text-align:right">${formatPrice(order.tax_amount)}</td></tr>`
    )
  }
  rows.push(
    `<tr><td style="padding:10px 8px;text-align:right;font-size:16px"><strong>Total</strong></td><td style="padding:10px 8px;text-align:right;font-size:16px"><strong>${formatPrice(order.total_amount)}</strong></td></tr>`
  )
  return rows.join('')
}

function customerBlock(order: Order) {
  const lines: Array<[string, string | undefined]> = [
    ['Name', order.customer_name],
    ['Phone', order.customer_phone],
    ['Email', order.customer_email],
    ['Address', order.shipping_address],
    ['City', order.shipping_city],
    ['Postal code', order.shipping_postal_code],
    ['Notes', order.order_notes],
  ]

  return lines
    .filter(([, value]) => value)
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:6px 8px;color:#6b7280;white-space:nowrap;vertical-align:top">${label}</td>
          <td style="padding:6px 8px"><strong>${escapeHtml(value)}</strong></td>
        </tr>`
    )
    .join('')
}

const wrapper = (title: string, body: string) => `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f3f4f6;padding:24px">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden">
      <div style="background:#025b00;color:#ffffff;padding:20px 24px">
        <div style="font-size:20px;font-weight:bold">${SHOP_NAME}</div>
        <div style="opacity:.85;font-size:14px">${escapeHtml(title)}</div>
      </div>
      <div style="padding:24px">${body}</div>
      <div style="padding:16px 24px;background:#f9fafb;color:#6b7280;font-size:12px">
        ${SHOP_NAME} · Faisalabad, Pakistan · <a href="${SITE_URL}" style="color:#025b00">zimchemicals.com</a>
      </div>
    </div>
  </div>`

function shopEmail(order: Order) {
  const items = order.items
  return wrapper(
    `New order ${order.order_number}`,
    `
    <p style="margin:0 0 16px">A new order has been placed on the website.</p>

    <h3 style="margin:24px 0 8px;font-size:15px">Customer</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px">${customerBlock(order)}</table>

    <h3 style="margin:24px 0 8px;font-size:15px">Items</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <thead>
        <tr style="background:#f9fafb">
          <th style="padding:8px;text-align:left">Product</th>
          <th style="padding:8px;text-align:center">Qty</th>
          <th style="padding:8px;text-align:right">Unit</th>
          <th style="padding:8px;text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>${itemRows(items)}</tbody>
    </table>

    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:12px">${totalsBlock(order)}</table>

    <p style="margin:20px 0 0;padding:12px;background:#f0fdf4;border-left:3px solid #025b00;font-size:14px">
      Payment method: <strong>${PAYMENT_METHOD_LABEL}</strong>
    </p>
    <p style="margin:16px 0 0;font-size:13px;color:#6b7280">
      Manage this order in the admin dashboard at ${SITE_URL}/admin
    </p>`
  )
}

function customerEmail(order: Order) {
  const items = order.items
  return wrapper(
    `Order ${order.order_number} confirmed`,
    `
    <p style="margin:0 0 16px">Hi ${escapeHtml(order.customer_name)},</p>
    <p style="margin:0 0 16px">
      Thank you for your order. We have received it and will contact you to arrange delivery.
      Your order reference is <strong>${escapeHtml(order.order_number)}</strong>.
    </p>

    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <thead>
        <tr style="background:#f9fafb">
          <th style="padding:8px;text-align:left">Product</th>
          <th style="padding:8px;text-align:center">Qty</th>
          <th style="padding:8px;text-align:right">Unit</th>
          <th style="padding:8px;text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>${itemRows(items)}</tbody>
    </table>

    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:12px">${totalsBlock(order)}</table>

    <p style="margin:20px 0 0;padding:12px;background:#f0fdf4;border-left:3px solid #025b00;font-size:14px">
      You will pay <strong>${formatPrice(order.total_amount)}</strong> in cash when your order is delivered.
    </p>

    <h3 style="margin:24px 0 8px;font-size:15px">Delivering to</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px">${customerBlock(order)}</table>`
  )
}

/**
 * Notifies the shop and confirms to the customer. Never throws: the order has
 * already been taken by the time this runs.
 */
export async function sendOrderEmails(
  order: Order,
  options: { notifyShop?: boolean } = {}
) {
  const { notifyShop = true } = options
  const result = { shop: false, customer: false, configured: isEmailConfigured() }

  if (!result.configured) {
    console.warn(
      `[email] SMTP is not configured, so no notification was sent for order ${order.order_number}. ` +
        'Set SMTP_USER and SMTP_PASS to enable order emails.'
    )
    return result
  }

  try {
    const transport = await getTransport()
    if (!transport) return result

    const from = `"${SHOP_NAME}" <${process.env.SMTP_USER}>`

    if (notifyShop) try {
      await transport.sendMail({
        from,
        to: notificationAddress(),
        replyTo: order.customer_email,
        subject: `New order ${order.order_number} — ${formatPrice(order.total_amount)} — ${order.customer_name}`,
        html: shopEmail(order),
      })
      result.shop = true
    } catch (err) {
      console.error(`[email] Shop notification failed for ${order.order_number}:`, err)
    }

    if (order.customer_email) {
      try {
        await transport.sendMail({
          from,
          to: order.customer_email,
          subject: `Your ${SHOP_NAME} order ${order.order_number}`,
          html: customerEmail(order),
        })
        result.customer = true
      } catch (err) {
        console.error(`[email] Customer confirmation failed for ${order.order_number}:`, err)
      }
    }
  } catch (err) {
    console.error(`[email] Could not create a mail transport for ${order.order_number}:`, err)
  }

  return result
}
