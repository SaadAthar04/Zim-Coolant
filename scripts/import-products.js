// Script to import products from JSON file
// Usage: node scripts/import-products.js [path-to-json]
//
// JSON format:
// {
//   "products": [
//     {
//       "name": "Product Name",
//       "slug": "product-slug",
//       "description": "Description",
//       "price": 500,
//       "category": "Coolant",
//       "image_url": "https://...",
//       "red_image_url": "https://...",
//       "stock_quantity": 100,
//       "specifications": {...},
//       "directionsForUse": "..."
//     }
//   ]
// }

const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Get database path
const dbPath = path.join(__dirname, '..', 'database', 'zim-coolant.db');

// Create database connection
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize database schema if needed
db.exec(`
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

// Get JSON file path from command line
const jsonPath = process.argv[2];

if (!jsonPath) {
  console.log('Usage: node scripts/import-products.js <path-to-json>');
  console.log('');
  console.log('Example JSON format:');
  console.log(`{
  "products": [
    {
      "name": "Zim Coolant Green - 1L",
      "slug": "zim-coolant-green-1l",
      "description": "Premium engine coolant",
      "price": 450,
      "category": "Coolant",
      "image_url": "https://example.com/image.png",
      "stock_quantity": 100
    }
  ]
}`);
  process.exit(1);
}

// Read and parse JSON file
let data;
try {
  const content = fs.readFileSync(jsonPath, 'utf8');
  data = JSON.parse(content);
} catch (error) {
  console.error('Error reading JSON file:', error.message);
  process.exit(1);
}

const products = data.products || [];
console.log(`Found ${products.length} products to import`);

// Prepare insert statement
const insertStmt = db.prepare(`
  INSERT OR REPLACE INTO products (id, name, slug, description, price, category, image_url, red_image_url, stock_quantity, specifications, directionsForUse, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Import products
let imported = 0;
let errors = 0;

for (const product of products) {
  try {
    const now = new Date().toISOString();
    const id = product.id || uuidv4();
    
    insertStmt.run(
      id,
      product.name,
      product.slug,
      product.description,
      product.price,
      product.category,
      product.image_url,
      product.red_image_url || null,
      product.stock_quantity || 0,
      product.specifications ? JSON.stringify(product.specifications) : null,
      product.directionsForUse || null,
      product.created_at || now,
      product.updated_at || now
    );
    
    console.log(`✓ Imported: ${product.name}`);
    imported++;
  } catch (error) {
    console.error(`✗ Error importing ${product.name}: ${error.message}`);
    errors++;
  }
}

console.log('');
console.log('Import complete:');
console.log(`  Imported: ${imported}`);
console.log(`  Errors: ${errors}`);

db.close();
