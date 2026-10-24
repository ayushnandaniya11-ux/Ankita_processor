import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  public async up() {
    this.schema.alterTable('orders', (table) => {
      table.decimal('cod_fee', 12, 2).notNullable().defaultTo(0)
    })

    this.schema.alterTable('invoices', (table) => {
      table.decimal('cod_fee', 12, 2).notNullable().defaultTo(0)
    })
  }

  public async down() {
    this.schema.alterTable('orders', (table) => {
      table.dropColumn('cod_fee')
    })

    this.schema.alterTable('invoices', (table) => {
      table.dropColumn('cod_fee')
    })
  }
}
