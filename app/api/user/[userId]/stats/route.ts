import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

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
    console.error('User stats API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
