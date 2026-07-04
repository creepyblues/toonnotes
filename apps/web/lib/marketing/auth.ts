import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Require an authenticated admin (present in admin_users) for marketing/admin
 * API routes. Mirrors the check in middleware.ts, which only covers
 * /marketing/* pages — API routes must call this explicitly.
 *
 * Returns null when authorized, or a NextResponse (401/403) to return as-is.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: adminCheck } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!adminCheck) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return null;
}
