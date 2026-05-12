import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 1. GLOBAL FETCH PROTECTION
// Intercepts the edge runtime fetch to prevent unhandled promise rejections
// from killing the request when Supabase is unreachable.
if (typeof globalThis.fetch === 'function') {
  const nativeFetch = globalThis.fetch;
  globalThis.fetch = async (...args) => {
    try {
      return await nativeFetch(...args);
    } catch (err) {
      console.warn('[EdgeRuntime] Fetch Error Intercepted:', err);
      return new Response(JSON.stringify({ error: 'Service Unavailable' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
}

/**
 * Robust getUser wrapper to prevent middleware from hanging or crashing
 * when the Supabase project is paused or network fails.
 */
async function safeGetUser(supabase: any) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) return null
    return user
  } catch (err) {
    console.error('[Middleware] safeGetUser error:', err)
    return null
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const url = request.nextUrl.clone()
  
  // 2. PERFORMANCE: EXIT EARLY for assets and static routes
  if (
    pathname.startsWith('/_next/') || 
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) return response

  // 3. COOKIE OPTIMIZATION: If no auth cookie exists, skip Supabase calls for public/semi-public pages
  const hasAuthCookie = request.cookies.getAll().some(c => c.name.includes('auth-token') || c.name.includes('supabase-auth'));
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAuthPage = pathname.startsWith('/auth');

  // If we are heading to dashboard/admin and have NO cookie, redirect immediately without hitting network
  if ((isDashboardRoute || isAdminRoute) && !hasAuthCookie) {
    const loginUrl = isAdminRoute ? '/admin/login' : '/auth/login';
    url.pathname = loginUrl;
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) { return request.cookies.get(name)?.value },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options })
        response = NextResponse.next({ request: { headers: request.headers } })
        response.cookies.set({ name, value, ...options })
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options })
        response = NextResponse.next({ request: { headers: request.headers } })
        response.cookies.set({ name, value: '', ...options })
      },
    },
  })

  // 4. PROTECTED ROUTES LOGIC
  if (isDashboardRoute || isAdminRoute || isAuthPage) {
    const user = await safeGetUser(supabase);

    // Redirect to dashboard if logged-in user tries to access /auth/login or /auth/signup
    if (isAuthPage && user) {
      const redirectTo = request.nextUrl.searchParams.get('redirect') || '/dashboard';
      url.pathname = redirectTo;
      url.searchParams.delete('redirect');
      return NextResponse.redirect(url);
    }

    // Redirect to login if unauthenticated user tries to access dashboard or admin
    if ((isDashboardRoute || isAdminRoute) && !user) {
      const loginUrl = isAdminRoute ? '/admin/login' : '/auth/login';
      url.pathname = loginUrl;
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

