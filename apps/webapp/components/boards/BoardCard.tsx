'use client';

import Link from 'next/link';
import { Hash } from '@phosphor-icons/react';
import type { BoardData, Mode } from '@toonnotes/types';
import { useBoardStore } from '@/stores';
import { formatPreview } from '@/lib/utils';
import { getModeConfig } from '@/constants/modeConfig';
import { ModeContextMenu, ModeDropdownButton } from './ModeContextMenu';

interface BoardCardProps {
  board: BoardData;
  mode?: Mode;
  onModeChange: (mode: Mode | undefined) => void;
}

export function BoardCard({ board, mode, onModeChange }: BoardCardProps) {
  const getPresetForBoard = useBoardStore((state) => state.getPresetForBoard);
  const preset = getPresetForBoard(board.hashtag);
  const modeConfig = mode ? getModeConfig(mode) : undefined;

  const previewNotes = board.previewNotes.slice(0, 4);

  return (
    <ModeContextMenu currentMode={mode} onModeChange={onModeChange}>
      <div className="block group">
        <Link href={`/boards/${encodeURIComponent(board.hashtag)}`}>
          <article className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
            {/* Header */}
            <div className="p-3 bg-white dark:bg-gray-900">
              <div className="flex items-center gap-2">
                {/* Mode badge */}
                {modeConfig && (
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium text-white"
                    style={{ backgroundColor: modeConfig.color }}
                  >
                    <modeConfig.icon size={10} weight="fill" />
                    {modeConfig.shortLabel}
                  </span>
                )}
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: preset.colors.accent }}
                />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate flex-1">
                  {board.hashtag}
                </h3>
                {/* Three-dot mode dropdown */}
                <ModeDropdownButton currentMode={mode} onModeChange={onModeChange} />
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {board.noteCount} note{board.noteCount !== 1 ? 's' : ''}
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

            {/* Preview area with preset background */}
            <div
              className="aspect-[4/3] relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${preset.colors.bg} 0%, ${preset.colors.bgSecondary} 100%)`,
              }}
            >
              {/* Decorations */}
              {preset.decorations.length > 0 && (
                <div className="absolute bottom-2 right-2 flex gap-1 opacity-30 pointer-events-none">
                  {preset.decorations.slice(0, 2).map((deco, i) => (
                    <span key={i} className="text-3xl">
                      {deco}
                    </span>
                  ))}
                </div>
              )}

              {previewNotes.length > 0 ? (
                <div className="absolute inset-0 flex gap-2 p-3 overflow-x-auto">
                  {previewNotes.map((note) => (
                    <div
                      key={note.id}
                      className="flex-shrink-0 w-[140px] rounded-lg shadow-sm overflow-hidden"
                      style={{ backgroundColor: preset.colors.notePreview }}
                    >
                      <div className="p-2 h-full">
                        <p
                          className="text-[10px] font-medium line-clamp-2"
                          style={{ color: preset.colors.bg }}
                        >
                          {note.title || 'Untitled'}
                        </p>
                        <p className="text-[8px] text-gray-600 line-clamp-3 mt-1 whitespace-pre-line">
                          {formatPreview(note.content) || ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Hash size={48} style={{ color: preset.colors.accent }} className="opacity-50" />
                </div>
              )}
            </div>
          </article>
        </Link>
      </div>
    </ModeContextMenu>
  );
}
