'use client'

/**
 * Shared furniture for the admin pages.
 *
 * Each dashboard action opens its own page (products, orders, analytics,
 * export), and they all need the same session guard, page chrome, status
 * badges, order detail view and CSV builder. Keeping one copy here is what
 * stops the four pages drifting apart.
 */

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, XCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Order } from '@/lib/api-client'
import { checkAdminSession } from '@/lib/auth'
import { PAYMENT_METHOD_LABEL, formatPrice } from '@/lib/store-config'

/** Redirects to the login page unless the server recognises the session. */
export function useAdminGuard() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    let active = true
    checkAdminSession().then((ok) => {
      if (!active) return
      if (!ok) router.push('/admin/login')
      else setAuthenticated(true)
    })
    return () => {
      active = false
    }
  }, [router])

  return authenticated
}

/** Page chrome: navbar, back link, title, footer. */
export function AdminPage({
  title,
  description,
  icon,
  actions,
  ready = true,
  children,
}: {
  title: string
  description?: string
  icon?: ReactNode
  actions?: ReactNode
  ready?: boolean
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <section className="pt-10 sm:pt-12 md:pt-14 pb-16">
        <div className="container-custom">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
            <div>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to dashboard
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                {icon}
                {title}
              </h1>
              {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
            </div>
            {actions}
          </div>

          {ready ? children : <p className="text-gray-500">Checking access...</p>}
        </div>
      </section>
      <Footer />
    </div>
  )
}

export const statusColor = (status: string) =>
  ({
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }[status] || 'bg-gray-100 text-gray-800')

export const paymentColor = (status: string) =>
  ({
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  }[status] || 'bg-gray-100 text-gray-800')

export const titleCase = (value: string) =>
  value ? value[0].toUpperCase() + value.slice(1) : ''

export const Badge = ({ text, className }: { text: string; className: string }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>{text}</span>
)

/** The full delivery record for one order. */
export function OrderDetailModal({
  order,
  onClose,
  onConfirm,
  onMarkPaid,
  onComplete,
}: {
  order: Order | null
  onClose: () => void
  onConfirm?: (id: string) => void
  onMarkPaid?: (id: string) => void
  onComplete?: (id: string) => void
}) {
  if (!order) return null

  const rows: Array<[string, string | undefined]> = [
    ['Name', order.customer_name],
    ['Phone', order.customer_phone],
    ['Email', order.customer_email],
    ['Address', order.shipping_address],
    ['City', order.shipping_city],
    ['Postal code', order.shipping_postal_code],
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer &amp; Delivery</h3>
              <div className="space-y-2 text-sm">
                {rows.map(([label, value]) => (
                  <p key={label} className="whitespace-pre-line">
                    <span className="font-medium">{label}:</span>{' '}
                    {label === 'Phone' && value ? (
                      <a href={`tel:${value}`} className="text-primary-600 hover:underline">{value}</a>
                    ) : label === 'Email' && value ? (
                      <a href={`mailto:${value}`} className="text-primary-600 hover:underline">{value}</a>
                    ) : (
                      value || '—'
                    )}
                  </p>
                ))}
                {order.order_notes && (
                  <p className="whitespace-pre-line p-2 bg-amber-50 border-l-2 border-amber-300 rounded">
                    <span className="font-medium">Notes:</span> {order.order_notes}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Information</h3>
              <div className="space-y-2 text-sm">
                {order.order_number && (
                  <p><span className="font-medium">Reference:</span> <span className="font-mono">{order.order_number}</span></p>
                )}
                <p className="text-xs text-gray-500 break-all">
                  <span className="font-medium">Order ID:</span> {order.id}
                </p>
                <p><span className="font-medium">Date:</span> {new Date(order.created_at).toLocaleString()}</p>
                <p>
                  <span className="font-medium">Payment method:</span>{' '}
                  {order.payment_method === 'cod' ? PAYMENT_METHOD_LABEL : order.payment_method || '—'}
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <Badge text={titleCase(order.status)} className={statusColor(order.status)} />
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Payment:</span>
                  <Badge text={titleCase(order.payment_status)} className={paymentColor(order.payment_status)} />
                </p>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Product</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Qty</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Price</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => {
                  const variant = [item.volume, item.colour].filter(Boolean).join(' · ')
                  return (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.product_name}
                        {variant && <span className="block text-xs text-gray-500 capitalize">{variant}</span>}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{formatPrice(item.price)}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        {formatPrice(item.line_total ?? item.price * item.quantity)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mt-6 text-sm">
            <div className="flex justify-between py-0.5">
              <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span>Delivery</span>
              <span>{order.shipping_cost === 0 ? 'Free' : formatPrice(order.shipping_cost)}</span>
            </div>
            {order.tax_amount > 0 && (
              <div className="flex justify-between py-0.5">
                <span>Tax</span><span>{formatPrice(order.tax_amount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2 mt-2">
              <span>Total</span><span>{formatPrice(order.total_amount)}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {order.status === 'pending' && onConfirm && (
              <button onClick={() => onConfirm(order.id)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Confirm Order
              </button>
            )}
            {order.payment_status === 'pending' && onMarkPaid && (
              <button onClick={() => onMarkPaid(order.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Mark Cash Received
              </button>
            )}
            {order.status === 'confirmed' && onComplete && (
              <button onClick={() => onComplete(order.id)} className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800">
                Mark as Delivered
              </button>
            )}
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Wraps a CSV field so commas, quotes and newlines cannot break the column. */
const csvCell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`

export function ordersToCsv(orders: Order[]) {
  const headers = [
    'Order', 'Date', 'Customer', 'Phone', 'Email', 'Address', 'City',
    'Postal code', 'Notes', 'Items', 'Subtotal', 'Delivery', 'Tax',
    'Total', 'Status', 'Payment',
  ]

  const rows = orders.map((order) =>
    [
      order.order_number || order.id,
      new Date(order.created_at).toLocaleString(),
      order.customer_name,
      order.customer_phone,
      order.customer_email,
      order.shipping_address,
      order.shipping_city,
      order.shipping_postal_code,
      order.order_notes,
      order.items
        .map((i) => {
          const variant = [i.volume, i.colour].filter(Boolean).join(' ')
          return `${i.product_name}${variant ? ` (${variant})` : ''} x${i.quantity}`
        })
        .join('; '),
      order.subtotal,
      order.shipping_cost,
      order.tax_amount,
      order.total_amount,
      order.status,
      order.payment_status,
    ].map(csvCell).join(',')
  )

  // The BOM keeps Excel from mangling non-ASCII characters in addresses.
  return '﻿' + [headers.map(csvCell).join(','), ...rows].join('\r\n')
}

export function downloadCsv(csv: string, filename: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
