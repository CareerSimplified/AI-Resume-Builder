'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSkeleton } from './Loading'
import { Sidebar, SidebarTrigger } from './Sidebar'
import { ThemeToggle } from './ui/ThemeToggle'
import { Search } from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
  sidebarItems: any[]
}

export const DashboardLayout = ({ children, sidebarItems }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white dark:bg-[#030712]">
      <div className="hidden md:block">
        <Sidebar items={sidebarItems} />
      </div>

      <Sidebar
        items={sidebarItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMobile
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3 md:hidden">
              <SidebarTrigger onClick={() => setSidebarOpen(true)} />
              <h1 className="text-lg font-bold text-blue-600">AI Resume Builder</h1>
            </div>

            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <ThemeToggle />
              
              {user && (
                <div className="hidden md:flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                    {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name || 'User'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
