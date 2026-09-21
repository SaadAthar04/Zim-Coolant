'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Truck, Shield, Minus, Plus, ShoppingCart, Maximize2, X, Check } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Product, productsApi } from '@/lib/api-client'
import { addToCart } from '@/lib/cart'
import {
  FREE_SHIPPING_THRESHOLD,
  MAX_QUANTITY_PER_ITEM,
  NOZZLE_IMAGE,
  formatPrice,
} from '@/lib/store-config'

type Colour = 'green' | 'red'
type View = 'front' | 'back' | 'nozzle'

export default function ProductDetail() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const slug = params.slug as string

  // Home-page cards link straight to a colour, e.g. ?colour=red.
  const requestedColour = searchParams.get('colour') === 'red' ? 'red' : 'green'

  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [colour, setColour] = useState<Colour>('green')
  const [view, setView] = useState<View>('front')
  const [quantity, setQuantity] = useState(1)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // The catalogue is six rows, so one fetch gives us the product and its
  // sibling sizes without a second round trip.
  useEffect(() => {
    let active = true
    productsApi.getAll().then(({ data }) => {
      if (!active) return
      setAllProducts(data || [])
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  const product = useMemo(
    () => allProducts.find((p) => p.slug === slug) || null,
    [allProducts, slug]
  )

  /** Every size of this product line, for the size selector. */
  const siblings = useMemo(() => {
    if (!product) return []
    return allProducts
      .filter((p) => p.range_key === product.range_key)
      .sort((a, b) => a.sort_order - b.sort_order)
  }, [allProducts, product])

  const hasColours = Boolean(product?.red_image_url)
  const includesNozzle = product?.nozzle_included === 1
  // ATF is sold without any public capacity, so it shows no size control.
  const showSizeSelector = product ? product.range_key !== 'atf' && siblings.length > 0 : false

  // Start fresh on each product, honouring any colour asked for in the URL.
  useEffect(() => {
    setView('front')
    setQuantity(1)
    setColour(requestedColour)
  }, [slug, requestedColour])

  useEffect(() => {
    if (view === 'nozzle' && !includesNozzle) setView('front')
  }, [view, includesNozzle])

  const imageFor = useCallback(
    (which: View): string => {
      if (!product) return ''
      if (which === 'nozzle') return NOZZLE_IMAGE
      if (colour === 'red' && hasColours) {
        return (which === 'front' ? product.red_image_url : product.red_back_image_url) || product.image_url
      }
      return (which === 'front' ? product.image_url : product.back_image_url) || product.image_url
    },
    [product, colour, hasColours]
  )

  const altFor = useCallback(
    (which: View) => {
      if (!product) return ''
      if (which === 'nozzle')
        return 'Transparent flexible pouring nozzle, included free with red and green ZIMX 1 Liter bottles'
      return [product.name, product.volume, hasColours ? colour : '', `${which} view`]
        .filter(Boolean)
        .join(', ')
    },
    [product, colour, hasColours]
  )

  const views: View[] = includesNozzle ? ['front', 'back', 'nozzle'] : ['front', 'back']

  // Close the lightbox with Escape.
  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen])

  const outOfStock = (product?.stock_quantity ?? 0) <= 0
  const maxQuantity = Math.min(MAX_QUANTITY_PER_ITEM, product?.stock_quantity || MAX_QUANTITY_PER_ITEM)

  const handleAddToCart = (thenCheckout = false) => {
    if (!product || outOfStock) return

    addToCart(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        colour: hasColours ? colour : '',
        volume: product.volume,
        price: product.price,
        image_url: imageFor('front'),
        stock_quantity: product.stock_quantity,
      },
      quantity
    )

    if (thenCheckout) {
      // Buy Now adds the chosen variant and quantity, then opens checkout.
      router.push('/cart')
      return
    }

    toast.success(`${product.name} added to your cart`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading product...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container-custom py-32 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Product not found</h1>
          <Link href="/products" className="btn-primary mt-4 inline-block">
            Back to Products
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const benefits = Array.isArray(product.benefits) ? product.benefits : []
  const directions = Array.isArray(product.directions) ? product.directions : []

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-10 sm:pt-12 md:pt-14 pb-16 bg-white">
        <div className="container-custom">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-gray-500" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/products" className="hover:text-primary-600">Products</Link></li>
              <li aria-hidden="true">/</li>
              <li>{product.category}</li>
              <li aria-hidden="true">/</li>
              <li className="text-gray-900 font-medium">{product.name}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Gallery */}
            <div
              className="space-y-4"
            >
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                <Image
                  key={`${product.id}-${colour}-${view}`}
                  src={imageFor(view)}
                  alt={altFor(view)}
                  fill
                  /* contain, so the whole supplied bottle image is visible */
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  quality={90}
                  priority
                />
                {hasColours && view !== 'nozzle' && (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 text-xs font-semibold tracking-wide text-gray-700 uppercase">
                    {colour}
                  </span>
                )}
                {view === 'nozzle' && (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary-600 text-xs font-semibold tracking-wide text-white uppercase">
                    Included free
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/90 text-gray-700 hover:bg-white transition-colors"
                  aria-label="Enlarge product image"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Thumbnails. No captions underneath, per the handoff; the
                  accessible name carries the meaning instead. */}
              <div className="flex gap-3">
                {views.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    aria-pressed={view === v}
                    aria-label={
                      v === 'nozzle' ? 'Included pouring nozzle' : `${v} view`
                    }
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 bg-gray-50 transition-all ${
                      view === v
                        ? 'border-primary-600 ring-1 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={imageFor(v)}
                      alt=""
                      fill
                      className="object-contain"
                      sizes="80px"
                      quality={70}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Purchase panel */}
            <div
              className="space-y-6"
            >
              <div>
                <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full uppercase tracking-wide">
                  {product.category}
                </span>
              </div>

              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                  {product.name}
                </h1>
                {product.intro && (
                  <p className="text-base text-gray-600">{product.intro}</p>
                )}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl md:text-4xl font-bold text-primary-600">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-sm text-gray-500">PKR</span>
                </div>
              </div>

              {/* Size — one product page per size, so this navigates */}
              {showSizeSelector && (
                <fieldset className="border-t border-gray-200 pt-5">
                  <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Bottle Size
                  </legend>
                  <div className="flex flex-wrap gap-3">
                    {siblings.map((sibling) => {
                      const active = sibling.id === product.id
                      return (
                        <button
                          key={sibling.id}
                          type="button"
                          onClick={() => router.push(`/products/${sibling.slug}`)}
                          aria-pressed={active}
                          aria-label={`${sibling.volume}, ${formatPrice(sibling.price)}`}
                          className={`px-5 py-3 rounded-lg border-2 text-left transition-all ${
                            active
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="block font-semibold text-gray-900">
                            {sibling.volume}
                          </span>
                          <span className="block text-xs text-gray-500">
                            {formatPrice(sibling.price)}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </fieldset>
              )}

              {/* Colour */}
              {hasColours && (
                <fieldset className="border-t border-gray-200 pt-5">
                  <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Colour — <span className="text-gray-900 capitalize">{colour}</span>
                  </legend>
                  <div className="flex gap-3">
                    {(['green', 'red'] as Colour[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColour(c)}
                        aria-pressed={colour === c}
                        aria-label={`Select ${c}`}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
                          colour === c
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-black/10"
                          style={{ backgroundColor: c === 'green' ? '#22c55e' : '#ef4444' }}
                        />
                        <span className="text-sm font-medium capitalize text-gray-900">{c}</span>
                        {colour === c && <Check className="w-4 h-4 text-primary-600" />}
                      </button>
                    ))}
                  </div>
                  {product.colour_note && (
                    <p className="mt-2 text-xs text-gray-500">{product.colour_note}</p>
                  )}
                </fieldset>
              )}

              {/* Free nozzle — ZIMX 1 Liter only */}
              {includesNozzle && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-primary-50 border border-primary-100">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={NOZZLE_IMAGE}
                      alt="Pouring nozzle included with ZIMX 1 Liter bottles"
                      fill
                      className="object-contain"
                      sizes="64px"
                      quality={75}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Free Easy-Pour Nozzle</p>
                    <p className="text-sm text-gray-600">
                      Included with red and green 1 Liter bottles. Pour directly, with no separate funnel.
                    </p>
                  </div>
                </div>
              )}

              {/* Quantity and purchase */}
              <div className="border-t border-gray-200 pt-5 space-y-4">
                {outOfStock ? (
                  <p className="text-sm font-medium text-red-600">
                    This product is currently out of stock.
                  </p>
                ) : product.stock_quantity <= 10 ? (
                  <p className="text-sm font-medium text-amber-600">
                    Only {product.stock_quantity} left in stock.
                  </p>
                ) : (
                  <p className="text-sm font-medium text-green-700">In stock</p>
                )}

                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="p-3 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-l-lg"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-semibold" aria-live="polite">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                      disabled={quantity >= maxQuantity}
                      className="p-3 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-r-lg"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(false)}
                    disabled={outOfStock}
                    className="flex-1 min-h-[52px] flex items-center justify-center gap-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddToCart(true)}
                  disabled={outOfStock}
                  className="w-full min-h-[52px] flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>

              {/* Description */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Product Description</h2>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
                {benefits.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {benefits.map((benefit, i) => (
                      <li key={i} className="flex gap-2 text-gray-600">
                        <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Directions */}
              {directions.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Directions for Use</h2>
                  <ol className="space-y-2 list-decimal list-inside text-gray-600">
                    {directions.map((step, i) => (
                      <li key={i} className="leading-relaxed">{step}</li>
                    ))}
                  </ol>
                  {product.usage_note && (
                    <p className="mt-4 pl-4 border-l-2 border-gray-300 text-sm text-gray-600">
                      {product.usage_note}
                    </p>
                  )}
                </div>
              )}

              {/* Reassurance */}
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <Truck className="w-7 h-7 text-primary-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Free delivery above {formatPrice(FREE_SHIPPING_THRESHOLD)}
                  </p>
                </div>
                <div className="text-center">
                  <Shield className="w-7 h-7 text-primary-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Cash on delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged product image"
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/90 text-gray-900"
            aria-label="Close image"
          >
            <X className="w-5 h-5" />
          </button>
          <div
            className="relative w-full max-w-3xl aspect-square"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={imageFor(view)}
              alt={altFor(view)}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 768px"
              quality={95}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
