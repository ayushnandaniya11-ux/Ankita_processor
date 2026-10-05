import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'approval_requests'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('employee_id')
        .unsigned()
        .references('id')
        .inTable('employees')
        .onDelete('CASCADE')
      table.string('action_type').notNullable() // CREATE, UPDATE, DELETE
      table.string('entity_type').notNullable() // e.g., PRODUCT, ORDER, CATEGORY
      table.string('entity_id').nullable() // ID of the entity being updated/deleted
      table.json('original_data').nullable()
      table.json('proposed_data').notNullable()
      table.enum('status', ['PENDING', 'APPROVED', 'REJECTED']).defaultTo('PENDING')
      table.text('reason').nullable()
      table.text('rejection_reason').nullable()
      table.integer('approved_by').unsigned().references('id').inTable('users').onDelete('SET NULL')
      table.timestamp('approved_at', { useTz: true }).nullable()

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
