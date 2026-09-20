// The shopping cart, held in localStorage.
//
// A cart line is one product in one colour: the same coolant in red and green
// are two separate lines, because they are two different things to pick, pack
// and deliver. `key` is what identifies a line everywhere in the UI.
//
// Prices here are a snapshot for display only. The server re-prices every line
// from the database when the order is placed, so a tampered cart cannot change
// what the customer is charged.

import { MAX_QUANTITY_PER_ITEM } from './store-config'

const STORAGE_KEY = 'cart-storage'

export interface CartLine {
  key: string
  productId: string
  slug: string
  name: string
  /** 'green' | 'red' | '' when the product has no colour choice. */
  colour: string
  volume: string
  price: number
  image_url: string
  stock_quantity: number
  quantity: number
}

export const lineKey = (productId: string, colour: string) =>
  colour ? `${productId}:${colour}` : productId

const isBrowser = () => typeof window !== 'undefined'

/** Repairs anything malformed, including carts saved by the older code. */
function normalise(raw: any): CartLine[] {
  if (!raw || !Array.isArray(raw)) return []

  return raw
    .map((item: any): CartLine | null => {
      // The previous cart stored { product, quantity } with no colour.
      const source = item?.product ?? item
      const productId = source?.id ?? item?.productId
      if (!productId) return null

      const quantity = Number(item?.quantity)
      if (!Number.isFinite(quantity) || quantity < 1) return null

      const colour = typeof item?.colour === 'string' ? item.colour : ''

      return {
        key: item?.key || lineKey(productId, colour),
        productId,
        slug: source?.slug ?? item?.slug ?? '',
        name: source?.name ?? item?.name ?? '',
        colour,
        volume: source?.volume ?? item?.volume ?? '',
        price: Number(source?.price ?? item?.price ?? 0),
        image_url: source?.image_url ?? item?.image_url ?? '',
        stock_quantity: Number(source?.stock_quantity ?? item?.stock_quantity ?? 0),
        quantity: Math.min(quantity, MAX_QUANTITY_PER_ITEM),
      }
    })
    .filter((l): l is CartLine => l !== null)
}

export function readCart(): CartLine[] {
  if (!isBrowser()) return []
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    return normalise(JSON.parse(stored)?.state?.items)
  } catch {
    return []
  }
}

export function writeCart(items: CartLine[]) {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { items } }))
  } catch {
    // A full or disabled localStorage must not break the page.
  }
  window.dispatchEvent(new CustomEvent('cartUpdated'))
}

export function addToCart(line: Omit<CartLine, 'key' | 'quantity'>, quantity = 1) {
  const items = readCart()
  const key = lineKey(line.productId, line.colour)
  const existing = items.find((i) => i.key === key)

  const ceiling = Math.min(
    MAX_QUANTITY_PER_ITEM,
    line.stock_quantity > 0 ? line.stock_quantity : MAX_QUANTITY_PER_ITEM
  )

  if (existing) {
    existing.quantity = Math.min(ceiling, existing.quantity + quantity)
    // Refresh the snapshot so a price or image change is picked up.
    Object.assign(existing, line, { key, quantity: existing.quantity })
  } else {
    items.push({ ...line, key, quantity: Math.min(ceiling, quantity) })
  }

  writeCart(items)
  return items
}

export function updateQuantity(key: string, quantity: number) {
  if (quantity < 1) return removeLine(key)
  const items = readCart().map((i) =>
    i.key === key
      ? {
          ...i,
          quantity: Math.min(
            quantity,
            MAX_QUANTITY_PER_ITEM,
            i.stock_quantity > 0 ? i.stock_quantity : MAX_QUANTITY_PER_ITEM
          ),
        }
      : i
  )
  writeCart(items)
  return items
}

export function removeLine(key: string) {
  const items = readCart().filter((i) => i.key !== key)
  writeCart(items)
  return items
}

export function clearCart() {
  writeCart([])
  return []
}

export const cartCount = (items: CartLine[]) =>
  items.reduce((total, i) => total + i.quantity, 0)

export const cartSubtotal = (items: CartLine[]) =>
  items.reduce((total, i) => total + i.price * i.quantity, 0)

/**
 * Calls `handler` whenever the cart changes, including from another tab.
 * Returns the unsubscribe function.
 */
export function subscribeToCart(handler: () => void) {
  if (!isBrowser()) return () => {}

  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) handler()
  }
  window.addEventListener('cartUpdated', handler)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener('cartUpdated', handler)
    window.removeEventListener('storage', onStorage)
  }
}
