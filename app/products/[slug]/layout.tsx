import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params

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

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

