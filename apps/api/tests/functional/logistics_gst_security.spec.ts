import { test } from '@japa/runner'
import User from '#models/user'
import Order from '#models/order'
import Invoice from '#models/invoice'
import Shipment from '#models/shipment'
import UserSession from '#models/user_session'
import SessionService from '#services/session_service'
import InvoiceService from '#services/invoice_service'

test.group('Logistics, Invoice & GST Security Functional Tests', (group) => {
  let customerA: User
  let customerB: User
  let adminUser: User
  let orderA: Order

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
    // 1. Create Customer A
    let userA = await User.findBy('email', 'cust_a_security@ankita.com')
    if (!userA) {
      userA = await User.create({
        name: 'Customer A',
        email: 'cust_a_security@ankita.com',
        password: 'Password123!',
        role: 'CUSTOMER',
      })
    }
    customerA = userA

    // 2. Create Customer B
    let userB = await User.findBy('email', 'cust_b_security@ankita.com')
    if (!userB) {
      userB = await User.create({
        name: 'Customer B',
        email: 'cust_b_security@ankita.com',
        password: 'Password123!',
        role: 'CUSTOMER',
      })
    }
    customerB = userB

    // 3. Create Admin User
    let admin = await User.findBy('email', 'admin_security@ankita.com')
    if (!admin) {
      admin = await User.create({
        name: 'Admin Security',
        email: 'admin_security@ankita.com',
        password: 'Password123!',
        role: 'ADMIN',
      })
    }
    adminUser = admin

    // 4. Create Order belonging to Customer A
    orderA = await Order.create({
      userId: customerA.id,
      orderNo: `SEC-ORD-${Date.now()}`,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentMethod: 'ONLINE',
      subtotal: 5000,
      discount: 0,
      taxAmount: 250,
      shippingFee: 0,
      totalAmount: 5250,
      shippingAddress: JSON.stringify({
        fullName: 'Customer A',
        phone: '9898000000',
        addressLine1: 'Ring Road, Surat',
        city: 'Surat',
        state: 'Gujarat',
        postalCode: '395002',
        country: 'India',
      }),
      billingAddress: JSON.stringify({
        fullName: 'Customer A',
        phone: '9898000000',
        addressLine1: 'Ring Road, Surat',
        city: 'Surat',
        state: 'Gujarat',
        postalCode: '395002',
        country: 'India',
      }),
    })

    // Generate tax invoice for Order A
    await InvoiceService.generateInvoiceForOrder(orderA)
  })

  group.teardown(async () => {
    if (orderA) {
      await Shipment.query().where('orderId', orderA.id).delete()
      const inv = await Invoice.findBy('orderId', orderA.id)
      if (inv) {
        await inv.related('items').query().delete()
        await inv.delete()
      }
      await orderA.delete()
    }
    if (customerA) {
      await UserSession.query().where('userId', customerA.id).delete()
      await customerA.delete()
    }
    if (customerB) {
      await UserSession.query().where('userId', customerB.id).delete()
      await customerB.delete()
    }
    if (adminUser) {
      await UserSession.query().where('userId', adminUser.id).delete()
      await adminUser.delete()
    }
  })

  test('Customer B cannot download Customer A invoice (RBAC / Object-Level Authorization)', async ({
    client,
  }) => {
    const tokenB = await loginUser(client, customerB)
    const response = await client
      .get(`/api/v1/orders/${orderA.id}/invoice/download`)
      .cookie(SessionService.cookieName, tokenB)

    response.assertStatus(403)
  })

  test('Customer A can download their own official tax invoice', async ({ client }) => {
    const tokenA = await loginUser(client, customerA)
    const response = await client
      .get(`/api/v1/orders/${orderA.id}/invoice/download`)
      .cookie(SessionService.cookieName, tokenA)

    response.assertStatus(200)
    response.assertHeader('content-type', 'application/pdf')
  })

  test('Unauthenticated or non-admin user cannot access Admin GST Summary', async ({ client }) => {
    // Unauthenticated
    const resUnauth = await client.get('/api/v1/admin/gst/summary')
    resUnauth.assertStatus(401)

    // Authenticated as Customer
    const tokenCust = await loginUser(client, customerA)
    const resCust = await client
      .get('/api/v1/admin/gst/summary')
      .cookie(SessionService.cookieName, tokenCust)
    resCust.assertStatus(403)
  })

  test('Admin user can view GST summary', async ({ client, assert }) => {
    const tokenAdmin = await loginUser(client, adminUser)
    const now = new Date()
    const response = await client
      .get(`/api/v1/admin/gst/summary?year=${now.getFullYear()}&month=${now.getMonth() + 1}`)
      .cookie(SessionService.cookieName, tokenAdmin)

    response.assertStatus(200)
    const body = response.body()
    assert.isNotNull(body.summary)
    assert.isNumber(body.summary.taxableTurnover)
    assert.isArray(body.summary.rateWiseBreakdown)
    assert.isObject(body.summary.reconciliationAudit)
  })

  test('Admin user can generate all 4 separate monthly ZIP archives and download them', async ({
    client,
    assert,
  }) => {
    const tokenAdmin = await loginUser(client, adminUser)
    const now = new Date()
    const genResponse = await client
      .post('/api/v1/admin/gst/generate-all')
      .cookie(SessionService.cookieName, tokenAdmin)
      .json({
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      })

    genResponse.assertStatus(200)
    const genBody = genResponse.body()
    assert.isArray(genBody.archives)
    assert.equal(genBody.archives.length, 4, 'Must return exactly 4 separate archives')

    // Verify all 4 types exist
    const types = genBody.archives.map((a: any) => a.type)
    assert.include(types, 'GST_REPORT')
    assert.include(types, 'GST_RETURN_REPORT')
    assert.include(types, 'TAX_INVOICES')
    assert.include(types, 'TAX_RETURN_RECONCILIATION')

    // Test downloading one of the generated ZIP files
    const firstArchive = genBody.archives[0].export
    assert.isNotNull(firstArchive.id)

    const downloadResponse = await client
      .get(`/api/v1/admin/gst/download/${firstArchive.id}`)
      .cookie(SessionService.cookieName, tokenAdmin)

    downloadResponse.assertStatus(200)
    downloadResponse.assertHeader('content-type', 'application/zip')

    // Non-admin attempting to download admin GST zip gets 403 Forbidden
    const tokenCust = await loginUser(client, customerA)
    const forbiddenDownload = await client
      .get(`/api/v1/admin/gst/download/${firstArchive.id}`)
      .cookie(SessionService.cookieName, tokenCust)

    forbiddenDownload.assertStatus(403)
  })
})
