import type { Metadata } from 'next'
import { ShoppingBag } from 'lucide-react'

export const metadata: Metadata = {
  title: 'My Orders',
  description: 'Track and manage your orders',
}

export default function OrdersPage() {
  return (
    <div className="container-wide py-8 max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold">My Orders</h1>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="mb-1 text-base font-semibold">No orders yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          When you place an order, it will appear here. Start shopping to discover our latest collection.
        </p>
      </div>
    </div>
  )
}
