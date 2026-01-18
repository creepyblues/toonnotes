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

// Lazy import to avoid circular dependency
const getAuthUserId = () => {
  // Dynamic import to break circular dependency
  const { useAuthStore } = require('./authStore');
  return useAuthStore.getState().user?.id;
};

// Check if user is Pro (lazy import to avoid circular dependency)
const isPro = () => {
  const { useUserStore } = require('./userStore');
  return useUserStore.getState().isPro();
};

// Helper to sync note to cloud (fire and forget)
// Only syncs for Pro users - uses lazy import to avoid circular dependency
const syncToCloud = (note: Note) => {
  const userId = getAuthUserId();
  if (userId && isPro()) {
    const { uploadNote } = require('@/services/syncService');
    uploadNote(note, userId).catch((error: Error) => {
      console.error('[NoteStore] Cloud sync failed:', error);
    });
  }
};

// Helper to delete from cloud (fire and forget)
// Only deletes for Pro users - uses lazy import to avoid circular dependency
const deleteFromCloud = (noteId: string) => {
  const userId = getAuthUserId();
  if (userId && isPro()) {
    const { deleteNoteFromCloud } = require('@/services/syncService');
    deleteNoteFromCloud(noteId).catch((error: Error) => {
      console.error('[NoteStore] Cloud delete failed:', error);
    });
  }
};

interface NoteState {
  notes: Note[];
  labels: Label[];

  // Track notes with recent local changes (protect from cloud sync overwrite)
  // Map of noteId -> timestamp when the local change was made
  recentlyModifiedIds: Map<string, number>;

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
      recentlyModifiedIds: new Map<string, number>(),

      // Note actions
      addNote: (noteData) => {
        const now = Date.now();

        // Validate and sanitize inputs
        const { sanitized: sanitizedTitle } = validateNoteTitle(noteData.title);
        const { sanitized: sanitizedContent } = validateNoteContent(noteData.content);

        // Check for label presets and auto-apply design
        let designId = noteData.designId;
        let activeDesignLabelId: string | undefined;

        if (!designId && noteData.labels && noteData.labels.length > 0) {
          // Find first label with a preset
          for (const label of noteData.labels) {
            const normalizedName = normalizeLabel(label);
            const preset = getPresetForLabel(normalizedName);
            if (preset) {
              designId = `label-preset-${preset.id}`;
              activeDesignLabelId = normalizedName;
              break;
            }
          }
        }

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
          designId,
          activeDesignLabelId,
        };

        set((state) => ({ notes: [newNote, ...state.notes] }));

        // Sync to cloud
        syncToCloud(newNote);

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

        // Mark this note as recently modified locally (protect from cloud sync overwrite)
        const modificationTimestamp = Date.now();
        set((state) => {
          // Defensive: ensure recentlyModifiedIds is a valid Map (might be corrupted from old storage)
          const existingMap = state.recentlyModifiedIds instanceof Map ? state.recentlyModifiedIds : new Map();
          const newMap = new Map(existingMap);
          newMap.set(id, modificationTimestamp);
          return {
            notes: state.notes.map((note) =>
              note.id === id
                ? { ...note, ...sanitizedUpdates, updatedAt: modificationTimestamp }
                : note
            ),
            recentlyModifiedIds: newMap,
          };
        });

        // Clear the protection after 2 seconds (enough time for cloud roundtrip)
        setTimeout(() => {
          set((state) => {
            const existingMap = state.recentlyModifiedIds instanceof Map ? state.recentlyModifiedIds : new Map();
            const newMap = new Map(existingMap);
            // Only clear if this is still our timestamp (not a newer modification)
            if (newMap.get(id) === modificationTimestamp) {
              newMap.delete(id);
            }
            return { recentlyModifiedIds: newMap };
          });
        }, 2000);

        // Sync to cloud
        const updatedNote = get().notes.find((n) => n.id === id);
        if (updatedNote) {
          syncToCloud(updatedNote);
        }
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, isDeleted: true, deletedAt: Date.now(), isPinned: false }
              : note
          ),
        }));

        // Sync soft delete to cloud
        const deletedNote = get().notes.find((n) => n.id === id);
        if (deletedNote) {
          syncToCloud(deletedNote);
        }
      },

      restoreNote: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, isDeleted: false, deletedAt: undefined }
              : note
          ),
        }));

        // Sync restore to cloud
        const restoredNote = get().notes.find((n) => n.id === id);
        if (restoredNote) {
          syncToCloud(restoredNote);
        }
      },

      permanentlyDeleteNote: (id) => {
        // Delete from cloud first
        deleteFromCloud(id);

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

        // Sync archive to cloud
        const archivedNote = get().notes.find((n) => n.id === id);
        if (archivedNote) {
          syncToCloud(archivedNote);
        }
      },

      unarchiveNote: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, isArchived: false } : note
          ),
        }));

        // Sync unarchive to cloud
        const unarchivedNote = get().notes.find((n) => n.id === id);
        if (unarchivedNote) {
          syncToCloud(unarchivedNote);
        }
      },

      pinNote: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, isPinned: true } : note
          ),
        }));

        // Sync pin to cloud
        const pinnedNote = get().notes.find((n) => n.id === id);
        if (pinnedNote) {
          syncToCloud(pinnedNote);
        }
      },

      unpinNote: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, isPinned: false } : note
          ),
        }));

        // Sync unpin to cloud
        const unpinnedNote = get().notes.find((n) => n.id === id);
        if (unpinnedNote) {
          syncToCloud(unpinnedNote);
        }
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

        // Sync to cloud
        const updatedNote = get().notes.find((n) => n.id === noteId);
        if (updatedNote) {
          syncToCloud(updatedNote);
        }
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

        // Sync to cloud
        const updatedNote = get().notes.find((n) => n.id === noteId);
        if (updatedNote) {
          syncToCloud(updatedNote);
        }
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

        // Sync to cloud
        const updatedNote = get().notes.find((n) => n.id === noteId);
        if (updatedNote) {
          syncToCloud(updatedNote);
        }
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

        // Sync to cloud
        const updatedNote = get().notes.find((n) => n.id === noteId);
        if (updatedNote) {
          syncToCloud(updatedNote);
        }
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
      partialize: (state) => ({
        notes: state.notes,
        // Don't persist recentlyModifiedIds - it's a Map that doesn't serialize
        // and it's only needed for temporary local modification tracking
      }),
    }
  )
);
