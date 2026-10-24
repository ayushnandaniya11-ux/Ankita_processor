'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { api, fetcher } from '@/lib/api'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Badge, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, Checkbox, Dialog, DialogContent, DialogHeader, DialogTitle } from '@ankita/ui'
import { Eye, Download, MoreHorizontal, CheckCircle, FileText, Truck, XCircle, Loader2, Package, MapPin, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { resolveImageUrl, formatCurrency } from '@ankita/utils'

export default function OrdersPage() {
  const { data, error, mutate, isLoading } = useSWR('/admin/orders', fetcher)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [viewingOrder, setViewingOrder] = useState<any | null>(null)

  const orders = data?.orders || []

  const handleAcceptOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to accept this order?')) return;
    try {
      setIsProcessing(true)
      await api.post(`/admin/orders/${orderId}/accept`)
      toast.success('Order Accepted!', {
        description: 'Order status updated to Ready to Ship.'
      })
      mutate()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to accept order')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to reject this order?')) return;
    try {
      setIsProcessing(true)
      await api.post(`/admin/orders/${orderId}/reject`)
      toast.success('Order Cancelled')
      mutate()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to cancel order')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGenerateInvoice = async (orderId: string) => {
    try {
      setIsProcessing(true)
      await api.post(`/admin/orders/${orderId}/invoice`)
      toast.success('Invoice Generated successfully')
      mutate()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to generate invoice')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGenerateWaybill = async (orderId: string) => {
    try {
      setIsProcessing(true)
      await api.post(`/admin/orders/${orderId}/waybill`)
      toast.success('Waybill Generated successfully')
      mutate()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to generate waybill')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkAccept = async () => {
    setIsProcessing(true)
    try {
      for (const id of selectedOrders) {
        const order = orders.find((o: any) => o.id === id)
        if (order && order.status === 'PENDING') {
          await api.post(`/admin/orders/${id}/accept`)
        }
      }
      toast.success(`${selectedOrders.length} Orders Accepted!`)
      setSelectedOrders([])
      mutate()
    } catch (err) {
      toast.error('Error accepting some orders')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkInvoice = async () => {
    setIsProcessing(true)
    try {
      for (const id of selectedOrders) {
        const order = orders.find((o: any) => o.id === id)
        if (order && order.status !== 'PENDING' && order.status !== 'CANCELLED') {
          await api.post(`/admin/orders/${id}/invoice`)
        }
      }
      toast.success(`Invoices generated for selected orders`)
      setSelectedOrders([])
      mutate()
    } catch (err) {
      toast.error('Error generating some invoices')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkWaybill = async () => {
    setIsProcessing(true)
    try {
      for (const id of selectedOrders) {
        const order = orders.find((o: any) => o.id === id)
        if (order && order.status === 'READY_TO_SHIP') {
          await api.post(`/admin/orders/${id}/waybill`)
        }
      }
      toast.success(`Waybills generated for selected orders`)
      setSelectedOrders([])
      mutate()
    } catch (err) {
      toast.error('Error generating some waybills')
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.map((o: any) => o.id))
    } else {
      setSelectedOrders([])
    }
  }

  const toggleSelect = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, orderId])
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage and track customer orders.</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedOrders.length > 0 && (
            <div className="flex items-center gap-2 mr-2 bg-muted px-3 py-1.5 rounded-md border">
              <span className="text-sm font-medium mr-2">{selectedOrders.length} selected</span>
              <Button size="sm" variant="secondary" onClick={handleBulkAccept} disabled={isProcessing}>Accept Orders</Button>
              <Button size="sm" variant="secondary" onClick={handleBulkInvoice} disabled={isProcessing}>Invoices</Button>
              <Button size="sm" variant="secondary" onClick={handleBulkWaybill} disabled={isProcessing}>Waybills</Button>
            </div>
          )}
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedOrders.length === orders.length && orders.length > 0} 
                  onCheckedChange={toggleSelectAll} 
                  aria-label="Select all" 
                />
              </TableHead>
              <TableHead>Order No</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total (₹)</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No pending orders found.
                </TableCell>
              </TableRow>
            ) : orders.map((order: any) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedOrders.includes(order.id)} 
                    onCheckedChange={(c) => toggleSelect(order.id, c as boolean)} 
                    aria-label={`Select ${order.id}`}
                  />
                </TableCell>
                <TableCell className="font-mono font-medium">{order.orderNo}</TableCell>
                <TableCell>{order.user?.name || [order.user?.firstName, order.user?.lastName].filter(Boolean).join(' ') || 'Customer'}</TableCell>
                <TableCell>{order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy') : '-'}</TableCell>
                <TableCell>₹{parseFloat(order.totalAmount).toFixed(2)}</TableCell>
                <TableCell>
                  {order.paymentMethod === 'ONLINE' ? (
                    <div>
                      <Badge
                        variant={order.paymentStatus === 'PAID' ? 'default' : order.paymentStatus === 'FAILED' ? 'destructive' : 'outline'}
                        className="text-[10px]"
                      >
                        Online: {order.paymentStatus}
                      </Badge>
                      {order.razorpayPaymentId && (
                        <p className="font-mono text-[10px] text-muted-foreground mt-0.5 truncate max-w-[120px]">
                          {order.razorpayPaymentId}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                        COD: {order.codPaymentStatus || 'PENDING'}
                      </Badge>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={
                    order.status === 'DELIVERED' ? 'default' : 
                    order.status === 'CANCELLED' ? 'destructive' : 
                    ['READY_TO_SHIP', 'SHIPPED'].includes(order.status) ? 'secondary' : 'outline'
                  }>
                    {order.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isProcessing}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setViewingOrder(order)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      
                      {order.status === 'PENDING' && (
                        <>
                          <DropdownMenuItem onClick={() => handleAcceptOrder(order.id)}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Accept Order
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCancelOrder(order.id)} className="text-destructive focus:text-destructive">
                            <XCircle className="mr-2 h-4 w-4" /> Cancel Order
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      {order.status !== 'PENDING' && order.status !== 'CANCELLED' && (
                        <>
                          {!order.invoiceNo && (
                            <DropdownMenuItem onClick={() => handleGenerateInvoice(order.id)}>
                              <FileText className="mr-2 h-4 w-4" /> Generate Invoice
                            </DropdownMenuItem>
                          )}
                          {order.invoiceNo && (
                            <DropdownMenuItem onClick={() => window.open(`/dashboard/orders/${order.id}/invoice`, '_blank')}>
                              <FileText className="mr-2 h-4 w-4" /> View Invoice
                            </DropdownMenuItem>
                          )}
                          
                          {order.status === 'READY_TO_SHIP' && !order.awbNumber && (
                            <DropdownMenuItem onClick={() => handleGenerateWaybill(order.id)}>
                              <Truck className="mr-2 h-4 w-4" /> Generate Delhivery Waybill
                            </DropdownMenuItem>
                          )}
                          {order.awbNumber && (
                            <>
                              <DropdownMenuItem onClick={() => window.open(`/dashboard/orders/${order.id}/waybill`, '_blank')}>
                                <Truck className="mr-2 h-4 w-4" /> View 6×4 Waybill
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1'}/admin/orders/${order.id}/waybill/download`, '_blank')}>
                                <Download className="mr-2 h-4 w-4" /> Download Waybill (PDF)
                              </DropdownMenuItem>
                            </>
                          )}
                          {order.invoiceNo && (
                            <DropdownMenuItem onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1'}/admin/orders/${order.id}/invoice/download`, '_blank')}>
                              <Download className="mr-2 h-4 w-4" /> Download Tax Invoice (PDF)
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={Boolean(viewingOrder)} onOpenChange={(open) => !open && setViewingOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {viewingOrder && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      Order #{viewingOrder.orderNo}
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Placed on {viewingOrder.createdAt ? format(new Date(viewingOrder.createdAt), 'PPP p') : '-'}
                    </p>
                  </div>
                  <Badge variant={
                    viewingOrder.status === 'DELIVERED' ? 'default' :
                    viewingOrder.status === 'CANCELLED' ? 'destructive' :
                    ['READY_TO_SHIP', 'SHIPPED'].includes(viewingOrder.status) ? 'secondary' : 'outline'
                  }>
                    {viewingOrder.status.replace('_', ' ')}
                  </Badge>
                </div>
              </DialogHeader>

              {/* Customer and Shipping Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-xl border">
                <div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1">Customer Info</h4>
                  <p className="font-medium text-foreground">
                    {viewingOrder.user?.name || [viewingOrder.user?.firstName, viewingOrder.user?.lastName].filter(Boolean).join(' ') || 'Customer'}
                  </p>
                  {viewingOrder.user?.email && <p className="text-xs text-muted-foreground">{viewingOrder.user.email}</p>}
                  {viewingOrder.user?.phone && <p className="text-xs text-muted-foreground">Ph: {viewingOrder.user.phone}</p>}
                </div>
                <div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> Shipping Destination
                  </h4>
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                    {typeof viewingOrder.shippingAddress === 'string'
                      ? viewingOrder.shippingAddress
                      : JSON.stringify(viewingOrder.shippingAddress)}
                  </p>
                </div>
              </div>

              {/* Purchased Items List */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Order Items ({viewingOrder.items?.length || 0})</h4>
                <div className="border rounded-lg overflow-hidden divide-y">
                  {viewingOrder.items?.map((item: any) => {
                    const itemImage = resolveImageUrl(
                      item.productImage || item.product?.imageUrl || item.product?.images?.[0]?.url
                    )
                    return (
                      <div key={item.id} className="p-3 flex items-center gap-4 bg-card">
                        <div className="h-14 w-12 shrink-0 rounded-md overflow-hidden bg-muted border flex items-center justify-center">
                          {itemImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={itemImage}
                              alt={item.productName || item.product?.name || 'Product'}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none'
                              }}
                            />
                          ) : (
                            <span className="text-xs">🛍️</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {item.productName || item.product?.name || 'Product'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            SKU: {item.product?.sku || item.productSlug || 'N/A'} · Qty: {item.quantity}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Unit Price: {formatCurrency(item.rate || item.unitPrice || 0)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-foreground">
                            {formatCurrency(item.total || item.totalPrice || ((item.rate || 0) * (item.quantity || 1)))}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  {(!viewingOrder.items || viewingOrder.items.length === 0) && (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      No item records attached to this order.
                    </div>
                  )}
                </div>
              </div>

              {/* Payment and Reconciliation Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-800 uppercase tracking-wider">Payment &amp; Reconciliation</span>
                  <Badge variant={viewingOrder.paymentStatus === 'PAID' ? 'default' : 'outline'}>
                    {viewingOrder.paymentMethod} · {viewingOrder.paymentStatus}
                  </Badge>
                </div>

                {viewingOrder.paymentMethod === 'ONLINE' ? (
                  <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Razorpay Payment ID:</span>
                      <span className="font-mono font-bold text-slate-900 break-all">{viewingOrder.razorpayPaymentId || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Razorpay Order ID:</span>
                      <span className="font-mono font-medium text-slate-800 break-all">{viewingOrder.razorpayOrderId || 'N/A'}</span>
                    </div>
                    {viewingOrder.razorpayPaymentId && (
                      <div className="col-span-2 pt-1">
                        <a
                          href={`https://dashboard.razorpay.com/app/payments/${viewingOrder.razorpayPaymentId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#00313B] hover:underline inline-flex items-center gap-1 font-semibold text-[11px]"
                        >
                          <ExternalLink className="w-3 h-3" /> View in Razorpay Dashboard
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 text-slate-600 pt-1">
                    <div>
                      <span className="text-slate-400 block text-[11px]">COD Lifecycle:</span>
                      <span className="font-bold text-slate-900">{viewingOrder.codPaymentStatus || 'COD_PENDING'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Expected COD:</span>
                      <span className="font-bold text-slate-900">{formatCurrency(viewingOrder.codExpectedAmount || viewingOrder.totalAmount)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">In Bank (Settled):</span>
                      <span className="font-bold text-emerald-700">{formatCurrency(viewingOrder.codSettledAmount || 0)}</span>
                    </div>
                    {viewingOrder.codRemittanceRef && (
                      <div className="col-span-3">
                        <span className="text-slate-400 text-[11px]">Remittance UTR: </span>
                        <span className="font-mono font-bold text-slate-800">{viewingOrder.codRemittanceRef}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Totals & Financials Breakdown */}
              <div className="border-t pt-3 space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Selected Payment Method:</span>
                  <span className="font-semibold text-foreground">{viewingOrder.paymentMethod} ({viewingOrder.paymentStatus})</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Product Subtotal:</span>
                  <span className="font-medium text-foreground">{formatCurrency(Number(viewingOrder.subtotal || 0))}</span>
                </div>
                {Number(viewingOrder.discount || 0) > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount:</span>
                    <span className="font-medium">-{formatCurrency(Number(viewingOrder.discount))}</span>
                  </div>
                )}
                {Number(viewingOrder.taxAmount || 0) > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax (GST):</span>
                    <span className="font-medium text-foreground">{formatCurrency(Number(viewingOrder.taxAmount))}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping Charge:</span>
                  <span className="font-medium text-emerald-600">
                    {Number(viewingOrder.shippingFee) === 0 ? 'FREE' : formatCurrency(Number(viewingOrder.shippingFee))}
                  </span>
                </div>
                {viewingOrder.paymentMethod === 'COD' && (
                  <div className="flex justify-between items-center text-amber-800 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900 my-1">
                    <div>
                      <span className="font-bold text-xs block">Cash on Delivery (COD) Fee:</span>
                      <span className="text-[10px] text-amber-700/80 dark:text-amber-400">Strict system-calculated fee (Non-alterable)</span>
                    </div>
                    <span className="font-bold text-sm">+{formatCurrency(Number(viewingOrder.codFee || 50))}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-2 border-t text-foreground">
                  <span>Final Order Total:</span>
                  <span className="text-primary">{formatCurrency(Number(viewingOrder.totalAmount))}</span>
                </div>
                {viewingOrder.invoiceNo && (
                  <div className="flex justify-between text-muted-foreground text-xs pt-1">
                    <span>Invoice Ref:</span>
                    <span className="font-mono text-foreground font-medium">{viewingOrder.invoiceNo}</span>
                  </div>
                )}
                {viewingOrder.awbNumber && (
                  <div className="flex justify-between text-muted-foreground text-xs">
                    <span>Logistics Waybill (AWB):</span>
                    <span className="font-mono text-foreground font-medium">
                      {viewingOrder.awbNumber} ({viewingOrder.courier || viewingOrder.shipment?.courierName || 'Delhivery Express'})
                    </span>
                  </div>
                )}
                {viewingOrder.shipment && (
                  <div className="flex justify-between text-muted-foreground text-xs items-center">
                    <span>Delhivery Shipment Status:</span>
                    <Badge variant={viewingOrder.shipment.status === 'GENERATED' || viewingOrder.shipment.status === 'DELIVERED' ? 'default' : 'secondary'} className="text-[10px] h-5">
                      {viewingOrder.shipment.status}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Action Buttons in Dialog */}
              <div className="flex flex-wrap justify-end gap-2 pt-2 border-t">
                {viewingOrder.invoiceNo && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/dashboard/orders/${viewingOrder.id}/invoice`, '_blank')}
                    >
                      <FileText className="mr-2 h-4 w-4" /> View Invoice
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1'}/admin/orders/${viewingOrder.id}/invoice/download`, '_blank')}
                    >
                      <Download className="mr-2 h-4 w-4" /> Download Invoice
                    </Button>
                  </>
                )}
                {viewingOrder.awbNumber && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/dashboard/orders/${viewingOrder.id}/waybill`, '_blank')}
                    >
                      <Truck className="mr-2 h-4 w-4" /> View 6×4 Waybill
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1'}/admin/orders/${viewingOrder.id}/waybill/download`, '_blank')}
                    >
                      <Download className="mr-2 h-4 w-4" /> Download Waybill
                    </Button>
                  </>
                )}
                <Button variant="secondary" size="sm" onClick={() => setViewingOrder(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
