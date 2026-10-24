import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payments'

  async up() {
    // 1. Create payments table
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').primary()
      table.bigint('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE').index()
      table.bigint('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL').nullable().index()
      table.string('razorpay_order_id', 100).nullable().index()
      table.string('razorpay_payment_id', 100).nullable().index()
      table.string('razorpay_signature', 255).nullable()
      table.decimal('amount', 12, 2).notNullable()
      table.string('currency', 10).defaultTo('INR')
      table.string('payment_method', 50).defaultTo('unknown') // 'card', 'upi', 'netbanking', 'wallet', 'emi', 'cod'
      table.string('status', 50).notNullable().defaultTo('PENDING') // 'PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'
      table.string('refund_status', 50).nullable() // 'FULL', 'PARTIAL'
      table.decimal('amount_refunded', 12, 2).defaultTo(0)
      table.string('settlement_status', 50).defaultTo('PENDING') // 'PENDING', 'SETTLED'
      table.string('settlement_id', 100).nullable()
      table.decimal('settlement_amount', 12, 2).nullable()
      table.timestamp('settled_at', { useTz: true }).nullable()
      table.timestamp('captured_at', { useTz: true }).nullable()
      table.string('card_network', 50).nullable() // 'Visa', 'MasterCard', 'RuPay', etc.
      table.string('card_type', 50).nullable() // 'debit', 'credit'
      table.string('card_last4', 10).nullable()
      table.string('bank', 50).nullable()
      table.string('wallet', 50).nullable()
      table.string('vpa', 100).nullable()
      table.string('error_code', 100).nullable()
      table.text('error_description').nullable()
      table.string('error_source', 100).nullable()
      table.string('error_step', 100).nullable()
      table.string('error_reason', 100).nullable()
      table.jsonb('raw_response').nullable()
      table.string('verification_source', 50).defaultTo('CHECKOUT_CALLBACK') // 'CHECKOUT_CALLBACK', 'WEBHOOK', 'MANUAL_SYNC', 'API_SYNC'

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })

    // 2. Add COD tracking columns to orders table
    this.schema.alterTable('orders', (table) => {
      table.string('cod_payment_status', 50).defaultTo('COD_PENDING') // 'COD_PENDING', 'COD_COLLECTED', 'COD_REMITTED', 'COD_SETTLED', 'COD_FAILED', 'COD_CANCELLED', 'COD_DISPUTED'
      table.decimal('cod_expected_amount', 12, 2).nullable()
      table.decimal('cod_collected_amount', 12, 2).defaultTo(0)
      table.decimal('cod_remitted_amount', 12, 2).defaultTo(0)
      table.decimal('cod_settled_amount', 12, 2).defaultTo(0)
      table.string('cod_remittance_ref', 100).nullable()
      table.timestamp('cod_remitted_at', { useTz: true }).nullable()
      table.timestamp('cod_settled_at', { useTz: true }).nullable()
      table.text('cod_reconciliation_notes').nullable()
      table.jsonb('cod_history').defaultTo('[]')
    })

    // 3. Create payment_webhook_events table for idempotency
    this.schema.createTable('payment_webhook_events', (table) => {
      table.bigIncrements('id').primary()
      table.string('event_id', 100).unique().notNullable()
      table.string('event_type', 100).notNullable()
      table.bigint('order_id').nullable().index()
      table.string('payment_id', 100).nullable().index()
      table.jsonb('payload').notNullable()
      table.string('status', 50).notNullable().defaultTo('PROCESSED') // 'PROCESSED', 'FAILED', 'IGNORED'
      table.text('error_message').nullable()
      table.timestamp('processed_at', { useTz: true }).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTableIfExists('payment_webhook_events')
    this.schema.alterTable('orders', (table) => {
      table.dropColumn('cod_payment_status')
      table.dropColumn('cod_expected_amount')
      table.dropColumn('cod_collected_amount')
      table.dropColumn('cod_remitted_amount')
      table.dropColumn('cod_settled_amount')
      table.dropColumn('cod_remittance_ref')
      table.dropColumn('cod_remitted_at')
      table.dropColumn('cod_settled_at')
      table.dropColumn('cod_reconciliation_notes')
      table.dropColumn('cod_history')
    })
    this.schema.dropTableIfExists(this.tableName)
  }
}
