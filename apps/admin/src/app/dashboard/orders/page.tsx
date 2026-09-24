'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Badge } from '@ankita/ui'
import { Eye, Download } from 'lucide-react'

const MOCK_ORDERS = [
  { id: 'ORD-7392', customer: 'Alice Johnson', date: '2026-09-24', status: 'Processing', total: 4200.00, items: 3 },
  { id: 'ORD-7391', customer: 'Rahul Sharma', date: '2026-09-23', status: 'Shipped', total: 1150.00, items: 1 },
  { id: 'ORD-7390', customer: 'Priya Patel', date: '2026-09-23', status: 'Delivered', total: 8900.50, items: 4 },
  { id: 'ORD-7389', customer: 'Kavita Iyer', date: '2026-09-22', status: 'Cancelled', total: 2400.00, items: 2 },
  { id: 'ORD-7388', customer: 'Samantha Smith', date: '2026-09-22', status: 'Delivered', total: 3100.00, items: 2 },
]

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage and track customer orders.</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
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
            {MOCK_ORDERS.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.items}</TableCell>
                <TableCell>₹{order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={
                    order.status === 'Delivered' ? 'default' : 
                    order.status === 'Cancelled' ? 'destructive' : 
                    order.status === 'Shipped' ? 'secondary' : 'outline'
                  }>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
