'use client'

import { useAuth as useAuthContext } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export const useAuth = () => {
  const { user, loading, logout } = useAuthContext()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return { user, loading, mounted, logout }
}

export const useRequireAuth = () => {
  const { user, loading, mounted, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!mounted || loading) return
    if (!user) {
      const currentPath = window.location.pathname + window.location.search
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`)
    }
  }, [user, loading, mounted, router])

  return { user, loading, mounted, logout }
}

export const useRequireAdmin = () => {
  const { user, loading, mounted, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!mounted || loading) return
    if (!user) {
      router.push('/admin/login?redirect=/admin/dashboard')
    } else if (user.role !== 'admin') {
      router.push('/admin/login')
    }
  }, [user, loading, mounted, router])

  return { user, loading, mounted, logout }
}

export const useAdminRoute = () => useRequireAdmin()
