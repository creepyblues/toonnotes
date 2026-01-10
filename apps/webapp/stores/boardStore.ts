'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  BoardPreset,
  BOARD_PRESETS,
  getPresetForHashtag,
  getBoardPresetById,
} from '@toonnotes/constants';

// Board style assignment - maps hashtag to preset ID
interface BoardStyleAssignment {
  hashtag: string;
  presetId: string;
  customColors?: Partial<{
    bg: string;
    bgSecondary: string;
    accent: string;
  }>;
}

interface BoardStore {
  // Board style assignments (hashtag -> preset)
  boardStyles: BoardStyleAssignment[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setBoardStyle: (hashtag: string, presetId: string) => void;
  removeBoardStyle: (hashtag: string) => void;
  getBoardStyle: (hashtag: string) => BoardStyleAssignment | undefined;
  getPresetForBoard: (hashtag: string) => BoardPreset;
  setCustomColors: (
    hashtag: string,
    colors: Partial<{ bg: string; bgSecondary: string; accent: string }>
  ) => void;
  clearCustomColors: (hashtag: string) => void;

  // Sync state
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setBoardStyles: (styles: BoardStyleAssignment[]) => void;
}

export const useBoardStore = create<BoardStore>()(
  persist(
    (set, get) => ({
      boardStyles: [],
      isLoading: false,
      error: null,

      setBoardStyle: (hashtag, presetId) => {
        const normalized = hashtag.toLowerCase().trim();
        set((state) => {
          const existing = state.boardStyles.find((s) => s.hashtag === normalized);
          if (existing) {
            return {
              boardStyles: state.boardStyles.map((s) =>
                s.hashtag === normalized ? { ...s, presetId } : s
              ),
            };
          }
          return {
            boardStyles: [...state.boardStyles, { hashtag: normalized, presetId }],
          };
        });
      },

      removeBoardStyle: (hashtag) => {
        const normalized = hashtag.toLowerCase().trim();
        set((state) => ({
          boardStyles: state.boardStyles.filter((s) => s.hashtag !== normalized),
        }));
      },

      getBoardStyle: (hashtag) => {
        const normalized = hashtag.toLowerCase().trim();
        return get().boardStyles.find((s) => s.hashtag === normalized);
      },

      getPresetForBoard: (hashtag) => {
        const normalized = hashtag.toLowerCase().trim();
        const assignment = get().boardStyles.find((s) => s.hashtag === normalized);

        if (assignment) {
          // User has explicitly set a preset
          const preset = getBoardPresetById(assignment.presetId);
          if (preset) {
            // Apply any custom colors
            if (assignment.customColors) {
              return {
                ...preset,
                colors: {
                  ...preset.colors,
                  ...assignment.customColors,
                },
              };
            }
            return preset;
          }
        }

        // Fall back to auto-generated preset based on hashtag
        return getPresetForHashtag(hashtag);
      },

      setCustomColors: (hashtag, colors) => {
        const normalized = hashtag.toLowerCase().trim();
        set((state) => {
          const existing = state.boardStyles.find((s) => s.hashtag === normalized);
          if (existing) {
            return {
              boardStyles: state.boardStyles.map((s) =>
                s.hashtag === normalized
                  ? { ...s, customColors: { ...s.customColors, ...colors } }
                  : s
              ),
            };
          }
          // Create new assignment with auto-preset and custom colors
          const autoPreset = getPresetForHashtag(hashtag);
          return {
            boardStyles: [
              ...state.boardStyles,
              { hashtag: normalized, presetId: autoPreset.id, customColors: colors },
            ],
          };
        });
      },

      clearCustomColors: (hashtag) => {
        const normalized = hashtag.toLowerCase().trim();
        set((state) => ({
          boardStyles: state.boardStyles.map((s) =>
            s.hashtag === normalized ? { ...s, customColors: undefined } : s
          ),
        }));
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setBoardStyles: (styles) => set({ boardStyles: styles }),
    }),
    {
      name: 'toonnotes-board-styles',
    }
  )
);

// Selector for all available presets
export const getAllBoardPresets = () => BOARD_PRESETS;
