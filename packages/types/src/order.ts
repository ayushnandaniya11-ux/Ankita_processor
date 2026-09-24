// ============================================
// Order Types
// ============================================

import type { BaseEntity, Address } from './common'
import type { ProductVariant, ProductImage } from './product'

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED'
  | 'REFUNDED'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURN_REQUESTED: 'Return Requested',
  RETURNED: 'Returned',
  REFUNDED: 'Refunded',
}

/** Valid next statuses from current status */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['OUT_FOR_DELIVERY', 'DELIVERED'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: ['RETURN_REQUESTED'],
  CANCELLED: [],
  RETURN_REQUESTED: ['RETURNED'],
  RETURNED: ['REFUNDED'],
  REFUNDED: [],
}

export interface Order extends BaseEntity {
  orderNumber: string
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  status: OrderStatus
  items: OrderItem[]
  shippingAddress: OrderAddress
  billingAddress: OrderAddress
  subtotal: number
  discountAmount: number
  shippingAmount: number
  taxAmount: number
  cgstAmount: number
  sgstAmount: number
  igstAmount: number
  grandTotal: number
  couponCode?: string
  paymentMethod: string
  paymentStatus: string
  paymentId?: string
  notes?: string
  cancelReason?: string
  statusHistory: OrderStatusHistory[]
  invoiceId?: string
  shipmentId?: string
  estimatedDelivery?: string
  deliveredAt?: string
}

export interface OrderItem extends BaseEntity {
  orderId: string
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
  discount: number
  taxableAmount: number
  gstRate: number
  cgst: number
  sgst: number
  igst: number
  totalPrice: number
  hsnCode: string
}

export interface OrderAddress {
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  country: string
}

export interface OrderStatusHistory extends BaseEntity {
  orderId: string
  status: OrderStatus
  comment?: string
  updatedBy?: string
}

export interface OrderListParams {
  page?: number
  perPage?: number
  search?: string
  status?: OrderStatus
  paymentStatus?: string
  customerId?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: 'orderNumber' | 'createdAt' | 'grandTotal' | 'status'
  sortOrder?: 'asc' | 'desc'
}

export interface CreateOrderRequest {
  addressId: string
  paymentMethod: string
  couponCode?: string
  notes?: string
}
