// Migrate products from Supabase JSON to SQLite
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Get database path
const dbPath = path.join(__dirname, '..', 'database', 'zim-coolant.db');

// Create database connection
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Read products from JSON
const jsonPath = path.join(__dirname, 'supabase-products.json');
const products = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log(`Found ${products.length} products to migrate from Supabase`);
console.log('');

// Clear existing products
console.log('Clearing existing products...');
db.exec('DELETE FROM products');

// Prepare insert statement
const insertStmt = db.prepare(`
  INSERT INTO products (id, name, slug, description, price, category, image_url, red_image_url, stock_quantity, specifications, directionsForUse, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Import products
let imported = 0;

for (const product of products) {
  try {
    insertStmt.run(
      product.id,
      product.name,
      product.slug,
      product.description,
      product.price,
      product.category,
      product.image_url,
      product.red_image_url || null,
      product.stock_quantity || 0,
      null, // specifications (not in Supabase data)
      product.directionsForUse || null,
      product.created_at,
      product.updated_at
    );
    
    console.log(`✓ Imported: ${product.name}`);
    console.log(`  - Slug: ${product.slug}`);
    console.log(`  - Price: Rs. ${product.price}`);
    console.log(`  - Category: ${product.category}`);
    console.log(`  - Stock: ${product.stock_quantity}`);
    console.log('');
    imported++;
  } catch (error) {
    console.error(`✗ Error importing ${product.name}: ${error.message}`);
  }
}

console.log('Migration complete!');
console.log(`Total imported: ${imported}/${products.length}`);

db.close();
