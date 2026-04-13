import React from 'react'
import clsx from 'clsx'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  color?: string
  height?: string
  showLabel?: boolean
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  label,
  color = 'bg-blue-600',
  height = 'h-2',
  showLabel = false,
  className
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  const getColorClass = () => {
    if (color !== 'bg-blue-600') return color
    if (percentage >= 80) return 'bg-green-600'
    if (percentage >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className={className}>
      {(label || showLabel) && (
        <div className="flex justify-between text-sm mb-2">
          {label && (
            <span className="text-gray-600 dark:text-gray-400">{label}</span>
          )}
          {showLabel && (
            <span className="font-semibold text-gray-900 dark:text-white">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${height} overflow-hidden`}>
        <div
          className={clsx(`${height} rounded-full transition-all duration-500 ease-out`, getColorClass())}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
