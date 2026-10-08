// Commercial rules for the storefront.
//
// These are the figures the customer is shown and the figures the server bills
// with. The server recalculates every order from these constants, so changing a
// number here changes checkout everywhere at once. Never let the browser decide
// any of this.

/**
 * Orders *above* this subtotal (PKR) ship free.
 *
 * Strictly above, not at: the Shipping Policy of 22 September 2026 reads
 * "Rs. 300 for orders of Rs. 2,000 or less. Orders above Rs. 2,000 receive
 * free delivery", so an order of exactly Rs. 2,000 still pays delivery.
 */
export const FREE_SHIPPING_THRESHOLD = 2000

/** Flat delivery charge (PKR) applied below the free-shipping threshold. */
export const SHIPPING_FLAT_RATE = 300

/**
 * Tax rate applied on top of listed prices.
 *
 * Zero: the prices in the September 2026 catalogue are what the customer pays.
 * If the client later needs tax collected, set this and the checkout, order
 * summary and stored order records all follow automatically.
 */
export const TAX_RATE = 0

/** The only payment method the store accepts today. */
export const PAYMENT_METHOD = 'cod' as const

export const PAYMENT_METHOD_LABEL = 'Cash on Delivery'

/** Maximum units of one variant a customer may put in the cart. */
export const MAX_QUANTITY_PER_ITEM = 99

/**
 * Smallest order (PKR) we will deliver.
 *
 * Measured on the amount payable — subtotal plus delivery and tax — not on the
 * subtotal alone. A Rs. 700 basket carrying Rs. 300 delivery comes to Rs. 1,000
 * and is therefore deliverable, which is the rule the client asked for.
 *
 * At or above, not above: an order of exactly Rs. 1,000 qualifies.
 */
export const MINIMUM_ORDER_TOTAL = 1000

/** Free pouring nozzle artwork, included with ZIMX 1 Liter bottles only. */
export const NOZZLE_IMAGE = '/products/zimx-nozzle.webp'

export const shippingCostFor = (subtotal: number) =>
  subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE

export const taxFor = (subtotal: number) => Math.round(subtotal * TAX_RATE)

/** What the customer pays in all: the one figure the minimum is judged on. */
export const orderTotalFor = (subtotal: number) =>
  subtotal + shippingCostFor(subtotal) + taxFor(subtotal)

export const meetsMinimumOrder = (subtotal: number) =>
  orderTotalFor(subtotal) >= MINIMUM_ORDER_TOTAL

/**
 * How much more the customer needs to add to reach the minimum, in basket
 * terms. Below the free-shipping threshold delivery is a flat charge, so a
 * rupee added to the basket is a rupee added to the total and the two figures
 * are the same — which is what makes "add Rs. X more" honest.
 */
export const amountBelowMinimum = (subtotal: number) =>
  Math.max(0, MINIMUM_ORDER_TOTAL - orderTotalFor(subtotal))

/** Rs. 2,999 — the format used consistently across the storefront. */
export const formatPrice = (amount: number) =>
  `Rs. ${Math.round(amount).toLocaleString('en-PK')}`
