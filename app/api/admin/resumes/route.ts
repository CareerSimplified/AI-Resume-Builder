import { NextRequest, NextResponse } from 'next/server'
import { adminService } from '@/services/database.service'

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await adminService.getAllResumes()
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
