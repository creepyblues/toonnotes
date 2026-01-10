'use client';

import { create } from 'zustand';
import { NoteDesign } from '@toonnotes/types';

interface DesignState {
  designs: NoteDesign[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setDesigns: (designs: NoteDesign[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // CRUD
  addDesign: (design: NoteDesign) => void;
  updateDesign: (id: string, updates: Partial<NoteDesign>) => void;
  deleteDesign: (id: string) => void;

  // Queries
  getDesignById: (id: string) => NoteDesign | undefined;
  getUserDesigns: () => NoteDesign[];
  getLabelPresetDesigns: () => NoteDesign[];
}

export const useDesignStore = create<DesignState>()((set, get) => ({
  designs: [],
  isLoading: false,
  error: null,

  // Setters for hydration from server
  setDesigns: (designs) => set({ designs }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // CRUD
  addDesign: (design) => {
    set((state) => ({ designs: [design, ...state.designs] }));
  },

  updateDesign: (id, updates) => {
    set((state) => ({
      designs: state.designs.map((design) =>
        design.id === id ? { ...design, ...updates } : design
      ),
    }));
  },

  deleteDesign: (id) => {
    set((state) => ({
      designs: state.designs.filter((design) => design.id !== id),
    }));
  },

  // Queries
  getDesignById: (id) => {
    // Handle label preset design IDs
    if (id?.startsWith('label-preset-')) {
      // Label preset designs are generated on-the-fly, not stored
      return undefined;
    }
    return get().designs.find((design) => design.id === id);
  },

  getUserDesigns: () =>
    get()
      .designs.filter((design) => !design.isLabelPreset && !design.isSystemDefault)
      .sort((a, b) => b.createdAt - a.createdAt),

  getLabelPresetDesigns: () =>
    get()
      .designs.filter((design) => design.isLabelPreset)
      .sort((a, b) => b.createdAt - a.createdAt),
}));
