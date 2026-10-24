'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import {
  ShoppingBag,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  FileText,
  CreditCard,
  RotateCcw,
  Loader2,
  AlertTriangle,
  Banknote,
} from 'lucide-react'
import { Button, Badge, Separator } from '@ankita/ui'
import apiClient from '@/lib/api/client'
import { useAuth } from '@/hooks/use-auth'
import { formatCurrency, resolveImageUrl } from '@ankita/utils'
import { retryOnlinePayment } from '@/lib/razorpay'
import { toast } from 'sonner'

const fetcher = (url: string) => apiClient.get(url).then((res) => res.data)

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { data, error, isLoading, mutate } = useSWR(user ? '/orders' : null, fetcher)
  const [retryingOrderId, setRetryingOrderId] = useState<number | null>(null)

  const handleRetryPayment = async (order: any) => {
    try {
      setRetryingOrderId(order.id)
      await retryOnlinePayment({
        orderId: order.id,
        customerName: user?.name,
        customerEmail: user?.email,
        customerPhone: user?.phone,
        onSuccess: () => {
          toast.success('Payment verified successfully! Your order is now confirmed.')
          mutate()
        },
        onError: (err) => {
          toast.error(err?.message || 'Payment retry failed. Please try again.')
          mutate()
        },
      })
    } catch (err: any) {
      toast.error(err?.message || 'Could not initiate payment retry.')
    } finally {
      setRetryingOrderId(null)
    }
  }

  if (authLoading) {
    return (
      <div className="container-wide py-12 max-w-4xl">
        <h1 className="mb-6 text-2xl font-bold">My Orders</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-28 bg-muted rounded-xl"></div>
          <div className="h-28 bg-muted rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container-wide py-12 max-w-4xl">
        <h1 className="mb-6 text-2xl font-bold">My Orders</h1>
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-2xl border-dashed">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/60 mb-4" />
          <h2 className="text-xl font-bold mb-2">Please sign in to view your orders</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Sign in with your customer account to track shipments and view past purchases.
          </p>
          <Button asChild>
            <Link href="/login/customer">Login to Your Account</Link>
          </Button>
        </div>
      </div>
    )
  }

  const orders = data?.orders || []

  return (
    <div className="container-wide py-8 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">My Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and manage your order and payment history</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <div className="h-28 bg-muted rounded-xl animate-pulse"></div>
          <div className="h-28 bg-muted rounded-xl animate-pulse"></div>
        </div>
      )}

      {!isLoading && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-2xl border-dashed">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="mb-1 text-base font-semibold">No orders placed yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            When you place an order, it will appear here with live tracking updates.
          </p>
          <Button asChild>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      )}

      {!isLoading && orders.length > 0 && (
        <div className="space-y-5">
          {orders.map((order: any) => {
            const isDelivered = order.status === 'DELIVERED'
            const isCancelled = order.status === 'CANCELLED'
            const isOnline = order.paymentMethod === 'ONLINE'
            const isCOD = order.paymentMethod === 'COD'
            const isPaid = order.paymentStatus === 'PAID'
            const isFailed = order.paymentStatus === 'FAILED'
            const isRefunded = order.paymentStatus === 'REFUNDED'
            const isPending = order.paymentStatus === 'PENDING'
            const canRetry = isOnline && (isFailed || isPending) && !isCancelled && order.status !== 'DELIVERED'

            return (
              <div
                key={order.id}
                className="rounded-2xl border bg-card p-6 space-y-4 shadow-sm hover:border-muted-foreground/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b">
                  <div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      <Link
                        href={`/orders/${order.id || order.orderNo}`}
                        className="font-bold text-foreground hover:underline"
                      >
                        Order #{order.orderNo}
                      </Link>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Placed on{' '}
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={isDelivered ? 'default' : isCancelled ? 'destructive' : 'secondary'}
                      className="text-xs uppercase tracking-wider"
                    >
                      {order.status}
                    </Badge>

                    {/* Payment Badge */}
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Paid
                      </span>
                    ) : isRefunded ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-400">
                        <RotateCcw className="h-3 w-3" /> Refunded
                      </span>
                    ) : isFailed ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400">
                        <XCircle className="h-3 w-3" /> Payment Failed
                      </span>
                    ) : isCOD ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400">
                        <Banknote className="h-3 w-3" /> COD: {order.codPaymentStatus?.replace('COD_', '') || 'Pending'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400">
                        <Clock className="h-3 w-3" /> Payment Pending
                      </span>
                    )}

                    <Badge variant="outline" className="text-xs">
                      {order.paymentMethod}
                    </Badge>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {order.items?.map((item: any) => {
                    const itemImg = resolveImageUrl(
                      item.productImage || item.product?.imageUrl || item.product?.images?.[0]?.url
                    )
                    return (
                      <div key={item.id} className="flex items-center gap-3 py-1">
                        <div className="h-12 w-10 shrink-0 overflow-hidden rounded-md border bg-muted flex items-center justify-center">
                          {itemImg ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={itemImg}
                              alt={item.productName || item.product?.name || 'Product'}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                ;(e.currentTarget as HTMLElement).style.display = 'none'
                              }}
                            />
                          ) : (
                            <span className="text-xs">🛍️</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">
                            {item.productName || item.product?.name || 'Product'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity} · Rate: {formatCurrency(item.rate)}
                          </p>
                        </div>
                        <span className="font-semibold text-sm">{formatCurrency(item.total)}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Payment Warning / Retry Alert */}
                {canRetry && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 dark:bg-amber-950/20 dark:border-amber-900/50">
                    <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                      <span>
                        Online payment was not completed. Complete payment now to guarantee processing and dispatch.
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleRetryPayment(order)}
                      disabled={retryingOrderId === order.id}
                      className="h-8 gap-1.5 shrink-0 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs rounded-lg"
                    >
                      {retryingOrderId === order.id ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-3.5 w-3.5" />
                          Retry Payment
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <Separator />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground pt-1">
                  <div>
                    <span className="font-medium text-foreground">Delivery To: </span>
                    <span className="line-clamp-1">{order.shippingAddress}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-foreground mr-1">
                      Total: {formatCurrency(order.totalAmount)}
                    </span>
                    <Link href={`/orders/${order.id || order.orderNo}`}>
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/orders/${order.id || order.orderNo}/invoice`} target="_blank">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1.5 border-[#00313B]/30 hover:bg-[#00313B]/5 text-[#00313B] dark:text-[#5eead4]"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Invoice
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
