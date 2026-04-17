'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@/types'
import { supabase } from '@/lib/supabase'
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
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        setUser(null)
        setLoading(false)
        return
      }

      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser()
      if (userError || !authUser) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const { data: userData, error: dbError } = await userService.getUserById(authUser.id)
        if (dbError) {
          console.error('[AuthContext] Error fetching user profile:', dbError)
        }
        
        setUser(userData || ({
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || '',
          role: authUser.user_metadata?.role || 'user',
          created_at: authUser.created_at
        } as User))
      } catch (dbEx) {
        console.error('[AuthContext] Database exception getting user profile:', dbEx)
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || '',
          role: authUser.user_metadata?.role || 'user',
          created_at: authUser.created_at
        } as User)
      }
    } catch (err) {
      console.error('[AuthContext] Unexpected error in refreshUser:', err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      console.log('[AuthContext] Auth state change event:', event)
      
      try {
        if (session?.user) {
          const { data, error } = await userService.getUserById(session.user.id)
          if (error) console.error('[AuthContext] State change fetch error:', error)
          
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
        console.error('[AuthContext] Error in onAuthStateChange:', err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const logout = async () => {
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
