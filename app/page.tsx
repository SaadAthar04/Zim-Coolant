'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Shield, Zap, Users, Award } from 'lucide-react'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { Product } from '@/lib/supabase'
import { useNavbar } from '@/lib/navbar-context'

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
  const { isMobileMenuOpen } = useNavbar()
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
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* Hero Banner Section - Full Width */}
      <div className={`relative w-full max-w-full overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'pt-48 md:pt-0' : 'pt-0'}`}>
        <div className="relative w-full overflow-hidden">
          {/* Mobile Banner - for screens less than 640px */}
          <Image
            src="/forMobile.png"
            alt="Zim Coolant Premium Banner"
            width={1920}
            height={800}
            priority
            className="object-cover sm:hidden object-[center_40%] hero-zoom"
            sizes="100vw"
            quality={90}
          />
          {/* Tablet Banner - for screens 640px to 1024px */}
          <Image
            src="/ZimBanner_3.png"
            alt="Zim Coolant Premium Banner"
            width={1920}
            height={800}
            priority
            className="hidden sm:block lg:hidden object-contain object-center hero-zoom"
            sizes="100vw"
            quality={90}
          />
          {/* Desktop Banner - for screens 1024px and above */}
          <Image
            src="/ZimBanner_3.png"
            alt="Zim Coolant Premium Banner"
            width={1920}
            height={800}
            priority
            className="hidden lg:block object-cover object-[center_25%] xl:object-[center_35%] 2xl:object-[center_45%] hero-zoom"
            sizes="100vw"
            quality={90}
          />
          <div className="absolute inset-0 bg-black/5 mix-blend-multiply"></div>
        </div>
      </div>

      {/* Featured Products Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div
            className="text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Featured Products
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Our Premium Selection of Zim Products
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {loading ? (
              <p>Loading products...</p>
            ) : featuredProducts.length === 0 ? (
              <p>No featured products found.</p>
            ) : (
              featuredProducts.map((product, index) => (
                <Link 
                  key={product.id} 
                  href={`/products/${product.slug}`}
                  className="block space-y-3 sm:space-y-4 group cursor-pointer hover:scale-105 transition-transform duration-200"
                >
                  <div className="w-full h-64 sm:h-68 md:h-72 lg:h-76 xl:h-80 rounded-lg overflow-hidden relative bg-gray-100">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover object-center group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      quality={85}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                    {/* Price hidden temporarily */}
                    {/* <span className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-600">
                      Rs. {product.price}/-
                    </span> */}
                    <span className="btn-primary text-xs sm:text-sm py-2 px-3 sm:px-4 w-full sm:w-auto text-center group-hover:bg-primary-700 transition-colors">
                      View Details
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

{/* CTA Section */}
<section className="relative section-padding bg-white overflow-hidden">
  {/* Background Image */}
  <div className="absolute inset-0 z-0">
    <Image
      src="/cta-bg.jpg" // ← update with your actual path
      alt="Zim Coolant car driving performance background"
      fill
      className="object-cover object-center brightness-[0.45] blur-[1px]"
      priority
    />
  </div>

  {/* Overlay Content */}
  <div className="relative z-10 container-custom text-center text-white">
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 px-4">
      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-bold text-white">
  Performance You Can Feel, Protection You Can Trust.
</h2>

      <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-100">
        Join thousands of satisfied customers who trust Zim for their vehicle needs.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        <Link
          href="/products"
          className="bg-white text-brand-dark font-semibold text-sm sm:text-base py-3 px-6 rounded-md shadow-md hover:bg-gray-100 transition"
        >
          Shop Now
        </Link>
        <Link
          href="/contact"
          className="border border-white text-white font-semibold text-sm sm:text-base py-3 px-6 rounded-md hover:bg-white hover:text-brand-dark transition"
        >
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
