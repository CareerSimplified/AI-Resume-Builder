import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({
        totalUsers: 0,
        totalResumes: 0,
        totalReports: 0,
        totalJobDescriptions: 0,
        error: 'Admin credentials not configured'
      })
    }

    // Get total users (excluding admins)
    const { count: totalUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user')

    // Get total resumes
    const { count: totalResumes } = await supabaseAdmin
      .from('resumes')
      .select('*', { count: 'exact', head: true })

    // Get total reports
    const { count: totalReports } = await supabaseAdmin
      .from('reports')
      .select('*', { count: 'exact', head: true })

    // Get total job descriptions
    const { count: totalJobDescriptions } = await supabaseAdmin
      .from('job_descriptions')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalResumes: totalResumes || 0,
      totalReports: totalReports || 0,
      totalJobDescriptions: totalJobDescriptions || 0,
    })
  } catch (error: any) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
