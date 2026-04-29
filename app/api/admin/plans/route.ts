import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Admin credentials not configured' }, { status: 500 })
    }
    const { data, error } = await supabaseAdmin
      .from('plans')
      .select('*')
      .order('price_inr', { ascending: true })
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Admin credentials not configured' }, { status: 500 })
    }
    const body = await req.json()
    const { data, error } = await supabaseAdmin
      .from('plans')
      .insert(body)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Admin credentials not configured' }, { status: 500 })
    }
    const { id, ...updates } = await req.json()
    if (!id) {
      return NextResponse.json({ success: false, error: 'Plan ID required' }, { status: 400 })
    }
    const { error } = await supabaseAdmin
      .from('plans')
      .update(updates)
      .eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Admin credentials not configured' }, { status: 500 })
    }
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'Plan ID required' }, { status: 400 })
    }
    const { error } = await supabaseAdmin
      .from('plans')
      .delete()
      .eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
