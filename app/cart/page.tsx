'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Trash2, ArrowLeft, Truck, CheckCircle, Minus, Plus, Banknote } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Order, ordersApi } from '@/lib/api-client'
import {
  CartLine,
  cartSubtotal,
  clearCart,
  readCart,
  removeLine,
  subscribeToCart,
  updateQuantity,
} from '@/lib/cart'
import {
  FREE_SHIPPING_THRESHOLD,
  MAX_QUANTITY_PER_ITEM,
  PAYMENT_METHOD_LABEL,
  formatPrice,
  shippingCostFor,
  taxFor,
} from '@/lib/store-config'

type Step = 'cart' | 'checkout' | 'success'

const EMPTY_DETAILS = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  notes: '',
}

export default function Cart() {
  const [mounted, setMounted] = useState(false)
  const [items, setItems] = useState<CartLine[]>([])
  const [step, setStep] = useState<Step>('cart')
  const [submitting, setSubmitting] = useState(false)
  const [details, setDetails] = useState(EMPTY_DETAILS)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  useEffect(() => {
    setMounted(true)
    setItems(readCart())
    return subscribeToCart(() => setItems(readCart()))
  }, [])

  const subtotal = cartSubtotal(items)
  const shipping = shippingCostFor(subtotal)
  const tax = taxFor(subtotal)
  const total = subtotal + shipping + tax
  const remainingForFreeDelivery = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)

  const handleQuantity = (key: string, quantity: number) => {
    if (quantity < 1) {
      setItems(removeLine(key))
      toast.success('Item removed from your cart')
      return
    }
    setItems(updateQuantity(key, quantity))
  }

  const setField = (field: keyof typeof EMPTY_DETAILS, value: string) => {
    setDetails((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const placeOrder = async () => {
    if (items.length === 0 || submitting) return

    setSubmitting(true)
    setFieldErrors({})

    const {
      data,
      error,
      fieldErrors: serverFieldErrors,
      emailConfigured,
    } = await ordersApi.create({
      customer_name: details.name,
      customer_email: details.email,
      customer_phone: details.phone,
      shipping_address: details.address,
      shipping_city: details.city,
      shipping_postal_code: details.postalCode,
      order_notes: details.notes,
      // Only identity and quantity: the server prices everything itself.
      items: items.map((i) => ({
        product_id: i.productId,
        colour: i.colour,
        quantity: i.quantity,
      })),
    })

    setSubmitting(false)

    if (error || !data) {
      if (serverFieldErrors) setFieldErrors(serverFieldErrors)
      toast.error(error || 'Could not place your order. Please try again.')
      return
    }

    setPlacedOrder(data)
    setEmailSent(Boolean(emailConfigured))
    clearCart()
    setItems([])
    setStep('success')
  }

  /** Server-side field errors map onto these keys. */
  const errorFor = (field: string) =>
    fieldErrors[field] ? (
      <p className="mt-1 text-xs text-red-600">{fieldErrors[field]}</p>
    ) : null

  const inputClass = (field: string) =>
    `w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent ${
      fieldErrors[field] ? 'border-red-400' : 'border-gray-300'
    }`

  if (step === 'success' && placedOrder) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container-custom pt-32 pb-16">
          <div
            className="max-w-2xl mx-auto text-center"
          >
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-8" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Thank you for your order
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              We have received your order and will call you on{' '}
              <strong>{placedOrder.customer_phone}</strong> to arrange delivery.
            </p>

            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Order reference</span>
                <span className="font-mono font-semibold text-gray-900">
                  {placedOrder.order_number}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Amount payable on delivery</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(placedOrder.total_amount)}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Payment</span>
                <span className="font-semibold text-gray-900">{PAYMENT_METHOD_LABEL}</span>
              </div>
            </div>

            {/* Only promise an email when the server can actually send one. */}
            <p className="text-sm text-gray-500 mb-8">
              {emailSent
                ? `A confirmation has been sent to ${placedOrder.customer_email}.`
                : 'Please keep your order reference for any follow-up.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products" className="btn-primary">Continue Shopping</Link>
              <Link href="/" className="btn-outline">Back to Home</Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container-custom pt-32 pb-16 text-center text-gray-500">Loading your cart...</div>
        <Footer />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container-custom pt-32 pb-16">
          <div
            className="max-w-2xl mx-auto text-center"
          >
            <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-8" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-lg text-gray-600 mb-8">
              Browse the range and add something to get started.
            </p>
            <Link href="/products" className="btn-primary">Start Shopping</Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-10 sm:pt-12 md:pt-14 pb-16 bg-gray-50">
        <div className="container-custom">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
            {step === 'cart' ? 'Your Cart' : 'Checkout'}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items / form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Items ({items.length})
                  </h2>
                  {step === 'cart' && (
                    <button
                      onClick={() => {
                        clearCart()
                        setItems([])
                      }}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Clear cart
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.key}
                      className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="relative w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                        {item.image_url && (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-contain"
                            sizes="80px"
                            quality={70}
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.slug}`}
                          className="font-semibold text-gray-900 hover:text-primary-600"
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-gray-500 capitalize">
                          {[item.volume, item.colour].filter(Boolean).join(' · ')}
                        </p>
                        <p className="text-sm font-medium text-primary-600 mt-1">
                          {formatPrice(item.price)} each
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => handleQuantity(item.key, item.quantity - 1)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-l-lg"
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantity(item.key, item.quantity + 1)}
                            disabled={
                              item.quantity >=
                              Math.min(MAX_QUANTITY_PER_ITEM, item.stock_quantity || MAX_QUANTITY_PER_ITEM)
                            }
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-r-lg disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="w-24 text-right font-bold text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </div>

                        <button
                          onClick={() => handleQuantity(item.key, 0)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {step === 'checkout' && (
                <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Delivery details</h2>
                  <p className="text-sm text-gray-500 mb-5">
                    We need these to deliver your order and confirm it by phone.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={details.name}
                        onChange={(e) => setField('name', e.target.value)}
                        className={inputClass('customer_name')}
                        placeholder="Your full name"
                        autoComplete="name"
                        required
                      />
                      {errorFor('customer_name')}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={details.phone}
                        onChange={(e) => setField('phone', e.target.value)}
                        className={inputClass('customer_phone')}
                        placeholder="03xx xxxxxxx"
                        autoComplete="tel"
                        required
                      />
                      {errorFor('customer_phone')}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={details.email}
                        onChange={(e) => setField('email', e.target.value)}
                        className={inputClass('customer_email')}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                      />
                      {errorFor('customer_email')}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={details.address}
                        onChange={(e) => setField('address', e.target.value)}
                        className={inputClass('shipping_address')}
                        placeholder="House / flat number, street, area"
                        autoComplete="street-address"
                        rows={3}
                        required
                      />
                      {errorFor('shipping_address')}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={details.city}
                        onChange={(e) => setField('city', e.target.value)}
                        className={inputClass('shipping_city')}
                        placeholder="Faisalabad"
                        autoComplete="address-level2"
                        required
                      />
                      {errorFor('shipping_city')}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal code
                      </label>
                      <input
                        type="text"
                        value={details.postalCode}
                        onChange={(e) => setField('postalCode', e.target.value)}
                        className={inputClass('shipping_postal_code')}
                        placeholder="Optional"
                        autoComplete="postal-code"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order notes
                      </label>
                      <textarea
                        value={details.notes}
                        onChange={(e) => setField('notes', e.target.value)}
                        className={inputClass('order_notes')}
                        placeholder="Landmarks, delivery timing, anything else we should know"
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-3 p-4 rounded-lg bg-primary-50 border border-primary-100">
                    <Banknote className="w-5 h-5 text-primary-700 flex-shrink-0" />
                    <p className="text-sm text-gray-700">
                      <strong>{PAYMENT_METHOD_LABEL}</strong> — pay the rider in cash when your
                      order arrives. No online payment needed.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-28">
                <h2 className="text-lg font-semibold text-gray-900 mb-5">Order summary</h2>

                <div className="space-y-3 mb-5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="text-gray-900 font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className={shipping === 0 ? 'text-green-600 font-medium' : 'text-gray-900 font-medium'}>
                      {shipping === 0 ? 'Free' : formatPrice(shipping)}
                    </span>
                  </div>
                  {tax > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span className="text-gray-900 font-medium">{formatPrice(tax)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {remainingForFreeDelivery > 0 && (
                  <div className="mb-5 p-3 rounded-lg bg-amber-50 border border-amber-100 text-sm text-amber-800">
                    Add {formatPrice(remainingForFreeDelivery)} more for free delivery.
                  </div>
                )}

                {step === 'cart' ? (
                  <button
                    onClick={() => setStep('checkout')}
                    className="w-full min-h-[52px] btn-primary flex items-center justify-center"
                  >
                    Proceed to Checkout
                  </button>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={placeOrder}
                      disabled={submitting}
                      className="w-full min-h-[52px] btn-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Placing order...
                        </>
                      ) : (
                        <>Place Order · {formatPrice(total)}</>
                      )}
                    </button>
                    <button
                      onClick={() => setStep('cart')}
                      className="w-full py-2.5 text-sm text-gray-600 hover:text-gray-900"
                    >
                      Back to cart
                    </button>
                  </div>
                )}

                <div className="mt-6 pt-5 border-t border-gray-200 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-primary-600 flex-shrink-0" />
                    <span>Free delivery on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Banknote className="w-5 h-5 text-primary-600 flex-shrink-0" />
                    <span>{PAYMENT_METHOD_LABEL}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link href="/products" className="btn-outline inline-flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
