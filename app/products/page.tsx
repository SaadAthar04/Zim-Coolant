'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Grid3X3, List, ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { Product } from '@/lib/supabase'

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetchProducts()
    // Reset category filter to "All Categories" when page loads
    setSelectedCategory('all')
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true })
      
      if (error) {
        console.error('Error fetching products:', error)
        return
      }

      if (data) {
        setProducts(data)
        setFilteredProducts(data)
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(data.map(product => product.category)))
        setCategories(uniqueCategories)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = products

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // Sort products
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
      <section className="bg-gradient-primary">
        <div className="container-custom section-padding">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Our <span className="text-gradient">Products</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Discover our premium selection of engine oils and coolants designed for optimal performance 
              and protection of your vehicle.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter and Search Section */}
      <section className="section-padding bg-white border-b">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          {/* Results Count */}
          <div className="mb-8">
            <p className="text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>

          {/* Products Grid/List */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms or filters.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                  setSortBy('name')
                }}
                className="btn-primary"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'
              : 'space-y-6'
            }>
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={viewMode === 'grid' ? 'card group cursor-pointer' : 'card group cursor-pointer flex'}
                >
                  {viewMode === 'grid' ? (
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
                  ) : (
                    <>
                                                                     <div className="w-32 h-32 bg-black rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full mb-3">
                              {product.category}
                            </span>
                            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                              {product.name}
                            </h3>
                            <p className="text-gray-600 mb-4">
                              {product.description}
                            </p>
                            <div className="flex items-center gap-4">
                              <span className="text-2xl font-bold text-primary-600">
                                Rs. {product.price}
                              </span>
                              <span className="text-sm text-gray-500">
                                Stock: {product.stock_quantity}
                              </span>
                            </div>
                          </div>
                          <Link href={`/products/${product.id}`} className="btn-primary">
                            View Details
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
