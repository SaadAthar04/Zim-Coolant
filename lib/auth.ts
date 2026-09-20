// Admin session helpers for the browser.
//
// There is deliberately no credential check here. Signing in posts to
// /api/admin/session, which verifies against server-only env vars and sets a
// signed httpOnly cookie. The browser never sees the password, and it cannot
// fake being signed in: the admin APIs check the cookie on every request.

export async function signIn(
  username: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await fetch('/api/admin/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const result = await response.json()

    if (!response.ok) {
      return { ok: false, error: result.error || 'Sign in failed' }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' }
  }
}

export async function signOut(): Promise<void> {
  try {
    await fetch('/api/admin/session', { method: 'DELETE' })
  } catch {
    // Signing out locally is enough for the UI; the cookie expires regardless.
  }
}

/** Asks the server whether the current cookie is a valid admin session. */
export async function checkAdminSession(): Promise<boolean> {
  try {
    const response = await fetch('/api/admin/session', { cache: 'no-store' })
    if (!response.ok) return false
    const result = await response.json()
    return Boolean(result?.data?.authenticated)
  } catch {
    return false
  }
}
