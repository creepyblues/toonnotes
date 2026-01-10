'use client';

import { use, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Hash } from '@phosphor-icons/react';
import { useUIStore, useNoteStore } from '@/stores';
import { NoteCard } from '@/components/notes';
import { cn } from '@/lib/utils';

interface BoardDetailPageProps {
  params: Promise<{ hashtag: string }>;
}

export default function BoardDetailPage({ params }: BoardDetailPageProps) {
  const { hashtag: encodedHashtag } = use(params);
  const hashtag = decodeURIComponent(encodedHashtag);

  const viewMode = useUIStore((state) => state.viewMode);
  const getNotesByLabel = useNoteStore((state) => state.getNotesByLabel);

  const notes = useMemo(() => getNotesByLabel(hashtag), [hashtag, getNotesByLabel]);

  const isGrid = viewMode === 'grid';

  return (
    <>
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <Link
          href="/boards"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Back to boards"
        >
          <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
        </Link>

        <div className="flex items-center gap-2">
          <Hash size={24} className="text-purple-500" weight="bold" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {hashtag}
          </h1>
        </div>

        <p className="ml-auto text-sm text-gray-500 dark:text-gray-400">
          {notes.length} note{notes.length !== 1 ? 's' : ''}
        </p>
      </header>

      {/* Notes grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {notes.length > 0 ? (
          <div
            className={cn(
              isGrid
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-2'
            )}
          >
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Hash size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
              No notes in this board
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Add #{hashtag} to your notes to see them here
            </p>
          </div>
        )}
      </div>
    </>
  );
}
