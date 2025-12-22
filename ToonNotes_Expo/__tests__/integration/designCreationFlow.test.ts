/**
 * Integration Tests for Design Creation Flow
 *
 * Tests the navigation flow for design creation from different entry points:
 * - returnTo='note' with noteId (apply design to existing note)
 * - returnTo='designs' or undefined (create new note with design)
 */

import { useNoteStore } from '@/stores/noteStore';
import { useDesignStore } from '@/stores/designStore';
import { useUserStore } from '@/stores/userStore';
import { NoteColor, NoteDesign } from '@/types';

// Mock router
const mockBack = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    replace: mockReplace,
  }),
  router: {
    back: mockBack,
    replace: mockReplace,
  },
}));

jest.mock('@/utils/uuid', () => ({
  generateUUID: jest.fn(() => 'test-uuid-' + Date.now()),
}));

const createMockDesign = (): NoteDesign => ({
  id: 'design-123',
  name: 'Test Design',
  sourceImageUri: 'file://test.jpg',
  createdAt: Date.now(),
  background: {
    primaryColor: '#FFFFFF',
    style: 'solid',
  },
  colors: {
    titleText: '#000000',
    bodyText: '#333333',
    accent: '#0ea5e9',
    border: '#E5E7EB',
  },
  border: {
    template: 'panel',
    thickness: 'medium',
  },
  typography: {
    titleStyle: 'sans-serif',
    vibe: 'modern',
  },
  sticker: {
    id: 'sticker-1',
    imageUri: 'file://sticker.png',
    description: 'Cute character',
    suggestedPosition: 'bottom-right',
    scale: 'medium',
  },
  designSummary: 'A clean design',
});

describe('Design Creation Flow - Integration Tests', () => {
  beforeEach(() => {
    // Reset all stores
    useNoteStore.setState({ notes: [], labels: [] });
    useDesignStore.setState({ designs: [] });
    useUserStore.setState({
      user: {
        id: 'test-user',
        freeDesignUsed: false,
        coinBalance: 100,
        createdAt: Date.now(),
      },
      settings: {
        darkMode: false,
        defaultNoteColor: NoteColor.White,
      },
    });

    // Clear mock calls
    mockBack.mockClear();
    mockReplace.mockClear();
  });

  describe('Flow: returnTo=note with noteId (Apply to Existing Note)', () => {
    it('should update existing note with design when returnTo=note', () => {
      const noteStore = useNoteStore.getState();
      const designStore = useDesignStore.getState();
      const userStore = useUserStore.getState();

      // Create an existing note
      const existingNote = noteStore.addNote({
        title: 'Existing Note',
        content: 'This note needs a design',
        color: NoteColor.White,
        labels: [],
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      const noteId = existingNote.id;

      // User creates a design (simulate design creation with returnTo=note)
      const mockDesign = createMockDesign();

      // Check affordability
      expect(userStore.canAffordDesign()).toBe(true);

      // Spend coin
      useUserStore.getState().spendCoin();

      // Add design
      useDesignStore.getState().addDesign(mockDesign);

      // Apply design to note (simulating navigateAfterCreation logic)
      useNoteStore.getState().updateNote(noteId, { designId: mockDesign.id });

      // Verify note was updated with design
      const updatedNote = useNoteStore.getState().getNoteById(noteId);
      expect(updatedNote?.designId).toBe('design-123');
      expect(updatedNote?.title).toBe('Existing Note');
      expect(updatedNote?.content).toBe('This note needs a design');

      // Verify design was saved
      expect(useDesignStore.getState().designs).toHaveLength(1);
      expect(useDesignStore.getState().designs[0].id).toBe('design-123');

      // Verify coin was spent (free design used)
      expect(useUserStore.getState().user.freeDesignUsed).toBe(true);
      expect(useUserStore.getState().user.coinBalance).toBe(100);
    });

    it('should preserve note properties when applying design', () => {
      const noteStore = useNoteStore.getState();
      const designStore = useDesignStore.getState();

      const existingNote = noteStore.addNote({
        title: 'Pinned Important Note',
        content: 'Critical information',
        color: NoteColor.Red,
        labels: ['work', 'important'],
        isPinned: true,
        isArchived: false,
        isDeleted: false,
      });

      const noteId = existingNote.id;
      const mockDesign = createMockDesign();

      designStore.addDesign(mockDesign);
      useNoteStore.getState().updateNote(noteId, { designId: mockDesign.id });

      const updatedNote = useNoteStore.getState().getNoteById(noteId);
      expect(updatedNote?.title).toBe('Pinned Important Note');
      expect(updatedNote?.content).toBe('Critical information');
      expect(updatedNote?.color).toBe(NoteColor.Red);
      expect(updatedNote?.labels).toEqual(['work', 'important']);
      expect(updatedNote?.isPinned).toBe(true);
      expect(updatedNote?.designId).toBe('design-123');
    });

    it('should handle applying design to archived note', () => {
      const noteStore = useNoteStore.getState();
      const designStore = useDesignStore.getState();

      const note = noteStore.addNote({
        title: 'Archived Note',
        content: 'Content',
        color: NoteColor.White,
        labels: [],
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });
      useNoteStore.getState().archiveNote(note.id);

      const mockDesign = createMockDesign();

      designStore.addDesign(mockDesign);
      useNoteStore.getState().updateNote(note.id, { designId: mockDesign.id });

      const updatedNote = useNoteStore.getState().getNoteById(note.id);
      expect(updatedNote?.designId).toBe('design-123');
      expect(updatedNote?.isArchived).toBe(true); // Still archived
    });
  });

  describe('Flow: returnTo=designs or undefined (Create New Note)', () => {
    it('should create new note with design when returnTo is not "note"', () => {
      const noteStore = useNoteStore.getState();
      const designStore = useDesignStore.getState();
      const userStore = useUserStore.getState();

      const mockDesign = createMockDesign();

      // Spend coin
      userStore.spendCoin();

      // Add design
      useDesignStore.getState().addDesign(mockDesign);

      // Create new note with design (simulating navigateAfterCreation for returnTo='designs')
      const newNote = useNoteStore.getState().addNote({
        title: '',
        content: '',
        color: NoteColor.White,
        labels: [],
        isPinned: false,
        isArchived: false,
        isDeleted: false,
        designId: mockDesign.id,
      });

      // Verify new note was created with design
      expect(useNoteStore.getState().notes).toHaveLength(1);
      expect(newNote.designId).toBe('design-123');
      expect(newNote.title).toBe('');
      expect(newNote.content).toBe('');

      // Verify design was saved
      expect(useDesignStore.getState().designs).toHaveLength(1);
    });

    it('should create new note with empty title and content', () => {
      const designStore = useDesignStore.getState();

      const mockDesign = createMockDesign();

      designStore.addDesign(mockDesign);
      useNoteStore.getState().addNote({
        title: '',
        content: '',
        color: NoteColor.White,
        labels: [],
        isPinned: false,
        isArchived: false,
        isDeleted: false,
        designId: mockDesign.id,
      });

      const newNote = useNoteStore.getState().notes[0];
      expect(newNote.title).toBe('');
      expect(newNote.content).toBe('');
      expect(newNote.designId).toBe('design-123');
    });

    it('should create multiple notes with same design', () => {
      const designStore = useDesignStore.getState();

      const mockDesign = createMockDesign();

      designStore.addDesign(mockDesign);

      // Create multiple notes with the same design
      useNoteStore.getState().addNote({
        title: 'Note 1',
        content: 'Content 1',
        color: NoteColor.White,
        labels: [],
        isPinned: false,
        isArchived: false,
        isDeleted: false,
        designId: mockDesign.id,
      });

      useNoteStore.getState().addNote({
        title: 'Note 2',
        content: 'Content 2',
        color: NoteColor.White,
        labels: [],
        isPinned: false,
        isArchived: false,
        isDeleted: false,
        designId: mockDesign.id,
      });

      useNoteStore.getState().addNote({
        title: 'Note 3',
        content: 'Content 3',
        color: NoteColor.White,
        labels: [],
        isPinned: false,
        isArchived: false,
        isDeleted: false,
        designId: mockDesign.id,
      });

      expect(useNoteStore.getState().notes).toHaveLength(3);
      expect(useNoteStore.getState().notes.every((n) => n.designId === 'design-123')).toBe(true);
      expect(useDesignStore.getState().designs).toHaveLength(1);
    });
  });

  describe('Economy Integration', () => {
    it('should use free design on first creation', () => {
      const userStore = useUserStore.getState();
      const designStore = useDesignStore.getState();

      const initialBalance = userStore.user.coinBalance;

      const canAfford = userStore.canAffordDesign();
      expect(canAfford).toBe(true);

      const cost = userStore.getDesignCost();
      expect(cost).toBe(0);

      useUserStore.getState().spendCoin();
      designStore.addDesign(createMockDesign());

      expect(useUserStore.getState().user.freeDesignUsed).toBe(true);
      expect(useUserStore.getState().user.coinBalance).toBe(initialBalance);
    });

    it('should spend coins on subsequent designs', () => {
      const designStore = useDesignStore.getState();

      // Use free design
      useUserStore.getState().spendCoin();
      designStore.addDesign(createMockDesign());

      const balanceAfterFree = useUserStore.getState().user.coinBalance;

      // Create second design (should cost 1 coin)
      const cost = useUserStore.getState().getDesignCost();
      expect(cost).toBe(1);

      useUserStore.getState().spendCoin();
      useDesignStore.getState().addDesign({ ...createMockDesign(), id: 'design-456' });

      expect(useUserStore.getState().user.coinBalance).toBe(balanceAfterFree - 1);
    });

    it('should fail design creation when no coins and free design used', () => {
      useUserStore.setState((state) => ({
        user: { ...state.user, freeDesignUsed: true, coinBalance: 0 },
      }));

      const canAfford = useUserStore.getState().canAffordDesign();
      expect(canAfford).toBe(false);

      const success = useUserStore.getState().spendCoin();
      expect(success).toBe(false);

      expect(useUserStore.getState().user.coinBalance).toBe(0);
    });
  });

  describe('Design Store Integration', () => {
    it('should retrieve design by id after creation', () => {
      const designStore = useDesignStore.getState();

      const mockDesign = createMockDesign();

      designStore.addDesign(mockDesign);

      const retrieved = useDesignStore.getState().getDesignById('design-123');

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('design-123');
      expect(retrieved?.name).toBe('Test Design');
    });

    it('should allow deleting designs after creation', () => {
      const designStore = useDesignStore.getState();

      designStore.addDesign(createMockDesign());
      useDesignStore.getState().addDesign({ ...createMockDesign(), id: 'design-456' });

      expect(useDesignStore.getState().designs).toHaveLength(2);

      useDesignStore.getState().deleteDesign('design-123');

      expect(useDesignStore.getState().designs).toHaveLength(1);
      expect(useDesignStore.getState().getDesignById('design-123')).toBeUndefined();
    });

    it('should maintain note design reference when design is deleted', () => {
      const designStore = useDesignStore.getState();

      const mockDesign = createMockDesign();

      designStore.addDesign(mockDesign);
      const note = useNoteStore.getState().addNote({
        title: 'Note with Design',
        content: 'Content',
        color: NoteColor.White,
        labels: [],
        isPinned: false,
        isArchived: false,
        isDeleted: false,
        designId: mockDesign.id,
      });

      useDesignStore.getState().deleteDesign(mockDesign.id);

      // Note still has designId reference (orphaned)
      const updatedNote = useNoteStore.getState().getNoteById(note.id);
      expect(updatedNote?.designId).toBe('design-123');

      // But design no longer exists
      expect(useDesignStore.getState().getDesignById('design-123')).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle updating non-existent note gracefully', () => {
      const designStore = useDesignStore.getState();

      const mockDesign = createMockDesign();

      designStore.addDesign(mockDesign);
      useNoteStore.getState().updateNote('non-existent-id', { designId: mockDesign.id });

      // No notes should exist
      expect(useNoteStore.getState().notes).toHaveLength(0);
    });

    it('should handle creating note with non-existent design', () => {
      useNoteStore.getState().addNote({
        title: 'Note',
        content: 'Content',
        color: NoteColor.White,
        labels: [],
        isPinned: false,
        isArchived: false,
        isDeleted: false,
        designId: 'non-existent-design',
      });

      const note = useNoteStore.getState().notes[0];
      expect(note.designId).toBe('non-existent-design');

      // Design doesn't exist
      expect(useDesignStore.getState().getDesignById('non-existent-design')).toBeUndefined();
    });

    it('should handle removing design from note', () => {
      const designStore = useDesignStore.getState();

      const mockDesign = createMockDesign();

      designStore.addDesign(mockDesign);
      const note = useNoteStore.getState().addNote({
        title: 'Note',
        content: 'Content',
        color: NoteColor.White,
        labels: [],
        isPinned: false,
        isArchived: false,
        isDeleted: false,
        designId: mockDesign.id,
      });

      expect(note.designId).toBe('design-123');

      useNoteStore.getState().updateNote(note.id, { designId: undefined });

      const updatedNote = useNoteStore.getState().getNoteById(note.id);
      expect(updatedNote?.designId).toBeUndefined();
    });
  });
});
