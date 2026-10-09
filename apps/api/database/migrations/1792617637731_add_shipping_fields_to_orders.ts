import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('awb_number').nullable()
      table.string('courier').nullable()
      table.string('tracking_url').nullable()
      table.timestamp('pickup_date', { useTz: true }).nullable()
      table.timestamp('delivered_date', { useTz: true }).nullable()
      table.text('status_history').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('awb_number')
      table.dropColumn('courier')
      table.dropColumn('tracking_url')
      table.dropColumn('pickup_date')
      table.dropColumn('delivered_date')
      table.dropColumn('status_history')
    })
  }
}
