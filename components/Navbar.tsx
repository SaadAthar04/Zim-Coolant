'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Menu, X, Search as SearchIcon } from 'lucide-react'
import { productsApi } from '@/lib/api-client'
import { cartCount, readCart, subscribeToCart } from '@/lib/cart'
import { formatPrice } from '@/lib/store-config'
import AnnouncementBar from './AnnouncementBar'
import WhatsAppIcon from './WhatsAppIcon'

type ProductSuggest = {
  id: string
  name: string
  slug: string
  image_url: string | null
  category?: string | null
  price: number
}

const NAV_ITEMS = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/products' },
  { name: 'About Us', href: '/about' },
  { name: 'Contact', href: '/contact' },
]

/**
 * Site header, following the client's reference design: white, the mark on the
 * left, navigation and cart on the right, separated by a hairline rule.
 *
 * Search is kept from the previous header — the reference has none, but taking
 * it away would be a loss of function rather than a change of design — and is
 * folded behind an icon so it does not alter the layout.
 */
export default function Navbar() {
  const pathname = usePathname()

  const [mounted, setMounted] = useState(false)
  const [cartItems, setCartItems] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ProductSuggest[]>([])
  const whatsappUrl = 'https://wa.me/923268871985'

  useEffect(() => {
    setMounted(true)
    const update = () => setCartItems(cartCount(readCart()))
    update()
    return subscribeToCart(update)
  }, [])

  // Close the menus when moving to another page.
  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
    setQuery('')
  }, [pathname])

  useEffect(() => {
    if (!searchOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setQuery('')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchOpen])

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    const handle = setTimeout(async () => {
      const { data, error } = await productsApi.getAll()
      if (!active) return
      setResults(
        !error && data
          ? data
              // Match the range name and the description too, so searching
              // "coolant" still finds ZIMX, whose name never says the word.
              .filter((p) => {
                const term = query.trim().toLowerCase()
                return [p.name, p.category, p.description, p.volume]
                  .filter(Boolean)
                  .some((field) => String(field).toLowerCase().includes(term))
              })
              .slice(0, 6)
              .map((p) => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                image_url: p.image_url,
                category: p.category,
                price: p.price,
              }))
          : []
      )
      setLoading(false)
    }, 250)
    return () => {
      active = false
      clearTimeout(handle)
    }
  }, [query])

  const isCurrent = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const trimmed = query.trim()

  const closeSearch = () => {
    setSearchOpen(false)
    setQuery('')
  }

  /**
   * Search opens as a full-width panel beneath the header rather than a small
   * floating box: there is room for a real result row — photo, name, range and
   * price — so people can recognise what they want without leaving the page.
   */
  const searchPanel = searchOpen && (
    <>
      {/* Dims the page below the header, so the header itself stays legible. */}
      <div
        className="absolute left-0 right-0 top-full h-screen bg-black/20 z-30"
        onClick={closeSearch}
        aria-hidden="true"
      />

      <div className="absolute left-0 right-0 top-full bg-white border-t border-[#e4e6e6] shadow-lg z-40">
        <div className="mx-auto max-w-[1260px] px-[6%] md:px-8 py-5">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#72787a]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              placeholder="Search for a coolant, gear oil or transmission fluid"
              aria-label="Search products"
              className="w-full border border-[#d7dbdb] rounded-lg pl-12 pr-11 py-3.5 text-base outline-none focus:border-[#171c1e] transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-[#f1f2f2] text-[#72787a]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="mt-4">
            {trimmed.length < 2 ? (
              <p className="text-sm text-[#72787a] py-2">
                Type at least two letters, or{' '}
                <Link href="/products" onClick={closeSearch} className="underline hover:opacity-70">
                  browse the full range
                </Link>
                .
              </p>
            ) : loading ? (
              <p className="text-sm text-[#72787a] py-2">Searching...</p>
            ) : results.length === 0 ? (
              <p className="text-sm text-[#72787a] py-2">
                Nothing matches &ldquo;{trimmed}&rdquo;.{' '}
                <Link href="/products" onClick={closeSearch} className="underline hover:opacity-70">
                  See all products
                </Link>
                .
              </p>
            ) : (
              <>
                <ul className="divide-y divide-[#e4e6e6] border-y border-[#e4e6e6]">
                  {results.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/products/${p.slug}`}
                        onClick={closeSearch}
                        className="flex items-center gap-4 py-3 hover:bg-[#f8f9f9] -mx-2 px-2 rounded transition-colors"
                      >
                        <div className="relative w-12 h-12 flex-shrink-0 bg-[#f1f2f2] rounded overflow-hidden">
                          {p.image_url && (
                            <Image src={p.image_url} alt="" fill className="object-contain" sizes="48px" quality={60} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-medium text-[#171c1e] truncate">{p.name}</p>
                          {p.category && (
                            <p className="text-[11px] tracking-[0.5px] uppercase text-[#737b77] mt-0.5">
                              {p.category}
                            </p>
                          )}
                        </div>
                        <span className="text-[15px] font-medium tabular-nums whitespace-nowrap">
                          {formatPrice(p.price)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/products"
                  onClick={closeSearch}
                  className="inline-block mt-3 text-sm font-medium hover:opacity-70"
                >
                  See all products ↗
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <AnnouncementBar />

      <header className="relative z-40 bg-white border-b border-[#e4e6e6] text-[#171c1e]">
        <div className="flex items-center gap-[18px] h-[72px] px-[6%] md:h-[92px] md:px-[max(5%,calc((100vw-1260px)/2))]">
          {/* Brand */}
          <Link href="/" aria-label="ZIM home" className="flex-shrink-0">
            <Image
              src="/zim-logo.png"
              alt="ZIM"
              width={256}
              height={92}
              priority
              className="block w-[91px] md:w-[132px] h-auto invert"
            />
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Main navigation" className="hidden md:flex ml-auto gap-[34px] text-[14px]">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`py-3 hover:opacity-70 transition-opacity ${
                  isCurrent(item.href) ? 'border-b border-[#171c1e]' : ''
                }`}
                aria-current={isCurrent(item.href) ? 'page' : undefined}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search, contact, cart, menu */}
          <div className="flex items-center gap-3 md:gap-4 ml-auto md:ml-8">
            <button
              type="button"
              onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
              aria-label={searchOpen ? 'Close search' : 'Search products'}
              aria-expanded={searchOpen}
              className="flex items-center p-1 hover:opacity-70 transition-opacity"
            >
              {searchOpen ? <X className="w-5 h-5" /> : <SearchIcon className="w-5 h-5" />}
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Message us on WhatsApp"
              title="Message us on WhatsApp"
              className="hidden sm:flex items-center p-1 text-[#171c1e] hover:text-[#25D366] transition-colors"
            >
              <WhatsAppIcon />
            </a>

            <Link href="/cart" className="flex items-center gap-[5px] md:gap-2.5 hover:opacity-70 transition-opacity" aria-label="View cart">
              <ShoppingCart className="w-5 h-5 md:w-[23px] md:h-[23px]" />
              <span className="text-[12px] tabular-nums">{mounted ? cartItems : 0}</span>
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden p-1"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {searchPanel}

        {/* Mobile navigation */}
        {menuOpen && (
          <nav aria-label="Main navigation" className="md:hidden border-t border-[#e4e6e6] animate-slide-down">
            <ul className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block px-[6%] py-3.5 text-[15px] hover:bg-gray-50 ${
                      isCurrent(item.href) ? 'font-semibold' : ''
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>
    </>
  )
}
