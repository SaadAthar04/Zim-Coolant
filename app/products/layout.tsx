import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Products - Zim Chemicals | Premium Coolants, ATF & Gear Oils',
  description: 'Browse our complete range of premium automotive products including coolants, automatic transmission fluids (ATF), and gear oils. Quality guaranteed.',
  openGraph: {
    title: 'Products - Zim Chemicals',
    description: 'Browse our complete range of premium automotive products including coolants, ATF, and gear oils.',
    url: 'https://www.zimchemicals.com/products',
  },
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

