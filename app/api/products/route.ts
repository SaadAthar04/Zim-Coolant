import { NextRequest, NextResponse } from 'next/server';
import { productOperations, seedProducts } from '@/lib/database';

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

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
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
      red_image_url: body.red_image_url,
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
