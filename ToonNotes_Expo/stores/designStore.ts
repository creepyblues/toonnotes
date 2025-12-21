import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NoteDesign } from '@/types';

interface DesignState {
  designs: NoteDesign[];

  // Actions
  addDesign: (design: NoteDesign) => void;
  deleteDesign: (id: string) => void;
  updateDesign: (id: string, updates: Partial<NoteDesign>) => void;

  // Queries
  getDesignById: (id: string) => NoteDesign | undefined;
}

export const useDesignStore = create<DesignState>()(
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
    }),
    {
      name: 'toonnotes-designs',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
