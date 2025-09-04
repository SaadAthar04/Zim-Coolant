'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart, Menu, X } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [cartItems, setCartItems] = useState(0)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      try {
        const storedCart = localStorage.getItem('cart-storage')
        if (storedCart) {
          const cartData = JSON.parse(storedCart)
          const total =
            cartData.state?.items?.reduce(
              (sum: number, item: any) => sum + (item.quantity || 0),
              0
            ) || 0
          setCartItems(total)
        }
      } catch (error) {
        console.error('Error reading cart from localStorage:', error)
      }
    }
  }, [])

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Products', href: '/products' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-bright to-brand-dark rounded-lg flex items-center justify-center shadow-glow">
              <span className="text-white font-bold text-xl">Z</span>
            </div>
            <span className="text-xl font-bold navbar-brand">Zim Coolant</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-brand-bright transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Cart + Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <Link href="/cart" className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-brand-bright transition-colors" />
              {mounted && cartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-bright text-brand-dark text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-glow">
                  {cartItems}
                </span>
              )}
            </Link>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-brand-bright hover:bg-brand-light transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-2 text-gray-700 hover:bg-brand-light hover:text-brand-bright transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}