'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@/types'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
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

  const refreshUser = async () => {
    console.log('[AuthContext] refreshUser triggered')
    
    if (!isSupabaseConfigured()) {
      console.warn('[AuthContext] Supabase not configured, skipping auth check')
      setLoading(false)
      return
    }

    const supabase = getSupabase()

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        setUser(null)
        setLoading(false)
        return
      }

      console.log('[AuthContext] Session found:', session.user.id)

      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser()
      if (userError || !authUser) {
        setUser(null)
        setLoading(false)
        return
      }

      const { data: userData, error: dbError } = await userService.getUserById(authUser.id)
      
      setUser(userData || ({
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || '',
        role: authUser.user_metadata?.role || 'user',
        created_at: authUser.created_at
      } as User))
    } catch (err) {
      console.error('[AuthContext] Fatal auth error:', err)
      setUser(null)
    } finally {
      setLoading(false)
      console.log('[AuthContext] loading set to false')
    }
  }

  useEffect(() => {
    refreshUser()

    if (isSupabaseConfigured()) {
      const supabase = getSupabase()
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
        console.log('[AuthContext] auth event:', event)
        if (session?.user) {
          const { data } = await userService.getUserById(session.user.id)
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
        setLoading(false)
      })

      return () => {
        authListener.subscription.unsubscribe()
      }
    }
  }, [])

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await getSupabase().auth.signOut()
      setUser(null)
      router.push('/')
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
