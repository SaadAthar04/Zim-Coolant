'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useNavbar } from '@/lib/navbar-context'

export default function Navbar() {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useNavbar()
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
    { name: 'HOME', href: '/' },
    { name: 'ABOUT', href: '/about' },
    { name: 'PRODUCTS', href: '/products' },
    { name: 'CONTACT / BULK ORDERS', href: '/contact' },
  ]

  return (
    <nav className="relative md:fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary-600 to-primary-700 shadow-xl border-b border-primary-800/20 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18 lg:h-20">
          {/* Mobile Logo */}
          <div className="flex items-center md:hidden">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Zim Coolant Logo"
                width={60}
                height={60}
                sizes="60px"
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
              />
            </Link>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between w-full">
            {/* Desktop Logo - Left */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="Zim Coolant Logo"
                  width={200}
                  height={200}
                  sizes="(max-width: 1024px) 100px, 120px"
                  className="w-[80px] h-[80px] lg:w-[100px] lg:h-[100px] xl:w-[120px] xl:h-[120px] object-contain"
                />
              </Link>
            </div>

            {/* Desktop Navigation - Center */}
            <div className="flex items-center space-x-6 lg:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-white hover:text-primary-100 transition-colors font-medium text-sm lg:text-base tracking-wide"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right Side - Cart, Trademark */}
            <div className="flex items-center space-x-4 lg:space-x-6">
              <Link href="/cart" className="relative">
                <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6 text-white hover:text-primary-100 transition-colors" />
                {mounted && cartItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-primary-600 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                    {cartItems}
                  </span>
                )}
              </Link>

              {/* Trademark Icon */}
              <Image
                src="/trademark.png"
                alt="Trademark"
                width={80}
                height={80}
                sizes="(max-width: 1024px) 50px, 60px"
                className="w-10 h-10 lg:w-12 lg:h-12 object-contain"
              />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            <Link href="/cart" className="relative">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white hover:text-primary-100 transition-colors" />
              {mounted && cartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-primary-600 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                  {cartItems}
                </span>
              )}
            </Link>

            {/* Trademark Icon */}
            <Image
              src="/trademark.png"
              alt="Trademark"
              width={60}
              height={60}
              sizes="50px"
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            />

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-white hover:text-primary-100 hover:bg-primary-800/20 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-gradient-to-r from-primary-600 to-primary-700 border-t border-primary-800/20 shadow-lg">
            <div className="py-3 sm:py-4 space-y-1 sm:space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 sm:px-4 py-2 sm:py-3 text-white hover:bg-primary-800/20 hover:text-primary-100 transition-colors text-sm sm:text-base tracking-wide"
                  onClick={() => setIsMobileMenuOpen(false)}
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