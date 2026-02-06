'use client';

import Link from 'next/link';
import { Hash } from '@phosphor-icons/react';
import type { BoardData, Mode } from '@toonnotes/types';
import { useBoardStore } from '@/stores';
import { getModeConfig } from '@/constants/modeConfig';
import { ModeContextMenu, ModeDropdownButton } from './ModeContextMenu';

interface BoardCardProps {
  board: BoardData;
  mode?: Mode;
  onModeChange: (mode: Mode | undefined) => void;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getContrastText(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1a1a2e' : '#ffffff';
}

export function BoardCard({ board, mode, onModeChange }: BoardCardProps) {
  const getPresetForBoard = useBoardStore((state) => state.getPresetForBoard);
  const preset = getPresetForBoard(board.hashtag);
  const modeConfig = mode ? getModeConfig(mode) : undefined;

  const textColor = getContrastText(preset.colors.bg);
  const subtleText = hexToRgba(textColor, 0.6);
  const previewNotes = board.previewNotes.slice(0, 4);

  return (
    <ModeContextMenu currentMode={mode} onModeChange={onModeChange}>
      <div className="block group">
        <Link href={`/boards/${encodeURIComponent(board.hashtag)}`}>
          <article
            className="relative flex flex-col justify-between overflow-hidden rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
            style={{
              background: `linear-gradient(160deg, ${preset.colors.bg} 0%, ${hexToRgba(preset.colors.bg, 0.8)} 50%, ${hexToRgba(preset.colors.accent, 0.3)} 100%)`,
              aspectRatio: '3 / 4',
            }}
          >
            {/* Decorative circle */}
            <div
              className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 pointer-events-none"
              style={{ background: preset.colors.accent }}
            />

            {/* Decorative emoji */}
            {preset.decorations.length > 0 && (
              <div className="absolute bottom-16 right-3 opacity-10 pointer-events-none">
                <span className="text-5xl">{preset.decorations[0]}</span>
              </div>
            )}

            {/* Top row: label + mode + dropdown */}
            <div className="relative z-10 flex items-start justify-between p-4">
              <div className="flex items-center gap-2">
                {/* Label (preset name) badge — hero element */}
                <span
                  className="rounded-lg px-2.5 py-1 text-xs font-bold"
                  style={{
                    background: hexToRgba(textColor, 0.15),
                    color: textColor,
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {preset.name}
                </span>

                {/* Mode badge */}
                {modeConfig && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{
                      background: hexToRgba(modeConfig.color, 0.2),
                      color: modeConfig.color,
                    }}
                  >
                    <modeConfig.icon size={10} weight="fill" />
                    {modeConfig.shortLabel}
                  </span>
                )}
              </div>

              {/* Three-dot mode dropdown */}
              <ModeDropdownButton currentMode={mode} onModeChange={onModeChange} />
            </div>

            {/* Center: large title + note count */}
            <div className="relative z-10 my-auto px-4">
              <h3
                className="text-2xl font-bold leading-tight tracking-tight"
                style={{ color: textColor }}
              >
                {board.hashtag}
              </h3>
              <p className="mt-1 text-sm" style={{ color: subtleText }}>
                {board.noteCount} {board.noteCount === 1 ? 'note' : 'notes'}
              </p>
            </div>

            {/* Bottom: note-title pills */}
            <div className="relative z-10 flex flex-wrap gap-1.5 px-4 pb-4">
              {previewNotes.length > 0 ? (
                <>
                  {previewNotes.map((note) => (
                    <span
                      key={note.id}
                      className="max-w-[140px] truncate rounded-full px-2.5 py-0.5 text-[11px]"
                      style={{
                        background: hexToRgba(textColor, 0.12),
                        color: textColor,
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {note.title || 'Untitled'}
                    </span>
                  ))}
                  {board.noteCount > 4 && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px]"
                      style={{ color: subtleText }}
                    >
                      +{board.noteCount - 4}
                    </span>
                  )}
                </>
              ) : (
                <span
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] italic"
                  style={{ color: subtleText }}
                >
                  <Hash size={10} style={{ color: preset.colors.accent }} />
                  No notes yet
                </span>
              )}
            </div>
          </article>
        </Link>
      </div>
    </ModeContextMenu>
  );
}
