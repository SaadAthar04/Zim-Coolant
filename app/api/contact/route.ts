import { NextRequest, NextResponse } from 'next/server'
import { contactMessageOperations } from '@/lib/database'
import { sendEmail, CONTACT_NOTIFY, SITE_URL } from '@/lib/email/mailer'
import { adminContactEmail } from '@/lib/email/templates'

const clean = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

const looksLikeEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

// POST /api/contact - a message from the contact page.
//
// The message is written to the database first and emailed second, so an
// enquiry is never lost when the mail server is unreachable. Before this route
// existed the form showed a success toast and discarded the message entirely.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const message = {
      name: clean(body.name, 120),
      email: clean(body.email, 200).toLowerCase(),
      phone: clean(body.phone, 40),
      subject: clean(body.subject, 200),
      message: clean(body.message, 5000),
    }

    const fieldErrors: Record<string, string> = {}
    if (message.name.length < 2) fieldErrors.name = 'Please enter your name.'
    if (!looksLikeEmail(message.email)) fieldErrors.email = 'Please enter a valid email address.'
    if (message.message.length < 10)
      fieldErrors.message = 'Please tell us a little more — at least 10 characters.'

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        { error: 'Please check the highlighted fields.', fieldErrors },
        { status: 400 }
      )
    }

    const stored = contactMessageOperations.create(message)

    const { subject, html } = adminContactEmail(message, { siteUrl: SITE_URL() })

    // Awaited, unlike the order emails: this route has nothing else to report,
    // and the shop needs to know whether the enquiry actually reached them.
    const delivered = await sendEmail({
      to: CONTACT_NOTIFY(),
      subject,
      html,
      template: 'admin_contact',
      // Lets the shop reply straight to the person who wrote in.
      replyTo: message.email,
    })

    if (!delivered) {
      console.warn(
        `[contact] Enquiry ${stored.id} from ${message.email} was saved but not emailed.`
      )
    }

    // The message is safely stored either way, so the sender is told it arrived.
    return NextResponse.json({ message: 'Thank you — your message has been received.' })
  } catch (error) {
    console.error('Error handling the contact form:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please call us on +92 333-1632138.' },
      { status: 500 }
    )
  }
}
