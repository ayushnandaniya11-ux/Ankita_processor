'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@ankita/ui'
import { Printer } from 'lucide-react'

// Dummy data mirroring what would come from the database
const MOCK_ORDER_DATA = {
  order_no: 'AP/ORD/2026-27/000001',
  order_date: '26 Jul 2026',
  invoice_no: 'AP/INV/2026-27/000001',
  invoice_date: '26 Jul 2026',
  place_of_supply: '24 - Gujarat',
  supply_type: 'Intra-State',
  payment: 'UPI — PENDING',
  reverse_charge: 'No',
  billing_address: {
    name: 'Priya Sharma',
    address: '12 Shanti Residency, Satellite Road, Ahmedabad, Gujarat 380015, India',
    phone: ''
  },
  shipping_address: {
    name: 'Priya Sharma',
    address: '12 Shanti Residency, Satellite Road, Ahmedabad, Gujarat 380015, India',
    phone: '+919825012345'
  },
  items: [
    { id: 1, description: 'Banarasi Brocade Dupatta — Antique Gold', hsn: '6214', qty: 2, rate: 2799.00, taxable: 5106.82, gstPercent: 5, taxAmount: 255.34, total: 5362.16 },
    { id: 2, description: 'Bandhani Silk Saree with Mirror Work', hsn: '5007', qty: 1, rate: 5799.00, taxable: 5290.18, gstPercent: 5, taxAmount: 264.51, total: 5554.69 },
  ],
  subtotal: 11397.00,
  discount: 1000.00,
  taxable_value: 10397.00,
  cgst: 259.92,
  sgst: 259.93,
  shipping: 0,
  round_off: 0.15,
  grand_total: 10917.00,
  amount_in_words: 'Ten Thousand Nine Hundred Seventeen Rupees Only',
  gstin: '24ANCPN9292N2ZB',
  pan: 'ANCPN9292N',
}

function getOrderData(id: string) {
  const base = {
    ...MOCK_ORDER_DATA,
    order_no: id,
    invoice_no: id.replace('ORD', 'INV'),
  }

  if (id === 'ORD-7394') {
    return {
      ...base,
      billing_address: { ...base.billing_address, name: 'Anita Singh' },
      shipping_address: { ...base.shipping_address, name: 'Anita Singh' },
      items: [
        { id: 1, description: 'Cotton Printed Kurti', hsn: '6214', qty: 1, rate: 2000.00, taxable: 2000.00, gstPercent: 5, taxAmount: 100.00, total: 2100.00 },
      ],
      subtotal: 2100.00,
      discount: 0.00,
      taxable_value: 2000.00,
      cgst: 50.00,
      sgst: 50.00,
      shipping: 0,
      round_off: 0.00,
      grand_total: 2100.00,
      amount_in_words: 'Two Thousand One Hundred Rupees Only',
    }
  }

  // Default ORD-7393
  return {
    ...base,
    billing_address: { ...base.billing_address, name: 'Riya Gupta' },
    shipping_address: { ...base.shipping_address, name: 'Riya Gupta' },
    items: [
      { id: 1, description: 'Banarasi Brocade Dupatta', hsn: '6214', qty: 2, rate: 2000.00, taxable: 4000.00, gstPercent: 5, taxAmount: 200.00, total: 4200.00 },
      { id: 2, description: 'Designer Scarf', hsn: '5007', qty: 1, rate: 1142.86, taxable: 1142.86, gstPercent: 5, taxAmount: 57.14, total: 1200.00 },
    ],
    subtotal: 5400.00,
    discount: 0.00,
    taxable_value: 5142.86,
    cgst: 128.57,
    sgst: 128.57,
    shipping: 0,
    round_off: 0.00,
    grand_total: 5400.00,
    amount_in_words: 'Five Thousand Four Hundred Rupees Only',
  }
}

export default function InvoicePage() {
  const params = useParams<{ id: string }>()
  
  // Fetch dynamically based on ID
  const orderId = params?.id || 'ORD-7393'
  const order = getOrderData(orderId)

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

      {/* A4 Size Paper Container */}
      <div className="bg-white mx-auto shadow-lg print:shadow-none" style={{ width: '210mm', minHeight: '297mm' }}>
        
        {/* Header */}
        <div className="bg-[#9b0c51] text-white p-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">Ankita Processors</h1>
            <p className="text-sm">Plot 5, Near Vivekanand School, Jetpur,</p>
            <p className="text-sm">Rajkot, Gujarat - 360370</p>
            <p className="text-sm">Email: ankitaprocessor@gmail.com | Ph: +91 7043637284</p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold mb-2">TAX INVOICE</h2>
            <p className="text-sm">GSTIN: {order.gstin}</p>
            <p className="text-sm">PAN: {order.pan}</p>
          </div>
        </div>

        <div className="p-8">
          {/* Info Section */}
          <div className="flex justify-between mb-8 text-sm">
            <table className="w-1/2">
              <tbody>
                <tr><td className="text-gray-500 py-1 w-32">Invoice No.</td><td className="font-bold">{order.invoice_no}</td></tr>
                <tr><td className="text-gray-500 py-1">Invoice Date</td><td className="font-bold">{order.invoice_date}</td></tr>
                <tr><td className="text-gray-500 py-1">Order No.</td><td className="font-bold">{order.order_no}</td></tr>
                <tr><td className="text-gray-500 py-1">Order Date</td><td className="font-bold">{order.order_date}</td></tr>
              </tbody>
            </table>
            <table className="w-1/2">
              <tbody>
                <tr><td className="text-gray-500 py-1 w-32">Place of Supply</td><td className="font-bold">{order.place_of_supply}</td></tr>
                <tr><td className="text-gray-500 py-1">Supply Type</td><td className="font-bold">{order.supply_type}</td></tr>
                <tr><td className="text-gray-500 py-1">Payment</td><td className="font-bold">{order.payment}</td></tr>
                <tr><td className="text-gray-500 py-1">Reverse Charge</td><td className="font-bold">{order.reverse_charge}</td></tr>
              </tbody>
            </table>
          </div>

          {/* Addresses */}
          <div className="flex gap-4 mb-8">
            <div className="flex-1 bg-gray-50 p-4 rounded-md">
              <h3 className="text-xs font-bold text-[#8b1538] mb-2 uppercase">Bill To</h3>
              <p className="font-bold text-base mb-1">{order.billing_address.name}</p>
              <p className="text-gray-600 leading-tight">{order.billing_address.address}</p>
              {order.billing_address.phone && <p className="text-gray-600 mt-1">Ph: {order.billing_address.phone}</p>}
            </div>
            <div className="flex-1 bg-gray-50 p-4 rounded-md">
              <h3 className="text-xs font-bold text-[#8b1538] mb-2 uppercase">Ship To</h3>
              <p className="font-bold text-base mb-1">{order.shipping_address.name}</p>
              <p className="text-gray-600 leading-tight">{order.shipping_address.address}</p>
              {order.shipping_address.phone && <p className="text-gray-600 mt-1">Ph: {order.shipping_address.phone}</p>}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-8 text-sm">
            <thead>
              <tr className="bg-[#9b0c51] text-white">
                <th className="py-2 px-2 text-left w-8">#</th>
                <th className="py-2 px-2 text-left">Description</th>
                <th className="py-2 px-2 text-left w-16">HSN</th>
                <th className="py-2 px-2 text-right w-12">Qty</th>
                <th className="py-2 px-2 text-right w-24">Rate</th>
                <th className="py-2 px-2 text-right w-24">Taxable</th>
                <th className="py-2 px-2 text-right w-16">GST%</th>
                <th className="py-2 px-2 text-right w-20">Tax</th>
                <th className="py-2 px-2 text-right w-24">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 px-2">{index + 1}</td>
                  <td className="py-3 px-2">{item.description}</td>
                  <td className="py-3 px-2">{item.hsn}</td>
                  <td className="py-3 px-2 text-right">{item.qty}</td>
                  <td className="py-3 px-2 text-right">{item.rate.toFixed(2)}</td>
                  <td className="py-3 px-2 text-right">{item.taxable.toFixed(2)}</td>
                  <td className="py-3 px-2 text-right">{item.gstPercent}%</td>
                  <td className="py-3 px-2 text-right">{item.taxAmount.toFixed(2)}</td>
                  <td className="py-3 px-2 text-right">{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Section */}
          <div className="flex justify-between items-start mb-16">
            <div className="w-1/2 pr-8">
              <div className="bg-gray-50 p-4 border-l-4 border-[#9b0c51] mb-8">
                <p className="text-xs font-bold text-[#9b0c51] mb-1 uppercase">Amount in words</p>
                <p className="font-bold">{order.amount_in_words}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="p-4 border rounded-md">
                  <p className="text-[10px] text-gray-500 mb-2 text-center uppercase tracking-widest">Scan to verify</p>
                  <div className="flex items-center gap-4">
                    {/* Real QR code generated dynamically */}
                    <div className="w-16 h-16 bg-gray-50 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`Invoice:${order.invoice_no}|Total:${order.grand_total}`)}`} 
                        alt="QR Code" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    {/* Fake Barcode */}
                    <div className="flex flex-col items-center">
                      <div className="flex h-12 items-end">
                        {[...Array(30)].map((_, i) => (
                          <div key={i} className="bg-black" style={{ width: Math.random() > 0.5 ? '1px' : '3px', height: '100%', marginRight: '2px' }} />
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1 tracking-widest">{order.order_no}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-1/2">
              <table className="w-full">
                <tbody>
                  <tr><td className="py-1 text-gray-600">Subtotal</td><td className="py-1 text-right font-bold">Rs. {order.subtotal.toFixed(2)}</td></tr>
                  <tr><td className="py-1 text-gray-600">Discount</td><td className="py-1 text-right font-bold text-red-600">- Rs. {order.discount.toFixed(2)}</td></tr>
                  <tr><td className="py-1 text-gray-600">Taxable Value</td><td className="py-1 text-right font-bold">Rs. {order.taxable_value.toFixed(2)}</td></tr>
                  <tr><td className="py-1 text-gray-600">CGST (2.5%)</td><td className="py-1 text-right font-bold">Rs. {order.cgst.toFixed(2)}</td></tr>
                  <tr><td className="py-1 text-gray-600">SGST (2.5%)</td><td className="py-1 text-right font-bold">Rs. {order.sgst.toFixed(2)}</td></tr>
                  <tr><td className="py-1 text-gray-600">Shipping</td><td className="py-1 text-right font-bold text-green-600">{order.shipping === 0 ? 'FREE' : `Rs. ${order.shipping.toFixed(2)}`}</td></tr>
                  <tr><td className="py-1 text-gray-600">Round Off</td><td className="py-1 text-right font-bold">Rs. {order.round_off.toFixed(2)}</td></tr>
                  <tr className="bg-[#9b0c51] text-white">
                    <td className="py-2 px-2 font-bold uppercase">Grand Total</td>
                    <td className="py-2 px-2 text-right font-bold">Rs. {order.grand_total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Details */}
          <div className="flex justify-between items-end border-t pt-4 border-gray-200 mt-16">
            <div className="text-xs text-gray-600 w-2/3 pr-8">
              <p className="font-bold text-black mb-1">Bank Details:</p>
              <p>Axis Bank, Kanakiya Plot, Jetpur</p>
              <p className="mb-4">A/c: <span className="font-bold text-black">924020025533052</span> | IFSC: <span className="font-bold text-black">UTIB0001468</span></p>
              
              <p className="font-bold text-black mb-1 inline">Declaration:</p>
              <span className="ml-1">We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</span>
            </div>
            
            <div className="text-right w-1/3">
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
