import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@ankita/ui'
import { CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = { title: 'Order Placed!' }

interface Props { searchParams: { order?: string } }

export default function CheckoutSuccessPage({ searchParams }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-6" />
      <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
      {searchParams.order && (
        <p className="text-muted-foreground mb-2">Order Number: <span className="font-semibold text-foreground">{searchParams.order}</span></p>
      )}
      <p className="text-muted-foreground max-w-md mb-8">
        Thank you for shopping with Ankita Processors! You will receive a confirmation email shortly with your order details.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/orders">View My Orders</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  )
}
