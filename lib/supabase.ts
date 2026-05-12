import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Resilient fetch wrapper — catches network errors to prevent unhandled rejections
const resilientFetch: typeof fetch = async (input, init) => {
  try {
    return await fetch(input, init)
  } catch (err) {
    // Network unreachable / Supabase project paused
    console.warn('[Supabase] Network request failed (project may be paused):', 
      typeof input === 'string' ? input : (input as Request)?.url)
    // Return a synthetic error response so the SDK handles it gracefully
    return new Response(
      JSON.stringify({ message: 'Network request failed', error: 'fetch_error' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// Function to create or get the Supabase client - perfectly lazy
export function getSupabase(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== 'undefined') {
      console.error('[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }
    // Return a proxy that just logs errors when you try to use it
    // This prevents the whole app from crashing at import time
    return new Proxy({} as any, {
      get() {
        return () => {
          throw new Error('Supabase client not configured. Check your environment variables.')
        }
      }
    })
  }

  // Create client with resilient fetch to handle unreachable Supabase gracefully
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: resilientFetch,
    },
  })
}

// Named export for convenience - THIS IS NOW A FUNCTION CALL
// We use a getter to make it behave like a constant but evaluate lazily
export const supabase = getSupabase()

export const isSupabaseConfigured = () => {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

