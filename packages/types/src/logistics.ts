// ============================================
// Logistics Types
// ============================================

import type { BaseEntity } from './common'

export interface LogisticsPartner extends BaseEntity {
  name: string
  code: string
  isActive: boolean
  trackingUrlTemplate?: string
  apiEndpoint?: string
  supportEmail?: string
  supportPhone?: string
  metadata?: Record<string, unknown>
}

export interface Shipment extends BaseEntity {
  orderId: string
  orderNumber: string
  logisticsPartnerId: string
  logisticsPartnerName: string
  awbNumber: string
  status: ShipmentStatus
  weight?: number
  dimensions?: string
  pickupDate?: string
  estimatedDelivery?: string
  deliveredAt?: string
  courierName?: string
  tracking: ShipmentTracking[]
  returnAddress?: ShipmentAddress
  deliveryAddress: ShipmentAddress
}

export type ShipmentStatus =
  | 'CREATED'
  | 'PICKUP_SCHEDULED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED_DELIVERY'
  | 'RTO_INITIATED'
  | 'RTO_DELIVERED'
  | 'CANCELLED'

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  CREATED: 'Created',
  PICKUP_SCHEDULED: 'Pickup Scheduled',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  FAILED_DELIVERY: 'Failed Delivery',
  RTO_INITIATED: 'RTO Initiated',
  RTO_DELIVERED: 'RTO Delivered',
  CANCELLED: 'Cancelled',
}

export interface ShipmentTracking extends BaseEntity {
  shipmentId: string
  status: string
  location?: string
  description: string
  timestamp: string
}

export interface ShipmentAddress {
  name: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  country: string
}

export interface Waybill extends BaseEntity {
  shipmentId: string
  orderId: string
  orderNumber: string
  awbNumber: string
  courier: string
  customerName: string
  deliveryAddress: ShipmentAddress
  returnAddress: ShipmentAddress
  productCount: number
  weight?: number
  barcode?: string
  qrCode?: string
  pdfUrl?: string
}

export interface CreateShipmentRequest {
  orderId: string
  logisticsPartnerId: string
  weight?: number
  dimensions?: string
}

export interface ShipmentListParams {
  page?: number
  perPage?: number
  search?: string
  status?: ShipmentStatus
  logisticsPartnerId?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: 'createdAt' | 'status' | 'awbNumber'
  sortOrder?: 'asc' | 'desc'
}
