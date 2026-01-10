'use client';

import { TopBar } from '@/components/layout';
import { NoteGrid } from '@/components/notes';
import { Trash as TrashIcon, Warning } from '@phosphor-icons/react';
import { useNoteStore } from '@/stores';

export default function TrashPage() {
  const deletedNotes = useNoteStore((state) => state.getDeletedNotes());

  return (
    <>
      <TopBar
        title="Trash"
        showViewToggle
        showNewButton={false}
        showSearch
      />
      <div className="flex-1 overflow-y-auto p-6">
        {/* Warning banner */}
        {deletedNotes.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-3">
            <Warning size={20} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                Items in trash will be automatically deleted after 30 days
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Restore notes you want to keep or they will be permanently removed
              </p>
            </div>
          </div>
        )}

        <NoteGrid filter="deleted" showPinned={false} />
      </div>
    </>
  );
}
