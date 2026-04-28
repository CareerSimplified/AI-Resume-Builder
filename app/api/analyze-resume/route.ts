import { createServerClient, type CookieOptions } from '@supabase/ssr'
// Implements PRD v1.0 AI Engine Integration, Limits Tracking (REQ-DASH-02 columns)
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
    const { resumeText, jobDescription, resumeId, userId, jdId, mode = 'JD_ALIGNMENT', isPro = false, targetStandard } = body

    if (!resumeText) {
      return NextResponse.json({ error: 'Missing resume text' }, { status: 400 })
    }

    if (mode === 'JD_ALIGNMENT' && !jobDescription) {
      return NextResponse.json({ error: 'Missing job description for JD Alignment mode' }, { status: 400 })
    }

    console.log(`[API/analyze] Starting ${mode} analysis for user:`, userId)
    console.log(`[API/analyze] Resume length: ${resumeText.length}, JD length: ${jobDescription?.length || 0}`)

    let userProStatus = isPro;
    
    // Check Limits
    if (supabaseAdmin && userId) {
        // First reset limits if a new day (IST)
        await supabaseAdmin.rpc('reset_daily_limits', { user_uuid: userId });
        
        const { data: userData } = await supabaseAdmin
          .from('users')
          .select('is_pro, mode1_uses_today, mode2_uses_today')
          .eq('id', userId)
          .single();
          
        if (userData) {
           userProStatus = userData.is_pro;
           if (!userProStatus) {
               if (mode === 'MBA_POLISH' && userData.mode1_uses_today >= 2) {
                   return NextResponse.json({ error: 'LIMIT_REACHED', message: 'Daily limit reached for MBA Polish' }, { status: 403 });
               }
               if (mode === 'JD_ALIGNMENT' && userData.mode2_uses_today >= 2) {
                   return NextResponse.json({ error: 'LIMIT_REACHED', message: 'Daily limit reached for JD Alignment' }, { status: 403 });
               }
           }
        }
    }

    // 1. Get AI Analysis
    const analysis = await aiService.analyzeResume(resumeText, mode, jobDescription, userProStatus, targetStandard)

    
    console.log(`[API/analyze] AI Analysis completed. Match Score: ${typeof analysis.match_score === 'object' ? analysis.match_score.score : analysis.match_score}`)

    // 2. Save report to database
    let reportId = null;
    if (resumeId && userId) {
      const supabase = await getServerSupabase()
      
      const reportData = {
        resume_id: resumeId,
        user_id: userId,
        jd_id: jdId || null,
        match_score: typeof analysis.match_score === 'object' ? analysis.match_score.score : analysis.match_score,
        score_breakdown: typeof analysis.match_score === 'object' ? analysis.match_score : null,
        ats_score: analysis.ats_score,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        missing_skills: analysis.missing_skills,
        suggestions: analysis.suggestions,
        gaps: analysis.gaps,
        rewritten_resume: analysis.rewrittenResume,
        rewritten_resume_data: analysis.rewrittenResumeData,
        cover_letter: analysis.coverLetter,
        interview_prep: analysis.interviewPrep,
        plan_306090: analysis.plan306090,
        mode: mode
      }

      // Try with user session first
      if (supabase) {
        const { data, error } = await supabase
          .from('reports')
          .insert(reportData)
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
            .insert(reportData)
            .select()
            .single()
          
          if (data) reportId = data.id
          else if (error) console.error('[API/analyze] Admin save error:', error.message)
        } catch (adminErr) {
          console.error('[API/analyze] Admin save failed exception:', adminErr)
        }
      }
      
      // Update User Counts
      if (supabaseAdmin && userId) {
          const incrementField = mode === 'MBA_POLISH' ? 'mode1_uses_today' : 'mode2_uses_today';
          try {
             // We do a raw rpc or just fetch and increment since we don't have an increment RPC set up exactly yet,
             // wait, we can just do an update:
             const { data: userCurrentData } = await supabaseAdmin.from('users').select(incrementField + ', total_analyses').eq('id', userId).single();
             const userCurrent = userCurrentData as any;
             if (userCurrent) {
                 await supabaseAdmin.from('users').update({
                     [incrementField]: (Number(userCurrent[incrementField]) || 0) + 1,
                     total_analyses: (Number(userCurrent.total_analyses) || 0) + 1
                 }).eq('id', userId)
             }
          } catch(e) { console.error("Error updating user limits", e)}
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
