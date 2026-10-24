import { test } from '@japa/runner'
import crypto from 'node:crypto'
import env from '#start/env'
import User from '#models/user'
import Order from '#models/order'
import Payment from '#models/payment'
import PaymentWebhookEvent from '#models/payment_webhook_event'
import SessionService from '#services/session_service'

test.group('Payments & COD Reconciliation Functional Tests', (group) => {
  let customerUser: User
  let unauthorizedCustomer: User
  let adminUser: User
  let testOnlineOrder: Order
  let testCodOrder: Order

  const secret = env.get('RAZORPAY_KEY_SECRET') || 'test_secret_12345'
  const webhookSecret = env.get('RAZORPAY_WEBHOOK_SECRET') || 'test_webhook_secret_12345'

  async function loginUser(client: any, user: User): Promise<string> {
    const res = await client.post('/api/v1/auth/login').json({
      email: user.email,
      password: 'Password123!',
      rememberMe: false,
    })
    const cookie = res.cookie(SessionService.cookieName)
    return typeof cookie === 'object' && cookie !== null ? cookie.value : String(cookie || '')
  }

  group.setup(async () => {
    // 1. Customer User
    let cust = await User.findBy('email', 'cust_pay_test@ankita.com')
    if (!cust) {
      cust = await User.create({
        name: 'Customer Payment Test',
        email: 'cust_pay_test@ankita.com',
        password: 'Password123!',
        role: 'CUSTOMER',
      })
    }
    customerUser = cust

    // 2. Unauthorized Customer User
    let otherCust = await User.findBy('email', 'other_cust_pay@ankita.com')
    if (!otherCust) {
      otherCust = await User.create({
        name: 'Other Customer',
        email: 'other_cust_pay@ankita.com',
        password: 'Password123!',
        role: 'CUSTOMER',
      })
    }
    unauthorizedCustomer = otherCust

    // 3. Admin User
    let admin = await User.findBy('email', 'admin_pay_test@ankita.com')
    if (!admin) {
      admin = await User.create({
        name: 'Admin Payment Test',
        email: 'admin_pay_test@ankita.com',
        password: 'Password123!',
        role: 'ADMIN',
      })
    }
    adminUser = admin

    // 4. Create Online Order
    testOnlineOrder = await Order.create({
      userId: customerUser.id,
      orderNo: `TEST-ORD-ONL-${Date.now()}`,
      status: 'CONFIRMED',
      paymentStatus: 'PENDING',
      paymentMethod: 'ONLINE',
      subtotal: 3500,
      discount: 0,
      shippingFee: 0,
      taxAmount: 175,
      totalAmount: 3675,
      shippingAddress: '402 Sunrise Heights, Ahmedabad, Gujarat',
      billingAddress: '402 Sunrise Heights, Ahmedabad, Gujarat',
      razorpayOrderId: `order_fn_${Date.now()}`,
    })

    // 5. Create COD Order
    testCodOrder = await Order.create({
      userId: customerUser.id,
      orderNo: `TEST-ORD-COD-${Date.now()}`,
      status: 'CONFIRMED',
      paymentStatus: 'PENDING',
      paymentMethod: 'COD',
      subtotal: 2000,
      discount: 0,
      shippingFee: 70,
      taxAmount: 100,
      totalAmount: 2170,
      shippingAddress: '402 Sunrise Heights, Ahmedabad, Gujarat',
      billingAddress: '402 Sunrise Heights, Ahmedabad, Gujarat',
      codPaymentStatus: 'COD_PENDING',
      codExpectedAmount: 2170,
      codCollectedAmount: 0,
      codRemittedAmount: 0,
      codSettledAmount: 0,
    })
  })

  group.teardown(async () => {
    if (testOnlineOrder?.id) {
      await Payment.query().where('orderId', testOnlineOrder.id).delete()
      await testOnlineOrder.delete()
    }
    if (testCodOrder?.id) {
      await testCodOrder.delete()
    }
    await PaymentWebhookEvent.query().where('eventId', 'like', 'evt_fn_%').delete()
  })

  // 1. Payment Verification Endpoint with Valid Signature
  test('POST /api/v1/payments/verify with valid HMAC signature marks payment CAPTURED and order PAID', async ({
    client,
    assert,
  }) => {
    const razorpayOrderId = testOnlineOrder.razorpayOrderId!
    const razorpayPaymentId = `pay_fn_valid_${Date.now()}`

    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex')

    const res = await client.post('/api/v1/payments/verify').json({
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: signature,
    })

    res.assertStatus(200)
    assert.isTrue(res.body().verified)
    assert.equal(res.body().order.paymentStatus, 'PAID')

    // Verify DB state
    await testOnlineOrder.refresh()
    assert.equal(testOnlineOrder.paymentStatus, 'PAID')
    assert.equal(testOnlineOrder.razorpayPaymentId, razorpayPaymentId)

    const payment = await Payment.query().where('razorpayPaymentId', razorpayPaymentId).first()
    assert.isNotNull(payment)
    assert.equal(payment!.status, 'CAPTURED')
  })

  // 2. Payment Verification Rejects Forged Signature
  test('POST /api/v1/payments/verify rejects tampered signature with 400 Bad Request', async ({ client, assert }) => {
    const razorpayOrderId = testOnlineOrder.razorpayOrderId!
    const razorpayPaymentId = `pay_fn_fake_${Date.now()}`

    const res = await client.post('/api/v1/payments/verify').json({
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: 'fake_tampered_signature_hex_000',
    })

    res.assertStatus(400)
    assert.include(res.body().error, 'Invalid Payment Signature')
  })

  // 3. Webhook Signature Verification and Idempotency
  test('POST /api/v1/payments/webhook processes payment.captured and deduplicates duplicate event', async ({
    client,
    assert,
  }) => {
    const eventId = `evt_fn_${Date.now()}`
    const paymentId = `pay_webhook_${Date.now()}`
    const rzpOrderId = testOnlineOrder.razorpayOrderId!

    const webhookBody = {
      id: eventId,
      entity: 'event',
      account_id: 'acc_test_merchant',
      event: 'payment.captured',
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: paymentId,
            order_id: rzpOrderId,
            amount: 367500, // 3675 in paise
            currency: 'INR',
            status: 'captured',
            method: 'upi',
            vpa: 'customer@upi',
            captured: true,
            created_at: Math.floor(Date.now() / 1000),
          },
        },
      },
      created_at: Math.floor(Date.now() / 1000),
    }

    const rawString = JSON.stringify(webhookBody)
    const validSignature = crypto.createHmac('sha256', webhookSecret).update(rawString).digest('hex')

    // First delivery
    const res1 = await client
      .post('/api/v1/payments/webhook')
      .header('x-razorpay-signature', validSignature)
      .header('x-razorpay-event-id', eventId)
      .json(webhookBody)

    res1.assertStatus(200)
    assert.isTrue(res1.body().ok)

    // Verify webhook event was recorded in DB
    const eventRecord = await PaymentWebhookEvent.findBy('eventId', eventId)
    assert.isNotNull(eventRecord)
    assert.equal(eventRecord!.status, 'PROCESSED')

    // Second delivery (duplicate delivery by Razorpay)
    const res2 = await client
      .post('/api/v1/payments/webhook')
      .header('x-razorpay-signature', validSignature)
      .header('x-razorpay-event-id', eventId)
      .json(webhookBody)

    res2.assertStatus(200)
    assert.isTrue(res2.body().ok)
    assert.equal(res2.body().status, 'ALREADY_PROCESSED')
  })

  // 4. Webhook Rejects Invalid Signature
  test('POST /api/v1/payments/webhook rejects unauthorized webhook without valid secret', async ({ client }) => {
    const webhookBody = {
      entity: 'event',
      event: 'payment.captured',
      payload: {},
    }

    const res = await client
      .post('/api/v1/payments/webhook')
      .header('x-razorpay-signature', 'invalid_signature_xyz')
      .json(webhookBody)

    res.assertStatus(400)
  })

  // 5. Customer Payment Retry Endpoint
  test('POST /api/v1/orders/:id/retry-payment creates fresh payment attempt for customer order', async ({
    client,
    assert,
  }) => {
    // Create an unpaid order for customer
    const unpaidOrder = await Order.create({
      userId: customerUser.id,
      orderNo: `TEST-ORD-RETRY-${Date.now()}`,
      status: 'CONFIRMED',
      paymentStatus: 'PENDING',
      paymentMethod: 'ONLINE',
      subtotal: 1500,
      discount: 0,
      shippingFee: 70,
      taxAmount: 75,
      totalAmount: 1645,
      shippingAddress: 'Test Address',
      billingAddress: 'Test Address',
    })

    const sessionCookie = await loginUser(client, customerUser)

    const res = await client
      .post(`/api/v1/orders/${unpaidOrder.id}/retry-payment`)
      .cookie(SessionService.cookieName, sessionCookie)

    res.assertStatus(200)
    assert.isNotNull(res.body().razorpayOrderId)
    assert.equal(res.body().amount, 164500) // in paise
    assert.equal(res.body().orderNo, unpaidOrder.orderNo)

    // Test that another customer cannot retry this order
    const otherSessionCookie = await loginUser(client, unauthorizedCustomer)
    const unauthorizedRes = await client
      .post(`/api/v1/orders/${unpaidOrder.id}/retry-payment`)
      .cookie(SessionService.cookieName, otherSessionCookie)

    unauthorizedRes.assertStatus(403)

    // Cleanup
    await Payment.query().where('orderId', unpaidOrder.id).delete()
    await unpaidOrder.delete()
  })

  // 6. Admin Payments RBAC: Customers are Forbidden (403), Admins get 200
  test('Admin Payment Dashboard endpoints strictly enforce RBAC', async ({ client, assert }) => {
    const customerCookie = await loginUser(client, customerUser)
    const adminCookie = await loginUser(client, adminUser)

    // 1. Customer attempt on /api/v1/admin/payments -> 403 Forbidden
    const customerRes = await client
      .get('/api/v1/admin/payments')
      .cookie(SessionService.cookieName, customerCookie)

    customerRes.assertStatus(403)

    // 2. Admin attempt on /api/v1/admin/payments -> 200 OK with analytics metrics
    const adminRes = await client
      .get('/api/v1/admin/payments')
      .cookie(SessionService.cookieName, adminCookie)

    adminRes.assertStatus(200)
    assert.isDefined(adminRes.body().payments)
    assert.isDefined(adminRes.body().metrics)
    assert.isDefined(adminRes.body().metrics.grossCaptured)
    assert.isDefined(adminRes.body().metrics.netRevenue)

    // 3. Customer attempt on /api/v1/admin/cod-payments -> 403 Forbidden
    const customerCodRes = await client
      .get('/api/v1/admin/cod-payments')
      .cookie(SessionService.cookieName, customerCookie)

    customerCodRes.assertStatus(403)

    // 4. Admin attempt on /api/v1/admin/cod-payments -> 200 OK with 8 KPI metrics
    const adminCodRes = await client
      .get('/api/v1/admin/cod-payments')
      .cookie(SessionService.cookieName, adminCookie)

    adminCodRes.assertStatus(200)
    assert.isDefined(adminCodRes.body().orders)
    assert.isDefined(adminCodRes.body().kpis)
    assert.isDefined(adminCodRes.body().kpis.totalCodOrders)
    assert.isDefined(adminCodRes.body().kpis.codPending)
    assert.isDefined(adminCodRes.body().kpis.codCollected)
    assert.isDefined(adminCodRes.body().kpis.codSettled)
  })

  // 7. Admin COD Status Lifecycle Updates via API
  test('PATCH /api/v1/admin/cod-payments/:id/status allows admin to update COD lifecycle and record remittance UTR', async ({
    client,
    assert,
  }) => {
    const adminCookie = await loginUser(client, adminUser)

    // Update to COD_COLLECTED
    const res1 = await client
      .patch(`/api/v1/admin/cod-payments/${testCodOrder.id}/status`)
      .cookie(SessionService.cookieName, adminCookie)
      .json({
        status: 'COD_COLLECTED',
        collectedAmount: 2170,
        notes: 'Delhivery rider confirmed payment collection',
      })

    res1.assertStatus(200)
    assert.equal(res1.body().order.codPaymentStatus, 'COD_COLLECTED')
    assert.equal(res1.body().order.codCollectedAmount, 2170)

    // Update to COD_REMITTED with UTR
    const res2 = await client
      .patch(`/api/v1/admin/cod-payments/${testCodOrder.id}/status`)
      .cookie(SessionService.cookieName, adminCookie)
      .json({
        status: 'COD_REMITTED',
        remittedAmount: 2100,
        remittanceRef: 'BD-UTR-99112233',
        remittedAt: new Date().toISOString(),
        notes: 'Remitted in weekly cycle #41',
      })

    res2.assertStatus(200)
    assert.equal(res2.body().order.codPaymentStatus, 'COD_REMITTED')
    assert.equal(res2.body().order.codRemittanceRef, 'BD-UTR-99112233')

    // Update to COD_SETTLED with Bank Date
    const res3 = await client
      .patch(`/api/v1/admin/cod-payments/${testCodOrder.id}/status`)
      .cookie(SessionService.cookieName, adminCookie)
      .json({
        status: 'COD_SETTLED',
        settledAmount: 2100,
        settledAt: new Date().toISOString(),
        notes: 'Verified in bank statement',
      })

    res3.assertStatus(200)
    assert.equal(res3.body().order.codPaymentStatus, 'COD_SETTLED')
    // Crucial requirement: COD order is marked PAID when and only when COD_SETTLED
    assert.equal(res3.body().order.paymentStatus, 'PAID')

    // Verify history audit trail was appended
    assert.isTrue(Array.isArray(res3.body().order.codHistory))
    assert.isAtLeast(res3.body().order.codHistory.length, 3)
  })
})
