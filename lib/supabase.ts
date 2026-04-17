import { createBrowserClient } from '@supabase/ssr'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

let browserClient: SupabaseClient<Database> | null = null

export const getSupabase = (): SupabaseClient<Database> => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a dummy client that throws on actual use rather than crashing at import
    // This allows the build to finish but gives a clear error in the console at runtime
    console.error('Missing Supabase environment variables')
    return {} as any
  }

  if (typeof window === 'undefined') {
    return createClient<Database>(supabaseUrl, supabaseAnonKey)
  }

  if (!browserClient) {
    browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  }

  return browserClient
}

// Direct export for ease of use
// Accessing this will initialize the client on demand
export const supabase = (function() {
  let instance: SupabaseClient<Database> | null = null;
  return new Proxy({} as SupabaseClient<Database>, {
    get(_, prop) {
      if (!instance) {
        instance = getSupabase();
      }
      
      const value = (instance as any)[prop];
      
      // Bind functions to the real instance to avoid 'this' binding issues
      if (typeof value === 'function') {
        return value.bind(instance);
      }
      
      return value;
    }
  });
})();

export const getSupabaseClient = () => getSupabase()
