'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { api, fetcher } from '@/lib/api'
import { Button, Badge, Card, CardContent } from '@ankita/ui'
import { Printer, Download, ArrowLeft, RefreshCw, AlertCircle, CheckCircle2, Truck, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function OfficialWaybillPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const orderId = params?.id
  const [isRetrying, setIsRetrying] = useState(false)

  const { data, error, isLoading, mutate } = useSWR(
    orderId ? `/admin/orders/${orderId}/waybill` : null,
    fetcher
  )

  const handleGenerateOrRetry = async () => {
    try {
      setIsRetrying(true)
      const res = await api.post(`/admin/orders/${orderId}/waybill`)
      toast.success(res.data?.message || 'Delhivery Waybill generated successfully!')
      mutate()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to communicate with Delhivery API')
    } finally {
      setIsRetrying(false)
    }
  }

  const handleDownload = () => {
    if (!orderId) return
    const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1'}/admin/orders/${orderId}/waybill/download`
    window.open(downloadUrl, '_blank')
  }

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Retrieving official shipping waybill from Delhivery...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold">Failed to load shipment data</h2>
        <p className="text-muted-foreground text-sm mt-1 mb-6">Unable to communicate with the shipping logistics service.</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
        </Button>
      </div>
    )
  }

  const { status, awbNumber, courier, trackingUrl, shipment, order, invoice, barcodeBase64, qrBase64 } = data

  const parseAddressDetails = (addr: any) => {
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
        order?.user?.name ||
        'Valued Customer',
      line1: p.addressLine1 || p.address || p.street || '',
      line2: p.addressLine2 || p.area || p.landmark || '',
      city: p.city || '',
      state: p.state || '',
      pincode: String(p.pincode || p.pinCode || p.postalCode || '360370').replace(/\D/g, ''),
      phone: String(p.phone || p.mobile || order?.user?.phone || '9876543210').replace(/\D/g, ''),
    }
  }

  const custAddr = parseAddressDetails(order?.shippingAddress)
  const pinDigits = custAddr.pincode.padEnd(6, ' ').slice(0, 6).split('')
  const invoiceNumber = invoice?.invoiceNumber || order?.invoiceNo || `AP-INV-${order?.orderNo}`
  const invoiceDate = invoice?.invoiceDate
    ? new Date(invoice.invoiceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : ''
  const orderDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : ''

  const itemsList =
    order?.items && order.items.length > 0
      ? order.items.map((it: any) => ({
          description: it.product?.title || it.product?.name || it.title || 'Saree / Fabric Material',
          hsn: it.hsnCode || '5208',
          quantity: it.quantity || 1,
        }))
      : [{ description: 'Sarees and Premium Ethnic Wear Fabrics', hsn: '5208', quantity: 1 }]

  const totalQty = itemsList.reduce((acc: number, it: any) => acc + (it.quantity || 1), 0)
  const isCod = order?.paymentMethod === 'COD'
  const codAmount = Number(order?.totalAmount || 0)
  const declaredValue = Number(order?.subtotal) || Number(order?.totalAmount) || 599
  const courierDisplayName = courier || shipment?.courierName || 'Delhivery Express'

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-sans">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden border-b pb-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Official Shipping Waybill</h1>
              <Badge
                variant={
                  status === 'GENERATED' || status === 'IN_TRANSIT' || status === 'DELIVERED'
                    ? 'default'
                    : status === 'FAILED'
                    ? 'destructive'
                    : 'secondary'
                }
                className="uppercase text-[11px] font-semibold"
              >
                {status || 'PENDING'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Order #{order?.orderNo} &bull; Active Logistics Partner: <strong className="text-foreground">{courierDisplayName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {status === 'FAILED' && (
            <Button onClick={handleGenerateOrRetry} disabled={isRetrying} variant="destructive" size="sm">
              <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              Retry {courierDisplayName}
            </Button>
          )}

          {status === 'PENDING' && (
            <Button onClick={handleGenerateOrRetry} disabled={isRetrying} size="sm">
              <Truck className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              Generate {courierDisplayName} Waybill
            </Button>
          )}

          {(status === 'GENERATED' || awbNumber) && (
            <>
              {trackingUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(trackingUrl, '_blank')}
                  className="hidden md:flex"
                >
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Track Package
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="mr-1.5 h-3.5 w-3.5" /> Print Label
              </Button>
              <Button size="sm" onClick={handleDownload} className="bg-primary text-primary-foreground">
                <Download className="mr-1.5 h-3.5 w-3.5" /> Download Waybill (6×4 PDF)
              </Button>
            </>
          )}
        </div>
      </div>

      {/* When Generation is Pending */}
      {status === 'PENDING' && (
        <Card className="border-dashed print:hidden">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-600 mb-4">
              <Truck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">Waybill Not Yet Generated</h3>
            <p className="text-sm text-muted-foreground max-w-md mt-1 mb-6">
              This order is ready for dispatch. Click below to securely transmit consignment details to Delhivery and generate the official 6×4 inch thermal waybill.
            </p>
            <Button onClick={handleGenerateOrRetry} disabled={isRetrying} size="default">
              <Truck className="mr-2 h-4 w-4" />
              {isRetrying ? `Communicating with ${courierDisplayName} API...` : `Generate Official ${courierDisplayName} Waybill`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* When Generation Failed */}
      {status === 'FAILED' && (
        <Card className="border-destructive/40 bg-destructive/5 print:hidden">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-destructive">Waybill Generation Failed</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {shipment?.errorMessage || 'The logistics provider API returned an error or could not be reached. The order has been safely retained.'}
                </p>
              </div>
            </div>
            <Button onClick={handleGenerateOrRetry} disabled={isRetrying} variant="destructive" size="sm">
              <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              Retry Shipment Creation
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Authentic Ankita Processors Waybill Presentation (matching WayBill.pdf) */}
      {(status === 'GENERATED' || awbNumber) && (
        <div className="space-y-4">
          <div className="bg-muted/40 p-3 rounded-lg flex items-center justify-between text-xs text-muted-foreground print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Official Ankita Processors Waybill generated with genuine Delhivery AWB. Formatted for industrial thermal printers.</span>
            </div>
            <span className="font-mono font-medium text-foreground">AWB: {awbNumber}</span>
          </div>

          {/* 4 x 6 Inch Thermal Waybill Container (matching WayBill.pdf) */}
          <div className="flex justify-center">
            <div
              id="waybill-label"
              className="bg-white text-slate-900 border border-slate-300 rounded shadow-lg print:shadow-none print:border-none overflow-hidden select-none"
              style={{
                width: '101.6mm',
                maxWidth: '420px',
                minHeight: '152.4mm',
                boxSizing: 'border-box',
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}
            >
              {/* 1. Header Banner */}
              <div className="bg-[#9C0B5E] text-white p-3 flex justify-between items-start">
                <div className="space-y-0.5">
                  <h2 className="text-sm font-black tracking-wide leading-tight">ANKITA PROCESSORS</h2>
                  <p className="text-[7.5px] leading-tight opacity-95">Plot No. 5, Behind Vivekanand School,</p>
                  <p className="text-[7.5px] leading-tight opacity-95">Jetpur, Gujarat, India - 360370</p>
                  <p className="text-[7.5px] leading-tight opacity-95">ankitaprocessors@gmail.com | +91 70436 37284</p>
                </div>
                <div className="text-right space-y-0.5">
                  <h3 className="text-[11px] font-black tracking-wider leading-tight">SHIPPING LABEL</h3>
                  <p className="text-[7.5px] font-medium leading-tight opacity-95">GSTIN: 24ANCPN9292N2ZB</p>
                  <p className="text-[7.5px] font-medium leading-tight opacity-95">PAN: ANCPN9292N</p>
                </div>
              </div>

              <div className="p-2.5 space-y-2">
                {/* 2. SHIP TO Box */}
                <div className="bg-[#F8FAFC] border border-slate-200 rounded p-2 text-left">
                  <span className="text-[7.5px] font-bold text-[#9C0B5E] uppercase tracking-wider block mb-1">
                    SHIP TO
                  </span>
                  <p className="text-[11px] font-bold text-slate-900 leading-tight">{custAddr.name}</p>
                  <p className="text-[9px] text-slate-700 leading-tight mt-0.5">
                    {[custAddr.line1, custAddr.line2].filter(Boolean).join(', ')}
                  </p>
                  <p className="text-[9px] text-slate-700 leading-tight">
                    {custAddr.city}, {custAddr.state} - {custAddr.pincode}
                  </p>
                  <p className="text-[8.5px] font-bold text-slate-600 mt-1">
                    Ph: +91 {custAddr.phone}
                  </p>
                </div>

                {/* 3. DELIVERY PIN Bar */}
                <div className="bg-[#9C0B5E] text-white rounded px-2.5 py-1.5 flex items-center justify-between">
                  <span className="text-[8.5px] font-bold uppercase tracking-wider">DELIVERY PIN</span>
                  <div className="flex items-center gap-1">
                    {pinDigits.map((digit, i) => (
                      <span
                        key={i}
                        className="bg-white text-slate-900 font-black text-xs h-5 w-4 rounded flex items-center justify-center leading-none shadow-sm"
                      >
                        {digit}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 4. Metadata Box */}
                <div className="bg-[#F8FAFC] border border-slate-200 rounded p-2 text-[8.5px]">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider block">INVOICE NO.</span>
                      <span className="font-bold text-slate-900">{invoiceNumber}</span>
                    </div>
                    <div>
                      <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider block">ORDER NO.</span>
                      <span className="font-bold text-slate-900">{order?.orderNo}</span>
                    </div>
                    <div>
                      <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider block">INVOICE DATE</span>
                      <span className="text-slate-800">{invoiceDate || orderDate}</span>
                    </div>
                    <div>
                      <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider block">PAYMENT</span>
                      <span className="font-bold text-slate-900">
                        {isCod ? 'CASH ON DELIVERY (COD)' : 'PREPAID'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. Items Table */}
                <div className="border border-slate-200 rounded overflow-hidden">
                  <div className="bg-[#9C0B5E] text-white px-2 py-1 text-[7.5px] font-bold flex justify-between">
                    <span className="w-7/12">DESCRIPTION</span>
                    <span className="w-3/12 text-center">HSN</span>
                    <span className="w-2/12 text-right">QTY</span>
                  </div>
                  <div className="divide-y divide-slate-100 bg-[#F8FAFC]">
                    {itemsList.slice(0, 3).map((item: any, idx: number) => (
                      <div key={idx} className="px-2 py-1 text-[8px] flex justify-between items-center text-slate-800">
                        <span className="w-7/12 truncate" title={item.description}>{item.description}</span>
                        <span className="w-3/12 text-center text-slate-600">{item.hsn}</span>
                        <span className="w-2/12 text-right font-medium">{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-100 px-2 py-1 text-[8px] flex justify-between font-bold text-slate-700 border-t border-slate-200">
                    <span>Total quantity</span>
                    <span>{totalQty}</span>
                  </div>
                </div>

                {/* 6. AWB & Barcode Box */}
                <div className="bg-[#F8FAFC] border border-slate-200 rounded p-2 flex items-center gap-2">
                  <div className="w-14 h-14 bg-white border border-slate-300 rounded flex flex-col items-center justify-center p-0.5 shrink-0">
                    {qrBase64 ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={qrBase64} alt="Tracking QR Code" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[8px] font-bold text-slate-400">QR</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 border border-dashed border-slate-300 rounded p-1.5 bg-white text-center">
                    <span className="text-[7.5px] font-bold text-[#9C0B5E] block leading-none">
                      AWB / WAYBILL NO. - DELHIVERY
                    </span>
                    <span className="font-mono font-black text-xs text-slate-900 tracking-wider block mt-0.5">
                      {awbNumber}
                    </span>
                    <div className="mt-1 flex justify-center">
                      {barcodeBase64 ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={barcodeBase64}
                          alt={`Barcode ${awbNumber}`}
                          className="h-8 max-w-full object-contain"
                        />
                      ) : (
                        <div className="h-6 flex items-center justify-center text-[8px] font-mono text-slate-400">
                          *{awbNumber}*
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 7. DECLARED VALUE / GRAND TOTAL */}
                <div className="bg-[#9C0B5E] text-white rounded px-2.5 py-1.5 flex items-center justify-between">
                  <span className="text-[8px] font-bold uppercase tracking-wider">
                    DECLARED VALUE / GRAND TOTAL
                  </span>
                  <span className="text-xs font-black tracking-wide">
                    {isCod ? `COLLECT: INR ${codAmount.toFixed(2)}` : `INR ${declaredValue.toFixed(2)}`}
                  </span>
                </div>

                {/* 8. Return to / From Footer */}
                <div className="pt-1 text-left text-[7.5px] text-slate-600 leading-tight space-y-0.5">
                  <span className="text-[#9C0B5E] font-bold block">Return to / From</span>
                  <p className="font-bold text-slate-900 text-[8.5px]">Ankita Processors</p>
                  <p>Plot No. 5, Behind Vivekanand School,</p>
                  <p>Jetpur, Gujarat, India - 360370</p>
                  <p>ankitaprocessors@gmail.com | +91 70436 37284</p>
                  <div className="border-t border-slate-200 pt-1 mt-1 text-[7px] text-slate-400">
                    Goods once sold are accepted back only as per our return policy.
                  </div>
                </div>
              </div>

              {/* Bottom Burgundy Stripe */}
              <div className="h-1 bg-[#9C0B5E] w-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
