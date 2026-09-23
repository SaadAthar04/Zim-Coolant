import type { Metadata } from 'next'
import LegalPage, { type LegalSection } from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy - Zim Chemicals',
  description:
    'How Nasta Chemicals handles information connected with orders, delivery and customer support on zimchemicals.com.',
  alternates: { canonical: 'https://www.zimchemicals.com/privacy' },
}

// The client's text, supplied 22 September 2026 as "Privacy Policy, Version 1.0".
// Reproduced as written: this is their legal wording, not ours to tidy. Section
// numbers are kept because the Terms and Shipping Policy refer across to them.
const sections: LegalSection[] = [
  {
    heading: '1. Who handles your information',
    body: [
      'Nasta Chemicals owns ZIM and ZIMX and operates zimchemicals.com from Faisalabad, Punjab, Pakistan. This policy explains how we handle information connected with website orders, delivery and customer support. For privacy enquiries, contact info@zimchemicals.com or +92 333-1632138. This policy applies from publication on the website.',
    ],
  },
  {
    heading: '2. Information you provide',
    body: [
      'We collect the name, delivery address, phone number, email address and order details needed to process your purchase and arrange delivery. If you contact us, we also receive the messages and supporting material you send, such as photographs of a damaged parcel. For a refund, we request the bank-account or JazzCash recipient details needed to send it. Never send passwords, PINs or one-time security codes. COD checkout does not require payment-card details.',
    ],
  },
  {
    heading: '3. How we use it',
    body: [
      'We use this information to receive and confirm orders, arrange delivery, send tracking and order updates, respond to enquiries, investigate damage claims, process refunds, prevent misuse and maintain necessary business records. We do not currently run promotional email campaigns. If we introduce promotional emails, we will request separate marketing permission and include an unsubscribe option in each promotional email. Necessary order and support messages are separate from marketing.',
    ],
  },
  {
    heading: '4. Service providers and sharing',
    body: [
      'We use Hostinger for website hosting. Information needed to deliver your order is shared with Leopards Courier, such as your name, address, phone number and COD amount. Hosting, email and other providers supporting the store may process information needed to perform their services. Banks or JazzCash process the recipient and transaction information required for refunds. We may also disclose information where required by law or reasonably needed to investigate fraud or resolve a dispute. Provider infrastructure may process information outside Pakistan.',
    ],
  },
  {
    heading: '5. Technical information and cookies',
    body: [
      'Website infrastructure may process technical information, such as IP addresses, browser details, request times and error logs, to operate and secure the site. Cookies or similar browser storage may support functions such as the shopping cart and session. You can manage browser storage through your browser settings; disabling it may affect store functions.',
    ],
  },
  {
    heading: '6. Planned Google Analytics',
    body: [
      'We plan to introduce Google Analytics to understand website visits and improve the store. This statement does not mean Analytics is already active. Before activation, this policy and relevant cookie notices will be updated to explain the actual setup and choices available. When enabled, Analytics may collect usage events, page visits, device/browser information and identifiers using cookies or similar technology. Google explains its handling of partner-site information at policies.google.com/technologies/partner-sites. Google’s browser opt-out tool is available at tools.google.com/dlpage/gaoptout.',
    ],
  },
  {
    heading: '7. Retention and security',
    body: [
      'We retain personal information for as long as reasonably needed for order fulfilment, support, refunds, record-keeping, dispute resolution and applicable legal obligations. Retention periods depend on the record type, purpose and applicable requirements. When information is no longer needed for these purposes, we delete or anonymize it. No internet service can guarantee absolute security. Please avoid sending sensitive information unrelated to your request.',
    ],
  },
  {
    heading: '8. Your requests',
    body: [
      'Contact info@zimchemicals.com to request access to, correction of, or deletion of information relating to you, or to raise a privacy concern. We may need to verify your identity before acting. Some records may need to be retained to fulfil an order, resolve a dispute or comply with legal obligations; we will explain relevant limitations. Do not send unnecessary identity documents unless we explain why verification is needed.',
    ],
  },
  {
    heading: '9. External services and children',
    body: [
      'If you contact us through WhatsApp, or follow a courier or other external link, that service also handles information under its own privacy terms. Our store is intended for purchases by adults legally able to enter a contract. We do not intentionally seek personal information from children; contact us if you believe a child has supplied information that should be reviewed or removed.',
    ],
  },
  {
    heading: '10. Changes and contact',
    body: [
      'We will update this policy when our practices change and show the updated date. Material new uses of information will be explained and permission sought where required. For questions or concerns, contact us using the details below.',
      'Nasta Chemicals, owner of ZIM and ZIMX — Faisalabad, Punjab, Pakistan. Email: info@zimchemicals.com. WhatsApp / phone: +92 333-1632138. Website: zimchemicals.com',
    ],
  },
]

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy"
      titleAccent="Policy"
      intro="How we handle the information connected with your order, delivery and support."
      lastUpdated="22 September 2026 (Version 1.0)"
      sections={sections}
    />
  )
}
