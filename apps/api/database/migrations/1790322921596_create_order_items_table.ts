import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'order_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('order_id').unsigned().references('orders.id').onDelete('CASCADE')
      table.integer('product_id').unsigned().references('products.id')
      table.string('product_name').notNullable()
      table.string('hsn_code').nullable()
      table.integer('quantity').notNullable()
      table.decimal('rate', 12, 2).notNullable()
      table.decimal('tax_percent', 5, 2).defaultTo(5)
      table.decimal('tax_amount', 12, 2).notNullable()
      table.decimal('total', 12, 2).notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}