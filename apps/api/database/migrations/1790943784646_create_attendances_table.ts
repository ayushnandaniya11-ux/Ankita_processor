import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'attendances'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('employee_id')
        .unsigned()
        .references('id')
        .inTable('employees')
        .onDelete('CASCADE')
      table.date('date').notNullable()
      table.timestamp('clock_in', { useTz: true }).nullable()
      table.timestamp('clock_out', { useTz: true }).nullable()
      table.enum('status', ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE']).defaultTo('PRESENT')
      table.decimal('working_hours_logged', 4, 2).nullable()
      table.unique(['employee_id', 'date'])

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
