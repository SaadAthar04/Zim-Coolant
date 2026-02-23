import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Database types
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
  specifications?: string; // JSON string
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
  items: string; // JSON string of CartItem[]
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
}

// Get database path
const getDbPath = () => {
  return path.join(process.cwd(), 'database', 'zim-coolant.db');
};

// Create database connection
let db: Database.Database | null = null;

export const getDb = () => {
  if (!db) {
    db = new Database(getDbPath());
    db.pragma('journal_mode = WAL');
    initializeDatabase(db);
  }
  return db;
};

// Initialize database schema
function initializeDatabase(database: Database.Database) {
  // Create products table
  database.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('Coolant', 'ATF', 'Gear Oil')),
      image_url TEXT NOT NULL,
      red_image_url TEXT,
      stock_quantity INTEGER DEFAULT 0,
      specifications TEXT,
      directionsForUse TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Create orders table
  database.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      shipping_address TEXT,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      shipping_cost REAL NOT NULL,
      tax_amount REAL NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled')),
      payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'failed')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Create indexes
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
  `);
}

// Product operations
export const productOperations = {
  getAll: () => {
    const db = getDb();
    const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all() as Product[];
    return products.map(p => ({
      ...p,
      specifications: p.specifications ? JSON.parse(p.specifications) : null
    }));
  },

  getBySlug: (slug: string) => {
    const db = getDb();
    const product = db.prepare('SELECT * FROM products WHERE slug = ?').get(slug) as Product | undefined;
    if (product) {
      return {
        ...product,
        specifications: product.specifications ? JSON.parse(product.specifications) : null
      };
    }
    return null;
  },

  getById: (id: string) => {
    const db = getDb();
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as Product | undefined;
    if (product) {
      return {
        ...product,
        specifications: product.specifications ? JSON.parse(product.specifications) : null
      };
    }
    return null;
  },

  getByCategory: (category: string) => {
    const db = getDb();
    const products = db.prepare('SELECT * FROM products WHERE category = ? ORDER BY created_at DESC').all(category) as Product[];
    return products.map(p => ({
      ...p,
      specifications: p.specifications ? JSON.parse(p.specifications) : null
    }));
  },

  count: () => {
    const db = getDb();
    const result = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
    return result.count;
  },

  create: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO products (id, name, slug, description, price, category, image_url, red_image_url, stock_quantity, specifications, directionsForUse, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      product.name,
      product.slug,
      product.description,
      product.price,
      product.category,
      product.image_url,
      product.red_image_url || null,
      product.stock_quantity,
      product.specifications ? JSON.stringify(product.specifications) : null,
      product.directionsForUse || null,
      now,
      now
    );

    return { id, ...product, created_at: now, updated_at: now };
  },

  update: (id: string, updates: Partial<Product>) => {
    const db = getDb();
    const now = new Date().toISOString();

    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = ?`);
        if (key === 'specifications' && value) {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
      }
    });

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    const stmt = db.prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return productOperations.getById(id);
  },

  delete: (id: string) => {
    const db = getDb();
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    stmt.run(id);
  }
};

// Order operations
export const orderOperations = {
  getAll: (limit?: number) => {
    const db = getDb();
    let query = 'SELECT * FROM orders ORDER BY created_at DESC';
    if (limit) {
      query += ` LIMIT ${limit}`;
    }
    const orders = db.prepare(query).all() as Order[];
    return orders.map(o => ({
      ...o,
      items: JSON.parse(o.items)
    }));
  },

  getById: (id: string) => {
    const db = getDb();
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as Order | undefined;
    if (order) {
      return {
        ...order,
        items: JSON.parse(order.items)
      };
    }
    return null;
  },

  getByStatus: (statuses: string[]) => {
    const db = getDb();
    const placeholders = statuses.map(() => '?').join(', ');
    const orders = db.prepare(`SELECT * FROM orders WHERE status IN (${placeholders}) ORDER BY created_at DESC`).all(...statuses) as Order[];
    return orders.map(o => ({
      ...o,
      items: JSON.parse(o.items)
    }));
  },

  getConfirmedAndPaid: () => {
    const db = getDb();
    const orders = db.prepare(`
      SELECT * FROM orders
      WHERE status IN ('confirmed', 'completed')
      AND payment_status = 'paid'
      ORDER BY created_at DESC
    `).all() as Order[];
    return orders.map(o => ({
      ...o,
      items: JSON.parse(o.items)
    }));
  },

  count: (statusFilter?: string[], paymentStatusFilter?: string) => {
    const db = getDb();
    let query = 'SELECT COUNT(*) as count FROM orders';
    const conditions: string[] = [];
    const values: any[] = [];

    if (statusFilter && statusFilter.length > 0) {
      const placeholders = statusFilter.map(() => '?').join(', ');
      conditions.push(`status IN (${placeholders})`);
      values.push(...statusFilter);
    }

    if (paymentStatusFilter) {
      conditions.push('payment_status = ?');
      values.push(paymentStatusFilter);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const result = db.prepare(query).get(...values) as { count: number };
    return result.count;
  },

  getTotalSales: () => {
    const db = getDb();
    const result = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total
      FROM orders
      WHERE status IN ('confirmed', 'completed')
      AND payment_status = 'paid'
    `).get() as { total: number };
    return result.total;
  },

  getOrdersInDateRange: (startDate: string) => {
    const db = getDb();
    const orders = db.prepare(`
      SELECT * FROM orders
      WHERE status IN ('confirmed', 'completed')
      AND payment_status = 'paid'
      AND created_at >= ?
      ORDER BY created_at ASC
    `).all(startDate) as Order[];
    return orders.map(o => ({
      ...o,
      items: JSON.parse(o.items)
    }));
  },

  create: (order: {
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
  }) => {
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO orders (id, customer_name, customer_email, customer_phone, shipping_address, items, subtotal, shipping_cost, tax_amount, total_amount, status, payment_status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      order.customer_name,
      order.customer_email,
      order.customer_phone || null,
      order.shipping_address || null,
      JSON.stringify(order.items),
      order.subtotal,
      order.shipping_cost,
      order.tax_amount,
      order.total_amount,
      order.status || 'pending',
      order.payment_status || 'pending',
      now,
      now
    );

    return { id, ...order, items: order.items, created_at: now, updated_at: now };
  },

  updateStatus: (id: string, status: string) => {
    const db = getDb();
    const now = new Date().toISOString();
    const stmt = db.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?');
    stmt.run(status, now, id);
    return orderOperations.getById(id);
  },

  updatePaymentStatus: (id: string, paymentStatus: string) => {
    const db = getDb();
    const now = new Date().toISOString();
    const stmt = db.prepare('UPDATE orders SET payment_status = ?, updated_at = ? WHERE id = ?');
    stmt.run(paymentStatus, now, id);
    return orderOperations.getById(id);
  },

  delete: (id: string) => {
    const db = getDb();
    const stmt = db.prepare('DELETE FROM orders WHERE id = ?');
    stmt.run(id);
  }
};

// Seed initial products (if empty)
export const seedProducts = () => {
  const db = getDb();
  const count = productOperations.count();

  if (count === 0) {
    console.log('Seeding initial products...');

    const products = [
      {
        name: 'Zim Coolant Green - 1L',
        slug: 'zim-coolant-green-1l',
        description: 'Premium engine coolant for all vehicle types. Provides excellent heat transfer and corrosion protection.',
        price: 450,
        category: 'Coolant' as const,
        image_url: 'https://nvwbxrdbppykdguevacb.supabase.co/storage/v1/object/public/product-images/coolant-green-1l.png',
        stock_quantity: 100,
        specifications: JSON.stringify({
          volume: '1 Liter',
          color: 'Green',
          type: 'Ethylene Glycol Based'
        }),
        directionsForUse: '<p>Mix with water in 50:50 ratio before use.</p>'
      },
      {
        name: 'Zim Coolant Red - 1L',
        slug: 'zim-coolant-red-1l',
        description: 'Long-life organic acid technology coolant. Extended protection for modern engines.',
        price: 550,
        category: 'Coolant' as const,
        image_url: 'https://nvwbxrdbppykdguevacb.supabase.co/storage/v1/object/public/product-images/coolant-red-1l.png',
        stock_quantity: 80,
        specifications: JSON.stringify({
          volume: '1 Liter',
          color: 'Red',
          type: 'OAT (Organic Acid Technology)'
        }),
        directionsForUse: '<p>Ready to use. No dilution required.</p>'
      },
      {
        name: 'Zim ATF - 1L',
        slug: 'zim-atf-1l',
        description: 'Automatic Transmission Fluid for smooth gear shifting and transmission protection.',
        price: 600,
        category: 'ATF' as const,
        image_url: 'https://nvwbxrdbppykdguevacb.supabase.co/storage/v1/object/public/product-images/atf-1l.png',
        stock_quantity: 60,
        specifications: JSON.stringify({
          volume: '1 Liter',
          type: 'Dexron III'
        }),
        directionsForUse: '<p>Check vehicle manual for compatible ATF specifications.</p>'
      },
      {
        name: 'Zim Gear Oil 80W-90 - 1L',
        slug: 'zim-gear-oil-80w90-1l',
        description: 'Heavy-duty gear oil for manual transmissions and differentials.',
        price: 500,
        category: 'Gear Oil' as const,
        image_url: 'https://nvwbxrdbppykdguevacb.supabase.co/storage/v1/object/public/product-images/gear-oil-1l.png',
        stock_quantity: 70,
        specifications: JSON.stringify({
          volume: '1 Liter',
          viscosity: '80W-90',
          type: 'GL-5'
        }),
        directionsForUse: '<p>Suitable for manual transmissions and rear axles.</p>'
      }
    ];

    products.forEach(product => {
      productOperations.create(product as any);
    });

    console.log(`Seeded ${products.length} products.`);
  }
};

export default { getDb, productOperations, orderOperations, seedProducts };
