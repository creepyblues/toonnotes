/**
 * Unit Tests for noteStore
 *
 * Tests note CRUD operations, archiving, deletion, pinning, labels,
 * and query functions using Zustand's direct state access.
 */

import { useNoteStore } from '@/stores/noteStore';
import { NoteColor } from '@/types';

// Mock generateUUID to return predictable IDs
let mockUuidCounter = 0;
jest.mock('@/utils/uuid', () => ({
  generateUUID: jest.fn(() => `test-uuid-${++mockUuidCounter}`),
}));

describe('noteStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useNoteStore.setState({ notes: [], labels: [] });
    mockUuidCounter = 0;
  });

  describe('Note CRUD Operations', () => {
    it('should add a new note with default values', () => {
      const store = useNoteStore.getState();

      store.addNote({
        title: 'Test Note',
        content: 'Test content',
        color: NoteColor.White,
        labels: [],
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      const notes = useNoteStore.getState().notes;
      expect(notes).toHaveLength(1);

      const note = notes[0];
      expect(note.title).toBe('Test Note');
      expect(note.content).toBe('Test content');
      expect(note.id).toBeDefined();
      expect(note.createdAt).toBeDefined();
      expect(note.updatedAt).toBeDefined();
      expect(note.isArchived).toBe(false);
      expect(note.isDeleted).toBe(false);
    });

    it('should update an existing note', () => {
      const store = useNoteStore.getState();

      const newNote = store.addNote({
        title: 'Original Title',
        content: 'Original content',
        color: NoteColor.White,
        labels: [],
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      store.updateNote(newNote.id, { title: 'Updated Title' });

      const updatedNote = useNoteStore.getState().getNoteById(newNote.id);
      expect(updatedNote?.title).toBe('Updated Title');
      expect(updatedNote?.content).toBe('Original content');
    });

    it('should soft delete a note', () => {
      const store = useNoteStore.getState();

      const newNote = store.addNote({
        title: 'To Delete',
        content: '',
        color: NoteColor.White,
        labels: [],
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      store.deleteNote(newNote.id);

      const deletedNote = useNoteStore.getState().getNoteById(newNote.id);
      expect(deletedNote?.isDeleted).toBe(true);
    });

    it('should permanently delete a note', () => {
      const store = useNoteStore.getState();

      const newNote = store.addNote({
        title: 'To Permanently Delete',
        content: '',
        color: NoteColor.White,
        labels: [],
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      store.permanentlyDeleteNote(newNote.id);

      const notes = useNoteStore.getState().notes;
      expect(notes).toHaveLength(0);
    });
  });

  describe('Archive Operations', () => {
    it('should archive a note', () => {
      const store = useNoteStore.getState();

      const newNote = store.addNote({
        title: 'To Archive',
        content: '',
        color: NoteColor.White,
        labels: [],
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      store.archiveNote(newNote.id);

      const archivedNote = useNoteStore.getState().getNoteById(newNote.id);
      expect(archivedNote?.isArchived).toBe(true);
    });

    it('should unarchive a note', () => {
      const store = useNoteStore.getState();

      const newNote = store.addNote({
        title: 'To Unarchive',
        content: '',
        color: NoteColor.White,
        labels: [],
        isPinned: false,
        isArchived: true,
        isDeleted: false,
      });

      store.unarchiveNote(newNote.id);

      const unarchivedNote = useNoteStore.getState().getNoteById(newNote.id);
      expect(unarchivedNote?.isArchived).toBe(false);
    });
  });

  describe('Pin Operations', () => {
    it('should pin a note', () => {
      const store = useNoteStore.getState();

      const newNote = store.addNote({
        title: 'To Pin',
        content: '',
        color: NoteColor.White,
        labels: [],
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      store.pinNote(newNote.id);

      const pinnedNote = useNoteStore.getState().getNoteById(newNote.id);
      expect(pinnedNote?.isPinned).toBe(true);
    });

    it('should unpin a note', () => {
      const store = useNoteStore.getState();

      const newNote = store.addNote({
        title: 'To Unpin',
        content: '',
        color: NoteColor.White,
        labels: [],
        isPinned: true,
        isArchived: false,
        isDeleted: false,
      });

      store.unpinNote(newNote.id);

      const unpinnedNote = useNoteStore.getState().getNoteById(newNote.id);
      expect(unpinnedNote?.isPinned).toBe(false);
    });
  });

  describe('Label Operations', () => {
    it('should add a label', () => {
      const store = useNoteStore.getState();

      store.addLabel('TestLabel');

      const labels = useNoteStore.getState().labels;
      expect(labels).toHaveLength(1);
      // Labels are stored as lowercase
      expect(labels[0].name).toBe('testlabel');
    });

    it('should not add duplicate labels (case insensitive)', () => {
      const store = useNoteStore.getState();

      store.addLabel('TestLabel');
      store.addLabel('testlabel');
      store.addLabel('TESTLABEL');

      const labels = useNoteStore.getState().labels;
      expect(labels).toHaveLength(1);
    });

    it('should delete a label', () => {
      const store = useNoteStore.getState();

      store.addLabel('ToDelete');
      const labels = useNoteStore.getState().labels;
      const labelId = labels[0].id;

      store.deleteLabel(labelId);

      expect(useNoteStore.getState().labels).toHaveLength(0);
    });
  });

  describe('Query Functions', () => {
    beforeEach(() => {
      const store = useNoteStore.getState();

      // Add test notes
      store.addNote({
        title: 'Active Note 1',
        content: 'Content 1',
        color: NoteColor.White,
        labels: ['label1'],
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      store.addNote({
        title: 'Active Note 2',
        content: 'Content 2',
        color: NoteColor.Blue,
        labels: [],
        isPinned: true,
        isArchived: false,
        isDeleted: false,
      });

      // Note: addNote always creates with isArchived: false and isDeleted: false
      // We need to use archiveNote and deleteNote to set these flags
      const archivedNote = useNoteStore.getState().addNote({
        title: 'Archived Note',
        content: 'Archived content',
        color: NoteColor.Yellow,
        labels: [],
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });
      useNoteStore.getState().archiveNote(archivedNote.id);

      const deletedNote = useNoteStore.getState().addNote({
        title: 'Deleted Note',
        content: 'Deleted content',
        color: NoteColor.Red,
        labels: [],
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });
      useNoteStore.getState().deleteNote(deletedNote.id);
    });

    it('should get active notes (not archived, not deleted)', () => {
      const activeNotes = useNoteStore.getState().getActiveNotes();
      expect(activeNotes).toHaveLength(2);
      expect(activeNotes.every(n => !n.isArchived && !n.isDeleted)).toBe(true);
    });

    it('should get archived notes', () => {
      const archivedNotes = useNoteStore.getState().getArchivedNotes();
      expect(archivedNotes).toHaveLength(1);
      expect(archivedNotes[0].title).toBe('Archived Note');
    });

    it('should get deleted notes', () => {
      const deletedNotes = useNoteStore.getState().getDeletedNotes();
      expect(deletedNotes).toHaveLength(1);
      expect(deletedNotes[0].title).toBe('Deleted Note');
    });

    it('should search notes by title', () => {
      const results = useNoteStore.getState().searchNotes('Active');
      expect(results).toHaveLength(2);
    });

    it('should search notes by content', () => {
      const results = useNoteStore.getState().searchNotes('Content 1');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Active Note 1');
    });

    it('should get note by id', () => {
      const notes = useNoteStore.getState().notes;
      const firstNote = notes[0];

      const found = useNoteStore.getState().getNoteById(firstNote.id);
      expect(found?.id).toBe(firstNote.id);
    });

    it('should return undefined for non-existent note', () => {
      const found = useNoteStore.getState().getNoteById('non-existent-id');
      expect(found).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty note title', () => {
      const store = useNoteStore.getState();

      const newNote = store.addNote({
        title: '',
        content: 'Only content',
        color: NoteColor.White,
        labels: [],
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      expect(newNote.title).toBe('');
      expect(newNote.content).toBe('Only content');
    });

    it('should handle note with design ID', () => {
      const store = useNoteStore.getState();

      const newNote = store.addNote({
        title: 'Styled Note',
        content: '',
        color: NoteColor.White,
        labels: [],
        isPinned: false,
        isArchived: false,
        isDeleted: false,
        designId: 'design-123',
      });

      expect(newNote.designId).toBe('design-123');
    });
  });
});
