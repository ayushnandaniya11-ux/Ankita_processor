import type { Metadata } from 'next'
import { RotateCcw } from 'lucide-react'
import { Button } from '@ankita/ui'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Returns & Exchanges | Profile' }

export default function ReturnsPage() {
  return (
    <div className="rounded-xl border bg-card p-6 h-full">
      <div className="mb-6 border-b pb-4">
        <h2 className="text-xl font-semibold">Returns & Exchanges</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your product returns and exchange requests.</p>
      </div>
      
      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-muted p-4 text-muted-foreground">
          <RotateCcw className="h-8 w-8" />
        </div>
        <h3 className="mb-2 font-semibold">No active returns</h3>
        <p className="mb-6 text-sm text-muted-foreground max-w-sm">
          You don&apos;t have any ongoing return or exchange requests.
        </p>
        <Link href="/profile/orders">
          <Button variant="outline">View Order History</Button>
        </Link>
      </div>
    </div>
  )
}
