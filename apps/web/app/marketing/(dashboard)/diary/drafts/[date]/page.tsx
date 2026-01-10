'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DiaryEntry {
  date: string;
  status: 'draft' | 'review' | 'published';
  author: string;
  session_count: number;
  commit_count: number;
  categories: string[];
  highlight: string;
  tags: string[];
  content: string;
  rawContent: string;
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

export default function EditDraftPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const router = useRouter();
  const [date, setDate] = useState<string>('');
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    params.then(({ date: d }) => {
      setDate(d);
      fetchEntry(d);
    });
  }, [params]);

  async function fetchEntry(d: string) {
    try {
      const response = await fetch(`/api/diary/entry?date=${d}&status=draft`);
      if (!response.ok) {
        throw new Error('Entry not found');
      }
      const data = await response.json();
      setEntry(data);
      setEditedContent(data.content);
    } catch (err) {
      setError('Failed to load entry');
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish() {
    if (!entry || !confirm('Publish this entry? It will be visible on the public diary.')) {
      return;
    }

    setPublishing(true);
    try {
      const response = await fetch('/api/diary/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: entry.date }),
      });

      if (!response.ok) {
        throw new Error('Failed to publish');
      }

      router.push('/marketing/diary');
      router.refresh();
    } catch (err) {
      alert('Failed to publish entry');
    } finally {
      setPublishing(false);
    }
  }

  async function handleDelete() {
    if (!entry || !confirm('Delete this draft? This cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch('/api/diary/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: entry.date }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      router.push('/marketing/diary');
      router.refresh();
    } catch (err) {
      alert('Failed to delete draft');
    } finally {
      setDeleting(false);
    }
  }

  async function handleSave() {
    if (!entry) return;

    try {
      const response = await fetch('/api/diary/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: entry.date, content: editedContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      setIsEditing(false);
      fetchEntry(entry.date);
    } catch (err) {
      alert('Failed to save changes');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="space-y-6">
        <Link
          href="/marketing/diary"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-teal-600"
        >
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Diary
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">{error || 'Entry not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/marketing/diary"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-teal-600"
        >
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Diary
        </Link>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700"
              >
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                {publishing ? 'Publishing...' : 'Publish'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Entry Info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 mb-2">
              Draft
            </span>
            <h1 className="text-2xl font-bold text-gray-900">{formatDate(date)}</h1>
            <p className="mt-1 text-gray-600">{entry.highlight || 'No highlight'}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {entry.categories.map((cat) => (
                <CategoryBadge key={cat} category={cat} />
              ))}
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>{entry.session_count} sessions</p>
            <p>{entry.commit_count} commits</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Content' : 'Preview'}
          </h2>
        </div>
        <div className="p-6">
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full h-[600px] p-4 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          ) : (
            <article className="prose prose-gray max-w-none prose-headings:font-semibold prose-h2:text-xl prose-h3:text-lg prose-a:text-teal-600 prose-code:rounded prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:text-gray-800 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-gray-900 prose-img:rounded-lg">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{entry.rawContent}</ReactMarkdown>
            </article>
          )}
        </div>
      </div>
    </div>
  );
}
