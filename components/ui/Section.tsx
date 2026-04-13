import React from 'react'
import clsx from 'clsx'

interface SectionProps {
  children: React.ReactNode
  className?: string
  bg?: 'default' | 'muted' | 'primary' | 'dark'
  id?: string
}

export function Section({ children, className, bg = 'default', id }: SectionProps) {
  return (
    <section
      id={id}
      className={clsx(
        'py-20 lg:py-24',
        bg === 'default' && 'bg-white dark:bg-gray-900',
        bg === 'muted' && 'bg-gray-50 dark:bg-gray-800/50',
        bg === 'primary' && 'bg-blue-600 text-white',
        bg === 'dark' && 'bg-gray-900 text-white',
        className
      )}
    >
      {children}
    </section>
  )
}

interface SectionHeaderProps {
  title: string
  subtitle?: string
  centered?: boolean
  light?: boolean
}

export function SectionHeader({ title, subtitle, centered = true, light = false }: SectionHeaderProps) {
  return (
    <div className={clsx('mb-16', centered && 'text-center')}>
      <h2
        className={clsx(
          'text-3xl sm:text-4xl lg:text-5xl font-bold mb-4',
          light ? 'text-white' : 'text-gray-900 dark:text-white'
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={clsx(
            'text-lg sm:text-xl max-w-2xl mx-auto',
            light ? 'text-blue-100' : 'text-gray-600 dark:text-gray-300'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
