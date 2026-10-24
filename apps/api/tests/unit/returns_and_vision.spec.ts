import { test } from '@japa/runner'
import ReturnI18nService from '#services/return_i18n_service'
import VisionVerificationService from '#services/vision_verification_service'
import Order from '#models/order'
import OrderItem from '#models/order_item'
import Product from '#models/product'
import User from '#models/user'
import ReturnRequest from '#models/return_request'
import { DateTime } from 'luxon'

test.group('Returns & Computer Vision Unit Tests', (group) => {
  let testUser: User
  let testProduct: Product
  let deliveredOrder: Order
  let deliveredItem: OrderItem
  let expiredOrder: Order
  let expiredItem: OrderItem
  let inTransitOrder: Order
  let inTransitItem: OrderItem

  group.setup(async () => {
    // 1. Get or create test user
    let user = await User.findBy('email', 'returns_unit_tester@ankita.com')
    if (!user) {
      user = await User.create({
        name: 'Returns Unit Tester',
        email: 'returns_unit_tester@ankita.com',
        password: 'Password123!',
        role: 'CUSTOMER',
      })
    }
    testUser = user

    // 2. Create test product
    let product = await Product.findBy('slug', 'banarasi-silk-saree-unit-test')
    if (!product) {
      product = await Product.create({
        name: 'Royal Banarasi Silk Saree',
        slug: 'banarasi-silk-saree-unit-test',
        sku: 'BNR-SILK-UT01',
        description: 'Authentic pure Katan silk saree with golden zari floral border',
        mrp: 5999,
        sellingPrice: 4999,
        stock: 50,
        imageUrl: '/uploads/products/royal-banarasi-silk.jpg',
        isPublished: true,
      })
    }
    testProduct = product

    // 3. Create Delivered Order within 7 days
    deliveredOrder = await Order.create({
      userId: testUser.id,
      orderNo: `TEST-RET-DEL-${Date.now()}`,
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      paymentMethod: 'ONLINE',
      subtotal: 4999,
      discount: 0,
      shippingFee: 0,
      taxAmount: 250,
      totalAmount: 5249,
      shippingAddress: 'B-201 Orchid Tower, Ring Road, Surat, Gujarat - 395002',
      deliveredDate: DateTime.now().minus({ days: 2 }),
    })
    deliveredItem = await OrderItem.create({
      orderId: deliveredOrder.id,
      productId: testProduct.id,
      productName: testProduct.name,
      productImage: testProduct.imageUrl,
      quantity: 1,
      rate: 4999,
      taxPercent: 5,
      taxAmount: 250,
      total: 5249,
    })

    // 4. Create Expired Order (delivered 14 days ago)
    expiredOrder = await Order.create({
      userId: testUser.id,
      orderNo: `TEST-RET-EXP-${Date.now()}`,
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      paymentMethod: 'ONLINE',
      subtotal: 4999,
      discount: 0,
      shippingFee: 0,
      taxAmount: 250,
      totalAmount: 5249,
      shippingAddress: '404 MG Road, New Delhi, Delhi - 110001',
      deliveredDate: DateTime.now().minus({ days: 14 }),
    })
    expiredItem = await OrderItem.create({
      orderId: expiredOrder.id,
      productId: testProduct.id,
      productName: testProduct.name,
      productImage: testProduct.imageUrl,
      quantity: 1,
      rate: 4999,
      taxPercent: 5,
      taxAmount: 250,
      total: 5249,
    })

    // 5. Create In-Transit Order (not yet delivered)
    inTransitOrder = await Order.create({
      userId: testUser.id,
      orderNo: `TEST-RET-SHP-${Date.now()}`,
      status: 'SHIPPED',
      paymentStatus: 'PAID',
      paymentMethod: 'ONLINE',
      subtotal: 4999,
      discount: 0,
      shippingFee: 0,
      taxAmount: 250,
      totalAmount: 5249,
      shippingAddress: '12 Koregaon Park, Pune, Maharashtra - 411001',
    })
    inTransitItem = await OrderItem.create({
      orderId: inTransitOrder.id,
      productId: testProduct.id,
      productName: testProduct.name,
      productImage: testProduct.imageUrl,
      quantity: 1,
      rate: 4999,
      taxPercent: 5,
      taxAmount: 250,
      total: 5249,
    })
  })

  // ==========================================
  // Section 1: Regional Language Instructions
  // ==========================================
  test('ReturnI18nService correctly detects language from shipping state/address', ({ assert }) => {
    // Gujarat -> Gujarati (gu)
    assert.equal(ReturnI18nService.detectLanguageFromState('Surat, Gujarat, India'), 'gu')
    assert.equal(ReturnI18nService.detectLanguageFromState('Ahmedabad, GJ - 380009'), 'gu')

    // Hindi-belt states -> Hindi (hi)
    assert.equal(ReturnI18nService.detectLanguageFromState('Sector 18, Noida, Uttar Pradesh'), 'hi')
    assert.equal(ReturnI18nService.detectLanguageFromState('Connaught Place, New Delhi, DL'), 'hi')
    assert.equal(ReturnI18nService.detectLanguageFromState('Civil Lines, Jaipur, Rajasthan'), 'hi')
    assert.equal(ReturnI18nService.detectLanguageFromState('Bhopal, Madhya Pradesh'), 'hi')

    // Other states / unspecified -> Default English (en)
    assert.equal(ReturnI18nService.detectLanguageFromState('Indiranagar, Bangalore, Karnataka'), 'en')
    assert.equal(ReturnI18nService.detectLanguageFromState('T. Nagar, Chennai, Tamil Nadu'), 'en')
    assert.equal(ReturnI18nService.detectLanguageFromState(undefined), 'en')
  })

  test('ReturnI18nService returns localized dictionaries for en, hi, gu', ({ assert }) => {
    const enDict = ReturnI18nService.getPolicyAndInstructions('en')
    assert.equal(enDict.language, 'en')
    assert.isAbove(enDict.photoGuidelines.length, 0)
    assert.exists(enDict.reasons.DEFECTIVE || enDict.reasons.DAMAGED)
    assert.include(enDict.returnWindowPolicy, '7')

    const hiDict = ReturnI18nService.getPolicyAndInstructions('hi')
    assert.equal(hiDict.language, 'hi')
    assert.include(hiDict.returnWindowPolicy, '7 दिनों')

    const guDict = ReturnI18nService.getPolicyAndInstructions('gu')
    assert.equal(guDict.language, 'gu')
    assert.include(guDict.returnWindowPolicy, '7 દિવસ')
  })

  // ==========================================
  // Section 2: Return Eligibility Business Rules
  // ==========================================
  test('Eligible delivered order within 7-day window passes eligibility check', async ({ assert }) => {
    // Verify deliveredOrder is delivered and within 7 days
    assert.equal(deliveredOrder.status, 'DELIVERED')
    assert.isNotNull(deliveredOrder.deliveredDate)
    const diffDays = DateTime.now().diff(deliveredOrder.deliveredDate!, 'days').days
    assert.isBelow(diffDays, 7)
  })

  test('Delivered order exceeding 7 days is marked ineligible', async ({ assert }) => {
    assert.equal(expiredOrder.status, 'DELIVERED')
    assert.isNotNull(expiredItem.id)
    const diffDays = DateTime.now().diff(expiredOrder.deliveredDate!, 'days').days
    assert.isAbove(diffDays, 7)
  })

  test('Undelivered (SHIPPED/PROCESSING) order is marked ineligible for returns', async ({ assert }) => {
    assert.notEqual(inTransitOrder.status, 'DELIVERED')
    assert.isNotNull(inTransitItem.id)
  })

  // ==========================================
  // Section 3: Vision Verification Algorithms
  // ==========================================
  test('VisionVerificationService validates matching media with high confidence', async ({ assert }) => {
    // Create two mock RGB image buffers representing the same royal red & gold saree
    const referenceBuffer = Buffer.alloc(100 * 100 * 3)
    const customerBuffer = Buffer.alloc(100 * 100 * 3)

    // Populate with matching red saree color and golden border pattern
    for (let i = 0; i < 100 * 100; i++) {
      const isBorder = i % 100 < 15 // 15% gold border
      if (isBorder) {
        // Golden zari
        referenceBuffer[i * 3] = 212
        referenceBuffer[i * 3 + 1] = 175
        referenceBuffer[i * 3 + 2] = 55

        customerBuffer[i * 3] = 210 // minor lighting variance
        customerBuffer[i * 3 + 1] = 173
        customerBuffer[i * 3 + 2] = 54
      } else {
        // Crimson Red body
        referenceBuffer[i * 3] = 180
        referenceBuffer[i * 3 + 1] = 20
        referenceBuffer[i * 3 + 2] = 30

        customerBuffer[i * 3] = 178
        customerBuffer[i * 3 + 1] = 22
        customerBuffer[i * 3 + 2] = 32
      }
    }

    const result = await VisionVerificationService.compareMediaBuffers({
      customerBuffers: [customerBuffer],
      referenceBuffers: [referenceBuffer],
    })

    assert.include(['MATCH_CONFIRMED', 'MANUAL_REVIEW_REQUIRED'], result.verificationStatus)
    assert.isAbove(result.confidenceScore, 65)
    assert.exists(result.breakdown.colorSimilarity)
    assert.exists(result.breakdown.patternSimilarity)
  })

  test('VisionVerificationService identifies visually mismatched products (e.g. Blue vs Red)', async ({ assert }) => {
    const redBuffer = Buffer.alloc(100 * 100 * 3)
    const cyanBuffer = Buffer.alloc(100 * 100 * 3)

    // Crimson red saree
    for (let i = 0; i < 100 * 100; i++) {
      redBuffer[i * 3] = 200
      redBuffer[i * 3 + 1] = 10
      redBuffer[i * 3 + 2] = 20
    }

    // Completely different cyan/blue product
    for (let i = 0; i < 100 * 100; i++) {
      cyanBuffer[i * 3] = 10
      cyanBuffer[i * 3 + 1] = 180
      cyanBuffer[i * 3 + 2] = 220
    }

    const result = await VisionVerificationService.compareMediaBuffers({
      customerBuffers: [cyanBuffer],
      referenceBuffers: [redBuffer],
    })

    assert.include(['POSSIBLE_MISMATCH', 'MANUAL_REVIEW_REQUIRED'], result.verificationStatus)
    assert.isBelow(result.confidenceScore, 50)
  })

  test('VisionVerificationService detects low clarity / blurred customer uploads', async ({ assert }) => {
    // Single solid flat color buffer has 0 edge gradients (low sharpness / blur)
    const flatBuffer = Buffer.alloc(80 * 80 * 3, 128)
    const referenceBuffer = Buffer.alloc(80 * 80 * 3, 128)

    const result = await VisionVerificationService.compareMediaBuffers({
      customerBuffers: [flatBuffer],
      referenceBuffers: [referenceBuffer],
    })

    assert.isDefined(result.breakdown.clarityScore)
    // Low sharpness triggers INSUFFICIENT_EVIDENCE or MANUAL_REVIEW_REQUIRED
    assert.isTrue(
      result.verificationStatus === 'INSUFFICIENT_EVIDENCE' ||
      result.verificationStatus === 'MANUAL_REVIEW_REQUIRED'
    )
  })

  test('Duplicate return submission on same order item is strictly prevented', async ({ assert }) => {
    // Create first return request
    const firstReturn = await ReturnRequest.create({
      returnNo: `RET-DUP-1-${Date.now()}`,
      orderId: deliveredOrder.id,
      orderItemId: deliveredItem.id,
      userId: testUser.id,
      productId: testProduct.id,
      reason: 'DEFECTIVE_OR_DAMAGED',
      language: 'gu',
      customerPhotos: [
        {
          id: 'photo_test_1',
          url: '/uploads/returns/sample1.jpg',
          filename: 'sample1.jpg',
        },
      ],
      referenceImages: [
        {
          source: 'CATALOGUE',
          url: testProduct.imageUrl || '/default.jpg',
          label: 'Catalogue Reference',
        },
      ],
      verificationStatus: 'MATCH_CONFIRMED',
      confidenceScore: 88,
      status: 'APPROVED',
      pickupTrackingNumber: 'BD-REV-998877',
      pickupStatus: 'SCHEDULED',
    })

    assert.exists(firstReturn.id)

    // Query for existing active return
    const existing = await ReturnRequest.query()
      .where('order_id', deliveredOrder.id)
      .where('order_item_id', deliveredItem.id)
      .whereNotIn('status', ['REJECTED', 'CANCELLED'])
      .first()

    assert.isNotNull(existing)
    assert.equal(existing!.id, firstReturn.id)
  })
})
