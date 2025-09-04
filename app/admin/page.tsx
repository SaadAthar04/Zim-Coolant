'use client'

import { useState, useEffect } from 'react'
// import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  IndianRupee, 
  ShoppingCart,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Calendar,
  Download,
  LogOut
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { checkAdminAuth, logoutAdmin } from '@/lib/auth'
import { useRouter } from 'next/navigation'

// Types for admin dashboard data
interface DashboardStats {
  title: string
  value: string
  change: string
  icon: any
  color: string
}

interface Order {
  id: string
  customer: string
  product: string
  amount: number
  status: string
  date: string
}

interface TopProduct {
  name: string
  sales: number
  revenue: number
  stock_quantity: number
}

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState<DashboardStats[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  // Check authentication on component mount
  useEffect(() => {
    const authCheck = checkAdminAuth()
    if (!authCheck) {
      router.push('/admin/login')
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  const handleLogout = () => {
    logoutAdmin()
    router.push('/admin/login')
  }

  // Fetch dashboard data from Supabase
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch products count
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })

        // Fetch orders count (if orders table exists)
        const { count: ordersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })

        // Calculate total sales from orders
        const { data: allOrders } = await supabase
          .from('orders')
          .select('total_amount')

        const totalSales = allOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

        // Calculate stats
        const dashboardStats: DashboardStats[] = [
          { 
            title: 'Total Sales', 
            value: `Rs. ${totalSales.toFixed(2)}`, 
            change: '+0%', 
            icon: IndianRupee, 
            color: 'text-green-600' 
          },
          { 
            title: 'Orders', 
            value: ordersCount?.toString() || '0', 
            change: '+0%', 
            icon: ShoppingCart, 
            color: 'text-blue-600' 
          },
          { 
            title: 'Customers', 
            value: allOrders?.length?.toString() || '0', 
            change: '+0%', 
            icon: Users, 
            color: 'text-purple-600' 
          },
          { 
            title: 'Products', 
            value: productsCount?.toString() || '0', 
            change: '+0%', 
            icon: Package, 
            color: 'text-orange-600' 
          }
        ]

        setStats(dashboardStats)

        // Fetch recent orders (if orders table exists)
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)

        if (ordersData) {
          const orders: Order[] = ordersData.map(order => ({
            id: order.id,
            customer: order.customer_name || 'Unknown',
            product: order.product_name || 'Unknown Product',
            amount: order.total_amount || 0,
            status: order.status || 'pending',
            date: new Date(order.created_at).toISOString().split('T')[0]
          }))
          setRecentOrders(orders)
        }

        // Fetch top products with real sales data
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4)

        if (productsData) {
          // Calculate real sales data from orders
          const topProductsData: TopProduct[] = await Promise.all(
            productsData.map(async (product) => {
              // Get orders that contain this product
              const { data: orderItems } = await supabase
                .from('orders')
                .select('items, total_amount')
                .contains('items', [{ id: product.id }])

              let totalSales = 0
              let totalRevenue = 0

              if (orderItems) {
                orderItems.forEach(order => {
                  // Find the specific item in the order
                  const item = order.items.find((item: any) => item.id === product.id)
                  if (item) {
                    totalSales += item.quantity || 0
                    totalRevenue += (item.quantity || 0) * item.price
                  }
                })
              }

              return {
                name: product.name,
                sales: totalSales,
                revenue: totalRevenue,
                stock_quantity: product.stock_quantity || 0
              }
            })
          )
          setTopProducts(topProductsData)
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        // Set empty data on error
        setStats([])
        setRecentOrders([])
        setTopProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  // Show loading or redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-bright border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-primary pt-32 pb-16">
        <div className="container-custom">
          <div className="flex justify-between items-start mb-8">
            <div></div>
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            )}
          </div>
          <div
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Admin <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Monitor your business performance, manage orders, and track sales analytics
            </p>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="card p-6 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  </div>
                  <div className="mt-4">
                    <div className="w-20 h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="w-16 h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))
            ) : (
              stats.map((stat, index) => (
              <div
                key={stat.title}
                className="card p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                  </div>
                  <div className={`w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      </section>

      {/* Charts and Analytics */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sales Chart */}
            <div
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Sales Overview</h3>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-bright focus:border-transparent"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
              
              <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Sales Chart</p>
                  <p className="text-gray-400 text-sm">Interactive chart showing sales trends</p>
                </div>
              </div>
            </div>

            {/* Top Products */}
            <div
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Top Products</h3>
                <button className="text-brand-bright hover:text-brand-dark text-sm font-medium">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.sales} sales</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">Rs. {product.revenue}</p>
                      <p className="text-sm text-gray-600">Stock: {product.stock_quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Orders */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div
            className="card p-6"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 sm:mb-0">Recent Orders</h3>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-bright focus:border-transparent"
                  />
                </div>
                <button className="btn-primary text-sm py-2 px-4">
                  <Plus className="w-4 h-4 mr-2" />
                  New Order
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Order ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, index) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">{order.id}</td>
                      <td className="py-3 px-4 text-gray-600">{order.customer}</td>
                      <td className="py-3 px-4 text-gray-600">{order.product}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">Rs. {order.amount}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{order.date}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <p className="text-xl text-gray-600">
              Manage your business operations efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Add Product', icon: Plus, color: 'bg-blue-500', description: 'Create new product listings' },
              { title: 'View Orders', icon: ShoppingCart, color: 'bg-green-500', description: 'Manage customer orders' },
              { title: 'Analytics', icon: TrendingUp, color: 'bg-purple-500', description: 'View detailed reports' },
              { title: 'Export Data', icon: Download, color: 'bg-orange-500', description: 'Download business data' }
            ].map((action, index) => (
              <div
                key={action.title}
                className="card p-6 text-center cursor-pointer hover:shadow-xl transition-shadow group"
              >
                <div className={`w-16 h-16 ${action.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {action.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
