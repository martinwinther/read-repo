import { Skeleton } from "./skeleton"
import { Card, CardContent, CardHeader } from "./card"

// Book table loading skeleton
export function BookTableSkeleton() {
  return (
    <div className="w-full space-y-4">
      {/* Search bar skeleton */}
      <div className="flex items-center gap-3 mb-6 px-1">
        <Skeleton className="h-11 flex-1" />
        <Skeleton className="h-11 w-20 hidden md:block" />
      </div>

      {/* Mobile cards skeleton */}
      <div className="md:hidden space-y-3 px-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop table skeleton */}
      <div className="hidden md:block">
        <div className="rounded-lg border bg-card">
          {/* Table header */}
          <div className="flex items-center h-12 px-4 border-b bg-muted/30">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-1 px-3">
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
          
          {/* Table rows */}
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center h-16 px-4 border-b last:border-0">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="flex-1 px-3">
                  <Skeleton className="h-4 w-full max-w-32" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-center gap-3 py-6">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-16" />
      </div>
    </div>
  )
}

// Book search results skeleton
export function BookSearchSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
          <Skeleton className="h-20 w-16 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-9 w-16 mt-4" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Loading spinner component
export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        <div className="h-8 w-8 rounded-full border-2 border-muted-foreground/20"></div>
        <div className="absolute inset-0 h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    </div>
  )
}

// Inline loading state for buttons and small areas
export function InlineLoader({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }
  
  return (
    <div className={`relative ${sizeClasses[size]}`}>
      <div className={`${sizeClasses[size]} rounded-full border-2 border-current/20`}></div>
      <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-2 border-current border-t-transparent animate-spin`}></div>
    </div>
  )
} 