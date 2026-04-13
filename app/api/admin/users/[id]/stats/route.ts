import { NextRequest, NextResponse } from 'next/server'
import { adminService } from '@/services/database.service'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const stats = await adminService.getUserStats(id)
    return NextResponse.json({ success: true, data: stats })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
