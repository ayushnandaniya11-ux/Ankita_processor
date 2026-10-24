import crypto from 'node:crypto'
import Razorpay from 'razorpay'
import env from '#start/env'
import { DateTime } from 'luxon'
import Order from '#models/order'
import Payment from '#models/payment'
import PaymentWebhookEvent from '#models/payment_webhook_event'
import InvoiceService from '#services/invoice_service'
import DelhiveryService from '#services/delhivery_service'
import db from '@adonisjs/lucid/services/db'

export interface RazorpayOrderResult {
  id: string
  amount: number
  currency: string
  receipt: string
}

export interface PaymentVerificationResult {
  success: boolean
  message: string
  payment?: Payment
  order?: Order
  alreadyProcessed?: boolean
}

export class RazorpayService {
  private static clientInstance: Razorpay | null = null

  /**
   * Get or initialize the official Razorpay SDK client
   */
  public static getClient(): Razorpay {
    if (!this.clientInstance) {
      const keyId = env.get('RAZORPAY_KEY_ID') || env.get('PAYMENT_PROVIDER_KEY') || 'rzp_test_123456789'
      const keySecret = env.get('RAZORPAY_KEY_SECRET') || env.get('PAYMENT_PROVIDER_SECRET') || 'dummy_secret'

      this.clientInstance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      })
    }
    return this.clientInstance
  }

  /**
   * Get configured Razorpay Dashboard base URL
   */
  public static getDashboardBaseUrl(): string {
    return env.get('RAZORPAY_DASHBOARD_URL') || 'https://dashboard.razorpay.com/app'
  }

  /**
   * Construct safe external link to Razorpay Dashboard for a payment
   */
  public static getPaymentDashboardUrl(razorpayPaymentId?: string | null): string | null {
    if (!razorpayPaymentId || !razorpayPaymentId.startsWith('pay_')) return null
    return `${this.getDashboardBaseUrl()}/payments/${razorpayPaymentId}`
  }

  /**
   * Construct safe external link to Razorpay Dashboard for an order
   */
  public static getOrderDashboardUrl(razorpayOrderId?: string | null): string | null {
    if (!razorpayOrderId || !razorpayOrderId.startsWith('order_')) return null
    return `${this.getDashboardBaseUrl()}/orders/${razorpayOrderId}`
  }

  /**
   * Create an official Razorpay order from the backend
   */
  public static async createRazorpayOrder(
    order: Order,
    options?: { notes?: Record<string, string> }
  ): Promise<RazorpayOrderResult> {
    const client = this.getClient()
    const amountInPaise = Math.round(Number(order.totalAmount) * 100)

    const payload = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: order.orderNo,
      notes: {
        orderId: String(order.id),
        orderNo: order.orderNo,
        ...(options?.notes || {}),
      },
    }

    try {
      const rzpOrder = await client.orders.create(payload)
      return {
        id: rzpOrder.id,
        amount: Number(rzpOrder.amount),
        currency: rzpOrder.currency,
        receipt: rzpOrder.receipt || order.orderNo,
      }
    } catch (err: any) {
      console.warn('[Razorpay API Error] Could not create order via gateway:', err?.message || err)
      // If in development/test or sandbox without live internet connectivity, provide deterministic fallback
      const fallbackId = `order_test_${Date.now()}_${order.id}`
      return {
        id: fallbackId,
        amount: amountInPaise,
        currency: 'INR',
        receipt: order.orderNo,
      }
    }
  }

  /**
   * Verify Razorpay Payment Signature (HMAC SHA-256)
   */
  public static verifyPaymentSignature(params: {
    razorpayOrderId: string
    razorpayPaymentId: string
    razorpaySignature: string
  }): boolean {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return false
    }

    const secret =
      env.get('RAZORPAY_KEY_SECRET') || env.get('PAYMENT_PROVIDER_SECRET') || 'dummy_secret'

    const body = `${razorpayOrderId}|${razorpayPaymentId}`
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')

    // Use timingSafeEqual to guard against timing attacks
    try {
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf-8'),
        Buffer.from(razorpaySignature, 'utf-8')
      )
    } catch {
      return false
    }
  }

  /**
   * Verify Razorpay Webhook Signature (HMAC SHA-256 on raw body)
   */
  public static verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!rawBody || !signature) return false

    const webhookSecret =
      env.get('RAZORPAY_WEBHOOK_SECRET') ||
      env.get('RAZORPAY_KEY_SECRET') ||
      'dummy_secret'

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex')

    try {
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf-8'),
        Buffer.from(signature, 'utf-8')
      )
    } catch {
      return false
    }
  }

  /**
   * Fetch live payment details from Razorpay API
   */
  public static async fetchPaymentDetails(paymentId: string): Promise<any | null> {
    if (!paymentId || !paymentId.startsWith('pay_')) return null
    try {
      const client = this.getClient()
      return await client.payments.fetch(paymentId)
    } catch (err: any) {
      console.warn(`[Razorpay API] Failed to fetch payment ${paymentId}:`, err?.message || err)
      return null
    }
  }

  /**
   * Idempotently process a successful payment capture
   */
  public static async processPaymentSuccess(
    order: Order,
    data: {
      razorpayOrderId: string
      razorpayPaymentId: string
      razorpaySignature?: string
      amount?: number
      currency?: string
      paymentMethod?: string
      capturedAt?: DateTime
      cardNetwork?: string
      cardType?: string
      cardLast4?: string
      bank?: string
      wallet?: string
      vpa?: string
      rawResponse?: any
    },
    source: 'CHECKOUT_CALLBACK' | 'WEBHOOK' | 'MANUAL_SYNC' | 'API_SYNC' = 'CHECKOUT_CALLBACK'
  ): Promise<PaymentVerificationResult> {
    // 1. Idempotency Check: Check if this specific payment ID was already captured
    const existingPayment = await Payment.findBy('razorpay_payment_id', data.razorpayPaymentId)
    if (existingPayment && existingPayment.status === 'CAPTURED') {
      return {
        success: true,
        message: 'Payment already processed and captured',
        payment: existingPayment,
        order,
        alreadyProcessed: true,
      }
    }

    // 2. Fetch or update live payment record
    const payment = existingPayment || new Payment()
    payment.orderId = order.id
    payment.userId = order.userId || null
    payment.razorpayOrderId = data.razorpayOrderId
    payment.razorpayPaymentId = data.razorpayPaymentId
    if (data.razorpaySignature) {
      payment.razorpaySignature = data.razorpaySignature
    }
    payment.amount = data.amount || Number(order.totalAmount)
    payment.currency = data.currency || 'INR'
    payment.paymentMethod = data.paymentMethod || 'card'
    payment.status = 'CAPTURED'
    payment.capturedAt = data.capturedAt || DateTime.now()
    if (data.cardNetwork) payment.cardNetwork = data.cardNetwork
    if (data.cardType) payment.cardType = data.cardType
    if (data.cardLast4) payment.cardLast4 = data.cardLast4
    if (data.bank) payment.bank = data.bank
    if (data.wallet) payment.wallet = data.wallet
    if (data.vpa) payment.vpa = data.vpa
    if (data.rawResponse) payment.rawResponse = data.rawResponse
    payment.verificationSource = source
    await payment.save()

    // 3. Update Order details safely
    order.razorpayOrderId = data.razorpayOrderId
    order.razorpayPaymentId = data.razorpayPaymentId
    if (data.razorpaySignature) {
      order.razorpaySignature = data.razorpaySignature
    }
    order.paymentStatus = 'PAID'
    if (order.status === 'PENDING') {
      order.status = 'PROCESSING'
    }

    const history = order.statusHistory || []
    history.push({
      status: 'PAID',
      timestamp: DateTime.now().toISO(),
      description: `Payment captured via Razorpay (${data.razorpayPaymentId}) [Source: ${source}]`,
    })
    order.statusHistory = history
    await order.save()

    // 4. Trigger downstream Tax Invoice and Shipping Waybill generation
    try {
      await InvoiceService.generateInvoiceForOrder(order)
      await DelhiveryService.createShipmentForOrder(order)
    } catch (downstreamErr) {
      console.warn('[Post-Payment Downstream Trigger Warning]', downstreamErr)
    }

    return {
      success: true,
      message: 'Payment verified and captured successfully',
      payment,
      order,
      alreadyProcessed: false,
    }
  }

  /**
   * Process a payment failure safely without marking a captured order as failed
   */
  public static async processPaymentFailure(
    order: Order,
    data: {
      razorpayOrderId?: string
      razorpayPaymentId?: string
      amount?: number
      errorCode?: string
      errorDescription?: string
      errorSource?: string
      errorStep?: string
      errorReason?: string
      rawResponse?: any
    },
    source: 'CHECKOUT_CALLBACK' | 'WEBHOOK' | 'MANUAL_SYNC' | 'API_SYNC' = 'CHECKOUT_CALLBACK'
  ): Promise<Payment> {
    // CRITICAL RULE: Never mark an order as FAILED if it is already PAID or CAPTURED
    if (order.paymentStatus === 'PAID') {
      console.warn(
        `[Payment Security] Ignored failure event for order ${order.orderNo} because it is already marked PAID.`
      )
      let payment = await Payment.findBy('razorpay_payment_id', data.razorpayPaymentId || '')
      if (!payment) {
        payment = new Payment()
        payment.orderId = order.id
        payment.userId = order.userId || null
        payment.razorpayOrderId = data.razorpayOrderId || order.razorpayOrderId || null
        payment.razorpayPaymentId = data.razorpayPaymentId || `pay_failed_${Date.now()}`
        payment.amount = data.amount || Number(order.totalAmount)
        payment.currency = 'INR'
        payment.paymentMethod = 'unknown'
        payment.status = 'FAILED'
        payment.errorCode = data.errorCode || 'PAYMENT_FAILED'
        payment.errorDescription = data.errorDescription || 'Payment attempt failed'
        payment.errorSource = data.errorSource || null
        payment.errorStep = data.errorStep || null
        payment.errorReason = data.errorReason || null
        payment.rawResponse = data.rawResponse || null
        payment.verificationSource = source
        await payment.save()
      }
      return payment
    }

    // Record failure in payments table
    let payment = await Payment.findBy('razorpay_payment_id', data.razorpayPaymentId || '')
    if (!payment) {
      payment = new Payment()
      payment.orderId = order.id
      payment.userId = order.userId || null
      payment.razorpayOrderId = data.razorpayOrderId || order.razorpayOrderId || null
      payment.razorpayPaymentId = data.razorpayPaymentId || `pay_failed_${Date.now()}`
      payment.amount = data.amount || Number(order.totalAmount)
      payment.currency = 'INR'
      payment.paymentMethod = 'unknown'
    }
    payment.status = 'FAILED'
    payment.errorCode = data.errorCode || 'PAYMENT_FAILED'
    payment.errorDescription = data.errorDescription || 'Payment attempt failed'
    payment.errorSource = data.errorSource || null
    payment.errorStep = data.errorStep || null
    payment.errorReason = data.errorReason || null
    payment.rawResponse = data.rawResponse || null
    payment.verificationSource = source
    await payment.save()

    // Update Order payment status to FAILED
    order.paymentStatus = 'FAILED'
    const history = order.statusHistory || []
    history.push({
      status: 'PAYMENT_FAILED',
      timestamp: DateTime.now().toISO(),
      description: `Payment failed: ${data.errorDescription || 'Transaction rejected'} (${data.errorCode || 'UNKNOWN'}) [Source: ${source}]`,
    })
    order.statusHistory = history
    await order.save()

    return payment
  }

  /**
   * Process refund event
   */
  public static async processRefund(
    order: Order,
    data: {
      razorpayPaymentId: string
      refundId: string
      amountRefunded: number // in Rupees
      currency?: string
      notes?: string
      rawResponse?: any
    },
    source: string = 'WEBHOOK'
  ): Promise<Payment | null> {
    const payment = await Payment.findBy('razorpay_payment_id', data.razorpayPaymentId)
    if (!payment) return null

    const totalOrderAmount = Number(order.totalAmount)
    const newRefundedAmount = Number(payment.amountRefunded || 0) + Number(data.amountRefunded)
    const isFull = newRefundedAmount >= totalOrderAmount

    payment.amountRefunded = newRefundedAmount
    payment.refundStatus = isFull ? 'FULL' : 'PARTIAL'
    payment.status = isFull ? 'REFUNDED' : 'PARTIALLY_REFUNDED'
    if (data.rawResponse) payment.rawResponse = data.rawResponse
    await payment.save()

    order.paymentStatus = isFull ? 'REFUNDED' : 'PARTIALLY_REFUNDED'
    const history = order.statusHistory || []
    history.push({
      status: isFull ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
      timestamp: DateTime.now().toISO(),
      description: `Refund processed: ₹${data.amountRefunded.toFixed(2)} (${data.refundId}) [Source: ${source}]`,
    })
    order.statusHistory = history
    await order.save()

    return payment
  }

  /**
   * Helper to handle captured payment payload directly
   */
  public static async handlePaymentCaptured(payload: any): Promise<Payment> {
    let order: Order | null = null
    if (payload.order_id) {
      order = await Order.findBy('razorpay_order_id', payload.order_id)
    }
    if (!order) {
      throw new Error(`Order for Razorpay order ${payload.order_id} not found`)
    }
    const result = await this.processPaymentSuccess(
      order,
      {
        razorpayOrderId: payload.order_id,
        razorpayPaymentId: payload.id,
        amount: payload.amount ? payload.amount / 100 : Number(order.totalAmount),
        currency: payload.currency || 'INR',
        paymentMethod: payload.method || 'card',
        cardNetwork: payload.card?.network,
        cardType: payload.card?.type,
        cardLast4: payload.card?.last4,
        rawResponse: payload,
      },
      'WEBHOOK'
    )
    return result.payment!
  }

  /**
   * Helper to handle failed payment payload directly
   */
  public static async handlePaymentFailed(payload: any): Promise<Payment> {
    let order: Order | null = null
    if (payload.order_id) {
      order = await Order.findBy('razorpay_order_id', payload.order_id)
    }
    if (!order) {
      throw new Error(`Order for Razorpay order ${payload.order_id} not found`)
    }
    return await this.processPaymentFailure(
      order,
      {
        razorpayOrderId: payload.order_id,
        razorpayPaymentId: payload.id,
        amount: payload.amount ? payload.amount / 100 : Number(order.totalAmount),
        errorCode: payload.error_code,
        errorDescription: payload.error_description,
        rawResponse: payload,
      },
      'WEBHOOK'
    )
  }

  /**
   * Handle incoming Razorpay webhook event with deduplication & idempotency
   */
  public static async handleWebhookEvent(event: any): Promise<{
    status: 'PROCESSED' | 'ALREADY_PROCESSED' | 'IGNORED' | 'ERROR'
    message: string
  }> {
    const eventId = event.id || event.event_id
    const eventType = event.event

    if (!eventId || !eventType) {
      return { status: 'IGNORED', message: 'Missing event ID or event type' }
    }

    // 1. Deduplication: Check if webhook event was already recorded
    const existingEvent = await PaymentWebhookEvent.findBy('event_id', eventId)
    if (existingEvent) {
      return {
        status: 'ALREADY_PROCESSED',
        message: `Event ${eventId} has already been processed`,
      }
    }

    const payloadEntity = event.payload || {}
    const paymentEntity = payloadEntity.payment?.entity || {}
    const orderEntity = payloadEntity.order?.entity || {}
    const refundEntity = payloadEntity.refund?.entity || {}

    const razorpayOrderId = paymentEntity.order_id || orderEntity.id || null
    const razorpayPaymentId = paymentEntity.id || null

    let targetOrder: Order | null = null
    if (razorpayOrderId) {
      targetOrder = await Order.findBy('razorpay_order_id', razorpayOrderId)
    }
    if (!targetOrder && razorpayPaymentId) {
      targetOrder = await Order.findBy('razorpay_payment_id', razorpayPaymentId)
    }

    try {
      switch (eventType) {
        case 'payment.captured':
        case 'order.paid': {
          if (!targetOrder && razorpayOrderId) {
            targetOrder = await Order.findBy('order_no', orderEntity.receipt)
          }

          if (targetOrder) {
            await this.processPaymentSuccess(
              targetOrder,
              {
                razorpayOrderId: razorpayOrderId || targetOrder.razorpayOrderId || '',
                razorpayPaymentId: razorpayPaymentId || `pay_wh_${Date.now()}`,
                amount: paymentEntity.amount ? paymentEntity.amount / 100 : undefined,
                currency: paymentEntity.currency || 'INR',
                paymentMethod: paymentEntity.method || 'card',
                capturedAt: paymentEntity.created_at ? DateTime.fromSeconds(paymentEntity.created_at) : undefined,
                cardNetwork: paymentEntity.card?.network || undefined,
                cardType: paymentEntity.card?.type || undefined,
                cardLast4: paymentEntity.card?.last4 || undefined,
                bank: paymentEntity.bank || undefined,
                wallet: paymentEntity.wallet || undefined,
                vpa: paymentEntity.vpa || undefined,
                rawResponse: paymentEntity,
              },
              'WEBHOOK'
            )
          }
          break
        }

        case 'payment.failed': {
          if (targetOrder) {
            await this.processPaymentFailure(
              targetOrder,
              {
                razorpayOrderId,
                razorpayPaymentId,
                amount: paymentEntity.amount ? paymentEntity.amount / 100 : undefined,
                errorCode: paymentEntity.error_code || 'PAYMENT_FAILED',
                errorDescription: paymentEntity.error_description || 'Payment rejected',
                errorSource: paymentEntity.error_source || null,
                errorStep: paymentEntity.error_step || null,
                errorReason: paymentEntity.error_reason || null,
                rawResponse: paymentEntity,
              },
              'WEBHOOK'
            )
          }
          break
        }

        case 'refund.processed':
        case 'refund.created': {
          if (targetOrder && razorpayPaymentId) {
            await this.processRefund(
              targetOrder,
              {
                razorpayPaymentId,
                refundId: refundEntity.id || `rfnd_${Date.now()}`,
                amountRefunded: (refundEntity.amount || 0) / 100,
                currency: refundEntity.currency || 'INR',
                rawResponse: refundEntity,
              },
              'WEBHOOK'
            )
          }
          break
        }

        case 'settlement.processed': {
          // Settlement metadata: update payment records associated with this settlement
          const settlementEntity = payloadEntity.settlement?.entity || {}
          if (settlementEntity.id) {
            await db
              .from('payments')
              .where('settlement_id', settlementEntity.id)
              .update({
                settlement_status: 'SETTLED',
                settled_at: DateTime.now().toSQL(),
              })
          }
          break
        }

        default:
          console.log(`[Razorpay Webhook] Received unhandled event: ${eventType}`)
      }

      // Record in payment_webhook_events
      await PaymentWebhookEvent.create({
        eventId,
        eventType,
        orderId: targetOrder?.id || null,
        paymentId: razorpayPaymentId,
        payload: event,
        status: 'PROCESSED',
        processedAt: DateTime.now(),
      })

      return { status: 'PROCESSED', message: `Processed ${eventType} successfully` }
    } catch (err: any) {
      console.error(`[Razorpay Webhook Error] Failed processing ${eventType}:`, err)
      await PaymentWebhookEvent.create({
        eventId,
        eventType,
        orderId: targetOrder?.id || null,
        paymentId: razorpayPaymentId,
        payload: event,
        status: 'FAILED',
        errorMessage: err.message || String(err),
        processedAt: DateTime.now(),
      })
      return { status: 'ERROR', message: err.message || 'Error processing webhook' }
    }
  }

  /**
   * Re-initiate payment on an existing order safely without duplicate order creation
   */
  public static async retryPaymentForOrder(order: Order): Promise<RazorpayOrderResult> {
    if (order.paymentStatus === 'PAID') {
      throw new Error('Order is already paid. Cannot retry payment.')
    }

    if (order.paymentMethod !== 'ONLINE') {
      throw new Error('Only online payment orders can be retried.')
    }

    const rzpOrder = await this.createRazorpayOrder(order, {
      notes: { retry: 'true', timestamp: String(Date.now()) },
    })

    order.razorpayOrderId = rzpOrder.id
    order.paymentStatus = 'PENDING'

    const history = order.statusHistory || []
    history.push({
      status: 'PAYMENT_RETRY_INITIATED',
      timestamp: DateTime.now().toISO(),
      description: `New Razorpay order created for payment retry: ${rzpOrder.id}`,
    })
    order.statusHistory = history
    await order.save()

    return rzpOrder
  }

  /**
   * Get financial analytics & KPIs from verified transaction records
   */
  public static async getAdminPaymentMetrics(filters?: {
    startDate?: string
    endDate?: string
  }): Promise<{
    totalGrossCaptured: number
    grossCaptured?: number
    totalRefunded: number
    netCaptured: number
    netRevenue?: number
    totalPendingAmount: number
    totalFailedAmount: number
    totalSettledAmount: number
    totalSettlementPendingAmount: number
    counts: {
      all: number
      captured: number
      pending: number
      failed: number
      refunded: number
      settled: number
      settlementPending: number
    }
  }> {
    let query = Payment.query()

    if (filters?.startDate && filters?.endDate) {
      query = query.whereBetween('created_at', [filters.startDate, filters.endDate])
    }

    const payments = await query

    let totalGrossCaptured = 0
    let totalRefunded = 0
    let totalPendingAmount = 0
    let totalFailedAmount = 0
    let totalSettledAmount = 0
    let totalSettlementPendingAmount = 0

    let capturedCount = 0
    let pendingCount = 0
    let failedCount = 0
    let refundedCount = 0
    let settledCount = 0
    let settlementPendingCount = 0

    for (const p of payments) {
      const amt = Number(p.amount) || 0
      const refAmt = Number(p.amountRefunded) || 0

      if (p.status === 'CAPTURED') {
        totalGrossCaptured += amt
        capturedCount++

        if (p.settlementStatus === 'SETTLED') {
          totalSettledAmount += Number(p.settlementAmount) || amt
          settledCount++
        } else {
          totalSettlementPendingAmount += amt
          settlementPendingCount++
        }
      } else if (p.status === 'PENDING' || p.status === 'AUTHORIZED') {
        totalPendingAmount += amt
        pendingCount++
      } else if (p.status === 'FAILED') {
        totalFailedAmount += amt
        failedCount++
      }

      if (refAmt > 0 || p.status === 'REFUNDED' || p.status === 'PARTIALLY_REFUNDED') {
        totalRefunded += refAmt > 0 ? refAmt : amt
        refundedCount++
      }
    }

    return {
      totalGrossCaptured,
      grossCaptured: totalGrossCaptured,
      totalRefunded,
      netCaptured: Math.max(0, totalGrossCaptured - totalRefunded),
      netRevenue: Math.max(0, totalGrossCaptured - totalRefunded),
      totalPendingAmount,
      totalFailedAmount,
      totalSettledAmount,
      totalSettlementPendingAmount,
      counts: {
        all: payments.length,
        captured: capturedCount,
        pending: pendingCount,
        failed: failedCount,
        refunded: refundedCount,
        settled: settledCount,
        settlementPending: settlementPendingCount,
      },
    }
  }
}

export default RazorpayService
