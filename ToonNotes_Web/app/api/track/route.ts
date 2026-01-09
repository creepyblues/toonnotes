import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { session_id, event_type, event_data } = body;

    // Validate required fields
    if (!session_id || !event_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Insert interaction
    const { error } = await supabase
      .from('promo_interactions')
      .insert({
        session_id,
        event_type,
        event_data: event_data || {},
      });

    if (error) {
      console.error('Tracking error:', error);
      return NextResponse.json(
        { error: 'Failed to track interaction' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track endpoint error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
