import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us - Zim Chemicals | Premium Automotive Products Since 1988',
  description: 'Learn about Zim Chemicals, a leading manufacturer of premium coolants, ATF, and gear oils. 36+ years of excellence in automotive fluid solutions.',
  openGraph: {
    title: 'About Us - Zim Chemicals',
    description: 'Learn about Zim Chemicals, a leading manufacturer of premium coolants, ATF, and gear oils. 36+ years of excellence in automotive fluid solutions.',
    url: 'https://www.zimchemicals.com/about',
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

