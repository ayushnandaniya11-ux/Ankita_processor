'use client'

import { MapPin } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export function AddressList() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="animate-pulse">Loading addresses...</div>
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center border rounded-xl border-dashed">
      <div className="mb-4 rounded-full bg-muted p-4 text-muted-foreground">
        <MapPin className="h-8 w-8" />
      </div>
      <h3 className="mb-2 font-semibold">No addresses saved</h3>
      <p className="mb-6 text-sm text-muted-foreground max-w-sm">
        You haven&apos;t added any addresses yet. Add one now to make checkout faster.
      </p>
    </div>
  )
}
