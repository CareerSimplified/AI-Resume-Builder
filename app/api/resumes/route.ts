import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin credentials not configured' },
        { status: 500 }
      )
    }

    const { data: resumes, error: resumesError } = await supabaseAdmin
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (resumesError) {
      console.error('Error fetching resumes:', resumesError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch resumes' },
        { status: 500 }
      )
    }

    if (!resumes || resumes.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
      })
    }

    const { data: reports, error: reportsError } = await supabaseAdmin
      .from('reports')
      .select('*')
      .in('resume_id', (resumes as any[]).map((r: any) => r.id))

    if (reportsError) {
      console.error('Error fetching reports:', reportsError)
    }

    const resumesWithReports = (resumes as any[]).map((resume: any) => {
      const report = (reports as any[])?.find((r: any) => r.resume_id === resume.id) || null
      return {
        ...resume,
        report: report || null,
      }
    })

    return NextResponse.json({
      success: true,
      data: resumesWithReports,
      count: resumesWithReports.length,
    })
  } catch (error: any) {
    console.error('Get Resumes API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
