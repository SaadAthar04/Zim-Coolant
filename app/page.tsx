'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Zap, Users, Award } from 'lucide-react'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { Product } from '@/lib/supabase'

const features = [
  {
    icon: Shield,
    title: 'Premium Quality',
    description: 'Manufactured to the highest standards for optimal performance and longevity.'
  },
  {
    icon: Zap,
    title: 'Performance Boost',
    description: 'Enhanced engine efficiency and cooling system performance.'
  },
  {
    icon: Users,
    title: 'Expert Support',
    description: 'Professional technical support and guidance for all your needs.'
  },
  {
    icon: Award,
    title: 'Certified Products',
    description: 'All products meet international quality and safety standards.'
  }
]

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true)
      
      // Fetch first 4 products from database
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(4)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching featured products:', error)
        return
      }

      if (data) {
        setFeaturedProducts(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-secondary-50/50"></div>
        <div className="relative container-custom section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Premium{' '}
                <span className="text-gradient">Engine Oils</span>
                {' '}& Coolants
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Discover the perfect blend of performance and protection for your vehicle. 
                Our premium engine oils and coolants ensure optimal performance and longevity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products" className="btn-primary inline-flex items-center space-x-2">
                  <span>Explore Products</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/about" className="btn-outline">
                  Learn More
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">Z</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Premium Quality</h3>
                    <p className="text-gray-600">Engine oils and coolants that exceed industry standards</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full opacity-20 animate-bounce-gentle"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full opacity-20 animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Zim Coolant?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide the highest quality automotive fluids backed by years of expertise 
              and commitment to excellence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our premium selection of engine oils and coolants designed for optimal performance.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              <p>Loading products...</p>
            ) : featuredProducts.length === 0 ? (
              <p>No featured products found.</p>
            ) : (
              featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card group cursor-pointer"
                >
                  <div className="p-6">
                                         <div className="w-full h-48 bg-black rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                       <img 
                         src={product.image_url} 
                         alt={product.name}
                         className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                       />
                     </div>
                    <div className="space-y-3">
                      <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                        {product.category}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {product.description}
                      </p>
                                             <div className="flex items-center justify-between">
                         <span className="text-2xl font-bold text-primary-600">
                           Rs. {product.price}
                         </span>
                         <Link href={`/products/${product.id}`} className="btn-primary text-sm py-2 px-4">
                           View Details
                         </Link>
                       </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/products" className="btn-outline inline-flex items-center space-x-2">
              <span>View All Products</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <h2 className="text-4xl font-bold text-white">
              Ready to Experience Premium Quality?
            </h2>
            <p className="text-xl text-primary-100">
              Join thousands of satisfied customers who trust Zim Coolant for their vehicle maintenance needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products" className="btn-secondary">
                Shop Now
              </Link>
              <Link href="/contact" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-all duration-200">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
