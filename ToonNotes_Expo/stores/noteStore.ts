import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Note, NoteColor, Label } from '@/types';
import { generateUUID } from '@/utils/uuid';
import {
  validateNoteTitle,
  validateNoteContent,
  validateLabelName,
} from '@/utils/validation';
import { normalizeLabel } from '@/utils/labelNormalization';
import { debouncedStorage } from './debouncedStorage';
import { getPresetForLabel, LabelPresetId } from '@/constants/labelPresets';

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
  clearUnpinnedNotes: () => void;  // Delete all notes except pinned ones

  // Label actions
  addLabel: (name: string) => Label;
  deleteLabel: (id: string) => void;
  renameLabel: (id: string, newName: string) => void;

  // Note-Label actions (with auto-apply design)
  addLabelToNote: (noteId: string, labelName: string) => void;
  removeLabelFromNote: (noteId: string, labelName: string) => void;
  setActiveDesignLabel: (noteId: string, labelName: string | undefined) => void;
  assignUncategorizedLabel: (noteId: string) => void;

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

      clearUnpinnedNotes: () => {
        set((state) => ({
          notes: state.notes.filter((note) => note.isPinned),
        }));
      },

      // Label actions
      addLabel: (name) => {
        // Validate and sanitize the label name
        const { isValid, sanitized } = validateLabelName(name);
        if (!isValid || !sanitized) {
          // Try to find existing label with the raw name (normalized)
          const normalizedRaw = normalizeLabel(name);
          const existing = get().labels.find(
            (l) => l.name === normalizedRaw
          );
          if (existing) return existing;
          // If validation failed and no existing label, return a fallback label
          // This prevents undefined errors when sanitized is null/undefined
          const fallbackName = normalizedRaw || 'untitled';
          const fallbackLabel: Label = {
            id: generateUUID(),
            name: fallbackName,
            createdAt: Date.now(),
          };
          set((state) => ({ labels: [...state.labels, fallbackLabel] }));
          return fallbackLabel;
        }

        // Normalize to canonical form (handles singular/plural)
        const normalizedName = normalizeLabel(sanitized);
        const existing = get().labels.find(
          (l) => l.name === normalizedName
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

        const normalizedLabelName = normalizeLabel(label.name);

        // Remove label from all notes
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

        // Normalize the new name to canonical form
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

      // Note-Label actions (with auto-apply design)
      addLabelToNote: (noteId, labelName) => {
        const note = get().notes.find((n) => n.id === noteId);
        if (!note) return;

        // Normalize to canonical form (handles singular/plural variants)
        const normalizedName = normalizeLabel(labelName);

        // Skip if label already exists on note
        if (note.labels.some((l) => normalizeLabel(l) === normalizedName)) {
          return;
        }

        // Check if label has a preset (using normalized name)
        const preset = getPresetForLabel(normalizedName);
        const presetDesignId = preset ? `label-preset-${preset.id}` : undefined;

        // Ensure the label exists in the labels collection and update lastUsedAt
        const existingLabel = get().labels.find(
          (l) => l.name === normalizedName
        );
        const now = Date.now();

        if (!existingLabel) {
          const newLabel: Label = {
            id: generateUUID(),
            name: normalizedName,
            presetId: preset?.id,
            createdAt: now,
            lastUsedAt: now,
          };
          set((state) => ({ labels: [...state.labels, newLabel] }));
        } else {
          // Update lastUsedAt for existing label
          set((state) => ({
            labels: state.labels.map((l) =>
              l.name === normalizedName
                ? { ...l, lastUsedAt: now }
                : l
            ),
          }));
        }

        set((state) => ({
          notes: state.notes.map((n) => {
            if (n.id !== noteId) return n;

            const newLabels = [...n.labels, normalizedName];

            // Auto-apply design logic:
            // 1. If note has no design and this label has a preset -> auto-apply
            // 2. If note already has a design, keep it but update activeDesignLabelId
            if (!n.designId && presetDesignId) {
              return {
                ...n,
                labels: newLabels,
                designId: presetDesignId,
                activeDesignLabelId: normalizedName,
                updatedAt: Date.now(),
              };
            }

            // Note already has a design or label doesn't have preset
            return {
              ...n,
              labels: newLabels,
              updatedAt: Date.now(),
            };
          }),
        }));
      },

      removeLabelFromNote: (noteId, labelName) => {
        const normalizedName = normalizeLabel(labelName);
        const note = get().notes.find((n) => n.id === noteId);
        if (!note) return;

        set((state) => ({
          notes: state.notes.map((n) => {
            if (n.id !== noteId) return n;

            const newLabels = n.labels.filter(
              (l) => normalizeLabel(l) !== normalizedName
            );

            // If the removed label was the active design label, clear it
            // and potentially find another label with a preset
            let newDesignId = n.designId;
            let newActiveDesignLabelId = n.activeDesignLabelId;

            if (n.activeDesignLabelId && normalizeLabel(n.activeDesignLabelId) === normalizedName) {
              // Find another label with a preset
              const otherPresetLabel = newLabels.find((l) =>
                getPresetForLabel(l)
              );

              if (otherPresetLabel) {
                const preset = getPresetForLabel(otherPresetLabel);
                newDesignId = `label-preset-${preset!.id}`;
                newActiveDesignLabelId = otherPresetLabel;
              } else {
                // No other preset labels, clear the design
                newDesignId = undefined;
                newActiveDesignLabelId = undefined;
              }
            }

            return {
              ...n,
              labels: newLabels,
              designId: newDesignId,
              activeDesignLabelId: newActiveDesignLabelId,
              updatedAt: Date.now(),
            };
          }),
        }));
      },

      setActiveDesignLabel: (noteId, labelName) => {
        const preset = labelName ? getPresetForLabel(labelName) : undefined;
        const newDesignId = preset ? `label-preset-${preset.id}` : undefined;

        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === noteId
              ? {
                  ...n,
                  designId: newDesignId,
                  activeDesignLabelId: labelName,
                  updatedAt: Date.now(),
                }
              : n
          ),
        }));
      },

      assignUncategorizedLabel: (noteId) => {
        const note = get().notes.find((n) => n.id === noteId);
        if (!note) return;

        // Don't add if already has labels
        if (note.labels.length > 0) return;

        const uncategorizedLabel = 'uncategorized';
        const preset = getPresetForLabel(uncategorizedLabel);
        const presetDesignId = preset ? `label-preset-${preset.id}` : undefined;

        // Ensure the uncategorized label exists in the labels collection
        const existingLabel = get().labels.find(
          (l) => l.name.toLowerCase() === uncategorizedLabel
        );
        const now = Date.now();

        if (!existingLabel) {
          const newLabel: Label = {
            id: generateUUID(),
            name: uncategorizedLabel,
            presetId: preset?.id,
            isSystemLabel: true,
            createdAt: now,
            lastUsedAt: now,
          };
          set((state) => ({ labels: [...state.labels, newLabel] }));
        }

        set((state) => ({
          notes: state.notes.map((n) => {
            if (n.id !== noteId) return n;

            return {
              ...n,
              labels: [uncategorizedLabel],
              designId: presetDesignId,
              activeDesignLabelId: uncategorizedLabel,
              updatedAt: Date.now(),
            };
          }),
        }));
      },

      // Queries
      getNoteById: (id) => get().notes.find((note) => note.id === id),

      getActiveNotes: () =>
        get().notes.filter((note) => !note.isArchived && !note.isDeleted),

      getArchivedNotes: () =>
        get().notes.filter((note) => note.isArchived && !note.isDeleted),

      getDeletedNotes: () => get().notes.filter((note) => note.isDeleted),

      getNotesByLabel: (labelName) => {
        const normalized = normalizeLabel(labelName);
        return get().notes.filter(
          (note) =>
            !note.isArchived &&
            !note.isDeleted &&
            note.labels.some((l) => normalizeLabel(l) === normalized)
        );
      },

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
