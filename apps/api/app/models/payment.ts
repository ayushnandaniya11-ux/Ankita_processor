import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Order from '#models/order'
import User from '#models/user'

export default class Payment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orderId: number

  @column()
  declare userId: number | null

  @column()
  declare razorpayOrderId: string | null

  @column()
  declare razorpayPaymentId: string | null

  @column()
  declare razorpaySignature: string | null

  @column()
  declare amount: number

  @column()
  declare currency: string

  @column()
  declare paymentMethod: string // 'card', 'upi', 'netbanking', 'wallet', 'emi', 'cod'

  @column()
  declare status: 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED'

  @column()
  declare refundStatus: 'FULL' | 'PARTIAL' | null

  @column()
  declare amountRefunded: number

  @column()
  declare settlementStatus: 'PENDING' | 'SETTLED'

  @column()
  declare settlementId: string | null

  @column()
  declare settlementAmount: number | null

  @column.dateTime()
  declare settledAt: DateTime | null

  @column.dateTime()
  declare capturedAt: DateTime | null

  @column()
  declare cardNetwork: string | null

  @column()
  declare cardType: string | null

  @column({ columnName: 'card_last4' })
  declare cardLast4: string | null

  @column()
  declare bank: string | null

  @column()
  declare wallet: string | null

  @column()
  declare vpa: string | null

  @column()
  declare errorCode: string | null

  @column()
  declare errorDescription: string | null

  @column()
  declare errorSource: string | null

  @column()
  declare errorStep: string | null

  @column()
  declare errorReason: string | null

  @column({
    prepare: (value: any) => (value ? (typeof value === 'string' ? value : JSON.stringify(value)) : null),
    consume: (value: any) => {
      if (!value) return null
      return typeof value === 'object' ? value : JSON.parse(value)
    },
  })
  declare rawResponse: any

  @column()
  declare verificationSource: 'CHECKOUT_CALLBACK' | 'WEBHOOK' | 'MANUAL_SYNC' | 'API_SYNC'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
