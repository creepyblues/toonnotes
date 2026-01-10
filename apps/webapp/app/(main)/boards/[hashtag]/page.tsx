'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Hash } from '@phosphor-icons/react';
import { useUIStore, useNoteStore, useBoardStore } from '@/stores';
import { NoteCard } from '@/components/notes';
import { BoardStylePicker, BoardStyleButton } from '@/components/boards';
import { cn } from '@/lib/utils';

interface BoardDetailPageProps {
  params: Promise<{ hashtag: string }>;
}

export default function BoardDetailPage({ params }: BoardDetailPageProps) {
  const { hashtag: encodedHashtag } = use(params);
  const hashtag = decodeURIComponent(encodedHashtag);

  const viewMode = useUIStore((state) => state.viewMode);
  const getNotesByLabel = useNoteStore((state) => state.getNotesByLabel);
  const getPresetForBoard = useBoardStore((state) => state.getPresetForBoard);

  const [showStylePicker, setShowStylePicker] = useState(false);

  const notes = useMemo(() => getNotesByLabel(hashtag), [hashtag, getNotesByLabel]);
  const preset = getPresetForBoard(hashtag);

  const isGrid = viewMode === 'grid';

  return (
    <>
      {/* Header with preset styling */}
      <header
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${preset.colors.bg} 0%, ${preset.colors.bgSecondary} 100%)`,
        }}
      >
        {/* Decorations */}
        {preset.decorations.length > 0 && (
          <div className="absolute top-4 right-8 flex gap-2 opacity-30">
            {preset.decorations.map((deco, i) => (
              <span key={i} className="text-4xl">
                {deco}
              </span>
            ))}
          </div>
        )}

        <div className="relative flex items-center gap-4 px-6 py-6">
          <Link
            href="/boards"
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Back to boards"
          >
            <ArrowLeft size={20} style={{ color: preset.colors.labelText }} />
          </Link>

          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: preset.colors.accent }}
            >
              <Hash size={20} style={{ color: preset.colors.bg }} weight="bold" />
            </div>
            <div>
              <h1
                className="text-xl font-bold"
                style={{ color: preset.colors.labelText }}
              >
                {hashtag}
              </h1>
              <p
                className="text-sm opacity-80"
                style={{ color: preset.colors.labelText }}
              >
                {notes.length} note{notes.length !== 1 ? 's' : ''} &middot; {preset.name}
              </p>
            </div>
          </div>

          <div className="ml-auto">
            <BoardStyleButton hashtag={hashtag} onOpenPicker={() => setShowStylePicker(true)} />
          </div>
        </div>
      </header>

      {/* Notes grid */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950">
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
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: `${preset.colors.accent}30` }}
            >
              <Hash size={32} style={{ color: preset.colors.accent }} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
              No notes in this board
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Add #{hashtag} to your notes to see them here
            </p>
          </div>
        )}
      </div>

      {/* Style Picker Modal */}
      <BoardStylePicker
        hashtag={hashtag}
        isOpen={showStylePicker}
        onClose={() => setShowStylePicker(false)}
      />
    </>
  );
}
