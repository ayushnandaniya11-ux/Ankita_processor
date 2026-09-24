// ============================================
// Invoice Types
// ============================================

import type { BaseEntity } from './common'

export interface Invoice extends BaseEntity {
  invoiceNumber: string
  orderId: string
  orderNumber: string
  invoiceDate: string
  dueDate?: string

  // Seller
  businessName: string
  businessAddress: string
  businessGstin: string
  businessPhone?: string
  businessEmail?: string

  // Customer
  customerId: string
  customerName: string
  customerGstin?: string
  billingAddress: InvoiceAddress
  shippingAddress: InvoiceAddress

  // Items
  items: InvoiceItem[]

  // Totals
  subtotal: number
  discountAmount: number
  taxableAmount: number
  cgstAmount: number
  sgstAmount: number
  igstAmount: number
  shippingAmount: number
  grandTotal: number
  amountInWords: string

  // Payment
  paymentMethod: string
  paymentStatus: string

  // QR
  qrCodeUrl?: string

  // Status
  status: InvoiceStatus
  pdfUrl?: string
}

export type InvoiceStatus = 'DRAFT' | 'GENERATED' | 'SENT' | 'PAID' | 'CANCELLED'

export interface InvoiceItem {
  description: string
  hsnCode: string
  quantity: number
  unitPrice: number
  discount: number
  taxableAmount: number
  gstRate: number
  cgst: number
  sgst: number
  igst: number
  total: number
}

export interface InvoiceAddress {
  fullName: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  country: string
  phone?: string
}

export interface GstConfiguration extends BaseEntity {
  gstin: string
  businessName: string
  businessAddress: string
  state: string
  stateCode: string
  isActive: boolean
}

export interface HsnCode extends BaseEntity {
  code: string
  description: string
  gstRate: number
  cgstRate: number
  sgstRate: number
  igstRate: number
  isActive: boolean
}

export interface GstDocument extends BaseEntity {
  title: string
  description?: string
  fileUrl: string
  fileType: string
  period: string
  uploadedBy: string
}

export type GstType = 'CGST' | 'SGST' | 'IGST'
