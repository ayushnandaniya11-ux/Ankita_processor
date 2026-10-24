import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // 1. Shipments Table (Official Delhivery Logistics & Tracking)
    this.schema.createTable('shipments', (table) => {
      table.increments('id').primary()
      table.integer('order_id').unsigned().references('orders.id').onDelete('CASCADE').notNullable()
      table.string('logistics_provider').notNullable().defaultTo('delhivery')
      table.string('awb_number').nullable().index()
      table.string('shipment_id').nullable()
      table.string('status').notNullable().defaultTo('PENDING') // PENDING, GENERATING, GENERATED, IN_TRANSIT, DELIVERED, FAILED, CANCELLED
      table.string('courier_name').notNullable().defaultTo('Delhivery Express')
      table.text('tracking_url').nullable()
      table.timestamp('pickup_date', { useTz: true }).nullable()
      table.timestamp('delivered_date', { useTz: true }).nullable()
      table.decimal('weight_kg', 8, 3).defaultTo(0.5)
      table.json('dimensions').nullable() // { length: 15, breadth: 10, height: 5 }
      table.string('pickup_token').nullable()
      table.string('label_format').defaultTo('6x4') // 6x4 inch thermal label
      table.text('waybill_document_path').nullable()
      table.text('waybill_document_url').nullable()
      table.json('api_request_payload').nullable()
      table.json('api_response_payload').nullable()
      table.text('error_message').nullable()
      table.integer('attempts').defaultTo(0)
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })

    // 2. Invoices Table (Official Indian GST Tax Invoices)
    this.schema.createTable('invoices', (table) => {
      table.increments('id').primary()
      table.string('invoice_number').notNullable().unique()
      table.integer('order_id').unsigned().references('orders.id').onDelete('CASCADE').notNullable()
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE').notNullable()
      table.timestamp('invoice_date', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('due_date', { useTz: true }).nullable()

      // Seller Information
      table.string('seller_name').notNullable().defaultTo('Ankita Processors')
      table.string('seller_gstin').notNullable().defaultTo('24ANCPN9292N2ZB')
      table.text('seller_address').notNullable().defaultTo('Plot 5, Near Vivekanand School, Jetpur, Rajkot, Gujarat - 360370')
      table.string('seller_state_code').notNullable().defaultTo('24')

      // Customer Information
      table.string('customer_name').notNullable()
      table.string('customer_email').nullable()
      table.string('customer_phone').nullable()
      table.string('customer_gstin').nullable()
      table.json('billing_address').notNullable()
      table.json('shipping_address').notNullable()
      table.boolean('is_b2b').notNullable().defaultTo(false)
      table.boolean('is_interstate').notNullable().defaultTo(false)

      // Financials
      table.decimal('subtotal', 12, 2).notNullable()
      table.decimal('discount', 12, 2).defaultTo(0)
      table.decimal('taxable_value', 12, 2).notNullable()
      table.decimal('cgst_amount', 12, 2).defaultTo(0)
      table.decimal('sgst_amount', 12, 2).defaultTo(0)
      table.decimal('igst_amount', 12, 2).defaultTo(0)
      table.decimal('total_tax', 12, 2).notNullable()
      table.decimal('shipping_fee', 12, 2).defaultTo(0)
      table.decimal('total_amount', 12, 2).notNullable()

      // Document & Status
      table.string('status').notNullable().defaultTo('GENERATED') // GENERATED, CANCELLED
      table.text('pdf_path').nullable()
      table.text('pdf_url').nullable()

      // E-Invoice Statutory Fields
      table.string('irn').nullable().index()
      table.string('ack_no').nullable()
      table.timestamp('ack_date', { useTz: true }).nullable()
      table.text('signed_qr_code').nullable()
      table.string('e_invoice_status').notNullable().defaultTo('NOT_APPLICABLE') // NOT_APPLICABLE, PENDING, GENERATED, FAILED

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })

    // 3. Invoice Items Table
    this.schema.createTable('invoice_items', (table) => {
      table.increments('id').primary()
      table.integer('invoice_id').unsigned().references('invoices.id').onDelete('CASCADE').notNullable()
      table.integer('order_item_id').unsigned().references('order_items.id').onDelete('SET NULL').nullable()
      table.integer('product_id').unsigned().references('products.id').onDelete('SET NULL').nullable()
      table.string('item_description').notNullable()
      table.string('hsn_code').notNullable().defaultTo('5208')
      table.integer('quantity').notNullable().defaultTo(1)
      table.decimal('unit_price', 12, 2).notNullable()
      table.decimal('discount', 12, 2).defaultTo(0)
      table.decimal('taxable_value', 12, 2).notNullable()
      table.decimal('gst_rate', 5, 2).notNullable().defaultTo(5)
      table.decimal('cgst_rate', 5, 2).defaultTo(0)
      table.decimal('cgst_amount', 12, 2).defaultTo(0)
      table.decimal('sgst_rate', 5, 2).defaultTo(0)
      table.decimal('sgst_amount', 12, 2).defaultTo(0)
      table.decimal('igst_rate', 5, 2).defaultTo(0)
      table.decimal('igst_amount', 12, 2).defaultTo(0)
      table.decimal('total_amount', 12, 2).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })

    // 4. GST Report Exports Table (Admin Monthly Archives)
    this.schema.createTable('gst_report_exports', (table) => {
      table.increments('id').primary()
      table.string('financial_year').notNullable() // e.g. 2026-2027
      table.integer('month').notNullable() // 1 to 12
      table.string('report_type').notNullable() // GST_REPORT, GST_RETURN_REPORT, TAX_INVOICES, TAX_RETURN_RECONCILIATION
      table.string('file_name').notNullable()
      table.text('file_path').notNullable()
      table.bigInteger('file_size_bytes').defaultTo(0)
      table.integer('generated_by').unsigned().references('users.id').onDelete('SET NULL').nullable()
      table.integer('record_count').defaultTo(0)
      table.decimal('total_turnover', 14, 2).defaultTo(0)
      table.decimal('total_tax', 14, 2).defaultTo(0)
      table.string('status').notNullable().defaultTo('COMPLETED')
      table.json('metadata').nullable()
      table.integer('download_count').defaultTo(0)
      table.timestamp('last_downloaded_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTableIfExists('gst_report_exports')
    this.schema.dropTableIfExists('invoice_items')
    this.schema.dropTableIfExists('invoices')
    this.schema.dropTableIfExists('shipments')
  }
}
