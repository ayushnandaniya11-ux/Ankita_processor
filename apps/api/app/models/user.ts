import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { BaseModel, column, beforeSave } from '@adonisjs/lucid/orm'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare email: string

  @column()
  declare password: string | null

  @column()
  declare phone: string | null

  @column()
  declare role: 'CUSTOMER' | 'ADMIN' | 'WHOLESALE'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

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
