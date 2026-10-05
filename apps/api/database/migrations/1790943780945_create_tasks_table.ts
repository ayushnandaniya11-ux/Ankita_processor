import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tasks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('assigned_by')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
        .nullable()
      table
        .integer('assigned_to')
        .unsigned()
        .references('id')
        .inTable('employees')
        .onDelete('CASCADE')
      table.string('title').notNullable()
      table.text('description').nullable()
      table.enum('priority', ['LOW', 'MEDIUM', 'HIGH', 'URGENT']).defaultTo('MEDIUM')
      table
        .enum('status', ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
        .defaultTo('PENDING')
      table.timestamp('start_date', { useTz: true }).nullable()
      table.timestamp('due_date', { useTz: true }).nullable()
      table.timestamp('completed_at', { useTz: true }).nullable()
      table.text('notes').nullable()

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
