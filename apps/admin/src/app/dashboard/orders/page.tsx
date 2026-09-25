'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Badge, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, Checkbox } from '@ankita/ui'
import { Eye, Download, MoreHorizontal, CheckCircle, FileText, Truck, XCircle } from 'lucide-react'
import { toast } from 'sonner'

const INITIAL_ORDERS = [
  { id: 'ORD-7393', customer: 'Riya Gupta', date: '2026-09-25', status: 'Pending', total: 5400.00, items: 2 },
  { id: 'ORD-7394', customer: 'Anita Singh', date: '2026-09-25', status: 'Pending', total: 2100.00, items: 1 },
] as any[]

export default function OrdersPage() {
  const [orders, setOrders] = useState(INITIAL_ORDERS)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])



  const handleAcceptOrder = (orderId: string) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Processing' } : o))
    toast.success('Order Accepted!', {
      description: 'Invoice and Waybill opened in new tabs.'
    })
    
    setTimeout(() => {
      window.open(`/dashboard/orders/${orderId}/invoice`, '_blank')
      window.open(`/dashboard/orders/${orderId}/waybill`, '_blank')
    }, 100)
  }

  const handleCancelOrder = (orderId: string) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o))
    toast.info('Order Cancelled')
  }

  const downloadInvoice = (order: any) => {
    window.open(`/dashboard/orders/${order.id}/invoice`, '_blank')
  }
  const downloadWaybill = (order: any) => {
    window.open(`/dashboard/orders/${order.id}/waybill`, '_blank')
  }

  const handleBulkAccept = () => {
    setOrders(orders.map(o => selectedOrders.includes(o.id) && o.status === 'Pending' ? { ...o, status: 'Processing' } : o))
    toast.success(`${selectedOrders.length} Orders Accepted!`)
    
    setTimeout(() => {
      selectedOrders.forEach(id => {
        window.open(`/dashboard/orders/${id}/invoice`, '_blank')
        window.open(`/dashboard/orders/${id}/waybill`, '_blank')
      })
    }, 100)
    
    setSelectedOrders([])
  }

  const handleBulkInvoice = () => {
    selectedOrders.forEach(id => {
      const order = orders.find(o => o.id === id)
      if (order && order.status !== 'Pending' && order.status !== 'Cancelled') {
        window.open(`/dashboard/orders/${order.id}/invoice`, '_blank')
      }
    })
    toast.success(`Opening invoices for ${selectedOrders.length} orders`)
    setSelectedOrders([])
  }

  const handleBulkWaybill = () => {
    selectedOrders.forEach(id => {
      const order = orders.find(o => o.id === id)
      if (order && order.status !== 'Pending' && order.status !== 'Cancelled') {
        window.open(`/dashboard/orders/${order.id}/waybill`, '_blank')
      }
    })
    toast.success(`Waybills generated for ${selectedOrders.length} orders`)
    setSelectedOrders([])
  }

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.map(o => o.id))
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
              <Button size="sm" variant="secondary" onClick={handleBulkAccept}>Accept Orders</Button>
              <Button size="sm" variant="secondary" onClick={handleBulkInvoice}>Invoices</Button>
              <Button size="sm" variant="secondary" onClick={handleBulkWaybill}>Waybills</Button>
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
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total (₹)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedOrders.includes(order.id)} 
                    onCheckedChange={(c) => toggleSelect(order.id, c as boolean)} 
                    aria-label={`Select ${order.id}`}
                  />
                </TableCell>
                <TableCell className="font-mono font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.items}</TableCell>
                <TableCell>₹{order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={
                    order.status === 'Delivered' ? 'default' : 
                    order.status === 'Cancelled' ? 'destructive' : 
                    order.status === 'Processing' ? 'secondary' : 'outline'
                  }>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      
                      {order.status === 'Pending' && (
                        <>
                          <DropdownMenuItem onClick={() => handleAcceptOrder(order.id)}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Accept Order
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCancelOrder(order.id)} className="text-destructive focus:text-destructive">
                            <XCircle className="mr-2 h-4 w-4" /> Cancel Order
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      {order.status !== 'Pending' && order.status !== 'Cancelled' && (
                        <>
                          <DropdownMenuItem onClick={() => downloadInvoice(order)}>
                            <FileText className="mr-2 h-4 w-4" /> Download Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => downloadWaybill(order)}>
                            <Truck className="mr-2 h-4 w-4" /> Download Waybill
                          </DropdownMenuItem>
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
