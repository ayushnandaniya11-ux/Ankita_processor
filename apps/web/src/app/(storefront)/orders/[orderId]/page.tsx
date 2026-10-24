'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Package,
  Truck,
  FileText,
  CreditCard,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Banknote,
  AlertTriangle,
  Loader2,
  ExternalLink,
  MapPin,
  Calendar,
  ShieldCheck,
} from 'lucide-react'
import { Button, Badge, Separator, Card, CardContent, CardHeader, CardTitle } from '@ankita/ui'
import apiClient from '@/lib/api/client'
import { formatCurrency, resolveImageUrl } from '@ankita/utils'
import { retryOnlinePayment } from '@/lib/razorpay'
import { toast } from 'sonner'
import { ReturnRequestDialog } from '@/components/returns/return-request-dialog'

export default function OrderDetailPage() {
  const params = useParams()
  const orderIdentifier = params?.orderId as string

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [returnItem, setReturnItem] = useState<any | null>(null)
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)

  const fetchOrder = useCallback(async () => {
    if (!orderIdentifier) return
    try {
      setLoading(true)
      // Try /orders/:id first, fallback to lookupByOrderNo
      let res
      try {
        res = await apiClient.get(`/orders/${orderIdentifier}`)
      } catch (err: any) {
        if (err?.response?.status === 404 || isNaN(Number(orderIdentifier))) {
          res = await apiClient.get(`/orders/lookup/${orderIdentifier}`)
        } else {
          throw err
        }
      }
      setOrder(res.data.order)
      setError(null)
    } catch (err: any) {
      console.error('Failed to load order:', err)
      setError(err?.response?.data?.error || 'Order not found or permission denied.')
    } finally {
      setLoading(false)
    }
  }, [orderIdentifier])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  const handleRetryPayment = async () => {
    if (!order) return
    try {
      setIsRetrying(true)
      await retryOnlinePayment({
        orderId: order.id,
        onSuccess: () => {
          toast.success('Payment completed & verified successfully!')
          fetchOrder()
        },
        onError: (err) => {
          toast.error(err?.message || 'Payment retry failed.')
          fetchOrder()
        },
      })
    } catch (err: any) {
      toast.error(err?.message || 'Could not initiate payment retry.')
    } finally {
      setIsRetrying(false)
    }
  }

  if (loading) {
    return (
      <div className="container-wide py-12 max-w-4xl space-y-6">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        <div className="h-10 w-64 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container-wide py-16 max-w-2xl text-center space-y-4">
        <div className="p-4 rounded-full bg-rose-50 text-rose-600 w-16 h-16 mx-auto flex items-center justify-center">
          <XCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold">Order Not Found</h1>
        <p className="text-sm text-muted-foreground">{error || 'Could not find details for this order.'}</p>
        <div className="pt-4">
          <Button asChild>
            <Link href="/orders">Back to My Orders</Link>
          </Button>
        </div>
      </div>
    )
  }

  const isDelivered = order.status === 'DELIVERED'
  const isCancelled = order.status === 'CANCELLED'
  const isOnline = order.paymentMethod === 'ONLINE'
  const isCOD = order.paymentMethod === 'COD'
  const isPaid = order.paymentStatus === 'PAID'
  const isFailed = order.paymentStatus === 'FAILED'
  const isRefunded = order.paymentStatus === 'REFUNDED'
  const isPending = order.paymentStatus === 'PENDING'
  const canRetry = isOnline && (isFailed || isPending) && !isCancelled && !isDelivered

  const latestPayment = Array.isArray(order.payments) && order.payments.length > 0 ? order.payments[0] : null

  return (
    <div className="container-wide py-8 max-w-4xl space-y-6">
      <Link
        href="/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to My Orders
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Order #{order.orderNo}</h1>
            <Badge
              variant={isDelivered ? 'default' : isCancelled ? 'destructive' : 'secondary'}
              className="text-xs uppercase"
            >
              {order.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Placed on{' '}
            {new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/orders/${order.id || order.orderNo}/invoice`} target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-[#00313B]/30 hover:bg-[#00313B]/5 text-[#00313B] dark:text-[#5eead4]"
            >
              <FileText className="h-4 w-4" />
              Tax Invoice
            </Button>
          </Link>
          {(order.trackingNumber || order.awbNumber) && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={
                  order.trackingUrl ||
                  `https://www.delhivery.com/track/package/${order.awbNumber || order.trackingNumber}`
                }
                target="_blank"
                rel="noreferrer"
              >
                <Truck className="h-4 w-4 mr-1.5" />
                Track Shipment
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Payment Notification Alert (if retryable) */}
      {canRetry && (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 dark:bg-amber-950/20 dark:border-amber-900/50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Payment Incomplete or Awaiting Confirmation
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                We haven&apos;t received confirmed payment for this order yet. Complete online payment now to guarantee
                order processing and priority fulfillment.
              </p>
            </div>
          </div>
          <Button
            onClick={handleRetryPayment}
            disabled={isRetrying}
            className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-sm gap-1.5"
          >
            {isRetrying ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Retrying...
              </>
            ) : (
              <>
                <CreditCard className="w-3.5 h-3.5" /> Complete Payment Now
              </>
            )}
          </Button>
        </div>
      )}

      {/* Grid: Payment & Shipment Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Payment Summary Card */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" /> Payment Status
              </span>
              {isPaid ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3" /> Paid
                </span>
              ) : isRefunded ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
                  <RotateCcw className="h-3 w-3" /> Refunded
                </span>
              ) : isFailed ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
                  <XCircle className="h-3 w-3" /> Payment Failed
                </span>
              ) : isCOD ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                  <Banknote className="h-3 w-3" /> COD: {order.codPaymentStatus?.replace('COD_', '') || 'Pending'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                  <Clock className="h-3 w-3" /> Pending
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 text-xs space-y-2.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method:</span>
              <span className="font-semibold text-foreground">{order.paymentMethod}</span>
            </div>
            {order.razorpayOrderId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gateway Order ID:</span>
                <span className="font-mono text-[11px] text-foreground">{order.razorpayOrderId}</span>
              </div>
            )}
            {order.razorpayPaymentId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gateway Payment ID:</span>
                <span className="font-mono text-[11px] text-foreground">{order.razorpayPaymentId}</span>
              </div>
            )}
            {latestPayment?.method && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Channel:</span>
                <span className="font-medium text-foreground uppercase">{latestPayment.method}</span>
              </div>
            )}
            {order.paidAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Verified On:</span>
                <span className="font-medium text-foreground">
                  {new Date(order.paidAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
            {isCOD && (
              <div className="pt-2 border-t mt-2 text-[11px] text-muted-foreground">
                <p>
                  Cash on Delivery payment will be collected by the logistics courier at the time of delivery.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shipping & Delivery Card */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" /> Shipping & Delivery
              </span>
              <span className="text-xs font-semibold text-foreground uppercase">
                {order.courier || (order.shipment?.courierName) || 'Delhivery Express'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 text-xs space-y-2.5">
            {(order.trackingNumber || order.awbNumber) ? (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Waybill (AWB):</span>
                <span className="font-mono font-bold text-primary">{order.awbNumber || order.trackingNumber}</span>
              </div>
            ) : (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Waybill Status:</span>
                <span className="text-muted-foreground italic">Generating upon warehouse dispatch</span>
              </div>
            )}
            <div className="pt-1">
              <span className="text-muted-foreground block mb-1">Delivery Address:</span>
              <p className="font-medium text-foreground leading-relaxed bg-muted/30 p-2.5 rounded-lg border">
                {order.shippingAddress || 'Customer Address'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card className="rounded-2xl shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" /> Ordered Items ({order.items?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {order.items?.map((item: any) => {
              const itemImg = resolveImageUrl(
                item.productImage || item.product?.imageUrl || item.product?.images?.[0]?.url
              )
              return (
                <div key={item.id} className="p-4 sm:p-5 flex items-center gap-4 hover:bg-muted/10 transition-colors">
                  <div className="h-14 w-12 shrink-0 overflow-hidden rounded-lg border bg-muted flex items-center justify-center">
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
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Quantity: <span className="font-medium text-foreground">{item.quantity}</span> · Unit Rate:{' '}
                      {formatCurrency(item.rate)}
                      {item.taxAmount > 0 && <span> · GST: {formatCurrency(item.taxAmount)}</span>}
                    </p>
                    {isDelivered && (
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setReturnItem(item)
                            setReturnDialogOpen(true)
                          }}
                          className="h-7 text-[11px] gap-1.5 border-primary/30 text-primary hover:bg-primary/5 rounded-lg"
                        >
                          <RotateCcw className="w-3 h-3" /> Request Return / Exchange
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-foreground text-sm">{formatCurrency(item.total)}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pricing Totals */}
          <div className="p-5 bg-muted/30 border-t space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal:</span>
              <span className="font-medium text-foreground">{formatCurrency(order.subtotal || 0)}</span>
            </div>
            {Number(order.taxAmount) > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Applicable GST:</span>
                <span className="font-medium text-foreground">{formatCurrency(order.taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping Fee:</span>
              <span className="font-medium text-emerald-600">
                {Number(order.shippingFee) === 0 ? 'FREE' : formatCurrency(order.shippingFee)}
              </span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Discount:</span>
                <span className="font-medium text-rose-600">-{formatCurrency(order.discount)}</span>
              </div>
            )}
            {Number(order.codFee) > 0 && (
              <div className="flex justify-between text-amber-700 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900">
                <span>Cash on Delivery (COD) Fee:</span>
                <span>+{formatCurrency(order.codFee)}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between text-sm font-extrabold text-foreground pt-1">
              <span>Total Payable:</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {returnItem && (
        <ReturnRequestDialog
          open={returnDialogOpen}
          onOpenChange={setReturnDialogOpen}
          order={order}
          item={returnItem}
          onSuccess={() => {
            fetchOrder()
          }}
        />
      )}
    </div>
  )
}
