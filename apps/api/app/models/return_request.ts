import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Order from '#models/order'
import OrderItem from '#models/order_item'
import User from '#models/user'
import Product from '#models/product'

export interface CustomerPhoto {
  id: string
  url: string
  filename?: string
  size?: number
  mimeType?: string
  clarityScore?: number
}

export interface ExtractedFrame {
  id: string
  url: string
  timeOffsetSeconds: number
  similarityScore?: number
}

export interface ReferenceImage {
  source: 'CATALOGUE' | 'ORDER_SNAPSHOT'
  url: string
  label?: string
}

export interface VerificationBreakdown {
  colorSimilarity: number
  patternSimilarity: number
  borderSimilarity: number
  clarityScore: number
  isDifferentProduct: boolean
  analysisSummary: string
  discrepancyReasons: string[]
  aiModel?: string
  rawAiOutput?: any
}

export interface ReturnAuditEntry {
  status: string
  timestamp: string
  actorId?: number | null
  actorName: string
  notes?: string | null
}

export default class ReturnRequest extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare returnNo: string

  @column()
  declare orderId: number

  @column()
  declare orderItemId: number

  @column()
  declare userId: number

  @column()
  declare productId: number

  @column()
  declare reason: string

  @column()
  declare customerNotes: string | null

  @column()
  declare language: 'en' | 'hi' | 'gu'

  @column({
    prepare: (value: any) => (value ? (typeof value === 'string' ? value : JSON.stringify(value)) : '[]'),
    consume: (value: any) => {
      if (!value) return []
      return typeof value === 'object' ? value : JSON.parse(value)
    },
  })
  declare customerPhotos: CustomerPhoto[]

  @column()
  declare customerVideoUrl: string | null

  @column({
    prepare: (value: any) => (value ? (typeof value === 'string' ? value : JSON.stringify(value)) : '[]'),
    consume: (value: any) => {
      if (!value) return []
      return typeof value === 'object' ? value : JSON.parse(value)
    },
  })
  declare extractedFrames: ExtractedFrame[]

  @column({
    prepare: (value: any) => (value ? (typeof value === 'string' ? value : JSON.stringify(value)) : '[]'),
    consume: (value: any) => {
      if (!value) return []
      return typeof value === 'object' ? value : JSON.parse(value)
    },
  })
  declare referenceImages: ReferenceImage[]

  @column()
  declare verificationStatus:
    | 'PENDING'
    | 'MATCH_CONFIRMED'
    | 'POSSIBLE_MISMATCH'
    | 'INSUFFICIENT_EVIDENCE'
    | 'MANUAL_REVIEW_REQUIRED'

  @column()
  declare confidenceScore: number

  @column({
    prepare: (value: any) => (value ? (typeof value === 'string' ? value : JSON.stringify(value)) : '{}'),
    consume: (value: any) => {
      if (!value) return {}
      return typeof value === 'object' ? value : JSON.parse(value)
    },
  })
  declare verificationBreakdown: VerificationBreakdown

  @column()
  declare status:
    | 'REQUESTED'
    | 'AUTO_APPROVED'
    | 'APPROVED'
    | 'REJECTED'
    | 'UNDER_REVIEW'
    | 'PENDING_EVIDENCE'
    | 'PICKUP_SCHEDULED'
    | 'RECEIVED'
    | 'REFUNDED'
    | 'CANCELLED'

  @column()
  declare adminNotes: string | null

  @column()
  declare rejectionReason: string | null

  @column()
  declare pickupTrackingNumber: string | null

  @column()
  declare pickupStatus: string

  @column({
    prepare: (value: any) => (value ? (typeof value === 'string' ? value : JSON.stringify(value)) : '[]'),
    consume: (value: any) => {
      if (!value) return []
      return typeof value === 'object' ? value : JSON.parse(value)
    },
  })
  declare auditTrail: ReturnAuditEntry[]

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>

  @belongsTo(() => OrderItem)
  declare orderItem: BelongsTo<typeof OrderItem>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>
}
