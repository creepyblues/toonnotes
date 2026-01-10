'use client';

import Link from 'next/link';
import { Hash } from '@phosphor-icons/react';
import { Note } from '@toonnotes/types';
import { useBoardStore } from '@/stores';
import { cn } from '@/lib/utils';

interface BoardCardProps {
  hashtag: string;
  notes: Note[];
}

export function BoardCard({ hashtag, notes }: BoardCardProps) {
  const getPresetForBoard = useBoardStore((state) => state.getPresetForBoard);
  const preset = getPresetForBoard(hashtag);

  const previewNotes = notes.slice(0, 4);
  const noteCount = notes.length;

  return (
    <Link
      href={`/boards/${encodeURIComponent(hashtag)}`}
      className="block group"
    >
      <article className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
        {/* Preview grid with preset background */}
        <div
          className="aspect-[4/3] relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${preset.colors.bg} 0%, ${preset.colors.bgSecondary} 100%)`,
          }}
        >
          {/* Decorations */}
          {preset.decorations.length > 0 && (
            <div className="absolute top-2 right-2 flex gap-1 opacity-40">
              {preset.decorations.slice(0, 2).map((deco, i) => (
                <span key={i} className="text-2xl">
                  {deco}
                </span>
              ))}
            </div>
          )}

          {previewNotes.length > 0 ? (
            <div className="absolute inset-0 grid grid-cols-2 gap-1.5 p-3">
              {previewNotes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-lg shadow-sm overflow-hidden"
                  style={{ backgroundColor: preset.colors.notePreview }}
                >
                  <div className="p-2 h-full">
                    <p
                      className="text-[10px] font-medium line-clamp-2"
                      style={{ color: preset.colors.bg }}
                    >
                      {note.title || 'Untitled'}
                    </p>
                    <p className="text-[8px] text-gray-600 line-clamp-2 mt-1">
                      {note.content?.replace(/<[^>]*>/g, '') || ''}
                    </p>
                  </div>
                </div>
              ))}
              {/* Fill empty slots */}
              {Array.from({ length: Math.max(0, 4 - previewNotes.length) }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="rounded-lg opacity-30"
                  style={{ backgroundColor: preset.colors.notePreview }}
                />
              ))}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Hash size={48} style={{ color: preset.colors.accent }} className="opacity-50" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: preset.colors.accent }}
            />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {hashtag}
            </h3>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {noteCount} note{noteCount !== 1 ? 's' : ''}
            </p>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: preset.colors.badge,
                color: preset.colors.badgeText,
              }}
            >
              {preset.name}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
