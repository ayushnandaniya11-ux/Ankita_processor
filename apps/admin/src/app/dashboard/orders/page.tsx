'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { api, fetcher } from '@/lib/api'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Badge, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, Checkbox } from '@ankita/ui'
import { Eye, Download, MoreHorizontal, CheckCircle, FileText, Truck, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function OrdersPage() {
  const { data, error, mutate, isLoading } = useSWR('/admin/orders', fetcher)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

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
                <TableCell>{order.user?.firstName} {order.user?.lastName}</TableCell>
                <TableCell>{order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy') : '-'}</TableCell>
                <TableCell>₹{parseFloat(order.totalAmount).toFixed(2)}</TableCell>
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
                      <DropdownMenuItem>
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
                              <Truck className="mr-2 h-4 w-4" /> Generate Waybill
                            </DropdownMenuItem>
                          )}
                          {order.awbNumber && (
                            <DropdownMenuItem onClick={() => window.open(`/dashboard/orders/${order.id}/waybill`, '_blank')}>
                              <Truck className="mr-2 h-4 w-4" /> View Waybill
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
    </div>
  )
}
