import { createBrowserClient } from '@supabase/ssr'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Standard client initialization without Proxy to avoid 'this' binding complexity
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Helper to check if client can be initialized
export const isSupabaseConfigured = () => !!supabaseUrl && !!supabaseAnonKey

// The client instance
export const supabase: SupabaseClient<Database> = (function() {
  if (!isSupabaseConfigured()) {
    console.warn('[Supabase] Missing environment variables. Client will be non-functional.')
    // Return a dummy object that safe-guarded against property access if possible
    // But for simplicity, we return something that doesn't crash on export
    return {} as any
  }

  if (typeof window === 'undefined') {
    return createClient<Database>(supabaseUrl!, supabaseAnonKey!)
  }

  return createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!)
})()

export const getSupabase = () => supabase
export const getSupabaseClient = () => supabase
