'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Menu, X } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [cartItems, setCartItems] = useState(0)

  const updateCartCount = () => {
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
        } else {
          setCartItems(0)
        }
      } catch (error) {
        console.error('Error reading cart from localStorage:', error)
        setCartItems(0)
      }
    }
  }

  useEffect(() => {
    setMounted(true)
    updateCartCount()

    // Listen for cart updates from other components
    const handleCartUpdate = () => {
      updateCartCount()
    }

    // Listen for custom cart update events
    window.addEventListener('cartUpdated', handleCartUpdate)
    
    // Listen for storage changes (when cart is updated in other tabs)
    window.addEventListener('storage', (e) => {
      if (e.key === 'cart-storage') {
        updateCartCount()
      }
    })

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
      window.removeEventListener('storage', updateCartCount)
    }
  }, [])

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Products', href: '/products' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary-600 to-primary-700 shadow-xl border-b border-primary-800/20 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center h-10">
          {/* Desktop Navigation - Left */}
          <div className="hidden md:flex items-center ml-8 space-x-3 flex-1 justify-start">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:text-primary-100 transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>
          {/* Logo - Center */}
          <div className="flex justify-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Zim Coolant Logo"
                width={88}
                height={88}
                className="w-[92px] h-[90px] object-contain scale-150"
              />
            </Link>
          </div>

          {/* Cart + Mobile Menu Button - Right */}
          <div className="flex items-center space-x-4 flex-1 justify-end">
            <Link href="/cart" className="relative">
              <ShoppingCart className="w-6 h-6 text-white hover:text-primary-100 transition-colors" />
              {mounted && cartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-primary-600 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                  {cartItems}
                </span>
              )}
            </Link>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-md text-white hover:text-primary-100 hover:bg-primary-800/20 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-primary-800/20 mt-4">
            <div className="py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-2 text-white hover:bg-primary-800/20 hover:text-primary-100 transition-colors"
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