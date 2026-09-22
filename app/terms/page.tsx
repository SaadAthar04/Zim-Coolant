import type { Metadata } from 'next'
import LegalPage, { type LegalSection } from '@/components/LegalPage'
import {
  FREE_SHIPPING_THRESHOLD,
  PAYMENT_METHOD_LABEL,
  SHIPPING_FLAT_RATE,
  formatPrice,
} from '@/lib/store-config'

export const metadata: Metadata = {
  title: 'Terms of Service - Zim Chemicals',
  description:
    'The terms that apply when you browse www.zimchemicals.com or place an order for coolants, ATF, and gear oils.',
  alternates: { canonical: 'https://www.zimchemicals.com/terms' },
}

const sections: LegalSection[] = [
  {
    heading: 'Agreement to These Terms',
    body: [
      'These terms apply to everyone who uses www.zimchemicals.com or buys from us. By browsing the site or placing an order, you accept them. If you do not agree, please do not use the site.',
      'Zim Chemicals is based in Faisalabad, Pakistan, and manufactures and supplies coolants, automatic transmission fluids, and gear oils.',
    ],
  },
  {
    heading: 'Products and Descriptions',
    body: [
      'We describe our products as accurately as we can, but packaging, labels, and product photographs may differ slightly from what you receive. Colours can also vary between screens.',
      'Our fluids are formulated for both passenger and commercial vehicles, but not every product suits every vehicle. Please check your owner’s manual, or contact us, before buying — we are happy to help you choose the right coolant, ATF, or gear oil for your make and model.',
    ],
  },
  {
    heading: 'Prices and Availability',
    body: [
      'All prices are in Pakistani Rupees (PKR) and include any applicable taxes unless stated otherwise. We may change prices, and we may add, alter, or withdraw products, at any time without notice.',
      'Products are subject to availability. If an item turns out to be out of stock after you order, we will contact you to arrange a replacement or cancel that item.',
    ],
  },
  {
    heading: 'Placing an Order',
    body: [
      'Your order is an offer to buy. It is accepted once we confirm it — you will receive a confirmation email at the address you gave us. Please make sure your name, phone number, and delivery address are correct, as we rely on them to reach you.',
      'We may decline or cancel an order where a product is unavailable, where we cannot deliver to your address, where the pricing was clearly wrong, or where we suspect fraudulent or abusive use.',
    ],
  },
  {
    heading: 'Payment',
    body: [
      `We accept ${PAYMENT_METHOD_LABEL}. You pay the courier in full, in cash, when your order is handed to you. We do not collect card or bank details through this website.`,
      'Please have the exact amount ready where possible. An order that cannot be paid for on delivery will be returned to us.',
    ],
  },
  {
    heading: 'Delivery',
    body: [
      `Delivery is charged at a flat ${formatPrice(SHIPPING_FLAT_RATE)}, and is free on orders of ${formatPrice(FREE_SHIPPING_THRESHOLD)} or more. The charge that applies to your order is shown at checkout before you confirm it.`,
      'We deliver across Pakistan. Delivery times are estimates, not guarantees — they depend on your location and the courier, and can be affected by weather, holidays, and other events outside our control.',
      'Someone must be available at the delivery address to receive the order and pay the courier. If delivery fails because nobody is available or the address is wrong, we may ask you to cover the cost of redelivery.',
    ],
  },
  {
    heading: 'Returns and Damaged Goods',
    body: [
      'Please check your order in front of the courier. If anything arrives damaged, leaking, or is not what you ordered, contact us within 48 hours of delivery at contact@zimchemicals.com or +92 333-1632138, with your order number and photographs, and we will replace it or refund you.',
      'For safety reasons, opened or part-used containers of automotive fluid cannot be returned unless the product itself is faulty. Unopened products in their original, undamaged packaging may be returned within 7 days of delivery; return shipping is at your cost unless the fault was ours.',
    ],
  },
  {
    heading: 'Safe Use of Our Products',
    body: [
      'Automotive fluids are chemical products. Always read and follow the instructions and safety warnings on the label, use the product only for its intended purpose, and keep it out of reach of children and animals.',
      'We are not responsible for damage or injury caused by using a product in a vehicle it was not intended for, by ignoring the instructions on the label, or by incorrect installation or servicing.',
    ],
  },
  {
    heading: 'Your Use of This Website',
    body: [
      'You agree to use this site lawfully, to give accurate information when you order or contact us, and not to attempt to disrupt, damage, or gain unauthorised access to the site or its systems.',
    ],
  },
  {
    heading: 'Intellectual Property',
    body: [
      'The Zim name and logo, and the text, images, and design of this website, belong to Zim Chemicals. You may not copy, reproduce, or use them commercially without our written permission.',
    ],
  },
  {
    heading: 'Limitation of Liability',
    body: [
      'To the extent permitted by law, our liability for any order is limited to the amount you paid for the products in that order. We are not liable for indirect or consequential losses, such as lost time, lost income, or vehicle downtime.',
      'Nothing in these terms limits any right you have under the consumer protection laws of Pakistan.',
    ],
  },
  {
    heading: 'Governing Law',
    body: [
      'These terms are governed by the laws of the Islamic Republic of Pakistan, and any dispute will be subject to the jurisdiction of the courts of Faisalabad.',
    ],
  },
  {
    heading: 'Changes to These Terms',
    body: [
      'We may update these terms from time to time. The version published on this page at the moment you place an order is the one that applies to that order.',
    ],
  },
  {
    heading: 'Contact Us',
    body: [
      'Questions about these terms or about an order? Email contact@zimchemicals.com, call +92 333-1632138 (Mon–Sun, 9AM–8PM), or visit us in Faisalabad, Pakistan.',
    ],
  },
]

export default function Terms() {
  return (
    <LegalPage
      title="Terms of"
      titleAccent="Service"
      intro="The terms that apply when you browse this site or place an order with us — written plainly, so you know where you stand."
      lastUpdated="22 September 2026"
      sections={sections}
    />
  )
}
