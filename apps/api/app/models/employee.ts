import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Department from './department.js'
import Role from './role.js'
import Task from './task.js'
import Attendance from './attendance.js'

export default class Employee extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare employeeIdCode: string

  @column()
  declare jobTitle: string

  @column()
  declare departmentId: number | null

  @column.date()
  declare joiningDate: DateTime

  @column()
  declare status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

  @column()
  declare workingHours: string | null

  @column()
  declare salary: number | null

  @column()
  declare address: string | null

  @column()
  declare profilePhoto: string | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Department)
  declare department: BelongsTo<typeof Department>

  @manyToMany(() => Role, {
    pivotTable: 'employee_roles',
  })
  declare roles: ManyToMany<typeof Role>

  @hasMany(() => Task, {
    foreignKey: 'assignedTo',
  })
  declare tasks: HasMany<typeof Task>

  @hasMany(() => Attendance)
  declare attendances: HasMany<typeof Attendance>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
