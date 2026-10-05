import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import OrderItem from '#models/order_item'

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
  declare totalAmount: number

  @column()
  declare status: string

  @column()
  declare paymentMethod: string

  @column()
  declare paymentStatus: string

  @column({
    prepare: (value: any) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value || '{}'),
  })
  declare shippingAddress: any

  @column({
    prepare: (value: any) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value || '{}'),
  })
  declare billingAddress: any

  @column()
  declare razorpayOrderId: string | null

  @column()
  declare razorpayPaymentId: string | null

  @column()
  declare razorpaySignature: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => OrderItem)
  declare items: HasMany<typeof OrderItem>
}
