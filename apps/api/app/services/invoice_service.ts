import fs from 'node:fs'
import path from 'node:path'
import PDFDocument from 'pdfkit'
import app from '@adonisjs/core/services/app'
import { DateTime } from 'luxon'
import Invoice from '#models/invoice'
import InvoiceItem from '#models/invoice_item'
import Order from '#models/order'
import User from '#models/user'
import WholesalerProfile from '#models/wholesaler_profile'
import db from '@adonisjs/lucid/services/db'

export class InvoiceService {
  private static ensureStorageDir(): string {
    const dir = app.makePath('storage/documents/invoices')
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    return dir
  }

  /**
   * Convert number to words in Indian Rupee format
   */
  public static numberToWords(num: number): string {
    const a = [
      '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
      'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen ',
    ]
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

    const integerPart = Math.floor(num)
    if (integerPart === 0) return 'Zero Rupees Only'

    const formatGroup = (n: number, unit: string) => {
      let str = ''
      if (n > 99) {
        str += a[Math.floor(n / 100)] + 'Hundred '
        n %= 100
      }
      if (n > 19) {
        str += b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : ' ')
      } else if (n > 0) {
        str += a[n]
      }
      if (str.trim().length > 0) {
        str += unit + ' '
      }
      return str
    }

    let words = ''
    let n = integerPart

    if (n >= 10000000) {
      words += formatGroup(Math.floor(n / 10000000), 'Crore')
      n %= 10000000
    }
    if (n >= 100000) {
      words += formatGroup(Math.floor(n / 100000), 'Lakh')
      n %= 100000
    }
    if (n >= 1000) {
      words += formatGroup(Math.floor(n / 1000), 'Thousand')
      n %= 1000
    }
    if (n > 0) {
      words += formatGroup(n, '')
    }

    return `${words.trim()} Rupees Only`
  }

  /**
   * Determine Indian State Code from State name or PIN code
   */
  public static getStateCode(stateName?: string, pincode?: string): string {
    const stateMap: Record<string, string> = {
      'jammu and kashmir': '01',
      'himachal pradesh': '02',
      punjab: '03',
      chandigarh: '04',
      uttarakhand: '05',
      haryana: '06',
      delhi: '07',
      rajasthan: '08',
      'uttar pradesh': '09',
      bihar: '10',
      sikkim: '11',
      'arunachal pradesh': '12',
      nagaland: '13',
      manipur: '14',
      mizoram: '15',
      tripura: '16',
      meghalaya: '17',
      assam: '18',
      'west bengal': '19',
      jharkhand: '20',
      odisha: '21',
      chhattisgarh: '22',
      'madhya pradesh': '23',
      gujarat: '24',
      maharashtra: '27',
      karnataka: '29',
      goa: '30',
      kerala: '32',
      'tamil nadu': '33',
      puducherry: '34',
      telangana: '36',
      'andhra pradesh': '37',
    }

    if (stateName) {
      const normalized = stateName.toLowerCase().trim()
      if (stateMap[normalized]) return stateMap[normalized]
      for (const [name, code] of Object.entries(stateMap)) {
        if (normalized.includes(name)) return code
      }
    }

    if (pincode && pincode.startsWith('36') || pincode?.startsWith('37') || pincode?.startsWith('38') || pincode?.startsWith('39')) {
      return '24' // Gujarat
    }

    return '24' // Default to home state Gujarat
  }

  /**
   * Generate Next Auditable Invoice Number (e.g. AP-2026-0001)
   */
  public static async getNextInvoiceNumber(invoiceDate: DateTime): Promise<string> {
    const year = invoiceDate.year
    const countResult = await db
      .from('invoices')
      .where('invoice_number', 'like', `AP-${year}-%`)
      .count('* as total')

    const count = Number(countResult[0]?.total || 0) + 1
    const seq = String(count).padStart(4, '0')
    return `AP-${year}-${seq}`
  }

  /**
   * Generate Official Compliant GST Tax Invoice PDF
   */
  /**
   * Generate Official Compliant GST Tax Invoice PDF matching exact Ankita Processors design
   */
  public static async generateInvoicePdf(invoice: Invoice, items: InvoiceItem[]): Promise<string> {
    const dir = this.ensureStorageDir()
    const safeFilename = `INV_${invoice.invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`
    const filePath = path.join(dir, safeFilename)

    // Ensure order is accessible for Order No, Order Date, Courier & AWB
    let order: Order | null = null
    try {
      order = invoice.order || (await Order.find(invoice.orderId))
    } catch {
      // order lookup optional fallback
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 30, bottom: 30, left: 40, right: 40 },
        autoFirstPage: true,
      })

      const writeStream = fs.createWriteStream(filePath)
      doc.pipe(writeStream)

      const startX = 40
      const pageWidth = 515.28 // 595.28 - 80
      const primaryColor = '#9C0B5E' // Ankita Processors Burgundy / Magenta
      const grayBorder = '#CBD5E1'
      const lightBg = '#F8FAFC'
      const textDark = '#0F172A'
      const textMuted = '#64748B'

      let y = 30

      // 1. Header Banner (Solid Burgundy banner matching Invoice.pdf)
      doc.rect(0, 0, 595.28, 70).fill(primaryColor)

      doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold')
      doc.text('ANKITA PROCESSORS', startX, 14)

      doc.fillColor('#FFFFFF').fontSize(7.5).font('Helvetica')
      doc.text('Plot No. 5, Behind Vivekanand School,', startX, 34)
      doc.text('Jetpur, Gujarat, India - 360370', startX, 44)
      doc.text('ankitaprocessors@gmail.com  |  +91 70436 37284', startX, 54)

      const isEInvoice = invoice.eInvoiceStatus === 'GENERATED' && invoice.irn
      doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold')
      doc.text(isEInvoice ? 'TAX INVOICE / E-INVOICE' : 'TAX INVOICE', startX + 280, 14, { width: 235, align: 'right' })

      doc.fontSize(8).font('Helvetica-Bold')
      doc.text('GSTIN: 24ANCPN9292N2ZB', startX + 280, 36, { width: 235, align: 'right' })
      doc.text('PAN: ANCPN9292N', startX + 280, 46, { width: 235, align: 'right' })

      y = 78

      // E-Invoice IRN details bar if statutory registration succeeded
      if (isEInvoice) {
        doc.roundedRect(startX, y, pageWidth, 26, 3).fillAndStroke('#F1F5F9', '#CBD5E1')
        doc.fillColor('#0F172A').fontSize(7.5).font('Helvetica-Bold')
        doc.text(`IRN: ${invoice.irn}`, startX + 8, y + 5)
        doc.font('Helvetica')
        doc.text(`Ack No: ${invoice.ackNo || 'N/A'}  |  Ack Date: ${invoice.ackDate ? invoice.ackDate.toFormat('dd-MM-yyyy HH:mm') : 'N/A'}`, startX + 8, y + 15)
        y += 32
      }

      // 2. Metadata Grid
      const metaBoxHeight = 52
      doc.roundedRect(startX, y, pageWidth, metaBoxHeight, 4).fillAndStroke(lightBg, grayBorder)

      // Left Column: Invoice No, Invoice Date, Order No, Order Date
      const col1X = startX + 12
      doc.fillColor(textMuted).fontSize(7.5).font('Helvetica-Bold')
      doc.text('Invoice No:', col1X, y + 6)
      doc.fillColor(textDark).fontSize(8.5).font('Helvetica-Bold')
      doc.text(invoice.invoiceNumber, col1X + 65, y + 6)

      doc.fillColor(textMuted).fontSize(7.5).font('Helvetica-Bold')
      doc.text('Invoice Date:', col1X, y + 17)
      doc.fillColor(textDark).fontSize(8).font('Helvetica')
      doc.text(invoice.invoiceDate.toFormat('dd-MM-yyyy'), col1X + 65, y + 17)

      doc.fillColor(textMuted).fontSize(7.5).font('Helvetica-Bold')
      doc.text('Order No:', col1X, y + 28)
      doc.fillColor(textDark).fontSize(8).font('Helvetica-Bold')
      doc.text(order?.orderNo || 'N/A', col1X + 65, y + 28)

      doc.fillColor(textMuted).fontSize(7.5).font('Helvetica-Bold')
      doc.text('Order Date:', col1X, y + 39)
      doc.fillColor(textDark).fontSize(8).font('Helvetica')
      const orderDateFormatted = order?.createdAt ? order.createdAt.toFormat('dd-MM-yyyy') : invoice.invoiceDate.toFormat('dd-MM-yyyy')
      doc.text(orderDateFormatted, col1X + 65, y + 39)

      // Right Column: Place of Supply, Supply Type, Payment Mode, Reverse Charge
      const col2X = startX + 270
      doc.fillColor(textMuted).fontSize(7.5).font('Helvetica-Bold')
      doc.text('Place of Supply:', col2X, y + 6)
      doc.fillColor(textDark).fontSize(8).font('Helvetica')
      const posText = `${invoice.isInterstate ? 'Inter-State' : 'Gujarat'} (${invoice.sellerStateCode || '24'})`
      doc.text(posText, col2X + 80, y + 6)

      doc.fillColor(textMuted).fontSize(7.5).font('Helvetica-Bold')
      doc.text('Supply Type:', col2X, y + 17)
      doc.fillColor(textDark).fontSize(8).font('Helvetica-Bold')
      doc.text(invoice.isInterstate ? 'Inter-State (IGST)' : 'Intra-State (CGST+SGST)', col2X + 80, y + 17)

      doc.fillColor(textMuted).fontSize(7.5).font('Helvetica-Bold')
      doc.text('Payment Mode:', col2X, y + 28)
      doc.fillColor(textDark).fontSize(8).font('Helvetica-Bold')
      const payMode = order?.paymentMethod === 'COD' ? 'CASH ON DELIVERY (COD)' : 'PREPAID'
      doc.text(payMode, col2X + 80, y + 28)

      doc.fillColor(textMuted).fontSize(7.5).font('Helvetica-Bold')
      doc.text('Reverse Charge:', col2X, y + 39)
      doc.fillColor(textDark).fontSize(8).font('Helvetica')
      doc.text('No', col2X + 80, y + 39)

      y += metaBoxHeight + 8

      // 3. Billing & Shipping Address Boxes
      const boxW = (pageWidth - 8) / 2
      const addrHeight = 74

      // Bill To Box
      doc.roundedRect(startX, y, boxW, addrHeight, 4).fillAndStroke(lightBg, grayBorder)
      doc.fillColor(primaryColor).fontSize(8).font('Helvetica-Bold')
      doc.text('BILLED TO (BUYER DETAILS):', startX + 10, y + 7)

      doc.fillColor(textDark).fontSize(8.5).font('Helvetica-Bold')
      doc.text(invoice.customerName, startX + 10, y + 19, { width: boxW - 20 })

      doc.fontSize(7.5).font('Helvetica')
      const billAddr = invoice.billingAddress
      const billLine1 = billAddr.line1 || billAddr.addressLine1 || billAddr.address || 'Customer Delivery Address'
      const billLine2 = [billAddr.line2 || billAddr.addressLine2, billAddr.city, billAddr.state].filter(Boolean).join(', ')
      doc.text(`${billLine1}\n${billLine2} - ${billAddr.pincode || billAddr.pinCode || ''}`, startX + 10, y + 30, { width: boxW - 20, height: 24 })

      if (invoice.customerGstin) {
        doc.font('Helvetica-Bold').text(`GSTIN / UIN: ${invoice.customerGstin}`, startX + 10, y + 57)
      } else {
        doc.font('Helvetica').text(`Contact: ${invoice.customerPhone || 'N/A'}  |  Email: ${invoice.customerEmail || 'N/A'}`, startX + 10, y + 57, { width: boxW - 20 })
      }

      // Ship To Box
      const rightX = startX + boxW + 8
      doc.roundedRect(rightX, y, boxW, addrHeight, 4).fillAndStroke(lightBg, grayBorder)
      doc.fillColor(primaryColor).fontSize(8).font('Helvetica-Bold')
      doc.text('SHIPPED TO (DELIVERY ADDRESS):', rightX + 10, y + 7)

      doc.fillColor(textDark).fontSize(8.5).font('Helvetica-Bold')
      doc.text(invoice.customerName, rightX + 10, y + 19, { width: boxW - 20 })

      doc.fontSize(7.5).font('Helvetica')
      const shipAddr = invoice.shippingAddress
      const shipLine1 = shipAddr.line1 || shipAddr.addressLine1 || shipAddr.address || 'Customer Delivery Address'
      const shipLine2 = [shipAddr.line2 || shipAddr.addressLine2, shipAddr.city, shipAddr.state].filter(Boolean).join(', ')
      doc.text(`${shipLine1}\n${shipLine2} - ${shipAddr.pincode || shipAddr.pinCode || ''}`, rightX + 10, y + 30, { width: boxW - 20, height: 24 })

      const courierInfo = order?.awbNumber
        ? `Courier: ${order?.courier || 'Delhivery Express'}  |  AWB: ${order.awbNumber}`
        : `Courier: ${order?.courier || 'Delhivery Express'} (Air Waybill Assigned upon Dispatch)`
      doc.text(courierInfo, rightX + 10, y + 57, { width: boxW - 20 })

      y += addrHeight + 8

      // 4. Items Table
      doc.rect(startX, y, pageWidth, 20).fill(primaryColor)
      doc.fillColor('#FFFFFF').fontSize(7.5).font('Helvetica-Bold')
      doc.text('#', startX + 5, y + 6)
      doc.text('Description', startX + 25, y + 6)
      doc.text('HSN', startX + 195, y + 6)
      doc.text('Qty', startX + 235, y + 6)
      doc.text('Rate', startX + 265, y + 6)
      doc.text('Taxable', startX + 315, y + 6)
      doc.text('GST%', startX + 375, y + 6)
      doc.text(invoice.isInterstate ? 'IGST' : 'CGST+SGST', startX + 415, y + 6)
      doc.text('Total', startX + 460, y + 6, { align: 'right', width: 50 })

      y += 20

      let rowIndex = 1
      for (const item of items) {
        const rowH = 20
        doc.rect(startX, y, pageWidth, rowH).fillAndStroke(rowIndex % 2 === 0 ? '#F8FAFC' : '#FFFFFF', '#E2E8F0')
        doc.fillColor(textDark).fontSize(7.5).font('Helvetica')
        doc.text(String(rowIndex), startX + 5, y + 6)
        doc.text(item.itemDescription, startX + 25, y + 6, { width: 165, height: 14 })
        doc.text(item.hsnCode || '5208', startX + 195, y + 6)
        doc.text(String(item.quantity), startX + 235, y + 6)
        doc.text(Number(item.unitPrice).toFixed(2), startX + 265, y + 6)
        doc.text(Number(item.taxableValue).toFixed(2), startX + 315, y + 6)
        doc.text(`${item.gstRate}%`, startX + 375, y + 6)

        const taxTotal = invoice.isInterstate ? Number(item.igstAmount) : Number(item.cgstAmount) + Number(item.sgstAmount)
        doc.text(taxTotal.toFixed(2), startX + 415, y + 6)
        doc.text(Number(item.totalAmount).toFixed(2), startX + 460, y + 6, { align: 'right', width: 50 })

        y += rowH
        rowIndex++
      }

      // Shipping line if applicable
      if (Number(invoice.shippingFee) > 0) {
        const rowH = 18
        doc.rect(startX, y, pageWidth, rowH).fillAndStroke(rowIndex % 2 === 0 ? '#F8FAFC' : '#FFFFFF', '#E2E8F0')
        doc.fillColor(textDark).fontSize(7.5).font('Helvetica')
        doc.text(String(rowIndex), startX + 5, y + 5)
        doc.text('Shipping & Logistics (Delhivery Express)', startX + 25, y + 5)
        doc.text('9968', startX + 195, y + 5)
        doc.text('1', startX + 235, y + 5)
        doc.text(Number(invoice.shippingFee).toFixed(2), startX + 265, y + 5)
        doc.text(Number(invoice.shippingFee).toFixed(2), startX + 315, y + 5)
        doc.text('0%', startX + 375, y + 5)
        doc.text('0.00', startX + 415, y + 5)
        doc.text(Number(invoice.shippingFee).toFixed(2), startX + 460, y + 5, { align: 'right', width: 50 })
        y += rowH
        rowIndex++
      }

      // COD Handling Fee line if applicable
      if (Number(invoice.codFee) > 0) {
        const rowH = 18
        doc.rect(startX, y, pageWidth, rowH).fillAndStroke(rowIndex % 2 === 0 ? '#F8FAFC' : '#FFFFFF', '#E2E8F0')
        doc.fillColor(textDark).fontSize(7.5).font('Helvetica')
        doc.text(String(rowIndex), startX + 5, y + 5)
        doc.text('Cash on Delivery (COD) Collection Fee', startX + 25, y + 5)
        doc.text('9968', startX + 195, y + 5)
        doc.text('1', startX + 235, y + 5)
        doc.text(Number(invoice.codFee).toFixed(2), startX + 265, y + 5)
        doc.text(Number(invoice.codFee).toFixed(2), startX + 315, y + 5)
        doc.text('0%', startX + 375, y + 5)
        doc.text('0.00', startX + 415, y + 5)
        doc.text(Number(invoice.codFee).toFixed(2), startX + 460, y + 5, { align: 'right', width: 50 })
        y += rowH
        rowIndex++
      }

      y += 8

      // 5. Bottom Totals & Financials
      const bottomH = 92
      const leftBoxW = 310
      doc.roundedRect(startX, y, leftBoxW, bottomH, 4).fillAndStroke(lightBg, grayBorder)

      doc.fillColor(textMuted).fontSize(7).font('Helvetica-Bold')
      doc.text('AMOUNT IN WORDS:', startX + 8, y + 6)
      doc.fillColor(textDark).fontSize(8).font('Helvetica-Bold')
      doc.text(this.numberToWords(Number(invoice.totalAmount)), startX + 8, y + 16, { width: leftBoxW - 16 })

      doc.fillColor(textMuted).fontSize(7).font('Helvetica-Bold')
      doc.text('BANK DETAILS FOR REMITTANCE:', startX + 8, y + 36)
      doc.fillColor(textDark).fontSize(7.5).font('Helvetica')
      doc.text('Bank: Axis Bank, Kanakiya Plot, Jetpur', startX + 8, y + 46)
      doc.text('A/c: 924020025533052  |  IFSC: UTIB0001468', startX + 8, y + 56)

      doc.fillColor(textMuted).fontSize(6.5).font('Helvetica')
      doc.text('Declaration: Goods once sold are accepted back only as per our return policy.', startX + 8, y + 74)
      doc.text('This is a computer-generated tax invoice under Sec 31 of CGST Act, 2017.', startX + 8, y + 82)

      // Right: Summary Table & Grand Total
      const summaryX = startX + leftBoxW + 8
      const summaryW = pageWidth - leftBoxW - 8
      doc.roundedRect(summaryX, y, summaryW, bottomH, 4).fillAndStroke('#FFFFFF', grayBorder)

      const printSummaryLine = (lbl: string, val: string, ly: number, bold = false) => {
        doc.fillColor(textMuted).fontSize(7.5).font(bold ? 'Helvetica-Bold' : 'Helvetica')
        doc.text(lbl, summaryX + 8, ly)
        doc.fillColor(textDark).text(val, summaryX + 70, ly, { align: 'right', width: summaryW - 78 })
      }

      printSummaryLine('Subtotal:', Number(invoice.subtotal).toFixed(2), y + 6)
      printSummaryLine('Taxable Value:', Number(invoice.taxableValue).toFixed(2), y + 17)
      if (invoice.isInterstate) {
        printSummaryLine('IGST Amount:', Number(invoice.igstAmount).toFixed(2), y + 28)
      } else {
        printSummaryLine('CGST Amount:', Number(invoice.cgstAmount).toFixed(2), y + 28)
        printSummaryLine('SGST Amount:', Number(invoice.sgstAmount).toFixed(2), y + 38)
      }
      printSummaryLine('Shipping Fee:', Number(invoice.shippingFee).toFixed(2), y + (invoice.isInterstate ? 39 : 48))
      if (Number(invoice.codFee) > 0) {
        printSummaryLine('COD Collection Fee:', Number(invoice.codFee).toFixed(2), y + (invoice.isInterstate ? 50 : 58), true)
      }

      // Grand Total Banner
      doc.rect(summaryX, y + 64, summaryW, 28).fill(primaryColor)
      doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold')
      doc.text('GRAND TOTAL:', summaryX + 8, y + 72)
      doc.text(`INR ${Number(invoice.totalAmount).toFixed(2)}`, summaryX + 60, y + 72, { align: 'right', width: summaryW - 68 })

      y += bottomH + 10

      // 6. Signatory Section
      const sigH = 58
      doc.roundedRect(startX, y, pageWidth, sigH, 4).stroke(grayBorder)
      doc.fillColor(textMuted).fontSize(6.5).font('Helvetica')
      doc.text('Terms & Conditions:', startX + 10, y + 6)
      doc.text('1. Goods once sold are subject to company warranty & exchange policy.', startX + 10, y + 15)
      doc.text('2. All disputes are subject to Jetpur/Rajkot jurisdiction only.', startX + 10, y + 24)
      doc.text('3. Computer-generated invoice under Section 31 of CGST Act, 2017.', startX + 10, y + 33)
      doc.text('4. Certified that the particulars given above are true and correct.', startX + 10, y + 42)

      doc.fillColor(primaryColor).fontSize(8).font('Helvetica-Bold')
      doc.text('For ANKITA PROCESSORS', startX + 340, y + 6, { align: 'right', width: 165 })

      const signatureCandidates = [
        app.makePath('public/signature.png'),
        path.resolve(process.cwd(), 'public/signature.png'),
        path.resolve(process.cwd(), '../admin/public/signature.png'),
        path.resolve(process.cwd(), '../web/public/signature.png'),
      ]
      const sigPath = signatureCandidates.find((p) => fs.existsSync(p))

      if (sigPath) {
        doc.image(sigPath, startX + 395, y + 17, { width: 110, height: 25 })
      } else {
        doc.fillColor(textMuted).fontSize(6.5).font('Helvetica')
        doc.text('[Digitally Signed Tax Invoice]', startX + 340, y + 24, { align: 'right', width: 165 })
      }

      doc.fillColor(textMuted).fontSize(7).font('Helvetica-Bold')
      doc.text('Authorized Signatory', startX + 340, y + 45, { align: 'right', width: 165 })

      doc.end()

      writeStream.on('finish', () => resolve(filePath))
      writeStream.on('error', (err) => reject(err))
    })
  }

  /**
   * Create or retrieve official invoice for an Order
   */
  public static async generateInvoiceForOrder(
    order: Order,
    trxClient?: any
  ): Promise<Invoice> {
    // 1. Permanent association: Check if invoice already exists for this order
    const existing = await Invoice.query({ client: trxClient })
      .where('order_id', order.id)
      .preload('items')
      .first()

    if (existing) {
      if (!existing.pdfPath || !fs.existsSync(existing.pdfPath)) {
        const filePath = await this.generateInvoicePdf(existing, existing.items)
        existing.pdfPath = filePath
        existing.pdfUrl = `/api/v1/orders/${order.id}/invoice/download`
        await existing.save()
      }
      return existing
    }

    // 2. Fetch User and Wholesaler Profile if applicable
    const user = await User.find(order.userId, { client: trxClient })
    const wholesaler = await WholesalerProfile.findBy('user_id', order.userId, { client: trxClient })

    const invoiceDate = DateTime.now()
    const invoiceNumber = await this.getNextInvoiceNumber(invoiceDate)

    const shipAddr = typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : (order.shippingAddress || {})
    const billAddr = order.billingAddress
      ? typeof order.billingAddress === 'string'
        ? JSON.parse(order.billingAddress)
        : order.billingAddress
      : shipAddr

    const customerName =
      wholesaler?.companyName ||
      shipAddr.fullName ||
      shipAddr.name ||
      user?.name ||
      'Valued Customer'
    const customerGstin = wholesaler?.gstin || null
    const isB2b = Boolean(customerGstin && customerGstin.trim().length === 15)

    // Determine state & tax applicability
    const sellerStateCode = '24' // Gujarat
    const buyerStateCode = this.getStateCode(shipAddr.state, shipAddr.pincode)
    const isInterstate = buyerStateCode !== sellerStateCode

    // Load order items
    await order.load('items', (q) => q.preload('product'))
    const orderItems = order.items || []

    let subtotal = 0
    let totalCgst = 0
    let totalSgst = 0
    let totalIgst = 0

    // Prepare line items
    const lineItemsData: any[] = []

    for (const item of orderItems) {
      const quantity = Number(item.quantity) || 1
      const unitPrice = Number(item.rate) || 0
      const itemTaxable = unitPrice * quantity
      const gstRate = Number(item.taxPercent) || 5

      let cgstRate = 0
      let cgstAmount = 0
      let sgstRate = 0
      let sgstAmount = 0
      let igstRate = 0
      let igstAmount = 0

      if (isInterstate) {
        igstRate = gstRate
        igstAmount = Math.round((itemTaxable * igstRate) / 100)
      } else {
        cgstRate = gstRate / 2
        cgstAmount = Math.round((itemTaxable * cgstRate) / 100)
        sgstRate = gstRate / 2
        sgstAmount = Math.round((itemTaxable * sgstRate) / 100)
      }

      const itemTotal = itemTaxable + cgstAmount + sgstAmount + igstAmount

      subtotal += itemTaxable
      totalCgst += cgstAmount
      totalSgst += sgstAmount
      totalIgst += igstAmount

      lineItemsData.push({
        orderItemId: item.id,
        productId: item.productId,
        itemDescription: item.productName || 'Fabric Product',
        hsnCode: item.hsnCode || '5208',
        quantity,
        unitPrice,
        discount: 0,
        taxableValue: itemTaxable,
        gstRate,
        cgstRate,
        cgstAmount,
        sgstRate,
        sgstAmount,
        igstRate,
        igstAmount,
        totalAmount: itemTotal,
      })
    }

    // If order has no line items loaded, fallback to order-level financials
    if (orderItems.length === 0 && Number(order.subtotal) > 0) {
      subtotal = Number(order.subtotal)
      const orderTax = Number(order.taxAmount) || 0
      if (isInterstate) {
        totalIgst = orderTax
      } else {
        totalCgst = Math.round((orderTax / 2) * 100) / 100
        totalSgst = Math.round((orderTax / 2) * 100) / 100
      }
    }

    const shippingFee = Number(order.shippingFee) || 0
    const codFee = Number(order.codFee) || 0
    const totalTax = totalCgst + totalSgst + totalIgst
    const totalAmount = subtotal + totalTax + shippingFee + codFee

    // Create Invoice record
    const invoice = new Invoice()
    if (trxClient) invoice.useTransaction(trxClient)

    invoice.invoiceNumber = invoiceNumber
    invoice.orderId = order.id
    invoice.userId = order.userId
    invoice.invoiceDate = invoiceDate
    invoice.sellerName = 'Ankita Processors'
    invoice.sellerGstin = '24ANCPN9292N2ZB'
    invoice.sellerAddress = 'Plot 5, Near Vivekanand School, Jetpur, Rajkot, Gujarat - 360370'
    invoice.sellerStateCode = sellerStateCode
    invoice.customerName = customerName
    invoice.customerEmail = user?.email || null
    invoice.customerPhone = user?.phone || shipAddr.phone || null
    invoice.customerGstin = customerGstin
    invoice.billingAddress = billAddr
    invoice.shippingAddress = shipAddr
    invoice.isB2b = isB2b
    invoice.isInterstate = isInterstate
    invoice.subtotal = subtotal
    invoice.discount = 0
    invoice.taxableValue = subtotal
    invoice.cgstAmount = totalCgst
    invoice.sgstAmount = totalSgst
    invoice.igstAmount = totalIgst
    invoice.totalTax = totalTax
    invoice.shippingFee = shippingFee
    invoice.codFee = codFee
    invoice.totalAmount = totalAmount
    invoice.status = 'GENERATED'

    // Statutory E-Invoice applicability check:
    // E-invoicing is legally mandated under Rule 48(4) for B2B supplies with buyer GSTIN
    const eInvoiceEnabled = process.env.E_INVOICE_ENABLED === 'true'
    if (isB2b && eInvoiceEnabled) {
      invoice.eInvoiceStatus = 'PENDING'
    } else {
      invoice.eInvoiceStatus = 'NOT_APPLICABLE'
    }

    await invoice.save()

    // Save line items
    const savedItems: InvoiceItem[] = []
    for (const itemData of lineItemsData) {
      const invoiceItem = new InvoiceItem()
      if (trxClient) invoiceItem.useTransaction(trxClient)
      invoiceItem.invoiceId = invoice.id
      Object.assign(invoiceItem, itemData)
      await invoiceItem.save()
      savedItems.push(invoiceItem)
    }

    // Generate Official PDF
    const pdfPath = await this.generateInvoicePdf(invoice, savedItems)
    invoice.pdfPath = pdfPath
    invoice.pdfUrl = `/api/v1/orders/${order.id}/invoice/download`
    await invoice.save()

    // Also update order.invoiceNo
    order.invoiceNo = invoiceNumber
    await order.save()

    return invoice
  }
}

export default InvoiceService
