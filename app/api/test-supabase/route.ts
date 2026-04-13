import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('Testing Supabase connection...')
  console.log('URL:', supabaseUrl)
  console.log('Has Key:', !!supabaseAnonKey)

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({
      success: false,
      error: 'Missing credentials',
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey
    })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Test connection by checking auth config
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Supabase connection error:', error)
      return NextResponse.json({
        success: false,
        error: 'Connection failed',
        message: error.message,
        url: supabaseUrl
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      url: supabaseUrl,
      session: data?.session ? 'Active' : 'No session'
    })
  } catch (err: any) {
    console.error('Test failed:', err)
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      message: err.message
    })
  }
}
