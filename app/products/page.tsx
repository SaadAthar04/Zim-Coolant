"use client"

import { useState, useEffect } from 'react'
import { Search, Filter, Grid3X3, List, ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { Product } from '@/lib/supabase'

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState('name')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [categories] = useState<string[]>(['Coolant', 'ATF', 'Gear Oil'])

  // Reset filters function
  const resetAllFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSortBy('name')
    setViewMode('grid')
  }

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching products:', error)
          setProducts([])
          setFilteredProducts([])
        } else {
          setProducts(data || [])
          setFilteredProducts(data || [])
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...products]

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory)
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'category':
          return a.category.localeCompare(b.category)
        default:
          return 0
      }
    })

    setFilteredProducts(filtered)
  }, [products, searchTerm, selectedCategory, sortBy])

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading products...</p>
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
      <section className="bg-gradient-primary pt-16">
        <div className="container-custom section-padding text-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Our <span className="text-gradient">Products</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our premium selection of engine oils and coolants designed
            for optimal performance and protection of your vehicle.
          </p>
        </div>
      </section>

      {/* Filters + Search */}
      <section className="section-padding bg-white border-b">
        <div className="container-custom flex flex-col lg:flex-row gap-6 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="category">Sort by Category</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 ${viewMode === 'grid'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 ${viewMode === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Reset Button */}
            <button
              onClick={resetAllFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-primary-600 border border-gray-300 rounded-lg hover:border-primary-300 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <p className="text-gray-600 mb-6">
            Showing {filteredProducts.length} of {products.length} products
          </p>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                No products found
              </h3>
              <button onClick={resetAllFilters} className="btn-primary animate-pulse-green">
                Clear All Filters
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8'
                  : 'space-y-6'
              }
            >
              {filteredProducts.map((product, i) => (
                <Link 
                  key={product.id} 
                  href={`/products/${product.id}`}
                  className={`block group cursor-pointer hover:scale-105 transition-transform duration-200 ${
                    viewMode === 'list' ? 'flex space-x-4' : 'space-y-3 sm:space-y-4'
                  }`}
                >
                  {/* Grid View */}
                  {viewMode === 'grid' ? (
                    <>
                      <div className="w-full h-64 sm:h-68 md:h-72 lg:h-76 xl:h-80 rounded-lg overflow-hidden relative bg-gray-100">
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover object-center group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          quality={85}
                          onError={(e) => {
                            console.error('Image failed to load:', product.image_url);
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
                        <span className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-600">
                          Rs. {product.price}
                        </span>
                        <span className="btn-primary text-xs sm:text-sm py-2 px-3 sm:px-4 w-full sm:w-auto text-center group-hover:bg-primary-700 transition-colors">
                          View Details
                        </span>
                      </div>
                    </>
                  ) : (
                    // List View
                    <>
                      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-lg overflow-hidden relative bg-gray-100 flex-shrink-0">
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover object-center group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 640px) 128px, 160px"
                          quality={85}
                          onError={(e) => {
                            console.error('Image failed to load:', product.image_url);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                          <span className="text-xl sm:text-2xl font-bold text-primary-600">
                            Rs. {product.price}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500">
                            Stock: {product.stock_quantity}
                          </span>
                        </div>
                        <span className="btn-primary text-xs sm:text-sm py-2 px-3 sm:px-4 mt-4 inline-block group-hover:bg-primary-700 transition-colors">
                          View Details
                        </span>
                      </div>
                    </>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
