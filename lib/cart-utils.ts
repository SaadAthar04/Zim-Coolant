// Cart utility functions for consistent cart management across the app

export const dispatchCartUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cartUpdated'))
  }
}

export const updateCartInStorage = (cartData: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart-storage', JSON.stringify(cartData))
    dispatchCartUpdate()
  }
}

export const getCartFromStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      const storedCart = localStorage.getItem('cart-storage')
      return storedCart ? JSON.parse(storedCart) : { state: { items: [] } }
    } catch (error) {
      console.error('Error reading cart from localStorage:', error)
      return { state: { items: [] } }
    }
  }
  return { state: { items: [] } }
}
