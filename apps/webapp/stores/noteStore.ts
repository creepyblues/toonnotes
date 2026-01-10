'use client';

import { create } from 'zustand';
import { Note, NoteColor, Label } from '@toonnotes/types';
import { v4 as generateUUID } from 'uuid';
import { getPresetForLabel, type LabelPreset } from '@toonnotes/constants';

interface NoteState {
  notes: Note[];
  labels: Label[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setNotes: (notes: Note[]) => void;
  setLabels: (labels: Label[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Note CRUD
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  restoreNote: (id: string) => void;
  permanentlyDeleteNote: (id: string) => void;
  archiveNote: (id: string) => void;
  unarchiveNote: (id: string) => void;
  pinNote: (id: string) => void;
  unpinNote: (id: string) => void;

  // Label actions on notes
  addLabelToNote: (noteId: string, labelName: string) => void;
  removeLabelFromNote: (noteId: string, labelName: string) => void;

  // Label CRUD
  addLabel: (name: string) => Label;
  deleteLabel: (id: string) => void;
  renameLabel: (id: string, newName: string) => void;

  // Queries
  getNoteById: (id: string) => Note | undefined;
  getActiveNotes: () => Note[];
  getArchivedNotes: () => Note[];
  getDeletedNotes: () => Note[];
  getPinnedNotes: () => Note[];
  getNotesByLabel: (labelName: string) => Note[];
  searchNotes: (query: string) => Note[];
}

// Normalize label names for consistency
const normalizeLabel = (name: string): string => {
  return name.toLowerCase().trim();
};

export const useNoteStore = create<NoteState>()((set, get) => ({
  notes: [],
  labels: [],
  isLoading: false,
  error: null,

  // Setters for hydration from server
  setNotes: (notes) => set({ notes }),
  setLabels: (labels) => set({ labels }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // Note CRUD
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
        note.id === id ? { ...note, ...updates, updatedAt: Date.now() } : note
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
        note.id === id ? { ...note, isDeleted: false, deletedAt: undefined } : note
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
        note.id === id ? { ...note, isArchived: true, isPinned: false } : note
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

  // Label actions on notes
  addLabelToNote: (noteId, labelName) => {
    const normalizedName = normalizeLabel(labelName);
    const note = get().notes.find((n) => n.id === noteId);
    if (!note) return;

    // Skip if already has this label
    if (note.labels.some((l) => normalizeLabel(l) === normalizedName)) {
      return;
    }

    // Check if this label has a preset
    const preset = getPresetForLabel(normalizedName);

    // Ensure label exists in labels collection
    const existingLabel = get().labels.find((l) => normalizeLabel(l.name) === normalizedName);
    if (!existingLabel) {
      const now = Date.now();
      const newLabel: Label = {
        id: generateUUID(),
        name: normalizedName,
        presetId: preset?.id,
        createdAt: now,
        lastUsedAt: now,
      };
      set((state) => ({ labels: [...state.labels, newLabel] }));
    } else {
      // Update lastUsedAt and presetId if not set
      set((state) => ({
        labels: state.labels.map((l) =>
          normalizeLabel(l.name) === normalizedName
            ? { ...l, lastUsedAt: Date.now(), presetId: l.presetId || preset?.id }
            : l
        ),
      }));
    }

    // Add label to note
    // Auto-apply preset design if note has no custom design and preset exists
    const shouldApplyPresetDesign = preset && !note.designId && !note.activeDesignLabelId;

    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === noteId
          ? {
              ...n,
              labels: [...n.labels, normalizedName],
              updatedAt: Date.now(),
              // Set activeDesignLabelId to apply preset styling
              ...(shouldApplyPresetDesign ? { activeDesignLabelId: normalizedName } : {}),
            }
          : n
      ),
    }));
  },

  removeLabelFromNote: (noteId, labelName) => {
    const normalizedName = normalizeLabel(labelName);

    set((state) => ({
      notes: state.notes.map((n) => {
        if (n.id !== noteId) return n;

        const newLabels = n.labels.filter((l) => normalizeLabel(l) !== normalizedName);

        // If removing the active design label, clear it
        let newActiveDesignLabelId = n.activeDesignLabelId;
        if (n.activeDesignLabelId && normalizeLabel(n.activeDesignLabelId) === normalizedName) {
          newActiveDesignLabelId = undefined;
        }

        return {
          ...n,
          labels: newLabels,
          activeDesignLabelId: newActiveDesignLabelId,
          updatedAt: Date.now(),
        };
      }),
    }));
  },

  // Label CRUD
  addLabel: (name) => {
    const normalizedName = normalizeLabel(name);

    // Check if already exists
    const existing = get().labels.find((l) => normalizeLabel(l.name) === normalizedName);
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

    const normalizedLabelName = normalizeLabel(label.name);

    // Remove label from all notes and delete from labels list
    set((state) => ({
      labels: state.labels.filter((l) => l.id !== id),
      notes: state.notes.map((note) => ({
        ...note,
        labels: note.labels.filter((l) => normalizeLabel(l) !== normalizedLabelName),
      })),
    }));
  },

  renameLabel: (id, newName) => {
    const oldLabel = get().labels.find((l) => l.id === id);
    if (!oldLabel) return;

    const normalizedNewName = normalizeLabel(newName);
    const oldNormalizedName = normalizeLabel(oldLabel.name);

    set((state) => ({
      labels: state.labels.map((l) =>
        l.id === id ? { ...l, name: normalizedNewName } : l
      ),
      notes: state.notes.map((note) => ({
        ...note,
        labels: note.labels.map((l) =>
          normalizeLabel(l) === oldNormalizedName ? normalizedNewName : l
        ),
      })),
    }));
  },

  // Queries
  getNoteById: (id) => get().notes.find((note) => note.id === id),

  getActiveNotes: () =>
    get()
      .notes.filter((note) => !note.isArchived && !note.isDeleted)
      .sort((a, b) => b.updatedAt - a.updatedAt),

  getArchivedNotes: () =>
    get()
      .notes.filter((note) => note.isArchived && !note.isDeleted)
      .sort((a, b) => b.updatedAt - a.updatedAt),

  getDeletedNotes: () =>
    get()
      .notes.filter((note) => note.isDeleted)
      .sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0)),

  getPinnedNotes: () =>
    get()
      .notes.filter((note) => note.isPinned && !note.isArchived && !note.isDeleted)
      .sort((a, b) => b.updatedAt - a.updatedAt),

  getNotesByLabel: (labelName) => {
    const normalized = normalizeLabel(labelName);
    return get()
      .notes.filter(
        (note) =>
          !note.isArchived &&
          !note.isDeleted &&
          note.labels.some((l) => normalizeLabel(l) === normalized)
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },

  searchNotes: (query) => {
    const q = query.toLowerCase().trim();
    if (!q) return get().getActiveNotes();

    return get()
      .notes.filter(
        (note) =>
          !note.isArchived &&
          !note.isDeleted &&
          (note.title.toLowerCase().includes(q) || note.content.toLowerCase().includes(q))
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },
}));
