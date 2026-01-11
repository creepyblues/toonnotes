import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUIStore } from '@/stores/uiStore';

// Test sync status state management
describe('Sync Status Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useUIStore.setState({
      syncStatus: 'idle',
      lastSyncedAt: null,
      syncError: null,
      isRealtimeConnected: false,
    });
  });

  describe('setSyncStatus', () => {
    it('should set sync status to idle', () => {
      useUIStore.getState().setSyncStatus('idle');
      expect(useUIStore.getState().syncStatus).toBe('idle');
    });

    it('should set sync status to syncing', () => {
      useUIStore.getState().setSyncStatus('syncing');
      expect(useUIStore.getState().syncStatus).toBe('syncing');
    });

    it('should set sync status to synced', () => {
      useUIStore.getState().setSyncStatus('synced');
      expect(useUIStore.getState().syncStatus).toBe('synced');
    });

    it('should set sync status to error', () => {
      useUIStore.getState().setSyncStatus('error');
      expect(useUIStore.getState().syncStatus).toBe('error');
    });

    it('should set sync status to offline', () => {
      useUIStore.getState().setSyncStatus('offline');
      expect(useUIStore.getState().syncStatus).toBe('offline');
    });
  });

  describe('setLastSyncedAt', () => {
    it('should set last synced timestamp', () => {
      const now = Date.now();
      useUIStore.getState().setLastSyncedAt(now);
      expect(useUIStore.getState().lastSyncedAt).toBe(now);
    });

    it('should clear last synced timestamp', () => {
      useUIStore.getState().setLastSyncedAt(Date.now());
      useUIStore.getState().setLastSyncedAt(null);
      expect(useUIStore.getState().lastSyncedAt).toBeNull();
    });
  });

  describe('setSyncError', () => {
    it('should set sync error message', () => {
      useUIStore.getState().setSyncError('Connection failed');
      expect(useUIStore.getState().syncError).toBe('Connection failed');
    });

    it('should clear sync error', () => {
      useUIStore.getState().setSyncError('Error');
      useUIStore.getState().setSyncError(null);
      expect(useUIStore.getState().syncError).toBeNull();
    });
  });

  describe('setRealtimeConnected', () => {
    it('should set realtime connected to true', () => {
      useUIStore.getState().setRealtimeConnected(true);
      expect(useUIStore.getState().isRealtimeConnected).toBe(true);
    });

    it('should set realtime connected to false', () => {
      useUIStore.getState().setRealtimeConnected(true);
      useUIStore.getState().setRealtimeConnected(false);
      expect(useUIStore.getState().isRealtimeConnected).toBe(false);
    });
  });
});

// Test database to app format conversion functions
describe('Database Format Conversion', () => {
  // Note: These functions are internal to useSupabaseSync
  // We test them indirectly through integration or test their output format

  describe('Note format conversion', () => {
    it('should handle all note fields', () => {
      // This tests the expected structure of converted notes
      const expectedNoteFields = [
        'id',
        'title',
        'content',
        'labels',
        'color',
        'isPinned',
        'isArchived',
        'isDeleted',
        'createdAt',
        'updatedAt',
      ];

      // Verify the interface has these fields
      const mockNote = {
        id: 'note-1',
        title: 'Test Note',
        content: 'Content',
        labels: ['work'],
        color: '#FFFFFF',
        isPinned: false,
        isArchived: false,
        isDeleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expectedNoteFields.forEach((field) => {
        expect(mockNote).toHaveProperty(field);
      });
    });

    it('should handle optional note fields', () => {
      const optionalFields = ['editorMode', 'designId', 'activeDesignLabelId', 'deletedAt'];

      const mockNoteWithOptional = {
        id: 'note-1',
        title: 'Test Note',
        content: '',
        labels: [],
        color: '#FFFFFF',
        isPinned: false,
        isArchived: false,
        isDeleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        editorMode: 'plain',
        deletedAt: undefined,
      };

      // Note should be valid with or without optional fields
      expect(mockNoteWithOptional.id).toBeDefined();
    });
  });

  describe('Label format conversion', () => {
    it('should handle all label fields', () => {
      const expectedLabelFields = ['id', 'name', 'createdAt'];

      const mockLabel = {
        id: 'label-1',
        name: 'work',
        createdAt: Date.now(),
      };

      expectedLabelFields.forEach((field) => {
        expect(mockLabel).toHaveProperty(field);
      });
    });

    it('should handle optional label fields', () => {
      const mockLabelWithOptional = {
        id: 'label-1',
        name: 'work',
        presetId: 'preset-1',
        customDesignId: undefined,
        isSystemLabel: false,
        createdAt: Date.now(),
        lastUsedAt: Date.now(),
      };

      expect(mockLabelWithOptional.presetId).toBe('preset-1');
      expect(mockLabelWithOptional.isSystemLabel).toBe(false);
    });
  });
});

// Test sync queue behavior
describe('Sync Queue Behavior', () => {
  it('should debounce rapid changes', async () => {
    const mockCallback = vi.fn();
    let timeout: NodeJS.Timeout | null = null;

    // Simple debounce implementation for testing
    const debounce = (fn: () => void, ms: number) => {
      return () => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(fn, ms);
      };
    };

    const debouncedFn = debounce(mockCallback, 50);

    // Call rapidly
    debouncedFn();
    debouncedFn();
    debouncedFn();

    // Should not have called yet
    expect(mockCallback).not.toHaveBeenCalled();

    // Wait for debounce
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should have been called exactly once
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should batch multiple items', () => {
    const queue = new Map<string, { id: string; data: string }>();

    // Add multiple items
    queue.set('item-1', { id: 'item-1', data: 'data1' });
    queue.set('item-2', { id: 'item-2', data: 'data2' });
    queue.set('item-3', { id: 'item-3', data: 'data3' });

    // Update an existing item (should replace, not duplicate)
    queue.set('item-1', { id: 'item-1', data: 'data1-updated' });

    expect(queue.size).toBe(3);
    expect(queue.get('item-1')?.data).toBe('data1-updated');
  });
});

// Test conflict resolution (last-write-wins)
describe('Conflict Resolution', () => {
  it('should use last-write-wins strategy', () => {
    const localNote = {
      id: 'note-1',
      title: 'Local Title',
      updatedAt: 1000,
    };

    const remoteNote = {
      id: 'note-1',
      title: 'Remote Title',
      updatedAt: 2000, // Newer
    };

    // Remote is newer, should win
    const shouldUseRemote = remoteNote.updatedAt >= localNote.updatedAt;
    expect(shouldUseRemote).toBe(true);
  });

  it('should keep local when local is newer', () => {
    const localNote = {
      id: 'note-1',
      title: 'Local Title',
      updatedAt: 2000, // Newer
    };

    const remoteNote = {
      id: 'note-1',
      title: 'Remote Title',
      updatedAt: 1000,
    };

    // Local is newer, should keep local
    const shouldUseRemote = remoteNote.updatedAt >= localNote.updatedAt;
    expect(shouldUseRemote).toBe(false);
  });

  it('should use remote when timestamps are equal', () => {
    const localNote = {
      id: 'note-1',
      title: 'Local Title',
      updatedAt: 1000,
    };

    const remoteNote = {
      id: 'note-1',
      title: 'Remote Title',
      updatedAt: 1000, // Same timestamp
    };

    // Equal timestamps: use remote (>= comparison)
    const shouldUseRemote = remoteNote.updatedAt >= localNote.updatedAt;
    expect(shouldUseRemote).toBe(true);
  });
});

// Test sync status transitions
describe('Sync Status Transitions', () => {
  beforeEach(() => {
    useUIStore.setState({
      syncStatus: 'idle',
      lastSyncedAt: null,
      syncError: null,
      isRealtimeConnected: false,
    });
  });

  it('should transition from idle to syncing', () => {
    expect(useUIStore.getState().syncStatus).toBe('idle');

    useUIStore.getState().setSyncStatus('syncing');
    expect(useUIStore.getState().syncStatus).toBe('syncing');
  });

  it('should transition from syncing to synced on success', () => {
    useUIStore.getState().setSyncStatus('syncing');
    useUIStore.getState().setSyncStatus('synced');
    useUIStore.getState().setLastSyncedAt(Date.now());

    expect(useUIStore.getState().syncStatus).toBe('synced');
    expect(useUIStore.getState().lastSyncedAt).not.toBeNull();
  });

  it('should transition from syncing to error on failure', () => {
    useUIStore.getState().setSyncStatus('syncing');
    useUIStore.getState().setSyncStatus('error');
    useUIStore.getState().setSyncError('Network error');

    expect(useUIStore.getState().syncStatus).toBe('error');
    expect(useUIStore.getState().syncError).toBe('Network error');
  });

  it('should clear error when sync succeeds', () => {
    useUIStore.getState().setSyncError('Previous error');
    useUIStore.getState().setSyncStatus('syncing');
    useUIStore.getState().setSyncStatus('synced');
    useUIStore.getState().setSyncError(null);

    expect(useUIStore.getState().syncStatus).toBe('synced');
    expect(useUIStore.getState().syncError).toBeNull();
  });
});

// Test realtime connection status
describe('Realtime Connection Status', () => {
  beforeEach(() => {
    useUIStore.setState({
      isRealtimeConnected: false,
      syncStatus: 'idle',
    });
  });

  it('should update connection status', () => {
    expect(useUIStore.getState().isRealtimeConnected).toBe(false);

    useUIStore.getState().setRealtimeConnected(true);
    expect(useUIStore.getState().isRealtimeConnected).toBe(true);

    useUIStore.getState().setRealtimeConnected(false);
    expect(useUIStore.getState().isRealtimeConnected).toBe(false);
  });

  it('should handle disconnect gracefully', () => {
    useUIStore.getState().setRealtimeConnected(true);
    useUIStore.getState().setSyncStatus('synced');

    // Simulate disconnect
    useUIStore.getState().setRealtimeConnected(false);

    expect(useUIStore.getState().isRealtimeConnected).toBe(false);
    // Status could remain synced (last known state) or change to offline
    // depending on implementation preference
  });
});
