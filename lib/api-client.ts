// API Client - Replaces Supabase client for SQLite backend

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  red_image_url?: string;
  stock_quantity: number;
  specifications?: any;
  directionsForUse?: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock_quantity: number;
  quantity: number;
}

export interface Order {
  id: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  shipping_address?: string;
  items: CartItem[];
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
}

// Product API
export const productsApi = {
  async getAll(): Promise<{ data: Product[] | null; error: any }> {
    try {
      const response = await fetch('/api/products');
      const result = await response.json();
      if (!response.ok) {
        return { data: null, error: result.error || 'Failed to fetch products' };
      }
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error: error };
    }
  },

  async getBySlug(slug: string): Promise<{ data: Product | null; error: any }> {
    try {
      const response = await fetch(`/api/products?slug=${encodeURIComponent(slug)}`);
      const result = await response.json();
      if (!response.ok) {
        return { data: null, error: result.error || 'Failed to fetch product' };
      }
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error: error };
    }
  },

  async getByCategory(category: string): Promise<{ data: Product[] | null; error: any }> {
    try {
      const response = await fetch(`/api/products?category=${encodeURIComponent(category)}`);
      const result = await response.json();
      if (!response.ok) {
        return { data: null, error: result.error || 'Failed to fetch products' };
      }
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error: error };
    }
  },

  async getById(id: string): Promise<{ data: Product | null; error: any }> {
    try {
      const response = await fetch(`/api/products/${id}`);
      const result = await response.json();
      if (!response.ok) {
        return { data: null, error: result.error || 'Failed to fetch product' };
      }
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error: error };
    }
  },

  async create(product: Partial<Product>): Promise<{ data: Product | null; error: any }> {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      const result = await response.json();
      if (!response.ok) {
        return { data: null, error: result.error || 'Failed to create product' };
      }
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error: error };
    }
  },

  async update(id: string, updates: Partial<Product>): Promise<{ data: Product | null; error: any }> {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const result = await response.json();
      if (!response.ok) {
        return { data: null, error: result.error || 'Failed to update product' };
      }
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error: error };
    }
  },

  async delete(id: string): Promise<{ error: any }> {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const result = await response.json();
        return { error: result.error || 'Failed to delete product' };
      }
      return { error: null };
    } catch (error) {
      return { error: error };
    }
  }
};

// Orders API
export const ordersApi = {
  async getAll(limit?: number): Promise<{ data: Order[] | null; error: any }> {
    try {
      const url = limit ? `/api/orders?limit=${limit}` : '/api/orders';
      const response = await fetch(url);
      const result = await response.json();
      if (!response.ok) {
        return { data: null, error: result.error || 'Failed to fetch orders' };
      }
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error: error };
    }
  },

  async getById(id: string): Promise<{ data: Order | null; error: any }> {
    try {
      const response = await fetch(`/api/orders/${id}`);
      const result = await response.json();
      if (!response.ok) {
        return { data: null, error: result.error || 'Failed to fetch order' };
      }
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error: error };
    }
  },

  async getByStatus(statuses: string[]): Promise<{ data: Order[] | null; error: any }> {
    try {
      const response = await fetch(`/api/orders?status=${statuses.join(',')}`);
      const result = await response.json();
      if (!response.ok) {
        return { data: null, error: result.error || 'Failed to fetch orders' };
      }
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error: error };
    }
  },

  async getStats(period: string = '7d'): Promise<{ data: any | null; error: any }> {
    try {
      const response = await fetch(`/api/orders/stats?period=${period}`);
      const result = await response.json();
      if (!response.ok) {
        return { data: null, error: result.error || 'Failed to fetch stats' };
      }
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error: error };
    }
  },

  async create(order: {
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    shipping_address?: string;
    items: any[];
    subtotal: number;
    shipping_cost: number;
    tax_amount: number;
    total_amount: number;
    status?: string;
    payment_status?: string;
  }): Promise<{ data: Order | null; error: any }> {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      const result = await response.json();
      if (!response.ok) {
        return { data: null, error: result.error || 'Failed to create order' };
      }
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error: error };
    }
  },

  async updateStatus(id: string, status: string): Promise<{ data: Order | null; error: any }> {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const result = await response.json();
      if (!response.ok) {
        return { data: null, error: result.error || 'Failed to update order' };
      }
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error: error };
    }
  },

  async updatePaymentStatus(id: string, payment_status: string): Promise<{ data: Order | null; error: any }> {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status })
      });
      const result = await response.json();
      if (!response.ok) {
        return { data: null, error: result.error || 'Failed to update order' };
      }
      return { data: result.data, error: null };
    } catch (error) {
      return { data: null, error: error };
    }
  },

  async delete(id: string): Promise<{ error: any }> {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const result = await response.json();
        return { error: result.error || 'Failed to delete order' };
      }
      return { error: null };
    } catch (error) {
      return { error: error };
    }
  }
};

export default { productsApi, ordersApi };
