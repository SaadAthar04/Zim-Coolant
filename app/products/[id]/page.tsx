'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Star, Truck, Shield, ArrowLeft, Minus, Plus } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Product, supabase } from '@/lib/supabase'

export default function ProductDetail() {
  const params = useParams()
  const productId = params.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      console.log('Fetching product with ID:', productId)
      
      // First try to fetch by ID
      let { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      // If no product found by ID, try to fetch by name (fallback)
      if (error && error.code === 'PGRST116') {
        console.log('Product not found by ID, trying to fetch all products...')
        const { data: allProducts, error: allError } = await supabase
          .from('products')
          .select('*')
        
        if (!allError && allProducts) {
          console.log('All products:', allProducts)
          // Try to find by name or description
          const foundProduct = allProducts.find(p => 
            p.name.toLowerCase().includes(productId.toLowerCase()) ||
            p.description.toLowerCase().includes(productId.toLowerCase())
          )
          if (foundProduct) {
            console.log('Product found by search:', foundProduct)
            setProduct(foundProduct)
            setLoading(false)
            return
          }
        }
      }

      if (error) {
        console.error('Error fetching product:', error)
        return
      }

      if (data) {
        console.log('Product found:', data)
        setProduct(data)
      } else {
        console.log('No product found with ID:', productId)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (product && mounted) {
      try {
        // Access cart store only after mounting
        const storedCart = localStorage.getItem('cart-storage')
        let cartData: { state: { items: Array<{ product: Product; quantity: number }> } } = { state: { items: [] } }
        
        if (storedCart) {
          cartData = JSON.parse(storedCart)
        }
        
        // Check if product already exists in cart
        const existingItemIndex = cartData.state.items.findIndex((item) => item.product.id === product.id)
        
        if (existingItemIndex >= 0) {
          // Update existing item quantity
          cartData.state.items[existingItemIndex].quantity += quantity
        } else {
          // Add new item
          cartData.state.items.push({ product, quantity })
        }
        
        // Save back to localStorage
        localStorage.setItem('cart-storage', JSON.stringify(cartData))
        toast.success(`${quantity} ${product.name} added to cart!`)
      } catch (error) {
        console.error('Error adding to cart:', error)
        toast.error('Failed to add to cart')
      }
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock_quantity || 1)) {
      setQuantity(newQuantity)
    }
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

  // For now, we'll show an empty related products section
  // In a real app, you'd fetch related products from Supabase
  const relatedProducts: Product[] = []

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Breadcrumb */}
      <section className="pt-32 pb-8 bg-gray-50">
        <div className="container-custom">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-primary-600 transition-colors">
              Products
            </Link>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>
      </section>

      {/* Product Details */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="w-full h-96 bg-black rounded-2xl flex items-center justify-center overflow-hidden">
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Thumbnail Images */}
              <div className="flex space-x-4">
                {[1, 2, 3, 4].map((index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index - 1)}
                    className={`w-20 h-20 rounded-lg border-2 transition-colors ${
                      selectedImage === index - 1
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-gray-500 text-xs">Img {index}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Category and Rating */}
              <div className="space-y-4">
                <span className="inline-block px-4 py-2 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                  {product.category}
                </span>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm">(24 reviews)</span>
                </div>
              </div>

              {/* Product Name and Price */}
              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-gray-900">
                  {product.name}
                </h1>
                <div className="flex items-baseline space-x-4">
                  <span className="text-4xl font-bold text-primary-600">
                    Rs. {product.price}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    Rs. {(product.price * 1.2).toFixed(2)}
                  </span>
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                    Save 20%
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Specifications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
                <p className="text-gray-600">
                  {product.specifications}
                </p>
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${product.stock_quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600">
                    {product.stock_quantity > 0 ? `${product.stock_quantity} units in stock` : 'Out of stock'}
                  </span>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">Quantity:</label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock_quantity}
                      className="p-2 hover:bg-gray-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0 || !mounted}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>
                    {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </span>
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <Truck className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Free Shipping</p>
                </div>
                <div className="text-center">
                  <Shield className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Quality Guaranteed</p>
                </div>
                <div className="text-center">
                  <Star className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Premium Grade</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Related Products
              </h2>
              <p className="text-xl text-gray-600">
                You might also be interested in these products
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProducts.map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card group cursor-pointer"
                >
                  <Link href={`/products/${relatedProduct.id}`}>
                    <div className="p-6">
                      <div className="w-full h-48 bg-black rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                        <img 
                          src={relatedProduct.image_url} 
                          alt={relatedProduct.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="space-y-3">
                        <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                          {relatedProduct.category}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {relatedProduct.name}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {relatedProduct.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary-600">
                            Rs. {relatedProduct.price}
                          </span>
                          <span className="text-sm text-gray-500">
                            Stock: {relatedProduct.stock_quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
