'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react'
import { User } from '@/types'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { userService } from '@/services/database.service'
import { useRouter } from 'next/navigation'

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
  const hasInitialized = useRef(false)

  const refreshUser = async () => {
    console.log('[AuthContext] refreshUser started')
    
    if (!isSupabaseConfigured()) {
      console.error('[AuthContext] CRITICAL: Supabase environment variables are missing! Your Vercel environment is NOT configured correctly.')
      setLoading(false)
      return
    }

    try {
      console.log('[AuthContext] Fetching session...')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('[AuthContext] Session error:', sessionError)
      }

      if (!session) {
        console.log('[AuthContext] No session found')
        setUser(null)
        setLoading(false)
        return
      }

      console.log('[AuthContext] Session found for user:', session.user.id)

      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser()
      if (userError || !authUser) {
        console.error('[AuthContext] User profile retrieval error:', userError)
        setUser(null)
        setLoading(false)
        return
      }

      try {
        console.log('[AuthContext] Mapping user data from database...')
        const { data: userData, error: dbError } = await userService.getUserById(authUser.id)
        if (dbError) {
          console.error('[AuthContext] Database profile error:', dbError)
        }
        
        setUser(userData || ({
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || '',
          role: authUser.user_metadata?.role || 'user',
          created_at: authUser.created_at
        } as User))
      } catch (dbEx) {
        console.error('[AuthContext] Exception while mapping DB user:', dbEx)
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || '',
          role: authUser.user_metadata?.role || 'user',
          created_at: authUser.created_at
        } as User)
      }
    } catch (err) {
      console.error('[AuthContext] CRITICAL: Unexpected error in refreshUser:', err)
      setUser(null)
    } finally {
      console.log('[AuthContext] refreshUser complete, setting loading=false')
      setLoading(false)
      hasInitialized.current = true
    }
  }

  useEffect(() => {
    // Initial fetch
    if (!hasInitialized.current) {
      refreshUser()
    }

    // Auth listener
    if (isSupabaseConfigured() && supabase.auth) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
        console.log('[AuthContext] Auth event:', event)
        
        try {
          if (session?.user) {
            const { data, error } = await userService.getUserById(session.user.id)
            setUser(data || ({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || '',
              role: session.user.user_metadata?.role || 'user',
              created_at: session.user.created_at
            } as User))
          } else {
            setUser(null)
          }
        } catch (err) {
          console.error('[AuthContext] Auth transition error:', err)
        } finally {
          setLoading(false)
        }
      })

      return () => {
        authListener.subscription.unsubscribe()
      }
    } else {
        setLoading(false)
    }
  }, [])

  const logout = async () => {
    if (!isSupabaseConfigured()) return
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push('/')
    } catch (err) {
      console.error('[AuthContext] Logout error:', err)
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
