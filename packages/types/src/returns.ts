// ============================================
// Return Types
// ============================================

import type { BaseEntity } from './common'

export type ReturnStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'PICKUP_SCHEDULED'
  | 'PICKED_UP'
  | 'RECEIVED'
  | 'REFUND_INITIATED'
  | 'COMPLETED'
  | 'REJECTED'

export type ReturnType = 'RETURN' | 'EXCHANGE'

export type ReturnReason =
  'WRONG_SIZE' | 'DAMAGED_PRODUCT' | 'WRONG_PRODUCT' | 'QUALITY_ISSUE' | 'OTHER'

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  REQUESTED: 'Requested',
  APPROVED: 'Approved',
  PICKUP_SCHEDULED: 'Pickup Scheduled',
  PICKED_UP: 'Picked Up',
  RECEIVED: 'Received',
  REFUND_INITIATED: 'Refund Initiated',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
}

export const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  WRONG_SIZE: 'Wrong Size',
  DAMAGED_PRODUCT: 'Damaged Product',
  WRONG_PRODUCT: 'Wrong Product',
  QUALITY_ISSUE: 'Quality Issue',
  OTHER: 'Other',
}

export interface Return extends BaseEntity {
  returnNumber: string
  orderId: string
  orderNumber: string
  customerId: string
  customerName: string
  type: ReturnType
  status: ReturnStatus
  reason: ReturnReason
  reasonDetails?: string
  items: ReturnItem[]
  images?: string[]
  refundAmount?: number
  refundStatus?: string
  pickupAddress?: string
  pickupDate?: string
  pickupSlot?: string
  receivedAt?: string
  statusHistory: ReturnStatusHistory[]
}

export interface ReturnItem extends BaseEntity {
  returnId: string
  orderItemId: string
  productName: string
  productImage?: string
  sku: string
  color: string
  size: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface ReturnStatusHistory extends BaseEntity {
  returnId: string
  status: ReturnStatus
  comment?: string
  updatedBy?: string
}

export interface CreateReturnRequest {
  orderId: string
  type: ReturnType
  reason: ReturnReason
  reasonDetails?: string
  items: { orderItemId: string; quantity: number }[]
  images?: string[]
}

export interface ReturnListParams {
  page?: number
  perPage?: number
  search?: string
  status?: ReturnStatus
  type?: ReturnType
  customerId?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: 'createdAt' | 'status'
  sortOrder?: 'asc' | 'desc'
}
