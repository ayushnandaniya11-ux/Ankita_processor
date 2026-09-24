import type { Metadata } from 'next'
import { Truck } from 'lucide-react'

interface Props { params: { orderId: string } }

export const metadata: Metadata = { title: 'Track Order' }

export default function TrackOrderPage({ params }: Props) {
  return (
    <div className="container-wide py-8 max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold">Track Order</h1>
      <p className="mb-8 text-muted-foreground">Order #{params.orderId}</p>

      {/* Timeline skeleton */}
      <div className="relative space-y-6 border-l-2 border-border pl-8 ml-4">
        {['Order Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'].map((step, i) => (
          <div key={step} className="relative">
            <div className={`absolute -left-[2.85rem] flex h-5 w-5 items-center justify-center rounded-full border-2 ${i === 0 ? 'border-foreground bg-foreground' : 'border-border bg-background'}`}>
              {i === 0 && <div className="h-2 w-2 rounded-full bg-background" />}
            </div>
            <div className={i === 0 ? '' : 'opacity-40'}>
              <p className="text-sm font-medium text-foreground">{step}</p>
              {i === 0 && <p className="text-xs text-muted-foreground mt-0.5">Connect to API for live tracking</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
