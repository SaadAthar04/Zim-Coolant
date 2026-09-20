import { NextRequest, NextResponse } from 'next/server';
import { productOperations, seedProducts } from '@/lib/database';
import { requireAdmin } from '@/lib/admin-auth';

// GET /api/products - Get all products
export async function GET(request: NextRequest) {
  try {
    // Ensure products are seeded
    seedProducts();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const slug = searchParams.get('slug');

    if (slug) {
      const product = productOperations.getBySlug(slug);
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ data: product });
    }

    if (category) {
      const products = productOperations.getByCategory(category);
      return NextResponse.json({ data: products });
    }

    const products = productOperations.getAll();
    return NextResponse.json({ data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/products - Create a new product (admin only)
export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const requiredFields = ['name', 'slug', 'description', 'price', 'category', 'image_url'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const product = productOperations.create({
      name: body.name,
      slug: body.slug,
      description: body.description,
      price: body.price,
      category: body.category,
      image_url: body.image_url,
      back_image_url: body.back_image_url,
      red_image_url: body.red_image_url,
      red_back_image_url: body.red_back_image_url,
      range_key: body.range_key,
      size_key: body.size_key,
      volume: body.volume,
      sort_order: body.sort_order,
      intro: body.intro,
      colour_note: body.colour_note,
      benefits: body.benefits,
      directions: body.directions,
      usage_note: body.usage_note,
      nozzle_included: body.nozzle_included,
      show_size_in_title: body.show_size_in_title,
      stock_quantity: body.stock_quantity || 0,
      specifications: body.specifications,
      directionsForUse: body.directionsForUse
    });

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
