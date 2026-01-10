import { NextRequest, NextResponse } from 'next/server';
import { publishDraft, draftExists } from '@/lib/marketing/diary';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date parameter required' }, { status: 400 });
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    // Check if draft exists
    const exists = await draftExists(date);
    if (!exists) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    // Publish the draft
    const success = await publishDraft(date);

    if (!success) {
      return NextResponse.json({ error: 'Failed to publish' }, { status: 500 });
    }

    return NextResponse.json({ success: true, date });
  } catch (error) {
    console.error('Error publishing diary entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
