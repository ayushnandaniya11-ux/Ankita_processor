import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { BaseModel, column, beforeSave, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import UserSession from '#models/user_session'
import PasswordResetToken from '#models/password_reset_token'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string | null

  @column()
  declare phone: string | null

  @column()
  declare role: 'CUSTOMER' | 'ADMIN' | 'WHOLESALE' | 'SUPER_ADMIN' | 'EMPLOYEE'

  @column({ serializeAs: null })
  declare otp: string | null

  @column.dateTime({ serializeAs: null })
  declare otpExpiresAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => UserSession)
  declare sessions: HasMany<typeof UserSession>

  @hasMany(() => PasswordResetToken)
  declare passwordResetTokens: HasMany<typeof PasswordResetToken>

  @beforeSave()
  static async hashPassword(user: User) {
    if (user.$dirty.password && user.password) {
      user.password = await hash.make(user.password)
    }
  }

  static async verifyCredentials(email: string, passwordPlain: string) {
    const user = await User.findBy('email', email)
    if (!user) {
      throw new Error('Invalid credentials')
    }

    if (!user.password) {
      throw new Error('Invalid credentials')
    }

    const isValid = await hash.verify(user.password, passwordPlain)
    if (!isValid) {
      throw new Error('Invalid credentials')
    }

    return user
  }
}
