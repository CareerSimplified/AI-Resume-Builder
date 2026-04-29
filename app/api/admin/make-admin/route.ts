import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, makeAdmin = false } = body

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    // Find user by email
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database connection error' }, { status: 500 })
    }
    const { data: users, error: findError } = await supabaseAdmin
      .from('users')
      .select('*')
      .ilike('email', email)
      .limit(1)

    if (findError) {
      return NextResponse.json({ error: findError.message }, { status: 400 })
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = users[0]

    if (makeAdmin) {
      if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Database connection error' }, { status: 500 })
      }
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ role: 'admin' })
        .eq('id', user.id)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 })
      }

      return NextResponse.json({ success: true, message: `User ${email} is now admin` })
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        email: user.email, 
        role: user.role, 
        isAdmin: user.role === 'admin' 
      } 
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}