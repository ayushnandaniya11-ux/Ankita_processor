// ============================================
// User Types
// ============================================

import type { BaseEntity, Address } from './common'

export interface User extends BaseEntity {
  email: string
  phone?: string
  name: string
  role: string
  isActive: boolean
  emailVerifiedAt?: string
  lastLoginAt?: string
}

export interface Customer extends BaseEntity {
  userId: string
  user?: User
  name: string
  email: string
  phone?: string
  dateOfBirth?: string
  gender?: 'FEMALE' | 'MALE' | 'OTHER'
  addresses?: Address[]
  totalOrders: number
  totalSpent: number
  isActive: boolean
}

export interface CustomerListParams {
  page?: number
  perPage?: number
  search?: string
  sortBy?: 'name' | 'email' | 'createdAt' | 'totalOrders' | 'totalSpent'
  sortOrder?: 'asc' | 'desc'
  isActive?: boolean
}
