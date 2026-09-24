import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button, Badge } from '@ankita/ui'
import { ArrowLeft, Package, Truck } from 'lucide-react'
import { ORDER_STATUS_LABELS } from '@ankita/types'

interface Props { params: { orderId: string } }

export const metadata: Metadata = { title: 'Order Details' }

export default function OrderDetailPage({ params }: Props) {
  return (
    <div className="container-wide py-8 max-w-4xl">
      <Link href="/orders" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </Link>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order #{params.orderId}</h1>
          <p className="text-sm text-muted-foreground mt-1">Loading order details...</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/orders/${params.orderId}/track`}>
            <Truck className="mr-2 h-4 w-4" />
            Track Order
          </Link>
        </Button>
      </div>
      <div className="rounded-lg border bg-muted/30 p-8 text-center text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <p>Connect to the API to view order details</p>
      </div>
    </div>
  )
}
