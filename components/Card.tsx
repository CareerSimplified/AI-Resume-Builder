import React from 'react'
import clsx from 'clsx'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, hover = true, padding = 'md', ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-soft transition-all duration-200',
        paddingStyles[padding],
        hover && 'hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)

Card.displayName = 'Card'

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  action?: React.ReactNode
  children?: React.ReactNode
}

export const CardHeader = ({ title, subtitle, action, children, className, ...props }: CardHeaderProps) => (
  <div className={clsx('flex items-start justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700', className)} {...props}>
    <div>
      {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>}
      {children}
    </div>
    {action && <div>{action}</div>}
  </div>
)

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={clsx('text-gray-700 dark:text-gray-300', className)} {...props}>
    {children}
  </div>
))

CardBody.displayName = 'CardBody'
