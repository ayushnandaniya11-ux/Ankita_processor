import type { HttpContext } from '@adonisjs/core/http'
import Order from '#models/order'
import Product from '#models/product'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'
import vine from '@vinejs/vine'
import SessionService from '#services/session_service'
import fs from 'node:fs'
import DelhiveryService from '#services/delhivery_service'
import InvoiceService from '#services/invoice_service'
import Invoice from '#models/invoice'
import Payment from '#models/payment'
import RazorpayService from '#services/razorpay_service'

const checkoutSchema = vine.compile(
  vine.object({
    items: vine
      .array(
        vine.object({
          productId: vine.number(),
          quantity: vine.number().min(1).max(100),
        })
      )
      .minLength(1)
      .maxLength(100),
    paymentMethod: vine.enum(['COD', 'ONLINE']),
    shippingAddress: vine.string().trim().minLength(10),
    billingAddress: vine.string().trim().minLength(10).optional(),
  })
)

export default class OrdersController {
  public async checkout(ctx: HttpContext) {
    const { request, response, auth } = ctx

    // 1. Identify User (Logged-in or Guest Customer)
    let user = ctx.user || auth?.user
    if (!user) {
      const rawToken = SessionService.extractSessionToken(ctx)
      if (rawToken) {
        const result = await SessionService.validateSession(rawToken)
        if (result) user = result.user
      }
    }

    if (!user) {
      // Create or locate guest customer
      const guestPhone = request.input('phone') || '9876543210'
      const guestName = request.input('name') || 'Guest Customer'
      user = await User.firstOrCreate(
        { email: `guest_${guestPhone}@ankita.com` },
        {
          name: guestName,
          phone: guestPhone,
          password: 'guest_secure_pwd_' + Math.random().toString(36).substring(2, 8),
          role: 'CUSTOMER',
        }
      )
    }

    let payload
    try {
      payload = await request.validateUsing(checkoutSchema)
    } catch (error: any) {
      return response.badRequest(error.messages || { error: 'Invalid checkout payload' })
    }

    const { items, paymentMethod, shippingAddress, billingAddress } = payload

    if (!items || !Array.isArray(items) || items.length === 0) {
      return response.badRequest({ error: 'Order items are required.' })
    }

    // 2. Perform Stock & Price Verification with Database Transaction
    const trx = await db.transaction()

    try {
      let calculatedSubtotal = 0
      let calculatedTax = 0
      const orderItemsToSave: any[] = []

      for (const item of items) {
        // Query product with row lock for safe inventory management
        const product = await Product.query({ client: trx })
          .where('id', item.productId)
          .forUpdate()
          .first()

        if (!product) {
          await trx.rollback()
          return response.badRequest({ error: `Product ID #${item.productId} not found.` })
        }

        if (!product.isPublished) {
          await trx.rollback()
          return response.badRequest({
            error: `"${product.name}" is not currently available for purchase.`,
          })
        }

        const quantity = Number(item.quantity) || 1

        // Strict Stock Check
        if (product.stock < quantity) {
          await trx.rollback()
          return response.badRequest({
            error: `Insufficient inventory for "${product.name}". Only ${product.stock} unit(s) remaining in stock.`,
          })
        }

        // Backend Price & Tax Calculation
        const unitPrice = Number(product.sellingPrice) || 0
        const itemTotal = unitPrice * quantity
        const gstRate = Number((product.attributes as any)?.gstRate) || 5
        const itemTax = Math.round((itemTotal * gstRate) / 100)

        calculatedSubtotal += itemTotal
        calculatedTax += itemTax

        // Safe Stock Deduction
        product.stock -= quantity
        await product.useTransaction(trx).save()

        // Extract the exact primary image selected in the catalog for this product
        const primaryImage =
          product.imageUrl ||
          (Array.isArray(product.images) && product.images.length > 0
            ? product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url
            : null)

        orderItemsToSave.push({
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          productImage: primaryImage,
          hsnCode: (product.attributes as any)?.hsnCode || '5208',
          quantity: quantity,
          rate: unitPrice,
          taxPercent: gstRate,
          taxAmount: itemTax,
          total: itemTotal,
        })
      }

      // Shipping calculation rule: Free above ₹999, else ₹70
      const shippingFee = calculatedSubtotal >= 999 ? 0 : 70
      // Payment method rules:
      // Online payment: No COD fee.
      // Cash on Delivery: Add exactly ₹50 as a COD fee.
      const codFee = paymentMethod === 'COD' ? 50 : 0
      const grandTotal = calculatedSubtotal + shippingFee + codFee

      const orderNo = 'ORD-' + Math.floor(100000 + Math.random() * 900000)

      const order = new Order()
      order.useTransaction(trx)
      order.userId = user.id
      order.orderNo = orderNo
      order.subtotal = calculatedSubtotal
      order.discount = 0
      order.taxAmount = calculatedTax
      order.shippingFee = shippingFee
      order.codFee = codFee
      order.totalAmount = grandTotal
      order.paymentMethod = paymentMethod
      order.shippingAddress = shippingAddress
      order.billingAddress = billingAddress || shippingAddress

      if (paymentMethod === 'COD') {
        order.status = 'CONFIRMED'
        order.paymentStatus = 'PENDING'
        order.codPaymentStatus = 'COD_PENDING'
        order.codExpectedAmount = grandTotal
        order.codCollectedAmount = 0
        order.codRemittedAmount = 0
        order.codSettledAmount = 0
        await order.save()
        await order.related('items').createMany(orderItemsToSave)

        const payment = new Payment()
        payment.useTransaction(trx)
        payment.orderId = order.id
        payment.userId = user.id
        payment.amount = grandTotal
        payment.currency = 'INR'
        payment.paymentMethod = 'cod'
        payment.status = 'PENDING'
        payment.settlementStatus = 'PENDING'
        payment.verificationSource = 'CHECKOUT_CALLBACK'
        await payment.save()

        await trx.commit()

        try {
          await InvoiceService.generateInvoiceForOrder(order)
          await DelhiveryService.createShipmentForOrder(order)
        } catch (postCheckoutErr) {
          console.warn('[Post-Checkout Logistics/Invoice Trigger Error]', postCheckoutErr)
        }

        await order.load('items', (itemsQuery) => itemsQuery.preload('product'))

        return response.ok({
          message: 'Order placed successfully (Cash on Delivery).',
          order,
        })
      } else if (paymentMethod === 'ONLINE') {
        order.status = 'PENDING'
        order.paymentStatus = 'PENDING'
        await order.save()
        await order.related('items').createMany(orderItemsToSave)

        try {
          const rzpOrder = await RazorpayService.createRazorpayOrder(order)
          order.razorpayOrderId = rzpOrder.id
          await order.save()

          const payment = new Payment()
          payment.useTransaction(trx)
          payment.orderId = order.id
          payment.userId = user.id
          payment.razorpayOrderId = rzpOrder.id
          payment.amount = grandTotal
          payment.currency = 'INR'
          payment.paymentMethod = 'online'
          payment.status = 'PENDING'
          payment.settlementStatus = 'PENDING'
          payment.verificationSource = 'CHECKOUT_CALLBACK'
          await payment.save()

          await trx.commit()

          return response.ok({
            message: 'Razorpay order created.',
            order,
            razorpayOrderId: rzpOrder.id,
            amount: rzpOrder.amount,
          })
        } catch (err: any) {
          await trx.rollback()
          console.error('Razorpay Error:', err)
          return response.internalServerError({ error: 'Failed to initialize payment gateway.' })
        }
      } else {
        await trx.rollback()
        return response.badRequest({ error: 'Invalid payment method' })
      }
    } catch (err: any) {
      await trx.rollback()
      console.error('Checkout error:', err)
      return response.internalServerError({ error: 'Failed to complete checkout: ' + err.message })
    }
  }

  public async myOrders(ctx: HttpContext) {
    const { response, auth } = ctx
    const user = ctx.user || auth?.user
    if (!user) {
      return response.unauthorized({ error: 'Please login to view order history' })
    }

    const orders = await Order.query()
      .where('userId', user.id)
      .preload('items', (itemsQuery) => itemsQuery.preload('product'))
      .preload('payments', (pq) => pq.orderBy('createdAt', 'desc'))
      .orderBy('createdAt', 'desc')

    return response.ok({ orders })
  }

  public async showOrder(ctx: HttpContext) {
    const { params, response, auth } = ctx
    const user = ctx.user || auth?.user
    if (!user) {
      return response.unauthorized({ error: 'Please login to view order details' })
    }

    const order = await Order.query()
      .where('id', params.id)
      .where('userId', user.id)
      .preload('items', (itemsQuery) => itemsQuery.preload('product'))
      .preload('payments', (pq) => pq.orderBy('createdAt', 'desc'))
      .first()

    if (!order) {
      return response.notFound({ error: 'Order not found' })
    }

    return response.ok({ order })
  }

  public async lookupByOrderNo({ params, response }: HttpContext) {
    const orderNo = String(params.orderNo).trim()
    const order = await Order.query()
      .where('orderNo', orderNo)
      .preload('items', (itemsQuery) => itemsQuery.preload('product'))
      .preload('payments', (pq) => pq.orderBy('createdAt', 'desc'))
      .first()

    if (!order) {
      return response.notFound({ error: 'Order not found' })
    }

    return response.ok({ order })
  }

  public async verifyPayment({ request, response }: HttpContext) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = request.only([
      'razorpay_order_id',
      'razorpay_payment_id',
      'razorpay_signature',
    ])

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return response.badRequest({ error: 'Missing required Razorpay verification parameters' })
    }

    const isAuthentic = RazorpayService.verifyPaymentSignature({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    })

    if (!isAuthentic) {
      return response.badRequest({ error: 'Invalid Payment Signature' })
    }

    const order = await Order.findBy('razorpayOrderId', razorpay_order_id)
    if (!order) {
      return response.notFound({ error: 'Order not found' })
    }

    let liveDetails: any = null
    try {
      liveDetails = await RazorpayService.fetchPaymentDetails(razorpay_payment_id)
    } catch {}

    const result = await RazorpayService.processPaymentSuccess(
      order,
      {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        amount: liveDetails?.amount ? liveDetails.amount / 100 : Number(order.totalAmount),
        currency: liveDetails?.currency || 'INR',
        paymentMethod: liveDetails?.method || 'card',
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

    return response.ok({ message: 'Payment verified successfully', order: result.order, payment: result.payment })
  }

  /**
   * Secure Customer & Wholesaler Invoice Download
   * Strictly enforces that users can only download invoices for their own orders
   */
  public async downloadCustomerInvoice(ctx: HttpContext) {
    const { params, response, auth } = ctx
    const user = ctx.user || auth?.user
    if (!user) {
      return response.unauthorized({ error: 'Please login to download your invoice' })
    }

    const order = await Order.find(params.id)
    if (!order) {
      return response.notFound({ error: 'Order not found' })
    }

    // Role-based authorization: only the order owner or admin can download
    if (order.userId !== user.id && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return response.forbidden({
        error: 'Forbidden: You are not authorized to download invoices for other users\' orders',
      })
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
      `attachment; filename="Invoice_${invoice.invoiceNumber}.pdf"`
    )
    return response.download(invoice.pdfPath)
  }
}

