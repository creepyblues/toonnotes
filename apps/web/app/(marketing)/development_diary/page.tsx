import Link from 'next/link';
import { listDiaryEntries, type DiaryEntrySummary } from '@/lib/marketing/diary';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Development Diary - ToonNotes',
  description:
    'Follow along with the ToonNotes development journey. Daily updates on features, bug fixes, and behind-the-scenes insights.',
};

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

function DiaryCard({ entry }: { entry: DiaryEntrySummary }) {
  return (
    <Link
      href={`/development_diary/${entry.date}`}
      className="group block rounded-xl border border-warm-200 bg-white p-6 shadow-sm transition-all hover:border-teal-300 hover:shadow-md"
    >
      <div className="mb-3 flex items-center justify-between">
        <time className="text-sm font-medium text-warm-500">{formatDate(entry.date)}</time>
        <div className="flex items-center gap-2 text-sm text-warm-400">
          <span>{entry.session_count} sessions</span>
          <span>&middot;</span>
          <span>{entry.commit_count} commits</span>
        </div>
      </div>

      <h3 className="mb-3 text-lg font-semibold text-warm-900 group-hover:text-teal-700">
        {entry.highlight || 'Development Update'}
      </h3>

      <div className="flex flex-wrap gap-2">
        {entry.categories.slice(0, 3).map((category) => (
          <CategoryBadge key={category} category={category} />
        ))}
      </div>
    </Link>
  );
}

export default async function DevelopmentDiaryPage() {
  const entries = await listDiaryEntries('published', 20);

  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl font-bold text-warm-900 sm:text-5xl">
            Development Diary
          </h1>
          <p className="mt-4 text-lg text-warm-600">
            Follow along with the ToonNotes journey. Daily updates on features, fixes, and
            behind-the-scenes insights.
          </p>
        </div>

        {/* Entry List */}
        {entries.length > 0 ? (
          <div className="space-y-4">
            {entries.map((entry) => (
              <DiaryCard key={entry.date} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-warm-200 bg-warm-50 p-12 text-center">
            <p className="text-warm-600">No diary entries published yet.</p>
            <p className="mt-2 text-sm text-warm-400">Check back soon for development updates!</p>
          </div>
        )}

        {/* RSS Link */}
        <div className="mt-12 text-center">
          <p className="text-sm text-warm-500">
            Want updates?{' '}
            <Link href="/development_diary/rss.xml" className="text-teal-600 hover:underline">
              Subscribe via RSS
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
