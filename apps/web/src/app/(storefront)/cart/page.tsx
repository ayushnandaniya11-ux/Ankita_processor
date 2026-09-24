import type { Metadata } from 'next'
import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@ankita/ui'

export const metadata: Metadata = { title: 'Shopping Cart' }

export default function CartPage() {
  return (
    <div className="container-wide py-8 max-w-5xl">
      <h1 className="mb-6 text-2xl font-bold">Shopping Cart</h1>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <ShoppingCart className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="mb-1 text-base font-semibold">Your cart is empty</h3>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          Add items from our collection to get started.
        </p>
        <Button asChild><Link href="/">Continue Shopping</Link></Button>
      </div>
    </div>
  )
}
