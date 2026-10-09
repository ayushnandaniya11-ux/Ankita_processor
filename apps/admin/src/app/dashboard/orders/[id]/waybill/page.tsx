'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { fetcher } from '@/lib/api'
import { Button } from '@ankita/ui'
import { Printer, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

export default function WaybillPage() {
  const params = useParams<{ id: string }>()
  const orderId = params?.id

  const { data, error, isLoading } = useSWR(orderId ? `/admin/orders/${orderId}` : null, fetcher)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data?.order) {
    return (
      <div className="flex h-screen items-center justify-center text-destructive">
        Failed to load order data.
      </div>
    )
  }

  const order = data.order
  const billing = typeof order.billingAddress === 'string' ? JSON.parse(order.billingAddress) : order.billingAddress || {}
  const shipping = typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress || {}
  
  const subtotal = Number(order.subtotal || 0)
  const discount = Number(order.discount || 0)
  const taxableValue = subtotal - discount
  const gstPercent = 5 // Example GST
  const cgst = (taxableValue * (gstPercent / 2)) / 100
  const sgst = (taxableValue * (gstPercent / 2)) / 100
  const shippingFee = Number(order.shippingFee || 0)
  const grandTotal = taxableValue + cgst + sgst + shippingFee

  const ewayBillNo = order.awbNumber ? `EWB-${order.awbNumber}` : 'N/A'

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8 print:py-0 print:bg-white font-sans text-sm">
      <div className="max-w-[210mm] mx-auto mb-4 flex justify-end print:hidden">
        <Button onClick={handlePrint} disabled={!order.awbNumber}>
          <Printer className="w-4 h-4 mr-2" /> Print Waybill
        </Button>
      </div>

      <div className="bg-white mx-auto shadow-lg print:shadow-none relative pb-16 w-full max-w-full md:max-w-[210mm] print:w-[210mm] print:max-w-none overflow-hidden" style={{ minHeight: '297mm' }}>
        
        {/* Header */}
        <div className="bg-[#9b0c51] text-white px-4 md:px-8 py-6 flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-1">Ankita Processors</h1>
            <p className="text-xs opacity-90">Plot 5, Near Vivekanand School, Jetpur, Rajkot, Gujarat - 360370</p>
            <p className="text-xs opacity-90 mt-0.5">GSTIN: 24ANCPN9292N2ZB | Ph: +91 7043637284</p>
          </div>
          <div className="w-full md:w-1/2 text-center md:text-right">
            <h2 className="text-2xl font-bold tracking-widest mb-1">DELIVERY WAYBILL</h2>
            <p className="text-xs opacity-90 font-medium tracking-wide">E-Way Bill No: {ewayBillNo}</p>
            <p className="text-xs opacity-90 tracking-wide mt-0.5">Mode: Road Transport</p>
            <p className="text-xs opacity-90 font-bold tracking-wide mt-0.5 text-yellow-300">Logistics Partner: {order.courier || 'N/A'}</p>
          </div>
        </div>

        <div className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="w-full md:w-2/3 flex flex-col sm:flex-row border rounded-md p-4 bg-gray-50/50 justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Waybill Date</p>
                <p className="font-bold">{order.updatedAt ? format(new Date(order.updatedAt), 'dd MMM yyyy, p') : '-'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Invoice Ref No.</p>
                <p className="font-bold">{order.invoiceNo || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Order Date</p>
                <p className="font-bold">{order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy') : '-'}</p>
              </div>
            </div>
            <div className="w-full md:w-1/3 border rounded-md border-dashed border-[#9b0c51]/30 p-4 flex flex-col items-center justify-center bg-gray-50/50">
              <p className="text-[10px] text-[#9b0c51] mb-2 tracking-widest font-bold uppercase">AWB Barcode</p>
              <div className="h-12 w-full max-w-[200px]">
                {order.awbNumber ? (
                  <img
                    src={`https://barcode.tec-it.com/barcode.ashx?data=${order.awbNumber}&code=Code128&dpi=96&dataseparator=`}
                    alt="Barcode"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-xs">
                    AWB Not Generated
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-100 px-3 py-2 border-l-4 border-[#9b0c51] mb-4">
            <h3 className="font-bold text-xs tracking-widest">CONSIGNOR & CONSIGNEE DETAILS</h3>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="w-full md:w-1/2 border rounded-md p-5">
              <p className="text-xs font-bold text-[#9b0c51] mb-3 uppercase tracking-wider">Dispatch From (Consignor)</p>
              <p className="font-bold mb-1 text-base">Ankita Processors</p>
              <p className="text-sm text-gray-600">Plot 5, Near Vivekanand School, Jetpur,</p>
              <p className="text-sm text-gray-600 mb-2">Rajkot, Gujarat - 360370</p>
              <p className="text-sm text-gray-800"><span className="font-bold">GSTIN:</span> 24ANCPN9292N2ZB</p>
            </div>
            <div className="w-full md:w-1/2 border rounded-md p-5">
              <p className="text-xs font-bold text-[#9b0c51] mb-3 uppercase tracking-wider">Deliver To (Consignee)</p>
              <p className="font-bold mb-1 text-base">{order.user?.firstName} {order.user?.lastName}</p>
              <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed mb-2">{shipping}</p>
            </div>
          </div>

          <div className="bg-gray-100 px-3 py-2 border-l-4 border-[#9b0c51] mb-4">
            <h3 className="font-bold text-xs tracking-widest uppercase">Consignment Item Particulars</h3>
          </div>

          <div className="overflow-x-auto w-full mb-8">
            <table className="w-full text-sm text-left min-w-[700px]">
              <thead>
                <tr className="bg-[#9b0c51] text-white uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 w-8">#</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 w-16 text-center">Qty</th>
                  <th className="py-2.5 px-3 w-28 text-right">Taxable Value</th>
                  <th className="py-2.5 px-3 w-20 text-center">Tax Rate</th>
                  <th className="py-2.5 px-3 w-32 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item: any, i: number) => {
                  const qty = Number(item.quantity)
                  const rate = Number(item.rate)
                  const itemTotal = qty * rate
                  const itemTax = (itemTotal * gstPercent) / 100
                  return (
                    <tr key={item.id || i} className="border-b">
                      <td className="py-3 px-3 text-gray-500">{i + 1}</td>
                      <td className="py-3 px-3 font-medium">{item.productName}</td>
                      <td className="py-3 px-3 text-center">{qty}</td>
                      <td className="py-3 px-3 text-right text-gray-600">{itemTotal.toFixed(2)}</td>
                      <td className="py-3 px-3 text-center text-gray-600">{gstPercent}%</td>
                      <td className="py-3 px-3 text-right">{(itemTotal + itemTax).toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2 border rounded-md p-5 flex flex-col justify-between bg-gray-50/30">
              <div>
                <p className="text-xs text-gray-500 font-bold tracking-widest uppercase mb-3">Declaration & Instructions</p>
                <p className="text-sm text-gray-700 leading-relaxed">Certified that the particulars given above are true and correct. Goods are being transported for delivery against Invoice {order.invoiceNo || 'N/A'}.<br />Carry this document during transit.</p>
              </div>
              <div className="border-t border-dashed mt-6 pt-4 flex justify-between items-center">
                <p className="text-xs font-bold text-gray-600 tracking-wider">ORDER NO: {order.orderNo}</p>
                <p className="text-xs font-bold text-green-700 tracking-wider">STATUS: {order.status.replace('_', ' ')}</p>
              </div>
            </div>

            <div className="w-full md:w-1/2">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2.5 text-gray-600">Total Taxable Value</td>
                    <td className="py-2.5 text-right font-bold">Rs. {taxableValue.toFixed(2)}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2.5 text-gray-600">CGST Amount</td>
                    <td className="py-2.5 text-right font-bold">Rs. {cgst.toFixed(2)}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2.5 text-gray-600">SGST Amount</td>
                    <td className="py-2.5 text-right font-bold">Rs. {sgst.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-gray-600">Freight / Shipping</td>
                    <td className="py-2.5 text-right font-bold text-green-600">{shippingFee === 0 ? 'FREE' : `Rs. ${shippingFee.toFixed(2)}`}</td>
                  </tr>
                  <tr className="bg-[#9b0c51] text-white">
                    <td className="py-3 px-3 font-bold uppercase tracking-wider text-xs">Consignment Value</td>
                    <td className="py-3 px-3 text-right font-bold">Rs. {grandTotal.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-0 w-full text-center px-8">
          <p className="text-[10px] text-gray-400">
            This Delivery Waybill is generated in accordance with GST Rules for goods transit. | System Generated Document.<br />
            Plot 5, Near Vivekanand School, Jetpur, Rajkot, Gujarat - 360370 GSTIN: 24ANCPN9292N2ZB | Ph: +91 7043637284
          </p>
        </div>
      </div>
    </div>
  )
}
