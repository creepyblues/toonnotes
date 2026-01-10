import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET - List all users with their beta tester status
export async function GET() {
  const supabase = await createClient();

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Call the database function to get users with emails
  const { data: users, error: usersError } = await supabase
    .rpc('get_users_with_profiles');

  if (usersError) {
    console.error('Error fetching users:', usersError);
    // Fallback to profiles-only if function doesn't exist
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, is_beta_tester, created_at');

    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }
    return NextResponse.json({ users: profiles || [] });
  }

  return NextResponse.json({ users: users || [] });
}

// PATCH - Toggle beta tester status
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { userId, isBetaTester } = body;

  if (!userId || typeof isBetaTester !== 'boolean') {
    return NextResponse.json(
      { error: 'Missing userId or isBetaTester' },
      { status: 400 }
    );
  }

  // Upsert the profile with beta tester status
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      { id: userId, is_beta_tester: isBetaTester },
      { onConflict: 'id' }
    )
    .select()
    .single();

  if (error) {
    console.error('Error updating beta tester status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, profile: data });
}
