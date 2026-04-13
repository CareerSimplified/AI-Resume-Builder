import React from 'react'
import clsx from 'clsx'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
  asChild?: boolean
  href?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  asChild = false,
  href,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = clsx(
    'font-semibold rounded-lg transition-all duration-200',
    'flex items-center justify-center gap-2',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  )

  const variantStyles = {
    primary: clsx(
      'bg-blue-600 text-white',
      'hover:bg-blue-700 active:bg-blue-800',
      'focus:ring-blue-500',
      'dark:bg-blue-600 dark:hover:bg-blue-700'
    ),
    secondary: clsx(
      'bg-gray-100 text-gray-900',
      'hover:bg-gray-200 active:bg-gray-300',
      'focus:ring-gray-500',
      'dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
      'dark:border dark:border-gray-700'
    ),
    ghost: clsx(
      'bg-transparent text-gray-700',
      'hover:bg-gray-100 active:bg-gray-200',
      'focus:ring-gray-500',
      'dark:text-gray-300 dark:hover:bg-gray-800'
    ),
    danger: clsx(
      'bg-red-600 text-white',
      'hover:bg-red-700 active:bg-red-800',
      'focus:ring-red-500',
      'dark:bg-red-600 dark:hover:bg-red-700'
    ),
    outline: clsx(
      'bg-transparent border-2 border-blue-600 text-blue-600',
      'hover:bg-blue-50 active:bg-blue-100',
      'focus:ring-blue-500',
      'dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20'
    ),
  }

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const buttonClass = clsx(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && 'w-full',
    className
  )

  if (href) {
    return (
      <Link href={href} className={buttonClass}>
        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </Link>
    )
  }

  return (
    <button
      disabled={disabled || loading}
      className={buttonClass}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  )
}
