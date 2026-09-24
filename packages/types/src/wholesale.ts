// ============================================
// Wholesale Types
// ============================================

import type { BaseEntity, Address } from './common'

export type WholesaleStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

export const WHOLESALE_STATUS_LABELS: Record<WholesaleStatus, string> = {
  PENDING: 'Pending Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  SUSPENDED: 'Suspended',
}

export interface Wholesaler extends BaseEntity {
  userId: string
  businessName: string
  ownerName: string
  email: string
  phone: string
  gstin: string
  businessAddress: string
  state: string
  city: string
  pincode: string
  status: WholesaleStatus
  documents: WholesalerDocument[]
  totalOrders: number
  totalSpent: number
  approvedAt?: string
  approvedBy?: string
  rejectionReason?: string
}

export interface WholesalerDocument extends BaseEntity {
  wholesalerId: string
  type: 'GST_CERTIFICATE' | 'BUSINESS_LICENSE' | 'PAN_CARD' | 'OTHER'
  title: string
  fileUrl: string
  fileType: string
  isVerified: boolean
}

export interface WholesaleRegisterRequest {
  businessName: string
  ownerName: string
  email: string
  phone: string
  gstin: string
  businessAddress: string
  state: string
  city: string
  pincode: string
  password: string
  confirmPassword: string
}

export interface WholesalerListParams {
  page?: number
  perPage?: number
  search?: string
  status?: WholesaleStatus
  sortBy?: 'businessName' | 'createdAt' | 'totalOrders'
  sortOrder?: 'asc' | 'desc'
}

export interface BulkPricing {
  minQuantity: number
  maxQuantity?: number
  pricePerUnit: number
  discountPercentage: number
}
