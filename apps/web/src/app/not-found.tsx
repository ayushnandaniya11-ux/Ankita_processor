import Link from 'next/link'
import { Button } from '@ankita/ui'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 space-y-6">
      <div className="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        <Compass className="h-10 w-10 animate-spin-slow" />
      </div>
      <div className="space-y-2 max-w-md">
        <span className="text-xs uppercase font-bold tracking-widest text-primary">Error 404</span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Page Not Found</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The page or product you are looking for doesn&apos;t exist or may have been moved.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button asChild size="lg">
          <Link href="/">Back to Homepage</Link>
        </Button>
        <Button variant="outline" asChild size="lg">
          <Link href="/products">Browse Collection</Link>
        </Button>
      </div>
    </div>
  )
}
