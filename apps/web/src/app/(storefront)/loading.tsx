import { Skeleton } from '@ankita/ui'

export default function HomeLoading() {
  return (
    <div className="space-y-16">
      {/* Hero skeleton */}
      <Skeleton className="h-[480px] w-full" />
      {/* New Arrivals skeleton */}
      <div className="container-wide space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[3/4] w-full rounded-md" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
