import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Employee from './employee.js'

export default class Task extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare assignedBy: number | null

  @column()
  declare assignedTo: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

  @column()
  declare status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

  @column.dateTime()
  declare startDate: DateTime | null

  @column.dateTime()
  declare dueDate: DateTime | null

  @column.dateTime()
  declare completedAt: DateTime | null

  @column()
  declare notes: string | null

  @belongsTo(() => User, { foreignKey: 'assignedBy' })
  declare assigner: BelongsTo<typeof User>

  @belongsTo(() => Employee, { foreignKey: 'assignedTo' })
  declare assignee: BelongsTo<typeof Employee>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
