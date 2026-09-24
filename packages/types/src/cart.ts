// ============================================
// Cart Types
// ============================================

import type { BaseEntity } from './common'

export interface Cart extends BaseEntity {
  userId?: string
  sessionId?: string
  items: CartItem[]
  subtotal: number
  discountAmount: number
  shippingAmount: number
  taxAmount: number
  grandTotal: number
  couponCode?: string
  itemCount: number
}

export interface CartItem extends BaseEntity {
  cartId: string
  productId: string
  productName: string
  productSlug: string
  productImage?: string
  variantId: string
  sku: string
  color: string
  size: string
  quantity: number
  unitPrice: number
  mrp: number
  totalPrice: number
  inStock: boolean
  availableStock: number
}

export interface AddToCartRequest {
  productId: string
  variantId: string
  quantity: number
}

export interface UpdateCartItemRequest {
  quantity: number
}

export interface ApplyCouponRequest {
  couponCode: string
}

export interface WishlistItem extends BaseEntity {
  userId: string
  productId: string
  productName: string
  productSlug: string
  productImage?: string
  sellingPrice: number
  mrp: number
  inStock: boolean
}
