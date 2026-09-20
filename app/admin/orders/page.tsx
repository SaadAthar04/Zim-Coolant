'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { ShoppingCart, Search, Eye, CheckCircle, Banknote, Plus, Download, Trash2, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Order, ordersApi } from '@/lib/api-client'
import { formatPrice } from '@/lib/store-config'
import {
  AdminPage,
  Badge,
  OrderDetailModal,
  downloadCsv,
  ordersToCsv,
  paymentColor,
  statusColor,
  titleCase,
  useAdminGuard,
} from '../admin-ui'
import NewOrderModal from '../NewOrderModal'

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'
type PaymentFilter = 'all' | 'pending' | 'paid' | 'failed'

export default function AdminOrders() {
  const authenticated = useAdminGuard()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [payment, setPayment] = useState<PaymentFilter>('all')
  const [selected, setSelected] = useState<Order | null>(null)
  const [showNewOrder, setShowNewOrder] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Order | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return orders.filter((o) => {
      if (status !== 'all' && o.status !== status) return false
      if (payment !== 'all' && o.payment_status !== payment) return false
      if (!term) return true
      // Match the things a shop actually searches by.
      return [
        o.order_number,
        o.customer_name,
        o.customer_phone,
        o.customer_email,
        o.shipping_city,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    })
  }, [orders, search, status, payment])

  const apply = (id: string, patch: Partial<Order>) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)))

  const setOrderStatus = async (id: string, next: string) => {
    const { error } = await ordersApi.updateStatus(id, next)
    if (error) return toast.error('Could not update the order')
    apply(id, { status: next })
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status: next } : prev))
    toast.success(`Order ${next}`)
  }

  const setPaymentStatus = async (id: string, next: string) => {
    const { error } = await ordersApi.updatePaymentStatus(id, next)
    if (error) return toast.error('Could not update the payment')
    apply(id, { payment_status: next })
    setSelected((prev) => (prev && prev.id === id ? { ...prev, payment_status: next } : prev))
    toast.success(next === 'paid' ? 'Payment recorded' : `Payment ${next}`)
  }

  const confirmDelete = async () => {
    if (!pendingDelete || deleting) return
    setDeleting(true)
    const { error } = await ordersApi.delete(pendingDelete.id)
    setDeleting(false)

    if (error) {
      toast.error('Could not delete the order')
      return
    }

    const reference = pendingDelete.order_number || pendingDelete.id.slice(0, 8)
    setOrders((prev) => prev.filter((o) => o.id !== pendingDelete.id))
    setPendingDelete(null)
    toast.success(`Order ${reference} deleted`)
  }

  const exportFiltered = () => {
    if (filtered.length === 0) return toast.error('Nothing to export')
    downloadCsv(ordersToCsv(filtered), `zim-orders-${new Date().toISOString().slice(0, 10)}.csv`)
    toast.success(`Exported ${filtered.length} orders`)
  }

  const selectClass = 'px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white'

  return (
    <AdminPage
      title="Orders"
      description="Every order placed on the site, newest first."
      icon={<ShoppingCart className="w-7 h-7 text-primary-600" />}
      ready={authenticated}
      actions={
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportFiltered}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowNewOrder(true)}
            className="inline-flex items-center gap-2 btn-primary px-4 py-2"
          >
            <Plus className="w-4 h-4" />
            New Order
          </button>
        </div>
      }
    >
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference, name, phone, email or city"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} className={selectClass}>
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={payment} onChange={(e) => setPayment(e.target.value as PaymentFilter)} className={selectClass}>
            <option value="all">All payments</option>
            <option value="pending">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {loading ? (
          <p className="p-6 text-gray-500">Loading orders...</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-gray-500">
            {orders.length === 0 ? 'No orders yet.' : 'No orders match these filters.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Reference</th>
                  <th className="text-left px-4 py-3 font-medium">Customer</th>
                  <th className="text-left px-4 py-3 font-medium">City</th>
                  <th className="text-center px-4 py-3 font-medium">Items</th>
                  <th className="text-right px-4 py-3 font-medium">Total</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{order.order_number || order.id.slice(0, 8)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{order.customer_name}</p>
                      <p className="text-xs text-gray-500">{order.customer_phone}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{order.shipping_city || '—'}</td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {order.items.reduce((n, i) => n + i.quantity, 0)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{formatPrice(order.total_amount)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 items-start">
                        <Badge text={titleCase(order.status)} className={statusColor(order.status)} />
                        <Badge
                          text={order.payment_status === 'pending' ? 'Unpaid' : titleCase(order.payment_status)}
                          className={paymentColor(order.payment_status)}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setSelected(order)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded"
                          title="View full order details"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => setOrderStatus(order.id, 'confirmed')}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded"
                            title="Confirm this order for delivery"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Confirm
                          </button>
                        )}
                        {order.payment_status === 'pending' && (
                          <button
                            onClick={() => setPaymentStatus(order.id, 'paid')}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded"
                            title="Record that cash has been received"
                          >
                            <Banknote className="w-4 h-4" />
                            Paid
                          </button>
                        )}
                        <button
                          onClick={() => setPendingDelete(order)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded"
                          title="Delete this order permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="px-4 py-3 text-xs text-gray-500 bg-gray-50 border-t border-gray-100">
          Showing {filtered.length} of {orders.length} orders.
        </p>
      </div>

      <OrderDetailModal
        order={selected}
        onClose={() => setSelected(null)}
        onConfirm={(id) => setOrderStatus(id, 'confirmed')}
        onMarkPaid={(id) => setPaymentStatus(id, 'paid')}
        onComplete={(id) => setOrderStatus(id, 'completed')}
      />

      {pendingDelete && (
        <div className="fixed inset-0 z-[110] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Delete this order?</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {pendingDelete.order_number || pendingDelete.id.slice(0, 8)} ·{' '}
                  {pendingDelete.customer_name} · {formatPrice(pendingDelete.total_amount)}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-2">
              The order record is removed permanently and cannot be recovered.
            </p>
            <p className="text-sm text-gray-600 mb-6">
              {pendingDelete.status === 'completed'
                ? 'This order is marked completed, so its stock is treated as already delivered and will not be added back.'
                : 'Its items go back into stock, since the order will not be fulfilled.'}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPendingDelete(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Keep order
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Deleting...' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      <NewOrderModal open={showNewOrder} onClose={() => setShowNewOrder(false)} onCreated={load} />
    </AdminPage>
  )
}
