'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Package, Save, X, AlertTriangle, Pencil } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Product, productsApi } from '@/lib/api-client'
import { checkAdminSession } from '@/lib/auth'
import { formatPrice } from '@/lib/store-config'

/** Fields the shop can change from here. Images and the range/size wiring are
 *  deliberately not editable: they come from the client's approved artwork and
 *  catalogue, and changing them here would break the size and colour pickers. */
interface EditableProduct {
  name: string
  price: string
  stock_quantity: string
  intro: string
  description: string
  benefits: string
  directions: string
  usage_note: string
}

const toForm = (p: Product): EditableProduct => ({
  name: p.name,
  price: String(p.price),
  stock_quantity: String(p.stock_quantity),
  intro: p.intro || '',
  description: p.description,
  benefits: (p.benefits || []).join('\n'),
  directions: (p.directions || []).join('\n'),
  usage_note: p.usage_note || '',
})

export default function AdminProducts() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<EditableProduct | null>(null)
  const [saving, setSaving] = useState(false)

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

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await productsApi.getAll()
    if (error) toast.error('Could not load products')
    setProducts(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (authenticated) load()
  }, [authenticated, load])

  const openEditor = (product: Product) => {
    setEditing(product)
    setForm(toForm(product))
  }

  const closeEditor = () => {
    setEditing(null)
    setForm(null)
  }

  const setField = (field: keyof EditableProduct, value: string) =>
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev))

  const save = async () => {
    if (!editing || !form || saving) return

    const price = Number(form.price)
    const stock = Number(form.stock_quantity)

    if (!form.name.trim()) return toast.error('Name cannot be empty')
    if (!Number.isFinite(price) || price <= 0) return toast.error('Enter a valid price')
    if (!Number.isInteger(stock) || stock < 0) return toast.error('Enter a valid stock quantity')
    if (!form.description.trim()) return toast.error('Description cannot be empty')

    setSaving(true)
    const { data, error } = await productsApi.update(editing.id, {
      name: form.name.trim(),
      price,
      stock_quantity: stock,
      intro: form.intro.trim() || null,
      description: form.description.trim(),
      benefits: form.benefits.split('\n').map((s) => s.trim()).filter(Boolean),
      directions: form.directions.split('\n').map((s) => s.trim()).filter(Boolean),
      usage_note: form.usage_note.trim() || null,
    })
    setSaving(false)

    if (error || !data) {
      toast.error(typeof error === 'string' ? error : 'Could not save changes')
      return
    }

    toast.success(`${data.name} updated`)
    closeEditor()
    load()
  }

  /** Stock-only change straight from the table, for restocking. */
  const setStock = async (product: Product, value: number) => {
    if (!Number.isInteger(value) || value < 0) return
    const { error } = await productsApi.update(product.id, { stock_quantity: value })
    if (error) {
      toast.error('Could not update stock')
      return
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, stock_quantity: value } : p))
    )
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container-custom pt-32 pb-16 text-center text-gray-500">
          Checking access...
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="pt-28 sm:pt-32 md:pt-36 pb-16">
        <div className="container-custom">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to dashboard
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="w-7 h-7 text-primary-600" />
                Products
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Change prices, stock and product copy. Changes go live immediately.
              </p>
            </div>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading products...</p>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Product</th>
                      <th className="text-left px-4 py-3 font-medium">Category</th>
                      <th className="text-right px-4 py-3 font-medium">Price</th>
                      <th className="text-center px-4 py-3 font-medium">Stock</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-t border-gray-100">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                              <Image
                                src={product.image_url}
                                alt=""
                                fill
                                className="object-contain"
                                sizes="48px"
                                quality={60}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-xs text-gray-500">
                                /{product.slug}
                                {product.volume ? ` · ${product.volume}` : ''}
                                {product.red_image_url ? ' · green & red' : ''}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{product.category}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="number"
                              min={0}
                              defaultValue={product.stock_quantity}
                              onBlur={(e) => {
                                const value = Number(e.target.value)
                                if (value !== product.stock_quantity) setStock(product, value)
                              }}
                              className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-center"
                              aria-label={`Stock quantity for ${product.name}`}
                            />
                            {product.stock_quantity <= 0 ? (
                              <span className="text-xs font-medium text-red-600">Out</span>
                            ) : product.stock_quantity <= 10 ? (
                              <span className="text-xs font-medium text-amber-600">Low</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => openEditor(product)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="px-4 py-3 text-xs text-gray-500 bg-gray-50 border-t border-gray-100">
                Stock saves as soon as you click away from the box. Product photos and the
                size and colour options come from the client&apos;s approved artwork and are
                not editable here.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Editor */}
      {editing && form && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-3xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Edit product</h2>
              <button
                onClick={closeEditor}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close editor"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (PKR)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.price}
                    onChange={(e) => setField('price', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock quantity
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.stock_quantity}
                    onChange={(e) => setField('stock_quantity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short intro line
                </label>
                <input
                  type="text"
                  value={form.intro}
                  onChange={(e) => setField('intro', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Shown under the product title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Benefits <span className="font-normal text-gray-500">— one per line</span>
                </label>
                <textarea
                  value={form.benefits}
                  onChange={(e) => setField('benefits', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Directions for use <span className="font-normal text-gray-500">— one per line</span>
                </label>
                <textarea
                  value={form.directions}
                  onChange={(e) => setField('directions', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Safety / usage note
                </label>
                <input
                  type="text"
                  value={form.usage_note}
                  onChange={(e) => setField('usage_note', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {editing.range_key === 'atf' && (
                <p className="flex gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span>
                    ATF is sold without a stated capacity. Please keep any volume or pack
                    size out of this product&apos;s customer-facing text.
                  </span>
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={closeEditor}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-2 btn-primary px-5 py-2 disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
