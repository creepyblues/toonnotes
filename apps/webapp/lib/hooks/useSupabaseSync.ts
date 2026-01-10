'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useNoteStore, useDesignStore } from '@/stores';
import { createClient } from '@/lib/supabase/client';
import { Note, Label, NoteDesign } from '@toonnotes/types';

// Debounce helper that queues the latest call instead of dropping it
function debounceWithQueue<T extends (...args: never[]) => void>(fn: T, ms: number) {
  let timeout: NodeJS.Timeout | null = null;
  let pendingArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>) => {
    pendingArgs = args;
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      if (pendingArgs) {
        fn(...pendingArgs);
        pendingArgs = null;
      }
      timeout = null;
    }, ms);
  };
}

// Convert app Note to database format
function noteToDbNote(note: Note, userId: string) {
  return {
    id: note.id,
    user_id: userId,
    title: note.title,
    content: note.content,
    labels: note.labels,
    color: note.color,
    design_id: note.designId || null,
    active_design_label_id: note.activeDesignLabelId || null,
    is_pinned: note.isPinned,
    is_archived: note.isArchived,
    is_deleted: note.isDeleted,
    deleted_at: note.deletedAt ? new Date(note.deletedAt).toISOString() : null,
    created_at: new Date(note.createdAt).toISOString(),
    updated_at: new Date(note.updatedAt).toISOString(),
  };
}

// Convert app Label to database format
function labelToDbLabel(label: Label, userId: string) {
  return {
    id: label.id,
    user_id: userId,
    name: label.name,
    preset_id: label.presetId || null,
    custom_design_id: label.customDesignId || null,
    is_system_label: label.isSystemLabel || false,
    created_at: new Date(label.createdAt).toISOString(),
    last_used_at: label.lastUsedAt ? new Date(label.lastUsedAt).toISOString() : null,
  };
}

// Convert app NoteDesign to database format
function designToDbDesign(design: NoteDesign, userId: string) {
  return {
    id: design.id,
    user_id: userId,
    name: design.name,
    source_image_uri: design.sourceImageUri,
    created_at: new Date(design.createdAt).toISOString(),
    background: design.background,
    colors: design.colors,
    typography: design.typography,
    sticker: design.sticker,
    design_summary: design.designSummary,
    vibe: design.vibe || null,
    is_lucky: design.isLucky || false,
    label_preset_id: design.labelPresetId || null,
    is_label_preset: design.isLabelPreset || false,
    is_system_default: design.isSystemDefault || false,
    theme_id: design.themeId || null,
  };
}

export function useSupabaseSync() {
  const supabase = createClient();
  const userIdRef = useRef<string | null>(null);

  // Track sync operations with a queue to prevent race conditions
  const noteSyncQueueRef = useRef<Map<string, Note>>(new Map());
  const labelSyncQueueRef = useRef<Map<string, Label>>(new Map());
  const designSyncQueueRef = useRef<Map<string, NoteDesign>>(new Map());
  const isSyncingRef = useRef(false);

  // Process the sync queue
  const processSyncQueue = useCallback(async () => {
    if (isSyncingRef.current || !userIdRef.current) return;

    const userId = userIdRef.current;
    const notesToSync = Array.from(noteSyncQueueRef.current.values());
    const labelsToSync = Array.from(labelSyncQueueRef.current.values());
    const designsToSync = Array.from(designSyncQueueRef.current.values());

    if (notesToSync.length === 0 && labelsToSync.length === 0 && designsToSync.length === 0) {
      return;
    }

    isSyncingRef.current = true;

    // Clear queues before processing (new changes will be added to fresh queues)
    noteSyncQueueRef.current.clear();
    labelSyncQueueRef.current.clear();
    designSyncQueueRef.current.clear();

    try {
      // Sync notes
      if (notesToSync.length > 0) {
        const dbNotes = notesToSync.map((note) => noteToDbNote(note, userId));
        const { error } = await supabase.from('notes').upsert(dbNotes, {
          onConflict: 'id',
        });
        if (error) {
          console.error('[SupabaseSync] Failed to sync notes:', error);
        }
      }

      // Sync labels
      if (labelsToSync.length > 0) {
        const dbLabels = labelsToSync.map((label) => labelToDbLabel(label, userId));
        const { error } = await supabase.from('labels').upsert(dbLabels, {
          onConflict: 'id',
        });
        if (error) {
          console.error('[SupabaseSync] Failed to sync labels:', error);
        }
      }

      // Sync designs
      if (designsToSync.length > 0) {
        const dbDesigns = designsToSync.map((design) => designToDbDesign(design, userId));
        const { error } = await supabase.from('designs').upsert(dbDesigns, {
          onConflict: 'id',
        });
        if (error) {
          console.error('[SupabaseSync] Failed to sync designs:', error);
        }
      }
    } catch (error) {
      console.error('[SupabaseSync] Error during sync:', error);
    } finally {
      isSyncingRef.current = false;

      // Check if more items were added while we were syncing
      if (
        noteSyncQueueRef.current.size > 0 ||
        labelSyncQueueRef.current.size > 0 ||
        designSyncQueueRef.current.size > 0
      ) {
        // Schedule another sync
        debouncedProcessQueue();
      }
    }
  }, [supabase]);

  // Debounced queue processor
  const debouncedProcessQueueRef = useRef<(() => void) | null>(null);

  // Initialize debounced function
  const debouncedProcessQueue = useCallback(() => {
    debouncedProcessQueueRef.current?.();
  }, []);

  useEffect(() => {
    debouncedProcessQueueRef.current = debounceWithQueue(processSyncQueue, 1000);
  }, [processSyncQueue]);

  // Queue a note for sync
  const queueNoteSync = useCallback((note: Note) => {
    noteSyncQueueRef.current.set(note.id, note);
    debouncedProcessQueue();
  }, [debouncedProcessQueue]);

  // Queue a label for sync
  const queueLabelSync = useCallback((label: Label) => {
    labelSyncQueueRef.current.set(label.id, label);
    debouncedProcessQueue();
  }, [debouncedProcessQueue]);

  // Queue a design for sync
  const queueDesignSync = useCallback((design: NoteDesign) => {
    designSyncQueueRef.current.set(design.id, design);
    debouncedProcessQueue();
  }, [debouncedProcessQueue]);

  // Delete note from Supabase (permanent delete)
  const deleteNoteFromDb = useCallback(
    async (noteId: string) => {
      if (!userIdRef.current) return;

      try {
        const { error } = await supabase.from('notes').delete().eq('id', noteId);
        if (error) {
          console.error('[SupabaseSync] Failed to delete note:', error);
        }
      } catch (error) {
        console.error('[SupabaseSync] Error deleting note:', error);
      }
    },
    [supabase]
  );

  // Delete label from Supabase
  const deleteLabelFromDb = useCallback(
    async (labelId: string) => {
      if (!userIdRef.current) return;

      try {
        const { error } = await supabase.from('labels').delete().eq('id', labelId);
        if (error) {
          console.error('[SupabaseSync] Failed to delete label:', error);
        }
      } catch (error) {
        console.error('[SupabaseSync] Error deleting label:', error);
      }
    },
    [supabase]
  );

  // Delete design from Supabase
  const deleteDesignFromDb = useCallback(
    async (designId: string) => {
      if (!userIdRef.current) return;

      try {
        const { error } = await supabase.from('designs').delete().eq('id', designId);
        if (error) {
          console.error('[SupabaseSync] Failed to delete design:', error);
        }
      } catch (error) {
        console.error('[SupabaseSync] Error deleting design:', error);
      }
    },
    [supabase]
  );

  // Subscribe to store changes
  useEffect(() => {
    let noteUnsubscribe: (() => void) | undefined;
    let designUnsubscribe: (() => void) | undefined;
    let mounted = true;

    // Get user ID first, then set up subscriptions
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!mounted) return;

      if (!user?.id) {
        console.error('[SupabaseSync] No authenticated user - sync disabled');
        return;
      }

      userIdRef.current = user.id;

      // Subscribe to note store changes (notes and labels)
      noteUnsubscribe = useNoteStore.subscribe((state, prevState) => {
        // Find notes that changed
        state.notes.forEach((note) => {
          const prevNote = prevState.notes.find((n) => n.id === note.id);
          if (!prevNote || note.updatedAt !== prevNote.updatedAt) {
            queueNoteSync(note);
          }
        });

        // Check for permanent note deletions
        prevState.notes.forEach((prevNote) => {
          if (!state.notes.find((n) => n.id === prevNote.id)) {
            deleteNoteFromDb(prevNote.id);
          }
        });

        // Find labels that changed
        state.labels.forEach((label) => {
          const prevLabel = prevState.labels.find((l) => l.id === label.id);
          if (!prevLabel) {
            // New label
            queueLabelSync(label);
          } else if (
            label.name !== prevLabel.name ||
            label.lastUsedAt !== prevLabel.lastUsedAt ||
            label.presetId !== prevLabel.presetId ||
            label.customDesignId !== prevLabel.customDesignId
          ) {
            // Updated label
            queueLabelSync(label);
          }
        });

        // Check for label deletions
        prevState.labels.forEach((prevLabel) => {
          if (!state.labels.find((l) => l.id === prevLabel.id)) {
            deleteLabelFromDb(prevLabel.id);
          }
        });
      });

      // Subscribe to design store changes
      designUnsubscribe = useDesignStore.subscribe((state, prevState) => {
        // Find designs that changed
        state.designs.forEach((design) => {
          const prevDesign = prevState.designs.find((d) => d.id === design.id);
          if (!prevDesign) {
            // New design
            queueDesignSync(design);
          } else if (
            design.name !== prevDesign.name ||
            design.designSummary !== prevDesign.designSummary
          ) {
            // Updated design
            queueDesignSync(design);
          }
        });

        // Check for design deletions
        prevState.designs.forEach((prevDesign) => {
          if (!state.designs.find((d) => d.id === prevDesign.id)) {
            deleteDesignFromDb(prevDesign.id);
          }
        });
      });
    });

    return () => {
      mounted = false;
      noteUnsubscribe?.();
      designUnsubscribe?.();
    };
  }, [
    supabase,
    queueNoteSync,
    queueLabelSync,
    queueDesignSync,
    deleteNoteFromDb,
    deleteLabelFromDb,
    deleteDesignFromDb,
  ]);

  return {
    queueNoteSync,
    queueLabelSync,
    queueDesignSync,
    deleteNoteFromDb,
    deleteLabelFromDb,
    deleteDesignFromDb,
  };
}
