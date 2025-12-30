import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { NoteDesign } from '@/types';
import { debouncedStorage } from './debouncedStorage';
import { SYSTEM_DEFAULT_DESIGNS } from '@/constants/themes';
import { getPresetById, LabelPresetId } from '@/constants/labelPresets';
import { labelPresetToNoteDesign } from '@/services/designEngine';

// Cache for label preset designs (no need to persist - computed from constants)
const labelPresetDesignCache: Map<string, NoteDesign> = new Map();

interface DesignState {
  designs: NoteDesign[];

  // Actions
  addDesign: (design: NoteDesign) => void;
  deleteDesign: (id: string) => void;
  updateDesign: (id: string, updates: Partial<NoteDesign>) => void;
  clearAllDesigns: () => void;

  // Queries
  getDesignById: (id: string) => NoteDesign | undefined;
  getLabelPresetDesign: (presetId: LabelPresetId) => NoteDesign | undefined;
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

      clearAllDesigns: () => {
        set({ designs: [] });
      },

      getDesignById: (id) => {
        // First check user designs
        const userDesign = get().designs.find((d) => d.id === id);
        if (userDesign) {
          return userDesign;
        }

        // Check label preset designs (format: label-preset-{presetId})
        if (id.startsWith('label-preset-')) {
          const presetId = id.replace('label-preset-', '') as LabelPresetId;

          // Check cache first
          if (labelPresetDesignCache.has(id)) {
            return labelPresetDesignCache.get(id);
          }

          // Generate from preset
          const preset = getPresetById(presetId);
          if (preset) {
            const design = labelPresetToNoteDesign(preset);
            labelPresetDesignCache.set(id, design);
            return design;
          }
        }

        // Then check system default designs (old themes - for backward compat)
        const systemDesign = SYSTEM_DEFAULT_DESIGNS.find((d) => d.id === id);
        return systemDesign;
      },

      getLabelPresetDesign: (presetId) => {
        const id = `label-preset-${presetId}`;

        // Check cache first
        if (labelPresetDesignCache.has(id)) {
          return labelPresetDesignCache.get(id);
        }

        // Generate from preset
        const preset = getPresetById(presetId);
        if (preset) {
          const design = labelPresetToNoteDesign(preset);
          labelPresetDesignCache.set(id, design);
          return design;
        }

        return undefined;
      },
    }),
    {
      name: 'toonnotes-designs',
      storage: createJSONStorage(() => debouncedStorage),
    }
  )
);
