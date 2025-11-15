import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import Script from 'next/script'

type Props = {
  params: Promise<{ slug: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params

  try {
    const { data: product } = await supabase
      .from('products')
      .select('name, description, image_url, category, price')
      .eq('slug', slug)
      .single()

    if (product) {
      return {
        title: `${product.name} - Zim Chemicals | Premium Automotive Products`,
        description: product.description 
          ? `${product.description.substring(0, 160)}...` 
          : `Buy ${product.name} from Zim Chemicals. Premium quality ${product.category.toLowerCase()} for optimal vehicle performance.`,
        openGraph: {
          title: `${product.name} - Zim Chemicals`,
          description: product.description 
            ? `${product.description.substring(0, 160)}...` 
            : `Buy ${product.name} from Zim Chemicals. Premium quality ${product.category.toLowerCase()}.`,
          url: `https://www.zimchemicals.com/products/${slug}`,
          images: product.image_url ? [
            {
              url: product.image_url,
              width: 800,
              height: 600,
              alt: product.name,
            },
          ] : [],
        },
      }
    }
  } catch (error) {
    // Fallback metadata if product not found
  }

  return {
    title: 'Product - Zim Chemicals',
    description: 'Premium automotive products from Zim Chemicals',
  }
}

export default async function ProductLayout({ params, children }: Props) {
  const { slug } = await params
  
  // Fetch product data for structured data
  let product = null
  try {
    const { data } = await supabase
      .from('products')
      .select('name, description, image_url, category, price, slug')
      .eq('slug', slug)
      .single()
    
    product = data
  } catch (error) {
    // Product not found, continue without structured data
  }

  // Generate JSON-LD structured data for Google
  const jsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} - Premium ${product.category} from Zim Chemicals`,
    image: product.image_url,
    brand: {
      '@type': 'Brand',
      name: 'Zim Chemicals',
    },
    category: product.category,
    offers: {
      '@type': 'Offer',
      // Price hidden temporarily
      // price: product.price,
      // priceCurrency: 'PKR',
      availability: 'https://schema.org/InStock',
      url: `https://www.zimchemicals.com/products/${product.slug}`,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '200',
    },
  } : null

  return (
    <>
      {jsonLd && (
        <Script
          id="product-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  )
}

