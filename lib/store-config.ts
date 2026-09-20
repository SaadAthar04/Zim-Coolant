// Commercial rules for the storefront.
//
// These are the figures the customer is shown and the figures the server bills
// with. The server recalculates every order from these constants, so changing a
// number here changes checkout everywhere at once. Never let the browser decide
// any of this.

/** Orders at or above this subtotal (PKR) ship free. */
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

/** Free pouring nozzle artwork, included with ZIMX 1 Liter bottles only. */
export const NOZZLE_IMAGE = '/products/zimx-nozzle.webp'

export const shippingCostFor = (subtotal: number) =>
  subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE

export const taxFor = (subtotal: number) => Math.round(subtotal * TAX_RATE)

/** Rs. 2,999 — the format used consistently across the storefront. */
export const formatPrice = (amount: number) =>
  `Rs. ${Math.round(amount).toLocaleString('en-PK')}`
