import { NextRequest, NextResponse } from 'next/server';
import { saveDraft } from '@/lib/marketing/diary';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, content } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date parameter required' }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: 'Content parameter required' }, { status: 400 });
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    // Save the draft
    await saveDraft(date, content);

    return NextResponse.json({ success: true, date });
  } catch (error) {
    console.error('Error saving diary entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
