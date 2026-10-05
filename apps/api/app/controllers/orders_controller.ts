import type { HttpContext } from '@adonisjs/core/http'
import Order from '#models/order'
import Product from '#models/product'
import crypto from 'node:crypto'
import env from '#start/env'
import vine from '@vinejs/vine'

// Import Razorpay
import Razorpay from 'razorpay'

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
  public async checkout({ request, response, auth }: HttpContext) {
    const user = auth.user!

    let payload
    try {
      payload = await request.validateUsing(checkoutSchema)
    } catch (error) {
      return response.badRequest(error.messages)
    }

    const { items, paymentMethod, shippingAddress, billingAddress } = payload

    if (!items || !Array.isArray(items) || items.length === 0) {
      return response.badRequest({ error: 'Order items are required.' })
    }

    let calculatedTotal = 0
    const orderItemsToSave = []

    for (const item of items) {
      const product = await Product.find(item.productId)
      if (!product) {
        return response.badRequest({ error: `Product not found: ${item.productId}` })
      }
      
      const quantity = item.quantity || 1
      const total = product.sellingPrice * quantity
      calculatedTotal += total

      orderItemsToSave.push({
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        rate: product.sellingPrice,
        taxPercent: 0,
        taxAmount: 0,
        total: total,
      })
    }

    const orderNo = 'ORD-' + Math.floor(100000 + Math.random() * 900000)

    const order = new Order()
    order.userId = user.id
    order.orderNo = orderNo
    order.subtotal = calculatedTotal
    order.taxAmount = 0
    order.totalAmount = calculatedTotal
    order.paymentMethod = paymentMethod
    order.shippingAddress = shippingAddress
    order.billingAddress = billingAddress || shippingAddress

    if (paymentMethod === 'COD') {
      order.status = 'PENDING'
      order.paymentStatus = 'PENDING'
      await order.save()
      await order.related('items').createMany(orderItemsToSave)

      return response.ok({
        message: 'Order placed successfully (Cash on Delivery).',
        order,
      })
    } else if (paymentMethod === 'ONLINE') {
      order.status = 'PENDING'
      order.paymentStatus = 'PENDING'

      const instance = new Razorpay({
        key_id: env.get('RAZORPAY_KEY_ID', 'rzp_test_123456789'),
        key_secret: env.get('RAZORPAY_KEY_SECRET', 'dummy_secret'),
      })

      const options = {
        amount: Math.round(calculatedTotal * 100), // amount in smallest currency unit (paise)
        currency: 'INR',
        receipt: orderNo,
      }

      try {
        const razorpayOrder = await instance.orders.create(options)
        order.razorpayOrderId = razorpayOrder.id
        await order.save()
        await order.related('items').createMany(orderItemsToSave)

        return response.ok({
          message: 'Razorpay order created.',
          order,
          razorpayOrderId: razorpayOrder.id,
          amount: options.amount,
        })
      } catch (err: any) {
        console.error('Razorpay Error:', err)
        return response.internalServerError({ error: 'Failed to initialize payment.' })
      }
    } else {
      return response.badRequest({ error: 'Invalid payment method' })
    }
  }

  public async verifyPayment({ request, response }: HttpContext) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = request.only([
      'razorpay_order_id',
      'razorpay_payment_id',
      'razorpay_signature',
    ])

    const secret = env.get('RAZORPAY_KEY_SECRET', 'dummy_secret')

    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex')

    const isAuthentic = expectedSignature === razorpay_signature

    if (isAuthentic) {
      const order = await Order.findBy('razorpayOrderId', razorpay_order_id)
      if (order) {
        order.razorpayPaymentId = razorpay_payment_id
        order.razorpaySignature = razorpay_signature
        order.paymentStatus = 'PAID'
        order.status = 'PROCESSING'
        await order.save()

        return response.ok({ message: 'Payment verified successfully', order })
      }
      return response.notFound({ error: 'Order not found' })
    } else {
      return response.badRequest({ error: 'Invalid Signature' })
    }
  }
}
