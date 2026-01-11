'use client';

import { useMemo } from 'react';
import { Kanban } from '@phosphor-icons/react';
import { useNoteStore } from '@/stores';
import { BoardCard } from './BoardCard';
import { Note } from '@toonnotes/types';

export function BoardGrid() {
  const getActiveNotes = useNoteStore((state) => state.getActiveNotes);

  // Group notes by label (hashtag)
  const boards = useMemo(() => {
    const notes = getActiveNotes();
    const labelMap = new Map<string, Note[]>();

    // Group notes by label
    notes.forEach((note) => {
      note.labels.forEach((label) => {
        const existing = labelMap.get(label) || [];
        labelMap.set(label, [...existing, note]);
      });
    });

    // Convert to array and sort by note count (descending)
    return Array.from(labelMap.entries())
      .map(([hashtag, notes]) => ({
        hashtag,
        notes,
        mostRecentUpdate: Math.max(...notes.map((n) => n.updatedAt)),
      }))
      .sort((a, b) => b.mostRecentUpdate - a.mostRecentUpdate);
  }, [getActiveNotes]);

  if (boards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Kanban size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
          No boards yet
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          Boards are automatically created from labels in your notes. Add #hashtags to your notes to create boards.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {boards.map(({ hashtag, notes }) => (
        <BoardCard key={hashtag} hashtag={hashtag} notes={notes} />
      ))}
    </div>
  );
}
