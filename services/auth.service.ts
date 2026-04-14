import { supabase } from '@/lib/supabase'
import { User } from '@/types'
import Cookies from 'js-cookie'

export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string, name: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      })
      
      if (error) throw error
      
      // Store session cookie
      if (data?.session) {
        Cookies.set('sb-access-token', data.session.access_token, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        })
        Cookies.set('sb-refresh-token', data.session.refresh_token, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        })
      }
      
      return { data, error: null }
    } catch (error: any) {
      console.error('Sign up error:', error)
      return { data: null, error }
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      // Store session cookie
      if (data?.session) {
        Cookies.set('sb-access-token', data.session.access_token, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        })
        Cookies.set('sb-refresh-token', data.session.refresh_token, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        })
      }
      
      return { data, error: null }
    } catch (error: any) {
      console.error('Sign in error:', error)
      return { data: null, error }
    }
  },

  // Sign in with Google OAuth - CURRENTLY DISABLED
  /*
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error: any) {
      console.error('Google sign in error:', error)
      return { data: null, error }
    }
  },
  */

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      // Remove cookies
      Cookies.remove('sb-access-token')
      Cookies.remove('sb-refresh-token')
      
      return { error: null }
    } catch (error: any) {
      console.error('Sign out error:', error)
      return { error }
    }
  },

  // Get current session
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error }
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error }
    }
  },

  // Reset password
  async resetPassword(email: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
      })
      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      console.error('Reset password error:', error)
      return { data: null, error }
    }
  },

  // Update password
  async updatePassword(newPassword: string) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      console.error('Update password error:', error)
      return { data: null, error }
    }
  },

  // Get session from cookie (for middleware)
  getSessionFromCookie() {
    const accessToken = Cookies.get('sb-access-token')
    const refreshToken = Cookies.get('sb-refresh-token')
    
    if (!accessToken) return null
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    }
  },
}
