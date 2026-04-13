import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/services/ai.service'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { resumeText, jobDescription, resumeId, userId, jdId } = body

    console.log('Starting AI Analysis for user:', userId)

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: 'Missing resume text or job description' },
        { status: 400 }
      )
    }

    // 1. Get AI Analysis (with timeout protection)
    let analysis;
    try {
      analysis = await aiService.analyzeResume(resumeText, jobDescription)
    } catch (aiErr: any) {
      console.error('AI Service Error:', aiErr)
      return NextResponse.json({ error: 'AI Analysis engine timed out. Please try again.' }, { status: 504 })
    }

    if (!analysis) {
        throw new Error('AI Analysis returned no results')
    }

    // 2. Save to database if IDs are present
    let reportId = null;
    if (resumeId && userId && jdId && supabaseAdmin) {
      console.log('Saving report to database for resume:', resumeId);
      try {
        const { data: dbData, error: dbError } = await supabaseAdmin
          .from('reports')
          .insert({
            resume_id: resumeId,
            user_id: userId,
            jd_id: jdId,
            match_score: analysis.match_score || 0,
            ats_score: analysis.ats_score || 0,
            strengths: analysis.strengths || [],
            weaknesses: analysis.weaknesses || [],
            missing_skills: analysis.missing_skills || [],
            suggestions: analysis.suggestions || [],
            created_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (dbError) {
          console.error('Report Save Error (Supabase):', dbError)
        } else if (dbData) {
          reportId = dbData.id;
          console.log('Report saved successfully with ID:', reportId);
        }
      } catch (dbEx) {
        console.error('Database Exception during report save:', dbEx)
      }
    } else {
      console.warn('Skipping report save: Missing IDs or Supabase Admin not initialized', {
        hasResumeId: !!resumeId,
        hasUserId: !!userId,
        hasJdId: !!jdId,
        hasAdmin: !!supabaseAdmin
      });
    }

    console.log('Analysis complete!')
    return NextResponse.json({ 
      success: true, 
      analysis, 
      reportId 
    })
  } catch (error: any) {
    console.error('Fatal Analysis API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze resume' },
      { status: 500 }
    )
  }
}
