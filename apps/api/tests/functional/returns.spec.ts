import { test } from '@japa/runner'
import Order from '#models/order'
import OrderItem from '#models/order_item'
import Product from '#models/product'
import User from '#models/user'
import ReturnRequest from '#models/return_request'
import SessionService from '#services/session_service'
import { DateTime } from 'luxon'

test.group('Returns Functional Tests', (group) => {
  let customerUser: User
  let adminUser: User
  let testProduct: Product
  let deliveredOrder: Order
  let deliveredItem: OrderItem
  let undeliveredOrder: Order
  let undeliveredItem: OrderItem

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
    let cust = await User.findBy('email', 'returns_func_customer@ankita.com')
    if (!cust) {
      cust = await User.create({
        name: 'Returns Functional Customer',
        email: 'returns_func_customer@ankita.com',
        password: 'Password123!',
        role: 'CUSTOMER',
      })
    }
    customerUser = cust

    // 2. Admin User
    let adm = await User.findBy('email', 'returns_func_admin@ankita.com')
    if (!adm) {
      adm = await User.create({
        name: 'Returns Quality Admin',
        email: 'returns_func_admin@ankita.com',
        password: 'Password123!',
        role: 'ADMIN',
      })
    }
    adminUser = adm

    // 3. Product with authentic catalogue image
    let product = await Product.findBy('slug', 'chanderi-cotton-silk-saree')
    if (!product) {
      product = await Product.create({
        name: 'Chanderi Cotton Silk Saree',
        slug: 'chanderi-cotton-silk-saree',
        sku: 'CHD-COT-001',
        description: 'Traditional Chanderi handwoven cotton silk saree with zari border',
        mrp: 4500,
        sellingPrice: 3500,
        stock: 30,
        imageUrl: '/uploads/products/chanderi-saree.jpg',
        isPublished: true,
      })
    }
    testProduct = product

    // 4. Delivered Order (delivered yesterday, within 7 days)
    deliveredOrder = await Order.create({
      userId: customerUser.id,
      orderNo: `ORD-FUNC-DEL-${Date.now()}`,
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      paymentMethod: 'ONLINE',
      subtotal: 3500,
      discount: 0,
      shippingFee: 0,
      taxAmount: 175,
      totalAmount: 3675,
      shippingAddress: '402 Sunrise Complex, Ring Road, Surat, Gujarat - 395002',
      deliveredDate: DateTime.now().minus({ days: 1 }),
    })
    deliveredItem = await OrderItem.create({
      orderId: deliveredOrder.id,
      productId: testProduct.id,
      productName: testProduct.name,
      productImage: testProduct.imageUrl,
      quantity: 1,
      rate: 3500,
      taxPercent: 5,
      taxAmount: 175,
      total: 3675,
    })

    // 5. Undelivered Order (still in transit)
    undeliveredOrder = await Order.create({
      userId: customerUser.id,
      orderNo: `ORD-FUNC-TRN-${Date.now()}`,
      status: 'SHIPPED',
      paymentStatus: 'PAID',
      paymentMethod: 'ONLINE',
      subtotal: 3500,
      discount: 0,
      shippingFee: 0,
      taxAmount: 175,
      totalAmount: 3675,
      shippingAddress: '15 Gandhi Nagar, Delhi - 110031',
    })
    undeliveredItem = await OrderItem.create({
      orderId: undeliveredOrder.id,
      productId: testProduct.id,
      productName: testProduct.name,
      productImage: testProduct.imageUrl,
      quantity: 1,
      rate: 3500,
      taxPercent: 5,
      taxAmount: 175,
      total: 3675,
    })
  })

  // ----------------------------------------------------
  // 1. Regional Language & Policy Instructions Endpoint
  // ----------------------------------------------------
  test('GET /api/v1/returns/policy-and-instructions returns Gujarati for Gujarat address', async ({ client, assert }) => {
    const res = await client.get('/api/v1/returns/policy-and-instructions').qs({
      state: 'Surat, Gujarat',
    })

    res.assertStatus(200)
    res.assertBodyContains({
      detectedLanguage: 'gu',
    })
    const body = res.body()
    assert.isTrue(Array.isArray(body.supportedLanguages))
    assert.equal(body.translations.language, 'gu')
  })

  test('GET /api/v1/returns/policy-and-instructions returns Hindi when requested', async ({ client, assert }) => {
    const res = await client.get('/api/v1/returns/policy-and-instructions').qs({
      lang: 'hi',
    })

    res.assertStatus(200)
    res.assertBodyContains({
      detectedLanguage: 'hi',
    })
    const body = res.body()
    assert.equal(body.translations.language, 'hi')
  })

  // ----------------------------------------------------
  // 2. Return Eligibility Checks
  // ----------------------------------------------------
  test('GET /api/v1/returns/check-eligibility allows delivered item within 7 days', async ({ client }) => {
    const sessionCookie = await loginUser(client, customerUser)

    const res = await client
      .get('/api/v1/returns/check-eligibility')
      .cookie(SessionService.cookieName, sessionCookie)
      .qs({
        orderId: deliveredOrder.id,
        orderItemId: deliveredItem.id,
      })

    res.assertStatus(200)
    res.assertBodyContains({
      eligible: true,
      orderStatus: 'DELIVERED',
    })
  })

  test('GET /api/v1/returns/check-eligibility rejects undelivered order', async ({ client, assert }) => {
    const sessionCookie = await loginUser(client, customerUser)

    const res = await client
      .get('/api/v1/returns/check-eligibility')
      .cookie(SessionService.cookieName, sessionCookie)
      .qs({
        orderId: undeliveredOrder.id,
        orderItemId: undeliveredItem.id,
      })

    res.assertStatus(200)
    res.assertBodyContains({
      eligible: false,
    })
    assert.equal(res.body().reason, 'NOT_DELIVERED')
  })

  // ----------------------------------------------------
  // 3. Return Submission & AI Verification Workflow
  // ----------------------------------------------------
  test('POST /api/v1/returns submits return request and triggers vision verification', async ({ client, assert }) => {
    const sessionCookie = await loginUser(client, customerUser)

    const res = await client
      .post('/api/v1/returns')
      .cookie(SessionService.cookieName, sessionCookie)
      .json({
        orderId: deliveredOrder.id,
        orderItemId: deliveredItem.id,
        reason: 'COLOR_VARIATION',
        customerNotes: 'Color tone is slightly lighter than catalog image',
        language: 'gu',
        photoUrls: ['/uploads/returns/sample_customer_photo.jpg'],
      })

    res.assertStatus(201)
    const body = res.body()
    assert.isNotNull(body.returnRequest)
    assert.isTrue(body.returnRequest.returnNo.startsWith('RET-'))
    assert.equal(body.returnRequest.language, 'gu')
    assert.isTrue(
      ['MATCH_CONFIRMED', 'MANUAL_REVIEW_REQUIRED', 'UNDER_REVIEW', 'APPROVED'].includes(
        body.returnRequest.verificationStatus || body.returnRequest.status
      )
    )
  })

  test('POST /api/v1/returns blocks duplicate return submission on same order item', async ({ client }) => {
    const sessionCookie = await loginUser(client, customerUser)

    const res = await client
      .post('/api/v1/returns')
      .cookie(SessionService.cookieName, sessionCookie)
      .json({
        orderId: deliveredOrder.id,
        orderItemId: deliveredItem.id,
        reason: 'DEFECTIVE_OR_DAMAGED',
        photoUrls: ['/uploads/returns/duplicate_attempt.jpg'],
      })

    res.assertStatus(400)
    res.assertBodyContains({
      message: 'A return request already exists for this item.',
    })
  })

  // ----------------------------------------------------
  // 4. Customer Returns Retrieval
  // ----------------------------------------------------
  test('GET /api/v1/returns/my-returns lists authenticated customer returns', async ({ client, assert }) => {
    const sessionCookie = await loginUser(client, customerUser)

    const res = await client
      .get('/api/v1/returns/my-returns')
      .cookie(SessionService.cookieName, sessionCookie)

    res.assertStatus(200)
    const body = res.body()
    assert.isTrue(Array.isArray(body.returns))
    assert.isAbove(body.returns.length, 0)
    assert.equal(body.returns[0].userId, customerUser.id)
  })

  // ----------------------------------------------------
  // 5. Admin Dashboard & Manual Review Workflow
  // ----------------------------------------------------
  test('GET /api/v1/admin/returns provides metrics and return list to admin', async ({ client, assert }) => {
    const adminCookie = await loginUser(client, adminUser)

    const res = await client
      .get('/api/v1/admin/returns')
      .cookie(SessionService.cookieName, adminCookie)

    res.assertStatus(200)
    const body = res.body()
    assert.isNotNull(body.metrics)
    assert.equal(typeof body.metrics.total, 'number')
    assert.isTrue(Array.isArray(body.returns))
  })

  test('PATCH /api/v1/admin/returns/:id/review updates status and records audit log', async ({ client, assert }) => {
    const adminCookie = await loginUser(client, adminUser)
    const existingReturn = await ReturnRequest.findBy('orderId', deliveredOrder.id)
    assert.isNotNull(existingReturn)

    const res = await client
      .patch(`/api/v1/admin/returns/${existingReturn!.id}/review`)
      .cookie(SessionService.cookieName, adminCookie)
      .json({
        action: 'APPROVE',
        adminNotes: 'Verified saree border weaving and pallu motif manually',
      })

    res.assertStatus(200)
    const body = res.body()
    assert.equal(body.returnRequest.status, 'APPROVED')
    assert.isNotNull(body.returnRequest.pickupTrackingNumber)
    assert.isTrue(Array.isArray(body.returnRequest.auditTrail))
  })

  test('PATCH /api/v1/admin/returns/:id/review requires rejectionReason when rejecting', async ({ client, assert }) => {
    const adminCookie = await loginUser(client, adminUser)
    const existingReturn = await ReturnRequest.findBy('orderId', deliveredOrder.id)
    assert.isNotNull(existingReturn)

    const res = await client
      .patch(`/api/v1/admin/returns/${existingReturn!.id}/review`)
      .cookie(SessionService.cookieName, adminCookie)
      .json({
        action: 'REJECT',
        // missing rejectionReason
      })

    res.assertStatus(400)
    res.assertBodyContains({
      message: 'A rejection reason is required when rejecting a return request.',
    })
  })
})
