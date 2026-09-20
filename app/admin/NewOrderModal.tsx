'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, Plus, Trash2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { Product, productsApi, ordersApi } from '@/lib/api-client'
import { formatPrice, shippingCostFor, taxFor, MAX_QUANTITY_PER_ITEM } from '@/lib/store-config'

/** One line the shop is adding to the order. */
interface DraftLine {
  key: string
  product: Product
  colour: string
  quantity: number
}

const EMPTY = {
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  postalCode: '',
  notes: '',
}

/**
 * Lets the shop record an order taken off the phone or at the counter.
 *
 * It posts to the same endpoint the storefront uses, so prices, stock checks
 * and the stock deduction behave identically. The email address is optional
 * here, which the server allows only for a signed-in admin.
 */
export default function NewOrderModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [lines, setLines] = useState<DraftLine[]>([])
  const [details, setDetails] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const [pickProductId, setPickProductId] = useState('')
  const [pickColour, setPickColour] = useState('green')
  const [pickQuantity, setPickQuantity] = useState(1)

  useEffect(() => {
    if (!open) return
    productsApi.getAll().then(({ data }) => {
      const list = data || []
      setProducts(list)
      if (list.length > 0) setPickProductId((prev) => prev || list[0].id)
    })
  }, [open])

  // Reset when the dialog is dismissed so the next order starts clean.
  useEffect(() => {
    if (open) return
    setLines([])
    setDetails(EMPTY)
    setPickQuantity(1)
    setPickColour('green')
  }, [open])

  if (!open) return null

  const picked = products.find((p) => p.id === pickProductId) || null
  const pickedHasColours = Boolean(picked?.red_image_url)

  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0)
  const shipping = shippingCostFor(subtotal)
  const tax = taxFor(subtotal)
  const total = subtotal + shipping + tax

  const addLine = () => {
    if (!picked) return
    const colour = pickedHasColours ? pickColour : ''
    const key = colour ? `${picked.id}:${colour}` : picked.id

    setLines((prev) => {
      const existing = prev.find((l) => l.key === key)
      if (existing) {
        return prev.map((l) =>
          l.key === key
            ? { ...l, quantity: Math.min(MAX_QUANTITY_PER_ITEM, l.quantity + pickQuantity) }
            : l
        )
      }
      return [...prev, { key, product: picked, colour, quantity: pickQuantity }]
    })
    setPickQuantity(1)
  }

  const submit = async () => {
    if (saving) return
    if (lines.length === 0) return toast.error('Add at least one product')
    if (!details.name.trim()) return toast.error('Customer name is required')
    if (!details.phone.trim()) return toast.error('Phone number is required')
    if (details.address.trim().length < 10) return toast.error('Enter the full delivery address')
    if (!details.city.trim()) return toast.error('City is required')

    setSaving(true)
    const { data, error, fieldErrors } = await ordersApi.create({
      customer_name: details.name.trim(),
      customer_email: details.email.trim(),
      customer_phone: details.phone.trim(),
      shipping_address: details.address.trim(),
      shipping_city: details.city.trim(),
      shipping_postal_code: details.postalCode.trim(),
      order_notes: details.notes.trim(),
      items: lines.map((l) => ({
        product_id: l.product.id,
        colour: l.colour,
        quantity: l.quantity,
      })),
    })
    setSaving(false)

    if (error || !data) {
      const first = fieldErrors ? Object.values(fieldErrors)[0] : null
      toast.error(first || error || 'Could not create the order')
      return
    }

    toast.success(`Order ${data.order_number} created`)
    onCreated()
    onClose()
  }

  const field = (key: keyof typeof EMPTY, value: string) =>
    setDetails((prev) => ({ ...prev, [key]: value }))

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg'

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-3xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">New order</h2>
            <p className="text-sm text-gray-500">
              For an order taken by phone or at the counter. Stock is deducted just
              like a website order.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Product picker */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Products</h3>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[220px]">
                <label className="block text-xs text-gray-600 mb-1">Product</label>
                <select
                  value={pickProductId}
                  onChange={(e) => setPickProductId(e.target.value)}
                  className={inputClass}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatPrice(p.price)}
                      {p.stock_quantity <= 0 ? ' (out of stock)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {pickedHasColours && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Colour</label>
                  <select
                    value={pickColour}
                    onChange={(e) => setPickColour(e.target.value)}
                    className={inputClass}
                  >
                    <option value="green">Green</option>
                    <option value="red">Red</option>
                  </select>
                </div>
              )}

              <div className="w-24">
                <label className="block text-xs text-gray-600 mb-1">Qty</label>
                <input
                  type="number"
                  min={1}
                  max={MAX_QUANTITY_PER_ITEM}
                  value={pickQuantity}
                  onChange={(e) => setPickQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className={inputClass}
                />
              </div>

              <button
                onClick={addLine}
                disabled={!picked}
                className="inline-flex items-center gap-1.5 px-4 py-2 btn-primary disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {lines.length > 0 && (
              <div className="mt-4 border border-gray-200 rounded-lg divide-y divide-gray-100">
                {lines.map((l) => (
                  <div key={l.key} className="flex items-center gap-3 p-3">
                    <div className="relative w-10 h-10 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={
                          l.colour === 'red' && l.product.red_image_url
                            ? l.product.red_image_url
                            : l.product.image_url
                        }
                        alt=""
                        fill
                        className="object-contain"
                        sizes="40px"
                        quality={60}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{l.product.name}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {[l.product.volume, l.colour].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <span className="text-sm text-gray-600">
                      {l.quantity} × {formatPrice(l.product.price)}
                    </span>
                    <span className="w-24 text-right text-sm font-semibold">
                      {formatPrice(l.product.price * l.quantity)}
                    </span>
                    <button
                      onClick={() => setLines((prev) => prev.filter((x) => x.key !== l.key))}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      aria-label={`Remove ${l.product.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <div className="p-3 bg-gray-50 text-sm space-y-1">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                  </div>
                  {tax > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span><span>{formatPrice(tax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200">
                    <span>Total</span><span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Customer */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer &amp; delivery</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Full name *</label>
                <input value={details.name} onChange={(e) => field('name', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Phone *</label>
                <input value={details.phone} onChange={(e) => field('phone', e.target.value)} className={inputClass} placeholder="03xx xxxxxxx" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Email <span className="text-gray-400">(optional)</span>
                </label>
                <input value={details.email} onChange={(e) => field('email', e.target.value)} className={inputClass} placeholder="Leave blank for a phone order" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Delivery address *</label>
                <textarea value={details.address} onChange={(e) => field('address', e.target.value)} rows={2} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">City *</label>
                <input value={details.city} onChange={(e) => field('city', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Postal code</label>
                <input value={details.postalCode} onChange={(e) => field('postalCode', e.target.value)} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Order notes</label>
                <textarea value={details.notes} onChange={(e) => field('notes', e.target.value)} rows={2} className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="inline-flex items-center gap-2 btn-primary px-5 py-2 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Creating...' : `Create order${lines.length ? ` · ${formatPrice(total)}` : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}
