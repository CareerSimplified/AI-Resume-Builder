import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Singleton for Browser
let browserClient: any = null

export const getSupabase = () => {
  if (typeof window === 'undefined') {
    // Return standard client for Node.js environments (like API routes)
    return createClient<Database>(supabaseUrl, supabaseAnonKey)
  }
  
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  }
  
  return browserClient
}

export const supabase = getSupabase()
