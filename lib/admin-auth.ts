// Admin authentication.
//
// The previous version compared credentials in the browser against
// NEXT_PUBLIC_ADMIN_* variables, which Next.js inlines into the public
// JavaScript bundle — the password was readable by anyone via view-source, and
// the API routes were not protected at all.
//
// Now: credentials live in server-only env vars, the check happens on the
// server, and the session is a signed httpOnly cookie that the browser cannot
// read or forge. Every admin API route calls requireAdmin().
//
// Configure in .env (server-side only, no NEXT_PUBLIC_ prefix):
//   ADMIN_USERNAME=...
//   ADMIN_PASSWORD=...
//   ADMIN_SESSION_SECRET=<long random string>

import { createHmac, timingSafeEqual, randomBytes } from 'crypto'
import type { NextRequest } from 'next/server'

export const ADMIN_COOKIE = 'zim_admin_session'

/** How long a signed-in admin stays signed in. */
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000

/** Generated per process when unset, which signs everyone out on restart. */
let fallbackSecret: string | null = null

function sessionSecret() {
  const configured = process.env.ADMIN_SESSION_SECRET
  if (configured) return configured

  // Derive from the password so sessions survive restarts when at least the
  // password is configured; otherwise fall back to an ephemeral secret.
  const password = process.env.ADMIN_PASSWORD
  if (password) return `derived:${password}`

  if (!fallbackSecret) {
    fallbackSecret = randomBytes(32).toString('hex')
    console.warn(
      '[admin-auth] Neither ADMIN_SESSION_SECRET nor ADMIN_PASSWORD is set. ' +
        'Using a temporary secret; admin sessions will end when the server restarts.'
    )
  }
  return fallbackSecret
}

/** Constant-time string comparison that tolerates differing lengths. */
function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) {
    // Still compare, so the time taken does not reveal the length.
    timingSafeEqual(bufA, bufA)
    return false
  }
  return timingSafeEqual(bufA, bufB)
}

export function adminCredentialsConfigured() {
  return Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD)
}

export function verifyCredentials(username: string, password: string) {
  const expectedUser = process.env.ADMIN_USERNAME
  const expectedPass = process.env.ADMIN_PASSWORD

  if (!expectedUser || !expectedPass) {
    console.error(
      '[admin-auth] ADMIN_USERNAME / ADMIN_PASSWORD are not configured; refusing all logins.'
    )
    return false
  }

  // Evaluate both so a wrong username costs the same as a wrong password.
  const userOk = safeEqual(username ?? '', expectedUser)
  const passOk = safeEqual(password ?? '', expectedPass)
  return userOk && passOk
}

const sign = (payload: string) =>
  createHmac('sha256', sessionSecret()).update(payload).digest('hex')

export function createSessionToken() {
  const expiresAt = Date.now() + SESSION_DURATION_MS
  return `${expiresAt}.${sign(String(expiresAt))}`
}

export function verifySessionToken(token: string | undefined | null) {
  if (!token) return false

  const separator = token.lastIndexOf('.')
  if (separator < 1) return false

  const expiresAt = token.slice(0, separator)
  const signature = token.slice(separator + 1)

  if (!safeEqual(signature, sign(expiresAt))) return false

  const expiry = Number(expiresAt)
  return Number.isFinite(expiry) && expiry > Date.now()
}

/** True when the request carries a valid admin session cookie. */
export function requireAdmin(request: NextRequest) {
  return verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value)
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_DURATION_MS / 1000,
}
