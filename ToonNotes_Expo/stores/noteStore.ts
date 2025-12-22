import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Note, NoteColor, Label } from '@/types';
import { generateUUID } from '@/utils/uuid';
import {
  validateNoteTitle,
  validateNoteContent,
  validateLabelName,
} from '@/utils/validation';
import { debouncedStorage } from './debouncedStorage';

interface NoteState {
  notes: Note[];
  labels: Label[];

  // Note actions
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  restoreNote: (id: string) => void;
  permanentlyDeleteNote: (id: string) => void;
  archiveNote: (id: string) => void;
  unarchiveNote: (id: string) => void;
  pinNote: (id: string) => void;
  unpinNote: (id: string) => void;

  // Label actions
  addLabel: (name: string) => Label;
  deleteLabel: (id: string) => void;
  renameLabel: (id: string, newName: string) => void;

  // Queries
  getNoteById: (id: string) => Note | undefined;
  getActiveNotes: () => Note[];
  getArchivedNotes: () => Note[];
  getDeletedNotes: () => Note[];
  getNotesByLabel: (labelName: string) => Note[];
  searchNotes: (query: string) => Note[];
}

export const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
      notes: [],
      labels: [],

      // Note actions
      addNote: (noteData) => {
        const now = Date.now();

        // Validate and sanitize inputs
        const { sanitized: sanitizedTitle } = validateNoteTitle(noteData.title);
        const { sanitized: sanitizedContent } = validateNoteContent(noteData.content);

        const newNote: Note = {
          ...noteData,
          title: sanitizedTitle,
          content: sanitizedContent,
          id: generateUUID(),
          createdAt: now,
          updatedAt: now,
          labels: noteData.labels || [],
          isPinned: noteData.isPinned || false,
          isArchived: false,
          isDeleted: false,
        };
        set((state) => ({ notes: [newNote, ...state.notes] }));
        return newNote;
      },

      updateNote: (id, updates) => {
        // Validate and sanitize inputs if provided
        const sanitizedUpdates = { ...updates };
        if (updates.title !== undefined) {
          const { sanitized } = validateNoteTitle(updates.title);
          sanitizedUpdates.title = sanitized;
        }
        if (updates.content !== undefined) {
          const { sanitized } = validateNoteContent(updates.content);
          sanitizedUpdates.content = sanitized;
        }

        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, ...sanitizedUpdates, updatedAt: Date.now() }
              : note
          ),
        }));
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, isDeleted: true, deletedAt: Date.now(), isPinned: false }
              : note
          ),
        }));
      },

      restoreNote: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, isDeleted: false, deletedAt: undefined }
              : note
          ),
        }));
      },

      permanentlyDeleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));
      },

      archiveNote: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, isArchived: true, isPinned: false }
              : note
          ),
        }));
      },

      unarchiveNote: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, isArchived: false } : note
          ),
        }));
      },

      pinNote: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, isPinned: true } : note
          ),
        }));
      },

      unpinNote: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, isPinned: false } : note
          ),
        }));
      },

      // Label actions
      addLabel: (name) => {
        // Validate and sanitize the label name
        const { isValid, sanitized } = validateLabelName(name);
        if (!isValid || !sanitized) {
          // Return a dummy label if validation fails
          const existing = get().labels.find(
            (l) => l.name.toLowerCase() === name.toLowerCase().trim()
          );
          if (existing) return existing;
        }

        const normalizedName = sanitized.toLowerCase();
        const existing = get().labels.find(
          (l) => l.name.toLowerCase() === normalizedName
        );
        if (existing) return existing;

        const newLabel: Label = {
          id: generateUUID(),
          name: normalizedName,
          createdAt: Date.now(),
        };
        set((state) => ({ labels: [...state.labels, newLabel] }));
        return newLabel;
      },

      deleteLabel: (id) => {
        const label = get().labels.find((l) => l.id === id);
        if (!label) return;

        // Remove label from all notes
        set((state) => ({
          labels: state.labels.filter((l) => l.id !== id),
          notes: state.notes.map((note) => ({
            ...note,
            labels: note.labels.filter((l) => l.toLowerCase() !== label.name.toLowerCase()),
          })),
        }));
      },

      renameLabel: (id, newName) => {
        const oldLabel = get().labels.find((l) => l.id === id);
        if (!oldLabel) return;

        const normalizedNewName = newName.toLowerCase().trim();
        set((state) => ({
          labels: state.labels.map((l) =>
            l.id === id ? { ...l, name: normalizedNewName } : l
          ),
          notes: state.notes.map((note) => ({
            ...note,
            labels: note.labels.map((l) =>
              l.toLowerCase() === oldLabel.name.toLowerCase() ? normalizedNewName : l
            ),
          })),
        }));
      },

      // Queries
      getNoteById: (id) => get().notes.find((note) => note.id === id),

      getActiveNotes: () =>
        get().notes.filter((note) => !note.isArchived && !note.isDeleted),

      getArchivedNotes: () =>
        get().notes.filter((note) => note.isArchived && !note.isDeleted),

      getDeletedNotes: () => get().notes.filter((note) => note.isDeleted),

      getNotesByLabel: (labelName) =>
        get().notes.filter(
          (note) =>
            !note.isArchived &&
            !note.isDeleted &&
            note.labels.some((l) => l.toLowerCase() === labelName.toLowerCase())
        ),

      searchNotes: (query) => {
        const q = query.toLowerCase().trim();
        if (!q) return get().getActiveNotes();

        return get().notes.filter(
          (note) =>
            !note.isArchived &&
            !note.isDeleted &&
            (note.title.toLowerCase().includes(q) ||
              note.content.toLowerCase().includes(q))
        );
      },
    }),
    {
      name: 'toonnotes-notes',
      storage: createJSONStorage(() => debouncedStorage),
    }
  )
);
