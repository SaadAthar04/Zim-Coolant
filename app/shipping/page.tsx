import type { Metadata } from 'next'
import LegalPage, { type LegalSection } from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Shipping Policy - Zim Chemicals',
  description:
    'Delivery coverage and charges, dispatch and tracking times, inspection on the delivery day, damage claims, authorized returns and refunds.',
  alternates: { canonical: 'https://www.zimchemicals.com/shipping' },
}

// The client's text, supplied 22 September 2026 as "Shipping Policy,
// Version 1.0". Reproduced as written — their legal wording, not ours to edit.
const sections: LegalSection[] = [
  {
    heading: '1. Delivery coverage and charges',
    body: [
      'We deliver across Pakistan through Leopards Courier, subject to the courier serving the destination. If an address cannot be served, we will contact you before dispatch to discuss the available options. Delivery costs Rs. 300 for orders of Rs. 2,000 or less. Orders above Rs. 2,000 receive free delivery. Eligibility is calculated using the product subtotal after discounts, excluding delivery charges.',
    ],
  },
  {
    heading: '2. Dispatch, transit and tracking',
    body: [
      'Orders normally dispatch within 1-2 working days after confirmation. Delivery is estimated at 2-3 additional working days after dispatch. Allow approximately 3-5 working days from confirmation in normal circumstances. Sundays, public holidays, remote locations, severe weather and courier disruptions can extend these estimates. Tracking details and a tracking link are sent by email after dispatch. If tracking stops updating or delivery is delayed, contact us for assistance.',
    ],
  },
  {
    heading: '3. Payment and cancellation',
    body: [
      'Payment is Cash on Delivery. Leopards does not permit opening the parcel before payment. You may cancel only before we confirm the order; change-of-mind cancellation is not available after confirmation. This does not restrict applicable remedies for non-delivery or defective goods.',
    ],
  },
  {
    heading: '4. Missed delivery and reshipping',
    body: [
      'Provide a complete address and an accessible phone number. If a parcel is returned because you missed delivery or supplied incorrect details, a new shipment carries a Rs. 300 reshipping charge, including where the original order qualified for free delivery. We will confirm the reshipping arrangement with you first. This charge does not apply to redelivery needed because of our error or a courier-caused failure.',
    ],
  },
  {
    heading: '5. Inspect on the delivery day',
    body: [
      'After paying and receiving the parcel, open the outer packaging on the same day. Check the product, bottle, plastic cap seal and visible signs of leakage or damage. Take clear photographs of the bottle and packaging when received. Do not break an intact cap seal solely to inspect the inner seal. If the parcel is visibly damaged, leaking or contains the wrong item, notify us on WhatsApp that same day. Do not use, empty, alter or discard the affected bottle or packaging.',
    ],
  },
  {
    heading: '6. Report damage, leakage or an incorrect item',
    body: [
      'WhatsApp +92 333-1632138 with your order number, a description of the issue, and photographs of the outer packaging, courier label, bottle and visible seals. Keep evidence showing how the parcel arrived. Photos help us assess the issue and raise a courier claim; they do not automatically establish responsibility. We will review the available evidence and guide you through the next steps.',
    ],
  },
  {
    heading: '7. The two bottle seals',
    body: [
      'Every bottle has a plastic cap seal and an aluminium inner seal. Any seals intact when received must remain intact for an authorized return, unless we instruct otherwise. If the plastic cap seal remains intact but the bottle leaks, an inner-seal failure may be the cause and the claim will be assessed as arrival damage. A seal already damaged on arrival does not disqualify a valid claim. Customer-opened or used bottles are not accepted for change-of-mind returns. This does not remove rights relating to genuine defects.',
    ],
  },
  {
    heading: '8. Authorized returns',
    body: [
      'Contact us before returning anything. For an approved return, we provide the return address, suitable courier and packing instructions through WhatsApp. Preserve the bottle and packaging as received. Do not send a leaking or badly damaged bottle through a courier without our instructions; we will determine a safe resolution. We cover authorized return transport and associated delivery charges for valid damaged, leaking or incorrect shipments. Customers are not required to resolve a courier claim themselves before receiving our assistance.',
    ],
  },
  {
    heading: '9. Refunds',
    body: [
      'For an approved refund, we refund the affected product and associated delivery charges paid for the faulty shipment, as applicable. If the whole shipment is refunded, all original delivery charges paid for it are included. Refunds are made within 3 calendar days after approval through JazzCash or bank transfer. Supply correct recipient details when requested. There is no card-refund option because orders are currently COD only.',
    ],
  },
  {
    heading: '10. No change-of-mind returns; legal rights',
    body: [
      'We do not accept returns because you changed your mind, selected an unsuitable product or no longer need it, whether opened or unopened. Same-day reporting is our requirement for visible delivery issues and helps preserve evidence. It does not override applicable consumer rights or automatically exclude a defect that could not reasonably have been discovered on the delivery day. Contact us promptly when such a defect is discovered.',
      'Nasta Chemicals, owner of ZIM and ZIMX — Faisalabad, Punjab, Pakistan. Email: info@zimchemicals.com. WhatsApp / phone: +92 333-1632138. Website: zimchemicals.com',
    ],
  },
]

export default function Shipping() {
  return (
    <LegalPage
      title="Shipping"
      titleAccent="Policy"
      intro="Delivery coverage and charges, how long your order takes, and what to do if a parcel arrives damaged."
      lastUpdated="22 September 2026 (Version 1.0)"
      sections={sections}
    />
  )
}
