'use client';

import { TopBar } from '@/components/layout';
import { NoteGrid } from '@/components/notes';

export default function ArchivePage() {
  return (
    <>
      <TopBar
        title="Archive"
        showViewToggle
        showNewButton={false}
        showSearch
      />
      <div className="flex-1 overflow-y-auto p-6">
        <NoteGrid filter="archived" showPinned={false} />
      </div>
    </>
  );
}
