'use client'

import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-700">404</h1>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Oops! Page not found
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => window.history.back()} variant="secondary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Link href="/dashboard">
              <Button>
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}