import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('razorpay_order_id').nullable()
      table.string('razorpay_payment_id').nullable()
      table.string('razorpay_signature').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('razorpay_order_id')
      table.dropColumn('razorpay_payment_id')
      table.dropColumn('razorpay_signature')
    })
  }
}
