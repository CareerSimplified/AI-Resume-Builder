import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/services/ai.service'
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { resumeText, jobDescription, resumeId, userId, jdId } = body

    if (!resumeText || !jobDescription) {
      return NextResponse.json({ error: 'Missing resume text or job description' }, { status: 400 })
    }

    console.log('[API/analyze] Starting analysis for user:', userId)

    // 1. Get AI Analysis (Gemini implementation handles its own errors/mocking)
    const analysis = await aiService.analyzeResume(resumeText, jobDescription)
    
    // 2. Save report to database
    let reportId = null;
    if (resumeId && userId && jdId) {
      const supabase = await getServerSupabase()
      
      // Try with user session first
      if (supabase) {
        const { data, error } = await supabase
          .from('reports')
          .insert({
            resume_id: resumeId,
            user_id: userId,
            jd_id: jdId,
            match_score: analysis.match_score,
            ats_score: analysis.ats_score,
            strengths: analysis.strengths,
            weaknesses: analysis.weaknesses,
            missing_skills: analysis.missing_skills,
            suggestions: analysis.suggestions,
          })
          .select()
          .single()
        
        if (!error && data) {
          reportId = data.id
        } else {
          console.warn('[API/analyze] User-session save failed, trying admin:', error?.message)
        }
      }

      // Fallback to Admin if session save failed or key missing
      if (!reportId && supabaseAdmin) {
        try {
          const { data, error } = await supabaseAdmin
            .from('reports')
            .insert({
              resume_id: resumeId,
              user_id: userId,
              jd_id: jdId,
              match_score: analysis.match_score,
              ats_score: analysis.ats_score,
              strengths: analysis.strengths,
              weaknesses: analysis.weaknesses,
              missing_skills: analysis.missing_skills,
              suggestions: analysis.suggestions,
            })
            .select()
            .single()
          
          if (data) reportId = data.id
        } catch (adminErr) {
          console.error('[API/analyze] Admin save failed:', adminErr)
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      analysis, 
      reportId 
    })
  } catch (error: any) {
    console.error('[API/analyze] Fatal Error:', error.message)
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 })
  }
}
