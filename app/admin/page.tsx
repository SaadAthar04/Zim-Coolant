'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Calendar,
  Download,
  LogOut,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { checkAdminAuth, logoutAdmin } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

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
  customer_name: string
  customer_email: string
  customer_phone?: string
  shipping_address?: string
  items: Array<{
    product_id: string
    product_name: string
    quantity: number
    price: number
  }>
  subtotal: number
  shipping_cost: number
  tax_amount: number
  total_amount: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'failed'
  created_at: string
  updated_at: string
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [chartData, setChartData] = useState<any[]>([])
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()

      if (error) {
        toast.error(`Failed to update order status: ${error.message}`)
        return
      }

      if (!data || data.length === 0) {
        toast.error('Failed to update order - no rows affected')
        return
      }

      // Update local state
      setRecentOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus as any, updated_at: new Date().toISOString() }
            : order
        )
      )

      // Update selected order if it's the same
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus as any, updated_at: new Date().toISOString() } : null)
      }

      // Show success toast
      const statusMessages = {
        'confirmed': 'Order confirmed successfully! ✅',
        'completed': 'Order marked as completed! 🎉',
        'cancelled': 'Order cancelled! ❌',
        'pending': 'Order status reset to pending! ⏳'
      }
      
      toast.success(statusMessages[newStatus as keyof typeof statusMessages] || `Order status updated to ${newStatus}!`, {
        duration: 3000,
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: '500',
        },
      })

      // Refresh dashboard data to update sales analytics
      if (newStatus === 'confirmed' || newStatus === 'completed') {
        // Small delay to ensure database has processed the update
        setTimeout(() => {
          fetchDashboardData()
        }, 500)
      }

    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error(`Failed to update order status: ${error}`)
    }
  }

  const updatePaymentStatus = async (orderId: string, newPaymentStatus: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          payment_status: newPaymentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()

      if (error) {
        toast.error(`Failed to update payment status: ${error.message}`)
        return
      }

      if (!data || data.length === 0) {
        toast.error('Failed to update payment status - no rows affected')
        return
      }

      // Update local state
      setRecentOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, payment_status: newPaymentStatus as any, updated_at: new Date().toISOString() }
            : order
        )
      )

      // Update selected order if it's the same
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, payment_status: newPaymentStatus as any, updated_at: new Date().toISOString() } : null)
      }

      // Show success toast
      const paymentMessages = {
        'paid': 'Payment marked as received! 💰',
        'pending': 'Payment status reset to pending! ⏳',
        'failed': 'Payment marked as failed! ❌'
      }
      
      toast.success(paymentMessages[newPaymentStatus as keyof typeof paymentMessages] || `Payment status updated to ${newPaymentStatus}!`, {
        duration: 3000,
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: '500',
        },
      })

      // Refresh dashboard data to update sales analytics when payment is received
      if (newPaymentStatus === 'paid') {
        // Small delay to ensure database has processed the update
        setTimeout(() => {
          fetchDashboardData()
        }, 500)
      }

    } catch (error) {
      console.error('Error updating payment status:', error)
      toast.error(`Failed to update payment status: ${error}`)
    }
  }

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderModal(true)
  }

  const closeOrderModal = () => {
    setSelectedOrder(null)
    setShowOrderModal(false)
  }

  const generateChartData = async () => {
    try {
      // Get orders for the selected period
      const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data: orders } = await supabase
        .from('orders')
        .select('created_at, total_amount, status, payment_status')
        .gte('created_at', startDate.toISOString())
        .in('status', ['confirmed', 'completed'])
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: true })

      if (!orders) return

      // Group orders by date
      const dailyData: { [key: string]: { date: string; sales: number; orders: number } } = {}
      
      orders.forEach(order => {
        const date = new Date(order.created_at).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
        
        if (!dailyData[date]) {
          dailyData[date] = { date, sales: 0, orders: 0 }
        }
        
        dailyData[date].sales += order.total_amount
        dailyData[date].orders += 1
      })

      // Convert to array and fill missing dates with zero values
      const chartDataArray = Object.values(dailyData)
      setChartData(chartDataArray)
      
    } catch (error) {
      console.error('Error generating chart data:', error)
      setChartData([])
    }
  }


  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Unpaid'
      case 'paid': return 'Paid'
      case 'failed': return 'Failed'
      default: return status
    }
  }

  // Fetch dashboard data from Supabase
  const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch products count
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })

        // Fetch confirmed and paid orders count
        const { count: ordersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .in('status', ['confirmed', 'completed'])
          .eq('payment_status', 'paid')

        // Calculate total sales from confirmed and paid orders
        const { data: allOrders } = await supabase
          .from('orders')
          .select('total_amount, status, payment_status')
          .in('status', ['confirmed', 'completed'])
          .eq('payment_status', 'paid')

        const totalSales = allOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

        // Calculate stats
        const dashboardStats: DashboardStats[] = [
          { 
            title: 'Total Sales', 
            value: `Rs. ${totalSales.toFixed(2)}`, 
            change: '+0%', 
            icon: TrendingUp, 
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
          setRecentOrders(ordersData as Order[])
        }

        // Fetch top products with real sales data from confirmed and paid orders
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4)

        if (productsData) {
          // Get all confirmed and paid orders
          const { data: confirmedOrders } = await supabase
            .from('orders')
            .select('items, status, payment_status')
            .in('status', ['confirmed', 'completed'])
            .eq('payment_status', 'paid')

          // Calculate sales data for each product
          const topProductsData: TopProduct[] = productsData.map((product) => {
            let totalSales = 0
            let totalRevenue = 0

            if (confirmedOrders) {
              confirmedOrders.forEach(order => {
                // Find items in this order that match the current product
                order.items.forEach((item: any) => {
                  if (item.product_id === product.id) {
                    totalSales += item.quantity || 0
                    totalRevenue += (item.quantity || 0) * (item.price || 0)
                  }
                })
              })
            }

            return {
              name: product.name,
              sales: totalSales,
              revenue: totalRevenue,
              stock_quantity: product.stock_quantity || 0
            }
          })

                  // Sort by sales and take top 4
        const sortedProducts = topProductsData.sort((a, b) => b.sales - a.sales).slice(0, 4)
        setTopProducts(sortedProducts)
      }

      // Generate chart data
      await generateChartData()

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

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Regenerate chart data when period changes
  useEffect(() => {
    if (isAuthenticated) {
      generateChartData()
    }
  }, [selectedPeriod, isAuthenticated])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'confirmed': return 'Confirmed'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      case 'processing': return 'Processing'
      case 'shipped': return 'Shipped'
      default: return status.charAt(0).toUpperCase() + status.slice(1)
    }
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
              
              <div className="h-64">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#666"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#666"
                        fontSize={12}
                        tickFormatter={(value) => `Rs. ${value}`}
                      />
                      <Tooltip 
                        formatter={(value: any, name: string) => [
                          name === 'sales' ? `Rs. ${value}` : value,
                          name === 'sales' ? 'Sales' : 'Orders'
                        ]}
                        labelStyle={{ color: '#333' }}
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="sales" 
                        fill="#10B981" 
                        radius={[4, 4, 0, 0]}
                        name="Sales"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No Sales Data</p>
                      <p className="text-gray-400 text-sm">Sales data will appear here once you have confirmed and paid orders</p>
                    </div>
                  </div>
                )}
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
                <button 
                  onClick={() => window.open('/products', '_blank')}
                  className="btn-primary text-sm py-2 px-4"
                >
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
                      <td className="py-3 px-4 font-medium text-gray-900">{order.id.slice(0, 8)}...</td>
                      <td className="py-3 px-4 text-gray-600">{order.customer_name}</td>
                      <td className="py-3 px-4 text-gray-600">{order.items.length} item(s)</td>
                      <td className="py-3 px-4 font-medium text-gray-900">Rs. {order.total_amount}</td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                          <br />
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                            {getPaymentStatusLabel(order.payment_status)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => openOrderModal(order)}
                            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {order.status === 'pending' && (
                            <button 
                              onClick={() => updateOrderStatus(order.id, 'confirmed')}
                              className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                              title="Confirm Order"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {order.payment_status === 'pending' && (
                                                        <button
                              onClick={() => updatePaymentStatus(order.id, 'paid')}
                              className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                              title="Mark as Paid"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
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

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                <button
                  onClick={closeOrderModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedOrder.customer_name}</p>
                    <p><span className="font-medium">Email:</span> {selectedOrder.customer_email}</p>
                    {selectedOrder.customer_phone && (
                      <p><span className="font-medium">Phone:</span> {selectedOrder.customer_phone}</p>
                    )}
                    {selectedOrder.shipping_address && (
                      <p><span className="font-medium">Address:</span> {selectedOrder.shipping_address}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Order ID:</span> {selectedOrder.id}</p>
                    <p><span className="font-medium">Date:</span> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusLabel(selectedOrder.status)}
                      </span>
                    </p>
                    <p><span className="font-medium">Payment:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                        {getPaymentStatusLabel(selectedOrder.payment_status)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Product</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Quantity</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Price</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-4 py-2">{item.product_name}</td>
                          <td className="border border-gray-300 px-4 py-2">{item.quantity}</td>
                          <td className="border border-gray-300 px-4 py-2">Rs. {item.price}</td>
                          <td className="border border-gray-300 px-4 py-2">Rs. {item.price * item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Rs. {selectedOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>Rs. {selectedOrder.shipping_cost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>Rs. {selectedOrder.tax_amount}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>Rs. {selectedOrder.total_amount}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex space-x-3">
                {selectedOrder.status === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'confirmed')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Confirm Order
                  </button>
                )}
                {selectedOrder.payment_status === 'pending' && (
                  <button
                    onClick={() => updatePaymentStatus(selectedOrder.id, 'paid')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Mark as Paid
                  </button>
                )}
                {selectedOrder.status === 'confirmed' && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Mark as Completed
                  </button>
                )}
                <button
                  onClick={closeOrderModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  )
}
