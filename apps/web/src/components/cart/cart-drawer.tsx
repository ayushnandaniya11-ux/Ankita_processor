'use client'

import Link from 'next/link'
import { X, ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, Button, Separator } from '@ankita/ui'
import { formatCurrency } from '@ankita/utils'
import { useCart } from '@/hooks/use-cart'
import { toast } from 'sonner'

interface CartDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { cart, isLoading, updateItem, removeItem } = useCart()

  async function handleQuantityChange(itemId: string, newQty: number) {
    if (newQty < 1) return
    try {
      await updateItem(itemId, newQty)
    } catch {
      toast.error('Failed to update quantity')
    }
  }

  async function handleRemove(itemId: string) {
    try {
      await removeItem(itemId)
      toast.success('Item removed from cart')
    } catch {
      toast.error('Failed to remove item')
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart
            {cart?.itemCount ? (
              <span className="text-sm font-normal text-muted-foreground">({cart.itemCount} items)</span>
            ) : null}
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Loading cart...
          </div>
        ) : !cart?.items?.length ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingBag className="h-14 w-14 text-muted-foreground/40" />
            <div>
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">Add items to get started</p>
            </div>
            <Button onClick={() => onOpenChange(false)} asChild>
              <Link href="/new-arrivals">Shop Now</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4 px-1">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="h-20 w-16 shrink-0 rounded-md bg-stone-100 flex items-center justify-center text-2xl">
                      🛍️
                    </div>
                    <div className="flex flex-1 flex-col">
                      <p className="text-sm font-medium leading-tight line-clamp-2">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">{item.color} · {item.size}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="flex h-6 w-6 items-center justify-center rounded border hover:bg-accent"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="flex h-6 w-6 items-center justify-center rounded border hover:bg-accent"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{formatCurrency(item.totalPrice)}</span>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(cart.subtotal)}</span>
              </div>
              {cart.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(cart.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{cart.shippingAmount === 0 ? 'Free' : formatCurrency(cart.shippingAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(cart.grandTotal)}</span>
              </div>
              <Button className="w-full" size="lg" asChild>
                <Link href="/checkout/address" onClick={() => onOpenChange(false)}>
                  Proceed to Checkout
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/cart" onClick={() => onOpenChange(false)}>
                  View Full Cart
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
