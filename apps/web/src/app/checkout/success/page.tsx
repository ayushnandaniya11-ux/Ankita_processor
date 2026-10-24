'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button, Badge } from '@ankita/ui'
import { CheckCircle2, Package, ShoppingBag, ArrowRight } from 'lucide-react'
import apiClient from '@/lib/api/client'
import { formatCurrency, resolveImageUrl } from '@ankita/utils'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const orderIdentifier = searchParams.get('orderNo') || searchParams.get('order')

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(Boolean(orderIdentifier))

  useEffect(() => {
    if (!orderIdentifier) return

    let isMounted = true
    apiClient
      .get(`/orders/lookup/${orderIdentifier}`)
      .then((res) => {
        if (isMounted) {
          setOrder(res.data.order)
        }
      })
      .catch((err) => {
        console.warn('Could not load order details on success page:', err)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [orderIdentifier])

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[75vh] py-16 text-center overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary/5 rounded-full blur-[100px] -z-10" />

      <div className="glass-panel p-6 sm:p-10 md:p-12 rounded-3xl max-w-2xl w-full mx-4 shadow-2xl border border-primary/10 relative overflow-hidden text-left">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />

        <div className="flex flex-col items-center justify-center mb-8 gap-4 text-center">
          <div className="relative">
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-emerald-50 border-2 border-emerald-500 shadow-lg">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Order Confirmed!</h1>

          {orderIdentifier && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-background rounded-full text-sm border shadow-sm">
              <span className="text-muted-foreground">Order Reference:</span>
              <span className="font-mono font-bold text-foreground">#{orderIdentifier}</span>
            </div>
          )}

          <p className="text-muted-foreground text-sm sm:text-base max-w-md">
            Thank you for shopping with Ankita Processors! Your order has been placed successfully and is being prepared for dispatch.
          </p>
        </div>

        {/* Ordered Items Preview */}
        {order && order.items && order.items.length > 0 && (
          <div className="mb-6 rounded-2xl border bg-card p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-primary" />
                Purchased Items ({order.items.length})
              </h2>
              <Badge variant="outline" className="text-xs">
                {order.paymentMethod} · {order.paymentStatus}
              </Badge>
            </div>

            <div className="divide-y space-y-2">
              {order.items.map((item: any) => {
                const itemImg = resolveImageUrl(item.productImage || item.product?.imageUrl || item.product?.images?.[0]?.url)
                return (
                  <div key={item.id} className="pt-2 first:pt-0 flex items-center gap-4">
                    <div className="h-14 w-12 shrink-0 overflow-hidden rounded-md border bg-muted flex items-center justify-center">
                      {itemImg ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={itemImg}
                          alt={item.productName || item.product?.name || 'Product'}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none'
                          }}
                        />
                      ) : (
                        <span className="text-xs">🛍️</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {item.productName || item.product?.name || 'Product'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Quantity: <span className="font-medium text-foreground">{item.quantity}</span> · Rate: {formatCurrency(item.rate)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-foreground">{formatCurrency(item.total)}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="pt-3 border-t space-y-1.5 text-sm">
              <div className="flex justify-between items-center text-muted-foreground text-xs">
                <span>Items Subtotal:</span>
                <span className="font-medium text-foreground">{formatCurrency(order.subtotal || 0)}</span>
              </div>
              {Number(order.shippingFee) > 0 && (
                <div className="flex justify-between items-center text-muted-foreground text-xs">
                  <span>Shipping:</span>
                  <span className="font-medium text-foreground">{formatCurrency(order.shippingFee)}</span>
                </div>
              )}
              {Number(order.codFee) > 0 && (
                <div className="flex justify-between items-center text-amber-700 dark:text-amber-300 text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded">
                  <span>Cash on Delivery (COD) Fee:</span>
                  <span>+{formatCurrency(order.codFee)}</span>
                </div>
              )}
              <div className="pt-2 border-t flex justify-between items-center text-sm font-bold">
                <span className="text-foreground">Final Payable Amount:</span>
                <span className="text-base font-extrabold text-foreground">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Shipping partner info */}
        <div className="bg-muted/40 p-5 rounded-2xl mb-8 text-sm flex gap-4 items-start border">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0 mt-0.5">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground mb-0.5">Safe Delivery via Delhivery Direct</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {order?.shippingAddress ? (
                <>Delivering to: <span className="font-medium text-foreground">{order.shippingAddress}</span></>
              ) : (
                'Your items will be carefully packed and dispatched with real-time tracking.'
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="rounded-full px-8 shadow-sm">
            <Link href="/orders">
              View My Orders <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild size="lg" className="rounded-full px-8">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center">Loading confirmation...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
