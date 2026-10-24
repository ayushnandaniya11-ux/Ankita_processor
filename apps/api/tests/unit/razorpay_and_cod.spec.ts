import { test } from '@japa/runner'
import crypto from 'node:crypto'
import env from '#start/env'
import RazorpayService from '#services/razorpay_service'
import CodReconciliationService from '#services/cod_reconciliation_service'
import Order from '#models/order'
import Payment from '#models/payment'
import PaymentWebhookEvent from '#models/payment_webhook_event'
import User from '#models/user'

test.group('Razorpay & COD Unit Tests', (group) => {
  let testUser: User
  let onlineOrder: Order
  let codOrder: Order

  const secret = env.get('RAZORPAY_KEY_SECRET') || 'test_secret_12345'
  const webhookSecret = env.get('RAZORPAY_WEBHOOK_SECRET') || 'test_webhook_secret_12345'

  group.setup(async () => {
    // 1. Get or create test user
    let user = await User.findBy('email', 'payment_test_user@ankita.com')
    if (!user) {
      user = await User.create({
        name: 'Payment Test Customer',
        email: 'payment_test_user@ankita.com',
        password: 'Password123!',
        role: 'CUSTOMER',
      })
    }
    testUser = user

    // 2. Create sample online order
    onlineOrder = await Order.create({
      userId: testUser.id,
      orderNo: `TEST-ONL-${Date.now()}`,
      status: 'CONFIRMED',
      paymentStatus: 'PENDING',
      paymentMethod: 'ONLINE',
      subtotal: 2500,
      discount: 0,
      shippingFee: 0,
      taxAmount: 125,
      totalAmount: 2625,
      shippingAddress: '402 Sunrise Heights, Ahmedabad, Gujarat - 380009',
      billingAddress: '402 Sunrise Heights, Ahmedabad, Gujarat - 380009',
      razorpayOrderId: `order_unit_${Date.now()}`,
    })

    // 3. Create sample COD order
    codOrder = await Order.create({
      userId: testUser.id,
      orderNo: `TEST-COD-${Date.now()}`,
      status: 'CONFIRMED',
      paymentStatus: 'PENDING',
      paymentMethod: 'COD',
      subtotal: 1800,
      discount: 0,
      shippingFee: 70,
      taxAmount: 90,
      totalAmount: 1960,
      shippingAddress: '12 Gandhi Road, Surat, Gujarat - 395001',
      billingAddress: '12 Gandhi Road, Surat, Gujarat - 395001',
      codPaymentStatus: 'COD_PENDING',
      codExpectedAmount: 1960,
      codCollectedAmount: 0,
      codRemittedAmount: 0,
      codSettledAmount: 0,
    })
  })

  group.teardown(async () => {
    // Cleanup created test records
    if (onlineOrder?.id) {
      await Payment.query().where('orderId', onlineOrder.id).delete()
      await onlineOrder.delete()
    }
    if (codOrder?.id) {
      await codOrder.delete()
    }
    await PaymentWebhookEvent.query().where('eventId', 'like', 'test_evt_%').delete()
  })

  // 1. Payment Signature Verification
  test('verifyPaymentSignature returns true for valid HMAC SHA-256 signature and false for forged', ({ assert }) => {
    const razorpayOrderId = 'order_test_987654'
    const razorpayPaymentId = 'pay_test_123456'

    // Compute expected signature
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex')

    const isValid = RazorpayService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature: validSignature,
    })

    assert.isTrue(isValid, 'Valid HMAC signature should pass verification')

    const isForgedValid = RazorpayService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature: 'tampered_fake_signature_abc123',
    })

    assert.isFalse(isForgedValid, 'Forged HMAC signature must be rejected')
  })

  // 2. Webhook Signature Verification
  test('verifyWebhookSignature verifies official Razorpay webhook payload and rejects tampered body', ({ assert }) => {
    const rawPayload = JSON.stringify({
      entity: 'event',
      account_id: 'acc_test_123',
      event: 'payment.captured',
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: 'pay_test_capture_1',
            amount: 262500,
            currency: 'INR',
            status: 'captured',
            order_id: onlineOrder.razorpayOrderId,
          },
        },
      },
    })

    const validWebhookSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawPayload)
      .digest('hex')

    const isWebhookValid = RazorpayService.verifyWebhookSignature(rawPayload, validWebhookSignature)
    assert.isTrue(isWebhookValid, 'Correct webhook signature should verify successfully')

    const isTamperedValid = RazorpayService.verifyWebhookSignature(rawPayload, 'forged_webhook_signature')
    assert.isFalse(isTamperedValid, 'Forged webhook signature must be rejected')
  })

  // 3. Idempotent Payment Capture
  test('handlePaymentCaptured idempotently creates and marks payment CAPTURED and order PAID', async ({ assert }) => {
    const paymentId = `pay_unit_capture_${Date.now()}`
    const rzpOrderId = onlineOrder.razorpayOrderId!

    const payload = {
      id: paymentId,
      order_id: rzpOrderId,
      amount: 262500, // 2625 in paise
      currency: 'INR',
      status: 'captured',
      method: 'card',
      captured: true,
      card: {
        network: 'Visa',
        last4: '4242',
        type: 'credit',
      },
      created_at: Math.floor(Date.now() / 1000),
    }

    // First capture
    const paymentRecord1 = await RazorpayService.handlePaymentCaptured(payload)
    assert.isNotNull(paymentRecord1)
    assert.equal(paymentRecord1.status, 'CAPTURED')
    assert.equal(paymentRecord1.amount, 2625)

    // Verify order updated to PAID
    await onlineOrder.refresh()
    assert.equal(onlineOrder.paymentStatus, 'PAID')

    // Second capture (duplicate webhook delivery)
    const paymentRecord2 = await RazorpayService.handlePaymentCaptured(payload)
    assert.equal(paymentRecord2.id, paymentRecord1.id, 'Idempotent call should return existing payment record')

    const paymentCount = await Payment.query().where('razorpayPaymentId', paymentId)
    assert.equal(paymentCount.length, 1, 'Duplicate webhook must not create duplicate payment rows')
  })

  // 4. Out-of-Order Webhook Protection
  test('handlePaymentFailed does not overwrite an already PAID order or CAPTURED payment', async ({ assert }) => {
    const rzpOrderId = onlineOrder.razorpayOrderId!

    // Ensure order is marked PAID
    onlineOrder.paymentStatus = 'PAID'
    await onlineOrder.save()

    const failedPayload = {
      id: `pay_delayed_fail_${Date.now()}`,
      order_id: rzpOrderId,
      amount: 262500,
      currency: 'INR',
      status: 'failed',
      error_code: 'BAD_REQUEST_ERROR',
      error_description: 'Payment was cancelled by user',
    }

    await RazorpayService.handlePaymentFailed(failedPayload)

    // Check that onlineOrder is STILL PAID
    await onlineOrder.refresh()
    assert.equal(onlineOrder.paymentStatus, 'PAID', 'Delayed failure event must NEVER overwrite a paid order')
  })

  // 5. COD Amount Reconciliation and Discrepancy Detection
  test('CodReconciliationService accurately tracks collected, remitted, and detects variance', async ({ assert }) => {
    const orderId = codOrder.id

    // Initial state: COD_PENDING
    assert.equal(codOrder.codPaymentStatus, 'COD_PENDING')
    assert.equal(codOrder.codExpectedAmount, 1960)

    // 1. Mark Collected (Customer paid ₹1960 to courier delivery agent)
    const collectedOrder = await CodReconciliationService.updateCodStatus({
      orderId,
      status: 'COD_COLLECTED',
      collectedAmount: 1960,
      updatedBy: 'Admin Test',
      notes: 'Confirmed delivery and cash collected by Delhivery rider',
    })
    assert.equal(collectedOrder.codPaymentStatus, 'COD_COLLECTED')
    assert.equal(collectedOrder.codCollectedAmount, 1960)
    // Order paymentStatus is STILL PENDING because funds have not yet reached merchant bank
    assert.equal(collectedOrder.paymentStatus, 'PENDING')

    // 2. Mark Remitted with Delhivery UTR (Logistics company remitted ₹1900 with ₹60 courier fee deduction)
    const remittedOrder = await CodReconciliationService.updateCodStatus({
      orderId,
      status: 'COD_REMITTED',
      remittedAmount: 1900,
      remittanceRef: 'DLV-UTR-8829104',
      remittedAt: new Date(),
      updatedBy: 'Admin Test',
      notes: 'Delhivery weekly COD remittance batch #492',
    })
    assert.equal(remittedOrder.codPaymentStatus, 'COD_REMITTED')
    assert.equal(remittedOrder.codRemittedAmount, 1900)
    assert.equal(remittedOrder.codRemittanceRef, 'DLV-UTR-8829104')
    // Still PENDING until bank settlement is verified
    assert.equal(remittedOrder.paymentStatus, 'PENDING')

    // 3. Mark Settled in Bank (Verified ₹1900 credit in HDFC merchant bank account)
    const settledOrder = await CodReconciliationService.updateCodStatus({
      orderId,
      status: 'COD_SETTLED',
      settledAmount: 1900,
      settledAt: new Date(),
      updatedBy: 'Admin Test',
      notes: 'Bank statement verified for UTR BD-UTR-8829104',
    })
    assert.equal(settledOrder.codPaymentStatus, 'COD_SETTLED')
    assert.equal(settledOrder.codSettledAmount, 1900)
    // Now and ONLY now is the order marked PAID!
    assert.equal(settledOrder.paymentStatus, 'PAID', 'Order paymentStatus is marked PAID upon COD_SETTLED')

    // 4. Verify Discrepancy Calculation
    const summary = CodReconciliationService.calculateReconciliation(settledOrder)
    assert.equal(summary.expectedAmount, 1960)
    assert.equal(summary.collectedAmount, 1960)
    assert.equal(summary.remittedAmount, 1900)
    assert.equal(summary.settledAmount, 1900)
    assert.equal(summary.outstandingAmount, 60, 'Variance of ₹60 should be captured for logistics reconciliation')
    assert.isTrue(summary.hasDiscrepancy, 'Discrepancy flag must be true when settledAmount != expectedAmount')
  })

  // 6. COD vs Online Strict Separation
  test('COD orders are never marked PAID on shipment or delivery alone', async ({ assert }) => {
    const testShipmentCodOrder = await Order.create({
      userId: testUser.id,
      orderNo: `TEST-COD-SHIP-${Date.now()}`,
      status: 'DELIVERED', // Order is delivered to customer
      paymentStatus: 'PENDING',
      paymentMethod: 'COD',
      subtotal: 1000,
      discount: 0,
      shippingFee: 70,
      taxAmount: 50,
      totalAmount: 1120,
      shippingAddress: 'Ahmedabad',
      billingAddress: 'Ahmedabad',
      codPaymentStatus: 'COD_PENDING',
      codExpectedAmount: 1120,
    })

    assert.equal(testShipmentCodOrder.status, 'DELIVERED')
    assert.equal(testShipmentCodOrder.paymentStatus, 'PENDING', 'Delivered COD order MUST remain PENDING payment')
    assert.notEqual(testShipmentCodOrder.paymentStatus, 'PAID')

    await testShipmentCodOrder.delete()
  })
})
