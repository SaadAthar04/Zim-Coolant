// API Client - Replaces Supabase client for SQLite backend

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;

  /** Green (or, for single-colour products, the only) front view. */
  image_url: string;
  back_image_url?: string | null;
  /** Red front view. Null when the product has no colour choice. */
  red_image_url?: string | null;
  red_back_image_url?: string | null;

  /** Groups the sizes of one product line: zim | zimx | gear | atf. */
  range_key: string;
  size_key: string;
  /** '1 Liter' | '4 Liter' | '' — empty for ATF, which has no public capacity. */
  volume: string;
  sort_order: number;

  intro?: string | null;
  colour_note?: string | null;
  benefits?: string[];
  directions?: string[];
  usage_note?: string | null;

  /** 1 when a free pouring nozzle ships with this product. */
  nozzle_included: number;
  show_size_in_title: number;

  stock_quantity: number;
  specifications?: any;
  directionsForUse?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  colour?: string;
  volume?: string;
  image_url?: string;
  quantity: number;
  price: number;
  line_total: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_postal_code?: string;
  order_notes?: string;
  payment_method: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  payment_status: string;
  /** Set when the order is marked dispatched. */
  courier_name?: string;
  tracking_number?: string;
  tracking_url?: string;
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

  /**
   * Places an order.
   *
   * Only the customer's details and what they picked are sent. The server
   * looks every line up in the database and works out the prices, shipping and
   * total itself, so nothing about the money comes from the browser.
   */
  async create(order: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: string;
    shipping_city: string;
    shipping_postal_code?: string;
    order_notes?: string;
    items: Array<{ product_id: string; colour?: string; quantity: number }>;
  }): Promise<{
    data: Order | null;
    error: string | null;
    fieldErrors?: Record<string, string>;
    emailConfigured?: boolean;
  }> {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      const result = await response.json();
      if (!response.ok) {
        return {
          data: null,
          error: result.error || 'Failed to create order',
          fieldErrors: result.fieldErrors,
        };
      }
      return {
        data: result.data,
        error: null,
        emailConfigured: result.meta?.emailConfigured,
      };
    } catch {
      return { data: null, error: 'Could not reach the server. Please check your connection.' };
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

  /**
   * Saves the courier details and moves the order to 'dispatched' in one call,
   * so the dispatch email is built from an order that already has its tracking
   * number on it.
   */
  async dispatch(
    id: string,
    tracking: { courier_name: string; tracking_number: string; tracking_url: string }
  ): Promise<{ data: Order | null; error: any }> {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // resendDispatch covers the case where the order is already dispatched
        // and only the courier details changed, which is not a status change.
        body: JSON.stringify({ ...tracking, status: 'dispatched', resendDispatch: true })
      });
      const result = await response.json();
      if (!response.ok) {
        return { data: null, error: result.error || 'Failed to dispatch order' };
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
