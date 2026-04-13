import React from 'react'
import clsx from 'clsx'

interface LoadingSkeletonProps {
  count?: number
  height?: string
}

export const LoadingSkeleton = ({ count = 1, height = 'h-12' }: LoadingSkeletonProps) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={clsx('bg-gray-200 rounded animate-pulse', height)} />
    ))}
  </div>
)

export const TableSkeleton = () => (
  <div className="space-y-4">
    <LoadingSkeleton count={8} height="h-10" />
  </div>
)

export const CardSkeleton = () => (
  <div className="bg-white rounded-lg border border-border-gray p-6 space-y-4">
    <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2" />
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
    </div>
  </div>
)
