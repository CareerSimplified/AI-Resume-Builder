import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function GET(req: NextRequest) {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Missing credentials' })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        authError: error.message 
      })
    }

    const { data: tableData, error: tableError } = await supabase
      .from('test_connection')
      .select('*')
      .limit(1)

    return NextResponse.json({ 
      success: !tableError,
      auth: 'ok',
      tableError: tableError?.message,
      tableData
    })
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: err.message 
    }, { status: 500 })
  }
}