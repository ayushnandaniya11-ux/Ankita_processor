'use client'

import useSWR from 'swr'
import { api, fetcher } from '@/lib/api'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Badge } from '@ankita/ui'
import { PackageSearch, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function ShippingPage() {
  const { data, error, isLoading } = useSWR('/admin/shipping', fetcher)
  const shipments = data?.shipments || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shipping & Tracking</h1>
          <p className="text-muted-foreground">Monitor outgoing shipments and track progress.</p>
        </div>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order No</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Courier</TableHead>
              <TableHead>AWB Number</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Tracking Status</TableHead>
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
            ) : shipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No shipments found.
                </TableCell>
              </TableRow>
            ) : shipments.map((ship: any) => (
              <TableRow key={ship.id}>
                <TableCell className="font-mono font-medium">{ship.orderNo}</TableCell>
                <TableCell>{ship.user?.firstName} {ship.user?.lastName}</TableCell>
                <TableCell>{ship.courier}</TableCell>
                <TableCell className="font-mono">{ship.awbNumber}</TableCell>
                <TableCell>{ship.updatedAt ? format(new Date(ship.updatedAt), 'MMM dd, yyyy') : '-'}</TableCell>
                <TableCell>
                  <Badge variant={
                    ship.status === 'DELIVERED' ? 'default' : 
                    ship.status === 'RETURNED' ? 'destructive' : 
                    'secondary'
                  }>
                    {ship.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => {
                    if (ship.trackingUrl) {
                      window.open(ship.trackingUrl, '_blank')
                    } else {
                      toast.error('Tracking URL not available')
                    }
                  }}>
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
