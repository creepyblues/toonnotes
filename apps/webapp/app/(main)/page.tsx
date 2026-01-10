'use client';

import { TopBar } from '@/components/layout';
import { NoteGrid } from '@/components/notes';

export default function NotesPage() {
  return (
    <>
      <TopBar title="Notes" showViewToggle showNewButton showSearch />
      <div className="flex-1 overflow-y-auto p-6">
        <NoteGrid filter="active" showPinned />
      </div>
    </>
  );
}
