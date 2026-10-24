import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Order from '#models/order'

export default class Shipment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orderId: number

  @column()
  declare logisticsProvider: string

  @column()
  declare awbNumber: string | null

  @column()
  declare shipmentId: string | null

  @column()
  declare status: 'PENDING' | 'GENERATING' | 'GENERATED' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED' | 'CANCELLED'

  @column()
  declare courierName: string

  @column()
  declare trackingUrl: string | null

  @column.dateTime()
  declare pickupDate: DateTime | null

  @column.dateTime()
  declare deliveredDate: DateTime | null

  @column()
  declare weightKg: number

  @column({
    prepare: (value: any) => (value ? JSON.stringify(value) : null),
    consume: (value: any) => {
      if (!value) return null
      return typeof value === 'object' ? value : JSON.parse(value)
    },
  })
  declare dimensions: { length: number; breadth: number; height: number } | null

  @column()
  declare pickupToken: string | null

  @column()
  declare labelFormat: string

  @column()
  declare waybillDocumentPath: string | null

  @column()
  declare waybillDocumentUrl: string | null

  @column({
    prepare: (value: any) => (value ? JSON.stringify(value) : null),
    consume: (value: any) => {
      if (!value) return null
      return typeof value === 'object' ? value : JSON.parse(value)
    },
  })
  declare apiRequestPayload: any

  @column({
    prepare: (value: any) => (value ? JSON.stringify(value) : null),
    consume: (value: any) => {
      if (!value) return null
      return typeof value === 'object' ? value : JSON.parse(value)
    },
  })
  declare apiResponsePayload: any

  @column()
  declare errorMessage: string | null

  @column()
  declare attempts: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>
}
