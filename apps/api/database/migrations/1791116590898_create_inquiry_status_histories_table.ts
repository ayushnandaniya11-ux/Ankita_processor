import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'inquiry_status_histories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('inquiry_id')
        .unsigned()
        .references('id')
        .inTable('wholesaler_inquiries')
        .onDelete('CASCADE')
      table
        .enum('status', [
          'New',
          'Under Review',
          'Contacted',
          'Quotation Sent',
          'In Negotiation',
          'Approved',
          'Rejected',
          'Completed',
        ])
        .notNullable()
      table.text('notes').nullable()
      table.integer('updated_by').unsigned().references('id').inTable('users').onDelete('SET NULL')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
