import { describe, it, expect, beforeEach } from 'vitest';
import { useNoteStore } from '@/stores/noteStore';
import { NoteColor } from '@toonnotes/types';

describe('NoteStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useNoteStore.setState({
      notes: [],
      labels: [],
      isLoading: false,
      error: null,
    });
  });

  describe('Note CRUD Operations', () => {
    it('should add a new note with generated id and timestamps', () => {
      const store = useNoteStore.getState();

      const newNote = store.addNote({
        title: 'Test Note',
        content: 'Test content',
        labels: [],
        color: NoteColor.White,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      expect(newNote.id).toBeDefined();
      expect(newNote.title).toBe('Test Note');
      expect(newNote.createdAt).toBeDefined();
      expect(newNote.updatedAt).toBeDefined();
      expect(useNoteStore.getState().notes).toHaveLength(1);
    });

    it('should add new notes at the beginning of the array', () => {
      const store = useNoteStore.getState();

      const firstNote = store.addNote({
        title: 'First Note',
        content: '',
        labels: [],
        color: NoteColor.White,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      const secondNote = store.addNote({
        title: 'Second Note',
        content: '',
        labels: [],
        color: NoteColor.White,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      const notes = useNoteStore.getState().notes;
      expect(notes[0].id).toBe(secondNote.id);
      expect(notes[1].id).toBe(firstNote.id);
    });

    it('should update a note and change updatedAt timestamp', async () => {
      const store = useNoteStore.getState();

      const note = store.addNote({
        title: 'Original Title',
        content: '',
        labels: [],
        color: NoteColor.White,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      const originalUpdatedAt = note.updatedAt;

      // Wait a bit to ensure timestamp changes
      await new Promise((resolve) => setTimeout(resolve, 10));

      useNoteStore.getState().updateNote(note.id, { title: 'Updated Title' });

      const updatedNote = useNoteStore.getState().getNoteById(note.id);
      expect(updatedNote?.title).toBe('Updated Title');
      expect(updatedNote?.updatedAt).toBeGreaterThan(originalUpdatedAt);
    });

    it('should soft delete a note and set deletedAt', () => {
      const store = useNoteStore.getState();

      const note = store.addNote({
        title: 'To Delete',
        content: '',
        labels: [],
        color: NoteColor.White,
        isPinned: true, // Should be unpinned on delete
        isArchived: false,
        isDeleted: false,
      });

      useNoteStore.getState().deleteNote(note.id);

      const deletedNote = useNoteStore.getState().getNoteById(note.id);
      expect(deletedNote?.isDeleted).toBe(true);
      expect(deletedNote?.deletedAt).toBeDefined();
      expect(deletedNote?.isPinned).toBe(false); // Should unpin on delete
    });

    it('should restore a deleted note', () => {
      const store = useNoteStore.getState();

      const note = store.addNote({
        title: 'To Restore',
        content: '',
        labels: [],
        color: NoteColor.White,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      useNoteStore.getState().deleteNote(note.id);
      useNoteStore.getState().restoreNote(note.id);

      const restoredNote = useNoteStore.getState().getNoteById(note.id);
      expect(restoredNote?.isDeleted).toBe(false);
      expect(restoredNote?.deletedAt).toBeUndefined();
    });

    it('should permanently delete a note', () => {
      const store = useNoteStore.getState();

      const note = store.addNote({
        title: 'To Permanently Delete',
        content: '',
        labels: [],
        color: NoteColor.White,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      expect(useNoteStore.getState().notes).toHaveLength(1);

      useNoteStore.getState().permanentlyDeleteNote(note.id);

      expect(useNoteStore.getState().notes).toHaveLength(0);
    });
  });

  describe('Archive Operations', () => {
    it('should archive a note and unpin it', () => {
      const store = useNoteStore.getState();

      const note = store.addNote({
        title: 'To Archive',
        content: '',
        labels: [],
        color: NoteColor.White,
        isPinned: true,
        isArchived: false,
        isDeleted: false,
      });

      useNoteStore.getState().archiveNote(note.id);

      const archivedNote = useNoteStore.getState().getNoteById(note.id);
      expect(archivedNote?.isArchived).toBe(true);
      expect(archivedNote?.isPinned).toBe(false);
    });

    it('should unarchive a note', () => {
      const store = useNoteStore.getState();

      const note = store.addNote({
        title: 'To Unarchive',
        content: '',
        labels: [],
        color: NoteColor.White,
        isPinned: false,
        isArchived: true, // Start archived
        isDeleted: false,
      });

      useNoteStore.getState().unarchiveNote(note.id);

      const unarchivedNote = useNoteStore.getState().getNoteById(note.id);
      expect(unarchivedNote?.isArchived).toBe(false);
    });
  });

  describe('Pin Operations', () => {
    it('should pin a note', () => {
      const store = useNoteStore.getState();

      const note = store.addNote({
        title: 'To Pin',
        content: '',
        labels: [],
        color: NoteColor.White,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      useNoteStore.getState().pinNote(note.id);

      const pinnedNote = useNoteStore.getState().getNoteById(note.id);
      expect(pinnedNote?.isPinned).toBe(true);
    });

    it('should unpin a note', () => {
      const store = useNoteStore.getState();

      const note = store.addNote({
        title: 'To Unpin',
        content: '',
        labels: [],
        color: NoteColor.White,
        isPinned: true,
        isArchived: false,
        isDeleted: false,
      });

      useNoteStore.getState().unpinNote(note.id);

      const unpinnedNote = useNoteStore.getState().getNoteById(note.id);
      expect(unpinnedNote?.isPinned).toBe(false);
    });
  });

  describe('Label Operations', () => {
    it('should normalize label names to lowercase', () => {
      const store = useNoteStore.getState();

      const note = store.addNote({
        title: 'Test Note',
        content: '',
        labels: [],
        color: NoteColor.White,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      useNoteStore.getState().addLabelToNote(note.id, '  TEST Label  ');

      const updatedNote = useNoteStore.getState().getNoteById(note.id);
      expect(updatedNote?.labels).toContain('test label');
    });

    it('should create a new label when adding to note if it does not exist', () => {
      const store = useNoteStore.getState();

      const note = store.addNote({
        title: 'Test Note',
        content: '',
        labels: [],
        color: NoteColor.White,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      expect(useNoteStore.getState().labels).toHaveLength(0);

      useNoteStore.getState().addLabelToNote(note.id, 'newlabel');

      expect(useNoteStore.getState().labels).toHaveLength(1);
      expect(useNoteStore.getState().labels[0].name).toBe('newlabel');
    });

    it('should not add duplicate labels to a note', () => {
      const store = useNoteStore.getState();

      const note = store.addNote({
        title: 'Test Note',
        content: '',
        labels: ['existing'],
        color: NoteColor.White,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      useNoteStore.getState().addLabelToNote(note.id, 'EXISTING'); // Different case

      const updatedNote = useNoteStore.getState().getNoteById(note.id);
      expect(updatedNote?.labels).toHaveLength(1);
    });

    it('should remove a label from a note', () => {
      const store = useNoteStore.getState();

      const note = store.addNote({
        title: 'Test Note',
        content: '',
        labels: ['label1', 'label2'],
        color: NoteColor.White,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      useNoteStore.getState().removeLabelFromNote(note.id, 'label1');

      const updatedNote = useNoteStore.getState().getNoteById(note.id);
      expect(updatedNote?.labels).toEqual(['label2']);
    });

    it('should clear activeDesignLabelId when removing that label', () => {
      const store = useNoteStore.getState();

      const note = store.addNote({
        title: 'Test Note',
        content: '',
        labels: ['design-label'],
        color: NoteColor.White,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      // Set activeDesignLabelId manually
      useNoteStore.getState().updateNote(note.id, { activeDesignLabelId: 'design-label' });

      useNoteStore.getState().removeLabelFromNote(note.id, 'design-label');

      const updatedNote = useNoteStore.getState().getNoteById(note.id);
      expect(updatedNote?.activeDesignLabelId).toBeUndefined();
    });

    it('should delete a label and remove it from all notes', () => {
      const store = useNoteStore.getState();

      const note1 = store.addNote({
        title: 'Note 1',
        content: '',
        labels: ['shared-label', 'other'],
        color: NoteColor.White,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      const note2 = store.addNote({
        title: 'Note 2',
        content: '',
        labels: ['shared-label'],
        color: NoteColor.White,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      // Create the label entry
      const label = useNoteStore.getState().addLabel('shared-label');

      useNoteStore.getState().deleteLabel(label.id);

      const updatedNote1 = useNoteStore.getState().getNoteById(note1.id);
      const updatedNote2 = useNoteStore.getState().getNoteById(note2.id);

      expect(updatedNote1?.labels).toEqual(['other']);
      expect(updatedNote2?.labels).toEqual([]);
      expect(useNoteStore.getState().labels.find((l) => l.name === 'shared-label')).toBeUndefined();
    });

    it('should rename a label across all notes', () => {
      const store = useNoteStore.getState();

      store.addNote({
        title: 'Note 1',
        content: '',
        labels: ['oldname'],
        color: NoteColor.White,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      const label = useNoteStore.getState().addLabel('oldname');

      useNoteStore.getState().renameLabel(label.id, 'newname');

      const notes = useNoteStore.getState().notes;
      expect(notes[0].labels).toContain('newname');
      expect(notes[0].labels).not.toContain('oldname');
    });
  });

  describe('Query Operations', () => {
    beforeEach(() => {
      // Reset store state before each test in this describe block
      // Note: addNote() always sets isArchived and isDeleted to false,
      // so we use setNotes() to set up test data with various states
      const now = Date.now();
      useNoteStore.setState({
        notes: [
          {
            id: 'active-1',
            title: 'Active Note 1',
            content: 'content',
            labels: ['work'],
            color: NoteColor.White,
            isPinned: false,
            isArchived: false,
            isDeleted: false,
            createdAt: now - 4000,
            updatedAt: now - 4000,
          },
          {
            id: 'pinned-1',
            title: 'Pinned Note',
            content: 'pinned content',
            labels: ['important'],
            color: NoteColor.Lavender,
            isPinned: true,
            isArchived: false,
            isDeleted: false,
            createdAt: now - 3000,
            updatedAt: now - 3000,
          },
          {
            id: 'archived-1',
            title: 'Archived Note',
            content: 'archived content',
            labels: ['old'],
            color: NoteColor.White,
            isPinned: false,
            isArchived: true,
            isDeleted: false,
            createdAt: now - 2000,
            updatedAt: now - 2000,
          },
          {
            id: 'deleted-1',
            title: 'Deleted Note',
            content: 'deleted content',
            labels: [],
            color: NoteColor.White,
            isPinned: false,
            isArchived: false,
            isDeleted: true,
            deletedAt: now - 1000,
            createdAt: now - 1000,
            updatedAt: now - 1000,
          },
        ],
        labels: [],
        isLoading: false,
        error: null,
      });
    });

    it('getActiveNotes should return only non-archived, non-deleted notes', () => {
      const activeNotes = useNoteStore.getState().getActiveNotes();

      expect(activeNotes).toHaveLength(2);
      expect(activeNotes.every((n) => !n.isArchived && !n.isDeleted)).toBe(true);
    });

    it('getArchivedNotes should return only archived non-deleted notes', () => {
      const archivedNotes = useNoteStore.getState().getArchivedNotes();

      expect(archivedNotes).toHaveLength(1);
      expect(archivedNotes[0].title).toBe('Archived Note');
    });

    it('getDeletedNotes should return only deleted notes', () => {
      const deletedNotes = useNoteStore.getState().getDeletedNotes();

      expect(deletedNotes).toHaveLength(1);
      expect(deletedNotes[0].title).toBe('Deleted Note');
    });

    it('getPinnedNotes should return only pinned non-archived non-deleted notes', () => {
      const pinnedNotes = useNoteStore.getState().getPinnedNotes();

      expect(pinnedNotes).toHaveLength(1);
      expect(pinnedNotes[0].title).toBe('Pinned Note');
    });

    it('getNotesByLabel should filter by label (case insensitive)', () => {
      const workNotes = useNoteStore.getState().getNotesByLabel('WORK');

      expect(workNotes).toHaveLength(1);
      expect(workNotes[0].title).toBe('Active Note 1');
    });

    it('searchNotes should search in title and content', () => {
      const store = useNoteStore.getState();

      const titleResults = store.searchNotes('Active');
      expect(titleResults.some((n) => n.title === 'Active Note 1')).toBe(true);

      const contentResults = store.searchNotes('pinned content');
      expect(contentResults.some((n) => n.title === 'Pinned Note')).toBe(true);
    });

    it('searchNotes should be case insensitive', () => {
      const results = useNoteStore.getState().searchNotes('ACTIVE');
      expect(results.some((n) => n.title === 'Active Note 1')).toBe(true);
    });

    it('searchNotes should return all active notes for empty query', () => {
      const results = useNoteStore.getState().searchNotes('');
      const activeNotes = useNoteStore.getState().getActiveNotes();

      expect(results.length).toBe(activeNotes.length);
    });

    it('searchNotes should not return archived or deleted notes', () => {
      const results = useNoteStore.getState().searchNotes('content');

      expect(results.some((n) => n.isArchived)).toBe(false);
      expect(results.some((n) => n.isDeleted)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle operations on non-existent notes gracefully', () => {
      // These should not throw
      expect(() => {
        useNoteStore.getState().updateNote('non-existent', { title: 'New Title' });
        useNoteStore.getState().deleteNote('non-existent');
        useNoteStore.getState().restoreNote('non-existent');
        useNoteStore.getState().archiveNote('non-existent');
        useNoteStore.getState().pinNote('non-existent');
      }).not.toThrow();
    });

    it('should handle empty labels array', () => {
      const store = useNoteStore.getState();

      const note = store.addNote({
        title: 'No Labels',
        content: '',
        labels: [],
        color: NoteColor.White,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      expect(note.labels).toEqual([]);
    });

    it('should handle adding label to non-existent note gracefully', () => {
      expect(() => {
        useNoteStore.getState().addLabelToNote('non-existent', 'label');
      }).not.toThrow();
    });
  });
});
