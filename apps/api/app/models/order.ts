import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, hasOne, belongsTo } from '@adonisjs/lucid/orm'
import type { HasMany, HasOne, BelongsTo } from '@adonisjs/lucid/types/relations'
import OrderItem from '#models/order_item'
import Shipment from '#models/shipment'
import Invoice from '#models/invoice'
import User from '#models/user'
import Payment from '#models/payment'
import ReturnRequest from '#models/return_request'

export default class Order extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orderNo: string

  @column()
  declare invoiceNo: string | null

  @column()
  declare userId: number

  @column()
  declare subtotal: number

  @column()
  declare discount: number

  @column()
  declare taxAmount: number

  @column()
  declare shippingFee: number

  @column()
  declare codFee: number

  @column()
  declare totalAmount: number

  @column()
  declare status: string

  @column()
  declare paymentMethod: string

  @column()
  declare paymentStatus: string

  @column({
    prepare: (value: any) => {
      if (!value) return JSON.stringify({})
      if (typeof value === 'object') return JSON.stringify(value)
      try {
        JSON.parse(value)
        return value
      } catch {
        return JSON.stringify({ address: value })
      }
    },
    consume: (value: any) => {
      if (!value) return {}
      if (typeof value === 'object') return value
      try {
        return JSON.parse(value)
      } catch {
        return { raw: value, address: value }
      }
    },
  })
  declare shippingAddress: any

  @column({
    prepare: (value: any) => {
      if (!value) return JSON.stringify({})
      if (typeof value === 'object') return JSON.stringify(value)
      try {
        JSON.parse(value)
        return value
      } catch {
        return JSON.stringify({ address: value })
      }
    },
    consume: (value: any) => {
      if (!value) return {}
      if (typeof value === 'object') return value
      try {
        return JSON.parse(value)
      } catch {
        return { raw: value, address: value }
      }
    },
  })
  declare billingAddress: any

  @column()
  declare razorpayOrderId: string | null

  @column()
  declare razorpayPaymentId: string | null

  @column()
  declare razorpaySignature: string | null

  @column()
  declare awbNumber: string | null

  @column()
  declare courier: string | null

  @column()
  declare trackingUrl: string | null

  @column.dateTime()
  declare pickupDate: DateTime | null

  @column.dateTime()
  declare deliveredDate: DateTime | null

  @column({
    prepare: (value: any) => (typeof value === 'string' ? value : JSON.stringify(value)),
    consume: (value: any) => {
      if (!value) return []
      if (Array.isArray(value)) return value
      try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed : [parsed]
      } catch {
        return []
      }
    },
  })
  declare statusHistory: any[]

  @column()
  declare codPaymentStatus: 'COD_PENDING' | 'COD_COLLECTED' | 'COD_REMITTED' | 'COD_SETTLED' | 'COD_FAILED' | 'COD_CANCELLED' | 'COD_DISPUTED'

  @column()
  declare codExpectedAmount: number | null

  @column()
  declare codCollectedAmount: number

  @column()
  declare codRemittedAmount: number

  @column()
  declare codSettledAmount: number

  @column()
  declare codRemittanceRef: string | null

  @column.dateTime()
  declare codRemittedAt: DateTime | null

  @column.dateTime()
  declare codSettledAt: DateTime | null

  @column()
  declare codReconciliationNotes: string | null

  @column({
    prepare: (value: any) => (typeof value === 'string' ? value : JSON.stringify(value)),
    consume: (value: any) => {
      if (!value) return []
      if (Array.isArray(value)) return value
      try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed : [parsed]
      } catch {
        return []
      }
    },
  })
  declare codHistory: any[]

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => OrderItem)
  declare items: HasMany<typeof OrderItem>

  @hasMany(() => Shipment)
  declare shipments: HasMany<typeof Shipment>

  @hasOne(() => Invoice)
  declare invoice: HasOne<typeof Invoice>

  @hasMany(() => Payment)
  declare payments: HasMany<typeof Payment>

  @hasMany(() => ReturnRequest)
  declare returnRequests: HasMany<typeof ReturnRequest>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}

