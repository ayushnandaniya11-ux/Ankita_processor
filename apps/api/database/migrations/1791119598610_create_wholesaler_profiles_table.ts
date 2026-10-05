import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'wholesaler_profiles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('company_name').notNullable()
      table.string('gstin').notNullable().unique()
      table.text('business_address').notNullable()
      table.string('city').notNullable()
      table.string('state').notNullable()
      table.string('pin_code').notNullable()
      table.string('business_type').nullable()
      table.string('interested_categories').nullable()
      table.string('expected_quantity').nullable()
      table.string('approval_status').defaultTo('PENDING').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}