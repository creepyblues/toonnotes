/**
 * Label Store
 *
 * Zustand store for managing label entities with cloud sync support.
 * Labels are synced to Supabase for Pro users.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Label } from '@/types';
import { debouncedStorage } from './debouncedStorage';
import { generateUUID } from '@/utils/uuid';

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
const syncToCloud = (label: Label) => {
  const userId = getAuthUserId();
  if (userId && isPro()) {
    const { uploadLabel } = require('@/services/syncService');
    uploadLabel(label, userId).catch((error: Error) => {
      console.error('[LabelStore] Cloud sync failed:', error);
    });
  }
};

const deleteFromCloud = (labelId: string) => {
  const userId = getAuthUserId();
  if (userId && isPro()) {
    const { deleteLabelFromCloud } = require('@/services/syncService');
    deleteLabelFromCloud(labelId).catch((error: Error) => {
      console.error('[LabelStore] Cloud delete failed:', error);
    });
  }
};

interface LabelState {
  labels: Label[];

  // Actions
  addLabel: (label: Label) => void;
  addLabelByName: (name: string, presetId?: string) => Label;
  updateLabel: (id: string, updates: Partial<Label>) => void;
  deleteLabel: (id: string) => void;
  touchLabel: (id: string) => void; // Update lastUsedAt
  clearAllLabels: () => void;

  // Queries
  getLabelById: (id: string) => Label | undefined;
  getLabelByName: (name: string) => Label | undefined;
  getOrCreateLabel: (name: string, presetId?: string) => Label;
}

export const useLabelStore = create<LabelState>()(
  persist(
    (set, get) => ({
      labels: [],

      addLabel: (label) => {
        set((state) => ({
          labels: [label, ...state.labels],
        }));
        syncToCloud(label);
      },

      addLabelByName: (name, presetId) => {
        const existing = get().getLabelByName(name);
        if (existing) {
          return existing;
        }

        const now = Date.now();
        const newLabel: Label = {
          id: generateUUID(),
          name: name.toLowerCase().trim(),
          presetId,
          createdAt: now,
          lastUsedAt: now,
        };

        set((state) => ({
          labels: [newLabel, ...state.labels],
        }));
        syncToCloud(newLabel);
        return newLabel;
      },

      updateLabel: (id, updates) => {
        let updatedLabel: Label | undefined;
        set((state) => ({
          labels: state.labels.map((l) => {
            if (l.id === id) {
              updatedLabel = { ...l, ...updates };
              return updatedLabel;
            }
            return l;
          }),
        }));
        if (updatedLabel) {
          syncToCloud(updatedLabel);
        }
      },

      deleteLabel: (id) => {
        set((state) => ({
          labels: state.labels.filter((l) => l.id !== id),
        }));
        deleteFromCloud(id);
      },

      touchLabel: (id) => {
        const now = Date.now();
        let updatedLabel: Label | undefined;
        set((state) => ({
          labels: state.labels.map((l) => {
            if (l.id === id) {
              updatedLabel = { ...l, lastUsedAt: now };
              return updatedLabel;
            }
            return l;
          }),
        }));
        if (updatedLabel) {
          syncToCloud(updatedLabel);
        }
      },

      clearAllLabels: () => {
        set({ labels: [] });
      },

      getLabelById: (id) => {
        return get().labels.find((l) => l.id === id);
      },

      getLabelByName: (name) => {
        const normalizedName = name.toLowerCase().trim();
        return get().labels.find(
          (l) => l.name.toLowerCase() === normalizedName
        );
      },

      getOrCreateLabel: (name, presetId) => {
        const existing = get().getLabelByName(name);
        if (existing) {
          // Touch the label to update lastUsedAt
          get().touchLabel(existing.id);
          return existing;
        }
        return get().addLabelByName(name, presetId);
      },
    }),
    {
      name: 'toonnotes-labels',
      storage: createJSONStorage(() => debouncedStorage),
    }
  )
);
