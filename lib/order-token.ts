// Signed links that let a customer open their own order from an email.
//
// Zim has no customer accounts, so the alternative would be linking by order
// number — which is sequential and therefore guessable, exposing every
// customer's name, phone and address to anyone who counts upwards. Instead the
// link carries an HMAC of the order id that only the server can produce.
//
// Stateless by design: no tokens table, nothing to clean up, and a token stays
// valid until it expires.
//
// Configure in .env:
//   ORDER_LINK_SECRET=<long random string>

import { createHmac, timingSafeEqual, randomBytes } from 'crypto'

/** How long a link in an order email keeps working. */
const TOKEN_TTL_MS = 90 * 24 * 60 * 60 * 1000

let fallbackSecret: string | null = null

function secret() {
  const configured = process.env.ORDER_LINK_SECRET
  if (configured) return configured

  // Reuse the admin secret rather than inventing an ephemeral one, so links in
  // already-delivered emails keep working across a restart.
  const adminSecret = process.env.ADMIN_SESSION_SECRET
  if (adminSecret) return `order-link:${adminSecret}`

  if (!fallbackSecret) {
    fallbackSecret = randomBytes(32).toString('hex')
    console.warn(
      '[order-token] Neither ORDER_LINK_SECRET nor ADMIN_SESSION_SECRET is set. ' +
        'Tracking links in order emails will stop working when the server restarts.'
    )
  }
  return fallbackSecret
}

const b64url = (value: string | Buffer) =>
  Buffer.from(value as any)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

const fromB64url = (value: string) =>
  Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')

const sign = (payload: string) => b64url(createHmac('sha256', secret()).update(payload).digest())

/** `<orderId>.<expiry>.<signature>`, all base64url. */
export function createOrderToken(orderId: string, ttlMs = TOKEN_TTL_MS) {
  const expiry = String(Date.now() + ttlMs)
  const payload = `${b64url(orderId)}.${b64url(expiry)}`
  return `${payload}.${sign(payload)}`
}

/** Returns the order id, or null for anything malformed, forged, or expired. */
export function readOrderToken(token: string): string | null {
  if (!token || typeof token !== 'string') return null

  const parts = token.split('.')
  if (parts.length !== 3) return null

  const [encodedId, encodedExpiry, signature] = parts
  const expected = sign(`${encodedId}.${encodedExpiry}`)

  // Compare in constant time, and only when the lengths already match —
  // timingSafeEqual throws on a length mismatch.
  const given = Buffer.from(signature)
  const want = Buffer.from(expected)
  if (given.length !== want.length || !timingSafeEqual(given, want)) return null

  try {
    const expiry = Number(fromB64url(encodedExpiry))
    if (!Number.isFinite(expiry) || Date.now() > expiry) return null
    return fromB64url(encodedId) || null
  } catch {
    return null
  }
}

/** The absolute URL that goes in the email. */
export const orderTrackingUrl = (orderId: string, siteUrl: string) =>
  `${siteUrl.replace(/\/$/, '')}/orders/${createOrderToken(orderId)}`
