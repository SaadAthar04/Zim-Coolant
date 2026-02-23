// Update product image URLs to use local files
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'zim-coolant.db');
const db = new Database(dbPath);

// Image URL mappings (slug -> local paths)
const imageUpdates = [
  {
    slug: 'zim-coolant-1l',
    image_url: '/products/zim-coolant-1l.png',
    red_image_url: '/products/zim-coolant-1l-red.png'
  },
  {
    slug: 'zim-coolant-3-75l',
    image_url: '/products/zim-coolant-3-75l.png',
    red_image_url: null
  },
  {
    slug: 'zim-gear-oil',
    image_url: '/products/zim-gear-oil.png',
    red_image_url: null
  },
  {
    slug: 'zim-atf-psf',
    image_url: '/products/zim-atf.png',
    red_image_url: null
  }
];

console.log('Updating image URLs to local paths...\n');

const updateStmt = db.prepare(`
  UPDATE products 
  SET image_url = ?, red_image_url = ?, updated_at = ?
  WHERE slug = ?
`);

for (const update of imageUpdates) {
  const now = new Date().toISOString();
  const result = updateStmt.run(
    update.image_url,
    update.red_image_url,
    now,
    update.slug
  );
  
  if (result.changes > 0) {
    console.log(`✓ Updated: ${update.slug}`);
    console.log(`  - image_url: ${update.image_url}`);
    if (update.red_image_url) {
      console.log(`  - red_image_url: ${update.red_image_url}`);
    }
  } else {
    console.log(`✗ Not found: ${update.slug}`);
  }
}

console.log('\nDone! All images now use local URLs.');
db.close();
