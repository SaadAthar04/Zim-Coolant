import type { Metadata } from 'next'
import './globals.css'
import { NavbarProvider } from '@/lib/navbar-context'

export const metadata: Metadata = {
  title: 'Zim Chemicals - Premium Automotive Products',
  description: 'Discover premium quality engine oils and coolants for optimal vehicle performance. Professional-grade products for automotive excellence.',
  keywords: 'coolant, engine oil, automotive, vehicle maintenance, premium oil, coolant solutions',
  icons: {
    icon: [
      { url: '/FavIcon.png', sizes: '32x32', type: 'image/png' },
      { url: '/FavIcon.png', sizes: '16x16', type: 'image/png' },
      { url: '/FavIcon.png', sizes: '192x192', type: 'image/png' },
      { url: '/FavIcon.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/FavIcon.png',
    apple: [
      { url: '/FavIcon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Zim Chemicals - Premium Automotive Products',
    description: 'Discover premium quality engine oils and coolants for optimal vehicle performance. Professional-grade products for automotive excellence.',
    url: 'https://www.zimchemicals.com',
    siteName: 'Zim Chemicals',
    images: [
      {
        url: '/FavIcon.png',
        width: 512,
        height: 512,
        alt: 'Zim Chemicals Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Zim Chemicals - Premium Automotive Products',
    description: 'Discover premium quality engine oils and coolants for optimal vehicle performance.',
    images: ['/FavIcon.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'az65QdQ6oUGcPsorIheyPMLrHjqIWyfLhPxiO2Mjg3Y',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <NavbarProvider>
          {children}
        </NavbarProvider>
      </body>
    </html>
  )
}
