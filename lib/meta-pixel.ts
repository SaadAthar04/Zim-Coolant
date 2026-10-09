// Meta Pixel conversion events.
//
// The pixel itself is loaded by CookieNotice, and only after the visitor
// accepts. Events sent from here follow the same rule: with no consent, or with
// the pixel blocked, nothing is sent and checkout carries on regardless.

import { hasTrackingConsent } from '@/components/CookieNotice'
import type { Order } from '@/lib/api-client'

type Fbq = (
  command: 'track',
  event: string,
  params: Record<string, unknown>,
  options?: { eventID?: string }
) => void

// Orders already reported from this browser. A placed order is only reported
// once, even if the confirmation is somehow reached again.
const TRACKED_KEY = 'zim_meta_purchases'

function alreadyTracked(orderNumber: string): boolean {
  try {
    const list = JSON.parse(window.localStorage.getItem(TRACKED_KEY) || '[]')
    return Array.isArray(list) && list.includes(orderNumber)
  } catch {
    return false
  }
}

function markTracked(orderNumber: string) {
  try {
    const list = JSON.parse(window.localStorage.getItem(TRACKED_KEY) || '[]')
    const next = (Array.isArray(list) ? list : []).concat(orderNumber).slice(-20)
    window.localStorage.setItem(TRACKED_KEY, JSON.stringify(next))
  } catch {
    // Storage blocked: the eventID below still lets Meta drop a repeat.
  }
}

/**
 * Report a placed order as a Purchase. Call only after the server has
 * confirmed the order, with the order it returned, so the value is what the
 * customer will actually pay.
 */
export function trackPurchase(order: Order) {
  if (typeof window === 'undefined' || !hasTrackingConsent()) return

  const fbq = (window as unknown as { fbq?: Fbq }).fbq
  if (typeof fbq !== 'function') return

  if (alreadyTracked(order.order_number)) return
  markTracked(order.order_number)

  // The order number doubles as Meta's event ID, its own guard against
  // counting the same purchase twice.
  fbq(
    'track',
    'Purchase',
    { value: order.total_amount, currency: 'PKR' },
    { eventID: order.order_number }
  )
}
