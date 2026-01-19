import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDiaryEntry, listDiaryEntries } from '@/lib/marketing/diary';
import { DiaryContent } from '@/components/marketing/diary';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ date: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { date } = await params;
  const entry = await getDiaryEntry(date, 'published');

  if (!entry) {
    return {
      title: 'Entry Not Found - Development Diary',
    };
  }

  return {
    title: `${entry.highlight || formatDate(date)} - Development Diary`,
    description: `ToonNotes development diary for ${formatDate(date)}. ${entry.highlight}`,
  };
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    Implementation: 'bg-teal-100 text-teal-800',
    'Bug Fix': 'bg-red-100 text-red-800',
    Refactoring: 'bg-purple-100 text-purple-800',
    Documentation: 'bg-blue-100 text-blue-800',
    Testing: 'bg-yellow-100 text-yellow-800',
    Research: 'bg-orange-100 text-orange-800',
    Planning: 'bg-indigo-100 text-indigo-800',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[category] || 'bg-gray-100 text-gray-800'}`}
    >
      {category}
    </span>
  );
}

export default async function DiaryEntryPage({ params }: PageProps) {
  const { date } = await params;

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    notFound();
  }

  const entry = await getDiaryEntry(date, 'published');

  if (!entry) {
    notFound();
  }

  // Get adjacent entries for navigation
  const allEntries = await listDiaryEntries('published');
  const currentIndex = allEntries.findIndex((e) => e.date === date);
  const prevEntry = currentIndex < allEntries.length - 1 ? allEntries[currentIndex + 1] : null;
  const nextEntry = currentIndex > 0 ? allEntries[currentIndex - 1] : null;

  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Back Link */}
        <Link
          href="/development_diary"
          className="mb-8 inline-flex items-center text-sm font-medium text-warm-500 hover:text-teal-600"
        >
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Diary
        </Link>

        {/* Header */}
        <header className="mb-8">
          <time className="text-sm font-medium text-warm-500">{formatDate(date)}</time>
          <h1 className="mt-2 font-display text-3xl font-bold text-warm-900 sm:text-4xl">
            {entry.highlight || 'Development Update'}
          </h1>

          {/* Categories */}
          <div className="mt-4 flex flex-wrap gap-2">
            {entry.categories.map((category) => (
              <CategoryBadge key={category} category={category} />
            ))}
          </div>

          {/* Stats */}
          <div className="mt-4 flex gap-4 text-sm text-warm-500">
            <span>{entry.session_count} sessions</span>
            <span>{entry.commit_count} commits</span>
            {entry.tags.length > 0 && (
              <span className="text-warm-400">
                {entry.tags.map((tag) => `#${tag}`).join(' ')}
              </span>
            )}
          </div>
        </header>

        {/* Content */}
        <DiaryContent content={entry.rawContent} />

        {/* Navigation */}
        <nav className="mt-12 flex items-center justify-between border-t border-warm-200 pt-8">
          {prevEntry ? (
            <Link
              href={`/development_diary/${prevEntry.date}`}
              className="group flex flex-col"
            >
              <span className="text-xs font-medium text-warm-400 group-hover:text-teal-600">
                Previous
              </span>
              <span className="text-sm font-medium text-warm-700 group-hover:text-teal-700">
                {formatDate(prevEntry.date)}
              </span>
            </Link>
          ) : (
            <div />
          )}

          {nextEntry ? (
            <Link
              href={`/development_diary/${nextEntry.date}`}
              className="group flex flex-col items-end"
            >
              <span className="text-xs font-medium text-warm-400 group-hover:text-teal-600">
                Next
              </span>
              <span className="text-sm font-medium text-warm-700 group-hover:text-teal-700">
                {formatDate(nextEntry.date)}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </div>
    </div>
  );
}
