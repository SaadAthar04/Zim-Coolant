// Email HTML. Pure functions: data in, { subject, html } out.
//
// Nothing here touches the database or the network, which is what lets the
// admin panel preview an email without sending it.
//
// Email clients are not browsers. The rules below are not style preferences:
//   - Inline styles only. No <style> blocks, no external CSS, no flex, no grid.
//     Gmail strips <style>; Outlook renders through Word.
//   - Tables for layout, ~600px wide.
//   - Every URL absolute. A src of "/products/x.webp" resolves against the mail
//     client's own domain and shows a broken image everywhere.
//   - Every image needs alt text, because most clients block images by default.

import type { Order, OrderItem } from '@/lib/database'
import { PAYMENT_METHOD_LABEL, formatPrice } from '@/lib/store-config'

export const SHOP_NAME = 'Zim Chemicals'

/** The green used across the storefront. */
const BRAND = '#025b00'
const INK = '#171c1e'
const MUTED = '#6b7280'
const LINE = '#e5e7eb'

export type EmailContent = { subject: string; html: string }

export const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** Turns a stored path into an absolute URL; leaves a full URL alone. */
export const imgUrl = (src: string | undefined, siteUrl: string) => {
  if (!src) return ''
  if (/^https?:\/\//i.test(src)) return src
  return `${siteUrl.replace(/\/$/, '')}/${src.replace(/^\//, '')}`
}

/** Only http(s) links are allowed through to an href. */
const safeUrl = (url: string | undefined) =>
  url && /^https?:\/\//i.test(url) ? escapeHtml(url) : ''

// --- Shared chrome ----------------------------------------------------------

export function layout(title: string, body: string, siteUrl: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
        <tr>
          <td style="background:${BRAND};padding:20px 24px;">
            <div style="font-size:20px;font-weight:bold;color:#ffffff;">${SHOP_NAME}</div>
            <div style="font-size:14px;color:#d7e8d5;padding-top:2px;">${escapeHtml(title)}</div>
          </td>
        </tr>
        <tr><td style="padding:24px;color:${INK};font-size:14px;line-height:1.6;">${body}</td></tr>
        <tr>
          <td style="padding:16px 24px;background:#f9fafb;color:${MUTED};font-size:12px;line-height:1.6;">
            ${SHOP_NAME} &middot; Faisalabad, Pakistan<br>
            <a href="${escapeHtml(siteUrl)}" style="color:${BRAND};text-decoration:none;">zimchemicals.com</a>
            &middot; +92 333-1632138
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

/** A button that survives Outlook, which ignores padding on <a>. */
export function btn(href: string, label: string) {
  const url = safeUrl(href)
  if (!url) return ''
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;">
      <tr>
        <td style="background:${BRAND};border-radius:6px;">
          <a href="${url}" style="display:inline-block;padding:12px 24px;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;">${escapeHtml(label)}</a>
        </td>
      </tr>
    </table>`
}

const heading = (text: string) =>
  `<h3 style="margin:24px 0 8px;font-size:15px;color:${INK};">${escapeHtml(text)}</h3>`

const variantLabel = (item: OrderItem) =>
  [item.volume, item.colour ? item.colour[0].toUpperCase() + item.colour.slice(1) : '']
    .filter(Boolean)
    .join(' · ')

// --- Order building blocks --------------------------------------------------

export function itemRows(items: OrderItem[], siteUrl: string) {
  return items
    .map((item) => {
      const variant = variantLabel(item)
      const thumb = imgUrl(item.image_url, siteUrl)
      return `
        <tr>
          <td style="padding:12px 8px;border-bottom:1px solid ${LINE};" width="56">
            ${
              thumb
                ? `<img src="${escapeHtml(thumb)}" alt="${escapeHtml(item.product_name)}" width="48" height="48" style="display:block;width:48px;height:48px;object-fit:contain;border-radius:6px;background:#f9fafb;">`
                : ''
            }
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid ${LINE};">
            <strong>${escapeHtml(item.product_name)}</strong>
            ${variant ? `<br><span style="color:${MUTED};font-size:13px;">${escapeHtml(variant)}</span>` : ''}
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid ${LINE};text-align:center;">${item.quantity}</td>
          <td style="padding:12px 8px;border-bottom:1px solid ${LINE};text-align:right;white-space:nowrap;"><strong>${formatPrice(item.line_total)}</strong></td>
        </tr>`
    })
    .join('')
}

export function itemsTable(items: OrderItem[], siteUrl: string) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="background:#f9fafb;">
          <th colspan="2" style="padding:8px;text-align:left;color:${MUTED};font-size:12px;text-transform:uppercase;">Product</th>
          <th style="padding:8px;text-align:center;color:${MUTED};font-size:12px;text-transform:uppercase;">Qty</th>
          <th style="padding:8px;text-align:right;color:${MUTED};font-size:12px;text-transform:uppercase;">Total</th>
        </tr>
      </thead>
      <tbody>${itemRows(items, siteUrl)}</tbody>
    </table>`
}

export function totalsBlock(order: Order) {
  const row = (label: string, value: string, strong = false) => `
    <tr>
      <td style="padding:${strong ? '10px' : '4px'} 8px;text-align:right;color:${strong ? INK : MUTED};font-size:${strong ? '16px' : '14px'};">${strong ? `<strong>${label}</strong>` : label}</td>
      <td style="padding:${strong ? '10px' : '4px'} 8px;text-align:right;font-size:${strong ? '16px' : '14px'};white-space:nowrap;">${strong ? `<strong>${value}</strong>` : value}</td>
    </tr>`

  const rows = [
    row('Subtotal', formatPrice(order.subtotal)),
    row('Delivery', order.shipping_cost === 0 ? 'Free' : formatPrice(order.shipping_cost)),
  ]
  if (order.tax_amount > 0) rows.push(row('Tax', formatPrice(order.tax_amount)))
  rows.push(row('Total', formatPrice(order.total_amount), true))

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:12px;">${rows.join('')}</table>`
}

export function addressBlock(order: Order) {
  const lines: Array<[string, string | undefined]> = [
    ['Name', order.customer_name],
    ['Phone', order.customer_phone],
    ['Email', order.customer_email],
    ['Address', order.shipping_address],
    ['City', order.shipping_city],
    ['Postal code', order.shipping_postal_code],
    ['Notes', order.order_notes],
  ]

  const rows = lines
    .filter(([, value]) => value)
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:6px 8px;color:${MUTED};white-space:nowrap;vertical-align:top;">${label}</td>
          <td style="padding:6px 8px;"><strong>${escapeHtml(value)}</strong></td>
        </tr>`
    )
    .join('')

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">${rows}</table>`
}

export function paymentLine(order: Order) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 0;">
      <tr>
        <td style="padding:12px;background:#f0fdf4;border-left:3px solid ${BRAND};font-size:14px;">
          Payment method: <strong>${escapeHtml(PAYMENT_METHOD_LABEL)}</strong><br>
          <span style="color:${MUTED};">Please have <strong style="color:${INK};">${formatPrice(order.total_amount)}</strong> ready in cash when your order arrives.</span>
        </td>
      </tr>
    </table>`
}

export function trackingBlock(order: Order) {
  if (!order.courier_name && !order.tracking_number && !order.tracking_url) return ''

  const rows: string[] = []
  if (order.courier_name) {
    rows.push(
      `<tr><td style="padding:4px 0;color:${MUTED};">Courier</td><td style="padding:4px 0 4px 12px;"><strong>${escapeHtml(order.courier_name)}</strong></td></tr>`
    )
  }
  if (order.tracking_number) {
    rows.push(
      `<tr><td style="padding:4px 0;color:${MUTED};">Tracking number</td><td style="padding:4px 0 4px 12px;"><strong>${escapeHtml(order.tracking_number)}</strong></td></tr>`
    )
  }

  const link = safeUrl(order.tracking_url)

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 0;">
      <tr>
        <td style="padding:14px;background:#f0fdf4;border-left:3px solid ${BRAND};font-size:14px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;">${rows.join('')}</table>
          ${link ? `<div style="padding-top:8px;"><a href="${link}" style="color:${BRAND};font-weight:bold;">Track your parcel with the courier &rarr;</a></div>` : ''}
        </td>
      </tr>
    </table>`
}

const greeting = (order: Order) =>
  `<p style="margin:0 0 16px;">Hi ${escapeHtml(order.customer_name)},</p>`

const orderRef = (order: Order) =>
  `<strong>${escapeHtml(order.order_number)}</strong>`

// --- Customer emails --------------------------------------------------------

type OrderEmailOptions = {
  siteUrl: string
  /** Signed "Track my Order" link. Omitted when link signing is unavailable. */
  trackUrl?: string
}

/** Order placed. The full receipt. */
export function orderReceivedEmail(order: Order, o: OrderEmailOptions): EmailContent {
  return {
    subject: `Order ${order.order_number} received — ${SHOP_NAME}`,
    html: layout(
      `Order ${order.order_number} received`,
      `
      ${greeting(order)}
      <p style="margin:0 0 16px;">
        Thank you for your order. We have received it and will confirm it shortly.
        Your order reference is ${orderRef(order)}.
      </p>
      ${o.trackUrl ? btn(o.trackUrl, 'Track my Order') : ''}
      ${itemsTable(order.items, o.siteUrl)}
      ${totalsBlock(order)}
      ${paymentLine(order)}
      ${heading('Delivering to')}
      ${addressBlock(order)}`,
      o.siteUrl
    ),
  }
}

/** Order confirmed by the shop. */
export function orderConfirmedEmail(order: Order, o: OrderEmailOptions): EmailContent {
  return {
    subject: `Order ${order.order_number} confirmed — ${SHOP_NAME}`,
    html: layout(
      `Order ${order.order_number} confirmed`,
      `
      ${greeting(order)}
      <p style="margin:0 0 16px;">
        Good news — your order ${orderRef(order)} is confirmed and we are preparing it
        for dispatch. We will email you again the moment it leaves us.
      </p>
      ${o.trackUrl ? btn(o.trackUrl, 'Track my Order') : ''}
      ${itemsTable(order.items, o.siteUrl)}
      ${totalsBlock(order)}
      ${paymentLine(order)}`,
      o.siteUrl
    ),
  }
}

/** Order handed to the courier. */
export function orderDispatchedEmail(order: Order, o: OrderEmailOptions): EmailContent {
  return {
    subject: `Order ${order.order_number} is on its way — ${SHOP_NAME}`,
    html: layout(
      `Order ${order.order_number} dispatched`,
      `
      ${greeting(order)}
      <p style="margin:0 0 16px;">
        Your order ${orderRef(order)} has been handed to the courier and is on its way to you.
      </p>
      ${trackingBlock(order)}
      ${o.trackUrl ? btn(o.trackUrl, 'Track my Order') : ''}
      ${itemsTable(order.items, o.siteUrl)}
      ${totalsBlock(order)}
      ${paymentLine(order)}
      ${heading('Delivering to')}
      ${addressBlock(order)}`,
      o.siteUrl
    ),
  }
}

/** Order delivered. */
export function orderDeliveredEmail(order: Order, o: OrderEmailOptions): EmailContent {
  return {
    subject: `Order ${order.order_number} delivered — ${SHOP_NAME}`,
    html: layout(
      `Order ${order.order_number} delivered`,
      `
      ${greeting(order)}
      <p style="margin:0 0 16px;">
        Your order ${orderRef(order)} has been delivered. We hope you are happy with it.
      </p>
      <p style="margin:0 0 16px;">
        If anything arrived damaged or is not what you ordered, reply to this email or
        call us on +92 333-1632138 within 48 hours and we will put it right.
      </p>
      ${itemsTable(order.items, o.siteUrl)}
      ${totalsBlock(order)}
      <p style="margin:20px 0 0;color:${MUTED};">Thank you for choosing ${SHOP_NAME}.</p>`,
      o.siteUrl
    ),
  }
}

/** Order cancelled, by the shop or by the customer. */
export function orderCancelledEmail(
  order: Order,
  o: OrderEmailOptions & { byCustomer?: boolean }
): EmailContent {
  return {
    subject: `Order ${order.order_number} cancelled — ${SHOP_NAME}`,
    html: layout(
      `Order ${order.order_number} cancelled`,
      `
      ${greeting(order)}
      <p style="margin:0 0 16px;">
        ${
          o.byCustomer
            ? `Your order ${orderRef(order)} has been cancelled as you requested. Nothing will be delivered and nothing is owed.`
            : `We are sorry — your order ${orderRef(order)} has been cancelled. Nothing will be delivered and nothing is owed.`
        }
      </p>
      <p style="margin:0 0 16px;">
        ${
          o.byCustomer
            ? 'Changed your mind? You can place a new order any time.'
            : 'If this was not expected, please call us on +92 333-1632138 and we will explain what happened.'
        }
      </p>
      ${itemsTable(order.items, o.siteUrl)}
      ${totalsBlock(order)}`,
      o.siteUrl
    ),
  }
}

// --- Admin emails -----------------------------------------------------------

export function adminNewOrderEmail(order: Order, o: OrderEmailOptions): EmailContent {
  return {
    subject: `New order ${order.order_number} — ${formatPrice(order.total_amount)} — ${order.customer_name}`,
    html: layout(
      `New order ${order.order_number}`,
      `
      <p style="margin:0 0 16px;">A new order has been placed on the website.</p>
      ${heading('Customer')}
      ${addressBlock(order)}
      ${heading('Items')}
      ${itemsTable(order.items, o.siteUrl)}
      ${totalsBlock(order)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 0;">
        <tr>
          <td style="padding:12px;background:#f0fdf4;border-left:3px solid ${BRAND};font-size:14px;">
            Payment method: <strong>${escapeHtml(PAYMENT_METHOD_LABEL)}</strong>
          </td>
        </tr>
      </table>
      ${btn(`${o.siteUrl}/admin/orders`, 'Open in admin')}`,
      o.siteUrl
    ),
  }
}

export function adminOrderCancelledEmail(
  order: Order,
  o: OrderEmailOptions & { byCustomer?: boolean }
): EmailContent {
  return {
    subject: `Order ${order.order_number} cancelled${o.byCustomer ? ' by the customer' : ''} — ${formatPrice(order.total_amount)}`,
    html: layout(
      `Order ${order.order_number} cancelled`,
      `
      <p style="margin:0 0 16px;">
        Order ${orderRef(order)} (${formatPrice(order.total_amount)}) was cancelled
        ${o.byCustomer ? '<strong>by the customer</strong> from their tracking link' : 'in the admin panel'}.
        The stock has been returned to the shelf.
      </p>
      ${heading('Customer')}
      ${addressBlock(order)}
      ${btn(`${o.siteUrl}/admin/orders`, 'Open in admin')}`,
      o.siteUrl
    ),
  }
}

export function adminContactEmail(
  message: { name: string; email: string; phone?: string; subject?: string; message: string },
  o: { siteUrl: string }
): EmailContent {
  const rows: Array<[string, string | undefined]> = [
    ['Name', message.name],
    ['Email', message.email],
    ['Phone', message.phone],
    ['Subject', message.subject],
  ]

  return {
    subject: `Website enquiry from ${message.name}${message.subject ? ` — ${message.subject}` : ''}`,
    html: layout(
      'New enquiry from the contact page',
      `
      <p style="margin:0 0 16px;">Someone has sent a message through the website contact form.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
        ${rows
          .filter(([, value]) => value)
          .map(
            ([label, value]) =>
              `<tr><td style="padding:6px 8px;color:${MUTED};white-space:nowrap;vertical-align:top;">${label}</td><td style="padding:6px 8px;"><strong>${escapeHtml(value)}</strong></td></tr>`
          )
          .join('')}
      </table>
      ${heading('Message')}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:14px;background:#f9fafb;border-left:3px solid ${BRAND};font-size:14px;white-space:pre-wrap;">${escapeHtml(message.message)}</td>
        </tr>
      </table>
      <p style="margin:20px 0 0;color:${MUTED};font-size:13px;">Reply directly to this email to answer ${escapeHtml(message.name)}.</p>`,
      o.siteUrl
    ),
  }
}

export function adminLowStockEmail(
  products: Array<{ name: string; volume: string; stock_quantity: number }>,
  o: { siteUrl: string; threshold: number }
): EmailContent {
  const rows = products
    .map(
      (p) => `
        <tr>
          <td style="padding:10px 8px;border-bottom:1px solid ${LINE};">
            <strong>${escapeHtml(p.name)}</strong>
            ${p.volume ? `<br><span style="color:${MUTED};font-size:13px;">${escapeHtml(p.volume)}</span>` : ''}
          </td>
          <td style="padding:10px 8px;border-bottom:1px solid ${LINE};text-align:right;">
            <strong style="color:${p.stock_quantity === 0 ? '#b91c1c' : '#b45309'};">
              ${p.stock_quantity === 0 ? 'Out of stock' : `${p.stock_quantity} left`}
            </strong>
          </td>
        </tr>`
    )
    .join('')

  return {
    subject: `Low stock: ${products.length} product${products.length === 1 ? '' : 's'} need restocking`,
    html: layout(
      'Low stock warning',
      `
      <p style="margin:0 0 16px;">
        The following product${products.length === 1 ? ' has' : 's have'} fallen to
        ${o.threshold} unit${o.threshold === 1 ? '' : 's'} or fewer after a recent order.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">${rows}</table>
      ${btn(`${o.siteUrl}/admin/products`, 'Update stock')}`,
      o.siteUrl
    ),
  }
}

/** One-click check that the SMTP settings work. */
export function smtpTestEmail(o: { siteUrl: string }): EmailContent {
  return {
    subject: `${SHOP_NAME} — test email`,
    html: layout(
      'SMTP test',
      `
      <p style="margin:0 0 16px;">This is a test message from your website.</p>
      <p style="margin:0 0 16px;">
        If you are reading it, order confirmations and enquiry notifications will reach
        you correctly. Nothing further is needed.
      </p>
      <p style="margin:0;color:${MUTED};font-size:13px;">Sent ${escapeHtml(new Date().toLocaleString('en-PK'))}.</p>`,
      o.siteUrl
    ),
  }
}
