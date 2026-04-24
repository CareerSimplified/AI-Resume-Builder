import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  try {
    const { resumeId } = await params

    if (!resumeId) {
      return NextResponse.json(
        { success: false, error: 'Missing resume ID' },
        { status: 400 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin credentials not configured' },
        { status: 500 }
      )
    }

    // First try fetching by report ID
    let { data, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .eq('id', resumeId)
      .single()

    // If not found by ID, try fetching by resume_id (latest one)
    if (error || !data) {
      console.log(`[API/reports] Not found by ID ${resumeId}, trying resume_id...`)
      const { data: fallbackData, error: fallbackError } = await supabaseAdmin
        .from('reports')
        .select('*')
        .eq('resume_id', resumeId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      data = fallbackData
      error = fallbackError
    }

    if (error && !data) {
      console.error('Report fetch error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Reports API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
