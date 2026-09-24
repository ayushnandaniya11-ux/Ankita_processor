import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('SET NULL')
      table.string('name').notNullable()
      table.string('slug').notNullable().unique()
      table.string('sku').notNullable().unique()
      table.text('description').nullable()
      table.decimal('mrp', 10, 2).notNullable()
      table.decimal('selling_price', 10, 2).notNullable()
      table.integer('stock').notNullable().defaultTo(0)
      table.boolean('is_published').notNullable().defaultTo(false)
      
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
