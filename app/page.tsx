'use client'

import Link from 'next/link'
import Image from 'next/image'
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

      {/* Hero Banner Section - Full Width */}
      <div className="relative w-screen ml-[calc(50%-50vw)] overflow-hidden bg-gray-100">
        <div className="relative w-full h-[200px] sm:h-[350px] md:h-[500px] lg:h-[600px] xl:h-[700px]">
          <Image
            src="/zimBanner2.png"
            alt="Zim Coolant Premium Banner"
            fill
            priority
            className="object-contain sm:object-cover sm:object-[center_25%] md:object-[center_35%] lg:object-[center_40%] xl:object-[center_45%]"
            sizes="100vw"
            quality={90}
          />
        </div>
      </div>

      {/* Featured Products Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div
            className="text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Our Premium Selection of Zim Coolant Products
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Discover our premium selection of engine oils and coolants designed for optimal performance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {loading ? (
              <p>Loading products...</p>
            ) : featuredProducts.length === 0 ? (
              <p>No featured products found.</p>
            ) : (
              featuredProducts.map((product, index) => (
                <div key={product.id} className="space-y-3 sm:space-y-4">
                  <div className="w-full h-40 sm:h-48 bg-black rounded-lg flex items-center justify-center overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="inline-block px-2 sm:px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                    {product.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-600">
                      Rs. {product.price}
                    </span>
                    <Link href={`/products/${product.id}`} className="btn-primary text-xs sm:text-sm py-2 px-3 sm:px-4 w-full sm:w-auto text-center">
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      {/* <section className="section-padding bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="container-custom">
          <div
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose Zim Coolant?
            </h2>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              We provide the highest quality automotive fluids backed by years of expertise
              and commitment to excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-primary-700" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-primary-100 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section> */}


      {/* CTA Section */}
      <section className="section-padding bg-white">
        <div className="container-custom text-center">
          <div
            className="max-w-3xl mx-auto space-y-4 sm:space-y-6 px-4"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              Ready to Experience Premium Quality?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              Join thousands of satisfied customers who trust Zim Coolant for their vehicle maintenance needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/products" className="btn-secondary text-sm sm:text-base py-3 px-6">
                Shop Now
              </Link>
              <Link href="/contact" className="btn-outline border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white text-sm sm:text-base py-3 px-6">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
