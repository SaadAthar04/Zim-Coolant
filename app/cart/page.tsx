'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Trash2, ArrowLeft, CreditCard, Truck, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Product, supabase } from '@/lib/supabase'

export default function Cart() {
  const [mounted, setMounted] = useState(false)
  const [cartItems, setCartItems] = useState<Array<{ product: Product; quantity: number }>>([])
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout' | 'success'>('cart')
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    // Load cart data from localStorage after mounting
    if (typeof window !== 'undefined') {
      try {
        const storedCart = localStorage.getItem('cart-storage')
        if (storedCart) {
          const cartData = JSON.parse(storedCart)
          setCartItems(cartData.state?.items || [])
        }
      } catch (error) {
        console.error('Error reading cart from localStorage:', error)
      }
    }
  }, [])

  const removeItem = (productId: string) => {
    const updatedItems = cartItems.filter(item => item.product.id !== productId)
    setCartItems(updatedItems)
    // Update localStorage
    localStorage.setItem('cart-storage', JSON.stringify({ state: { items: updatedItems } }))
    // Dispatch cart update event to sync navbar
    window.dispatchEvent(new CustomEvent('cartUpdated'))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    const updatedItems = cartItems.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    )
    setCartItems(updatedItems)
    // Update localStorage
    localStorage.setItem('cart-storage', JSON.stringify({ state: { items: updatedItems } }))
    // Dispatch cart update event to sync navbar
    window.dispatchEvent(new CustomEvent('cartUpdated'))
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.setItem('cart-storage', JSON.stringify({ state: { items: [] } }))
    // Dispatch cart update event to sync navbar
    window.dispatchEvent(new CustomEvent('cartUpdated'))
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  }

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId)
      toast.success('Item removed from cart')
    } else {
      updateQuantity(productId, newQuantity)
    }
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0 || isCheckingOut) return
    
    // Validate customer details
    if (!customerDetails.name || !customerDetails.email) {
      toast.error('Please fill in your name and email')
      return
    }
    
    setIsCheckingOut(true)
    
    try {
      // Calculate order totals
      const subtotal = getTotalPrice()
      const shippingCost = subtotal > 50 ? 0 : 10 // Free shipping over Rs. 50
      const taxAmount = subtotal * 0.15 // 15% tax
      const totalAmount = subtotal + shippingCost + taxAmount
      
      // Prepare order data
      const orderData = {
        customer_name: customerDetails.name,
        customer_email: customerDetails.email,
        customer_phone: customerDetails.phone || null,
        shipping_address: customerDetails.address || null,
        items: cartItems.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        })),
        subtotal: subtotal,
        shipping_cost: shippingCost,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        status: 'pending',
        payment_status: 'pending'
      }
      
      // Save order to database
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      // Show success state
      setOrderId(data.id)
      setCheckoutSuccess(true)
      toast.success('Order placed successfully!')
      
      // Clear cart and show success page
      clearCart()
      setCheckoutStep('success')
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setCheckoutSuccess(false)
      }, 3000)
      
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Checkout failed. Please try again.')
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (checkoutStep === 'success') {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container-custom py-32">
          <div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center"
          >
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-8" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Thank You for Your Order!
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Your order has been placed successfully. We'll send you a confirmation email with order details.
            </p>
            {orderId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-8">
                <p className="text-sm text-gray-600 mb-1">Order ID:</p>
                <p className="text-lg font-mono font-semibold text-gray-900">{orderId}</p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products" className="btn-primary">
                Continue Shopping
              </Link>
              <Link href="/" className="btn-outline">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!mounted || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container-custom py-32">
          <div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <ShoppingCart className="w-24 h-24 text-gray-400 mx-auto mb-8" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link href="/products" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-primary pt-32 pb-16">
        <div className="container-custom">
          <div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Shopping <span className="text-gradient">Cart</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Review your items and proceed to checkout
            </p>
          </div>
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Cart Items ({cartItems.length})
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    {cartItems.map((item, index) => (
                      <div
                        key={item.product.id}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                      >
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-black rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          <img 
                            src={item.product.image_url} 
                            alt={item.product.name}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {item.product.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-lg font-bold text-brand-bright">
                              Rs. {item.product.price}
                            </span>
                            <span className="text-sm text-gray-500">
                              Stock: {item.product.stock_quantity}
                            </span>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock_quantity}
                            className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>

                        {/* Total Price */}
                        <div className="text-right min-w-[80px]">
                          <div className="text-lg font-bold text-gray-900">
                            Rs. {(item.product.price * item.quantity).toFixed(2)}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleQuantityChange(item.product.id, 0)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>Rs. {getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>Rs. {(getTotalPrice() * 0.15).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>Total</span>
                      <span>Rs. {(getTotalPrice() * 1.15).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Form */}
                {checkoutStep === 'checkout' && (
                  <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={customerDetails.name}
                          onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-bright focus:border-transparent"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={customerDetails.email}
                          onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-bright focus:border-transparent"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={customerDetails.phone}
                          onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-bright focus:border-transparent"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Shipping Address
                        </label>
                        <textarea
                          value={customerDetails.address}
                          onChange={(e) => setCustomerDetails(prev => ({ ...prev, address: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-bright focus:border-transparent"
                          placeholder="Enter your shipping address"
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={() => setCheckoutStep('cart')}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Back to Cart
                      </button>
                    </div>
                  </div>
                )}

                {checkoutStep === 'cart' ? (
                  <button
                    onClick={() => setCheckoutStep('checkout')}
                    disabled={cartItems.length === 0}
                    className={`w-full min-h-[48px] flex items-center justify-center space-x-2 transition-all duration-300 ${
                      cartItems.length === 0
                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                        : 'btn-primary'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="whitespace-nowrap">
                      {cartItems.length === 0 ? 'Cart is Empty' : 'Proceed to Checkout'}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className={`w-full min-h-[48px] flex items-center justify-center space-x-2 transition-all duration-300 ${
                      checkoutSuccess 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : isCheckingOut 
                          ? 'bg-gray-400 cursor-not-allowed text-white' 
                          : 'btn-primary'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isCheckingOut ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span className="whitespace-nowrap">Processing Order...</span>
                      </>
                    ) : checkoutSuccess ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span className="whitespace-nowrap">Order Placed!</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        <span className="whitespace-nowrap">Place Order</span>
                      </>
                    )}
                  </button>
                )}

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Truck className="w-5 h-5 text-brand-bright" />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">Free Shipping</p>
                      <p className="text-gray-600">Orders over Rs. 50</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">Secure Checkout</p>
                      <p className="text-gray-600">SSL encrypted</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Continue Shopping */}
          <div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link href="/products" className="btn-outline inline-flex items-center space-x-2">
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
