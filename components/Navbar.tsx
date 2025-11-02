'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Menu, X, Search as SearchIcon, MessageCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type ProductSuggest = {
  id: string
  name: string
  image_url: string | null
  description?: string | null
  category?: string | null
}

const NAV_ITEMS = [
  { name: 'HOME', href: '/' },
  { name: 'ABOUT', href: '/about' },
  { name: 'PRODUCTS', href: '/products' },
  { name: 'CONTACT / BULK ORDERS', href: '/contact' },
]

export default function Navbar() {
  // cart badge (desktop) - COMMENTED OUT FOR NOW
  // const [mounted, setMounted] = useState(false)
  // const [cartItems, setCartItems] = useState(0)

  // mobile toggles
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // search state (mobile live search + desktop can reuse later)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ProductSuggest[]>([])
  const searchRef = useRef<HTMLDivElement | null>(null)

  // WhatsApp contact link
  const whatsappNumber = '923331632138' // +92 333-1632138 formatted for WhatsApp
  const whatsappUrl = `https://wa.me/${whatsappNumber}`

  // ── cart count from localStorage - COMMENTED OUT FOR NOW
  // useEffect(() => {
  //   setMounted(true)
  //   const update = () => {
  //     try {
  //       const stored = localStorage.getItem('cart-storage')
  //       if (!stored) return setCartItems(0)
  //       const data = JSON.parse(stored)
  //       const total =
  //         data.state?.items?.reduce(
  //           (sum: number, it: any) => sum + (it.quantity || 0),
  //           0
  //         ) || 0
  //       setCartItems(total)
  //     } catch {
  //       setCartItems(0)
  //     }
  //   }
  //   update()
  //   const onCartUpdated = () => update()
  //   window.addEventListener('cartUpdated', onCartUpdated)
  //   window.addEventListener('storage', (e) => {
  //     if (e.key === 'cart-storage') update()
  //   })
  //   return () => {
  //     window.removeEventListener('cartUpdated', onCartUpdated)
  //     window.removeEventListener('storage', update as any)
  //   }
  // }, [])

  // ── mobile: click outside to close search dropdown
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!searchRef.current) return
      if (!searchRef.current.contains(e.target as Node)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  // ── mobile: debounced live search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    const h = setTimeout(async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id,name,image_url,description,category')
        .ilike('name', `%${query.trim()}%`)
        .limit(5)
      if (!active) return
      setResults((!error && (data as ProductSuggest[])) || [])
      setLoading(false)
    }, 250)
    return () => {
      active = false
      clearTimeout(h)
    }
  }, [query])

  return (
    <header
      className="absolute top-0 left-0 w-full z-50 shadow-md"
      style={{ backgroundColor: '#025b00' }}
    >
      {/* ───────────────── Desktop header (unchanged layout) */}
      <div className="hidden md:grid grid-cols-3 items-center gap-2 px-6 lg:px-16 py-2">
        {/* Left: (placeholder search — keep or wire later) */}
        <div className="justify-self-start w-full max-w-sm">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              placeholder="Search products..."
              className="w-full bg-white text-gray-900 rounded-full pl-9 pr-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-green-500/70"
            />
          </div>
        </div>

        {/* Center: Logo */}
        <div className="justify-self-center">
          <Link href="/" className="block">
            <Image
              src="/logo.png"
              alt="Zim Coolant Logo"
              width={160}
              height={80}
              className="object-contain w-20 lg:w-36 h-auto"
              priority
            />
          </Link>
        </div>

        {/* Right: Contact Button (WhatsApp) */}
        <div className="justify-self-end">
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors font-medium text-sm"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Contact</span>
          </a>
        </div>

        {/* Right: Cart - COMMENTED OUT FOR NOW */}
        {/* <div className="justify-self-end">
          <Link href="/cart" className="relative inline-flex">
            <ShoppingCart className="w-6 h-6 text-white hover:text-green-100 transition-colors" />
            {mounted && cartItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-green-700 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow">
                {cartItems}
              </span>
            )}
          </Link>
        </div> */}
      </div>

      {/* Inline nav (desktop) */}
      <div className="hidden md:block">
        <nav className="flex items-center justify-center gap-6 py-2 px-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-white/90 hover:text-white transition-colors font-medium text-sm tracking-wide"
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* ───────────────── Mobile header */}
      <div className="md:hidden px-4 py-2">
        {/* Top row: search toggle • logo • burger */}
        <div className="grid grid-cols-3 items-center">
          {/* Left: search icon */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false)
              setSearchOpen((s) => !s)
            }}
            className="justify-self-start text-white"
            aria-label="Open search"
          >
            <SearchIcon className="w-6 h-6" />
          </button>

          {/* Center: logo */}
          <div className="justify-self-center">
            <Link href="/" className="block">
              <Image
                src="/logo.png"
                alt="Zim Coolant Logo"
                width={140}
                height={70}
                className="object-contain w-28 h-auto"
                priority
              />
            </Link>
          </div>

          {/* Right: hamburger */}
          <button
            onClick={() => {
              setSearchOpen(false)
              setIsMobileMenuOpen((o) => !o)
            }}
            className="justify-self-end text-white"
            aria-label="Open menu"
          >
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>

        {/* Slide-down search */}
        {searchOpen && (
          <div ref={searchRef} className="mt-2 bg-white rounded-md p-3 shadow-lg animate-slide-down">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                placeholder="Search products..."
                className="w-full rounded-md border border-gray-300 pl-9 pr-8 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
              {loading && (
  <div
    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-[2px] border-green-400 border-t-transparent rounded-full animate-spin z-20"
    style={{
      display: 'block',
      pointerEvents: 'none',
    }}
  ></div>
)}


            </div>

            {/* results */}
            {results.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-md overflow-hidden max-h-64 overflow-y-auto">
                {results.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="flex items-center gap-3 px-3 py-2 bg-white hover:bg-gray-50 transition-colors"
                    onClick={() => setSearchOpen(false)}
                  >
                    <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                      {p.image_url ? (
                        <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                      {p.category && (
                        <p className="text-xs text-gray-500 truncate">{p.category}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!loading && query.trim().length >= 2 && results.length === 0 && (
              <div className="mt-2 text-sm text-gray-600">No results for “{query}”.</div>
            )}
          </div>
        )}

        {/* Slide-down mobile menu */}
        {isMobileMenuOpen && (
          <div className="mt-2 rounded-md overflow-hidden shadow-lg animate-slide-down" style={{ backgroundColor: '#014a00' }}>
            <nav>
              <ul className="flex flex-col text-white text-sm font-medium">
                {NAV_ITEMS.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="block px-5 py-3 hover:bg-green-900/60 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
