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

  @column({
    prepare: (value: any) => (value ? JSON.stringify(value) : JSON.stringify([])),
    consume: (value: any) => {
      if (!value) return []
      if (typeof value === 'string') {
        try {
          return JSON.parse(value)
        } catch {
          return []
        }
      }
      return value
    },
  })
  declare images: Array<{ id: string; url: string; sortOrder?: number; isPrimary?: boolean }>

  @column()
  declare imageUrl: string | null

  @column({
    prepare: (value: any) => (value ? (typeof value === 'string' ? value : JSON.stringify(value)) : null),
    consume: (value: any) => {
      if (!value) return null
      if (typeof value === 'string') {
        try {
          return JSON.parse(value)
        } catch {
          return value
        }
      }
      return value
    },
  })
  declare attributes: Record<string, any> | null

  @column()
  declare isFeatured: boolean

  @column()
  declare isNewArrival: boolean

  @column()
  declare isBestSeller: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>
}
