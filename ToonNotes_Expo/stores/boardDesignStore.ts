import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { BoardDesign } from '@/types';
import { debouncedStorage } from './debouncedStorage';

interface BoardDesignState {
  designs: BoardDesign[];

  // Actions
  addDesign: (design: BoardDesign) => void;
  deleteDesign: (id: string) => void;
  updateDesign: (id: string, updates: Partial<BoardDesign>) => void;

  // Queries
  getDesignById: (id: string) => BoardDesign | undefined;
  getDesignByHashtag: (hashtag: string) => BoardDesign | undefined;
}

export const useBoardDesignStore = create<BoardDesignState>()(
  persist(
    (set, get) => ({
      designs: [],

      addDesign: (design) => {
        set((state) => ({
          designs: [design, ...state.designs],
        }));
      },

      deleteDesign: (id) => {
        set((state) => ({
          designs: state.designs.filter((d) => d.id !== id),
        }));
      },

      updateDesign: (id, updates) => {
        set((state) => ({
          designs: state.designs.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
        }));
      },

      getDesignById: (id) => get().designs.find((d) => d.id === id),

      getDesignByHashtag: (hashtag) =>
        get().designs.find(
          (d) => d.boardHashtag.toLowerCase() === hashtag.toLowerCase()
        ),
    }),
    {
      name: 'toonnotes-board-designs',
      storage: createJSONStorage(() => debouncedStorage),
    }
  )
);
