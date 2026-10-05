import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class InquiryStatusHistory extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare inquiryId: number

  @column()
  declare status:
    | 'New'
    | 'Under Review'
    | 'Contacted'
    | 'Quotation Sent'
    | 'In Negotiation'
    | 'Approved'
    | 'Rejected'
    | 'Completed'

  @column()
  declare notes: string | null

  @column()
  declare updatedBy: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
