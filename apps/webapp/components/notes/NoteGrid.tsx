'use client';

import { useMemo } from 'react';
import { NotePencil } from '@phosphor-icons/react';
import { useUIStore, useNoteStore } from '@/stores';
import { NoteCard } from './NoteCard';
import { cn } from '@/lib/utils';

interface NoteGridProps {
  showPinned?: boolean;
  filter?: 'active' | 'archived' | 'deleted';
}

export function NoteGrid({ showPinned = true, filter = 'active' }: NoteGridProps) {
  const viewMode = useUIStore((state) => state.viewMode);
  const searchQuery = useUIStore((state) => state.searchQuery);

  const getActiveNotes = useNoteStore((state) => state.getActiveNotes);
  const getArchivedNotes = useNoteStore((state) => state.getArchivedNotes);
  const getDeletedNotes = useNoteStore((state) => state.getDeletedNotes);
  const getPinnedNotes = useNoteStore((state) => state.getPinnedNotes);
  const searchNotes = useNoteStore((state) => state.searchNotes);

  // Get filtered notes based on filter prop and search query
  const { pinnedNotes, regularNotes } = useMemo(() => {
    let notes;

    if (searchQuery.trim()) {
      notes = searchNotes(searchQuery);
    } else {
      switch (filter) {
        case 'archived':
          notes = getArchivedNotes();
          break;
        case 'deleted':
          notes = getDeletedNotes();
          break;
        default:
          notes = getActiveNotes();
      }
    }

    // Separate pinned and regular notes (only for active filter)
    if (showPinned && filter === 'active' && !searchQuery.trim()) {
      const pinned = getPinnedNotes();
      const regular = notes.filter((n) => !n.isPinned);
      return { pinnedNotes: pinned, regularNotes: regular };
    }

    return { pinnedNotes: [], regularNotes: notes };
  }, [
    filter,
    searchQuery,
    showPinned,
    getActiveNotes,
    getArchivedNotes,
    getDeletedNotes,
    getPinnedNotes,
    searchNotes,
  ]);

  const isGrid = viewMode === 'grid';
  const hasNotes = pinnedNotes.length > 0 || regularNotes.length > 0;

  if (!hasNotes) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <NotePencil size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
          {searchQuery.trim()
            ? 'No notes found'
            : filter === 'archived'
            ? 'No archived notes'
            : filter === 'deleted'
            ? 'Trash is empty'
            : 'No notes yet'}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {searchQuery.trim()
            ? 'Try a different search term'
            : filter === 'active'
            ? 'Create your first note to get started'
            : null}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pinned Notes Section */}
      {pinnedNotes.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
            Pinned
          </h2>
          <div
            className={cn(
              isGrid
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-2'
            )}
          >
            {pinnedNotes.map((note) => (
              <NoteCard key={note.id} note={note} viewMode={viewMode} />
            ))}
          </div>
        </section>
      )}

      {/* Regular Notes Section */}
      {regularNotes.length > 0 && (
        <section>
          {pinnedNotes.length > 0 && (
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
              Recent
            </h2>
          )}
          <div
            className={cn(
              isGrid
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-2'
            )}
          >
            {regularNotes.map((note) => (
              <NoteCard key={note.id} note={note} viewMode={viewMode} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
