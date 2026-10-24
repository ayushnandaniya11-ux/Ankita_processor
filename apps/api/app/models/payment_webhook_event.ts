import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class PaymentWebhookEvent extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare eventId: string

  @column()
  declare eventType: string

  @column()
  declare orderId: number | null

  @column()
  declare paymentId: string | null

  @column({
    prepare: (value: any) => (value ? (typeof value === 'string' ? value : JSON.stringify(value)) : '{}'),
    consume: (value: any) => {
      if (!value) return {}
      return typeof value === 'object' ? value : JSON.parse(value)
    },
  })
  declare payload: any

  @column()
  declare status: 'PROCESSED' | 'FAILED' | 'IGNORED'

  @column()
  declare errorMessage: string | null

  @column.dateTime()
  declare processedAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
