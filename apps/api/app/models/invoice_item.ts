import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Invoice from '#models/invoice'

export default class InvoiceItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare invoiceId: number

  @column()
  declare orderItemId: number | null

  @column()
  declare productId: number | null

  @column()
  declare itemDescription: string

  @column()
  declare hsnCode: string

  @column()
  declare quantity: number

  @column()
  declare unitPrice: number

  @column()
  declare discount: number

  @column()
  declare taxableValue: number

  @column()
  declare gstRate: number

  @column()
  declare cgstRate: number

  @column()
  declare cgstAmount: number

  @column()
  declare sgstRate: number

  @column()
  declare sgstAmount: number

  @column()
  declare igstRate: number

  @column()
  declare igstAmount: number

  @column()
  declare totalAmount: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Invoice)
  declare invoice: BelongsTo<typeof Invoice>
}
