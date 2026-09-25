import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'coupons'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('code').notNullable().unique()
      table.string('discount').notNullable() // e.g., '10%' or '500'
      table.string('type').notNullable() // 'Percentage', 'Fixed', 'Shipping'
      table.integer('usage').notNullable().defaultTo(0)
      table.string('max_usage').notNullable().defaultTo('Unlimited')
      table.string('status').notNullable().defaultTo('Active')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
