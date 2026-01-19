import Link from 'next/link';
import { listDiaryEntries, draftExists } from '@/lib/marketing/diary';
import { DiaryEntryRow } from '@/components/marketing/DiaryEntryRow';

export const dynamic = 'force-dynamic';

export default async function DiaryDashboardPage() {
  const drafts = await listDiaryEntries('draft', 10);
  const published = await listDiaryEntries('published', 10);

  // Check if today has a draft
  const today = new Date().toISOString().split('T')[0];
  const hasTodayDraft = await draftExists(today);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Development Diary</h1>
        <div className="flex gap-3">
          <Link
            href="/development_diary"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            View Public
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Drafts</p>
          <p className="text-2xl font-bold text-gray-900">{drafts.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Published</p>
          <p className="text-2xl font-bold text-gray-900">{published.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Today</p>
          <p className="text-2xl font-bold text-gray-900">{today}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Today&apos;s Draft</p>
          <p className="text-2xl font-bold text-gray-900">
            {hasTodayDraft ? (
              <span className="text-green-600">Ready</span>
            ) : (
              <span className="text-yellow-600">Pending</span>
            )}
          </p>
        </div>
      </div>

      {/* Generate Button */}
      {!hasTodayDraft && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-teal-900">Generate Today&apos;s Entry</h3>
              <p className="text-sm text-teal-700 mt-1">
                Run <code className="bg-teal-100 px-1 rounded">/diary generate</code> in Claude
                Code to create today&apos;s diary entry.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Drafts */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Drafts</h2>
          <p className="text-sm text-gray-500">Entries pending review and publication</p>
        </div>
        <div className="divide-y divide-gray-100">
          {drafts.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No draft entries. Run <code className="bg-gray-100 px-1 rounded">/diary generate</code>{' '}
              to create one.
            </div>
          ) : (
            drafts.map((entry) => (
              <DiaryEntryRow key={entry.date} entry={entry} type="draft" />
            ))
          )}
        </div>
      </div>

      {/* Published */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Published</h2>
            <p className="text-sm text-gray-500">Live entries on the public diary</p>
          </div>
          <Link
            href="/development_diary"
            target="_blank"
            className="text-sm text-teal-600 hover:text-teal-700"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {published.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No published entries yet.
            </div>
          ) : (
            published.map((entry) => (
              <DiaryEntryRow key={entry.date} entry={entry} type="published" />
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-medium text-gray-900 mb-3">Workflow</h3>
        <ol className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-medium">
              1
            </span>
            <span>
              Run <code className="bg-gray-200 px-1 rounded">/diary generate</code> in Claude Code
              at end of day
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-medium">
              2
            </span>
            <span>Review and edit the draft in this dashboard</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-medium">
              3
            </span>
            <span>Publish to make it live on the public diary</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
