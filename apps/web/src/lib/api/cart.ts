import type { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest, ApplyCouponRequest, ApiResponse } from '@ankita/types'

const LOCAL_CART_KEY = 'ankita_storefront_cart'

function getInitialCart(): Cart {
  return {
    id: 'cart_local',
    items: [],
    subtotal: 0,
    discountAmount: 0,
    shippingAmount: 0,
    taxAmount: 0,
    grandTotal: 0,
    itemCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function loadLocalCart(): Cart {
  if (typeof window === 'undefined') return getInitialCart()
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed?.items)) return parsed
    }
  } catch {}
  return getInitialCart()
}

function saveLocalCart(cart: Cart): Cart {
  cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)
  cart.subtotal = cart.items.reduce((sum, item) => sum + (item.totalPrice || item.unitPrice * item.quantity), 0)
  cart.grandTotal = Math.max(0, cart.subtotal - (cart.discountAmount || 0) + (cart.shippingAmount || 0))
  cart.updatedAt = new Date().toISOString()
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart))
    } catch {}
  }
  return cart
}

export const cartApi = {
  get: async (): Promise<ApiResponse<Cart>> => {
    return {
      success: true,
      data: loadLocalCart(),
    }
  },

  addItem: async (payload: AddToCartRequest): Promise<ApiResponse<Cart>> => {
    const cart = loadLocalCart()
    const existingIndex = cart.items.findIndex(
      (item) => item.productId === String(payload.productId) && item.variantId === String(payload.variantId)
    )

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += payload.quantity
      cart.items[existingIndex].totalPrice = cart.items[existingIndex].quantity * cart.items[existingIndex].unitPrice
    } else {
      const newItem: CartItem = {
        id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        cartId: cart.id,
        productId: String(payload.productId),
        variantId: String(payload.variantId || 'default'),
        productName: (payload as any).productName || 'Cotton Fabric Item',
        productSlug: (payload as any).productSlug || 'product',
        productImage: (payload as any).productImage || '',
        sku: (payload as any).sku || 'SKU-' + payload.productId,
        color: (payload as any).color || 'Default',
        size: (payload as any).size || 'Standard',
        quantity: payload.quantity || 1,
        unitPrice: Number((payload as any).price || (payload as any).unitPrice || 999),
        mrp: Number((payload as any).mrp || 1299),
        totalPrice: Number((payload as any).price || (payload as any).unitPrice || 999) * (payload.quantity || 1),
        inStock: true,
        availableStock: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      cart.items.push(newItem)
    }

    const updated = saveLocalCart(cart)
    return { success: true, data: updated }
  },

  updateItem: async (itemId: string, payload: UpdateCartItemRequest): Promise<ApiResponse<Cart>> => {
    const cart = loadLocalCart()
    const index = cart.items.findIndex((item) => item.id === itemId)
    if (index > -1) {
      if (payload.quantity <= 0) {
        cart.items.splice(index, 1)
      } else {
        cart.items[index].quantity = payload.quantity
        cart.items[index].totalPrice = cart.items[index].quantity * cart.items[index].unitPrice
      }
    }
    const updated = saveLocalCart(cart)
    return { success: true, data: updated }
  },

  removeItem: async (itemId: string): Promise<ApiResponse<Cart>> => {
    const cart = loadLocalCart()
    cart.items = cart.items.filter((item) => item.id !== itemId)
    const updated = saveLocalCart(cart)
    return { success: true, data: updated }
  },

  applyCoupon: async (payload: ApplyCouponRequest): Promise<ApiResponse<Cart>> => {
    const cart = loadLocalCart()
    const code = (payload.couponCode || '').trim().toUpperCase()
    let discount = 0
    if (code === 'FIRST10' || code === 'WELCOME10') {
      discount = Math.round(cart.subtotal * 0.1)
    } else {
      discount = Math.min(200, Math.round(cart.subtotal * 0.05))
    }
    cart.discountAmount = discount
    cart.couponCode = code
    const updated = saveLocalCart(cart)
    return { success: true, data: updated }
  },

  removeCoupon: async (): Promise<ApiResponse<Cart>> => {
    const cart = loadLocalCart()
    cart.discountAmount = 0
    cart.couponCode = undefined
    const updated = saveLocalCart(cart)
    return { success: true, data: updated }
  },

  clear: async (): Promise<ApiResponse<null>> => {
    const initial = getInitialCart()
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(LOCAL_CART_KEY)
      } catch {}
    }
    return { success: true, data: null }
  },
}
