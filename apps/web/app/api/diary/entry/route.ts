import { NextRequest, NextResponse } from 'next/server';
import { getDiaryEntry, type DiaryStatus } from '@/lib/marketing/diary';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get('date');
  const status = searchParams.get('status') as DiaryStatus | null;

  if (!date) {
    return NextResponse.json({ error: 'Date parameter required' }, { status: 400 });
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
  }

  const entry = await getDiaryEntry(date, status || undefined);

  if (!entry) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
  }

  return NextResponse.json(entry);
}
