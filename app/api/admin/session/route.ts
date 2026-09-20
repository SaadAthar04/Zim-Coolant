import { NextRequest, NextResponse } from 'next/server'
import {
  ADMIN_COOKIE,
  adminCredentialsConfigured,
  createSessionToken,
  requireAdmin,
  sessionCookieOptions,
  verifyCredentials,
} from '@/lib/admin-auth'

/**
 * Simple in-memory brute-force brake. Resets when the server restarts, which
 * is fine: it only needs to make guessing impractical, not be a durable store.
 */
const attempts = new Map<string, { count: number; firstAt: number }>()
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 10

function clientKey(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

function tooManyAttempts(key: string) {
  const record = attempts.get(key)
  if (!record) return false
  if (Date.now() - record.firstAt > WINDOW_MS) {
    attempts.delete(key)
    return false
  }
  return record.count >= MAX_ATTEMPTS
}

function recordFailure(key: string) {
  const record = attempts.get(key)
  if (!record || Date.now() - record.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: Date.now() })
    return
  }
  record.count += 1
}

// GET /api/admin/session - is the caller signed in?
export async function GET(request: NextRequest) {
  return NextResponse.json({
    data: {
      authenticated: requireAdmin(request),
      configured: adminCredentialsConfigured(),
    },
  })
}

// POST /api/admin/session - sign in
export async function POST(request: NextRequest) {
  const key = clientKey(request)

  if (tooManyAttempts(key)) {
    return NextResponse.json(
      { error: 'Too many sign-in attempts. Try again later.' },
      { status: 429 }
    )
  }

  let body: { username?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (!adminCredentialsConfigured()) {
    return NextResponse.json(
      { error: 'Admin access is not configured on the server.' },
      { status: 503 }
    )
  }

  if (!verifyCredentials(body.username || '', body.password || '')) {
    recordFailure(key)
    // Deliberately vague: never reveal which field was wrong.
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
  }

  attempts.delete(key)

  const response = NextResponse.json({ data: { authenticated: true } })
  response.cookies.set(ADMIN_COOKIE, createSessionToken(), sessionCookieOptions)
  return response
}

// DELETE /api/admin/session - sign out
export async function DELETE() {
  const response = NextResponse.json({ data: { authenticated: false } })
  response.cookies.set(ADMIN_COOKIE, '', { ...sessionCookieOptions, maxAge: 0 })
  return response
}
