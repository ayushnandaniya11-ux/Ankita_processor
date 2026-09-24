// ============================================
// Inventory Types
// ============================================

import type { BaseEntity } from './common'

export type InventoryMovementType =
  | 'PURCHASE'
  | 'SALE'
  | 'RETURN'
  | 'EXCHANGE'
  | 'ADJUSTMENT'
  | 'DAMAGE'
  | 'RESERVATION'
  | 'RELEASE'

export const MOVEMENT_TYPE_LABELS: Record<InventoryMovementType, string> = {
  PURCHASE: 'Purchase',
  SALE: 'Sale',
  RETURN: 'Return',
  EXCHANGE: 'Exchange',
  ADJUSTMENT: 'Adjustment',
  DAMAGE: 'Damage',
  RESERVATION: 'Reservation',
  RELEASE: 'Release',
}

export interface Inventory extends BaseEntity {
  productId: string
  productName: string
  variantId: string
  sku: string
  color: string
  size: string
  totalStock: number
  availableStock: number
  reservedStock: number
  damagedStock: number
  lowStockThreshold: number
  isLowStock: boolean
}

export interface InventoryMovement extends BaseEntity {
  inventoryId: string
  productId: string
  variantId: string
  sku: string
  type: InventoryMovementType
  quantity: number
  previousStock: number
  newStock: number
  referenceType?: string
  referenceId?: string
  reason?: string
  performedBy?: string
}

export interface StockAdjustmentRequest {
  variantId: string
  type: 'ADJUSTMENT' | 'DAMAGE'
  quantity: number
  reason: string
}

export interface InventoryListParams {
  page?: number
  perPage?: number
  search?: string
  productId?: string
  isLowStock?: boolean
  sortBy?: 'sku' | 'availableStock' | 'totalStock'
  sortOrder?: 'asc' | 'desc'
}
