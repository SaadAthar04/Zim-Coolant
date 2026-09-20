#!/usr/bin/env node
/**
 * Applies the client handoff of 18 September 2026 to the products table.
 *
 * What it does
 *  - backs the database up first, into database/backups/
 *  - rebuilds `products` so the category CHECK accepts the new range names and
 *    so the extra variant columns exist (SQLite cannot ALTER a CHECK in place)
 *  - writes the six sellable product lines from database/catalog.json
 *
 * Existing product IDs are preserved by slug, and zim-coolant-3-75l carries its
 * ID over to zim-coolant-4l, so items inside historic orders still resolve to a
 * real product. The orders table is never touched.
 *
 * Safe to run more than once.
 *
 * Runs on the deploy host as well as locally: it prefers better-sqlite3 and
 * falls back to Node's built-in node:sqlite, so it does not depend on the
 * native module having been compiled for the running Node version.
 *
 * Usage: node scripts/migrate-catalog.js
 */

const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');

const ROOT = path.join(__dirname, '..');
const DB_PATH = path.join(ROOT, 'database', 'zim-coolant.db');
const CATALOG_PATH = path.join(ROOT, 'database', 'catalog.json');
const BACKUP_DIR = path.join(ROOT, 'database', 'backups');
const PUBLIC_DIR = path.join(ROOT, 'public');

const CATEGORIES = [
  'Anti-Freeze & Anti-Boil',
  'Radiator Coolant',
  'Gear Oil',
  'Transmission Fluid',
];

/**
 * Opens the database through whichever SQLite binding this Node can load.
 * Both backends are driven with positional (?) parameters only, so the calling
 * code is identical either way.
 */
function openDatabase(file) {
  try {
    const Database = require('better-sqlite3');
    const db = new Database(file);
    db.pragma('journal_mode = WAL');
    return {
      driver: 'better-sqlite3',
      exec: (sql) => db.exec(sql),
      run: (sql, params = []) => db.prepare(sql).run(...params),
      all: (sql, params = []) => db.prepare(sql).all(...params),
      get: (sql, params = []) => db.prepare(sql).get(...params),
      close: () => db.close(),
    };
  } catch (err) {
    let DatabaseSync;
    try {
      ({ DatabaseSync } = require('node:sqlite'));
    } catch {
      console.error('No usable SQLite binding.');
      console.error('better-sqlite3 failed to load: ' + err.message);
      console.error('and node:sqlite is unavailable on Node ' + process.version + '.');
      process.exit(1);
    }
    const db = new DatabaseSync(file);
    db.exec('PRAGMA journal_mode = WAL');
    return {
      driver: 'node:sqlite',
      exec: (sql) => db.exec(sql),
      run: (sql, params = []) => db.prepare(sql).run(...params),
      all: (sql, params = []) => db.prepare(sql).all(...params),
      get: (sql, params = []) => db.prepare(sql).get(...params),
      close: () => db.close(),
    };
  }
}

const CREATE_PRODUCTS = `
  CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL CHECK(category IN (${CATEGORIES.map((c) => `'${c.replace(/'/g, "''")}'`).join(', ')})),
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
`;

/** Legacy slug whose product record continues under a new slug. */
const SLUG_CARRYOVER = { 'zim-coolant-4l': 'zim-coolant-3-75l' };

const directionsToHtml = (steps) =>
  `<ol>${steps.map((s) => `<li>${s}</li>`).join('')}</ol>`;

function backup(db) {
  if (!fs.existsSync(DB_PATH)) return null;
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dest = path.join(BACKUP_DIR, `zim-coolant-${stamp}.db`);
  db.exec(`VACUUM INTO '${dest.replace(/'/g, "''")}'`);
  return dest;
}

function main() {
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const products = catalog.products;

  // Every image the catalogue points at must exist, or the storefront would
  // ship with broken product photos.
  const missing = [];
  for (const p of products) {
    for (const key of ['image_url', 'back_image_url', 'red_image_url', 'red_back_image_url']) {
      const rel = p[key];
      if (rel && !fs.existsSync(path.join(PUBLIC_DIR, rel))) {
        missing.push(`${p.slug}.${key} -> ${rel}`);
      }
    }
  }
  if (!fs.existsSync(path.join(PUBLIC_DIR, 'products', 'zimx-nozzle.webp'))) {
    missing.push('nozzle -> /products/zimx-nozzle.webp');
  }
  if (missing.length) {
    console.error('Aborting: the catalogue references images that are not in /public:');
    missing.forEach((m) => console.error('  ' + m));
    process.exit(1);
  }

  const db = openDatabase(DB_PATH);
  console.log(`SQLite driver: ${db.driver}`);

  const backupPath = backup(db);
  if (backupPath) console.log('Backed up database to ' + path.relative(ROOT, backupPath));

  // Carry existing IDs across so historic order line items still resolve.
  const existingIds = {};
  const hasProducts = db.get(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='products'"
  );
  if (hasProducts) {
    for (const row of db.all('SELECT id, slug FROM products')) {
      existingIds[row.slug] = row.id;
    }
  }

  const now = new Date().toISOString();

  db.exec('BEGIN');
  try {
    db.exec('DROP TABLE IF EXISTS products');
    db.exec(CREATE_PRODUCTS);
    db.exec('CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_products_range ON products(range_key)');

    const sql = `
      INSERT INTO products (
        id, name, slug, description, price, category,
        image_url, back_image_url, red_image_url, red_back_image_url,
        range_key, size_key, volume, sort_order,
        intro, colour_note, benefits, directions, usage_note,
        nozzle_included, show_size_in_title,
        stock_quantity, specifications, directionsForUse, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const p of products) {
      const id =
        existingIds[p.slug] || existingIds[SLUG_CARRYOVER[p.slug]] || randomUUID();

      const specifications = {};
      if (p.volume) specifications.volume = p.volume;
      if (p.red_image_url) specifications.colours = ['green', 'red'];

      db.run(sql, [
        id,
        p.name,
        p.slug,
        p.description,
        p.price,
        p.category,
        p.image_url,
        p.back_image_url,
        p.red_image_url,
        p.red_back_image_url,
        p.range_key,
        p.size_key,
        p.volume,
        p.sort_order,
        p.intro,
        p.colour_note,
        JSON.stringify(p.benefits),
        JSON.stringify(p.directions),
        p.usage_note || null,
        p.nozzle_included,
        p.show_size_in_title,
        p.stock_quantity,
        Object.keys(specifications).length ? JSON.stringify(specifications) : null,
        directionsToHtml(p.directions),
        now,
        now,
      ]);
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  const rows = db.all(
    'SELECT slug, name, price, category, stock_quantity FROM products ORDER BY sort_order'
  );
  console.log(`\nCatalogue now holds ${rows.length} products:`);
  for (const r of rows) {
    console.log(
      `  ${r.slug.padEnd(30)} ${String(r.price).padStart(5)} PKR  ${r.category.padEnd(24)} stock ${r.stock_quantity}`
    );
  }

  const orders = db.get('SELECT COUNT(*) AS n FROM orders');
  console.log(`\nOrders table untouched: ${orders ? orders.n : 0} row(s).`);

  db.close();
}

main();
