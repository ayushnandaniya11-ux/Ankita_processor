import type { HttpContext } from '@adonisjs/core/http'
import Order from '#models/order'
import User from '#models/user'
import { DateTime } from 'luxon'

export default class AdminOrdersController {
  public async index({ request, response }: HttpContext) {
    const { status, search } = request.qs()
    let query = Order.query().preload('items').orderBy('created_at', 'desc')

    if (status) {
      query = query.where('status', status)
    }

    if (search) {
      query = query.where(builder => {
        builder.where('orderNo', 'like', `%${search}%`)
      })
    }

    const orders = await query

    // Preload user data manually if relationship not defined, or we assume it's defined
    for (const order of orders) {
      const user = await User.find(order.userId)
      ;(order as any).user = user
    }

    return response.ok({ orders })
  }

  public async show({ params, response }: HttpContext) {
    const order = await Order.find(params.id)
    if (!order) {
      return response.notFound({ error: 'Order not found' })
    }
    await order.load('items')
    const user = await User.find(order.userId)
    ;(order as any).user = user

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

    if (!order.invoiceNo) {
      order.invoiceNo = 'INV-' + Math.floor(100000 + Math.random() * 900000)
      await order.save()
    }

    return response.ok({ message: 'Invoice generated', invoiceNo: order.invoiceNo, order })
  }

  public async generateWaybill({ params, response }: HttpContext) {
    const order = await Order.find(params.id)
    if (!order) {
      return response.notFound({ error: 'Order not found' })
    }

    if (order.status !== 'READY_TO_SHIP') {
      return response.badRequest({ error: 'Order must be Ready to Ship to generate waybill' })
    }

    if (!order.awbNumber) {
      // Mock logistics integration
      order.awbNumber = 'AWB-' + Math.floor(10000000 + Math.random() * 90000000)
      order.courier = 'Delhivery'
      order.trackingUrl = `https://track.delhivery.com/${order.awbNumber}`
      
      const history = order.statusHistory || []
      history.push({
        status: 'WAYBILL_GENERATED',
        timestamp: DateTime.now().toISO(),
        description: 'Waybill has been generated'
      })
      order.statusHistory = history

      await order.save()
    }

    return response.ok({ message: 'Waybill generated', waybill: order.awbNumber, order })
  }

  public async getShipping({ response }: HttpContext) {
    const orders = await Order.query()
      .whereNotNull('awbNumber')
      .preload('items')
      .orderBy('updated_at', 'desc')

    for (const order of orders) {
      const user = await User.find(order.userId)
      ;(order as any).user = user
    }
    
    return response.ok({ shipments: orders })
  }

  public async logisticsWebhook({ request, response }: HttpContext) {
    const { awbNumber, event, timestamp } = request.body()

    if (!awbNumber || !event) {
      return response.badRequest({ error: 'AWB Number and event are required' })
    }

    const order = await Order.findBy('awbNumber', awbNumber)
    if (!order) {
      return response.notFound({ error: 'Order with given AWB not found' })
    }

    const validEvents = ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RTO']
    if (!validEvents.includes(event)) {
      return response.badRequest({ error: 'Invalid event' })
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
      description: `Logistics update: ${event}`
    })
    order.statusHistory = history

    await order.save()

    return response.ok({ message: 'Logistics event recorded successfully' })
  }
}