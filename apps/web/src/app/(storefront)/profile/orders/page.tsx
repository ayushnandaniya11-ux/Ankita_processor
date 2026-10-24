'use client'

import useSWR from 'swr'
import Link from 'next/link'
import { Package, ShoppingBag, FileText, Download } from 'lucide-react'
import { Button, Badge, Separator } from '@ankita/ui'

import apiClient from '@/lib/api/client'
import { useAuth } from '@/hooks/use-auth'
import { formatCurrency, resolveImageUrl } from '@ankita/utils'

const fetcher = (url: string) => apiClient.get(url).then((res) => res.data)

export default function ProfileOrdersPage() {
  const { user } = useAuth()
  const { data, isLoading } = useSWR(user ? '/orders' : null, fetcher)

  const orders = data?.orders || []

  return (
    <div className="rounded-xl border bg-card p-6 h-full space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold">My Orders</h2>
        <p className="text-sm text-muted-foreground mt-1">View and track your recent orders.</p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <div className="h-24 bg-muted rounded-xl animate-pulse"></div>
          <div className="h-24 bg-muted rounded-xl animate-pulse"></div>
        </div>
      )}

      {!isLoading && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-muted p-4 text-muted-foreground">
            <Package className="h-8 w-8" />
          </div>
          <h3 className="mb-2 font-semibold">No orders found</h3>
          <p className="mb-6 text-sm text-muted-foreground max-w-sm">
            You haven&apos;t placed any orders yet. Start exploring our collection to find your next favorite item.
          </p>
          <Link href="/products">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      )}

      {!isLoading && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="rounded-xl border bg-background p-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <Link href={`/orders/${order.id || order.orderNo}`} className="font-bold hover:underline">
                    #{order.orderNo}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <Badge variant={order.status === 'DELIVERED' ? 'default' : 'secondary'} className="text-xs">
                  {order.status}
                </Badge>
              </div>

              <div className="text-xs space-y-2 text-muted-foreground">
                {order.items?.map((item: any) => {
                  const itemImg = resolveImageUrl(item.productImage || item.product?.imageUrl || item.product?.images?.[0]?.url)
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="h-10 w-9 shrink-0 overflow-hidden rounded border bg-muted flex items-center justify-center">
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
                        <p className="font-medium text-foreground truncate">{item.productName || item.product?.name || 'Product'}</p>
                        <p className="text-[11px] text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium text-foreground text-xs">{formatCurrency(item.total)}</span>
                    </div>
                  )
                })}
              </div>

              <Separator />

              <div className="flex flex-wrap justify-between items-center gap-2 text-xs pt-1">
                <span className="text-muted-foreground">
                  {order.paymentMethod} ·{' '}
                  <span
                    className={`font-semibold ${
                      order.paymentStatus === 'PAID'
                        ? 'text-emerald-600'
                        : order.paymentStatus === 'FAILED'
                        ? 'text-rose-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground mr-1">{formatCurrency(order.totalAmount)}</span>
                  <Link href={`/orders/${order.id || order.orderNo}`}>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      Details
                    </Button>
                  </Link>
                  <Link href={`/orders/${order.id || order.orderNo}/invoice`} target="_blank">
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-[#00313B]/30 hover:bg-[#00313B]/5 text-[#00313B] dark:text-[#5eead4]">
                      <FileText className="h-3.5 w-3.5" />
                      View
                    </Button>
                  </Link>
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1'}/orders/${order.id || order.orderNo}/invoice/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="secondary" size="sm" className="h-8 text-xs gap-1.5 bg-[#00313B]/10 hover:bg-[#00313B]/20 text-[#00313B] dark:text-white">
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </Button>
                  </a>
                </div>
              </div>
            </div>

          ))}
        </div>
      )}
    </div>
  )
}
