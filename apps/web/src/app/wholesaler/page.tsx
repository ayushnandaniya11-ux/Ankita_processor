'use client'

import { useAuth } from '@/hooks/use-auth'
import { Card } from '@ankita/ui'
import { Package, MessageSquare, Clock } from 'lucide-react'
import Link from 'next/link'

export default function WholesalerDashboard() {
  const { user } = useAuth()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wholesaler Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back, {user?.name || 'Partner'}. Here is your business overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Available Catalogs</p>
              <h3 className="text-2xl font-bold">View Catalogs</h3>
              <Link href="/wholesaler/catalogs" className="text-sm text-primary hover:underline">Browse now &rarr;</Link>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">My Inquiries</p>
              <h3 className="text-2xl font-bold">Manage</h3>
              <Link href="/wholesaler/inquiries" className="text-sm text-primary hover:underline">View all &rarr;</Link>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-full text-green-500">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Account Status</p>
              <h3 className="text-2xl font-bold text-green-600">Active</h3>
              <p className="text-sm text-muted-foreground">Approved wholesale partner</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
