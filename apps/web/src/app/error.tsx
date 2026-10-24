'use client'

import { useEffect } from 'react'
import { Button } from '@ankita/ui'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Storefront Application Error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16 space-y-5">
      <div className="h-16 w-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          An unexpected error occurred while loading this page. Please try again.
        </p>
      </div>
      <Button onClick={() => reset()} className="gap-2">
        <RotateCcw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  )
}
