import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string
  red_image_url?: string
  stock_quantity: number
  specifications?: any
  directionsForUse?: string
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string
  stock_quantity: number
  quantity: number
}

export interface Order {
  id: string
  customer_email: string
  customer_name: string
  customer_phone?: string
  shipping_address?: string
  items: CartItem[]
  subtotal: number
  shipping_cost: number
  tax_amount: number
  total_amount: number
  status: string
  payment_status: string
  created_at: string
  updated_at: string
}
