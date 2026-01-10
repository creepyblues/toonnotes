'use client';

import { TopBar } from '@/components/layout';
import { BoardGrid } from '@/components/boards';

export default function BoardsPage() {
  return (
    <>
      <TopBar
        title="Boards"
        showViewToggle={false}
        showNewButton={false}
        showSearch
      />
      <div className="flex-1 overflow-y-auto p-6">
        <BoardGrid />
      </div>
    </>
  );
}
