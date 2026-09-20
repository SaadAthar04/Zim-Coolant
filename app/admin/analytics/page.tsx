'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { TrendingUp, ShoppingCart, Banknote, Package, Clock } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import toast from 'react-hot-toast'
import { Order, Product, ordersApi, productsApi } from '@/lib/api-client'
import { formatPrice } from '@/lib/store-config'
import { AdminPage, useAdminGuard } from '../admin-ui'

type Period = '7d' | '30d' | '90d' | 'all'

const PERIOD_DAYS: Record<Period, number | null> = { '7d': 7, '30d': 30, '90d': 90, all: null }

export default function AdminAnalytics() {
  const authenticated = useAdminGuard()
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [period, setPeriod] = useState<Period>('30d')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const [o, p] = await Promise.all([ordersApi.getAll(), productsApi.getAll()])
    if (o.error) toast.error('Could not load orders')
    setOrders(o.data || [])
    setProducts(p.data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (authenticated) load()
  }, [authenticated, load])

  const inPeriod = useMemo(() => {
    const days = PERIOD_DAYS[period]
    if (days === null) return orders
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
    return orders.filter((o) => new Date(o.created_at).getTime() >= cutoff)
  }, [orders, period])

  // Cancelled orders are excluded from money; everything else is counted, so
  // the figures match what the shop has actually taken on, not only what has
  // already been paid for.
  const live = inPeriod.filter((o) => o.status !== 'cancelled')
  const revenue = live.reduce((sum, o) => sum + o.total_amount, 0)
  const collected = live
    .filter((o) => o.payment_status === 'paid')
    .reduce((sum, o) => sum + o.total_amount, 0)
  const outstanding = revenue - collected
  const awaiting = inPeriod.filter((o) => o.status === 'pending').length

  const chartData = useMemo(() => {
    const days = PERIOD_DAYS[period] ?? 30
    const buckets: Array<{ label: string; orders: number; value: number }> = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      buckets.push({ label: `${d.getDate()}/${d.getMonth() + 1}`, orders: 0, value: 0 })
    }
    const start = Date.now() - (days - 1) * 24 * 60 * 60 * 1000
    for (const o of live) {
      const t = new Date(o.created_at).getTime()
      const index = Math.floor((t - start) / (24 * 60 * 60 * 1000))
      if (index >= 0 && index < buckets.length) {
        buckets[index].orders += 1
        buckets[index].value += o.total_amount
      }
    }
    return buckets
  }, [live, period])

  /** Units sold per product, from the order line items. */
  const bestSellers = useMemo(() => {
    const tally = new Map<string, { name: string; units: number; value: number }>()
    for (const o of live) {
      for (const item of o.items) {
        const key = item.product_name
        const row = tally.get(key) || { name: key, units: 0, value: 0 }
        row.units += item.quantity
        row.value += item.line_total ?? item.price * item.quantity
        tally.set(key, row)
      }
    }
    return [...tally.values()].sort((a, b) => b.units - a.units)
  }, [live])

  const lowStock = products.filter((p) => p.stock_quantity <= 10)

  const tiles = [
    { label: 'Order value', value: formatPrice(revenue), hint: `${live.length} orders`, icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Cash collected', value: formatPrice(collected), hint: 'Marked paid', icon: Banknote, color: 'bg-blue-500' },
    { label: 'Outstanding', value: formatPrice(outstanding), hint: 'Not yet paid', icon: ShoppingCart, color: 'bg-amber-500' },
    { label: 'Awaiting action', value: String(awaiting), hint: 'Still pending', icon: Clock, color: 'bg-purple-500' },
  ]

  return (
    <AdminPage
      title="Analytics"
      description="Orders and revenue over time, best sellers and stock to watch."
      icon={<TrendingUp className="w-7 h-7 text-primary-600" />}
      ready={authenticated}
      actions={
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      }
    >
      {loading ? (
        <p className="text-gray-500">Loading analytics...</p>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiles.map((t) => (
              <div key={t.label} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{t.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{t.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{t.hint}</p>
                  </div>
                  <div className={`w-11 h-11 ${t.color} rounded-xl flex items-center justify-center`}>
                    <t.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders per day</h2>
            {live.length === 0 ? (
              <p className="text-gray-500 py-12 text-center">No orders in this period yet.</p>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value: any, name: any) =>
                        name === 'value' ? [formatPrice(Number(value)), 'Value'] : [value, 'Orders']
                      }
                    />
                    <Bar dataKey="orders" fill="#025b00" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Best sellers</h2>
              {bestSellers.length === 0 ? (
                <p className="text-gray-500">No sales in this period yet.</p>
              ) : (
                <div className="space-y-3">
                  {bestSellers.map((row) => (
                    <div key={row.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{row.name}</p>
                        <p className="text-sm text-gray-600">{row.units} sold</p>
                      </div>
                      <p className="font-semibold text-gray-900">{formatPrice(row.value)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-600" />
                Stock to watch
              </h2>
              {lowStock.length === 0 ? (
                <p className="text-gray-500">Every product has more than 10 in stock.</p>
              ) : (
                <div className="space-y-3">
                  {lowStock.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                      <p className="font-medium text-gray-900">{p.name}</p>
                      <p className={`font-semibold ${p.stock_quantity <= 0 ? 'text-red-600' : 'text-amber-700'}`}>
                        {p.stock_quantity <= 0 ? 'Out of stock' : `${p.stock_quantity} left`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminPage>
  )
}
