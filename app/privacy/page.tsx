import type { Metadata } from 'next'
import LegalPage, { type LegalSection } from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy - Zim Chemicals',
  description:
    'How Zim Chemicals collects, uses, and protects the personal information you share when you place an order or contact us.',
  alternates: { canonical: 'https://www.zimchemicals.com/privacy' },
}

const sections: LegalSection[] = [
  {
    heading: 'Who We Are',
    body: [
      'Zim Chemicals manufactures and sells coolants, automatic transmission fluids, and gear oils from Faisalabad, Pakistan. This policy explains what personal information we collect through www.zimchemicals.com, why we collect it, and what we do with it.',
      'By using this website or placing an order with us, you agree to the practices described below.',
    ],
  },
  {
    heading: 'Information We Collect',
    body: ['We only ask for what we need to fulfil your order and answer your questions:'],
    bullets: [
      'Order details — your name, email address, phone number, delivery address, city, and any notes you add at checkout.',
      'Enquiries — the name, email address, phone number, and message you submit through our contact form.',
      'Website usage — anonymous statistics such as pages visited and approximate location, collected through Google Analytics to help us improve the site.',
      'Your cart — the items you add are stored in your own browser so the cart is still there when you come back. This never leaves your device until you place the order.',
    ],
  },
  {
    heading: 'How We Use Your Information',
    bullets: [
      'To process, pack, and deliver the orders you place.',
      'To send you an order confirmation and to contact you about the status of your order.',
      'To answer questions you send us about products, bulk pricing, or technical support.',
      'To understand how the website is used so we can improve it.',
    ],
    body: [
      'We do not sell, rent, or trade your personal information, and we do not send marketing emails unless you have asked us to.',
    ],
  },
  {
    heading: 'Who We Share It With',
    body: [
      'Your details are shared only with the people needed to get your order to you — our delivery partners and couriers, and the email provider that sends your order confirmation. Each receives only what is necessary for that purpose.',
      'We may also disclose information where the law requires it, or where it is necessary to protect our rights, our customers, or the public.',
    ],
  },
  {
    heading: 'Payment Information',
    body: [
      'We accept Cash on Delivery. You pay the courier directly when your order arrives, which means we never ask for, receive, or store your card or bank details on this website.',
    ],
  },
  {
    heading: 'Cookies and Analytics',
    body: [
      'This site uses Google Analytics, which sets cookies to record anonymous usage statistics. We also use your browser’s local storage to remember your shopping cart. You can block or clear cookies in your browser settings at any time; doing so may mean your cart is not remembered between visits.',
    ],
  },
  {
    heading: 'How Long We Keep It',
    body: [
      'Order records are kept for as long as we need them for our accounts, warranty claims, and any legal obligations. Contact enquiries are kept only for as long as it takes to deal with them.',
    ],
  },
  {
    heading: 'Keeping Your Information Safe',
    body: [
      'We take reasonable technical and organisational measures to protect the information you give us, and access is limited to the staff who need it. No website can promise perfect security, but we treat your details with care and act quickly if anything goes wrong.',
    ],
  },
  {
    heading: 'Your Rights',
    body: [
      'You can ask us for a copy of the personal information we hold about you, ask us to correct anything that is wrong, or ask us to delete it where we are not required to keep it. Email us at contact@zimchemicals.com and we will respond within a reasonable time.',
    ],
  },
  {
    heading: "Children's Privacy",
    body: [
      'This website is intended for adults. We do not knowingly collect personal information from children under 18. If you believe a child has provided us with their details, please contact us and we will remove them.',
    ],
  },
  {
    heading: 'Changes to This Policy',
    body: [
      'We may update this policy from time to time. Any changes will appear on this page with a new “last updated” date, so please check back occasionally.',
    ],
  },
  {
    heading: 'Contact Us',
    body: [
      'If you have questions about this policy or about how we handle your information, reach us at contact@zimchemicals.com, call +92 333-1632138 (Mon–Sun, 9AM–8PM), or write to us in Faisalabad, Pakistan.',
    ],
  },
]

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy"
      titleAccent="Policy"
      intro="We keep this simple: we collect only what we need to get your order to you, and we never sell your information."
      lastUpdated="22 September 2026"
      sections={sections}
    />
  )
}
