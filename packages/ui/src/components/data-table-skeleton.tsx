import { Skeleton } from './skeleton'

interface DataTableSkeletonProps {
  columnCount?: number
  rowCount?: number
}

export function DataTableSkeleton({ columnCount = 5, rowCount = 10 }: DataTableSkeletonProps) {
  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-32" />
      </div>
      {/* Table */}
      <div className="rounded-md border">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex gap-4">
            {Array.from({ length: columnCount }).map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
        </div>
        {/* Rows */}
        {Array.from({ length: rowCount }).map((_, i) => (
          <div key={i} className="border-b p-4 last:border-0">
            <div className="flex gap-4">
              {Array.from({ length: columnCount }).map((_, j) => (
                <Skeleton key={j} className="h-4 flex-1" />
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Pagination */}
      <div className="flex justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-48" />
      </div>
    </div>
  )
}
