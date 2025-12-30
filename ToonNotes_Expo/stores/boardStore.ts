import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Board, BoardStyle, BoardData, Note, NoteColor } from '@/types';
import { generateUUID } from '@/utils/uuid';

interface BoardState {
  // Persisted board customizations
  boards: Board[];

  // Board actions
  updateBoardStyle: (hashtag: string, style: BoardStyle) => void;
  clearBoardStyle: (hashtag: string) => void;
  getBoardByHashtag: (hashtag: string) => Board | undefined;

  // Board design actions
  applyDesign: (hashtag: string, designId: string) => void;
  clearDesign: (hashtag: string) => void;
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      boards: [],

      updateBoardStyle: (hashtag, style) => {
        const existing = get().boards.find(
          (b) => b.hashtag.toLowerCase() === hashtag.toLowerCase()
        );

        if (existing) {
          // Update existing board
          set((state) => ({
            boards: state.boards.map((b) =>
              b.hashtag.toLowerCase() === hashtag.toLowerCase()
                ? { ...b, customStyle: style, updatedAt: Date.now() }
                : b
            ),
          }));
        } else {
          // Create new board entry
          const now = Date.now();
          const newBoard: Board = {
            id: generateUUID(),
            hashtag: hashtag.toLowerCase(),
            customStyle: style,
            createdAt: now,
            updatedAt: now,
          };
          set((state) => ({ boards: [...state.boards, newBoard] }));
        }
      },

      clearBoardStyle: (hashtag) => {
        set((state) => ({
          boards: state.boards.map((b) =>
            b.hashtag.toLowerCase() === hashtag.toLowerCase()
              ? { ...b, customStyle: undefined, updatedAt: Date.now() }
              : b
          ),
        }));
      },

      getBoardByHashtag: (hashtag) =>
        get().boards.find(
          (b) => b.hashtag.toLowerCase() === hashtag.toLowerCase()
        ),

      applyDesign: (hashtag, designId) => {
        const existing = get().boards.find(
          (b) => b.hashtag.toLowerCase() === hashtag.toLowerCase()
        );

        if (existing) {
          // Update existing board with design
          set((state) => ({
            boards: state.boards.map((b) =>
              b.hashtag.toLowerCase() === hashtag.toLowerCase()
                ? { ...b, boardDesignId: designId, updatedAt: Date.now() }
                : b
            ),
          }));
        } else {
          // Create new board entry with design
          const now = Date.now();
          const newBoard: Board = {
            id: generateUUID(),
            hashtag: hashtag.toLowerCase(),
            boardDesignId: designId,
            createdAt: now,
            updatedAt: now,
          };
          set((state) => ({ boards: [...state.boards, newBoard] }));
        }
      },

      clearDesign: (hashtag) => {
        set((state) => ({
          boards: state.boards.map((b) =>
            b.hashtag.toLowerCase() === hashtag.toLowerCase()
              ? { ...b, boardDesignId: undefined, updatedAt: Date.now() }
              : b
          ),
        }));
      },
    }),
    {
      name: 'toonnotes-boards',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ============================================
// Board Data Computation Utilities
// ============================================

/**
 * Compute BoardData from notes
 * This is a pure function that derives board data from notes by their labels
 */
export function computeBoardsFromNotes(
  notes: Note[],
  boardCustomizations: Board[]
): BoardData[] {
  // Get active notes only
  const activeNotes = notes.filter((n) => !n.isArchived && !n.isDeleted);

  // Group notes by label
  const labelMap = new Map<string, Note[]>();

  for (const note of activeNotes) {
    for (const label of note.labels) {
      const normalizedLabel = label.toLowerCase();
      if (!labelMap.has(normalizedLabel)) {
        labelMap.set(normalizedLabel, []);
      }
      labelMap.get(normalizedLabel)!.push(note);
    }
  }

  // Convert to BoardData array
  const boardsData: BoardData[] = [];

  for (const [hashtag, boardNotes] of labelMap) {
    // Sort notes by updatedAt descending
    const sortedNotes = [...boardNotes].sort((a, b) => b.updatedAt - a.updatedAt);

    // Get derived colors from note backgrounds
    const derivedColors = sortedNotes
      .slice(0, 3)
      .map((note) => note.color || NoteColor.White);

    const boardData: BoardData = {
      hashtag,
      noteCount: boardNotes.length,
      previewNotes: sortedNotes.slice(0, 6),
      mostRecentUpdate: sortedNotes[0]?.updatedAt || 0,
      derivedColors,
    };

    boardsData.push(boardData);
  }

  // Sort by most recent activity
  boardsData.sort((a, b) => b.mostRecentUpdate - a.mostRecentUpdate);

  return boardsData;
}

/**
 * Derive a gradient from note colors
 */
export function deriveGradientFromColors(colors: string[]): string[] {
  if (colors.length === 0) {
    return [NoteColor.White, NoteColor.Sky];
  }
  if (colors.length === 1) {
    return [colors[0], adjustColorBrightness(colors[0], -20)];
  }
  return [colors[0], colors[1]];
}

/**
 * Adjust color brightness (simple implementation)
 */
function adjustColorBrightness(hex: string, percent: number): string {
  // Remove # if present
  const cleanHex = hex.replace('#', '');

  // Parse RGB
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Adjust
  const adjust = (value: number) =>
    Math.max(0, Math.min(255, value + (value * percent) / 100));

  const newR = Math.round(adjust(r)).toString(16).padStart(2, '0');
  const newG = Math.round(adjust(g)).toString(16).padStart(2, '0');
  const newB = Math.round(adjust(b)).toString(16).padStart(2, '0');

  return `#${newR}${newG}${newB}`;
}
