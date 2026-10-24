import type { HttpContext } from '@adonisjs/core/http'
import Order from '#models/order'
import Payment from '#models/payment'
import PaymentWebhookEvent from '#models/payment_webhook_event'
import RazorpayService from '#services/razorpay_service'
import ActivityLog from '#models/activity_log'
import { DateTime } from 'luxon'

export default class PaymentsController {
  /**
   * Client-side checkout callback verification
   */
  public async verifyPayment({ request, response }: HttpContext) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = request.only([
      'razorpay_order_id',
      'razorpay_payment_id',
      'razorpay_signature',
    ])

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return response.badRequest({
        error: 'Missing required Razorpay verification parameters',
      })
    }

    // 1. Verify payment signature
    const isValidSignature = RazorpayService.verifyPaymentSignature({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    })

    if (!isValidSignature) {
      return response.badRequest({
        error: 'Invalid Payment Signature: Payment verification failed',
      })
    }

    // 2. Locate internal order
    const order = await Order.findBy('razorpay_order_id', razorpay_order_id)
    if (!order) {
      return response.notFound({
        error: `Order with Razorpay order ID ${razorpay_order_id} not found`,
      })
    }

    // 3. Query Razorpay API for live payment verification
    let liveDetails: any = null
    try {
      liveDetails = await RazorpayService.fetchPaymentDetails(razorpay_payment_id)
    } catch (e) {
      console.warn('[Razorpay API Fetch Warning]', e)
    }

    const paymentMethod = liveDetails?.method || 'card'
    const amountInRupees = liveDetails?.amount ? liveDetails.amount / 100 : Number(order.totalAmount)

    // 4. Process payment capture idempotently
    const result = await RazorpayService.processPaymentSuccess(
      order,
      {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        amount: amountInRupees,
        currency: liveDetails?.currency || 'INR',
        paymentMethod,
        cardNetwork: liveDetails?.card?.network || undefined,
        cardType: liveDetails?.card?.type || undefined,
        cardLast4: liveDetails?.card?.last4 || undefined,
        bank: liveDetails?.bank || undefined,
        wallet: liveDetails?.wallet || undefined,
        vpa: liveDetails?.vpa || undefined,
        rawResponse: liveDetails,
      },
      'CHECKOUT_CALLBACK'
    )

    return response.ok({
      verified: true,
      message: 'Payment verified and order confirmed successfully',
      order: result.order,
      payment: result.payment,
    })
  }

  /**
   * Razorpay Webhooks Listener
   */
  public async handleWebhook({ request, response }: HttpContext) {
    const signature = request.header('x-razorpay-signature')
    const rawBody = (request as any).raw() || JSON.stringify(request.body())

    // 1. Verify Webhook Signature
    if (signature) {
      const isValid = RazorpayService.verifyWebhookSignature(rawBody, signature)
      if (!isValid) {
        console.error('[Razorpay Webhook Error] Invalid webhook signature detected')
        return response.badRequest({ error: 'Invalid Webhook Signature' })
      }
    } else {
      console.warn('[Razorpay Webhook Warning] No signature header present; verifying payload')
    }

    // 2. Delegate to RazorpayService for deduplication and execution
    const eventPayload = request.body()
    const result = await RazorpayService.handleWebhookEvent(eventPayload)

    return response.ok({
      ok: true,
      received: true,
      status: result.status,
      message: result.message,
    })
  }

  /**
   * Retry payment for an existing unpaid order
   */
  public async retryPayment(ctx: HttpContext) {
    const { params, response } = ctx
    const user = ctx.user || ctx.auth?.user
    if (!user) {
      return response.unauthorized({ error: 'Please login to retry payment' })
    }

    const order = await Order.find(params.id)
    if (!order) {
      return response.notFound({ error: 'Order not found' })
    }

    // Authorization: User must own the order or be an Admin
    if (order.userId !== user.id && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return response.forbidden({ error: 'Forbidden: You cannot modify this order' })
    }

    try {
      const rzpOrder = await RazorpayService.retryPaymentForOrder(order)
      return response.ok({
        message: 'Razorpay order generated for payment retry',
        order,
        orderNo: order.orderNo,
        razorpayOrderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
      })
    } catch (err: any) {
      return response.badRequest({ error: err.message || 'Failed to retry payment' })
    }
  }

  /**
   * Admin: List payments with search, filters, and financial metrics
   */
  public async adminIndex(ctx: HttpContext) {
    const { request, response } = ctx
    const user = ctx.user || ctx.auth?.user
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return response.forbidden({ error: 'Access restricted to administrators' })
    }

    const { status, search, settlementStatus } = request.qs()

    let query = Payment.query()
      .preload('order', (oq) => {
        oq.preload('user')
      })
      .orderBy('created_at', 'desc')

    if (status && status !== 'ALL') {
      query = query.where('status', status)
    }

    if (settlementStatus && settlementStatus !== 'ALL') {
      query = query.where('settlement_status', settlementStatus)
    }

    if (search) {
      query = query.where((builder) => {
        builder
          .where('razorpay_payment_id', 'like', `%${search}%`)
          .orWhere('razorpay_order_id', 'like', `%${search}%`)
          .orWhereHas('order', (oq) => {
            oq.where('order_no', 'like', `%${search}%`).orWhereHas('user', (uq) => {
              uq.where('name', 'like', `%${search}%`).orWhere('email', 'like', `%${search}%`)
            })
          })
      })
    }

    const payments = await query
    const metrics = await RazorpayService.getAdminPaymentMetrics()

    // Add dashboard URL to each payment
    const paymentsWithUrls = payments.map((p) => {
      const json = p.toJSON()
      return {
        ...json,
        razorpayDashboardUrl: RazorpayService.getPaymentDashboardUrl(p.razorpayPaymentId),
        orderDashboardUrl: RazorpayService.getOrderDashboardUrl(p.razorpayOrderId),
      }
    })

    return response.ok({
      payments: paymentsWithUrls,
      metrics,
    })
  }

  /**
   * Admin: View single payment details and audit history
   */
  public async adminShow(ctx: HttpContext) {
    const { params, response } = ctx
    const user = ctx.user || ctx.auth?.user
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return response.forbidden({ error: 'Access restricted to administrators' })
    }

    const payment = await Payment.query()
      .where('id', params.id)
      .preload('order', (oq) => {
        oq.preload('user').preload('items', (iq) => iq.preload('product'))
      })
      .first()

    if (!payment) {
      return response.notFound({ error: 'Payment transaction not found' })
    }

    // Fetch related webhook events for this payment
    const webhookEvents = await PaymentWebhookEvent.query()
      .where('payment_id', payment.razorpayPaymentId || '')
      .orWhere('order_id', payment.orderId)
      .orderBy('created_at', 'desc')

    return response.ok({
      payment: {
        ...payment.toJSON(),
        razorpayDashboardUrl: RazorpayService.getPaymentDashboardUrl(payment.razorpayPaymentId),
        orderDashboardUrl: RazorpayService.getOrderDashboardUrl(payment.razorpayOrderId),
      },
      webhookEvents,
    })
  }

  /**
   * Admin: Sync live status from Razorpay API
   */
  public async adminSync(ctx: HttpContext) {
    const { params, response } = ctx
    const user = ctx.user || ctx.auth?.user
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return response.forbidden({ error: 'Access restricted to administrators' })
    }

    const payment = await Payment.find(params.id)
    if (!payment || !payment.razorpayPaymentId) {
      return response.notFound({ error: 'Payment record with Razorpay ID not found' })
    }

    const liveDetails = await RazorpayService.fetchPaymentDetails(payment.razorpayPaymentId)
    if (!liveDetails) {
      return response.badRequest({ error: 'Could not fetch payment from Razorpay API' })
    }

    if (liveDetails.status === 'captured') {
      payment.status = 'CAPTURED'
      payment.capturedAt = liveDetails.created_at ? DateTime.fromSeconds(liveDetails.created_at) : payment.capturedAt
    } else if (liveDetails.status === 'failed') {
      payment.status = 'FAILED'
      payment.errorCode = liveDetails.error_code
      payment.errorDescription = liveDetails.error_description
    }

    if (liveDetails.method) payment.paymentMethod = liveDetails.method
    if (liveDetails.card) {
      payment.cardNetwork = liveDetails.card.network
      payment.cardType = liveDetails.card.type
      payment.cardLast4 = liveDetails.card.last4
    }
    payment.rawResponse = liveDetails
    payment.verificationSource = 'API_SYNC'
    await payment.save()

    try {
      await ActivityLog.create({
        userId: user.id,
        action: 'SYNC_PAYMENT_STATUS',
        module: 'PAYMENTS',
        description: `Synced payment ${payment.razorpayPaymentId} status from Razorpay API: ${payment.status}`,
        metadata: { paymentId: payment.id, rzpPaymentId: payment.razorpayPaymentId, status: payment.status },
      })
    } catch {}

    return response.ok({
      message: 'Payment status synced successfully from Razorpay',
      payment,
    })
  }
}
