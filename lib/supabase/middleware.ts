import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Helper to preserve cookies on redirect responses
  const createRedirectResponse = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const publicMarketingRoutes = [
    '/',
    '/blueprints',
    '/whatsapp-assistant',
    '/pricing',
    '/security',
    '/contact',
  ];
  const isMarketingPage = publicMarketingRoutes.some(
    (route) => request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(`${route}/`)
  );
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isOnboardingPage = request.nextUrl.pathname.startsWith('/onboarding');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/');
  const isPublicAsset = 
    request.nextUrl.pathname === '/sw.js' || 
    request.nextUrl.pathname === '/manifest.json' ||
    request.nextUrl.pathname.startsWith('/icons/') ||
    request.nextUrl.pathname.startsWith('/images/');

  const isPrefetch =
    request.headers.get('purpose') === 'prefetch' ||
    request.headers.get('x-purpose') === 'preview' ||
    Boolean(request.headers.get('next-router-prefetch')) ||
    request.headers.has('next-router-prefetch');

  if (!user && !isAuthPage && !isPublicAsset && !isMarketingPage && !isOnboardingPage && !isApiRoute) {
    if (isPrefetch) {
      return supabaseResponse;
    }

    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return createRedirectResponse(url);
  }

  // STRICT ACCESS CONTROL: Only ashmawy.ai25@gmail.com can access the Platform Super Console
  if (request.nextUrl.pathname.startsWith('/platform-admin')) {
    if (!user || user.email?.toLowerCase().trim() !== 'ashmawy.ai25@gmail.com') {
      const url = request.nextUrl.clone();
      url.pathname = user ? '/dashboard/admin' : '/login';
      return createRedirectResponse(url);
    }
  }

  return supabaseResponse;
}
