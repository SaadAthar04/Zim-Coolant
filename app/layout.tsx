import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zim Coolant - Premium Engine Oil & Coolant Solutions',
  description: 'Discover premium quality engine oils and coolants for optimal vehicle performance. Professional-grade products for automotive excellence.',
  keywords: 'coolant, engine oil, automotive, vehicle maintenance, premium oil, coolant solutions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        {children}
      </body>
    </html>
  )
}
