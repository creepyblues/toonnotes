'use client';

import type { BoardData, Mode } from '@toonnotes/types';
import { BoardCard } from './BoardCard';
import { getModeConfig, type ModeTabId } from '@/constants/modeConfig';

interface BoardGridProps {
  boards: BoardData[];
  selectedMode: ModeTabId;
  getBoardMode: (hashtag: string) => Mode | undefined;
  onModeChange: (hashtag: string, mode: Mode | undefined) => void;
}

export function BoardGrid({ boards, selectedMode, getBoardMode, onModeChange }: BoardGridProps) {
  if (boards.length === 0) {
    const config = getModeConfig(selectedMode);
    const Icon = config.icon;

    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: `${config.color}15` }}
        >
          <Icon size={32} color={config.color} />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
          No {config.label.toLowerCase()} boards
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          {selectedMode === 'uncategorized'
            ? 'All boards have been assigned to a mode. Right-click any board to change its mode.'
            : `Right-click a board to assign it to ${config.label}.`}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {boards.map((board) => (
        <BoardCard
          key={board.hashtag}
          board={board}
          mode={getBoardMode(board.hashtag)}
          onModeChange={(mode) => onModeChange(board.hashtag, mode)}
        />
      ))}
    </div>
  );
}
