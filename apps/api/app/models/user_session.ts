import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class UserSession extends BaseModel {
  public static table = 'user_sessions'

  @column({ isPrimary: true })
  declare id: number

  @column({ serializeAs: null })
  declare sessionIdHash: string

  @column()
  declare userId: number

  @column()
  declare role: string

  @column()
  declare ipAddress: string | null

  @column()
  declare userAgent: string | null

  @column()
  declare isRememberMe: boolean

  @column()
  declare isRevoked: boolean

  @column()
  declare revokedReason: string | null

  @column.dateTime()
  declare idleExpiresAt: DateTime

  @column.dateTime()
  declare expiresAt: DateTime

  @column.dateTime()
  declare lastActivityAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
