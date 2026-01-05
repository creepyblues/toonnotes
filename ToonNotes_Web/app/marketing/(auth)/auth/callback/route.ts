import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');

  // Validate required params
  if (!token_hash || !type) {
    const loginUrl = new URL('/marketing/login', request.url);
    loginUrl.searchParams.set('error', 'invalid_link');
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createClient();

  // Verify the OTP token
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash,
    type: type as 'magiclink' | 'email',
  });

  if (error || !data.user) {
    const loginUrl = new URL('/marketing/login', request.url);
    loginUrl.searchParams.set('error', 'verification_failed');
    return NextResponse.redirect(loginUrl);
  }

  // Check if user is an admin
  const { data: adminCheck } = await supabase
    .from('admin_users')
    .select('id, role')
    .eq('user_id', data.user.id)
    .single();

  if (!adminCheck) {
    // Not an admin - sign them out and redirect with error
    await supabase.auth.signOut();
    const loginUrl = new URL('/marketing/login', request.url);
    loginUrl.searchParams.set('error', 'unauthorized');
    return NextResponse.redirect(loginUrl);
  }

  // Success - redirect to dashboard
  const dashboardUrl = new URL('/marketing', request.url);
  return NextResponse.redirect(dashboardUrl);
}
