'use client'

import useSWR from 'swr'
import { api, fetcher } from '@/lib/api'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Badge } from '@ankita/ui'
import { PackageSearch, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { resolveImageUrl } from '@ankita/utils'

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
              <TableHead>Items</TableHead>
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
                <TableCell>
                  <div className="flex items-center -space-x-2 overflow-hidden py-1">
                    {ship.items?.slice(0, 3).map((item: any, idx: number) => {
                      const img = resolveImageUrl(item.productImage || item.product?.imageUrl || item.product?.images?.[0]?.url)
                      return (
                        <div
                          key={item.id || idx}
                          className="relative inline-block h-9 w-9 rounded-md border-2 border-background overflow-hidden bg-muted shadow-sm"
                          title={`${item.productName || 'Product'} (x${item.quantity})`}
                        >
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={img}
                              alt={item.productName || 'Item'}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px]">🛍️</div>
                          )}
                        </div>
                      )
                    })}
                    {(ship.items?.length || 0) > 3 && (
                      <span className="flex h-9 w-9 items-center justify-center rounded-md border-2 border-background bg-muted text-[11px] font-semibold text-muted-foreground shadow-sm">
                        +{ship.items.length - 3}
                      </span>
                    )}
                  </div>
                </TableCell>
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
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/dashboard/orders/${ship.id}/waybill`, '_blank')}
                      title="View Official 6x4 Waybill"
                    >
                      6×4 Waybill
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (ship.trackingUrl) {
                          window.open(ship.trackingUrl, '_blank')
                        } else {
                          window.open(`https://www.delhivery.com/track/package/${ship.awbNumber}`, '_blank')
                        }
                      }}
                    >
                      <PackageSearch className="mr-1.5 h-3.5 w-3.5" /> Track
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
