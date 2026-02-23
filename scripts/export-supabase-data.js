// Script to export data from Supabase
// Run with: node scripts/export-supabase-data.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase credentials
const supabaseUrl = 'https://nvwbxrdbppykdguevacb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2J4cmRicHB5a2RndWV2YWNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MDg1MzMsImV4cCI6MjA3MjM4NDUzM30.wZ9q2yvtkIEV3f4uBkLCuSmL37Taggre0naKQCDiMhY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function exportData() {
  console.log('🚀 Starting data export from Supabase...\n');

  try {
    // Export products
    console.log('📦 Fetching products...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');

    if (productsError) {
      console.error('Error fetching products:', productsError);
    } else {
      console.log(`   Found ${products.length} products`);
    }

    // Export orders
    console.log('🛒 Fetching orders...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*');

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
    } else {
      console.log(`   Found ${orders?.length || 0} orders`);
    }

    // Save to JSON file
    const exportData = {
      exportedAt: new Date().toISOString(),
      products: products || [],
      orders: orders || []
    };

    const outputPath = path.join(__dirname, 'supabase-export.json');
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

    console.log(`\n✅ Data exported successfully to: ${outputPath}`);
    console.log('\nSummary:');
    console.log(`   - Products: ${products?.length || 0}`);
    console.log(`   - Orders: ${orders?.length || 0}`);

    // Also print product data for verification
    console.log('\n📋 Products:');
    products?.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} (${p.category}) - Rs. ${p.price}`);
    });

  } catch (error) {
    console.error('Export failed:', error);
    process.exit(1);
  }
}

exportData();
