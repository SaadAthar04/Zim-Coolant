'use client'

// The email log.
//
// Every message the site tries to send is recorded, so the shop can answer
// "did the customer get their confirmation?" without server access — and can
// prove the site is working when a message lands in someone's spam folder.

import { useCallback, useEffect, useState } from 'react'
import { Mail, Loader2, RefreshCw, Send, AlertTriangle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { AdminPage, Badge, useAdminGuard } from '../admin-ui'

type LogEntry = {
  id: number
  to_address: string
  template: string
  subject?: string
  status: 'queued' | 'sent' | 'retried' | 'failed'
  attempts: number
  error_message?: string
  related_order_id?: string
  created_at: string
}

type Meta = {
  total: number
  sentCount: number
  failedCount: number
  recentFailedCount: number
  configured: boolean
}

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'sent', label: 'Sent' },
  { value: 'retried', label: 'Retried' },
  { value: 'failed', label: 'Failed' },
  { value: 'queued', label: 'Queued' },
]

/** Log keys are terse by design; these are what the shop actually reads. */
const TEMPLATE_LABEL: Record<string, string> = {
  order_received: 'Order received → customer',
  order_confirmed: 'Order confirmed → customer',
  order_dispatched: 'Order dispatched → customer',
  order_delivered: 'Order delivered → customer',
  order_cancelled: 'Order cancelled → customer',
  admin_new_order: 'New order → shop',
  admin_order_cancelled: 'Cancellation → shop',
  admin_contact: 'Contact enquiry → shop',
  admin_low_stock: 'Low stock → shop',
  smtp_test: 'Test email',
}

const statusStyle = (status: string) =>
  ({
    sent: 'bg-green-100 text-green-800',
    retried: 'bg-amber-100 text-amber-800',
    failed: 'bg-red-100 text-red-800',
    queued: 'bg-gray-100 text-gray-700',
  }[status] || 'bg-gray-100 text-gray-700')

const formatWhen = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('en-PK', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
}

export default function AdminEmails() {
  const ready = useAdminGuard()

  const [entries, setEntries] = useState<LogEntry[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [testTo, setTestTo] = useState('')
  const [sendingTest, setSendingTest] = useState(false)

  const load = useCallback(async () => {
    try {
      const query = filter ? `?status=${filter}` : ''
      const response = await fetch(`/api/email-log${query}`)
      if (!response.ok) return
      const payload = await response.json()
      setEntries(payload.data || [])
      setMeta(payload.meta || null)
    } catch {
      // A transient failure just leaves the previous list on screen.
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    if (!ready) return
    load()
    // Keeps the page live while the shop watches an order go out.
    const timer = setInterval(load, 30_000)
    return () => clearInterval(timer)
  }, [ready, load])

  const sendTest = async () => {
    setSendingTest(true)
    try {
      const response = await fetch('/api/email-log/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testTo.trim() ? { to: testTo.trim() } : {}),
      })
      const payload = await response.json()
      if (!response.ok) {
        toast.error(payload.error || 'The test email could not be sent.')
        return
      }
      toast.success(payload.message || 'Test email sent.')
      setTestTo('')
      load()
    } catch {
      toast.error('Could not reach the server.')
    } finally {
      setSendingTest(false)
    }
  }

  return (
    <AdminPage
      title="Email log"
      description="Every message the website has tried to send."
      icon={<Mail className="w-7 h-7 text-primary-600" />}
      ready={ready}
      actions={
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      }
    >
      {meta && !meta.configured && (
        <div className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold">Email is not configured</p>
            <p className="mt-1 text-amber-800">
              No messages can be sent until <code className="text-xs">SMTP_USER</code> and{' '}
              <code className="text-xs">SMTP_PASS</code> are set in the server environment.
              Orders are still recorded normally.
            </p>
          </div>
        </div>
      )}

      {meta && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Stat label="Total" value={meta.total} />
          <Stat label="Delivered" value={meta.sentCount} tone="text-green-700" />
          <Stat
            label="Failed (24h)"
            value={meta.recentFailedCount}
            tone={meta.recentFailedCount > 0 ? 'text-red-700' : undefined}
          />
          <Stat label="Failed (all time)" value={meta.failedCount} />
        </div>
      )}

      {/* Test send */}
      <div className="p-4 mb-6 rounded-xl border border-gray-200 bg-white">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Send a test email</h2>
        <p className="text-sm text-gray-600 mb-3">
          Checks the mail server settings. Leave the box empty to send to the shop&apos;s own
          notification address.
        </p>
        <div className="flex flex-wrap gap-3">
          <input
            type="email"
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
            placeholder="someone@example.com (optional)"
            className="flex-1 min-w-[220px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          />
          <button
            onClick={sendTest}
            disabled={sendingTest}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60 rounded-lg"
          >
            {sendingTest ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {sendingTest ? 'Sending...' : 'Send test'}
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              filter === f.value
                ? 'bg-primary-600 border-primary-600 text-white'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-3 py-16 justify-center text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading...
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-300 rounded-xl">
          <Mail className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">
            {filter ? `No ${filter} emails.` : 'No emails have been sent yet.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <Th>When</Th>
                <Th>Email</Th>
                <Th>To</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((entry) => (
                <tr key={entry.id} className="align-top">
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                    {formatWhen(entry.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900">
                      {TEMPLATE_LABEL[entry.template] || entry.template}
                    </p>
                    {entry.subject && (
                      <p className="text-xs text-gray-500 mt-0.5">{entry.subject}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700 break-all">{entry.to_address}</td>
                  <td className="px-4 py-3">
                    <Badge
                      text={entry.status === 'retried' ? 'Sent (retried)' : entry.status}
                      className={statusStyle(entry.status)}
                    />
                    {entry.error_message && (
                      <p className="text-xs text-red-600 mt-1 max-w-xs">{entry.error_message}</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPage>
  )
}

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
    {children}
  </th>
)

const Stat = ({ label, value, tone }: { label: string; value: number; tone?: string }) => (
  <div className="p-4 rounded-xl border border-gray-200 bg-white">
    <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
    <p className={`text-2xl font-bold mt-1 ${tone || 'text-gray-900'}`}>{value}</p>
  </div>
)
