'use client';

import Link from 'next/link';
import { Hash } from '@phosphor-icons/react';
import { Note } from '@toonnotes/types';
import { cn } from '@/lib/utils';

interface BoardCardProps {
  hashtag: string;
  notes: Note[];
}

export function BoardCard({ hashtag, notes }: BoardCardProps) {
  const previewNotes = notes.slice(0, 4);
  const noteCount = notes.length;

  // Get dominant colors from notes
  const colors = previewNotes.map((n) => n.color).filter(Boolean);

  return (
    <Link
      href={`/boards/${encodeURIComponent(hashtag)}`}
      className="block group"
    >
      <article className="relative rounded-xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
        {/* Preview grid */}
        <div className="aspect-[4/3] relative bg-gray-100 dark:bg-gray-800 overflow-hidden">
          {previewNotes.length > 0 ? (
            <div className="absolute inset-0 grid grid-cols-2 gap-1 p-2">
              {previewNotes.map((note, i) => (
                <div
                  key={note.id}
                  className="rounded-lg shadow-sm overflow-hidden"
                  style={{ backgroundColor: note.color }}
                >
                  <div className="p-2 h-full">
                    <p className="text-[10px] font-medium text-gray-800 line-clamp-2">
                      {note.title || 'Untitled'}
                    </p>
                    <p className="text-[8px] text-gray-600 line-clamp-2 mt-1">
                      {note.content || ''}
                    </p>
                  </div>
                </div>
              ))}
              {/* Fill empty slots */}
              {Array.from({ length: Math.max(0, 4 - previewNotes.length) }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="rounded-lg bg-gray-200 dark:bg-gray-700"
                />
              ))}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Hash size={48} className="text-gray-300 dark:text-gray-600" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <div className="flex items-center gap-2">
            <Hash size={16} className="text-purple-500" weight="bold" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {hashtag}
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {noteCount} note{noteCount !== 1 ? 's' : ''}
          </p>
        </div>
      </article>
    </Link>
  );
}
