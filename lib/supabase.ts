import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  if (typeof window === 'undefined') {
    // Server-side: always create a fresh client (no singleton needed on server)
    return createClient<Database>(supabaseUrl, supabaseAnonKey)
  }

  // Browser-side: reuse singleton
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  }

  return browserClient
}

// Lazy accessor — evaluated at call time, NOT at import time
// This prevents crashes during server-side rendering when env vars may not be loaded
export const getSupabaseClient = () => getSupabase()

// Named export for backward compat — wraps in a Proxy so the module-level
// reference works even though it's resolved lazily
export const supabase = new Proxy({} as ReturnType<typeof getSupabase>, {
  get(_target, prop) {
    return (getSupabase() as any)[prop]
  },
  apply(_target, _thisArg, args) {
    return (getSupabase() as any)(...args)
  }
})
