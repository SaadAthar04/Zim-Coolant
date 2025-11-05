'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, Truck, Shield, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Product, supabase } from '@/lib/supabase'

export default function ProductDetail() {
  const params = useParams()
  const productSlugParam = params.slug as string
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedColor, setSelectedColor] = useState<'green' | 'red'>('green')
  const [loading, setLoading] = useState(true)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [relatedLoading, setRelatedLoading] = useState(false)

  // WhatsApp contact link
  const whatsappNumber = '923331632138' // +92 333-1632138 formatted for WhatsApp
  const whatsappUrl = `https://wa.me/${whatsappNumber}`

  useEffect(() => {
    fetchProduct()
  }, [productSlugParam])

  useEffect(() => {
    if (product) {
      fetchRelatedProducts()
      setSelectedColor('green') // Reset to green when product changes
    }
  }, [product])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      
      // Fetch product directly by slug
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', productSlugParam)
        .single()
      
      if (error) {
        return
      }

      if (data) {
        setProduct(data)
      }
    } catch {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedProducts = async () => {
    if (!product) return
    
    try {
      setRelatedLoading(true)
      
      // Fetch products from the same category, excluding the current product
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', product.category)
        .neq('id', product.id)
        .limit(4)
        .order('created_at', { ascending: false })
      
      if (error) {
        return
      }

      if (data) {
        setRelatedProducts(data)
      }
    } catch {
      // Error handled silently
    } finally {
      setRelatedLoading(false)
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


  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Product Details */}
      <section className="pt-28 sm:pt-32 md:pt-36 pb-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="w-full h-[500px] lg:h-[600px] rounded-2xl overflow-hidden relative bg-gray-100">
                <Image
                  src={selectedColor === 'green' ? product.image_url : (product.red_image_url || product.image_url)}
                  alt={product.name}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  quality={90}
                  priority
                  key={selectedColor}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
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
              </div>

              {/* Product Name and Price */}
              <div className="space-y-4">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                  {product.name}
                </h1>
                <div className="flex items-baseline space-x-4">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-600">
                    Rs. {product.price}/-
                  </span>
                </div>
                
                {/* Color Selection - Show only if product has red_image_url */}
                {product.red_image_url && (
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-medium text-gray-600">Color:</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedColor('green')}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                          selectedColor === 'green'
                            ? 'border-primary-600 ring-1 ring-primary-200'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: '#22c55e' }}
                        aria-label="Select green color"
                      />
                      <button
                        onClick={() => setSelectedColor('red')}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                          selectedColor === 'red'
                            ? 'border-primary-600 ring-1 ring-primary-200'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: '#ef4444' }}
                        aria-label="Select red color"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <div 
                  className="text-gray-600 leading-relaxed whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: product.description || '' }}
                />
              </div>

              {/* Directions for Use */}
              {product.directionsForUse && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Directions for Use</h3>
                  <div 
                    className="text-gray-600 leading-relaxed whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: product.directionsForUse || '' }}
                  />
                </div>
              )}

              {/* Contact Button (WhatsApp) */}
              <div className="space-y-6">
                {/* Contact Button - Links to WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[48px] flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300 font-medium"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="whitespace-nowrap">Contact via WhatsApp</span>
                </a>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <Truck className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Free shipping above Rs. 1,499</p>
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
      {!relatedLoading && relatedProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Related Products
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600">
                You might also be interested in these {product?.category} products
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card group cursor-pointer"
                >
                  <Link href={`/products/${relatedProduct.slug}`}>
                    <div className="p-6">
                      <div className="w-full h-48 rounded-lg mb-4 overflow-hidden relative bg-gray-100">
                        <Image
                          src={relatedProduct.image_url}
                          alt={relatedProduct.name}
                          fill
                          className="object-cover object-center group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          quality={85}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
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
                            Rs. {relatedProduct.price}/-
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

