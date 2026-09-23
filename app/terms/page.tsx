import type { Metadata } from 'next'
import LegalPage, { type LegalSection } from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Terms & Conditions - Zim Chemicals',
  description:
    'The terms governing purchases through zimchemicals.com: ordering, prices, Cash on Delivery, cancellation, shipping, returns and refunds.',
  alternates: { canonical: 'https://www.zimchemicals.com/terms' },
}

// The client's text, supplied 22 September 2026 as "Terms & Conditions,
// Version 1.0". Reproduced as written — their legal wording, not ours to edit.
const sections: LegalSection[] = [
  {
    heading: '1. About these terms',
    body: [
      'ZIM Chemicals operates at zimchemicals.com. ZIM and ZIMX are owned by Nasta Chemicals in Faisalabad, Punjab, Pakistan. These terms govern purchases through our website and should be read with our Shipping Policy and Privacy Policy. They apply from publication on the website.',
    ],
  },
  {
    heading: '2. Ordering and confirmation',
    body: [
      'Provide accurate contact and delivery details and order only if you are legally able to enter a purchase agreement. An order-received email acknowledges your request; it does not confirm acceptance. We accept an order when we issue our confirmation, subject to stock availability and verification. We may decline an order before acceptance if stock is unavailable, details cannot be verified, or there is a genuine pricing error. We will explain material changes and will not substitute products without your agreement.',
    ],
  },
  {
    heading: '3. Prices and payment',
    body: [
      'Prices are in Pakistani rupees (PKR). Cash on Delivery (COD) is currently the only payment method. The total payable, including delivery charges, is shown before you place your order. Delivery is Rs. 300 for orders of Rs. 2,000 or less and free for orders above Rs. 2,000, based on the product subtotal after discounts. Any applicable taxes or charges must be disclosed before purchase. Later price or tax changes do not retrospectively alter a confirmed order.',
    ],
  },
  {
    heading: '4. Cancellation',
    body: [
      'You may cancel by contacting us before we confirm the order. After confirmation, we do not accept change-of-mind cancellations. This restriction does not remove remedies available under applicable law for defective goods, non-delivery or other failures to fulfil an order. If we cannot fulfil a confirmed order, we will contact you and refund any amount already paid for the unfulfilled purchase.',
    ],
  },
  {
    heading: '5. Shipping',
    body: [
      'We ship within Pakistan through Leopards Courier, subject to service availability. Dispatch normally takes 1-2 working days after confirmation. Estimated delivery is a further 2-3 working days after dispatch; these are estimates, not guaranteed dates. The Shipping Policy explains tracking, inspection, delays, redelivery and damage claims.',
    ],
  },
  {
    heading: '6. Returns, seals and refunds',
    body: [
      'We do not accept change-of-mind returns, including unopened bottles. For visible damage, leakage or an incorrect product, inspect the parcel after payment and report the issue on the delivery day through WhatsApp. Include your order number and clear photographs of the packaging, shipping label, bottle and seals. Preserve everything as received and contact us before sending anything back.',
      'Each bottle has a plastic cap seal and an aluminium inner seal. Do not break intact seals merely to prepare a return. Customer opening, use or tampering does not qualify for a change-of-mind refund. However, a seal damaged on arrival, a leaking bottle or a genuine defect is not automatically excluded because a seal is broken. We assess the condition on arrival and the available evidence. Same-day reporting helps investigation of visible delivery issues; it does not exclude applicable legal rights or defects that could not reasonably be discovered that day.',
      'For an approved damaged, leaking or incorrect shipment, we arrange the appropriate return and refund assistance and cover associated delivery and authorized return costs. Refunds are issued through JazzCash or bank transfer within 3 calendar days after approval, using the correct recipient details you provide. For a fully refunded faulty shipment, the refund includes any original delivery/COD delivery charge you paid. Contact us for instructions before returning a leaking or unsafe parcel. Full procedures appear in the Shipping Policy.',
    ],
  },
  {
    heading: '7. Product selection and use',
    body: [
      'Choose products by their stated specifications and your vehicle manufacturer’s requirements, not by colour alone. Follow the label and relevant vehicle instructions. ZIM Anti-Rust Coolant and ZIMX Anti-Freeze & Anti-Boil are distinct ranges. Images illustrate the product; screen colour may vary, but supplied goods must match their description. We offer no additional commercial warranty unless expressly stated in writing. This does not exclude responsibility for defective or misdescribed goods or rights provided by law.',
    ],
  },
  {
    heading: '8. Website content and lawful use',
    body: [
      'Our branding, images and website content may not be reproduced for commercial use without permission or another lawful basis. Do not misuse the site, submit fraudulent orders, interfere with its operation or access information without authorization.',
    ],
  },
  {
    heading: '9. Law, complaints and changes',
    body: [
      'Applicable laws of Pakistan, including relevant Punjab consumer-protection law, govern these terms. Nothing here excludes liability or consumer rights that cannot lawfully be excluded. Contact us first so we can investigate a complaint; this does not restrict access to competent courts or consumer authorities. Updated terms apply to future orders from publication. The terms applicable when your order was accepted continue to govern that order.',
      'Nasta Chemicals, owner of ZIM and ZIMX — Faisalabad, Punjab, Pakistan. Email: info@zimchemicals.com. WhatsApp / phone: +92 333-1632138. Website: zimchemicals.com',
    ],
  },
]

export default function Terms() {
  return (
    <LegalPage
      title="Terms &"
      titleAccent="Conditions"
      intro="The terms governing purchases through our website. Please read them with our Shipping Policy and Privacy Policy."
      lastUpdated="22 September 2026 (Version 1.0)"
      sections={sections}
    />
  )
}
