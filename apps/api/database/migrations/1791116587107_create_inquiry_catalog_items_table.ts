import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'inquiry_catalog_items'

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
        .integer('wholesaler_catalog_id')
        .unsigned()
        .references('id')
        .inTable('wholesaler_catalogs')
        .onDelete('CASCADE')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
