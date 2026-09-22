import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import {
  sendEmailWithReason,
  verifyTransport,
  ADMIN_NOTIFY,
  SITE_URL,
} from '@/lib/email/mailer'
import { smtpTestEmail } from '@/lib/email/templates'

// POST /api/email-log/test - sends a test message so the shop can confirm the
// SMTP settings work without placing a real order.
export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))

    // Defaults to the monitored inbox rather than the admin's login name, which
    // is often not a real address.
    const to = typeof body.to === 'string' && body.to.trim() ? body.to.trim() : ADMIN_NOTIFY()

    if (!to) {
      return NextResponse.json(
        { error: 'No recipient. Set ADMIN_EMAIL in .env or type an address.' },
        { status: 400 }
      )
    }

    // Checked first so a wrong host or password is reported as exactly that,
    // rather than as a generic send failure.
    const check = await verifyTransport()
    if (!check.ok) {
      return NextResponse.json(
        { error: `Could not connect to the mail server: ${check.error}` },
        { status: 400 }
      )
    }

    const { subject, html } = smtpTestEmail({ siteUrl: SITE_URL() })
    const sent = await sendEmailWithReason({ to, subject, html, template: 'smtp_test' })

    if (sent.ok) {
      return NextResponse.json({ message: `Test email sent to ${to}.` })
    }

    // The login worked (verifyTransport passed) but the message was refused.
    // By far the most common cause is sending as an alias the mailbox is not
    // allowed to use, so name that rather than leaving a bare SMTP string.
    const aliasProblem = /5\.7\.\d|sender|not allowed|not permitted|rejected/i.test(
      sent.error || ''
    )

    return NextResponse.json(
      {
        error: aliasProblem
          ? `The mail server refused the sender address. Check that EMAIL_FROM is a mailbox ` +
            `or alias this account may send as, or remove EMAIL_FROM to send as the login ` +
            `address itself. The server said: ${sent.error}`
          : `The mail server rejected the message: ${sent.error}`,
      },
      { status: 502 }
    )
  } catch (error) {
    console.error('Error sending the test email:', error)
    return NextResponse.json({ error: 'Failed to send the test email' }, { status: 500 })
  }
}
