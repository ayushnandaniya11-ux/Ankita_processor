// ============================================
// Payment Types
// ============================================

import type { BaseEntity } from './common'

export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'

export type PaymentMethod = 'ONLINE' | 'COD' | 'UPI' | 'CARD' | 'NET_BANKING' | 'WALLET'

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Pending',
  AUTHORIZED: 'Authorized',
  CAPTURED: 'Captured',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
  PARTIALLY_REFUNDED: 'Partially Refunded',
}

export interface Payment extends BaseEntity {
  paymentId: string
  orderId: string
  orderNumber: string
  customerId: string
  customerName: string
  amount: number
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  provider: string
  providerPaymentId?: string
  providerOrderId?: string
  transactionId?: string
  refundAmount?: number
  refundId?: string
  failureReason?: string
  metadata?: Record<string, unknown>
  paidAt?: string
}

export interface PaymentListParams {
  page?: number
  perPage?: number
  search?: string
  status?: PaymentStatus
  method?: PaymentMethod
  dateFrom?: string
  dateTo?: string
  sortBy?: 'createdAt' | 'amount' | 'status'
  sortOrder?: 'asc' | 'desc'
}

/** Payment provider interface for adapter pattern */
export interface PaymentProviderConfig {
  provider: string
  key: string
  secret: string
  webhookSecret?: string
  testMode: boolean
}

export interface CreatePaymentOrderRequest {
  orderId: string
  amount: number
  currency?: string
  method: PaymentMethod
}

export interface VerifyPaymentRequest {
  orderId: string
  paymentId: string
  signature?: string
  providerData?: Record<string, unknown>
}

export interface RefundRequest {
  paymentId: string
  amount: number
  reason: string
}
