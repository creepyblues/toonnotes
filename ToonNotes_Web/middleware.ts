import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /marketing routes
  if (!pathname.startsWith('/marketing')) {
    return NextResponse.next();
  }

  // Allow login and auth callback routes (check with and without trailing slash)
  if (
    pathname === '/marketing/login' ||
    pathname === '/marketing/login/' ||
    pathname.startsWith('/marketing/auth')
  ) {
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
    const loginUrl = new URL('/marketing/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Check if user is in admin_users table
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

  return response;
}

export const config = {
  matcher: ['/marketing/:path*'],
};
