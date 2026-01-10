'use client';

import Link from 'next/link';
import { PushPin, Archive, Trash } from '@phosphor-icons/react';
import { Note } from '@toonnotes/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { LabelPill } from '@/components/labels';

interface NoteCardProps {
  note: Note;
  viewMode?: 'grid' | 'list';
}

export function NoteCard({ note, viewMode = 'grid' }: NoteCardProps) {
  const isGrid = viewMode === 'grid';

  return (
    <Link href={`/notes/${note.id}`} className="block group">
      <article
        className={cn(
          'relative rounded-xl transition-all duration-200',
          'hover:shadow-lg hover:-translate-y-0.5',
          'border border-gray-200 dark:border-gray-700',
          isGrid ? 'p-4 min-h-[180px]' : 'p-3 flex items-start gap-4'
        )}
        style={{ backgroundColor: note.color }}
      >
        {/* Status icons */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {note.isPinned && (
            <PushPin
              size={14}
              weight="fill"
              className="text-gray-600 dark:text-gray-400"
            />
          )}
          {note.isArchived && (
            <Archive
              size={14}
              weight="fill"
              className="text-gray-600 dark:text-gray-400"
            />
          )}
          {note.isDeleted && (
            <Trash
              size={14}
              weight="fill"
              className="text-red-500"
            />
          )}
        </div>

        {/* Content */}
        <div className={cn('flex-1 min-w-0', isGrid ? '' : 'flex flex-col')}>
          {/* Title */}
          <h3
            className={cn(
              'font-semibold text-gray-900 dark:text-gray-900',
              isGrid ? 'text-base mb-2 line-clamp-2' : 'text-sm line-clamp-1'
            )}
          >
            {note.title || 'Untitled'}
          </h3>

          {/* Content preview */}
          <p
            className={cn(
              'text-gray-600 dark:text-gray-700',
              isGrid ? 'text-sm line-clamp-4' : 'text-xs line-clamp-2 mt-1'
            )}
          >
            {note.content || 'No content'}
          </p>

          {/* Labels */}
          {note.labels.length > 0 && (
            <div
              className={cn(
                'flex flex-wrap gap-1',
                isGrid ? 'mt-3' : 'mt-2'
              )}
            >
              {note.labels.slice(0, 3).map((label) => (
                <LabelPill
                  key={label}
                  label={label}
                  size="sm"
                  showIcon={isGrid}
                />
              ))}
              {note.labels.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{note.labels.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Timestamp */}
          <p
            className={cn(
              'text-gray-500',
              isGrid ? 'text-xs mt-3' : 'text-[10px] mt-2'
            )}
          >
            {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
          </p>
        </div>
      </article>
    </Link>
  );
}
