'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Menu, X, Search as SearchIcon } from 'lucide-react'
import { productsApi } from '@/lib/api-client'
import { cartCount, readCart, subscribeToCart } from '@/lib/cart'
import AnnouncementBar from './AnnouncementBar'

type ProductSuggest = {
  id: string
  name: string
  slug: string
  image_url: string | null
  category?: string | null
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
  const searchRef = useRef<HTMLDivElement | null>(null)

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
    const onDocClick = (e: MouseEvent) => {
      if (!searchRef.current) return
      if (!searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

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
              .filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))
              .slice(0, 5)
              .map((p) => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                image_url: p.image_url,
                category: p.category,
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

  const searchResults = query.trim().length >= 2 && (
    <div className="absolute top-full right-0 mt-2 w-[min(360px,calc(100vw-2rem))] bg-white rounded-md shadow-lg border border-[#e4e6e6] max-h-72 overflow-y-auto z-50">
      {loading ? (
        <div className="p-4 text-center text-sm text-[#72787a]">Searching...</div>
      ) : results.length > 0 ? (
        results.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            onClick={() => {
              setQuery('')
              setSearchOpen(false)
            }}
          >
            <div className="relative w-10 h-10 rounded-md overflow-hidden bg-[#f1f2f2] flex-shrink-0">
              {p.image_url && <Image src={p.image_url} alt="" fill className="object-contain" sizes="40px" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#171c1e] truncate">{p.name}</p>
              {p.category && <p className="text-xs text-[#72787a] truncate">{p.category}</p>}
            </div>
          </Link>
        ))
      ) : (
        <div className="p-4 text-sm text-[#72787a]">No results for &ldquo;{query}&rdquo;.</div>
      )}
    </div>
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

          {/* Search, cart, menu */}
          <div className="flex items-center gap-4 ml-auto md:ml-8" ref={searchRef}>
            <div className="relative">
              <button
                type="button"
                onClick={() => setSearchOpen((s) => !s)}
                aria-label="Search products"
                aria-expanded={searchOpen}
                className="flex items-center p-1 hover:opacity-70 transition-opacity"
              >
                <SearchIcon className="w-5 h-5" />
              </button>

              {searchOpen && (
                <div className="absolute top-full right-0 mt-2 w-[min(360px,calc(100vw-2rem))] z-50">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                    placeholder="Search products..."
                    className="w-full border border-[#e4e6e6] rounded-md px-3 py-2 text-sm outline-none focus:border-[#171c1e]"
                  />
                  {searchResults}
                </div>
              )}
            </div>

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
