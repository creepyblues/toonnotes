'use client';

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { TopBar } from '@/components/layout';
import { BoardGrid, ModeTabBar } from '@/components/boards';
import { useNoteStore, useBoardStore } from '@/stores';
import { computeBoardsFromNotes } from '@/lib/computeBoards';
import { inferBoardMode } from '@/services/modeDetectionService';
import type { ModeTabId } from '@/constants/modeConfig';
import { MODE_TAB_CONFIGS } from '@/constants/modeConfig';
import type { Mode } from '@toonnotes/types';

export default function BoardsPage() {
  const getActiveNotes = useNoteStore((state) => state.getActiveNotes);
  const getBoardMode = useBoardStore((state) => state.getBoardMode);
  const updateBoardMode = useBoardStore((state) => state.updateBoardMode);

  const [selectedTab, setSelectedTab] = useState<ModeTabId>('manage');
  const [hydrated, setHydrated] = useState(false);
  const processedBoards = useRef(new Set<string>());

  // Wait for Zustand persist middleware to finish rehydrating from localStorage.
  // Simple useEffect(() => setHydrated(true)) fires before persist finishes loading,
  // so we use Zustand's built-in onFinishHydration callback.
  useEffect(() => {
    if (useBoardStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useBoardStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    return unsub;
  }, []);

  // Compute all boards from notes
  const boards = useMemo(() => {
    const notes = getActiveNotes();
    return computeBoardsFromNotes(notes);
  }, [getActiveNotes]);

  // Select the first tab that has boards
  const selectBestDefaultTab = useCallback(() => {
    for (const config of MODE_TAB_CONFIGS) {
      const count = boards.filter((b) => {
        const mode = getBoardMode(b.hashtag);
        if (config.id === 'uncategorized') return mode === undefined;
        return mode === config.id;
      }).length;
      if (count > 0) {
        setSelectedTab(config.id);
        return;
      }
    }
  }, [boards, getBoardMode]);

  // Auto-detect modes for boards without a mode (handles new boards too)
  useEffect(() => {
    if (!hydrated || boards.length === 0) return;

    let assigned = false;
    for (const board of boards) {
      if (processedBoards.current.has(board.hashtag)) continue;
      processedBoards.current.add(board.hashtag);

      const existingMode = getBoardMode(board.hashtag);
      if (existingMode !== undefined) continue;

      const result = inferBoardMode(board.hashtag);
      if (result.confidence >= 0.5) {
        updateBoardMode(board.hashtag, result.mode);
        assigned = true;
      }
    }

    if (assigned) {
      selectBestDefaultTab();
    }
  }, [hydrated, boards, getBoardMode, updateBoardMode, selectBestDefaultTab]);

  // Set initial tab when hydrated and boards are available
  useEffect(() => {
    if (hydrated) {
      selectBestDefaultTab();
    }
  }, [hydrated, selectBestDefaultTab]);

  // Compute mode counts
  const modeCounts = useMemo(() => {
    const counts: Record<ModeTabId, number> = {
      manage: 0,
      organize: 0,
      develop: 0,
      experience: 0,
      uncategorized: 0,
    };
    if (!hydrated) return counts;
    for (const board of boards) {
      const mode = getBoardMode(board.hashtag);
      if (mode) {
        counts[mode]++;
      } else {
        counts.uncategorized++;
      }
    }
    return counts;
  }, [hydrated, boards, getBoardMode]);

  // Filter boards by selected tab
  const filteredBoards = useMemo(() => {
    if (!hydrated) return [];
    return boards.filter((board) => {
      const mode = getBoardMode(board.hashtag);
      if (selectedTab === 'uncategorized') return mode === undefined;
      return mode === selectedTab;
    });
  }, [hydrated, boards, selectedTab, getBoardMode]);

  const handleModeChange = useCallback(
    (hashtag: string, mode: Mode | undefined) => {
      updateBoardMode(hashtag, mode);
    },
    [updateBoardMode]
  );

  return (
    <>
      <TopBar
        title="Boards"
        showViewToggle={false}
        showNewButton={false}
        showSearch
      />
      <ModeTabBar
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        counts={modeCounts}
      />
      <div className="flex-1 overflow-y-auto p-6">
        <BoardGrid
          boards={filteredBoards}
          selectedMode={selectedTab}
          getBoardMode={getBoardMode}
          onModeChange={handleModeChange}
        />
      </div>
    </>
  );
}
