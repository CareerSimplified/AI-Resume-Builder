import { NextRequest, NextResponse } from 'next/server'
import { adminService } from '@/services/database.service'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  try {
    const { data: users, error: usersError } = await adminService.getAllUsers()

    if (usersError) {
      return NextResponse.json({ success: false, error: usersError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: users || [] })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { email, role } = await req.json()
    
    if (!email || !role) {
      return NextResponse.json({ success: false, error: 'Email and role required' }, { status: 400 })
    }

    // Find user by email
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Database connection error' }, { status: 500 })
    }
    const { data: users, error: findError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .ilike('email', email)
      .limit(1)

    if (findError) {
      return NextResponse.json({ success: false, error: findError.message }, { status: 400 })
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const userId = users[0].id

    // Update role
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Database connection error' }, { status: 500 })
    }
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ role })
      .eq('id', userId)

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: `Role updated to ${role}` })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
