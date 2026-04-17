import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { success: false, error: 'Server configuration error: Missing Supabase environment variables' },
      { status: 500 }
    )
  }

  // Standard client for session management
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }) },
        remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: '', ...options }) },
      },
    }
  )

  try {
    const { email, password, name } = await req.json()

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Admin client not configured' }, { status: 500 })
    }

    // Bypass rate limits by using the Admin Service Role to create the user directly
    const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        name,
        role: 'user'
      }
    })

    if (adminError) {
      return NextResponse.json({ success: false, error: adminError.message }, { status: 400 })
    }

    // Now that user is created via Admin API, we perform a standard login to set the cookies/session
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (loginError) {
      return NextResponse.json({ success: true, message: 'User created, but please login manually.', data: adminData })
    }

    return NextResponse.json({ success: true, data: loginData })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
