import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'return_requests'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').primary()
      table.string('return_no', 50).notNullable().unique().index()
      table.bigint('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE').index()
      table.bigint('order_item_id').unsigned().references('id').inTable('order_items').onDelete('CASCADE').index()
      table.bigint('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE').index()
      table.bigint('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE').index()

      table.string('reason', 100).notNullable()
      table.text('customer_notes').nullable()
      table.string('language', 10).notNullable().defaultTo('en') // 'en', 'hi', 'gu'

      table.jsonb('customer_photos').defaultTo('[]')
      table.string('customer_video_url', 500).nullable()
      table.jsonb('extracted_frames').defaultTo('[]')
      table.jsonb('reference_images').defaultTo('[]')

      table.string('verification_status', 50).notNullable().defaultTo('PENDING')
      table.decimal('confidence_score', 5, 2).defaultTo(0)
      table.jsonb('verification_breakdown').defaultTo('{}')

      table.string('status', 50).notNullable().defaultTo('REQUESTED')
      table.text('admin_notes').nullable()
      table.text('rejection_reason').nullable()

      table.string('pickup_tracking_number', 100).nullable()
      table.string('pickup_status', 50).defaultTo('PENDING')
      table.jsonb('audit_trail').defaultTo('[]')

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
