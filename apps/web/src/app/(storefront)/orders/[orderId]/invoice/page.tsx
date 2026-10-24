'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import Link from 'next/link'
import apiClient from '@/lib/api/client'
import { Button } from '@ankita/ui'
import { Printer, Download, ArrowLeft, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

const fetcher = (url: string) => apiClient.get(url).then((res) => res.data)

function numberToWords(num: number): string {
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
      str += b[Math.floor(n / 10)] + ' ' + a[n % 10]
    } else if (n > 0) {
      str += a[n]
    }
    if (str.trim().length > 0) {
      str += unit + ' '
    }
    return str
  }

  let words = ''
  const crore = Math.floor(integerPart / 10000000)
  let remainder = integerPart % 10000000
  const lakh = Math.floor(remainder / 100000)
  remainder %= 100000
  const thousand = Math.floor(remainder / 1000)
  remainder %= 1000

  if (crore > 0) words += formatGroup(crore, 'Crore')
  if (lakh > 0) words += formatGroup(lakh, 'Lakh')
  if (thousand > 0) words += formatGroup(thousand, 'Thousand')
  if (remainder > 0) words += formatGroup(remainder, '')

  return words.trim() + ' Rupees Only'
}

export default function CustomerInvoicePage() {
  const params = useParams<{ orderId: string }>()
  const router = useRouter()
  const orderId = params?.orderId
  const [isPrinting, setIsPrinting] = useState(false)

  // Try fetching by ID first, fallback to lookupByOrderNo
  const endpoint = orderId?.includes('-') || !isNaN(Number(orderId))
    ? `/orders/${orderId}`
    : `/orders/lookup/${orderId}`

  const { data, error, isLoading } = useSWR(orderId ? endpoint : null, fetcher)

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const order = data?.order || data?.data?.order || data

  if (error || !order || (!order.id && !order.orderNo)) {
    return (
      <div className="container-wide py-16 text-center max-w-md mx-auto">
        <p className="text-destructive font-semibold mb-2">Unable to load invoice details.</p>
        <p className="text-sm text-muted-foreground mb-6">The order invoice could not be retrieved. Please check your order ID or sign in to your account.</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>
    )
  }

  const parseAddr = (addr: any) => {
    if (!addr) return { name: '', line1: '', line2: '', city: '', state: '', pincode: '', phone: '' }
    let p = addr
    if (typeof addr === 'string') {
      try {
        p = JSON.parse(addr)
      } catch {
        p = { address: addr }
      }
    }
    return {
      name:
        p.fullName ||
        p.name ||
        [p.firstName, p.lastName].filter(Boolean).join(' ') ||
        order.user?.name ||
        'Valued Customer',
      line1: p.addressLine1 || p.address || p.street || 'Customer Delivery Address',
      line2: p.addressLine2 || p.area || p.landmark || '',
      city: p.city || 'City',
      state: p.state || 'Gujarat',
      pincode: String(p.pincode || p.pinCode || p.postalCode || '360370').replace(/\D/g, ''),
      phone: String(p.phone || p.mobile || order.user?.phone || '9876543210').replace(/\D/g, ''),
      email: p.email || order.user?.email || '',
    }
  }

  const billing = parseAddr(order.billingAddress || order.shippingAddress)
  const shipping = parseAddr(order.shippingAddress)

  const subtotal = Number(order.subtotal || 0)
  const discount = Number(order.discount || 0)
  const taxableValue = Math.max(0, subtotal - discount)
  const gstPercent = 5 // Standard textile GST rate
  const isInterstate = shipping.state.toLowerCase() !== 'gujarat' && !shipping.pincode.startsWith('36')
  const cgst = isInterstate ? 0 : (taxableValue * (gstPercent / 2)) / 100
  const sgst = isInterstate ? 0 : (taxableValue * (gstPercent / 2)) / 100
  const igst = isInterstate ? (taxableValue * gstPercent) / 100 : 0
  const shippingFee = Number(order.shippingFee || 0)
  const codFee = Number(order.codFee || 0)
  const grandTotal = Number(order.totalAmount || (taxableValue + cgst + sgst + igst + shippingFee + codFee))

  const invoiceNumber = order.invoiceNo || `AP-2026-${String(order.id).padStart(4, '0')}`
  const invoiceDateFormatted = order.updatedAt ? format(new Date(order.updatedAt), 'dd-MM-yyyy') : format(new Date(), 'dd-MM-yyyy')
  const orderDateFormatted = order.createdAt ? format(new Date(order.createdAt), 'dd-MM-yyyy') : invoiceDateFormatted

  const handlePrint = () => {
    setIsPrinting(true)
    setTimeout(() => {
      window.print()
      setIsPrinting(false)
    }, 150)
  }

  const handleDownloadPdf = () => {
    const id = order?.id || orderId
    if (!id) return
    const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1'}/orders/${id}/invoice/download`
    window.open(downloadUrl, '_blank')
  }

  return (
    <div className="bg-slate-100 min-h-screen py-8 print:py-0 print:bg-white font-sans text-xs text-slate-800">
      {/* Action Toolbar */}
      <div className="max-w-[210mm] mx-auto mb-4 px-4 sm:px-0 flex items-center justify-between print:hidden">
        <Link href="/profile/orders">
          <Button variant="outline" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to My Orders
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
            <Download className="w-4 h-4 mr-1.5" /> Download PDF
          </Button>
          <Button size="sm" onClick={handlePrint} disabled={isPrinting} className="bg-[#9C0B5E] hover:bg-[#80094D] text-white">
            <Printer className="w-4 h-4 mr-1.5" /> Print Invoice
          </Button>
        </div>
      </div>

      {/* A4 Invoice Container (matching Invoice.pdf) */}
      <div
        className="bg-white mx-auto shadow-xl print:shadow-none w-full max-w-[210mm] print:w-[210mm] print:max-w-none p-8 md:p-10 border border-slate-200 print:border-none box-border select-none"
        style={{ minHeight: '297mm', fontFamily: 'Helvetica, Arial, sans-serif' }}
      >
        {/* 1. Header Banner (Solid Burgundy #9C0B5E matching Invoice.pdf) */}
        <div className="bg-[#9C0B5E] text-white -mx-8 -mt-8 md:-mx-10 md:-mt-10 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-wide leading-tight">ANKITA PROCESSORS</h1>
            <p className="text-[10px] leading-tight opacity-95 mt-1">Manufacturers &amp; Processors of Premium Fabrics &amp; Ethnic Wear</p>
            <p className="text-[9.5px] leading-tight opacity-95">Plot No. 5, Behind Vivekanand School, Jetpur, Rajkot, Gujarat - 360370</p>
            <p className="text-[9.5px] leading-tight opacity-95">ankitaprocessors@gmail.com | +91 70436 37284</p>
          </div>
          <div className="text-left sm:text-right">
            <h2 className="text-2xl font-black tracking-wider leading-tight">TAX INVOICE</h2>
            <p className="text-[10px] font-bold leading-tight opacity-95 mt-1">GSTIN: 24ANCPN9292N2ZB</p>
            <p className="text-[10px] font-bold leading-tight opacity-95">PAN: ANCPN9292N</p>
            <p className="text-[8.5px] opacity-80 mt-0.5">ORIGINAL FOR RECIPIENT | Sec 31 CGST Act 2017</p>
          </div>
        </div>

        {/* 2. Metadata Grid (matching Invoice.pdf layout) */}
        <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-[11px] mt-4">
          <div className="space-y-1.5">
            <div className="flex">
              <span className="text-slate-500 w-28 shrink-0 font-medium">Invoice No:</span>
              <span className="font-bold text-slate-900 font-mono">{invoiceNumber}</span>
            </div>
            <div className="flex">
              <span className="text-slate-500 w-28 shrink-0 font-medium">Invoice Date:</span>
              <span className="font-semibold text-slate-900">{invoiceDateFormatted}</span>
            </div>
            <div className="flex">
              <span className="text-slate-500 w-28 shrink-0 font-medium">Order No:</span>
              <span className="font-bold text-slate-900 font-mono">{order.orderNo}</span>
            </div>
            <div className="flex">
              <span className="text-slate-500 w-28 shrink-0 font-medium">Order Date:</span>
              <span className="text-slate-900">{orderDateFormatted}</span>
            </div>
          </div>

          <div className="space-y-1.5 sm:text-right">
            <div className="flex sm:justify-end">
              <span className="text-slate-500 w-28 sm:w-auto sm:mr-3 shrink-0 font-medium">Place of Supply:</span>
              <span className="font-semibold text-slate-900">{isInterstate ? shipping.state : 'Gujarat'} ({isInterstate ? 'Inter-State' : '24'})</span>
            </div>
            <div className="flex sm:justify-end">
              <span className="text-slate-500 w-28 sm:w-auto sm:mr-3 shrink-0 font-medium">Supply Type:</span>
              <span className="font-semibold text-slate-900">{isInterstate ? 'Inter-State (IGST)' : 'Intra-State (CGST+SGST)'}</span>
            </div>
            <div className="flex sm:justify-end">
              <span className="text-slate-500 w-28 sm:w-auto sm:mr-3 shrink-0 font-medium">Payment:</span>
              <span className="font-bold text-slate-900">
                {order.paymentMethod === 'COD' ? 'CASH ON DELIVERY (COD)' : 'PREPAID'}
              </span>
            </div>
            <div className="flex sm:justify-end">
              <span className="text-slate-500 w-28 sm:w-auto sm:mr-3 shrink-0 font-medium">Reverse Charge:</span>
              <span className="text-slate-900">No</span>
            </div>
          </div>
        </div>

        {/* 3. Address Blocks (BILL TO & SHIP TO with Burgundy Headers) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-slate-200">
          <div className="bg-[#F8FAFC] p-3 rounded border border-slate-200">
            <h3 className="text-[10px] font-black text-[#9C0B5E] uppercase tracking-wider mb-1.5">
              BILL TO (BUYER DETAILS)
            </h3>
            <p className="font-bold text-xs text-slate-900 mb-0.5">{billing.name}</p>
            <p className="text-[10.5px] text-slate-700 leading-relaxed">
              {[billing.line1, billing.line2].filter(Boolean).join(', ')}
            </p>
            <p className="text-[10.5px] text-slate-700 leading-relaxed">
              {billing.city}, {billing.state} - {billing.pincode}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              Ph: +91 {billing.phone} {billing.email ? ` | ${billing.email}` : ''}
            </p>
          </div>

          <div className="bg-[#F8FAFC] p-3 rounded border border-slate-200">
            <h3 className="text-[10px] font-black text-[#9C0B5E] uppercase tracking-wider mb-1.5">
              SHIP TO (DELIVERY ADDRESS)
            </h3>
            <p className="font-bold text-xs text-slate-900 mb-0.5">{shipping.name}</p>
            <p className="text-[10.5px] text-slate-700 leading-relaxed">
              {[shipping.line1, shipping.line2].filter(Boolean).join(', ')}
            </p>
            <p className="text-[10.5px] text-slate-700 leading-relaxed">
              {shipping.city}, {shipping.state} - {shipping.pincode}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              Ph: +91 {shipping.phone}
              {order.awbNumber ? ` | Courier: Delhivery Express (AWB: ${order.awbNumber})` : ' | Courier: Delhivery Express'}
            </p>
          </div>
        </div>

        {/* 4. Items Table (matching Invoice.pdf) */}
        <div className="py-4 overflow-x-auto">
          <table className="w-full text-[10.5px] border-collapse">
            <thead>
              <tr className="bg-[#9C0B5E] text-white">
                <th className="py-2 px-2.5 text-left w-8 font-bold">#</th>
                <th className="py-2 px-2.5 text-left font-bold">Description</th>
                <th className="py-2 px-2 text-center w-14 font-bold">HSN</th>
                <th className="py-2 px-2 text-center w-10 font-bold">Qty</th>
                <th className="py-2 px-2.5 text-right w-16 font-bold">Rate</th>
                <th className="py-2 px-2.5 text-right w-18 font-bold">Taxable</th>
                <th className="py-2 px-2 text-center w-12 font-bold">GST%</th>
                <th className="py-2 px-2.5 text-right w-16 font-bold">{isInterstate ? 'IGST' : 'Tax'}</th>
                <th className="py-2 px-2.5 text-right w-20 font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item: any, index: number) => {
                const qty = Number(item.quantity || 1)
                const rate = Number(item.unitPrice || item.rate || 0)
                const itemTaxable = Number(item.taxableValue || qty * rate)
                const itemGst = Number(item.gstRate || gstPercent)
                const itemTax = (itemTaxable * itemGst) / 100
                const itemTotal = Number(item.totalAmount || itemTaxable + itemTax)

                return (
                  <tr key={item.id || index} className={`border-b border-slate-200 ${index % 2 === 1 ? 'bg-slate-50' : 'bg-white'}`}>
                    <td className="py-2 px-2.5 text-slate-500 font-mono">{index + 1}</td>
                    <td className="py-2 px-2.5 font-medium text-slate-900 leading-snug">
                      {item.product?.title || item.product?.name || item.productName || item.itemDescription || 'Ethnic Wear Saree'}
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-slate-600">{item.hsnCode || '5208'}</td>
                    <td className="py-2 px-2 text-center font-medium text-slate-900">{qty}</td>
                    <td className="py-2 px-2.5 text-right text-slate-700">{rate.toFixed(2)}</td>
                    <td className="py-2 px-2.5 text-right font-medium text-slate-900">{itemTaxable.toFixed(2)}</td>
                    <td className="py-2 px-2 text-center text-slate-600">{itemGst}%</td>
                    <td className="py-2 px-2.5 text-right text-slate-700">{itemTax.toFixed(2)}</td>
                    <td className="py-2 px-2.5 text-right font-bold text-slate-900">{itemTotal.toFixed(2)}</td>
                  </tr>
                )
              })}

              {shippingFee > 0 && (
                <tr className="border-b border-slate-200 bg-white">
                  <td className="py-2 px-2.5 text-slate-500 font-mono">{(order.items?.length || 0) + 1}</td>
                  <td className="py-2 px-2.5 text-slate-800">Shipping &amp; Logistics (Delhivery Express)</td>
                  <td className="py-2 px-2 text-center font-mono text-slate-600">9968</td>
                  <td className="py-2 px-2 text-center">1</td>
                  <td className="py-2 px-2.5 text-right text-slate-700">{shippingFee.toFixed(2)}</td>
                  <td className="py-2 px-2.5 text-right text-slate-900">{shippingFee.toFixed(2)}</td>
                  <td className="py-2 px-2 text-center text-slate-600">0%</td>
                  <td className="py-2 px-2.5 text-right text-slate-700">0.00</td>
                  <td className="py-2 px-2.5 text-right font-bold text-slate-900">{shippingFee.toFixed(2)}</td>
                </tr>
              )}

              {codFee > 0 && (
                <tr className="border-b border-slate-200 bg-white">
                  <td className="py-2 px-2.5 text-slate-500 font-mono">{(order.items?.length || 0) + 2}</td>
                  <td className="py-2 px-2.5 text-slate-800">Cash on Delivery (COD) Collection Fee</td>
                  <td className="py-2 px-2 text-center font-mono text-slate-600">9968</td>
                  <td className="py-2 px-2 text-center">1</td>
                  <td className="py-2 px-2.5 text-right text-slate-700">{codFee.toFixed(2)}</td>
                  <td className="py-2 px-2.5 text-right text-slate-900">{codFee.toFixed(2)}</td>
                  <td className="py-2 px-2 text-center text-slate-600">0%</td>
                  <td className="py-2 px-2.5 text-right text-slate-700">0.00</td>
                  <td className="py-2 px-2.5 text-right font-bold text-slate-900">{codFee.toFixed(2)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Summary & Bottom Breakdown (matching Invoice.pdf) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 py-2 mb-4">
          {/* Left Column: Amount in words, Bank Details & Declaration (7 cols) */}
          <div className="sm:col-span-7 space-y-3">
            <div className="bg-[#F8FAFC] border border-slate-200 rounded p-3">
              <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                Amount in words:
              </span>
              <p className="font-bold text-xs text-slate-900 italic">
                {numberToWords(grandTotal)}
              </p>
            </div>

            <div className="space-y-1 text-[10.5px] text-slate-600 pt-1">
              <p className="font-bold text-slate-900 text-xs">Bank Details</p>
              <p className="text-slate-800">AXIS BANK, Kanakiya Plot, Jetpur</p>
              <p className="font-mono text-slate-800">A/c: 924020025533052 | IFSC: UTIB0001468</p>
            </div>

            <div className="space-y-0.5 text-[10px] text-slate-500 pt-1">
              <p className="font-bold text-slate-800">Declaration</p>
              <p className="leading-snug">
                We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct. Goods once sold are accepted back only as per our return policy.
              </p>
            </div>
          </div>

          {/* Right Column: Financial Totals + Solid Grand Total Banner (5 cols) */}
          <div className="sm:col-span-5 space-y-1.5 text-[11px]">
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">Subtotal:</span>
              <span className="font-semibold text-slate-900">INR {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">Taxable Value:</span>
              <span className="font-semibold text-slate-900">INR {taxableValue.toFixed(2)}</span>
            </div>
            {isInterstate ? (
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">IGST ({gstPercent}%):</span>
                <span className="text-slate-900">INR {igst.toFixed(2)}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">CGST ({(gstPercent / 2)}%):</span>
                  <span className="text-slate-900">INR {cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">SGST ({(gstPercent / 2)}%):</span>
                  <span className="text-slate-900">INR {sgst.toFixed(2)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">Shipping:</span>
              <span className="text-slate-900">INR {shippingFee.toFixed(2)}</span>
            </div>
            {codFee > 0 && (
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">COD Fee:</span>
                <span className="text-slate-900">INR {codFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">Round Off:</span>
              <span className="text-slate-900">INR 0.00</span>
            </div>

            {/* Solid Burgundy Grand Total Banner */}
            <div className="bg-[#9C0B5E] text-white p-3 rounded flex justify-between items-center mt-2 shadow-sm">
              <span className="font-black text-xs tracking-wider uppercase">GRAND TOTAL</span>
              <span className="font-black text-sm">INR {grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* 6. Signatory Section */}
        <div className="flex justify-between items-end pt-6 border-t border-slate-200 mt-6">
          <div className="text-[9.5px] text-slate-400">
            <p>E. &amp; O.E. &bull; Jetpur / Rajkot Jurisdiction</p>
            <p className="mt-0.5">Computer-generated GST tax invoice under Sec 31 CGST Act 2017</p>
          </div>

          <div className="text-right space-y-1">
            <p className="font-bold text-xs text-[#9C0B5E]">For Ankita Processors</p>
            <div className="py-2 text-slate-400 italic text-[11px] font-serif">
              Ankita Processors
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Authorised Signatory</p>
          </div>
        </div>

        {/* Centered Footer Note */}
        <div className="text-center text-[9px] text-slate-400 pt-6 mt-4 border-t border-slate-100">
          This is a computer-generated invoice.
        </div>
      </div>
    </div>
  )
}
