'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, LogOut, Menu, X } from 'lucide-react'
import clsx from 'clsx'
import { Button } from './ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/auth.service'
import { useToast } from '@/hooks/useToast'
import { LucideIcon } from 'lucide-react'

interface SidebarItem {
  label: string
  href: string
  icon: LucideIcon
}

interface SidebarProps {
  items: SidebarItem[]
  isOpen?: boolean
  onClose?: () => void
  isMobile?: boolean
}

export const Sidebar = ({ items, isOpen = true, onClose, isMobile = false }: SidebarProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { success, error } = useToast()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      success('Logged out successfully')
    } catch (err) {
      error('Logout failed')
    }
  }

  if (isMobile && !isOpen) {
    return null
  }

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64'
  const baseClasses = 'bg-white dark:bg-[#0b0f1a] border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen transition-all duration-300'
  const mobileClasses = isMobile ? 'fixed left-0 top-0 z-50 shadow-xl' : 'relative'

  return (
    <>
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      )}
      <nav className={clsx(baseClasses, mobileClasses, sidebarWidth)}>
        <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-blue-600">AI Resume Builder</h1>
          )}
          {isMobile && isOpen && (
            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          )}
          {!isMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          )}
        </div>

        {!isCollapsed && user && (
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name || 'User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={clsx('w-5 h-5 flex-shrink-0', isActive ? 'text-white' : '')} />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            )
          })}
        </div>

        <div className="p-3 border-t border-gray-100 dark:border-gray-700">
          <Button
            variant="danger"
            size="sm"
            fullWidth={!isCollapsed}
            onClick={handleLogout}
            className={clsx(
              'flex items-center justify-center gap-2',
              isCollapsed && 'px-0'
            )}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </nav>
    </>
  )
}

export const SidebarTrigger = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
  >
    <Menu className="w-6 h-6" />
  </button>
)
