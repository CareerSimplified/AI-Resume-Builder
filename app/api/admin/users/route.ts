import { NextRequest, NextResponse } from 'next/server'
import { adminService } from '@/services/database.service'

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
