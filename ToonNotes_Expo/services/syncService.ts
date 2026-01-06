/**
 * Sync Service
 *
 * Handles bidirectional synchronization between local store and Supabase cloud.
 * Uses "last write wins" conflict resolution strategy.
 */

import { supabase } from './supabase';
import { useNoteStore } from '@/stores/noteStore';
import { useUserStore } from '@/stores/userStore';
import { Note } from '@/types';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Check if user can sync (requires Pro subscription)
 */
function canSync(): boolean {
  const { isPro } = useUserStore.getState();
  return isPro();
}

type ConflictStrategy = 'cloud_wins' | 'local_wins' | 'latest_wins';

interface SyncOptions {
  conflictStrategy?: ConflictStrategy;
}

interface SyncResult {
  uploaded: number;
  downloaded: number;
  errors: string[];
}

/**
 * Sync notes between local store and cloud
 * Requires Pro subscription - returns early if user is not Pro
 */
export async function syncNotes(
  userId: string,
  options: SyncOptions = { conflictStrategy: 'latest_wins' }
): Promise<SyncResult> {
  const result: SyncResult = { uploaded: 0, downloaded: 0, errors: [] };

  // Check Pro subscription status
  if (!canSync()) {
    console.log('[Sync] User is not Pro, skipping cloud sync');
    return result;
  }

  try {
    const localNotes = useNoteStore.getState().notes;

    // Fetch cloud notes
    const { data: cloudNotes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      result.errors.push(`Fetch error: ${error.message}`);
      return result;
    }

    const cloudNotesMap = new Map(cloudNotes?.map((n) => [n.id, n]) ?? []);
    const localNotesMap = new Map(localNotes.map((n) => [n.id, n]));

    const toUpload: Note[] = [];
    const toDownload: Note[] = [];

    // Process local notes
    for (const [id, localNote] of localNotesMap) {
      const cloudNote = cloudNotesMap.get(id);

      if (!cloudNote) {
        // Only exists locally, upload it
        toUpload.push(localNote);
      } else {
        // Exists in both, resolve conflict
        const localTime = localNote.updatedAt;
        const cloudTime = new Date(cloudNote.updated_at).getTime();

        if (options.conflictStrategy === 'latest_wins') {
          if (localTime > cloudTime) {
            toUpload.push(localNote);
          } else if (cloudTime > localTime) {
            toDownload.push(mapCloudToLocal(cloudNote));
          }
          // If equal, no action needed
        } else if (options.conflictStrategy === 'local_wins') {
          if (localTime !== cloudTime) {
            toUpload.push(localNote);
          }
        } else if (options.conflictStrategy === 'cloud_wins') {
          if (localTime !== cloudTime) {
            toDownload.push(mapCloudToLocal(cloudNote));
          }
        }
      }
    }

    // Find notes only in cloud
    for (const [id, cloudNote] of cloudNotesMap) {
      if (!localNotesMap.has(id)) {
        toDownload.push(mapCloudToLocal(cloudNote));
      }
    }

    console.log('[Sync] To upload:', toUpload.length, 'To download:', toDownload.length);

    // Upload local changes
    if (toUpload.length > 0) {
      const { error: uploadError } = await supabase
        .from('notes')
        .upsert(toUpload.map((n) => mapLocalToCloud(n, userId)));

      if (uploadError) {
        result.errors.push(`Upload error: ${uploadError.message}`);
      } else {
        result.uploaded = toUpload.length;
      }
    }

    // Download cloud changes to local store
    if (toDownload.length > 0) {
      const noteStore = useNoteStore.getState();
      const newNotes: Note[] = [];

      for (const note of toDownload) {
        // Check if note exists locally
        const existingNote = noteStore.notes.find((n) => n.id === note.id);
        if (existingNote) {
          noteStore.updateNote(note.id, note);
        } else {
          // Collect new notes to add
          newNotes.push(note);
        }
      }

      // Add all new notes at once using setState (triggers re-render)
      if (newNotes.length > 0) {
        useNoteStore.setState((state) => ({
          notes: [...newNotes, ...state.notes]
        }));
      }

      result.downloaded = toDownload.length;
    }

    return result;
  } catch (error) {
    result.errors.push(
      error instanceof Error ? error.message : 'Unknown sync error'
    );
    return result;
  }
}

/**
 * Map cloud note schema to local Note type
 */
function mapCloudToLocal(cloudNote: any): Note {
  return {
    id: cloudNote.id,
    title: cloudNote.title || '',
    content: cloudNote.content || '',
    labels: cloudNote.labels || [],
    color: cloudNote.color || '#FFFFFF',
    designId: cloudNote.design_id || undefined,
    activeDesignLabelId: cloudNote.active_design_label_id || undefined,
    backgroundOverride: cloudNote.background_override || undefined,
    typographyPosterUri: cloudNote.typography_poster_uri || undefined,
    characterMascotUri: cloudNote.character_mascot_uri || undefined,
    images: cloudNote.images || [],
    isPinned: cloudNote.is_pinned || false,
    isArchived: cloudNote.is_archived || false,
    isDeleted: cloudNote.is_deleted || false,
    deletedAt: cloudNote.deleted_at
      ? new Date(cloudNote.deleted_at).getTime()
      : undefined,
    createdAt: new Date(cloudNote.created_at).getTime(),
    updatedAt: new Date(cloudNote.updated_at).getTime(),
  };
}

/**
 * Map local Note type to cloud schema
 */
function mapLocalToCloud(note: Note, userId: string): any {
  return {
    id: note.id,
    user_id: userId,
    title: note.title,
    content: note.content,
    labels: note.labels,
    color: note.color,
    design_id: note.designId || null,
    active_design_label_id: note.activeDesignLabelId || null,
    background_override: note.backgroundOverride || null,
    typography_poster_uri: note.typographyPosterUri || null,
    character_mascot_uri: note.characterMascotUri || null,
    images: note.images || [],
    is_pinned: note.isPinned,
    is_archived: note.isArchived,
    is_deleted: note.isDeleted,
    deleted_at: note.deletedAt ? new Date(note.deletedAt).toISOString() : null,
    created_at: new Date(note.createdAt).toISOString(),
    updated_at: new Date(note.updatedAt).toISOString(),
  };
}

/**
 * Subscribe to real-time note changes
 * Returns the channel for cleanup
 */
export function subscribeToNotes(
  userId: string,
  onUpdate: (note: Note) => void,
  onDelete?: (noteId: string) => void
): RealtimeChannel {
  console.log('[Sync] Setting up real-time subscription for user:', userId);

  const channel = supabase
    .channel('notes-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notes',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('[Sync] Realtime event:', payload.eventType);

        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          onUpdate(mapCloudToLocal(payload.new));
        } else if (payload.eventType === 'DELETE' && onDelete) {
          onDelete(payload.old.id);
        }
      }
    )
    .subscribe();

  return channel;
}

/**
 * Unsubscribe from real-time changes
 */
export async function unsubscribeFromNotes(channel: RealtimeChannel): Promise<void> {
  await supabase.removeChannel(channel);
}

/**
 * Upload a single note to cloud (for immediate sync on save)
 */
export async function uploadNote(note: Note, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notes')
      .upsert(mapLocalToCloud(note, userId));

    if (error) {
      console.error('[Sync] Error uploading note:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Sync] Error uploading note:', error);
    return false;
  }
}

/**
 * Delete a note from cloud
 */
export async function deleteNoteFromCloud(noteId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('notes').delete().eq('id', noteId);

    if (error) {
      console.error('[Sync] Error deleting note:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Sync] Error deleting note:', error);
    return false;
  }
}

/**
 * Fetch all notes from cloud
 */
export async function fetchNotesFromCloud(userId: string): Promise<Note[]> {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[Sync] Error fetching notes:', error);
      return [];
    }

    return (data || []).map(mapCloudToLocal);
  } catch (error) {
    console.error('[Sync] Error fetching notes:', error);
    return [];
  }
}
