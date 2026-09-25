import type { Metadata } from 'next'
import { ShoppingCart, Package, Users, TrendingUp, ArrowUpRight, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@ankita/ui'
import { formatCurrency } from '@ankita/utils'

export const metadata: Metadata = { title: 'Dashboard' }

const STATS = [
  { title: "Today's Revenue", value: formatCurrency(0), change: '0%', icon: TrendingUp, positive: true },
  { title: 'Orders Today', value: '0', change: '0 vs yesterday', icon: ShoppingCart, positive: true },
  { title: 'Products', value: '0', change: '0 this week', icon: Package, positive: true },
  { title: 'Customers', value: '0', change: '0 this month', icon: Users, positive: true },
]

const RECENT_ORDERS = [] as Array<{
  id: string
  customer: string
  amount: number
  status: string
  time: string
}>

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PACKED: 'bg-amber-100 text-amber-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className={`mt-1 text-xs flex items-center gap-1 ${stat.positive ? 'text-emerald-600' : 'text-destructive'}`}>
                <ArrowUpRight className="h-3 w-3" />
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <a href="/dashboard/orders" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {RECENT_ORDERS.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {order.customer.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{order.customer}</p>
                    <p className="text-xs text-muted-foreground">Order #{order.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-semibold">{formatCurrency(order.amount)}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />{order.time}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status] || 'bg-muted text-muted-foreground'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alerts</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">0</p>
            <p className="text-xs text-muted-foreground">Products need restocking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Pending Returns</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">0</p>
            <p className="text-xs text-muted-foreground">Returns awaiting action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Wholesale Applications</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">0</p>
            <p className="text-xs text-muted-foreground">Pending approval</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
