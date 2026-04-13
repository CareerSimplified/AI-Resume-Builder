import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import clsx from 'clsx'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme, mounted } = useTheme()

  if (!mounted) {
    return (
      <div className={clsx('w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse', className)} />
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className={clsx(
        'w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        'focus:outline-none focus:ring-2 focus:ring-blue-500',
        'text-gray-600 dark:text-gray-300',
        className
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  )
}
