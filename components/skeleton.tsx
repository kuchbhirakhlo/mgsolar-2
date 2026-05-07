export function Skeleton({
  className = '',
}: {
  className?: string
}) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" />
    </div>
  )
}
