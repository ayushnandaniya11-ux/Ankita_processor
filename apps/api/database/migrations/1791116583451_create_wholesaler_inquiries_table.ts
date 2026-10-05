import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'wholesaler_inquiries'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('inquiry_id').notNullable().unique()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('business_name').nullable()
      table.string('contact_number').notNullable()
      table.string('email').notNullable()
      table.string('city_state').nullable()
      table
        .integer('fabric_quality_id')
        .unsigned()
        .references('id')
        .inTable('catalog_fabric_qualities')
        .onDelete('SET NULL')
      table.integer('required_quantity').notNullable()
      table.text('additional_message').nullable()
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
        .defaultTo('New')
      table.integer('assigned_to').unsigned().references('id').inTable('users').onDelete('SET NULL')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
