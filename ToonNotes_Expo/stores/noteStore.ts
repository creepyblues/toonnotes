import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note, NoteColor, Label } from '@/types';
import { generateUUID } from '@/utils/uuid';

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
        const newNote: Note = {
          ...noteData,
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
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: Date.now() }
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
        const normalizedName = name.toLowerCase().trim();
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
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
