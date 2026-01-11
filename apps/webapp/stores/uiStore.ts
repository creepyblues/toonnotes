'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type ViewMode = 'grid' | 'list';

// Sync status types
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // View mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Dark mode
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;

  // Command palette
  commandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;

  // Selected note (for preview panel)
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;

  // Active section for navigation highlighting
  activeSection: 'notes' | 'boards' | 'designs' | 'archive' | 'trash' | 'settings';
  setActiveSection: (section: UIState['activeSection']) => void;

  // Keyboard shortcuts modal
  shortcutsModalOpen: boolean;
  setShortcutsModalOpen: (open: boolean) => void;
  toggleShortcutsModal: () => void;

  // Sync status
  syncStatus: SyncStatus;
  setSyncStatus: (status: SyncStatus) => void;
  lastSyncedAt: number | null;
  setLastSyncedAt: (timestamp: number | null) => void;
  syncError: string | null;
  setSyncError: (error: string | null) => void;
  isRealtimeConnected: boolean;
  setRealtimeConnected: (connected: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar - default expanded
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // View mode - default grid
      viewMode: 'grid',
      setViewMode: (mode) => set({ viewMode: mode }),

      // Dark mode - default false (light mode)
      darkMode: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setDarkMode: (enabled) => set({ darkMode: enabled }),

      // Command palette - default closed
      commandPaletteOpen: false,
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),
      toggleCommandPalette: () =>
        set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

      // Search
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      clearSearch: () => set({ searchQuery: '' }),

      // Selected note
      selectedNoteId: null,
      setSelectedNoteId: (id) => set({ selectedNoteId: id }),

      // Active section
      activeSection: 'notes',
      setActiveSection: (section) => set({ activeSection: section }),

      // Keyboard shortcuts modal
      shortcutsModalOpen: false,
      setShortcutsModalOpen: (open) => set({ shortcutsModalOpen: open }),
      toggleShortcutsModal: () => set((state) => ({ shortcutsModalOpen: !state.shortcutsModalOpen })),

      // Sync status
      syncStatus: 'idle',
      setSyncStatus: (status) => set({ syncStatus: status }),
      lastSyncedAt: null,
      setLastSyncedAt: (timestamp) => set({ lastSyncedAt: timestamp }),
      syncError: null,
      setSyncError: (error) => set({ syncError: error }),
      isRealtimeConnected: false,
      setRealtimeConnected: (connected) => set({ isRealtimeConnected: connected }),
    }),
    {
      name: 'toonnotes-ui',
      storage: createJSONStorage(() => localStorage),
      // Only persist certain fields
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        viewMode: state.viewMode,
        darkMode: state.darkMode,
      }),
    }
  )
);
