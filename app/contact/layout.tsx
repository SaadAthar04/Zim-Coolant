import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us - Zim Chemicals | Get in Touch',
  description: 'Contact Zim Chemicals for premium automotive products. Located in Faisalabad, Pakistan. Call us at +92 326-8871985 or email contact@zimchemicals.com',
  openGraph: {
    title: 'Contact Us - Zim Chemicals',
    description: 'Contact Zim Chemicals for premium automotive products. Located in Faisalabad, Pakistan.',
    url: 'https://www.zimchemicals.com/contact',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

