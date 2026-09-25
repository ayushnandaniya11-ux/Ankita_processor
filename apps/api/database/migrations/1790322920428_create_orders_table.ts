import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('order_no').notNullable().unique()
      table.string('invoice_no').nullable().unique()
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE')
      table.decimal('subtotal', 12, 2).notNullable()
      table.decimal('discount', 12, 2).defaultTo(0)
      table.decimal('tax_amount', 12, 2).notNullable()
      table.decimal('shipping_fee', 12, 2).defaultTo(0)
      table.decimal('total_amount', 12, 2).notNullable()
      table.string('status').defaultTo('Pending')
      table.string('payment_method')
      table.string('payment_status').defaultTo('PENDING')
      table.json('shipping_address')
      table.json('billing_address')

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}