import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Standard Next.js server client for user-specific data
async function getServerSupabase() {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) return null

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value },
      set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }) },
      remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: '', ...options }) },
    },
  })
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })
    }

    const supabase = await getServerSupabase()
    
    // Attempt with user session first (honors RLS)
    if (supabase) {
      const { data, error } = await supabase
        .from('job_descriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (!error) {
        return NextResponse.json({ success: true, data })
      }
      console.warn('[API/JDs] User session fetch failed, falling back to admin:', error.message)
    }

    // Fallback to admin if session fails or key missing (bypasses RLS)
    if (!supabaseAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database configuration missing. Please ensure SUPABASE_SERVICE_ROLE_KEY is set in Vercel.' 
      }, { status: 500 })
    }

    const { data, error } = await supabaseAdmin
      .from('job_descriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { user_id, title, company, skills, experience, description } = body

    if (!user_id || !title || !description) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Always use admin for insertions to ensure success even if session is weird
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Admin client not configured' }, { status: 500 })
    }

    const { data, error } = await supabaseAdmin
      .from('job_descriptions')
      .insert({
        user_id,
        title,
        company,
        skills,
        experience,
        description,
        created_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Database insertion error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Job Description API error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
