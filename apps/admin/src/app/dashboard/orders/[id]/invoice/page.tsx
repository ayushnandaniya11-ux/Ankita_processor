'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { fetcher } from '@/lib/api'
import { Button } from '@ankita/ui'
import { Printer, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

export default function InvoicePage() {
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

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8 print:py-0 print:bg-white font-sans text-sm">
      <div className="max-w-[210mm] mx-auto mb-4 flex justify-end print:hidden">
        <Button onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" /> Print Invoice
        </Button>
      </div>

      <div className="bg-white mx-auto shadow-lg print:shadow-none w-full max-w-full md:max-w-[210mm] print:w-[210mm] print:max-w-none overflow-hidden" style={{ minHeight: '297mm' }}>
        
        {/* Header */}
        <div className="bg-[#9b0c51] text-white p-4 md:p-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8 text-center md:text-left">
            <div className="bg-white p-1 rounded-xl shrink-0 w-24 h-24 md:w-28 md:h-28 flex items-center justify-center shadow-lg border-2 border-[#9b0c51]">
              <span className="text-[#9b0c51] font-heading font-bold text-5xl">AP</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 md:mb-3 tracking-tight">Ankita Processors</h1>
              <p className="text-xs md:text-sm opacity-90">Plot 5, Near Vivekanand School, Jetpur,</p>
              <p className="text-xs md:text-sm opacity-90">Rajkot, Gujarat - 360370</p>
              <p className="text-xs md:text-sm opacity-90 mt-1">Email: ankitaprocessor@gmail.com | Ph: +91 7043637284</p>
            </div>
          </div>
          <div className="text-center md:text-right mt-4 md:mt-0">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">TAX INVOICE</h2>
            <p className="text-xs md:text-sm">GSTIN: 24ANCPN9292N2ZB</p>
            <p className="text-xs md:text-sm">PAN: ANCPN9292N</p>
          </div>
        </div>

        <div className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row justify-between mb-8 text-sm gap-4">
            <table className="w-full md:w-1/2">
              <tbody>
                <tr><td className="text-gray-500 py-1 w-24 md:w-32">Invoice No.</td><td className="font-bold">{order.invoiceNo || 'PENDING'}</td></tr>
                <tr><td className="text-gray-500 py-1">Invoice Date</td><td className="font-bold">{order.updatedAt ? format(new Date(order.updatedAt), 'dd MMM yyyy') : '-'}</td></tr>
                <tr><td className="text-gray-500 py-1">Order No.</td><td className="font-bold">{order.orderNo}</td></tr>
                <tr><td className="text-gray-500 py-1">Order Date</td><td className="font-bold">{order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy') : '-'}</td></tr>
              </tbody>
            </table>
            <table className="w-full md:w-1/2">
              <tbody>
                <tr><td className="text-gray-500 py-1 w-32">Payment</td><td className="font-bold">{order.paymentMethod}</td></tr>
                <tr><td className="text-gray-500 py-1">Status</td><td className="font-bold">{order.status}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 bg-gray-50 p-4 rounded-md">
              <h3 className="text-xs font-bold text-[#8b1538] mb-2 uppercase">Bill To</h3>
              <p className="font-bold text-base mb-1">{order.user?.firstName} {order.user?.lastName}</p>
              <p className="text-gray-600 leading-tight whitespace-pre-line">{billing}</p>
            </div>
            <div className="flex-1 bg-gray-50 p-4 rounded-md">
              <h3 className="text-xs font-bold text-[#8b1538] mb-2 uppercase">Ship To</h3>
              <p className="font-bold text-base mb-1">{order.user?.firstName} {order.user?.lastName}</p>
              <p className="text-gray-600 leading-tight whitespace-pre-line">{shipping}</p>
            </div>
          </div>

          <div className="overflow-x-auto w-full mb-8">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="bg-[#9b0c51] text-white">
                  <th className="py-2 px-2 text-left w-8">#</th>
                  <th className="py-2 px-2 text-left">Description</th>
                  <th className="py-2 px-2 text-right w-12">Qty</th>
                  <th className="py-2 px-2 text-right w-24">Rate</th>
                  <th className="py-2 px-2 text-right w-24">Taxable</th>
                  <th className="py-2 px-2 text-right w-16">GST%</th>
                  <th className="py-2 px-2 text-right w-20">Tax</th>
                  <th className="py-2 px-2 text-right w-24">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item: any, index: number) => {
                  const qty = Number(item.quantity)
                  const rate = Number(item.rate)
                  const itemTotal = qty * rate
                  const itemTax = (itemTotal * gstPercent) / 100
                  return (
                    <tr key={item.id || index} className="border-b border-gray-100">
                      <td className="py-3 px-2">{index + 1}</td>
                      <td className="py-3 px-2">{item.productName}</td>
                      <td className="py-3 px-2 text-right">{qty}</td>
                      <td className="py-3 px-2 text-right">{rate.toFixed(2)}</td>
                      <td className="py-3 px-2 text-right">{itemTotal.toFixed(2)}</td>
                      <td className="py-3 px-2 text-right">{gstPercent}%</td>
                      <td className="py-3 px-2 text-right">{itemTax.toFixed(2)}</td>
                      <td className="py-3 px-2 text-right">{(itemTotal + itemTax).toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-8">
            <div className="w-full md:w-1/2 md:pr-8">
              <div className="flex items-center gap-4 mt-8">
                <div className="p-4 border rounded-md">
                  <p className="text-[10px] text-gray-500 mb-2 text-center uppercase tracking-widest">Scan to verify</p>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-50 flex items-center justify-center">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`Invoice:${order.invoiceNo || order.orderNo}|Total:${grandTotal}`)}`} 
                        alt="QR Code" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-1/2">
              <table className="w-full">
                <tbody>
                  <tr><td className="py-1 text-gray-600">Subtotal</td><td className="py-1 text-right font-bold">Rs. {subtotal.toFixed(2)}</td></tr>
                  {discount > 0 && <tr><td className="py-1 text-gray-600">Discount</td><td className="py-1 text-right font-bold text-red-600">- Rs. {discount.toFixed(2)}</td></tr>}
                  <tr><td className="py-1 text-gray-600">Taxable Value</td><td className="py-1 text-right font-bold">Rs. {taxableValue.toFixed(2)}</td></tr>
                  <tr><td className="py-1 text-gray-600">CGST ({(gstPercent/2)}%)</td><td className="py-1 text-right font-bold">Rs. {cgst.toFixed(2)}</td></tr>
                  <tr><td className="py-1 text-gray-600">SGST ({(gstPercent/2)}%)</td><td className="py-1 text-right font-bold">Rs. {sgst.toFixed(2)}</td></tr>
                  <tr><td className="py-1 text-gray-600">Shipping</td><td className="py-1 text-right font-bold text-green-600">{shippingFee === 0 ? 'FREE' : `Rs. ${shippingFee.toFixed(2)}`}</td></tr>
                  <tr className="bg-[#9b0c51] text-white">
                    <td className="py-2 px-2 font-bold uppercase">Grand Total</td>
                    <td className="py-2 px-2 text-right font-bold">Rs. {grandTotal.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-t pt-4 border-gray-200 mt-16 gap-8">
            <div className="text-xs text-gray-600 w-full md:w-2/3 md:pr-8">
              <p className="font-bold text-black mb-1">Bank Details:</p>
              <p>Axis Bank, Kanakiya Plot, Jetpur</p>
              <p className="mb-4">A/c: <span className="font-bold text-black">924020025533052</span> | IFSC: <span className="font-bold text-black">UTIB0001468</span></p>
              
              <p className="font-bold text-black mb-1 inline">Declaration:</p>
              <span className="ml-1">We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</span>
            </div>
            
            <div className="text-left md:text-right w-full md:w-1/3">
              <p className="font-bold text-sm mb-12">For Ankita Processors</p>
              <p className="text-xs text-gray-600">Authorised Signatory</p>
            </div>
          </div>
          
          <div className="text-center mt-8 text-[10px] text-gray-400">
            This is a computer-generated invoice and does not require a physical signature.
          </div>
        </div>
      </div>
    </div>
  )
}
