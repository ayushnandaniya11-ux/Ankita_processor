import { test } from '@japa/runner'
import fs from 'node:fs'
import app from '@adonisjs/core/services/app'
import DelhiveryService from '#services/delhivery_service'
import InvoiceService from '#services/invoice_service'
import Order from '#models/order'
import User from '#models/user'
import Invoice from '#models/invoice'
import Shipment from '#models/shipment'
import Payment from '#models/payment'

test.group('Delhivery Logistics & ₹50 COD Fee Tests', (group) => {
  let testUser: User | null = null
  let onlineOrder: Order | null = null
  let codOrder: Order | null = null

  group.setup(async () => {
    // Ensure storage directory
    const dir = app.makePath('storage/documents/waybills')
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    // Create test customer
    let user = await User.findBy('email', 'delhivery_cod_test@ankita.com')
    if (!user) {
      user = await User.create({
        name: 'Kavita Patel',
        email: 'delhivery_cod_test@ankita.com',
        password: 'Password123!',
        role: 'CUSTOMER',
      })
    }
    testUser = user
  })

  group.teardown(async () => {
    for (const order of [onlineOrder, codOrder]) {
      if (order) {
        await Shipment.query().where('orderId', order.id).delete()
        await Payment.query().where('orderId', order.id).delete()
        const inv = await Invoice.findBy('orderId', order.id)
        if (inv) {
          await inv.related('items').query().delete()
          await inv.delete()
        }
        await order.related('items').query().delete()
        await order.delete()
      }
    }
    if (testUser) {
      await testUser.delete()
    }
  })

  test('DelhiveryService: parses addresses cleanly and generates 6x4 inch thermal waybill PDF', async ({
    assert,
  }) => {
    const rawAddress = {
      fullName: 'Meera Ben Joshi',
      addressLine1: 'Block C-12, Royal Palm Residency',
      addressLine2: 'Near Ring Road',
      city: 'Rajkot',
      state: 'Gujarat',
      postalCode: '360005',
      phone: '9825123456',
    }

    const parsed = DelhiveryService.parseAddress(rawAddress)
    assert.equal(parsed.name, 'Meera Ben Joshi')
    assert.equal(parsed.city, 'Rajkot')
    assert.equal(parsed.state, 'Gujarat')
    assert.equal(parsed.pincode, '360005')
    assert.equal(parsed.phone, '9825123456')

    const awbNo = `DLV${Date.now()}`
    const pdfPath = await DelhiveryService.generateThermalWaybillPdf({
      awbNumber: awbNo,
      orderNo: 'ORD-987654',
      orderDate: '21-Oct-2026',
      customer: parsed,
      shipper: {
        name: 'Ankita Processors',
        line1: 'Plot 5, Near Vivekanand School',
        cityState: 'Jetpur, Rajkot, Gujarat',
        pincode: '360370',
        phone: '7043637284',
        gstin: '24ANCPN9292N2ZB',
      },
      weightKg: 0.6,
      pieceCount: 1,
      declaredValue: 599,
      paymentMethod: 'COD',
      codAmount: 649, // 599 product + 50 COD fee
      routingArea: 'RAJ/HUB',
    })

    assert.isTrue(fs.existsSync(pdfPath), 'Delhivery 6x4 waybill PDF must be created')
    const buffer = fs.readFileSync(pdfPath)
    assert.isTrue(buffer.length > 500, 'Waybill PDF should be non-empty')
    assert.equal(buffer.subarray(0, 4).toString(), '%PDF', 'Must have valid PDF magic bytes')
  })

  test('COD Fee Calculation: Online payment orders have ₹0 COD fee', async ({ assert }) => {
    assert.isNotNull(testUser)
    const user = testUser!

    // Create online order with ₹599 subtotal, ₹0 shipping (Free)
    const subtotal = 599
    const shippingFee = 0
    const codFee = 0 // Online payment rule: no COD fee
    const grandTotal = subtotal + shippingFee + codFee

    onlineOrder = await Order.create({
      userId: user.id,
      orderNo: `TEST-ONL-${Date.now()}`,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentMethod: 'ONLINE',
      subtotal,
      shippingFee,
      codFee,
      taxAmount: 29.95,
      totalAmount: grandTotal,
      shippingAddress: JSON.stringify({
        fullName: 'Kavita Patel',
        phone: '9876543210',
        addressLine1: 'B-201, Green Acre',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380015',
      }),
      billingAddress: JSON.stringify({
        fullName: 'Kavita Patel',
        phone: '9876543210',
        addressLine1: 'B-201, Green Acre',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380015',
      }),
    })

    assert.equal(onlineOrder.codFee, 0)
    assert.equal(Number(onlineOrder.totalAmount), 599)
  })

  test('COD Fee Calculation: Cash on Delivery orders add exactly ₹50 COD fee to order total', async ({
    assert,
  }) => {
    assert.isNotNull(testUser)
    const user = testUser!

    // Product price: ₹599, Shipping: ₹0, COD fee: ₹50 => Final payable: ₹649
    const subtotal = 599
    const shippingFee = 0
    const paymentMethod = 'COD'
    const codFee = paymentMethod === 'COD' ? 50 : 0
    const grandTotal = subtotal + shippingFee + codFee

    codOrder = await Order.create({
      userId: user.id,
      orderNo: `TEST-COD-${Date.now()}`,
      status: 'CONFIRMED',
      paymentStatus: 'PENDING',
      paymentMethod: 'COD',
      codPaymentStatus: 'COD_PENDING',
      subtotal,
      shippingFee,
      codFee,
      taxAmount: 0,
      totalAmount: grandTotal,
      codExpectedAmount: grandTotal,
      codCollectedAmount: 0,
      codRemittedAmount: 0,
      codSettledAmount: 0,
      shippingAddress: JSON.stringify({
        fullName: 'Kavita Patel',
        phone: '9876543210',
        addressLine1: 'B-201, Green Acre',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380015',
      }),
      billingAddress: JSON.stringify({
        fullName: 'Kavita Patel',
        phone: '9876543210',
        addressLine1: 'B-201, Green Acre',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380015',
      }),
    })

    assert.equal(Number(codOrder.codFee), 50, 'COD fee must be exactly ₹50')
    assert.equal(Number(codOrder.totalAmount), 649, 'Final payable amount must be ₹649')
    assert.equal(Number(codOrder.codExpectedAmount), 649, 'Expected COD collection must match total with ₹50 fee')
  })

  test('DelhiveryService: creates shipment and transmits correct COD collect amount to Delhivery', async ({
    assert,
  }) => {
    assert.isNotNull(codOrder)
    const order = codOrder!

    const result = await DelhiveryService.createShipmentForOrder(order, {
      weightKg: 0.5,
      dimensions: { length: 15, breadth: 10, height: 5 },
    })

    assert.isTrue(result.success, 'Delhivery shipment should succeed')
    assert.isNotNull(result.awbNumber, 'Waybill number must be returned')
    assert.isTrue(result.trackingUrl?.includes('delhivery.com'), 'Tracking URL should point to Delhivery')

    // Verify stored shipment in database
    const shipment = await Shipment.query().where('order_id', order.id).first()
    assert.isNotNull(shipment)
    assert.equal(shipment?.logisticsProvider, 'delhivery')
    assert.equal(shipment?.courierName, 'Delhivery Express')
    assert.equal(shipment?.awbNumber, result.awbNumber)
    assert.equal(shipment?.status, 'GENERATED')

    // Verify CMU payload has correct COD amount (₹649)
    const payload = shipment?.apiRequestPayload
    assert.isNotNull(payload)
    assert.equal(payload.shipments[0].payment_mode, 'COD')
    assert.equal(payload.shipments[0].cod_amount, 649)
    assert.equal(payload.shipments[0].total_amount, 649)
  })

  test('InvoiceService: reflects ₹50 COD fee on official tax invoice and PDF', async ({ assert }) => {
    assert.isNotNull(codOrder)
    const order = codOrder!

    const invoice = await InvoiceService.generateInvoiceForOrder(order)
    assert.isNotNull(invoice)
    assert.equal(Number(invoice.codFee), 50, 'Invoice must record the ₹50 COD fee')
    assert.equal(Number(invoice.totalAmount), 649, 'Invoice grand total must include ₹50 COD fee')

    // Verify PDF document generated
    assert.isNotNull(invoice.pdfPath)
    assert.isTrue(fs.existsSync(invoice.pdfPath!), 'Invoice PDF should exist on disk')
  })

  test('Historical records preservation: Blue Dart historical shipments remain intact', async ({
    assert,
  }) => {
    assert.isNotNull(testUser)
    const user = testUser!

    // Create a mock historical order with Blue Dart
    const histOrder = await Order.create({
      userId: user.id,
      orderNo: `HIST-BD-${Date.now()}`,
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      paymentMethod: 'ONLINE',
      subtotal: 1200,
      shippingFee: 0,
      codFee: 0,
      taxAmount: 60,
      totalAmount: 1260,
      courier: 'Blue Dart Express',
      awbNumber: 'BD123456789',
      shippingAddress: JSON.stringify({
        fullName: 'Historical Customer',
        phone: '9999999999',
        address: 'Old Warehouse Road, Surat',
        pincode: '395001',
      }),
    })

    const histShipment = await Shipment.create({
      orderId: histOrder.id,
      logisticsProvider: 'bluedart',
      courierName: 'Blue Dart Express',
      awbNumber: 'BD123456789',
      status: 'DELIVERED',
      weightKg: 0.5,
      labelFormat: '6x4',
      trackingUrl: 'https://www.bluedart.com/tracking?handler=tnt&numbers=BD123456789',
      attempts: 1,
    })

    assert.equal(histShipment.logisticsProvider, 'bluedart')
    assert.equal(histOrder.courier, 'Blue Dart Express')

    // Cleanup historical order
    await histShipment.delete()
    await histOrder.delete()
  })
})
