import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // 1. EXIT EARLY for API routes and Public assets to avoid hangs
  if (
    pathname.startsWith('/api/') || 
    pathname.startsWith('/_next/') || 
    pathname.startsWith('/static/') ||
    pathname.includes('.') // for favicon, icon.svg, etc.
  ) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 2. Check auth - bypass for admin login
  const pathnameLower = pathname.toLowerCase()
  const isAdminLogin = pathnameLower === '/admin/login' || pathnameLower === '/admin/login/'
  
  if (isAdminLogin) {
    return NextResponse.next()
  }

  const isAdminRoute = pathnameLower.startsWith('/admin/')
  const isAuthRoute = pathnameLower.startsWith('/auth')
  const isDashboardRoute = pathnameLower.startsWith('/dashboard')

  // All admin routes except login need auth
  if (isAdminRoute) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        return NextResponse.redirect(new URL('/admin/login?redirect=' + encodeURIComponent(pathname), request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/admin/login?redirect=' + encodeURIComponent(pathname), request.url))
    }
    return NextResponse.next()
  }

  if (isAuthRoute || isDashboardRoute) {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (isAuthRoute && user) {
      const redirectTo = request.nextUrl.searchParams.get('redirect') || '/dashboard'
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }

    if (isDashboardRoute && (error || !user)) {
      return NextResponse.redirect(new URL('/auth/login?redirect=' + encodeURIComponent(pathname), request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
