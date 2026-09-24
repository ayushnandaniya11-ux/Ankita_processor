import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Category from '#models/category'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare categoryId: number | null

  @column()
  declare name: string

  @column()
  declare slug: string

  @column()
  declare sku: string

  @column()
  declare description: string | null

  @column()
  declare mrp: number

  @column()
  declare sellingPrice: number

  @column()
  declare stock: number

  @column()
  declare isPublished: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>
}
