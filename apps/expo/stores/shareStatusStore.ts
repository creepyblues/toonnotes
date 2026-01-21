/**
 * Share Status Store
 *
 * Zustand store for caching share status of notes.
 * Used to display "Public" badges on notes that have been shared.
 *
 * This store does NOT persist - data is fetched from the server on mount.
 */

import { create } from 'zustand';
import { getShareStatusBatch, ShareStatus } from '@/services/shareService';

// Lazy getter to avoid circular dependency
const getAuthUserId = () => {
  const { useAuthStore } = require('./authStore');
  return useAuthStore.getState().user?.id;
};

interface ShareStatusState {
  // Cache of share status by note ID
  statusCache: Map<string, ShareStatus>;

  // Loading state
  isLoading: boolean;

  // Last fetched note IDs (to avoid redundant fetches)
  lastFetchedIds: Set<string>;

  // Actions
  fetchShareStatusForNotes: (noteIds: string[]) => Promise<void>;
  getShareStatus: (noteId: string) => ShareStatus | undefined;
  invalidateStatus: (noteId: string) => void;
  clearCache: () => void;
}

export const useShareStatusStore = create<ShareStatusState>()((set, get) => ({
  statusCache: new Map(),
  isLoading: false,
  lastFetchedIds: new Set(),

  /**
   * Fetch share status for a batch of notes
   * Only fetches for authenticated users
   * Skips IDs that were already fetched
   */
  fetchShareStatusForNotes: async (noteIds: string[]) => {
    const userId = getAuthUserId();
    if (!userId) {
      // Not authenticated, no shared notes possible
      return;
    }

    if (noteIds.length === 0) {
      return;
    }

    // Filter out already fetched IDs
    const { lastFetchedIds } = get();
    const newIds = noteIds.filter((id) => !lastFetchedIds.has(id));

    if (newIds.length === 0) {
      // All IDs already fetched
      return;
    }

    set({ isLoading: true });

    try {
      const statusMap = await getShareStatusBatch(newIds);

      set((state) => {
        // Merge new statuses into cache
        const newCache = new Map(state.statusCache);
        statusMap.forEach((status, noteId) => {
          newCache.set(noteId, status);
        });

        // Track fetched IDs
        const newFetchedIds = new Set(state.lastFetchedIds);
        newIds.forEach((id) => newFetchedIds.add(id));

        return {
          statusCache: newCache,
          lastFetchedIds: newFetchedIds,
          isLoading: false,
        };
      });
    } catch (error) {
      console.error('[ShareStatusStore] Failed to fetch share status:', error);
      set({ isLoading: false });
    }
  },

  /**
   * Get share status for a single note (O(1) lookup)
   */
  getShareStatus: (noteId: string) => {
    return get().statusCache.get(noteId);
  },

  /**
   * Invalidate cached status for a note
   * Call this when share is created or revoked
   */
  invalidateStatus: (noteId: string) => {
    set((state) => {
      const newCache = new Map(state.statusCache);
      newCache.delete(noteId);

      const newFetchedIds = new Set(state.lastFetchedIds);
      newFetchedIds.delete(noteId);

      return {
        statusCache: newCache,
        lastFetchedIds: newFetchedIds,
      };
    });
  },

  /**
   * Clear all cached data
   * Call on sign out
   */
  clearCache: () => {
    set({
      statusCache: new Map(),
      lastFetchedIds: new Set(),
    });
  },
}));
