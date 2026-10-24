import type { HttpContext } from '@adonisjs/core/http'
import fs from 'node:fs'
import Order from '#models/order'
import User from '#models/user'
import Shipment from '#models/shipment'
import Invoice from '#models/invoice'
import DelhiveryService from '#services/delhivery_service'
import InvoiceService from '#services/invoice_service'
import { DateTime } from 'luxon'

export default class AdminOrdersController {
  public async index({ request, response }: HttpContext) {
    const { status, search } = request.qs()
    let query = Order.query()
      .preload('items', (itemsQuery) => itemsQuery.preload('product'))
      .orderBy('created_at', 'desc')

    if (status) {
      query = query.where('status', status)
    }

    if (search) {
      query = query.where((builder) => {
        builder.where('orderNo', 'like', `%${search}%`)
      })
    }

    const orders = await query

    // Preload user data and shipment status
    for (const order of orders) {
      const user = await User.find(order.userId)
      ;(order as any).user = user

      const shipment = await Shipment.query()
        .where('order_id', order.id)
        .orderBy('created_at', 'desc')
        .first()
      ;(order as any).shipment = shipment
    }

    return response.ok({ orders })
  }

  public async show({ params, response }: HttpContext) {
    const order = await Order.find(params.id)
    if (!order) {
      return response.notFound({ error: 'Order not found' })
    }
    await order.load('items', (itemsQuery) => itemsQuery.preload('product'))
    const user = await User.find(order.userId)
    ;(order as any).user = user

    const shipment = await Shipment.query()
      .where('order_id', order.id)
      .orderBy('created_at', 'desc')
      .first()
    ;(order as any).shipment = shipment

    const invoice = await Invoice.query()
      .where('order_id', order.id)
      .preload('items')
      .first()
    ;(order as any).invoice = invoice

    return response.ok({ order })
  }

  public async accept({ params, response }: HttpContext) {
    const order = await Order.find(params.id)
    if (!order) {
      return response.notFound({ error: 'Order not found' })
    }

    if (order.status !== 'PENDING') {
      return response.badRequest({ error: 'Only pending orders can be accepted' })
    }

    order.status = 'READY_TO_SHIP'
    await order.save()

    return response.ok({ message: 'Order accepted', order })
  }

  public async reject({ params, response }: HttpContext) {
    const order = await Order.find(params.id)
    if (!order) {
      return response.notFound({ error: 'Order not found' })
    }

    if (order.status !== 'PENDING') {
      return response.badRequest({ error: 'Only pending orders can be rejected' })
    }

    order.status = 'CANCELLED'
    await order.save()

    return response.ok({ message: 'Order rejected', order })
  }

  public async generateInvoice({ params, response }: HttpContext) {
    const order = await Order.find(params.id)
    if (!order) {
      return response.notFound({ error: 'Order not found' })
    }

    const invoice = await InvoiceService.generateInvoiceForOrder(order)

    return response.ok({
      message: 'Tax invoice generated successfully',
      invoiceNo: invoice.invoiceNumber,
      invoice,
      order,
    })
  }

  /**
   * Generate official Delhivery 6x4 Waybill
   */
  public async generateWaybill({ params, request, response }: HttpContext) {
    const order = await Order.find(params.id)
    if (!order) {
      return response.notFound({ error: 'Order not found' })
    }

    if (order.status !== 'READY_TO_SHIP' && order.status !== 'PROCESSING') {
      return response.badRequest({ error: 'Order must be Ready to Ship or Processing to generate waybill' })
    }

    const weightKg = Number(request.input('weightKg')) || 0.5
    const dimensions = request.input('dimensions') || { length: 15, breadth: 10, height: 5 }

    const result = await DelhiveryService.createShipmentForOrder(order, { weightKg, dimensions })

    if (!result.success) {
      return response.badRequest({
        error: result.error || 'Failed to generate official shipping waybill',
        status: result.status,
      })
    }

    const shipment = await Shipment.query()
      .where('order_id', order.id)
      .orderBy('created_at', 'desc')
      .first()

    return response.ok({
      message: `Official ${shipment?.courierName || 'Delhivery Express'} waybill generated successfully`,
      waybill: result.awbNumber,
      courier: shipment?.courierName || 'Delhivery Express',
      trackingUrl: result.trackingUrl,
      downloadUrl: `/api/v1/admin/orders/${order.id}/waybill/download`,
      isSimulation: result.isSimulation,
      order,
      shipment,
    })
  }

  /**
   * Retry failed waybill generation
   */
  public async retryWaybill({ params, request, response }: HttpContext) {
    const order = await Order.find(params.id)
    if (!order) {
      return response.notFound({ error: 'Order not found' })
    }

    const weightKg = Number(request.input('weightKg')) || 0.5
    const dimensions = request.input('dimensions') || { length: 15, breadth: 10, height: 5 }

    const result = await DelhiveryService.createShipmentForOrder(order, { weightKg, dimensions, retrying: true })

    if (!result.success) {
      return response.badRequest({
        error: result.error || 'Failed to generate waybill upon retry',
        status: result.status,
      })
    }

    return response.ok({
      message: 'Official Delhivery waybill generated successfully upon retry',
      waybill: result.awbNumber,
      downloadUrl: `/api/v1/admin/orders/${order.id}/waybill/download`,
      order,
    })
  }

  /**
   * Retrieve official waybill metadata and preview details
   */
  public async getWaybill({ params, response }: HttpContext) {
    const order = await Order.find(params.id)
    if (!order) {
      return response.notFound({ error: 'Order not found' })
    }

    await order.load('items', (itemsQuery) => {
      itemsQuery.preload('product')
    })
    const user = await User.find(order.userId)
    ;(order as any).user = user

    let invoice = await Invoice.query().where('order_id', order.id).first()
    if (!invoice) {
      try {
        invoice = await InvoiceService.generateInvoiceForOrder(order)
      } catch (err: any) {
        console.warn('[GetWaybill Invoice Auto-Gen]', err.message)
      }
    }

    const shipment = await Shipment.query()
      .where('order_id', order.id)
      .orderBy('created_at', 'desc')
      .first()

    let barcodeBase64: string | null = null
    let qrBase64: string | null = null

    if (shipment?.awbNumber) {
      barcodeBase64 = await DelhiveryService.generateBarcodeBase64(shipment.awbNumber)
      const trackingUrl =
        shipment.trackingUrl || `https://www.delhivery.com/track/package/${shipment.awbNumber}`
      qrBase64 = await DelhiveryService.generateQrBase64(trackingUrl)
    }

    if (!shipment) {
      return response.ok({
        status: 'PENDING',
        order,
        shipment: null,
        invoice,
      })
    }

    return response.ok({
      status: shipment.status,
      awbNumber: shipment.awbNumber,
      courier: shipment.courierName,
      trackingUrl: shipment.trackingUrl,
      labelFormat: shipment.labelFormat,
      downloadUrl: `/api/v1/admin/orders/${order.id}/waybill/download`,
      createdAt: shipment.createdAt,
      order,
      shipment,
      invoice,
      barcodeBase64,
      qrBase64,
    })
  }

  /**
   * Download official 6x4 inch Waybill PDF
   */
  public async downloadWaybill({ params, response }: HttpContext) {
    const order = await Order.find(params.id)
    if (!order) {
      return response.notFound({ error: 'Order not found' })
    }

    let shipment = await Shipment.query()
      .where('order_id', order.id)
      .orderBy('created_at', 'desc')
      .first()

    if (!shipment || !shipment.waybillDocumentPath || !fs.existsSync(shipment.waybillDocumentPath)) {
      // If shipment was recorded but file missing or needs generating
      const result = await DelhiveryService.createShipmentForOrder(order)

      if (!result.success || !result.pdfPath) {
        return response.badRequest({ error: 'Waybill document not yet generated or available.' })
      }
      shipment = await Shipment.query().where('order_id', order.id).first()
    }

    if (!shipment || !shipment.waybillDocumentPath || !fs.existsSync(shipment.waybillDocumentPath)) {
      return response.notFound({ error: 'Official waybill document file not found' })
    }

    const providerName = shipment.logisticsProvider || 'delhivery'
    response.header('Content-Type', 'application/pdf')
    response.header(
      'Content-Disposition',
      `attachment; filename="${providerName}_waybill_${shipment.awbNumber || order.orderNo}.pdf"`
    )
    return response.download(shipment.waybillDocumentPath)
  }

  /**
   * Download official Tax Invoice PDF for admin
   */
  public async downloadInvoice({ params, response }: HttpContext) {
    const order = await Order.find(params.id)
    if (!order) {
      return response.notFound({ error: 'Order not found' })
    }

    let invoice = await Invoice.query().where('order_id', order.id).first()
    if (!invoice) {
      invoice = await InvoiceService.generateInvoiceForOrder(order)
    }

    if (!invoice.pdfPath || !fs.existsSync(invoice.pdfPath)) {
      await invoice.load('items')
      const pdfPath = await InvoiceService.generateInvoicePdf(invoice, invoice.items)
      invoice.pdfPath = pdfPath
      await invoice.save()
    }

    response.header('Content-Type', 'application/pdf')
    response.header(
      'Content-Disposition',
      `attachment; filename="tax_invoice_${invoice.invoiceNumber}.pdf"`
    )
    return response.download(invoice.pdfPath)
  }

  public async getShipping({ response }: HttpContext) {
    const orders = await Order.query()
      .whereNotNull('awbNumber')
      .preload('items', (itemsQuery) => itemsQuery.preload('product'))
      .orderBy('updated_at', 'desc')

    for (const order of orders) {
      const user = await User.find(order.userId)
      ;(order as any).user = user

      const shipment = await Shipment.query()
        .where('order_id', order.id)
        .orderBy('created_at', 'desc')
        .first()
      ;(order as any).shipment = shipment
    }

    return response.ok({ shipments: orders })
  }

  public async logisticsWebhook({ request, response }: HttpContext) {
    const body = request.body() || {}

    // Support both direct payload and standard Delhivery CMU webhook structure
    const awbNumber =
      body.awbNumber ||
      body.waybill ||
      body.Shipment?.AWB ||
      body.AWB

    const rawEvent =
      body.event ||
      body.status ||
      body.Shipment?.Status?.Status ||
      body.Status?.Status

    const timestamp =
      body.timestamp ||
      body.Shipment?.Status?.StatusDateTime ||
      DateTime.now().toISO()

    if (!awbNumber || !rawEvent) {
      return response.badRequest({ error: 'AWB Number and event/status are required' })
    }

    const order = await Order.findBy('awbNumber', awbNumber)
    if (!order) {
      return response.notFound({ error: 'Order with given AWB not found' })
    }

    // Normalize event name
    const normalized = String(rawEvent).toUpperCase().replace(/[\s-]/g, '_')
    let event = 'IN_TRANSIT'
    if (normalized.includes('DELIVER') || normalized === 'DL') {
      event = 'DELIVERED'
    } else if (normalized.includes('PICK') || normalized === 'PU') {
      event = 'PICKED_UP'
    } else if (normalized.includes('OUT') || normalized === 'OFD') {
      event = 'OUT_FOR_DELIVERY'
    } else if (normalized.includes('RTO') || normalized.includes('RETURN')) {
      event = 'RTO'
    } else if (normalized.includes('FAIL') || normalized.includes('CANCEL')) {
      event = 'FAILED'
    }

    // Update shipment if exists
    const shipment = await Shipment.findBy('awb_number', awbNumber)
    const courierName = shipment?.courierName || order.courier || 'Delhivery Express'

    if (shipment) {
      if (event === 'DELIVERED') {
        shipment.status = 'DELIVERED'
        shipment.deliveredDate = DateTime.fromISO(timestamp) || DateTime.now()
      } else if (event === 'FAILED' || event === 'RTO') {
        shipment.status = 'FAILED'
      } else {
        shipment.status = 'IN_TRANSIT'
      }
      await shipment.save()
    }

    // Map logistics event to order status
    switch (event) {
      case 'PICKED_UP':
      case 'IN_TRANSIT':
      case 'OUT_FOR_DELIVERY':
        order.status = 'SHIPPED'
        if (event === 'PICKED_UP' && !order.pickupDate) {
          order.pickupDate = DateTime.fromISO(timestamp) || DateTime.now()
        }
        break
      case 'DELIVERED':
        order.status = 'DELIVERED'
        order.deliveredDate = DateTime.fromISO(timestamp) || DateTime.now()
        // If Cash on Delivery, mark as COD_COLLECTED upon confirmed delivery
        if (order.paymentMethod === 'COD' && order.codPaymentStatus === 'COD_PENDING') {
          order.codPaymentStatus = 'COD_COLLECTED'
          order.codCollectedAmount = order.totalAmount
        }
        break
      case 'FAILED':
      case 'RTO':
        order.status = 'RETURNED'
        break
    }

    const history = order.statusHistory || []
    history.push({
      status: event,
      timestamp: timestamp || DateTime.now().toISO(),
      description: `${courierName} tracking update: ${event} (${rawEvent})`,
    })
    order.statusHistory = history

    await order.save()

    return response.ok({ message: 'Logistics event recorded successfully' })
  }
}
