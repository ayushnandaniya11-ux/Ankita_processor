import type { Metadata } from 'next'
import { MapPin } from 'lucide-react'
import { Button } from '@ankita/ui'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Delivery Address — Checkout' }

export default function CheckoutAddressPage() {
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          {['Address', 'Payment', 'Review'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${i === 0 ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}>
                {i + 1}
              </div>
              <span className={`text-sm ${i === 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{step}</span>
              {i < 2 && <span className="text-muted-foreground">›</span>}
            </div>
          ))}
        </div>
        <h1 className="text-2xl font-bold">Select Delivery Address</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col items-center justify-center py-16 rounded-xl border-2 border-dashed text-center">
            <MapPin className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground mb-4">No saved addresses. Add a new one to continue.</p>
            <Button variant="outline">+ Add New Address</Button>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <h2 className="font-semibold">Order Summary</h2>
            <div className="text-sm text-muted-foreground space-y-2">
              <div className="flex justify-between"><span>Subtotal</span><span>₹0</span></div>
              <div className="flex justify-between flex-col">
                <div className="flex justify-between">
                  <span>Shipping</span><span className="text-emerald-600 font-medium">Free</span>
                </div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">via Delhivery Direct</span>
              </div>
              <div className="flex justify-between font-semibold text-foreground pt-2 border-t"><span>Total</span><span>₹0</span></div>
            </div>
            <Button className="w-full" disabled>Continue to Payment</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
