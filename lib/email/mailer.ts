import 'server-only'

// The only place in the codebase that touches SMTP.
//
// Two rules hold this together:
//
//   1. Email never breaks a request. sendEmail() returns a boolean and does not
//      throw. An order is taken, a message is recorded, a status is updated —
//      whether or not the mail server is reachable.
//   2. Every attempt is logged to email_log, so the shop can see what was sent
//      and what failed from the admin panel rather than needing server logs.
//
// Swapping Hostinger for SES, Resend or anything else means rewriting
// getTransport() and nothing else.
//
// SMTP_USER is the real mailbox, because that is what the password
// authenticates. orders@ and contact@ are aliases onto the same inbox, so they
// appear only as the From and To addresses — never as the login.
//
// Configure in .env (server-side only — never NEXT_PUBLIC_):
//   SMTP_HOST=smtp.hostinger.com
//   SMTP_PORT=465
//   SMTP_SECURE=true          # true = implicit TLS on 465, false = STARTTLS on 587
//   SMTP_USER=info@zimchemicals.com
//   SMTP_PASS=<mailbox password>
//   EMAIL_FROM="Zim Chemicals <orders@zimchemicals.com>"
//   EMAIL_REPLY_TO=info@zimchemicals.com
//   ADMIN_EMAIL=orders@zimchemicals.com
//   CONTACT_EMAIL=contact@zimchemicals.com

import type { Transporter } from 'nodemailer'
import { emailLogOperations } from '@/lib/database'

/** Attempts per message before it is logged as failed. */
const MAX_ATTEMPTS = 2

const env = (name: string) => (process.env[name] || '').trim()

const smtpHost = () => env('SMTP_HOST')
const smtpUser = () => env('SMTP_USER')

/**
 * Google displays an App Password in four groups of four, and those spaces are
 * formatting rather than part of the secret. Stripping them means a password
 * pasted straight from Google works. A real SMTP host is left untouched, since
 * a Hostinger mailbox password may legitimately contain a space.
 */
const smtpPass = () => {
  const raw = env('SMTP_PASS')
  return smtpHost() ? raw : raw.replace(/\s+/g, '')
}

/** Where order notifications and operational alerts land. */
export const ADMIN_NOTIFY = () =>
  env('ADMIN_EMAIL') || env('ORDER_NOTIFICATION_EMAIL') || smtpUser()

/** Where contact-form enquiries land. The client keeps these separate. */
export const CONTACT_NOTIFY = () => env('CONTACT_EMAIL') || ADMIN_NOTIFY()

/** Used for absolute links and images inside emails. */
export const SITE_URL = () =>
  (env('NEXT_PUBLIC_SITE_URL') || 'https://www.zimchemicals.com').replace(/\/$/, '')

export const isEmailConfigured = () => Boolean(smtpUser() && smtpPass())

const fromAddress = () => env('EMAIL_FROM') || `"Zim Chemicals" <${smtpUser()}>`

const replyToAddress = () => env('EMAIL_REPLY_TO') || undefined

// Lazy singleton: nodemailer pools the connection, so building one transport
// per send would open a new TLS handshake every time.
let transporter: Transporter | null = null

async function getTransport() {
  if (!isEmailConfigured()) return null
  if (transporter) return transporter

  // Imported lazily so a missing dependency cannot break an API route.
  const nodemailer = await import('nodemailer')

  const host = smtpHost()
  if (host) {
    const port = Number(env('SMTP_PORT') || 587)
    transporter = nodemailer.createTransport({
      host,
      port,
      // Implicit TLS on 465; STARTTLS on 587. Defaulting from the port means a
      // missing SMTP_SECURE still produces a working, encrypted connection.
      secure: env('SMTP_SECURE') ? env('SMTP_SECURE') === 'true' : port === 465,
      auth: { user: smtpUser(), pass: smtpPass() },
    })
  } else {
    // No host configured: assume Gmail, which is what this store used before
    // the move to Hostinger.
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: smtpUser(), pass: smtpPass() },
    })
  }

  return transporter
}

/** Forgets the cached transport, so changed credentials take effect. */
export const resetTransport = () => {
  transporter = null
}

export type SendEmailArgs = {
  to: string
  subject: string
  html: string
  /** Identifies the message in the log, e.g. 'order_received'. */
  template: string
  relatedOrderId?: string | null
  replyTo?: string
}

/**
 * Sends one message and records the outcome. Never throws.
 *
 * Returns true only when the provider accepted the message — which is not the
 * same as it reaching the inbox.
 */
export async function sendEmail(args: SendEmailArgs): Promise<boolean> {
  return (await sendEmailWithReason(args)).ok
}

/**
 * As sendEmail, but also hands back why it failed.
 *
 * Used by the admin test-send, which is the one place a human is waiting to be
 * told what is wrong — "sender address not allowed" needs to reach them, not a
 * generic failure.
 */
export async function sendEmailWithReason({
  to,
  subject,
  html,
  template,
  relatedOrderId = null,
  replyTo,
}: SendEmailArgs): Promise<{ ok: boolean; error?: string }> {
  if (!to) {
    console.warn(`[email] No recipient for ${template}; nothing sent.`)
    return { ok: false, error: 'No recipient address.' }
  }

  let logId: number | null = null
  try {
    logId = emailLogOperations.queue({
      to_address: to,
      template,
      subject,
      related_order_id: relatedOrderId,
    })
  } catch (err) {
    // A logging failure must not stop the mail going out.
    console.error('[email] Could not write the email log:', err)
  }

  const settle = (
    status: 'sent' | 'retried' | 'failed',
    attempts: number,
    errorMessage?: string
  ) => {
    if (logId === null) return
    try {
      emailLogOperations.settle(logId, status, attempts, errorMessage)
    } catch (err) {
      console.error('[email] Could not update the email log:', err)
    }
  }

  let transport: Transporter | null = null
  try {
    transport = await getTransport()
  } catch (err) {
    console.error('[email] Could not create a mail transport:', err)
  }

  if (!transport) {
    console.warn(
      `[email] SMTP is not configured, so ${template} was not sent to ${to}. ` +
        'Set SMTP_USER and SMTP_PASS to enable email.'
    )
    settle('failed', 0, 'SMTP not configured')
    return { ok: false, error: 'SMTP is not configured on the server.' }
  }

  let lastError = ''

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await transport.sendMail({
        from: fromAddress(),
        to,
        subject,
        html,
        replyTo: replyTo || replyToAddress(),
      })
      settle(attempt > 1 ? 'retried' : 'sent', attempt)
      return { ok: true }
    } catch (err) {
      // Only the message, never the raw provider response: SMTP rejections can
      // echo back credentials and recipient lists.
      lastError = err instanceof Error ? err.message : 'Unknown error'
      console.error(`[email] ${template} to ${to} failed (attempt ${attempt}):`, lastError)

      // A rejected login or a bad address will not fix itself on a retry.
      if (/invalid login|authentication|5\.7\.\d|no recipients/i.test(lastError)) break
    }
  }

  settle('failed', MAX_ATTEMPTS, lastError)
  return { ok: false, error: lastError }
}

/** Verifies the SMTP settings without sending anything. */
export async function verifyTransport(): Promise<{ ok: boolean; error?: string }> {
  if (!isEmailConfigured()) return { ok: false, error: 'SMTP is not configured.' }
  try {
    const transport = await getTransport()
    if (!transport) return { ok: false, error: 'SMTP is not configured.' }
    await transport.verify()
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
