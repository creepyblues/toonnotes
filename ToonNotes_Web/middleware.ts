import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes - no auth required
  const publicPaths = [
    '/',
    '/note',
    '/early-access',
    '/privacy',
    '/terms',
  ];

  // Check if it's a public path or public path prefix
  if (publicPaths.some(p => pathname === p || pathname.startsWith('/note/'))) {
    return NextResponse.next();
  }

  // Allow app auth routes
  if (pathname.startsWith('/app/auth')) {
    return NextResponse.next();
  }

  // Allow marketing auth routes
  if (
    pathname === '/marketing/login' ||
    pathname === '/marketing/login/' ||
    pathname.startsWith('/marketing/auth')
  ) {
    return NextResponse.next();
  }

  // Only protect /app and /marketing routes
  if (!pathname.startsWith('/app') && !pathname.startsWith('/marketing')) {
    return NextResponse.next();
  }

  // Debug: log the pathname
  console.log('[Middleware] Checking auth for:', pathname);

  // Create response to potentially modify cookies
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Check for authenticated session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to appropriate login based on route
    const loginPath = pathname.startsWith('/app') ? '/app/auth/login' : '/marketing/login';
    const loginUrl = new URL(loginPath, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // For /app routes, user auth is sufficient
  if (pathname.startsWith('/app')) {
    return response;
  }

  // For /marketing routes, check if user is in admin_users table
  if (pathname.startsWith('/marketing')) {
    const { data: adminCheck } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!adminCheck) {
      // Sign out non-admin and redirect to login with error
      await supabase.auth.signOut();
      const loginUrl = new URL('/marketing/login', request.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/app/:path*', '/marketing/:path*'],
};
