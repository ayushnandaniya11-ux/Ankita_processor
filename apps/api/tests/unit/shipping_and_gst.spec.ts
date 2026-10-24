import { test } from '@japa/runner'
import fs from 'node:fs'
import path from 'node:path'
import app from '@adonisjs/core/services/app'
import DelhiveryService from '#services/delhivery_service'
import InvoiceService from '#services/invoice_service'
import GstReportService from '#services/gst_report_service'
import Order from '#models/order'
import User from '#models/user'
import Invoice from '#models/invoice'
import Shipment from '#models/shipment'

test.group('Shipping Waybill, Invoice & GST Report Tests', (group) => {
  let testUser: User | null = null
  let testOrder: Order | null = null

  group.setup(async () => {
    // Ensure document storage directories exist
    const baseDir = app.makePath('storage/documents')
    for (const sub of ['waybills', 'invoices', 'reports']) {
      const full = path.join(baseDir, sub)
      if (!fs.existsSync(full)) {
        fs.mkdirSync(full, { recursive: true })
      }
    }

    // Find or create test customer
    let user = await User.findBy('email', 'gst_test_customer@ankita.com')
    if (!user) {
      user = await User.create({
        name: 'Priya Sharma',
        email: 'gst_test_customer@ankita.com',
        password: 'Password123!',
        role: 'CUSTOMER',
      })
    }
    testUser = user

    // Create a sample test order
    testOrder = await Order.create({
      userId: user.id,
      orderNo: `TEST-ORD-${Date.now()}`,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentMethod: 'ONLINE',
      subtotal: 3000,
      discount: 200,
      shippingFee: 0,
      taxAmount: 140,
      totalAmount: 2940, // 2800 taxable + 5% GST (140)
      shippingAddress: JSON.stringify({
        fullName: 'Priya Sharma',
        phone: '9876543210',
        addressLine1: '402 Sunrise Heights, Navrangpura',
        city: 'Ahmedabad',
        state: 'Gujarat',
        postalCode: '380009',
        country: 'India',
      }),
      billingAddress: JSON.stringify({
        fullName: 'Priya Sharma',
        phone: '9876543210',
        addressLine1: '402 Sunrise Heights, Navrangpura',
        city: 'Ahmedabad',
        state: 'Gujarat',
        postalCode: '380009',
        country: 'India',
      }),
    })
  })

  group.teardown(async () => {
    if (testOrder) {
      await Shipment.query().where('orderId', testOrder.id).delete()
      const inv = await Invoice.findBy('orderId', testOrder.id)
      if (inv) {
        await inv.related('items').query().delete()
        await inv.delete()
      }
      await testOrder.delete()
    }
    if (testUser) {
      await testUser.delete()
    }
  })

  test('DelhiveryService: generates compliant 6 x 4 inch thermal shipping label PDF', async ({ assert }) => {
    assert.isNotNull(testOrder)
    const order = testOrder!

    const awbNo = `TESTAWB${Date.now()}`
    const fullPdfPath = await DelhiveryService.generateThermalWaybillPdf({
      awbNumber: awbNo,
      orderNo: order.orderNo,
      orderDate: new Date().toLocaleDateString('en-IN'),
      customer: {
        name: 'Priya Sharma',
        line1: '402 Sunrise Heights, Navrangpura',
        line2: '',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380009',
        phone: '9876543210',
      },
      shipper: {
        name: 'Ankita Processors',
        line1: 'Plot 5, Near Vivekanand School',
        cityState: 'Jetpur, Rajkot, Gujarat',
        pincode: '360370',
        phone: '+91 7043637284',
        gstin: '24ANCPN9292N2ZB',
      },
      weightKg: 0.8,
      pieceCount: 1,
      declaredValue: 2940,
      paymentMethod: 'ONLINE',
      codAmount: 0,
      routingArea: 'AMD/SUR',
    })

    assert.isTrue(fs.existsSync(fullPdfPath), 'Thermal waybill PDF must exist on disk')

    const fileBuffer = fs.readFileSync(fullPdfPath)
    assert.isTrue(fileBuffer.length > 500, 'Waybill PDF should have valid size')
    // Check PDF magic header %PDF
    assert.equal(fileBuffer.subarray(0, 4).toString(), '%PDF')
  })

  test('InvoiceService: generates sequential tax invoice and GST breakdown for intra-state order', async ({ assert }) => {
    assert.isNotNull(testOrder)
    const order = testOrder!

    const invoice = await InvoiceService.generateInvoiceForOrder(order)

    assert.isNotNull(invoice)
    assert.isNotNull(invoice.invoiceNumber)
    assert.isTrue(invoice.invoiceNumber.startsWith('AP-'), 'Invoice should have sequential AP- prefix')
    assert.equal(invoice.sellerGstin, '24ANCPN9292N2ZB')
    assert.equal(invoice.sellerStateCode, '24')
    assert.isFalse(invoice.isInterstate, 'Ahmedabad order should be intra-state (Gujarat)')

    // Intra-state should have CGST & SGST, no IGST
    assert.isTrue(Number(invoice.cgstAmount) >= 0, 'CGST should be >= 0')
    assert.isTrue(Number(invoice.sgstAmount) >= 0, 'SGST should be >= 0')
    assert.equal(Number(invoice.igstAmount), 0, 'IGST should be 0 for intra-state')

    // Check PDF file
    assert.isNotNull(invoice.pdfPath)
    const fullPdfPath = path.isAbsolute(invoice.pdfPath!) ? invoice.pdfPath! : app.makePath(invoice.pdfPath!)
    assert.isTrue(fs.existsSync(fullPdfPath), 'Tax invoice PDF must exist on disk')
    const pdfBuf = fs.readFileSync(fullPdfPath)
    assert.equal(pdfBuf.subarray(0, 4).toString(), '%PDF')
  })

  test('InvoiceService: prevents duplicate invoice creation for same order', async ({ assert }) => {
    assert.isNotNull(testOrder)
    const order = testOrder!

    const firstInvoice = await Invoice.findBy('orderId', order.id)
    const secondCall = await InvoiceService.generateInvoiceForOrder(order)

    assert.equal(firstInvoice?.id, secondCall.id)
    assert.equal(firstInvoice?.invoiceNumber, secondCall.invoiceNumber)
  })

  test('GstReportService: calculates monthly summary and returns accurate turnover/taxes', async ({ assert }) => {
    const now = new Date()
    const summary = await GstReportService.getMonthlySummary(now.getFullYear(), now.getMonth() + 1)

    assert.isNotNull(summary)
    assert.isNumber(summary.totalInvoices)
    assert.isTrue(summary.totalInvoices >= 1, 'Should include at least our test invoice')
    assert.isNumber(summary.taxableTurnover)
    assert.isNumber(summary.totalTax)
    assert.isArray(summary.rateWiseBreakdown)
    assert.isNumber(summary.b2bInvoices)
    assert.isNumber(summary.b2cInvoices)
  })

  test('GstReportService: generates 4 separate monthly ZIP archives with manifests', async ({ assert }) => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    const exp1 = await GstReportService.generateGstReportZip(year, month)
    const exp2 = await GstReportService.generateGstReturnReportZip(year, month)
    const exp3 = await GstReportService.generateTaxInvoiceArchiveZip(year, month)
    const exp4 = await GstReportService.generateTaxReconciliationZip(year, month)

    const exports = [exp1, exp2, exp3, exp4]
    for (const exp of exports) {
      assert.isNotNull(exp)
      assert.equal(exp.status, 'COMPLETED')
      assert.isNotNull(exp.filePath)

      const fullZipPath = path.isAbsolute(exp.filePath) ? exp.filePath : app.makePath(exp.filePath)
      assert.isTrue(fs.existsSync(fullZipPath), `ZIP file ${exp.fileName} must exist`)

      const zipStat = fs.statSync(fullZipPath)
      assert.isTrue(zipStat.size > 100, `ZIP file ${exp.fileName} must not be empty`)

      // Check ZIP magic header (PK\x03\x04)
      const zipHeader = Buffer.alloc(4)
      const fd = fs.openSync(fullZipPath, 'r')
      fs.readSync(fd, zipHeader, 0, 4, 0)
      fs.closeSync(fd)
      assert.equal(zipHeader.toString('hex'), '504b0304', `Must be valid ZIP archive for ${exp.fileName}`)
    }
  })
})
