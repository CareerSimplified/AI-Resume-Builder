import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Admin client not configured' }, { status: 500 })
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
