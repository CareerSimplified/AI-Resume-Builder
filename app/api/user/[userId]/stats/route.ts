import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })
    }

    const supabase = await getServerSupabase()
    
    // Try user session first
    if (supabase) {
      const [resumesRes, reportsRes, jdRes, userRes] = await Promise.all([
        supabase.from('resumes').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('reports').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('job_descriptions').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('users').select('*').eq('id', userId).single(),
      ])

      if (!resumesRes.error) {
        return NextResponse.json({
          success: true,
          data: {
            stats: {
              totalResumes: resumesRes.count || 0,
              totalReports: reportsRes.count || 0,
              totalJobDescriptions: jdRes.count || 0,
            },
            user: userRes.data,
          },
        })
      }
    }

    // Fallback to Admin
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Database credentials missing' }, { status: 500 })
    }

    const [resumesRes, reportsRes, jdRes, userRes] = await Promise.all([
      supabaseAdmin.from('resumes').select('id', { count: 'exact' }).eq('user_id', userId),
      supabaseAdmin.from('reports').select('id', { count: 'exact' }).eq('user_id', userId),
      supabaseAdmin.from('job_descriptions').select('id', { count: 'exact' }).eq('user_id', userId),
      supabaseAdmin.from('users').select('*').eq('id', userId).single(),
    ])

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalResumes: resumesRes.count || 0,
          totalReports: reportsRes.count || 0,
          totalJobDescriptions: jdRes.count || 0,
        },
        user: userRes.data,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
