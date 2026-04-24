'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LoadingSkeleton } from '@/components/Loading'

export default function CallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Wait for session to be established
        const { data: authData } = await supabase.auth.getSession()

        if (authData?.session?.user) {
          const userId = authData.session.user.id
          const email = authData.session.user.email || ''
          const name = authData.session.user.user_metadata?.name || ''
          const role = authData.session.user.user_metadata?.role || 'user'

          // Get user info from our API to check role
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${authData.session.access_token}`,
            },
          })

          const result = await response.json()
          const searchParams = new URLSearchParams(window.location.search)
          const redirectTo = searchParams.get('redirect')

          if (result.success && result.data) {
            const userRole = result.data.role || role
            // Redirect based on user role or redirect parameter
            if (redirectTo) {
               window.location.href = redirectTo
            } else if (userRole === 'admin') {
              window.location.href = '/admin'
            } else {
              window.location.href = '/dashboard'
            }
          } else {
            window.location.href = redirectTo || '/dashboard'
          }
        } else {
          window.location.href = '/auth/login'
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        window.location.href = '/auth/login'
      }
    }

    handleCallback()
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-[#030712] flex items-center justify-center">
      <div className="w-full max-w-md p-4">
        <LoadingSkeleton count={3} height="h-20" />
      </div>
    </div>
  )
}