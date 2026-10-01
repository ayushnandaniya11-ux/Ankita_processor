import type { Metadata } from 'next'
import { Package } from 'lucide-react'
import { Button } from '@ankita/ui'
import Link from 'next/link'

export const metadata: Metadata = { title: 'My Orders | Profile' }

export default function OrdersPage() {
  return (
    <div className="rounded-xl border bg-card p-6 h-full">
      <div className="mb-6 border-b pb-4">
        <h2 className="text-xl font-semibold">My Orders</h2>
        <p className="text-sm text-muted-foreground mt-1">View and track your recent orders.</p>
      </div>
      
      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-muted p-4 text-muted-foreground">
          <Package className="h-8 w-8" />
        </div>
        <h3 className="mb-2 font-semibold">No orders found</h3>
        <p className="mb-6 text-sm text-muted-foreground max-w-sm">
          You haven&apos;t placed any orders yet. Start exploring our collection to find your next favorite item.
        </p>
        <Link href="/products">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    </div>
  )
}
