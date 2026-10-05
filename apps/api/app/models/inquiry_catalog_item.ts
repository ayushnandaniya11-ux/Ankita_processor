import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import WholesalerCatalog from '#models/wholesaler_catalog'

export default class InquiryCatalogItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare inquiryId: number

  @column()
  declare wholesalerCatalogId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => WholesalerCatalog, { foreignKey: 'wholesalerCatalogId' })
  declare catalog: BelongsTo<typeof WholesalerCatalog>
}
