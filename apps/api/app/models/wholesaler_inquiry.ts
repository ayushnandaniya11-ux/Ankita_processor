import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import CatalogFabricQuality from '#models/catalog_fabric_quality'
import InquiryCatalogItem from '#models/inquiry_catalog_item'
import InquiryStatusHistory from '#models/inquiry_status_history'

export default class WholesalerInquiry extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare inquiryId: string

  @column()
  declare userId: number

  @column()
  declare businessName: string | null

  @column()
  declare contactNumber: string

  @column()
  declare email: string

  @column()
  declare cityState: string | null

  @column()
  declare fabricQualityId: number | null

  @column()
  declare requiredQuantity: number

  @column()
  declare additionalMessage: string | null

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
  declare assignedTo: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => CatalogFabricQuality, { foreignKey: 'fabricQualityId' })
  declare fabricQuality: BelongsTo<typeof CatalogFabricQuality>

  @belongsTo(() => User, { foreignKey: 'assignedTo' })
  declare assignee: BelongsTo<typeof User>

  @hasMany(() => InquiryCatalogItem, { foreignKey: 'inquiryId' })
  declare catalogItems: HasMany<typeof InquiryCatalogItem>

  @hasMany(() => InquiryStatusHistory, { foreignKey: 'inquiryId' })
  declare statusHistories: HasMany<typeof InquiryStatusHistory>
}
