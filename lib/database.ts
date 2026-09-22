import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import catalogData from '@/database/catalog.json';

// Database types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;

  /** Green (or, for single-colour products, the only) front view. */
  image_url: string;
  /** Green (or only) back view. */
  back_image_url?: string | null;
  /** Red front view. Null on products with no colour choice. */
  red_image_url?: string | null;
  /** Red back view. Null on products with no colour choice. */
  red_back_image_url?: string | null;

  /** Groups the sizes of one product line together: zim | zimx | gear | atf. */
  range_key: string;
  /** '1' | '4' | 'standard'. */
  size_key: string;
  /** '1 Liter' | '4 Liter' | '' — empty for ATF, which has no public capacity. */
  volume: string;
  sort_order: number;

  intro?: string | null;
  colour_note?: string | null;
  benefits?: string[] | string | null;
  directions?: string[] | string | null;
  usage_note?: string | null;

  /** 1 when a free pouring nozzle ships with this product (ZIMX 1 Liter only). */
  nozzle_included: number;
  /** 1 when the size suffix belongs in the product title. */
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
  /** 'green' | 'red' | '' — the variant the customer chose. */
  colour?: string;
  volume?: string;
  image_url?: string;
  quantity: number;
  /** Unit price in PKR, as priced by the server at the time of the order. */
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
  /** Always an array on the way out; stored as JSON text in the column. */
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

export interface EmailLogEntry {
  id: number;
  to_address: string;
  template: string;
  subject?: string;
  status: 'queued' | 'sent' | 'retried' | 'failed';
  attempts: number;
  error_message?: string;
  related_order_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  handled: number;
  created_at: string;
}

const CATEGORIES = [
  'Anti-Freeze & Anti-Boil',
  'Radiator Coolant',
  'Gear Oil',
  'Transmission Fluid',
];

const categoryCheck = CATEGORIES.map((c) => `'${c.replace(/'/g, "''")}'`).join(', ');

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

/**
 * The order lifecycle, in the sequence the client confirmed on 22 September
 * 2026. 'dispatched' and 'delivered' replace the old single 'completed' step so
 * the customer can be told when their parcel is actually on its way.
 */
export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'dispatched',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

const orderStatusCheck = ORDER_STATUSES.map((s) => `'${s}'`).join(', ');

/** Statuses that count as a real sale for the revenue figures. */
const FULFILLED_STATUSES = ['confirmed', 'dispatched', 'delivered'];

const fulfilledCheck = FULFILLED_STATUSES.map((s) => `'${s}'`).join(', ');

/**
 * Brings an older database up to the five-status lifecycle.
 *
 * SQLite cannot alter a CHECK constraint in place, so the table is rebuilt.
 * Orders previously marked 'completed' become 'delivered', which is what that
 * status always meant in practice.
 */
function migrateOrderStatuses(database: Database.Database) {
  const row = database
    .prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'orders'")
    .get() as { sql: string } | undefined;

  // Already migrated, or a fresh database created with the new constraint.
  if (!row || row.sql.includes("'dispatched'")) return;

  console.log('[db] Migrating orders to the dispatched/delivered lifecycle...');

  const columns = (
    database.prepare('PRAGMA table_info(orders)').all() as { name: string }[]
  ).map((c) => c.name);
  const columnList = columns.join(', ');

  // 'completed' has to become 'delivered' as the row is copied, not afterwards:
  // the new CHECK constraint rejects the old value on the way in.
  const selectList = columns
    .map((name) =>
      name === 'status'
        ? "CASE WHEN status = 'completed' THEN 'delivered' ELSE status END AS status"
        : name
    )
    .join(', ');

  database.exec('PRAGMA foreign_keys = OFF');

  database.transaction(() => {
    database.exec(`
      CREATE TABLE orders_migrated (
        id TEXT PRIMARY KEY,
        order_number TEXT,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT,
        shipping_address TEXT,
        shipping_city TEXT,
        shipping_postal_code TEXT,
        order_notes TEXT,
        payment_method TEXT DEFAULT 'cod',
        items TEXT NOT NULL,
        subtotal REAL NOT NULL,
        shipping_cost REAL NOT NULL,
        tax_amount REAL NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'pending' CHECK(status IN (${orderStatusCheck})),
        payment_status TEXT DEFAULT 'pending'
          CHECK(payment_status IN ('pending', 'paid', 'failed')),
        courier_name TEXT,
        tracking_number TEXT,
        tracking_url TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);

    database.exec(`
      INSERT INTO orders_migrated (${columnList})
      SELECT ${selectList} FROM orders
    `);

    database.exec('DROP TABLE orders');
    database.exec('ALTER TABLE orders_migrated RENAME TO orders');
  })();

  database.exec('PRAGMA foreign_keys = ON');

  console.log('[db] Orders migrated.');
}

/** Adds a column to an existing table when it is not there yet. */
function ensureColumn(
  database: Database.Database,
  table: string,
  column: string,
  definition: string
) {
  const columns = database.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!columns.some((c) => c.name === column)) {
    database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

// Initialize database schema
function initializeDatabase(database: Database.Database) {
  // Products. An older database may still carry the pre-handoff CHECK
  // constraint on category; scripts/migrate-catalog.js rebuilds those, since
  // SQLite cannot alter a CHECK in place.
  database.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL CHECK(category IN (${categoryCheck})),
      image_url TEXT NOT NULL,
      back_image_url TEXT,
      red_image_url TEXT,
      red_back_image_url TEXT,
      range_key TEXT NOT NULL DEFAULT '',
      size_key TEXT NOT NULL DEFAULT '',
      volume TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      intro TEXT,
      colour_note TEXT,
      benefits TEXT,
      directions TEXT,
      usage_note TEXT,
      nozzle_included INTEGER NOT NULL DEFAULT 0,
      show_size_in_title INTEGER NOT NULL DEFAULT 0,
      stock_quantity INTEGER DEFAULT 0,
      specifications TEXT,
      directionsForUse TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  database.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      shipping_address TEXT,
      shipping_city TEXT,
      shipping_postal_code TEXT,
      order_notes TEXT,
      payment_method TEXT DEFAULT 'cod',
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      shipping_cost REAL NOT NULL,
      tax_amount REAL NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN (${orderStatusCheck})),
      payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'failed')),
      courier_name TEXT,
      tracking_number TEXT,
      tracking_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Every email we attempt, so the shop can diagnose delivery from the admin
  // panel instead of needing server logs. Written even when SMTP is unset.
  database.exec(`
    CREATE TABLE IF NOT EXISTS email_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      to_address TEXT NOT NULL,
      template TEXT NOT NULL,
      subject TEXT,
      status TEXT NOT NULL DEFAULT 'queued'
        CHECK(status IN ('queued', 'sent', 'retried', 'failed')),
      attempts INTEGER NOT NULL DEFAULT 0,
      error_message TEXT,
      related_order_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Contact-form enquiries are stored as well as emailed, so a message is never
  // lost when SMTP is down. The form used to discard them entirely.
  database.exec(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT,
      message TEXT NOT NULL,
      handled INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Additive migrations for databases created before the handoff work.
  ensureColumn(database, 'products', 'back_image_url', 'TEXT');
  ensureColumn(database, 'products', 'red_back_image_url', 'TEXT');
  ensureColumn(database, 'products', 'range_key', "TEXT NOT NULL DEFAULT ''");
  ensureColumn(database, 'products', 'size_key', "TEXT NOT NULL DEFAULT ''");
  ensureColumn(database, 'products', 'volume', "TEXT NOT NULL DEFAULT ''");
  ensureColumn(database, 'products', 'sort_order', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn(database, 'products', 'intro', 'TEXT');
  ensureColumn(database, 'products', 'colour_note', 'TEXT');
  ensureColumn(database, 'products', 'benefits', 'TEXT');
  ensureColumn(database, 'products', 'directions', 'TEXT');
  ensureColumn(database, 'products', 'usage_note', 'TEXT');
  ensureColumn(database, 'products', 'nozzle_included', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn(database, 'products', 'show_size_in_title', 'INTEGER NOT NULL DEFAULT 0');

  ensureColumn(database, 'orders', 'order_number', 'TEXT');
  ensureColumn(database, 'orders', 'shipping_city', 'TEXT');
  ensureColumn(database, 'orders', 'shipping_postal_code', 'TEXT');
  ensureColumn(database, 'orders', 'order_notes', 'TEXT');
  ensureColumn(database, 'orders', 'payment_method', "TEXT DEFAULT 'cod'");
  ensureColumn(database, 'orders', 'courier_name', 'TEXT');
  ensureColumn(database, 'orders', 'tracking_number', 'TEXT');
  ensureColumn(database, 'orders', 'tracking_url', 'TEXT');

  migrateOrderStatuses(database);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_range ON products(range_key);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
  `);
}

/** Turns the stored JSON columns back into arrays/objects for callers. */
const hydrateProduct = (p: any): Product => ({
  ...p,
  specifications: p.specifications ? safeParse(p.specifications) : null,
  benefits: p.benefits ? safeParse(p.benefits) : [],
  directions: p.directions ? safeParse(p.directions) : [],
});

function safeParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

const PRODUCT_ORDER = 'ORDER BY sort_order ASC, name ASC';

/**
 * Columns an update is allowed to touch. `id` and `created_at` are deliberately
 * absent, and anything not listed here is discarded, which keeps caller-supplied
 * keys out of the generated SQL.
 */
export const UPDATABLE_PRODUCT_COLUMNS = new Set([
  'name',
  'slug',
  'description',
  'price',
  'category',
  'image_url',
  'back_image_url',
  'red_image_url',
  'red_back_image_url',
  'range_key',
  'size_key',
  'volume',
  'sort_order',
  'intro',
  'colour_note',
  'benefits',
  'directions',
  'usage_note',
  'nozzle_included',
  'show_size_in_title',
  'stock_quantity',
  'specifications',
  'directionsForUse',
]);

// Product operations
export const productOperations = {
  getAll: () => {
    const db = getDb();
    const products = db.prepare(`SELECT * FROM products ${PRODUCT_ORDER}`).all() as any[];
    return products.map(hydrateProduct);
  },

  getBySlug: (slug: string) => {
    const db = getDb();
    const product = db.prepare('SELECT * FROM products WHERE slug = ?').get(slug) as any;
    return product ? hydrateProduct(product) : null;
  },

  getById: (id: string) => {
    const db = getDb();
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any;
    return product ? hydrateProduct(product) : null;
  },

  getByCategory: (category: string) => {
    const db = getDb();
    const products = db
      .prepare(`SELECT * FROM products WHERE category = ? ${PRODUCT_ORDER}`)
      .all(category) as any[];
    return products.map(hydrateProduct);
  },

  /** All sizes of one product line, for the size selector on a product page. */
  getByRange: (rangeKey: string) => {
    const db = getDb();
    const products = db
      .prepare(`SELECT * FROM products WHERE range_key = ? ${PRODUCT_ORDER}`)
      .all(rangeKey) as any[];
    return products.map(hydrateProduct);
  },

  count: () => {
    const db = getDb();
    const result = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
    return result.count;
  },

  create: (product: Partial<Product> & { name: string; slug: string; description: string; price: number; category: string; image_url: string }) => {
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO products (
        id, name, slug, description, price, category,
        image_url, back_image_url, red_image_url, red_back_image_url,
        range_key, size_key, volume, sort_order,
        intro, colour_note, benefits, directions, usage_note,
        nozzle_included, show_size_in_title,
        stock_quantity, specifications, directionsForUse, created_at, updated_at
      ) VALUES (
        @id, @name, @slug, @description, @price, @category,
        @image_url, @back_image_url, @red_image_url, @red_back_image_url,
        @range_key, @size_key, @volume, @sort_order,
        @intro, @colour_note, @benefits, @directions, @usage_note,
        @nozzle_included, @show_size_in_title,
        @stock_quantity, @specifications, @directionsForUse, @created_at, @updated_at
      )
    `).run({
      id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      category: product.category,
      image_url: product.image_url,
      back_image_url: product.back_image_url ?? null,
      red_image_url: product.red_image_url ?? null,
      red_back_image_url: product.red_back_image_url ?? null,
      range_key: product.range_key ?? '',
      size_key: product.size_key ?? '',
      volume: product.volume ?? '',
      sort_order: product.sort_order ?? 0,
      intro: product.intro ?? null,
      colour_note: product.colour_note ?? null,
      benefits: product.benefits ? JSON.stringify(product.benefits) : null,
      directions: product.directions ? JSON.stringify(product.directions) : null,
      usage_note: product.usage_note ?? null,
      nozzle_included: product.nozzle_included ?? 0,
      show_size_in_title: product.show_size_in_title ?? 0,
      stock_quantity: product.stock_quantity ?? 0,
      specifications: product.specifications ? JSON.stringify(product.specifications) : null,
      directionsForUse: product.directionsForUse ?? null,
      created_at: now,
      updated_at: now,
    });

    return productOperations.getById(id);
  },

  update: (id: string, updates: Partial<Product>) => {
    const db = getDb();
    const now = new Date().toISOString();

    const JSON_COLUMNS = new Set(['specifications', 'benefits', 'directions']);
    const fields: string[] = [];
    const values: any[] = [];

    // Column names are interpolated into the statement, so only ever accept
    // names from this list. Anything else is ignored rather than trusted.
    Object.entries(updates).forEach(([key, value]) => {
      if (!UPDATABLE_PRODUCT_COLUMNS.has(key)) return;
      fields.push(`${key} = ?`);
      values.push(JSON_COLUMNS.has(key) && value !== null && typeof value !== 'string'
        ? JSON.stringify(value)
        : value);
    });

    if (fields.length === 0) return productOperations.getById(id);

    fields.push('updated_at = ?');
    values.push(now, id);

    db.prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return productOperations.getById(id);
  },

  delete: (id: string) => {
    const db = getDb();
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
  },
};

const hydrateOrder = (o: any): Order => ({
  ...o,
  items: o.items ? safeParse(o.items) || [] : [],
});

/** ZIM-000417 style reference the customer and the client can quote. */
/**
 * The next free order reference.
 *
 * Derived from the highest number already used, not from COUNT(*): deleting an
 * order would otherwise make the next one reuse a number that is already out
 * there on a customer's confirmation email, leaving two different orders
 * sharing a reference.
 */
function nextOrderNumber(database: Database.Database) {
  const row = database
    .prepare(`
      SELECT MAX(CAST(substr(order_number, 5) AS INTEGER)) AS highest
      FROM orders
      WHERE order_number LIKE 'ZIM-%'
    `)
    .get() as { highest: number | null };

  return `ZIM-${String((row.highest || 0) + 1).padStart(6, '0')}`;
}

// Order operations
export const orderOperations = {
  getAll: (limit?: number) => {
    const db = getDb();
    let query = 'SELECT * FROM orders ORDER BY created_at DESC';
    if (limit) query += ` LIMIT ${Number(limit)}`;
    return (db.prepare(query).all() as any[]).map(hydrateOrder);
  },

  getById: (id: string) => {
    const db = getDb();
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
    return order ? hydrateOrder(order) : null;
  },

  getByStatus: (statuses: string[]) => {
    const db = getDb();
    const placeholders = statuses.map(() => '?').join(', ');
    return (
      db
        .prepare(`SELECT * FROM orders WHERE status IN (${placeholders}) ORDER BY created_at DESC`)
        .all(...statuses) as any[]
    ).map(hydrateOrder);
  },

  getConfirmedAndPaid: () => {
    const db = getDb();
    return (
      db
        .prepare(`
          SELECT * FROM orders
          WHERE status IN (${fulfilledCheck})
          AND payment_status = 'paid'
          ORDER BY created_at DESC
        `)
        .all() as any[]
    ).map(hydrateOrder);
  },

  count: (statusFilter?: string[], paymentStatusFilter?: string) => {
    const db = getDb();
    let query = 'SELECT COUNT(*) as count FROM orders';
    const conditions: string[] = [];
    const values: any[] = [];

    if (statusFilter && statusFilter.length > 0) {
      conditions.push(`status IN (${statusFilter.map(() => '?').join(', ')})`);
      values.push(...statusFilter);
    }
    if (paymentStatusFilter) {
      conditions.push('payment_status = ?');
      values.push(paymentStatusFilter);
    }
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');

    const result = db.prepare(query).get(...values) as { count: number };
    return result.count;
  },

  getTotalSales: () => {
    const db = getDb();
    const result = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total
      FROM orders
      WHERE status IN (${fulfilledCheck})
      AND payment_status = 'paid'
    `).get() as { total: number };
    return result.total;
  },

  getOrdersInDateRange: (startDate: string) => {
    const db = getDb();
    return (
      db
        .prepare(`
          SELECT * FROM orders
          WHERE status IN (${fulfilledCheck})
          AND payment_status = 'paid'
          AND created_at >= ?
          ORDER BY created_at ASC
        `)
        .all(startDate) as any[]
    ).map(hydrateOrder);
  },

  create: (order: {
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    shipping_address?: string;
    shipping_city?: string;
    shipping_postal_code?: string;
    order_notes?: string;
    payment_method?: string;
    items: OrderItem[];
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
    const orderNumber = nextOrderNumber(db);

    db.prepare(`
      INSERT INTO orders (
        id, order_number, customer_name, customer_email, customer_phone,
        shipping_address, shipping_city, shipping_postal_code, order_notes,
        payment_method, items, subtotal, shipping_cost, tax_amount, total_amount,
        status, payment_status, created_at, updated_at
      ) VALUES (
        @id, @order_number, @customer_name, @customer_email, @customer_phone,
        @shipping_address, @shipping_city, @shipping_postal_code, @order_notes,
        @payment_method, @items, @subtotal, @shipping_cost, @tax_amount, @total_amount,
        @status, @payment_status, @created_at, @updated_at
      )
    `).run({
      id,
      order_number: orderNumber,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone || null,
      shipping_address: order.shipping_address || null,
      shipping_city: order.shipping_city || null,
      shipping_postal_code: order.shipping_postal_code || null,
      order_notes: order.order_notes || null,
      payment_method: order.payment_method || 'cod',
      items: JSON.stringify(order.items),
      subtotal: order.subtotal,
      shipping_cost: order.shipping_cost,
      tax_amount: order.tax_amount,
      total_amount: order.total_amount,
      status: order.status || 'pending',
      payment_status: order.payment_status || 'pending',
      created_at: now,
      updated_at: now,
    });

    return orderOperations.getById(id)!;
  },

  updateStatus: (id: string, status: string) => {
    const db = getDb();
    db.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?')
      .run(status, new Date().toISOString(), id);
    return orderOperations.getById(id);
  },

  /**
   * Records who is carrying the parcel. Written before the dispatch email is
   * built so the customer sees the tracking details, not an empty block.
   */
  updateTracking: (
    id: string,
    tracking: { courier_name?: string; tracking_number?: string; tracking_url?: string }
  ) => {
    const db = getDb();
    db.prepare(`
      UPDATE orders
      SET courier_name = @courier_name,
          tracking_number = @tracking_number,
          tracking_url = @tracking_url,
          updated_at = @updated_at
      WHERE id = @id
    `).run({
      id,
      courier_name: tracking.courier_name?.trim() || null,
      tracking_number: tracking.tracking_number?.trim() || null,
      tracking_url: tracking.tracking_url?.trim() || null,
      updated_at: new Date().toISOString(),
    });
    return orderOperations.getById(id);
  },

  updatePaymentStatus: (id: string, paymentStatus: string) => {
    const db = getDb();
    db.prepare('UPDATE orders SET payment_status = ?, updated_at = ? WHERE id = ?')
      .run(paymentStatus, new Date().toISOString(), id);
    return orderOperations.getById(id);
  },

  delete: (id: string) => {
    const db = getDb();
    db.prepare('DELETE FROM orders WHERE id = ?').run(id);
  },
};

/**
 * The email log, written by lib/email/mailer.ts around every send attempt.
 *
 * Kept here rather than in the mailer so the admin log page can read it without
 * pulling nodemailer into the bundle.
 */
export const emailLogOperations = {
  /** Opens a row before the send is attempted, and returns its id. */
  queue: (entry: {
    to_address: string;
    template: string;
    subject?: string;
    related_order_id?: string | null;
  }) => {
    const db = getDb();
    const now = new Date().toISOString();
    const result = db
      .prepare(`
        INSERT INTO email_log (to_address, template, subject, status, attempts,
                               related_order_id, created_at, updated_at)
        VALUES (?, ?, ?, 'queued', 0, ?, ?, ?)
      `)
      .run(
        entry.to_address,
        entry.template,
        entry.subject || null,
        entry.related_order_id || null,
        now,
        now
      );
    return Number(result.lastInsertRowid);
  },

  /** Closes the row once the outcome is known. */
  settle: (
    id: number,
    status: 'sent' | 'retried' | 'failed',
    attempts: number,
    errorMessage?: string
  ) => {
    const db = getDb();
    db.prepare(`
      UPDATE email_log
      SET status = ?, attempts = ?, error_message = ?, updated_at = ?
      WHERE id = ?
    `).run(
      status,
      attempts,
      errorMessage ? errorMessage.slice(0, 500) : null,
      new Date().toISOString(),
      id
    );
  },

  list: (status?: string, limit = 200) => {
    const db = getDb();
    const rows = status
      ? db
          .prepare(
            'SELECT * FROM email_log WHERE status = ? ORDER BY created_at DESC LIMIT ?'
          )
          .all(status, limit)
      : db
          .prepare('SELECT * FROM email_log ORDER BY created_at DESC LIMIT ?')
          .all(limit);
    return rows as EmailLogEntry[];
  },

  /**
   * Historical and recent failure counts are reported separately: failures from
   * before SMTP was configured would otherwise read as a live outage.
   */
  stats: () => {
    const db = getDb();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const one = (sql: string, ...values: any[]) =>
      (db.prepare(sql).get(...values) as { count: number }).count;

    return {
      total: one('SELECT COUNT(*) as count FROM email_log'),
      failedCount: one("SELECT COUNT(*) as count FROM email_log WHERE status = 'failed'"),
      recentFailedCount: one(
        "SELECT COUNT(*) as count FROM email_log WHERE status = 'failed' AND created_at >= ?",
        since
      ),
      sentCount: one(
        "SELECT COUNT(*) as count FROM email_log WHERE status IN ('sent', 'retried')"
      ),
    };
  },
};

export const contactMessageOperations = {
  create: (message: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }) => {
    const db = getDb();
    const id = uuidv4();
    db.prepare(`
      INSERT INTO contact_messages (id, name, email, phone, subject, message, handled, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?)
    `).run(
      id,
      message.name,
      message.email,
      message.phone || null,
      message.subject || null,
      message.message,
      new Date().toISOString()
    );
    return db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(id) as ContactMessage;
  },

  list: (limit = 200) => {
    const db = getDb();
    return db
      .prepare('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT ?')
      .all(limit) as ContactMessage[];
  },

  markHandled: (id: string, handled: boolean) => {
    const db = getDb();
    db.prepare('UPDATE contact_messages SET handled = ? WHERE id = ?').run(handled ? 1 : 0, id);
  },
};

/** Products at or below this many units trigger the low-stock alert to the shop. */
export const LOW_STOCK_THRESHOLD = 5;

/** The ordered products that have now fallen to or below the threshold. */
export const lowStockAfterOrder = (productIds: string[]) => {
  if (productIds.length === 0) return [];
  const db = getDb();
  const placeholders = productIds.map(() => '?').join(', ');
  return db
    .prepare(`
      SELECT id, name, volume, stock_quantity FROM products
      WHERE id IN (${placeholders}) AND stock_quantity <= ?
      ORDER BY stock_quantity ASC
    `)
    .all(...productIds, LOW_STOCK_THRESHOLD) as Array<{
    id: string;
    name: string;
    volume: string;
    stock_quantity: number;
  }>;
};

/**
 * Records an order and takes the stock off the shelf in one transaction, so a
 * failure part way through cannot leave stock deducted for an order that was
 * never written (or the reverse).
 */
export const placeOrder = (
  order: Parameters<typeof orderOperations.create>[0],
  stockDeductions: Array<{ productId: string; quantity: number }>
) => {
  const db = getDb();
  const now = new Date().toISOString();

  const deduct = db.prepare(`
    UPDATE products
    SET stock_quantity = MAX(0, stock_quantity - ?), updated_at = ?
    WHERE id = ?
  `);

  const run = db.transaction(() => {
    const created = orderOperations.create(order);
    for (const d of stockDeductions) {
      deduct.run(d.quantity, now, d.productId);
    }
    return created;
  });

  return run();
};

/**
 * Deletes an order and puts its stock back on the shelf.
 *
 * Stock is only returned for an order that was never completed. Deleting the
 * record of something already delivered should not invent inventory that has
 * physically left the building.
 *
 * Returns false when there is no such order.
 */
export const deleteOrderRestoringStock = (id: string) => {
  const db = getDb();
  const order = orderOperations.getById(id);
  if (!order) return false;

  const restock = order.status !== 'delivered';
  const now = new Date().toISOString();

  const giveBack = db.prepare(`
    UPDATE products
    SET stock_quantity = stock_quantity + ?, updated_at = ?
    WHERE id = ?
  `);

  const run = db.transaction(() => {
    if (restock) {
      for (const item of order.items) {
        if (item.product_id && item.quantity > 0) {
          giveBack.run(item.quantity, now, item.product_id);
        }
      }
    }
    orderOperations.delete(id);
  });

  run();
  return true;
};

/**
 * Seeds the catalogue when the products table is empty.
 *
 * The data is the client handoff of 18 September 2026, held in
 * database/catalog.json so this and scripts/migrate-catalog.js cannot drift
 * apart. An existing catalogue is never overwritten here — use the migration
 * script for that.
 */
export const seedProducts = () => {
  if (productOperations.count() > 0) return;

  console.log('Seeding catalogue from database/catalog.json...');

  for (const p of catalogData.products) {
    productOperations.create({
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      category: p.category,
      image_url: p.image_url,
      back_image_url: p.back_image_url,
      red_image_url: p.red_image_url,
      red_back_image_url: p.red_back_image_url,
      range_key: p.range_key,
      size_key: p.size_key,
      volume: p.volume,
      sort_order: p.sort_order,
      intro: p.intro,
      colour_note: p.colour_note,
      benefits: p.benefits,
      directions: p.directions,
      usage_note: p.usage_note || null,
      nozzle_included: p.nozzle_included,
      show_size_in_title: p.show_size_in_title,
      stock_quantity: p.stock_quantity,
      directionsForUse: `<ol>${p.directions.map((d: string) => `<li>${d}</li>`).join('')}</ol>`,
    });
  }

  console.log(`Seeded ${catalogData.products.length} products.`);
};

/** Old slug -> current slug, for redirecting links that are already out there. */
export const SLUG_REDIRECTS: Record<string, string> = catalogData.slug_redirects;

export default { getDb, productOperations, orderOperations, seedProducts };
