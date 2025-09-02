'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  ShoppingCart,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Calendar,
  Download
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

// Mock data for admin dashboard
const mockStats = [
  { title: 'Total Sales', value: '$24,567', change: '+12.5%', icon: DollarSign, color: 'text-green-600' },
  { title: 'Orders', value: '156', change: '+8.2%', icon: ShoppingCart, color: 'text-blue-600' },
  { title: 'Customers', value: '89', change: '+15.3%', icon: Users, color: 'text-purple-600' },
  { title: 'Products', value: '24', change: '+2.1%', icon: Package, color: 'text-orange-600' }
]

const mockRecentOrders = [
  { id: '#ORD-001', customer: 'John Doe', product: 'Premium Engine Oil 5W-30', amount: 45.99, status: 'completed', date: '2024-01-15' },
  { id: '#ORD-002', customer: 'Jane Smith', product: 'Advanced Coolant Formula', amount: 32.99, status: 'processing', date: '2024-01-14' },
  { id: '#ORD-003', customer: 'Mike Johnson', product: 'Heavy Duty Engine Oil 15W-40', amount: 52.99, status: 'shipped', date: '2024-01-13' },
  { id: '#ORD-004', customer: 'Sarah Wilson', product: 'Universal Coolant Concentrate', amount: 28.99, status: 'pending', date: '2024-01-12' },
  { id: '#ORD-005', customer: 'David Brown', product: 'Synthetic Engine Oil 0W-20', amount: 48.99, status: 'completed', date: '2024-01-11' }
]

const mockTopProducts = [
  { name: 'Premium Engine Oil 5W-30', sales: 45, revenue: 2070.55, stock_quantity: 150 },
  { name: 'Advanced Coolant Formula', sales: 38, revenue: 1253.62, stock_quantity: 200 },
  { name: 'Heavy Duty Engine Oil 15W-40', sales: 32, revenue: 1695.68, stock_quantity: 100 },
  { name: 'Universal Coolant Concentrate', sales: 28, revenue: 811.72, stock_quantity: 300 }
]

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [searchTerm, setSearchTerm] = useState('')

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-primary pt-32 pb-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Admin <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Monitor your business performance, manage orders, and track sales analytics
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {mockStats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Charts and Analytics */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sales Chart */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Sales Overview</h3>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
            </motion.div>

            {/* Top Products */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Top Products</h3>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {mockTopProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.sales} sales</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${product.revenue}</p>
                      <p className="text-sm text-gray-600">Stock: {product.stock_quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Recent Orders */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
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
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  {mockRecentOrders.map((order, index) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">{order.id}</td>
                      <td className="py-3 px-4 text-gray-600">{order.customer}</td>
                      <td className="py-3 px-4 text-gray-600">{order.product}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">${order.amount}</td>
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
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Actions */}
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
              Quick Actions
            </h2>
            <p className="text-xl text-gray-600">
              Manage your business operations efficiently
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Add Product', icon: Plus, color: 'bg-blue-500', description: 'Create new product listings' },
              { title: 'View Orders', icon: ShoppingCart, color: 'bg-green-500', description: 'Manage customer orders' },
              { title: 'Analytics', icon: TrendingUp, color: 'bg-purple-500', description: 'View detailed reports' },
              { title: 'Export Data', icon: Download, color: 'bg-orange-500', description: 'Download business data' }
            ].map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
