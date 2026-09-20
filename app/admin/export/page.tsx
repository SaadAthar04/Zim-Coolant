'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Download, FileSpreadsheet } from 'lucide-react'
import toast from 'react-hot-toast'
import { Order, ordersApi } from '@/lib/api-client'
import { formatPrice } from '@/lib/store-config'
import { AdminPage, downloadCsv, ordersToCsv, useAdminGuard } from '../admin-ui'

type Range = '7d' | '30d' | '90d' | 'all'
type StatusFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'
type PaymentFilter = 'all' | 'pending' | 'paid'

const RANGE_DAYS: Record<Range, number | null> = { '7d': 7, '30d': 30, '90d': 90, all: null }

export default function AdminExport() {
  const authenticated = useAdminGuard()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<Range>('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [payment, setPayment] = useState<PaymentFilter>('all')

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await ordersApi.getAll()
    if (error) toast.error('Could not load orders')
    setOrders(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (authenticated) load()
  }, [authenticated, load])

  const selection = useMemo(() => {
    const days = RANGE_DAYS[range]
    const cutoff = days === null ? null : Date.now() - days * 24 * 60 * 60 * 1000
    return orders.filter((o) => {
      if (cutoff !== null && new Date(o.created_at).getTime() < cutoff) return false
      if (status !== 'all' && o.status !== status) return false
      if (payment !== 'all' && o.payment_status !== payment) return false
      return true
    })
  }, [orders, range, status, payment])

  const total = selection.reduce((sum, o) => sum + o.total_amount, 0)

  const download = () => {
    if (selection.length === 0) return toast.error('Nothing matches these filters')
    const stamp = new Date().toISOString().slice(0, 10)
    downloadCsv(ordersToCsv(selection), `zim-orders-${range}-${stamp}.csv`)
    toast.success(`Exported ${selection.length} orders`)
  }

  const selectClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white'

  return (
    <AdminPage
      title="Export Orders"
      description="Download orders as a spreadsheet, with the full delivery record on every row."
      icon={<FileSpreadsheet className="w-7 h-7 text-primary-600" />}
      ready={authenticated}
    >
      {loading ? (
        <p className="text-gray-500">Loading orders...</p>
      ) : (
        <div className="max-w-2xl bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date range</label>
              <select value={range} onChange={(e) => setRange(e.target.value as Range)} className={selectClass}>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} className={selectClass}>
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
              <select value={payment} onChange={(e) => setPayment(e.target.value as PaymentFilter)} className={selectClass}>
                <option value="all">All payments</option>
                <option value="pending">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-sm text-gray-600">This will export</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {selection.length} order{selection.length === 1 ? '' : 's'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Worth {formatPrice(total)} in total
            </p>
          </div>

          <button
            onClick={download}
            disabled={selection.length === 0}
            className="inline-flex items-center gap-2 btn-primary px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>

          <p className="text-xs text-gray-500">
            Each row carries the order reference, date, customer name, phone, email, full
            address, city, postal code, notes, the items with their size and colour, and the
            totals. Opens directly in Excel or Google Sheets.
          </p>
        </div>
      )}
    </AdminPage>
  )
}
