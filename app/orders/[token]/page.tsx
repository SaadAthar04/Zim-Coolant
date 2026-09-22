'use client'

// The page behind "Track my Order" in every order email.
//
// No login: the signed token in the URL is the authorisation. The customer sees
// where their order is, and can call it back while it is still with us.

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  CheckCircle2,
  Circle,
  Loader2,
  PackageCheck,
  Truck,
  XCircle,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { PAYMENT_METHOD_LABEL, formatPrice } from '@/lib/store-config'

type TrackedItem = {
  product_name: string
  colour?: string
  volume?: string
  image_url?: string
  quantity: number
  price: number
  line_total: number
}

type TrackedOrder = {
  order_number: string
  status: string
  created_at: string
  customer_name: string
  shipping_address?: string
  shipping_city?: string
  items: TrackedItem[]
  subtotal: number
  shipping_cost: number
  tax_amount: number
  total_amount: number
  courier_name?: string
  tracking_number?: string
  tracking_url?: string
  can_cancel: boolean
}

/** The happy path, in order. 'cancelled' is handled separately. */
const STEPS = [
  { key: 'pending', label: 'Order received', hint: 'We have your order.' },
  { key: 'confirmed', label: 'Confirmed', hint: 'We are preparing it for dispatch.' },
  { key: 'dispatched', label: 'Dispatched', hint: 'On its way to you.' },
  { key: 'delivered', label: 'Delivered', hint: 'Enjoy!' },
]

const formatDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })
}

const variantLabel = (item: TrackedItem) =>
  [item.volume, item.colour ? item.colour[0].toUpperCase() + item.colour.slice(1) : '']
    .filter(Boolean)
    .join(' · ')

export default function TrackOrder() {
  const params = useParams()
  const token = params.token as string

  const [order, setOrder] = useState<TrackedOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [confirmingCancel, setConfirmingCancel] = useState(false)

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders/track/${token}`)
      const payload = await response.json()
      if (!response.ok) {
        setError(payload.error || 'This link is not valid or has expired.')
        return
      }
      setOrder(payload.data)
    } catch {
      setError('We could not load your order. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  const cancelOrder = async () => {
    setCancelling(true)
    try {
      const response = await fetch(`/api/orders/track/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      })
      const payload = await response.json()
      if (!response.ok) {
        toast.error(payload.error || 'We could not cancel this order.')
        return
      }
      setOrder(payload.data)
      setConfirmingCancel(false)
      toast.success(payload.message || 'Your order has been cancelled.')
    } catch {
      toast.error('We could not cancel this order. Please call us on +92 333-1632138.')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center gap-3 py-20 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading your order...
        </div>
      </Shell>
    )
  }

  if (error || !order) {
    return (
      <Shell>
        <div className="max-w-md mx-auto text-center py-16">
          <XCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            We could not open this order
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-600">
            Tracking links stop working after 90 days. Call us on{' '}
            <a href="tel:+923331632138" className="text-primary-600 font-medium">
              +92 333-1632138
            </a>{' '}
            and we will look it up for you.
          </p>
          <Link
            href="/products"
            className="inline-block mt-8 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Browse products
          </Link>
        </div>
      </Shell>
    )
  }

  const cancelled = order.status === 'cancelled'
  const currentStep = STEPS.findIndex((s) => s.key === order.status)

  return (
    <Shell>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-sm text-gray-500">Order {order.order_number}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
            {cancelled ? 'This order was cancelled' : 'Your order'}
          </h1>
          <p className="text-sm text-gray-600 mt-2">Placed on {formatDate(order.created_at)}</p>
        </div>

        {/* Progress */}
        {cancelled ? (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 mb-8">
            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm text-red-900">
              <p className="font-semibold">Cancelled</p>
              <p className="text-red-800 mt-1">
                Nothing will be delivered and nothing is owed. You are welcome to place a new
                order any time.
              </p>
            </div>
          </div>
        ) : (
          <ol className="mb-8 space-y-1">
            {STEPS.map((step, index) => {
              const done = index <= currentStep
              const active = index === currentStep
              return (
                <li key={step.key} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    {done ? (
                      <CheckCircle2
                        className={`w-6 h-6 shrink-0 ${active ? 'text-primary-600' : 'text-primary-500'}`}
                      />
                    ) : (
                      <Circle className="w-6 h-6 shrink-0 text-gray-300" />
                    )}
                    {index < STEPS.length - 1 && (
                      <div
                        className={`w-px flex-1 min-h-[28px] ${
                          index < currentStep ? 'bg-primary-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                  <div className={`pb-5 ${done ? '' : 'opacity-50'}`}>
                    <p
                      className={`text-sm font-semibold ${active ? 'text-primary-700' : 'text-gray-900'}`}
                    >
                      {step.label}
                    </p>
                    <p className="text-sm text-gray-600">{step.hint}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        )}

        {/* Courier */}
        {!cancelled && (order.courier_name || order.tracking_number || order.tracking_url) && (
          <div className="p-4 rounded-xl bg-primary-50 border border-primary-100 mb-8">
            <div className="flex items-center gap-2 text-primary-800 font-semibold text-sm mb-2">
              <Truck className="w-4 h-4" />
              Courier details
            </div>
            {order.courier_name && (
              <p className="text-sm text-gray-700">
                Carried by <strong>{order.courier_name}</strong>
              </p>
            )}
            {order.tracking_number && (
              <p className="text-sm text-gray-700">
                Tracking number <strong>{order.tracking_number}</strong>
              </p>
            )}
            {order.tracking_url && (
              <a
                href={order.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary-700 hover:text-primary-800 font-medium mt-2"
              >
                Track with the courier
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Items */}
        <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-900">
              {order.items.length} item{order.items.length === 1 ? '' : 's'}
            </h2>
          </div>

          <ul className="divide-y divide-gray-100">
            {order.items.map((item, index) => {
              const variant = variantLabel(item)
              return (
                <li key={`${item.product_name}-${index}`} className="flex gap-3 p-4">
                  {item.image_url && (
                    <div className="relative w-14 h-14 shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                      <Image
                        src={item.image_url}
                        alt={item.product_name}
                        fill
                        sizes="56px"
                        className="object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                    {variant && <p className="text-xs text-gray-500 mt-0.5">{variant}</p>}
                    <p className="text-xs text-gray-500 mt-0.5">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                    {formatPrice(item.line_total)}
                  </p>
                </li>
              )
            })}
          </ul>

          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 space-y-1.5 text-sm">
            <Row label="Subtotal" value={formatPrice(order.subtotal)} />
            <Row
              label="Delivery"
              value={order.shipping_cost === 0 ? 'Free' : formatPrice(order.shipping_cost)}
            />
            {order.tax_amount > 0 && <Row label="Tax" value={formatPrice(order.tax_amount)} />}
            <div className="flex justify-between pt-1.5 border-t border-gray-200 text-base font-bold text-gray-900">
              <span>Total</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Delivery address */}
        {(order.shipping_address || order.shipping_city) && (
          <div className="text-sm text-gray-600 mb-8">
            <p className="font-semibold text-gray-900 mb-1">Delivering to</p>
            <p>{order.customer_name}</p>
            {order.shipping_address && <p>{order.shipping_address}</p>}
            {order.shipping_city && <p>{order.shipping_city}</p>}
            {!cancelled && (
              <p className="mt-2">
                Paying <strong>{formatPrice(order.total_amount)}</strong> by{' '}
                {PAYMENT_METHOD_LABEL.toLowerCase()}.
              </p>
            )}
          </div>
        )}

        {/* Cancel */}
        {order.can_cancel && !cancelled && (
          <div className="border-t border-gray-200 pt-6">
            {confirmingCancel ? (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                <p className="text-sm text-red-900 font-semibold mb-1">
                  Cancel order {order.order_number}?
                </p>
                <p className="text-sm text-red-800 mb-4">
                  This cannot be undone. You will not be charged anything.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={cancelOrder}
                    disabled={cancelling}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-medium inline-flex items-center gap-2"
                  >
                    {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                    {cancelling ? 'Cancelling...' : 'Yes, cancel it'}
                  </button>
                  <button
                    onClick={() => setConfirmingCancel(false)}
                    disabled={cancelling}
                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium"
                  >
                    Keep my order
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-600">Changed your mind?</p>
                <button
                  onClick={() => setConfirmingCancel(true)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Cancel this order
                </button>
              </div>
            )}
          </div>
        )}

        <p className="text-sm text-gray-500 text-center mt-10">
          Questions? Call{' '}
          <a href="tel:+923331632138" className="text-primary-600 font-medium">
            +92 333-1632138
          </a>{' '}
          or email{' '}
          <a href="mailto:info@zimchemicals.com" className="text-primary-600 font-medium">
            info@zimchemicals.com
          </a>
        </p>
      </div>
    </Shell>
  )
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between text-gray-600">
    <span>{label}</span>
    <span>{value}</span>
  </div>
)

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <section className="flex-1 pt-10 sm:pt-12 pb-16">
        <div className="container-custom">{children}</div>
      </section>
      <Footer />
    </div>
  )
}
