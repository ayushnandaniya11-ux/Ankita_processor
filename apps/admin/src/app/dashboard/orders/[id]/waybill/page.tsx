'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@ankita/ui'
import { Printer } from 'lucide-react'

const MOCK_ORDER_DATA = {
  order_no: 'AP/ORD/2026-27/000001',
  order_date: '26 Jul 2026',
  invoice_no: 'AP/INV/2026-27/000001',
  invoice_date: '26 Jul 2026',
  waybill_date: '26 Jul 2026, 10:30 AM',
  eway_bill_no: '2410 0928 4712',
  awb_number: '241009284712',
  billing_address: {
    name: 'Priya Sharma',
    address: '12 Shanti Residency, Satellite Road,\nAhmedabad, Gujarat - 380015, India',
    phone: ''
  },
  shipping_address: {
    name: 'Priya Sharma',
    address: '12 Shanti Residency, Satellite Road,\nAhmedabad, Gujarat - 380015, India',
    phone: '+91 9825012345'
  },
  items: [
    { id: 1, description: 'Banarasi Brocade Dupatta — Antique Gold', hsn: '6214', qty: 2, taxable: 5106.82, gstPercent: 5, total: 5362.16 },
    { id: 2, description: 'Bandhani Silk Saree with Mirror Work', hsn: '5007', qty: 1, taxable: 5290.18, gstPercent: 5, total: 5554.69 },
  ],
  taxable_value: 10397.00,
  cgst: 259.92,
  sgst: 259.93,
  shipping: 0,
  grand_total: 10917.00,
}

function getOrderData(id: string) {
  const base = {
    ...MOCK_ORDER_DATA,
    order_no: id,
    invoice_no: id.replace('ORD', 'INV'),
    awb_number: `893${id.replace('ORD-', '')}4712`,
    eway_bill_no: `8930 ${id.replace('ORD-', '')} 4712`,
  }

  if (id === 'ORD-7394') {
    return {
      ...base,
      billing_address: { ...base.billing_address, name: 'Anita Singh' },
      shipping_address: { ...base.shipping_address, name: 'Anita Singh' },
      items: [
        { id: 1, description: 'Cotton Printed Kurti', hsn: '6214', qty: 1, taxable: 2000.00, gstPercent: 5, total: 2100.00 },
      ],
      taxable_value: 2000.00,
      cgst: 50.00,
      sgst: 50.00,
      grand_total: 2100.00,
    }
  }

  return {
    ...base,
    billing_address: { ...base.billing_address, name: 'Riya Gupta' },
    shipping_address: { ...base.shipping_address, name: 'Riya Gupta' },
    items: [
      { id: 1, description: 'Banarasi Brocade Dupatta', hsn: '6214', qty: 2, taxable: 4000.00, gstPercent: 5, total: 4200.00 },
      { id: 2, description: 'Designer Scarf', hsn: '5007', qty: 1, taxable: 1142.86, gstPercent: 5, total: 1200.00 },
    ],
    taxable_value: 5142.86,
    cgst: 128.57,
    sgst: 128.57,
    grand_total: 5400.00,
  }
}

export default function WaybillPage() {
  const params = useParams<{ id: string }>()
  const orderId = params?.id || 'ORD-7393'
  const order = getOrderData(orderId)

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8 print:py-0 print:bg-white font-sans text-sm">
      <div className="max-w-[210mm] mx-auto mb-4 flex justify-end print:hidden">
        <Button onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" /> Print Waybill
        </Button>
      </div>

      <div className="bg-white mx-auto shadow-lg print:shadow-none relative pb-16" style={{ width: '210mm', minHeight: '297mm' }}>
        
        {/* Header */}
        <div className="bg-[#9b0c51] text-white px-8 py-6 flex justify-between items-start">
          <div className="w-1/2">
            <h1 className="text-3xl font-bold mb-1">Ankita Processors</h1>
            <p className="text-xs opacity-90">Plot 5, Near Vivekanand School, Jetpur, Rajkot, Gujarat - 360370</p>
            <p className="text-xs opacity-90 mt-0.5">GSTIN: 24ANCPN9292N2ZB | Ph: +91 7043637284</p>
          </div>
          <div className="w-1/2 text-right">
            <h2 className="text-2xl font-bold tracking-widest mb-1">DELIVERY WAYBILL</h2>
            <p className="text-xs opacity-90 font-medium tracking-wide">E-Way Bill No: {order.eway_bill_no}</p>
            <p className="text-xs opacity-90 tracking-wide mt-0.5">Mode: Road Transport</p>
            <p className="text-xs opacity-90 font-bold tracking-wide mt-0.5 text-yellow-300">Logistics Partner: Delhivery Direct</p>
          </div>
        </div>

        <div className="p-8">
          
          <div className="flex gap-4 mb-6">
            <div className="w-2/3 flex border rounded-md p-4 bg-gray-50/50 justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Waybill Date</p>
                <p className="font-bold">{order.waybill_date}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Invoice Ref No.</p>
                <p className="font-bold">{order.invoice_no}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Invoice Date</p>
                <p className="font-bold">{order.invoice_date}</p>
              </div>
            </div>
            <div className="w-1/3 border rounded-md border-dashed border-[#9b0c51]/30 p-4 flex flex-col items-center justify-center bg-gray-50/50">
              <p className="text-[10px] text-[#9b0c51] mb-2 tracking-widest font-bold uppercase">Delhivery AWB</p>
              {/* Real Barcode Using Free API */}
              <div className="h-12 w-full max-w-[200px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={`https://barcode.tec-it.com/barcode.ashx?data=${order.awb_number}&code=Code128&dpi=96&dataseparator=`} 
                  alt="Barcode" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Consignor/Consignee Section */}
          <div className="bg-gray-100 px-3 py-2 border-l-4 border-[#9b0c51] mb-4">
            <h3 className="font-bold text-xs tracking-widest">CONSIGNOR & CONSIGNEE DETAILS</h3>
          </div>

          <div className="flex gap-4 mb-8">
            <div className="w-1/2 border rounded-md p-5">
              <p className="text-xs font-bold text-[#9b0c51] mb-3 uppercase tracking-wider">Dispatch From (Consignor)</p>
              <p className="font-bold mb-1 text-base">Ankita Processors</p>
              <p className="text-sm text-gray-600">Plot 5, Near Vivekanand School, Jetpur,</p>
              <p className="text-sm text-gray-600 mb-2">Rajkot, Gujarat - 360370</p>
              <p className="text-sm text-gray-800"><span className="font-bold">GSTIN:</span> 24ANCPN9292N2ZB</p>
            </div>
            <div className="w-1/2 border rounded-md p-5">
              <p className="text-xs font-bold text-[#9b0c51] mb-3 uppercase tracking-wider">Deliver To (Consignee)</p>
              <p className="font-bold mb-1 text-base">{order.shipping_address.name}</p>
              <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed mb-2">{order.shipping_address.address}</p>
              <p className="text-sm text-gray-800"><span className="font-bold">Ph:</span> {order.shipping_address.phone}</p>
            </div>
          </div>

          {/* Consignment Items */}
          <div className="bg-gray-100 px-3 py-2 border-l-4 border-[#9b0c51] mb-4">
            <h3 className="font-bold text-xs tracking-widest uppercase">Consignment Item Particulars</h3>
          </div>

          <table className="w-full mb-8 text-sm text-left">
            <thead>
              <tr className="bg-[#9b0c51] text-white uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3 w-8">#</th>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3 w-20 text-center">HSN Code</th>
                <th className="py-2.5 px-3 w-16 text-center">Qty</th>
                <th className="py-2.5 px-3 w-28 text-right">Taxable Value</th>
                <th className="py-2.5 px-3 w-20 text-center">Tax Rate</th>
                <th className="py-2.5 px-3 w-32 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={item.id} className="border-b">
                  <td className="py-3 px-3 text-gray-500">{i + 1}</td>
                  <td className="py-3 px-3 font-medium">{item.description}</td>
                  <td className="py-3 px-3 text-center text-gray-600">{item.hsn}</td>
                  <td className="py-3 px-3 text-center">{item.qty}</td>
                  <td className="py-3 px-3 text-right text-gray-600">{item.taxable.toFixed(2)}</td>
                  <td className="py-3 px-3 text-center text-gray-600">{item.gstPercent}%</td>
                  <td className="py-3 px-3 text-right">{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Declarations & Totals */}
          <div className="flex gap-6">
            <div className="w-1/2 border rounded-md p-5 flex flex-col justify-between bg-gray-50/30">
              <div>
                <p className="text-xs text-gray-500 font-bold tracking-widest uppercase mb-3">Declaration & Instructions</p>
                <p className="text-sm text-gray-700 leading-relaxed">Certified that the particulars given above are true and correct. Goods are being transported for delivery against Invoice {order.invoice_no}.<br/>Carry this document during transit.</p>
              </div>
              <div className="border-t border-dashed mt-6 pt-4 flex justify-between items-center">
                <p className="text-xs font-bold text-gray-600 tracking-wider">ORDER NO: {order.order_no}</p>
                <p className="text-xs font-bold text-green-700 tracking-wider">STATUS: READY FOR DISPATCH</p>
              </div>
            </div>

            <div className="w-1/2">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2.5 text-gray-600">Total Taxable Value</td>
                    <td className="py-2.5 text-right font-bold">Rs. {order.taxable_value.toFixed(2)}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2.5 text-gray-600">CGST Amount</td>
                    <td className="py-2.5 text-right font-bold">Rs. {order.cgst.toFixed(2)}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2.5 text-gray-600">SGST Amount</td>
                    <td className="py-2.5 text-right font-bold">Rs. {order.sgst.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-gray-600">Freight / Shipping</td>
                    <td className="py-2.5 text-right font-bold text-green-600">{order.shipping === 0 ? 'FREE' : `Rs. ${order.shipping.toFixed(2)}`}</td>
                  </tr>
                  <tr className="bg-[#9b0c51] text-white">
                    <td className="py-3 px-3 font-bold uppercase tracking-wider text-xs">Consignment Value</td>
                    <td className="py-3 px-3 text-right font-bold">Rs. {order.grand_total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
        
        {/* Footer */}
        <div className="absolute bottom-4 left-0 w-full text-center px-8">
          <p className="text-[10px] text-gray-400">
            This Delivery Waybill is generated in accordance with GST Rules for goods transit. | System Generated Document.<br/>
            Plot 5, Near Vivekanand School, Jetpur, Rajkot, Gujarat - 360370 GSTIN: 24ANCPN9292N2ZB | Ph: +91 7043637284
          </p>
        </div>

      </div>
    </div>
  )
}
