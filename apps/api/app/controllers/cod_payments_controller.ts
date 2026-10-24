import type { HttpContext } from '@adonisjs/core/http'
import Order from '#models/order'
import CodReconciliationService, { type CodStatus } from '#services/cod_reconciliation_service'

export default class CodPaymentsController {
  /**
   * Admin: List COD orders with status filters, search, and summary KPI metrics
   */
  public async index(ctx: HttpContext) {
    const { request, response } = ctx
    const user = ctx.user || ctx.auth?.user
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return response.forbidden({ error: 'Access restricted to administrators' })
    }

    const { status, search, startDate, endDate } = request.qs()

    let query = Order.query()
      .where('payment_method', 'COD')
      .preload('user')
      .preload('shipments', (sq) => sq.orderBy('created_at', 'desc'))
      .orderBy('created_at', 'desc')

    if (status && status !== 'ALL') {
      query = query.where('cod_payment_status', status)
    }

    if (startDate && endDate) {
      query = query.whereBetween('created_at', [startDate, endDate])
    }

    if (search) {
      query = query.where((builder) => {
        builder
          .where('order_no', 'like', `%${search}%`)
          .orWhere('awb_number', 'like', `%${search}%`)
          .orWhere('cod_remittance_ref', 'like', `%${search}%`)
          .orWhereHas('user', (uq) => {
            uq.where('name', 'like', `%${search}%`).orWhere('email', 'like', `%${search}%`)
          })
      })
    }

    const orders = await query
    const metrics = await CodReconciliationService.getMetrics({ startDate, endDate })

    // Calculate per-order reconciliation difference for the table
    const formattedOrders = orders.map((o) => {
      const json = o.toJSON()
      const expected = Number(o.codExpectedAmount ?? o.totalAmount) || 0
      const collected = Number(o.codCollectedAmount) || 0
      const remitted = Number(o.codRemittedAmount) || 0
      const settled = Number(o.codSettledAmount) || 0

      // Difference between expected and settled (or collected)
      const discrepancy = Math.max(0, expected - (settled > 0 ? settled : collected))

      return {
        ...json,
        expectedCodAmount: expected,
        actualCollectedAmount: collected,
        remittedAmount: remitted,
        settledAmount: settled,
        discrepancyAmount: discrepancy,
        latestShipment: o.shipments?.[0] || null,
      }
    })

    return response.ok({
      orders: formattedOrders,
      metrics,
      kpis: metrics,
    })
  }

  /**
   * Admin: Get single COD order detail and audit history
   */
  public async show(ctx: HttpContext) {
    const { params, response } = ctx
    const user = ctx.user || ctx.auth?.user
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return response.forbidden({ error: 'Access restricted to administrators' })
    }

    const order = await Order.query()
      .where('id', params.id)
      .where('payment_method', 'COD')
      .preload('user')
      .preload('items', (iq) => iq.preload('product'))
      .preload('shipments', (sq) => sq.orderBy('created_at', 'desc'))
      .preload('invoice')
      .first()

    if (!order) {
      return response.notFound({ error: 'COD order not found' })
    }

    const expected = Number(order.codExpectedAmount ?? order.totalAmount) || 0
    const collected = Number(order.codCollectedAmount) || 0
    const remitted = Number(order.codRemittedAmount) || 0
    const settled = Number(order.codSettledAmount) || 0
    const discrepancy = Math.max(0, expected - (settled > 0 ? settled : collected))

    return response.ok({
      order: {
        ...order.toJSON(),
        expectedCodAmount: expected,
        actualCollectedAmount: collected,
        remittedAmount: remitted,
        settledAmount: settled,
        discrepancyAmount: discrepancy,
      },
    })
  }

  /**
   * Admin: Manual COD Status Update & Reconciliation
   */
  public async updateStatus(ctx: HttpContext) {
    const { params, request, response } = ctx
    const user = ctx.user || ctx.auth?.user
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return response.forbidden({ error: 'Access restricted to administrators' })
    }

    const {
      status,
      collectedAmount,
      remittedAmount,
      settledAmount,
      remittanceRef,
      remittedAt,
      settledAt,
      notes,
    } = request.only([
      'status',
      'collectedAmount',
      'remittedAmount',
      'settledAmount',
      'remittanceRef',
      'remittedAt',
      'settledAt',
      'notes',
    ])

    const validStatuses: CodStatus[] = [
      'COD_PENDING',
      'COD_COLLECTED',
      'COD_REMITTED',
      'COD_SETTLED',
      'COD_FAILED',
      'COD_CANCELLED',
      'COD_DISPUTED',
    ]

    if (!status || !validStatuses.includes(status)) {
      return response.badRequest({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      })
    }

    try {
      const updatedOrder = await CodReconciliationService.updateStatus({
        orderId: Number(params.id),
        status,
        collectedAmount,
        remittedAmount,
        settledAmount,
        remittanceRef,
        remittedAt,
        settledAt,
        notes,
        actor: user,
      })

      return response.ok({
        message: `Order #${updatedOrder.orderNo} COD status updated to ${status}`,
        order: updatedOrder,
      })
    } catch (err: any) {
      return response.badRequest({ error: err.message || 'Failed to update COD status' })
    }
  }
}
