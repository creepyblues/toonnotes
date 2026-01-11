'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useNoteStore, useDesignStore, useUIStore } from '@/stores';
import { createClient } from '@/lib/supabase/client';
import { Note, Label, NoteDesign, NoteColor } from '@toonnotes/types';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

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
    editor_mode: note.editorMode || 'plain',
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

// Database record types
interface DbNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  labels: string[];
  color: string;
  editor_mode?: string;
  design_id?: string;
  active_design_label_id?: string;
  is_pinned: boolean;
  is_archived: boolean;
  is_deleted: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

interface DbLabel {
  id: string;
  user_id: string;
  name: string;
  preset_id?: string;
  custom_design_id?: string;
  is_system_label?: boolean;
  created_at: string;
  last_used_at?: string;
}

// Convert database Note to app format
function dbNoteToNote(dbNote: DbNote): Note {
  return {
    id: dbNote.id,
    title: dbNote.title,
    content: dbNote.content,
    labels: dbNote.labels || [],
    color: (dbNote.color as NoteColor) || NoteColor.White,
    editorMode: dbNote.editor_mode as Note['editorMode'],
    designId: dbNote.design_id || undefined,
    activeDesignLabelId: dbNote.active_design_label_id || undefined,
    isPinned: dbNote.is_pinned,
    isArchived: dbNote.is_archived,
    isDeleted: dbNote.is_deleted,
    deletedAt: dbNote.deleted_at ? new Date(dbNote.deleted_at).getTime() : undefined,
    createdAt: new Date(dbNote.created_at).getTime(),
    updatedAt: new Date(dbNote.updated_at).getTime(),
  };
}

// Convert database Label to app format
function dbLabelToLabel(dbLabel: DbLabel): Label {
  return {
    id: dbLabel.id,
    name: dbLabel.name,
    presetId: dbLabel.preset_id || undefined,
    customDesignId: dbLabel.custom_design_id || undefined,
    isSystemLabel: dbLabel.is_system_label || false,
    createdAt: new Date(dbLabel.created_at).getTime(),
    lastUsedAt: dbLabel.last_used_at ? new Date(dbLabel.last_used_at).getTime() : undefined,
  };
}

export function useSupabaseSync() {
  const supabase = createClient();
  const userIdRef = useRef<string | null>(null);
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);

  // Track IDs of items we're currently syncing to avoid feedback loops
  const syncingNoteIdsRef = useRef<Set<string>>(new Set());
  const syncingLabelIdsRef = useRef<Set<string>>(new Set());

  // UI Store for sync status
  const setSyncStatus = useUIStore((state) => state.setSyncStatus);
  const setLastSyncedAt = useUIStore((state) => state.setLastSyncedAt);
  const setSyncError = useUIStore((state) => state.setSyncError);
  const setRealtimeConnected = useUIStore((state) => state.setRealtimeConnected);

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
    setSyncStatus('syncing');

    // Track IDs being synced to prevent feedback loop from realtime
    notesToSync.forEach((n) => syncingNoteIdsRef.current.add(n.id));
    labelsToSync.forEach((l) => syncingLabelIdsRef.current.add(l.id));

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
          setSyncError(error.message);
          setSyncStatus('error');
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
          setSyncError(error.message);
          setSyncStatus('error');
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
          setSyncError(error.message);
          setSyncStatus('error');
        }
      }

      // Success
      setLastSyncedAt(Date.now());
      setSyncError(null);
      setSyncStatus('synced');
    } catch (error) {
      console.error('[SupabaseSync] Error during sync:', error);
      setSyncError(error instanceof Error ? error.message : 'Unknown error');
      setSyncStatus('error');
    } finally {
      isSyncingRef.current = false;

      // Clear syncing IDs after a short delay to allow realtime to settle
      setTimeout(() => {
        notesToSync.forEach((n) => syncingNoteIdsRef.current.delete(n.id));
        labelsToSync.forEach((l) => syncingLabelIdsRef.current.delete(l.id));
      }, 500);

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
  }, [supabase, setSyncStatus, setLastSyncedAt, setSyncError]);

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

  // Set up Realtime subscriptions for incoming changes from other clients
  useEffect(() => {
    let mounted = true;

    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted || !user?.id) return;

      const userId = user.id;

      // Clean up existing channel
      if (realtimeChannelRef.current) {
        await supabase.removeChannel(realtimeChannelRef.current);
      }

      // Create a new channel for realtime updates
      const channel = supabase
        .channel(`user-${userId}-sync`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notes',
            filter: `user_id=eq.${userId}`,
          },
          (payload: RealtimePostgresChangesPayload<DbNote>) => {
            // Skip if we just synced this item (to prevent feedback loop)
            const noteId = (payload.new as DbNote)?.id || (payload.old as { id?: string })?.id;
            if (noteId && syncingNoteIdsRef.current.has(noteId)) {
              return;
            }

            handleNoteChange(payload);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'labels',
            filter: `user_id=eq.${userId}`,
          },
          (payload: RealtimePostgresChangesPayload<DbLabel>) => {
            // Skip if we just synced this item
            const labelId = (payload.new as DbLabel)?.id || (payload.old as { id?: string })?.id;
            if (labelId && syncingLabelIdsRef.current.has(labelId)) {
              return;
            }

            handleLabelChange(payload);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setRealtimeConnected(true);
            console.log('[SupabaseSync] Realtime connected');
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            setRealtimeConnected(false);
            console.log('[SupabaseSync] Realtime disconnected:', status);
          }
        });

      realtimeChannelRef.current = channel;
    };

    // Handle incoming note changes
    const handleNoteChange = (payload: RealtimePostgresChangesPayload<DbNote>) => {
      const noteStore = useNoteStore.getState();

      if (payload.eventType === 'INSERT') {
        const dbNote = payload.new as DbNote;
        const note = dbNoteToNote(dbNote);

        // Only add if we don't already have this note
        if (!noteStore.getNoteById(note.id)) {
          noteStore.setNotes([note, ...noteStore.notes]);
          console.log('[SupabaseSync] Realtime INSERT note:', note.id);
        }
      } else if (payload.eventType === 'UPDATE') {
        const dbNote = payload.new as DbNote;
        const note = dbNoteToNote(dbNote);
        const existingNote = noteStore.getNoteById(note.id);

        // Last-write-wins: update if incoming is newer
        if (!existingNote || note.updatedAt >= existingNote.updatedAt) {
          noteStore.setNotes(
            noteStore.notes.map((n) => (n.id === note.id ? note : n))
          );
          console.log('[SupabaseSync] Realtime UPDATE note:', note.id);
        }
      } else if (payload.eventType === 'DELETE') {
        const oldNote = payload.old as { id?: string };
        if (oldNote?.id) {
          noteStore.setNotes(noteStore.notes.filter((n) => n.id !== oldNote.id));
          console.log('[SupabaseSync] Realtime DELETE note:', oldNote.id);
        }
      }
    };

    // Handle incoming label changes
    const handleLabelChange = (payload: RealtimePostgresChangesPayload<DbLabel>) => {
      const noteStore = useNoteStore.getState();

      if (payload.eventType === 'INSERT') {
        const dbLabel = payload.new as DbLabel;
        const label = dbLabelToLabel(dbLabel);

        // Only add if we don't already have this label
        if (!noteStore.labels.find((l) => l.id === label.id)) {
          noteStore.setLabels([...noteStore.labels, label]);
          console.log('[SupabaseSync] Realtime INSERT label:', label.id);
        }
      } else if (payload.eventType === 'UPDATE') {
        const dbLabel = payload.new as DbLabel;
        const label = dbLabelToLabel(dbLabel);

        noteStore.setLabels(
          noteStore.labels.map((l) => (l.id === label.id ? label : l))
        );
        console.log('[SupabaseSync] Realtime UPDATE label:', label.id);
      } else if (payload.eventType === 'DELETE') {
        const oldLabel = payload.old as { id?: string };
        if (oldLabel?.id) {
          noteStore.setLabels(noteStore.labels.filter((l) => l.id !== oldLabel.id));
          console.log('[SupabaseSync] Realtime DELETE label:', oldLabel.id);
        }
      }
    };

    setupRealtimeSubscription();

    return () => {
      mounted = false;
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
      setRealtimeConnected(false);
    };
  }, [supabase, setRealtimeConnected]);

  return {
    queueNoteSync,
    queueLabelSync,
    queueDesignSync,
    deleteNoteFromDb,
    deleteLabelFromDb,
    deleteDesignFromDb,
  };
}
