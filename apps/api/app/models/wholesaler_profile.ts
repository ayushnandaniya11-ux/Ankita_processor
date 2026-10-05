import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class WholesalerProfile extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare companyName: string

  @column()
  declare gstin: string

  @column()
  declare businessAddress: string

  @column()
  declare city: string

  @column()
  declare state: string

  @column()
  declare pinCode: string

  @column()
  declare businessType: string | null

  @column()
  declare interestedCategories: string | null

  @column()
  declare expectedQuantity: string | null

  @column()
  declare approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}