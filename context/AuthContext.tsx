'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@/types'
import { useRouter } from 'next/navigation'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const refreshUser = async () => {
    console.log('[AuthContext] refreshUser via API started')
    try {
      // Use the internal /api/auth/me for standard session checking
      // This is a "proper API call" visible in the network tab
      const response = await fetch('/api/auth/me')
      const result = await response.json()
      
      if (result.success && result.data) {
        console.log('[AuthContext] User found via API:', result.data.id)
        setUser(result.data)
      } else {
        console.log('[AuthContext] No user found via API')
        setUser(null)
      }
    } catch (err) {
      console.error('[AuthContext] API auth error:', err)
      setUser(null)
    } finally {
      setLoading(false)
      console.log('[AuthContext] loading set to false')
    }
  }

  useEffect(() => {
    // Safety net: Force loading=false after 10 seconds if nothing else happens
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('[AuthContext] Auth check timed out. Forcing loading=false.')
        setLoading(false)
      }
    }, 10000)

    refreshUser()

    // We still keep the listener for logout/login events in same tab
    if (isSupabaseConfigured()) {
      const { data: authListener } = getSupabase().auth.onAuthStateChange((event) => {
        console.log('[AuthContext] Auth event:', event)
        if (event === 'SIGNED_OUT') {
           setUser(null)
           setLoading(false)
        } else if (event === 'SIGNED_IN') {
           refreshUser()
        }
      })
      return () => {
        clearTimeout(timeout)
        authListener.subscription.unsubscribe()
      }
    }

    return () => clearTimeout(timeout)
  }, [])

  const logout = async () => {
    try {
      if (isSupabaseConfigured()) {
        await getSupabase().auth.signOut()
      }
      setUser(null)
      router.push('/')
    } catch (err) {
      window.location.href = '/'
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
