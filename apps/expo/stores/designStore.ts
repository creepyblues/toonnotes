import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { NoteDesign } from '@/types';
import { debouncedStorage } from './debouncedStorage';
import { SYSTEM_DEFAULT_DESIGNS } from '@/constants/themes';
import { getPresetById, LabelPresetId } from '@/constants/labelPresets';
import { labelPresetToNoteDesign } from '@/services/designEngine';

// Cache for label preset designs (no need to persist - computed from constants)
const labelPresetDesignCache: Map<string, NoteDesign> = new Map();

// Lazy getters to avoid circular dependency
const getAuthUserId = () => {
  const { useAuthStore } = require('./authStore');
  return useAuthStore.getState().user?.id;
};

const isPro = () => {
  const { useUserStore } = require('./userStore');
  return useUserStore.getState().isPro();
};

// Lazy import for sync function
const syncToCloud = (design: NoteDesign) => {
  const userId = getAuthUserId();
  if (userId && isPro()) {
    const { uploadDesign } = require('@/services/syncService');
    uploadDesign(design, userId).catch((error: Error) => {
      console.error('[DesignStore] Cloud sync failed:', error);
    });
  }
};

const deleteFromCloud = (designId: string) => {
  const userId = getAuthUserId();
  if (userId && isPro()) {
    const { deleteDesignFromCloud } = require('@/services/syncService');
    deleteDesignFromCloud(designId).catch((error: Error) => {
      console.error('[DesignStore] Cloud delete failed:', error);
    });
  }
};

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
        syncToCloud(design);
      },

      deleteDesign: (id) => {
        set((state) => ({
          designs: state.designs.filter((d) => d.id !== id),
        }));
        deleteFromCloud(id);
      },

      updateDesign: (id, updates) => {
        let updatedDesign: NoteDesign | undefined;
        set((state) => ({
          designs: state.designs.map((d) => {
            if (d.id === id) {
              updatedDesign = { ...d, ...updates };
              return updatedDesign;
            }
            return d;
          }),
        }));
        if (updatedDesign) {
          syncToCloud(updatedDesign);
        }
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
