'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export interface DiaryEntrySummary {
  date: string;
  status: string;
  highlight: string;
  categories: string[];
  session_count: number;
  commit_count: number;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'bg-yellow-100 text-yellow-800',
    review: 'bg-blue-100 text-blue-800',
    published: 'bg-green-100 text-green-800',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}
    >
      {status}
    </span>
  );
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
    Infrastructure: 'bg-gray-100 text-gray-800',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[category] || 'bg-gray-100 text-gray-800'}`}
    >
      {category}
    </span>
  );
}

function ToggleSwitch({
  isPublished,
  isLoading,
  onToggle,
}: {
  isPublished: boolean;
  isLoading: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      disabled={isLoading}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
        isPublished ? 'bg-green-500' : 'bg-gray-200'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      role="switch"
      aria-checked={isPublished}
      aria-label={isPublished ? 'Unpublish entry' : 'Publish entry'}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          isPublished ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export function DiaryEntryRow({
  entry,
  type,
}: {
  entry: DiaryEntrySummary;
  type: 'draft' | 'published';
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticStatus, setOptimisticStatus] = useState<'draft' | 'published'>(type);

  const isPublished = optimisticStatus === 'published';

  const handleToggle = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const newStatus = isPublished ? 'draft' : 'published';
    setOptimisticStatus(newStatus);

    try {
      const endpoint = isPublished ? '/api/diary/unpublish' : '/api/diary/publish';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: entry.date }),
      });

      if (!response.ok) {
        // Revert optimistic update on failure
        setOptimisticStatus(isPublished ? 'published' : 'draft');
        const data = await response.json();
        console.error('Toggle failed:', data.error);
      } else {
        // Refresh the page to get updated data
        router.refresh();
      }
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticStatus(isPublished ? 'published' : 'draft');
      console.error('Toggle error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const href =
    type === 'draft'
      ? `/marketing/diary/drafts/${entry.date}`
      : `/development_diary/${entry.date}`;

  return (
    <div className="flex items-center px-6 py-4 hover:bg-gray-50 transition-colors">
      <Link href={href} className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <time className="text-sm font-medium text-gray-900">{formatDate(entry.date)}</time>
          <StatusBadge status={optimisticStatus} />
        </div>
        <p className="mt-1 text-sm text-gray-600 truncate">{entry.highlight || 'No highlight'}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {entry.categories.slice(0, 3).map((cat) => (
            <CategoryBadge key={cat} category={cat} />
          ))}
        </div>
      </Link>
      <div className="ml-4 flex items-center gap-4 text-sm text-gray-500 flex-shrink-0">
        <span className="hidden sm:inline">{entry.session_count} sessions</span>
        <span className="hidden sm:inline">{entry.commit_count} commits</span>
        <ToggleSwitch isPublished={isPublished} isLoading={isLoading} onToggle={handleToggle} />
        <Link
          href={href}
          className="p-1 text-gray-400 hover:text-gray-600"
          aria-label="View entry"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
