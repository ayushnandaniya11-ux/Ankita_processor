import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Order from '#models/order'
import User from '#models/user'
import InvoiceItem from '#models/invoice_item'

export default class Invoice extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare invoiceNumber: string

  @column()
  declare orderId: number

  @column()
  declare userId: number

  @column.dateTime()
  declare invoiceDate: DateTime

  @column.dateTime()
  declare dueDate: DateTime | null

  // Seller Details
  @column()
  declare sellerName: string

  @column()
  declare sellerGstin: string

  @column()
  declare sellerAddress: string

  @column()
  declare sellerStateCode: string

  // Customer Details
  @column()
  declare customerName: string

  @column()
  declare customerEmail: string | null

  @column()
  declare customerPhone: string | null

  @column()
  declare customerGstin: string | null

  @column({
    prepare: (value: any) => (value ? (typeof value === 'string' ? value : JSON.stringify(value)) : '{}'),
    consume: (value: any) => {
      if (!value) return {}
      return typeof value === 'object' ? value : JSON.parse(value)
    },
  })
  declare billingAddress: any

  @column({
    prepare: (value: any) => (value ? (typeof value === 'string' ? value : JSON.stringify(value)) : '{}'),
    consume: (value: any) => {
      if (!value) return {}
      return typeof value === 'object' ? value : JSON.parse(value)
    },
  })
  declare shippingAddress: any

  @column({ columnName: 'is_b2b' })
  declare isB2b: boolean

  @column()
  declare isInterstate: boolean

  // Amounts
  @column()
  declare subtotal: number

  @column()
  declare discount: number

  @column()
  declare taxableValue: number

  @column()
  declare cgstAmount: number

  @column()
  declare sgstAmount: number

  @column()
  declare igstAmount: number

  @column()
  declare totalTax: number

  @column()
  declare shippingFee: number

  @column()
  declare codFee: number

  @column()
  declare totalAmount: number

  // Document & Status
  @column()
  declare status: 'GENERATED' | 'CANCELLED'

  @column()
  declare pdfPath: string | null

  @column()
  declare pdfUrl: string | null

  // E-Invoice
  @column()
  declare irn: string | null

  @column()
  declare ackNo: string | null

  @column.dateTime()
  declare ackDate: DateTime | null

  @column()
  declare signedQrCode: string | null

  @column()
  declare eInvoiceStatus: 'NOT_APPLICABLE' | 'PENDING' | 'GENERATED' | 'FAILED'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => InvoiceItem)
  declare items: HasMany<typeof InvoiceItem>
}
