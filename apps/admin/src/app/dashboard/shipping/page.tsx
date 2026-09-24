'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Badge } from '@ankita/ui'
import { PackageSearch } from 'lucide-react'

const MOCK_SHIPPING = [
  { id: 'SHP-9901', orderId: 'ORD-7392', courier: 'BlueDart', awb: 'BD88291002', status: 'Label Created', date: '2026-09-24' },
  { id: 'SHP-9900', orderId: 'ORD-7391', courier: 'Delhivery', awb: 'DEL99210023', status: 'In Transit', date: '2026-09-23' },
  { id: 'SHP-9899', orderId: 'ORD-7390', courier: 'FedEx', awb: 'FX10293022', status: 'Delivered', date: '2026-09-22' },
]

export default function ShippingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shipping & Tracking</h1>
          <p className="text-muted-foreground">Monitor outgoing shipments and generate labels.</p>
        </div>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shipment ID</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Courier</TableHead>
              <TableHead>AWB Number</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Tracking Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_SHIPPING.map((ship) => (
              <TableRow key={ship.id}>
                <TableCell className="font-mono">{ship.id}</TableCell>
                <TableCell className="font-mono text-muted-foreground">{ship.orderId}</TableCell>
                <TableCell>{ship.courier}</TableCell>
                <TableCell className="font-mono">{ship.awb}</TableCell>
                <TableCell>{ship.date}</TableCell>
                <TableCell>
                  <Badge variant={ship.status === 'Delivered' ? 'default' : 'secondary'}>
                    {ship.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">
                    <PackageSearch className="mr-2 h-3.5 w-3.5" /> Track
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
