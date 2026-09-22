import { NextRequest, NextResponse } from 'next/server'
import { emailLogOperations } from '@/lib/database'
import { requireAdmin } from '@/lib/admin-auth'
import { isEmailConfigured } from '@/lib/email/mailer'

// GET /api/email-log?status=failed - admin only. The log records customer
// addresses, so it must never be public.
export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined

    return NextResponse.json({
      data: emailLogOperations.list(status),
      meta: { ...emailLogOperations.stats(), configured: isEmailConfigured() },
    })
  } catch (error) {
    console.error('Error reading the email log:', error)
    return NextResponse.json({ error: 'Failed to read the email log' }, { status: 500 })
  }
}
