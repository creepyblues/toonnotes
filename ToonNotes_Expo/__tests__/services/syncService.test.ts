/**
 * Sync Service Unit Tests
 */

// Mock Supabase before imports
const mockSelect = jest.fn();
const mockUpsert = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();

jest.mock('@/services/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: mockSelect,
      upsert: mockUpsert,
      delete: mockDelete,
    })),
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
    })),
    removeChannel: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock note store
const mockNoteStoreState: { notes: any[]; updateNote: jest.Mock } = {
  notes: [],
  updateNote: jest.fn(),
};

jest.mock('@/stores/noteStore', () => ({
  useNoteStore: {
    getState: () => mockNoteStoreState,
  },
}));

// Import after mocks
import {
  syncNotes,
  uploadNote,
  deleteNoteFromCloud,
  fetchNotesFromCloud,
  subscribeToNotes,
  unsubscribeFromNotes,
} from '@/services/syncService';
import { Note } from '@/types';

describe('SyncService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNoteStoreState.notes = [];

    // Default mock chain setup
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      order: mockOrder,
    });
    mockOrder.mockResolvedValue({ data: [], error: null });
    mockUpsert.mockResolvedValue({ error: null });
    mockDelete.mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    });
  });

  describe('syncNotes', () => {
    const userId = 'user-123';

    it('should return empty result when no notes to sync', async () => {
      mockEq.mockResolvedValue({ data: [], error: null });

      const result = await syncNotes(userId);

      expect(result.uploaded).toBe(0);
      expect(result.downloaded).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should upload local notes not in cloud', async () => {
      const localNote: Note = {
        id: 'note-1',
        title: 'Test Note',
        content: 'Content',
        labels: [],
        color: '#FFFFFF',
        isPinned: false,
        isArchived: false,
        isDeleted: false,
        images: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockNoteStoreState.notes = [localNote];
      mockEq.mockResolvedValue({ data: [], error: null });

      const result = await syncNotes(userId);

      expect(mockUpsert).toHaveBeenCalled();
      expect(result.uploaded).toBe(1);
    });

    it('should download cloud notes not in local', async () => {
      const cloudNote = {
        id: 'cloud-note-1',
        user_id: userId,
        title: 'Cloud Note',
        content: 'Cloud Content',
        labels: [],
        color: '#FFFFFF',
        is_pinned: false,
        is_archived: false,
        is_deleted: false,
        images: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockNoteStoreState.notes = [];
      mockEq.mockResolvedValue({ data: [cloudNote], error: null });

      const result = await syncNotes(userId);

      expect(result.downloaded).toBe(1);
    });

    it('should handle fetch error', async () => {
      mockEq.mockResolvedValue({
        data: null,
        error: { message: 'Network error' },
      });

      const result = await syncNotes(userId);

      expect(result.errors).toContain('Fetch error: Network error');
    });

    it('should handle upload error', async () => {
      const localNote: Note = {
        id: 'note-1',
        title: 'Test',
        content: '',
        labels: [],
        color: '#FFFFFF',
        isPinned: false,
        isArchived: false,
        isDeleted: false,
        images: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockNoteStoreState.notes = [localNote];
      mockEq.mockResolvedValue({ data: [], error: null });
      mockUpsert.mockResolvedValue({ error: { message: 'Upload failed' } });

      const result = await syncNotes(userId);

      expect(result.errors).toContain('Upload error: Upload failed');
    });

    describe('conflict resolution', () => {
      // Use explicit fixed timestamps to avoid timing issues
      const baseTime = 1704067200000; // 2024-01-01 00:00:00 UTC

      const createLocalNote = (updatedAt: number): Note => ({
        id: 'shared-note',
        title: 'Local Version',
        content: 'Local content',
        labels: [],
        color: '#FFFFFF',
        isPinned: false,
        isArchived: false,
        isDeleted: false,
        images: [],
        createdAt: baseTime,
        updatedAt,
      });

      const createCloudNote = (updatedAt: number) => ({
        id: 'shared-note',
        user_id: 'user-123',
        title: 'Cloud Version',
        content: 'Cloud content',
        labels: [],
        color: '#FFFFFF',
        is_pinned: false,
        is_archived: false,
        is_deleted: false,
        images: [],
        created_at: new Date(baseTime).toISOString(),
        updated_at: new Date(updatedAt).toISOString(),
      });

      it('should use latest_wins by default - cloud newer', async () => {
        const localNote = createLocalNote(baseTime + 1000); // 1 second after base
        const cloudNote = createCloudNote(baseTime + 5000); // 5 seconds after base (NEWER)

        mockNoteStoreState.notes = [localNote];
        mockEq.mockResolvedValue({ data: [cloudNote], error: null });

        const result = await syncNotes(userId);

        // Cloud is newer, should download
        expect(result.downloaded).toBe(1);
        expect(result.uploaded).toBe(0);
      });

      it('should use latest_wins by default - local newer', async () => {
        const localNote = createLocalNote(baseTime + 5000); // 5 seconds after base (NEWER)
        const cloudNote = createCloudNote(baseTime + 1000); // 1 second after base

        mockNoteStoreState.notes = [localNote];
        mockEq.mockResolvedValue({ data: [cloudNote], error: null });

        const result = await syncNotes(userId);

        // Local is newer, should upload
        expect(result.uploaded).toBe(1);
        expect(result.downloaded).toBe(0);
      });

      it('should respect local_wins strategy', async () => {
        const localNote = createLocalNote(baseTime + 1000);
        const cloudNote = createCloudNote(baseTime + 5000); // Cloud newer but local wins

        mockNoteStoreState.notes = [localNote];
        mockEq.mockResolvedValue({ data: [cloudNote], error: null });

        const result = await syncNotes(userId, {
          conflictStrategy: 'local_wins',
        });

        expect(result.uploaded).toBe(1);
        expect(result.downloaded).toBe(0);
      });

      it('should respect cloud_wins strategy', async () => {
        const localNote = createLocalNote(baseTime + 5000); // Local newer but cloud wins
        const cloudNote = createCloudNote(baseTime + 1000);

        mockNoteStoreState.notes = [localNote];
        mockEq.mockResolvedValue({ data: [cloudNote], error: null });

        const result = await syncNotes(userId, {
          conflictStrategy: 'cloud_wins',
        });

        expect(result.downloaded).toBe(1);
        expect(result.uploaded).toBe(0);
      });
    });
  });

  describe('uploadNote', () => {
    const userId = 'user-123';
    const note: Note = {
      id: 'note-1',
      title: 'Test Note',
      content: 'Content',
      labels: ['label1'],
      color: '#FFFFFF',
      designId: 'design-1',
      isPinned: true,
      isArchived: false,
      isDeleted: false,
      images: ['img1.jpg'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    it('should upload note successfully', async () => {
      mockUpsert.mockResolvedValue({ error: null });

      const result = await uploadNote(note, userId);

      expect(result).toBe(true);
      expect(mockUpsert).toHaveBeenCalled();
    });

    it('should return false on error', async () => {
      mockUpsert.mockResolvedValue({ error: { message: 'Error' } });

      const result = await uploadNote(note, userId);

      expect(result).toBe(false);
    });

    it('should map local fields to cloud schema', async () => {
      mockUpsert.mockResolvedValue({ error: null });

      await uploadNote(note, userId);

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: note.id,
          user_id: userId,
          title: note.title,
          content: note.content,
          labels: note.labels,
          design_id: note.designId,
          is_pinned: note.isPinned,
          is_archived: note.isArchived,
          is_deleted: note.isDeleted,
        })
      );
    });
  });

  describe('deleteNoteFromCloud', () => {
    it('should delete note successfully', async () => {
      const mockEqFn = jest.fn().mockResolvedValue({ error: null });
      mockDelete.mockReturnValue({ eq: mockEqFn });

      const result = await deleteNoteFromCloud('note-123');

      expect(result).toBe(true);
      expect(mockEqFn).toHaveBeenCalledWith('id', 'note-123');
    });

    it('should return false on error', async () => {
      const mockEqFn = jest
        .fn()
        .mockResolvedValue({ error: { message: 'Delete failed' } });
      mockDelete.mockReturnValue({ eq: mockEqFn });

      const result = await deleteNoteFromCloud('note-123');

      expect(result).toBe(false);
    });
  });

  describe('fetchNotesFromCloud', () => {
    const userId = 'user-123';

    it('should fetch and map notes correctly', async () => {
      const cloudNotes = [
        {
          id: 'note-1',
          user_id: userId,
          title: 'Note 1',
          content: 'Content 1',
          labels: ['label'],
          color: '#FFFFFF',
          design_id: 'design-1',
          is_pinned: true,
          is_archived: false,
          is_deleted: false,
          images: [],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      mockOrder.mockResolvedValue({ data: cloudNotes, error: null });

      const result = await fetchNotesFromCloud(userId);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'note-1',
        title: 'Note 1',
        content: 'Content 1',
        designId: 'design-1',
        isPinned: true,
        isArchived: false,
        isDeleted: false,
      });
    });

    it('should return empty array on error', async () => {
      mockOrder.mockResolvedValue({
        data: null,
        error: { message: 'Fetch error' },
      });

      const result = await fetchNotesFromCloud(userId);

      expect(result).toEqual([]);
    });
  });

  describe('subscribeToNotes', () => {
    it('should setup realtime subscription', () => {
      // Get the mocked supabase
      const { supabase } = require('@/services/supabase');

      const onUpdate = jest.fn();
      const onDelete = jest.fn();

      const channel = subscribeToNotes('user-123', onUpdate, onDelete);

      expect(supabase.channel).toHaveBeenCalledWith('notes-changes');
      expect(channel).toBeDefined();
    });
  });

  describe('unsubscribeFromNotes', () => {
    it('should remove channel', async () => {
      const { supabase } = require('@/services/supabase');
      const mockChannelInstance = { id: 'channel-1' };

      await unsubscribeFromNotes(mockChannelInstance as any);

      expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannelInstance);
    });
  });
});
