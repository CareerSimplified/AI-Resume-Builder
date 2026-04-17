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

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })
    }

    const supabase = await getServerSupabase()
    
    // Try user session
    if (supabase) {
      const { data: resumes, error: resumesError } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (!resumesError) {
        // Fetch reports for these resumes
        const { data: reports } = await supabase
          .from('reports')
          .select('*')
          .in('resume_id', (resumes as any[]).map((r: any) => r.id))

        const resumesWithReports = (resumes as any[]).map((resume: any) => ({
          ...resume,
          report: reports?.find((r: any) => r.resume_id === resume.id) || null,
        }))

        return NextResponse.json({ success: true, data: resumesWithReports, count: resumesWithReports.length })
      }
    }

    // Fallback Admin
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Database credentials missing' }, { status: 500 })
    }

    const { data: resumes, error: resumesError } = await supabaseAdmin
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (resumesError) {
      return NextResponse.json({ success: false, error: resumesError.message }, { status: 500 })
    }

    const { data: reports } = await supabaseAdmin
      .from('reports')
      .select('*')
      .in('resume_id', (resumes as any[]).map((r: any) => r.id))

    const resumesWithReports = (resumes as any[]).map((resume: any) => ({
      ...resume,
      report: reports?.find((r: any) => r.resume_id === resume.id) || null,
    }))

    return NextResponse.json({ success: true, data: resumesWithReports, count: resumesWithReports.length })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
