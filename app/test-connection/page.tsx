'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Product } from '@/lib/supabase'

export default function TestConnection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        setLoading(true)
        
        // Test basic connection
        const { data: testData, error: testError } = await supabase
          .from('products')
          .select('*')
          .limit(1)
        
        if (testError) {
          throw testError
        }

        // Fetch all products
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) {
          throw error
        }

        setProducts(data || [])
        setError(null)
      } catch (err: any) {
        setError(err.message)
        console.error('Supabase connection error:', err)
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Testing Supabase connection...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connection Failed</h1>
          <p className="text-gray-600 mb-4">There was an error connecting to Supabase:</p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 font-mono">
            {error}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Check your environment variables and make sure your Supabase project is running.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Supabase Connection Successful!</h1>
          <p className="text-xl text-gray-600">
            Your database is connected and working properly.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Products from Database</h2>
          
          {products.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No products found in the database.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-primary-600 font-bold">${product.price}</span>
                    <span className="text-sm text-gray-500">{product.category}</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    Stock: {product.stock_quantity} | ID: {product.id.slice(0, 8)}...
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    </div>
  )
}
