import fs from 'node:fs'
import path from 'node:path'
import PDFDocument from 'pdfkit'
import bwipjs from 'bwip-js'

async function run() {
  console.log('Testing Invoice and Waybill Generation...')

  // 1. Test bwip-js barcode generation
  const awb = '18249204910294'
  const barcodeBuf = await bwipjs.toBuffer({
    bcid: 'code128',
    text: awb,
    scale: 3,
    height: 10,
    includetext: false,
  })
  console.log('Barcode buffer generated. Length:', barcodeBuf.length)

  // 2. Test bwip-js QR code generation
  const qrBuf = await bwipjs.toBuffer({
    bcid: 'qrcode',
    text: `https://www.delhivery.com/track/package/${awb}`,
    scale: 3,
  })
  console.log('QR buffer generated. Length:', qrBuf.length)

  // 3. Test Waybill PDF creation
  const waybillPath = path.resolve('test_waybill_output.pdf')
  const waybillDoc = new PDFDocument({
    size: [288, 432], // 4 x 6 inches portrait
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    autoFirstPage: true,
  })
  const waybillStream = fs.createWriteStream(waybillPath)
  waybillDoc.pipe(waybillStream)

  const primaryColor = '#9C0B5E'
  const grayBorder = '#CBD5E1'
  const lightBg = '#F3F4F6'
  const textDark = '#0F172A'
  const textMuted = '#64748B'

  // Header
  waybillDoc.rect(0, 0, 288, 56).fill(primaryColor)
  waybillDoc.fillColor('#FFFFFF').fontSize(13.6).font('Helvetica-Bold')
  waybillDoc.text('ANKITA PROCESSORS', 10, 10)
  waybillDoc.fontSize(5.6).font('Helvetica')
  waybillDoc.text('Plot No. 5, Behind Vivekanand School,', 10, 26)
  waybillDoc.text('Jetpur, Gujarat, India - 360370', 10, 33)
  waybillDoc.text('ankitaprocessors@gmail.com  |  +91 70436 37284', 10, 40)

  waybillDoc.fontSize(9.6).font('Helvetica-Bold')
  waybillDoc.text('SHIPPING LABEL', 160, 10, { width: 118, align: 'right' })
  waybillDoc.fontSize(5.7).font('Helvetica')
  waybillDoc.text('GSTIN: 24ANCPN9292N2ZB', 160, 24, { width: 118, align: 'right' })
  waybillDoc.text('PAN: ANCPN9292N', 160, 32, { width: 118, align: 'right' })

  // SHIP TO Box
  waybillDoc.roundedRect(9, 63, 270, 67, 4).fillAndStroke(lightBg, grayBorder)
  waybillDoc.fillColor(primaryColor).fontSize(5.2).font('Helvetica-Bold')
  waybillDoc.text('SHIP TO', 16, 68)
  waybillDoc.fillColor(textDark).fontSize(8.5).font('Helvetica-Bold')
  waybillDoc.text('Priya Sharma', 16, 77, { width: 254 })
  waybillDoc.fillColor(textDark).fontSize(6.5).font('Helvetica')
  waybillDoc.text('B-402, Royal Residency, Opp City Mall, Ring Road', 16, 88, { width: 254 })
  waybillDoc.text('Surat, Gujarat - 395007', 16, 97, { width: 254 })
  waybillDoc.fillColor(textMuted).fontSize(6.5).font('Helvetica-Bold')
  waybillDoc.text('Ph: +91 9825123456', 16, 114)

  // DELIVERY PIN Box
  waybillDoc.roundedRect(9, 136, 270, 27, 3).fill(primaryColor)
  waybillDoc.fillColor('#FFFFFF').fontSize(5.5).font('Helvetica-Bold')
  waybillDoc.text('DELIVERY PIN', 16, 147)

  const pinDigits = '395007'.split('')
  const pinStartX = 167
  const pinBoxWidth = 15
  const pinBoxHeight = 16
  const pinGap = 2.6
  for (let i = 0; i < 6; i++) {
    const bx = pinStartX + i * (pinBoxWidth + pinGap)
    const by = 141.5
    waybillDoc.roundedRect(bx, by, pinBoxWidth, pinBoxHeight, 2).fill('#FFFFFF')
    waybillDoc.fillColor(textDark).fontSize(10.5).font('Helvetica-Bold')
    waybillDoc.text(pinDigits[i] || ' ', bx, by + 2.5, { width: pinBoxWidth, align: 'center' })
  }

  // Metadata Box
  waybillDoc.roundedRect(9, 169, 270, 36, 4).fillAndStroke(lightBg, grayBorder)
  waybillDoc.fillColor(textMuted).fontSize(4.6).font('Helvetica-Bold')
  waybillDoc.text('INVOICE NO.', 16, 174)
  waybillDoc.fillColor(textDark).fontSize(6.5).font('Helvetica-Bold')
  waybillDoc.text('AP-2026-0042', 16, 181)
  waybillDoc.fillColor(textMuted).fontSize(4.6).font('Helvetica-Bold')
  waybillDoc.text('INVOICE DATE', 16, 191)
  waybillDoc.fillColor(textDark).fontSize(6.5).font('Helvetica')
  waybillDoc.text('22-Oct-2026', 16, 197)

  waybillDoc.fillColor(textMuted).fontSize(4.6).font('Helvetica-Bold')
  waybillDoc.text('ORDER NO.', 150, 174)
  waybillDoc.fillColor(textDark).fontSize(6.5).font('Helvetica-Bold')
  waybillDoc.text('ORD-2026-9812', 150, 181)
  waybillDoc.fillColor(textMuted).fontSize(4.6).font('Helvetica-Bold')
  waybillDoc.text('PAYMENT', 150, 191)
  waybillDoc.fillColor(textDark).fontSize(6.5).font('Helvetica-Bold')
  waybillDoc.text('PREPAID', 150, 197)

  // Items Table
  waybillDoc.rect(9, 211, 270, 14).fill(primaryColor)
  waybillDoc.fillColor('#FFFFFF').fontSize(5).font('Helvetica-Bold')
  waybillDoc.text('DESCRIPTION', 16, 215.5)
  waybillDoc.text('HSN', 200, 215.5)
  waybillDoc.text('QTY', 255, 215.5)

  waybillDoc.rect(9, 225, 270, 13).fill('#F8FAFC')
  waybillDoc.fillColor(textDark).fontSize(6).font('Helvetica')
  waybillDoc.text('Bandhani Silk Printed Saree (Maroon)', 16, 228.5, { width: 180, height: 10 })
  waybillDoc.text('5208', 200, 228.5)
  waybillDoc.text('1', 255, 228.5)

  waybillDoc.fillColor(textMuted).fontSize(6.8).font('Helvetica-Bold')
  waybillDoc.text('Total quantity', 16, 241)
  waybillDoc.fillColor(textDark).text('1', 255, 241)

  // Barcode & AWB Box
  waybillDoc.roundedRect(9, 279, 270, 62, 4).fillAndStroke(lightBg, grayBorder)
  waybillDoc.image(qrBuf, 16, 287, { width: 46, height: 46 })
  waybillDoc.fillColor(textMuted).fontSize(5).font('Helvetica')
  waybillDoc.text('QR', 36, 335)

  waybillDoc.fillColor(primaryColor).fontSize(5.2).font('Helvetica-Bold')
  waybillDoc.text('AWB / WAYBILL NO.  -  DELHIVERY', 74, 285)
  waybillDoc.fillColor(textDark).fontSize(8.5).font('Helvetica-Bold')
  waybillDoc.text(awb, 74, 292)
  waybillDoc.image(barcodeBuf, 74, 303, { width: 194, height: 32 })

  // DECLARED VALUE / GRAND TOTAL
  waybillDoc.roundedRect(9, 347, 270, 26, 3).fill(primaryColor)
  waybillDoc.fillColor('#FFFFFF').fontSize(5.5).font('Helvetica-Bold')
  waybillDoc.text('DECLARED VALUE / GRAND TOTAL', 16, 357)
  waybillDoc.fontSize(10.5).font('Helvetica-Bold')
  waybillDoc.text('INR 1,299.00', 140, 354, { width: 130, align: 'right' })

  // Return to / From
  waybillDoc.fillColor(primaryColor).fontSize(5.6).font('Helvetica-Bold')
  waybillDoc.text('Return to  /  From', 16, 377)
  waybillDoc.fillColor(textDark).fontSize(7.4).font('Helvetica-Bold')
  waybillDoc.text('Ankita Processors', 16, 385)
  waybillDoc.fillColor(textMuted).fontSize(6).font('Helvetica')
  waybillDoc.text('Plot No. 5, Behind Vivekanand School,', 16, 393)
  waybillDoc.text('Jetpur, Gujarat, India - 360370', 16, 400)
  waybillDoc.text('ankitaprocessors@gmail.com  |  +91 70436 37284', 16, 407)

  waybillDoc.moveTo(9, 417).lineTo(279, 417).lineWidth(0.8).stroke(grayBorder)
  waybillDoc.fillColor(textMuted).fontSize(5.6).font('Helvetica')
  waybillDoc.text('Goods once sold are accepted back only as per our return policy.', 16, 421)
  waybillDoc.rect(0, 429, 288, 3).fill(primaryColor)

  waybillDoc.end()

  await new Promise((resolve) => waybillStream.on('finish', resolve))
  console.log('Waybill PDF successfully generated at:', waybillPath, 'Size:', fs.statSync(waybillPath).size)

  // 4. Test Invoice PDF creation
  const invoicePath = path.resolve('test_invoice_output.pdf')
  const invoiceDoc = new PDFDocument({
    size: 'A4',
    margins: { top: 30, bottom: 30, left: 40, right: 40 },
    autoFirstPage: true,
  })
  const invStream = fs.createWriteStream(invoicePath)
  invoiceDoc.pipe(invStream)

  const startX = 40
  const pageWidth = 515.28
  let y = 30

  // 1. Header Banner (Solid Burgundy banner matching Invoice.pdf)
  invoiceDoc.rect(0, 0, 595.28, 70).fill(primaryColor)

  invoiceDoc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold')
  invoiceDoc.text('ANKITA PROCESSORS', startX, 14)

  invoiceDoc.fillColor('#FFFFFF').fontSize(7.5).font('Helvetica')
  invoiceDoc.text('Plot No. 5, Behind Vivekanand School,', startX, 34)
  invoiceDoc.text('Jetpur, Gujarat, India - 360370', startX, 44)
  invoiceDoc.text('ankitaprocessors@gmail.com  |  +91 70436 37284', startX, 54)

  invoiceDoc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold')
  invoiceDoc.text('TAX INVOICE', startX + 280, 14, { width: 235, align: 'right' })

  invoiceDoc.fontSize(8).font('Helvetica-Bold')
  invoiceDoc.text('GSTIN: 24ANCPN9292N2ZB', startX + 280, 36, { width: 235, align: 'right' })
  invoiceDoc.text('PAN: ANCPN9292N', startX + 280, 46, { width: 235, align: 'right' })

  y = 78

  // Metadata Grid
  invoiceDoc.roundedRect(startX, y, pageWidth, 52, 4).fillAndStroke(lightBg, grayBorder)
  invoiceDoc.fillColor(textMuted).fontSize(7.5).font('Helvetica-Bold')
  invoiceDoc.text('Invoice No:', startX + 12, y + 6)
  invoiceDoc.fillColor(textDark).fontSize(8.5).font('Helvetica-Bold')
  invoiceDoc.text('AP-2026-0042', startX + 77, y + 6)

  invoiceDoc.fillColor(textMuted).fontSize(7.5).font('Helvetica-Bold')
  invoiceDoc.text('Invoice Date:', startX + 12, y + 17)
  invoiceDoc.fillColor(textDark).fontSize(8).font('Helvetica')
  invoiceDoc.text('22-10-2026', startX + 77, y + 17)

  invoiceDoc.fillColor(textMuted).fontSize(7.5).font('Helvetica-Bold')
  invoiceDoc.text('Order No:', startX + 12, y + 28)
  invoiceDoc.fillColor(textDark).fontSize(8).font('Helvetica-Bold')
  invoiceDoc.text('ORD-2026-9812', startX + 77, y + 28)

  invoiceDoc.fillColor(textMuted).fontSize(7.5).font('Helvetica-Bold')
  invoiceDoc.text('Order Date:', startX + 12, y + 39)
  invoiceDoc.fillColor(textDark).fontSize(8).font('Helvetica')
  invoiceDoc.text('22-10-2026', startX + 77, y + 39)

  const col2X = startX + 270
  invoiceDoc.fillColor(textMuted).fontSize(7.5).font('Helvetica-Bold')
  invoiceDoc.text('Place of Supply:', col2X, y + 6)
  invoiceDoc.fillColor(textDark).fontSize(8).font('Helvetica')
  invoiceDoc.text('Gujarat (24)', col2X + 80, y + 6)

  invoiceDoc.fillColor(textMuted).fontSize(7.5).font('Helvetica-Bold')
  invoiceDoc.text('Supply Type:', col2X, y + 17)
  invoiceDoc.fillColor(textDark).fontSize(8).font('Helvetica-Bold')
  invoiceDoc.text('Intra-State (CGST+SGST)', col2X + 80, y + 17)

  invoiceDoc.fillColor(textMuted).fontSize(7.5).font('Helvetica-Bold')
  invoiceDoc.text('Payment Mode:', col2X, y + 28)
  invoiceDoc.fillColor(textDark).fontSize(8).font('Helvetica-Bold')
  invoiceDoc.text('PREPAID', col2X + 80, y + 28)

  invoiceDoc.fillColor(textMuted).fontSize(7.5).font('Helvetica-Bold')
  invoiceDoc.text('Reverse Charge:', col2X, y + 39)
  invoiceDoc.fillColor(textDark).fontSize(8).font('Helvetica')
  invoiceDoc.text('No', col2X + 80, y + 39)

  y += 60

  // Address Blocks
  const boxW = (pageWidth - 8) / 2
  invoiceDoc.roundedRect(startX, y, boxW, 74, 4).fillAndStroke(lightBg, grayBorder)
  invoiceDoc.fillColor(primaryColor).fontSize(8).font('Helvetica-Bold')
  invoiceDoc.text('BILLED TO (BUYER DETAILS):', startX + 10, y + 7)
  invoiceDoc.fillColor(textDark).fontSize(8.5).font('Helvetica-Bold')
  invoiceDoc.text('Priya Sharma', startX + 10, y + 19)
  invoiceDoc.fontSize(7.5).font('Helvetica')
  invoiceDoc.text('B-402, Royal Residency, Opp City Mall, Ring Road\nSurat, Gujarat - 395007', startX + 10, y + 30)
  invoiceDoc.text('Contact: +91 9825123456  |  Email: priya@example.com', startX + 10, y + 57)

  invoiceDoc.roundedRect(startX + boxW + 8, y, boxW, 74, 4).fillAndStroke(lightBg, grayBorder)
  invoiceDoc.fillColor(primaryColor).fontSize(8).font('Helvetica-Bold')
  invoiceDoc.text('SHIPPED TO (DELIVERY ADDRESS):', startX + boxW + 18, y + 7)
  invoiceDoc.fillColor(textDark).fontSize(8.5).font('Helvetica-Bold')
  invoiceDoc.text('Priya Sharma', startX + boxW + 18, y + 19)
  invoiceDoc.fontSize(7.5).font('Helvetica')
  invoiceDoc.text('B-402, Royal Residency, Opp City Mall, Ring Road\nSurat, Gujarat - 395007', startX + boxW + 18, y + 30)
  invoiceDoc.text('Courier: Delhivery Express  |  AWB: 18249204910294', startX + boxW + 18, y + 57)

  y += 82

  // Items Table
  invoiceDoc.rect(startX, y, pageWidth, 20).fill(primaryColor)
  invoiceDoc.fillColor('#FFFFFF').fontSize(7.5).font('Helvetica-Bold')
  invoiceDoc.text('#', startX + 5, y + 6)
  invoiceDoc.text('Description', startX + 25, y + 6)
  invoiceDoc.text('HSN', startX + 195, y + 6)
  invoiceDoc.text('Qty', startX + 235, y + 6)
  invoiceDoc.text('Rate', startX + 265, y + 6)
  invoiceDoc.text('Taxable', startX + 315, y + 6)
  invoiceDoc.text('GST%', startX + 375, y + 6)
  invoiceDoc.text('CGST+SGST', startX + 415, y + 6)
  invoiceDoc.text('Total', startX + 460, y + 6, { align: 'right', width: 50 })

  y += 20
  invoiceDoc.rect(startX, y, pageWidth, 20).fillAndStroke('#FFFFFF', '#E2E8F0')
  invoiceDoc.fillColor(textDark).fontSize(7.5).font('Helvetica')
  invoiceDoc.text('1', startX + 5, y + 6)
  invoiceDoc.text('Bandhani Silk Printed Saree (Maroon)', startX + 25, y + 6)
  invoiceDoc.text('5208', startX + 195, y + 6)
  invoiceDoc.text('1', startX + 235, y + 6)
  invoiceDoc.text('1237.14', startX + 265, y + 6)
  invoiceDoc.text('1237.14', startX + 315, y + 6)
  invoiceDoc.text('5%', startX + 375, y + 6)
  invoiceDoc.text('61.86', startX + 415, y + 6)
  invoiceDoc.text('1299.00', startX + 460, y + 6, { align: 'right', width: 50 })

  y += 28

  // Bottom Totals
  const leftBoxW = 310
  invoiceDoc.roundedRect(startX, y, leftBoxW, 92, 4).fillAndStroke(lightBg, grayBorder)
  invoiceDoc.fillColor(textMuted).fontSize(7).font('Helvetica-Bold')
  invoiceDoc.text('AMOUNT IN WORDS:', startX + 8, y + 6)
  invoiceDoc.fillColor(textDark).fontSize(8).font('Helvetica-Bold')
  invoiceDoc.text('One Thousand Two Hundred Ninety Nine Rupees Only', startX + 8, y + 16, { width: leftBoxW - 16 })

  invoiceDoc.fillColor(textMuted).fontSize(7).font('Helvetica-Bold')
  invoiceDoc.text('BANK DETAILS FOR REMITTANCE:', startX + 8, y + 36)
  invoiceDoc.fillColor(textDark).fontSize(7.5).font('Helvetica')
  invoiceDoc.text('Bank: Axis Bank, Kanakiya Plot, Jetpur', startX + 8, y + 46)
  invoiceDoc.text('A/c: 924020025533052  |  IFSC: UTIB0001468', startX + 8, y + 56)

  invoiceDoc.fillColor(textMuted).fontSize(6.5).font('Helvetica')
  invoiceDoc.text('Declaration: Goods once sold are accepted back only as per our return policy.', startX + 8, y + 74)
  invoiceDoc.text('This is a computer-generated tax invoice under Sec 31 of CGST Act, 2017.', startX + 8, y + 82)

  const summaryX = startX + leftBoxW + 8
  const summaryW = pageWidth - leftBoxW - 8
  invoiceDoc.roundedRect(summaryX, y, summaryW, 92, 4).fillAndStroke('#FFFFFF', grayBorder)

  invoiceDoc.fillColor(textMuted).fontSize(7.5).font('Helvetica')
  invoiceDoc.text('Subtotal:', summaryX + 8, y + 6)
  invoiceDoc.fillColor(textDark).text('1237.14', summaryX + 70, y + 6, { align: 'right', width: summaryW - 78 })
  invoiceDoc.fillColor(textMuted).text('Taxable Value:', summaryX + 8, y + 17)
  invoiceDoc.fillColor(textDark).text('1237.14', summaryX + 70, y + 17, { align: 'right', width: summaryW - 78 })
  invoiceDoc.fillColor(textMuted).text('CGST Amount:', summaryX + 8, y + 28)
  invoiceDoc.fillColor(textDark).text('30.93', summaryX + 70, y + 28, { align: 'right', width: summaryW - 78 })
  invoiceDoc.fillColor(textMuted).text('SGST Amount:', summaryX + 8, y + 38)
  invoiceDoc.fillColor(textDark).text('30.93', summaryX + 70, y + 38, { align: 'right', width: summaryW - 78 })
  invoiceDoc.fillColor(textMuted).text('Shipping Fee:', summaryX + 8, y + 48)
  invoiceDoc.fillColor(textDark).text('0.00', summaryX + 70, y + 48, { align: 'right', width: summaryW - 78 })

  // Grand Total Banner
  invoiceDoc.rect(summaryX, y + 64, summaryW, 28).fill(primaryColor)
  invoiceDoc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold')
  invoiceDoc.text('GRAND TOTAL:', summaryX + 8, y + 72)
  invoiceDoc.text('INR 1299.00', summaryX + 60, y + 72, { align: 'right', width: summaryW - 68 })

  y += 102

  // Signatory
  invoiceDoc.roundedRect(startX, y, pageWidth, 46, 4).stroke(grayBorder)
  invoiceDoc.fillColor(textMuted).fontSize(6.5).font('Helvetica')
  invoiceDoc.text('Terms & Conditions:', startX + 10, y + 6)
  invoiceDoc.text('1. Goods once sold are subject to company warranty & exchange policy.', startX + 10, y + 15)
  invoiceDoc.text('2. All disputes are subject to Jetpur/Rajkot jurisdiction only.', startX + 10, y + 24)

  invoiceDoc.fillColor(primaryColor).fontSize(8).font('Helvetica-Bold')
  invoiceDoc.text('For ANKITA PROCESSORS', startX + 340, y + 8, { align: 'right', width: 165 })
  invoiceDoc.fillColor(textMuted).fontSize(6.5).font('Helvetica')
  invoiceDoc.text('[Digitally Signed Tax Invoice]', startX + 340, y + 24, { align: 'right', width: 165 })
  invoiceDoc.text('Authorized Signatory', startX + 340, y + 33, { align: 'right', width: 165 })

  invoiceDoc.end()
  await new Promise((resolve) => invStream.on('finish', resolve))
  console.log('Invoice PDF successfully generated at:', invoicePath, 'Size:', fs.statSync(invoicePath).size)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
