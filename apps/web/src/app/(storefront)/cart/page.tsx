'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag } from 'lucide-react'
import { Button, Input, Separator } from '@ankita/ui'
import { useCart } from '@/hooks/use-cart'
import { formatCurrency, resolveImageUrl } from '@ankita/utils'
import { toast } from 'sonner'

export default function CartPage() {
  const { cart, items, totalAmount, itemCount, isLoading, updateItem, removeItem, applyCoupon, removeCoupon } = useCart()
  const [couponInput, setCouponInput] = useState('')
  const [couponApplying, setCouponApplying] = useState(false)

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponInput.trim()) return
    setCouponApplying(true)
    try {
      await applyCoupon(couponInput.trim())
      toast.success('Coupon applied successfully!')
      setCouponInput('')
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Invalid coupon code')
    } finally {
      setCouponApplying(false)
    }
  }

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon()
      toast.success('Coupon removed')
    } catch {
      toast.error('Failed to remove coupon')
    }
  }

  if (isLoading) {
    return (
      <div className="container-wide py-12 max-w-5xl">
        <h1 className="mb-6 text-2xl font-bold">Shopping Cart</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-muted rounded-xl"></div>
          <div className="h-24 bg-muted rounded-xl"></div>
          <div className="h-24 bg-muted rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="container-wide py-12 max-w-5xl">
        <h1 className="mb-6 text-2xl font-bold">Shopping Cart</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-2xl border-dashed">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-bold">Your cart is empty</h2>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            Explore our curated ethnic wear collection and add beautiful styles to your cart.
          </p>
          <Button asChild size="lg">
            <Link href="/products">Explore Collection</Link>
          </Button>
        </div>
      </div>
    )
  }

  const subtotal = cart?.subtotal || totalAmount
  const discount = cart?.discountAmount || 0
  const finalTotal = cart?.grandTotal || (totalAmount - discount)
  const isFreeShipping = finalTotal >= 999
  const shippingFee = isFreeShipping ? 0 : 70

  return (
    <div className="container-wide py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Shopping Cart</h1>
        <p className="text-muted-foreground text-sm mt-1">{itemCount} items ready for checkout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item: any) => {
            const productName = item.productName || item.product?.name || 'Handcrafted Ethnic Wear'
            const productSlug = item.productSlug || item.product?.slug || item.productId
            const rawImg = item.productImage || item.product?.imageUrl || item.product?.images?.[0]?.url
            const image = resolveImageUrl(rawImg)
            const price = Number(item.unitPrice || item.price || item.product?.sellingPrice || 0)
            const lineTotal = Number(item.totalPrice || price * item.quantity)
            const variantText = [item.color, item.size].filter(Boolean).join(' · ') || item.variant?.name || item.variant?.size

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border bg-card hover:border-muted-foreground/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted shrink-0 border flex items-center justify-center">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt={productName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-2xl">🛍️</div>
                    )}
                  </div>
                  <div>
                    <Link href={`/products/${productSlug}`} className="font-semibold text-foreground hover:text-primary line-clamp-1">
                      {productName}
                    </Link>
                    {variantText && (
                      <p className="text-xs text-muted-foreground mt-0.5">Color / Size: {variantText}</p>
                    )}
                    <p className="text-sm font-semibold text-primary mt-1">{formatCurrency(price)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                  {/* Quantity controls */}
                  <div className="flex items-center border rounded-lg bg-background">
                    <button
                      type="button"
                      className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40"
                      disabled={item.quantity <= 1}
                      onClick={() => updateItem(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground"
                      onClick={() => updateItem(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-sm">{formatCurrency(lineTotal)}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground hover:text-destructive p-1 rounded-md transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Order Summary & Coupon Box */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold">Order Summary</h2>

            {/* Coupon Code Section */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label htmlFor="coupon" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-primary" /> Apply Promo Code
              </label>
              <div className="flex gap-2">
                <Input
                  id="coupon"
                  placeholder="e.g. FESTIVE10"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="uppercase text-sm"
                />
                <Button type="submit" variant="secondary" disabled={couponApplying || !couponInput.trim()} size="sm">
                  Apply
                </Button>
              </div>
              {cart?.couponCode && (
                <div className="flex items-center justify-between text-xs bg-primary/10 text-primary p-2 rounded-lg font-medium">
                  <span>Coupon {cart.couponCode} applied</span>
                  <button type="button" onClick={handleRemoveCoupon} className="hover:underline">
                    Remove
                  </button>
                </div>
              )}
            </form>

            <Separator />

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{isFreeShipping ? <span className="text-emerald-600 font-medium">FREE</span> : formatCurrency(shippingFee)}</span>
              </div>
              {!isFreeShipping && (
                <p className="text-[11px] text-muted-foreground">
                  Add {formatCurrency(999 - finalTotal)} more for FREE Delivery
                </p>
              )}

              <Separator />

              <div className="flex justify-between text-base font-bold text-foreground pt-1">
                <span>Total Amount</span>
                <span>{formatCurrency(finalTotal + (isFreeShipping ? 0 : shippingFee))}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Inclusive of all applicable GST taxes</p>
            </div>

            <Button asChild size="lg" className="w-full gap-2">
              <Link href="/checkout/address">
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Safe & Secure 256-bit Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
