/**
 * Sync Service
 *
 * Handles bidirectional synchronization between local store and Supabase cloud.
 * Uses "last write wins" conflict resolution strategy.
 *
 * Syncs: Notes, Designs, Boards, Labels (Pro users only)
 */

import { supabase } from './supabase';
import { useNoteStore } from '@/stores/noteStore';
import { useUserStore } from '@/stores/userStore';
import { useDesignStore } from '@/stores/designStore';
import { useBoardStore } from '@/stores/boardStore';
import { useLabelStore } from '@/stores/labelStore';
import { Note, NoteDesign, Board, Label } from '@/types';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Check if user can sync (requires Pro subscription)
 */
function canSync(): boolean {
  const { isPro } = useUserStore.getState();
  return isPro();
}

/**
 * Check if a string is a valid UUID format
 */
function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
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

// ============================================
// DESIGN SYNC
// ============================================

/**
 * Map cloud design schema to local NoteDesign type
 */
function mapDesignCloudToLocal(cloudDesign: any): NoteDesign {
  return {
    id: cloudDesign.id,
    name: cloudDesign.name || '',
    sourceImageUri: cloudDesign.source_image_uri || '',
    createdAt: new Date(cloudDesign.created_at).getTime(),
    background: cloudDesign.background || {
      primaryColor: '#FFFFFF',
      style: 'solid',
    },
    colors: cloudDesign.colors || {
      titleText: '#000000',
      bodyText: '#333333',
      accent: '#6366F1',
    },
    typography: cloudDesign.typography || {
      titleStyle: 'sans-serif',
      vibe: 'modern',
    },
    sticker: cloudDesign.sticker || {
      id: '',
      imageUri: '',
      description: '',
      suggestedPosition: 'top-right',
      scale: 'medium',
    },
    designSummary: cloudDesign.design_summary || '',
    vibe: cloudDesign.vibe || undefined,
    isLucky: cloudDesign.is_lucky || false,
    labelPresetId: cloudDesign.label_preset_id || undefined,
    isLabelPreset: cloudDesign.is_label_preset || false,
  };
}

/**
 * Map local NoteDesign type to cloud schema
 */
function mapDesignLocalToCloud(design: NoteDesign, userId: string): any {
  return {
    id: design.id,
    user_id: userId,
    name: design.name,
    source_image_uri: design.sourceImageUri || null,
    background: design.background,
    colors: design.colors,
    typography: design.typography,
    sticker: design.sticker || null,
    design_summary: design.designSummary || null,
    vibe: design.vibe || null,
    is_lucky: design.isLucky || false,
    label_preset_id: design.labelPresetId || null,
    is_label_preset: design.isLabelPreset || false,
    created_at: new Date(design.createdAt).toISOString(),
  };
}

/**
 * Sync designs between local store and cloud
 */
export async function syncDesigns(
  userId: string,
  options: SyncOptions = { conflictStrategy: 'latest_wins' }
): Promise<SyncResult> {
  const result: SyncResult = { uploaded: 0, downloaded: 0, errors: [] };

  if (!canSync()) {
    console.log('[Sync] User is not Pro, skipping design sync');
    return result;
  }

  try {
    // Filter out designs with invalid UUIDs (legacy custom-* IDs)
    const allLocalDesigns = useDesignStore.getState().designs;
    const localDesigns = allLocalDesigns.filter((d) => {
      if (!isValidUUID(d.id)) {
        console.log('[Sync] Skipping design with invalid UUID:', d.id);
        return false;
      }
      return true;
    });

    const { data: cloudDesigns, error } = await supabase
      .from('designs')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      result.errors.push(`Fetch designs error: ${error.message}`);
      return result;
    }

    const cloudDesignsMap = new Map(cloudDesigns?.map((d) => [d.id, d]) ?? []);
    const localDesignsMap = new Map(localDesigns.map((d) => [d.id, d]));

    const toUpload: NoteDesign[] = [];
    const toDownload: NoteDesign[] = [];

    // Process local designs
    for (const [id, localDesign] of localDesignsMap) {
      const cloudDesign = cloudDesignsMap.get(id);

      if (!cloudDesign) {
        toUpload.push(localDesign);
      } else {
        const localTime = localDesign.createdAt;
        const cloudTime = new Date(cloudDesign.created_at).getTime();

        if (options.conflictStrategy === 'latest_wins') {
          if (localTime > cloudTime) {
            toUpload.push(localDesign);
          } else if (cloudTime > localTime) {
            toDownload.push(mapDesignCloudToLocal(cloudDesign));
          }
        } else if (options.conflictStrategy === 'local_wins') {
          if (localTime !== cloudTime) {
            toUpload.push(localDesign);
          }
        } else if (options.conflictStrategy === 'cloud_wins') {
          if (localTime !== cloudTime) {
            toDownload.push(mapDesignCloudToLocal(cloudDesign));
          }
        }
      }
    }

    // Find designs only in cloud
    for (const [id, cloudDesign] of cloudDesignsMap) {
      if (!localDesignsMap.has(id)) {
        toDownload.push(mapDesignCloudToLocal(cloudDesign));
      }
    }

    console.log('[Sync] Designs - To upload:', toUpload.length, 'To download:', toDownload.length);

    // Upload local changes
    if (toUpload.length > 0) {
      const { error: uploadError } = await supabase
        .from('designs')
        .upsert(toUpload.map((d) => mapDesignLocalToCloud(d, userId)));

      if (uploadError) {
        result.errors.push(`Upload designs error: ${uploadError.message}`);
      } else {
        result.uploaded = toUpload.length;
      }
    }

    // Download cloud changes to local store
    if (toDownload.length > 0) {
      const designStore = useDesignStore.getState();

      for (const design of toDownload) {
        const existingDesign = designStore.designs.find((d) => d.id === design.id);
        if (existingDesign) {
          designStore.updateDesign(design.id, design);
        } else {
          useDesignStore.setState((state) => ({
            designs: [design, ...state.designs],
          }));
        }
      }

      result.downloaded = toDownload.length;
    }

    return result;
  } catch (error) {
    result.errors.push(
      error instanceof Error ? error.message : 'Unknown design sync error'
    );
    return result;
  }
}

/**
 * Upload a single design to cloud
 */
export async function uploadDesign(design: NoteDesign, userId: string): Promise<boolean> {
  // Validate UUID before uploading
  if (!isValidUUID(design.id)) {
    console.log('[Sync] Skipping upload for design with invalid UUID:', design.id);
    return false;
  }

  try {
    const { error } = await supabase
      .from('designs')
      .upsert(mapDesignLocalToCloud(design, userId));

    if (error) {
      console.error('[Sync] Error uploading design:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Sync] Error uploading design:', error);
    return false;
  }
}

/**
 * Delete a design from cloud
 */
export async function deleteDesignFromCloud(designId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('designs').delete().eq('id', designId);

    if (error) {
      console.error('[Sync] Error deleting design:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Sync] Error deleting design:', error);
    return false;
  }
}

/**
 * Subscribe to real-time design changes
 */
export function subscribeToDesigns(
  userId: string,
  onUpdate: (design: NoteDesign) => void,
  onDelete?: (designId: string) => void
): RealtimeChannel {
  console.log('[Sync] Setting up real-time subscription for designs');

  const channel = supabase
    .channel('designs-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'designs',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('[Sync] Realtime design event:', payload.eventType);

        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          onUpdate(mapDesignCloudToLocal(payload.new));
        } else if (payload.eventType === 'DELETE' && onDelete) {
          onDelete(payload.old.id);
        }
      }
    )
    .subscribe();

  return channel;
}

// ============================================
// BOARD SYNC
// ============================================

/**
 * Map cloud board schema to local Board type
 */
function mapBoardCloudToLocal(cloudBoard: any): Board {
  return {
    id: cloudBoard.id,
    hashtag: cloudBoard.hashtag || '',
    customStyle: cloudBoard.custom_style || undefined,
    boardDesignId: cloudBoard.board_design_id || undefined,
    createdAt: new Date(cloudBoard.created_at).getTime(),
    updatedAt: new Date(cloudBoard.updated_at).getTime(),
  };
}

/**
 * Map local Board type to cloud schema
 */
function mapBoardLocalToCloud(board: Board, userId: string): any {
  return {
    id: board.id,
    user_id: userId,
    hashtag: board.hashtag,
    custom_style: board.customStyle || null,
    board_design_id: board.boardDesignId || null,
    created_at: new Date(board.createdAt).toISOString(),
    updated_at: new Date(board.updatedAt).toISOString(),
  };
}

/**
 * Sync boards between local store and cloud
 */
export async function syncBoards(
  userId: string,
  options: SyncOptions = { conflictStrategy: 'latest_wins' }
): Promise<SyncResult> {
  const result: SyncResult = { uploaded: 0, downloaded: 0, errors: [] };

  if (!canSync()) {
    console.log('[Sync] User is not Pro, skipping board sync');
    return result;
  }

  try {
    const localBoards = useBoardStore.getState().boards;

    const { data: cloudBoards, error } = await supabase
      .from('boards')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      result.errors.push(`Fetch boards error: ${error.message}`);
      return result;
    }

    const cloudBoardsMap = new Map(cloudBoards?.map((b) => [b.id, b]) ?? []);
    const localBoardsMap = new Map(localBoards.map((b) => [b.id, b]));

    const toUpload: Board[] = [];
    const toDownload: Board[] = [];

    // Process local boards
    for (const [id, localBoard] of localBoardsMap) {
      const cloudBoard = cloudBoardsMap.get(id);

      if (!cloudBoard) {
        toUpload.push(localBoard);
      } else {
        const localTime = localBoard.updatedAt;
        const cloudTime = new Date(cloudBoard.updated_at).getTime();

        if (options.conflictStrategy === 'latest_wins') {
          if (localTime > cloudTime) {
            toUpload.push(localBoard);
          } else if (cloudTime > localTime) {
            toDownload.push(mapBoardCloudToLocal(cloudBoard));
          }
        } else if (options.conflictStrategy === 'local_wins') {
          if (localTime !== cloudTime) {
            toUpload.push(localBoard);
          }
        } else if (options.conflictStrategy === 'cloud_wins') {
          if (localTime !== cloudTime) {
            toDownload.push(mapBoardCloudToLocal(cloudBoard));
          }
        }
      }
    }

    // Find boards only in cloud
    for (const [id, cloudBoard] of cloudBoardsMap) {
      if (!localBoardsMap.has(id)) {
        toDownload.push(mapBoardCloudToLocal(cloudBoard));
      }
    }

    console.log('[Sync] Boards - To upload:', toUpload.length, 'To download:', toDownload.length);

    // Upload local changes
    if (toUpload.length > 0) {
      const { error: uploadError } = await supabase
        .from('boards')
        .upsert(toUpload.map((b) => mapBoardLocalToCloud(b, userId)));

      if (uploadError) {
        result.errors.push(`Upload boards error: ${uploadError.message}`);
      } else {
        result.uploaded = toUpload.length;
      }
    }

    // Download cloud changes to local store
    if (toDownload.length > 0) {
      for (const board of toDownload) {
        const existingBoard = useBoardStore.getState().boards.find((b) => b.id === board.id);
        if (existingBoard) {
          // Update existing board
          useBoardStore.setState((state) => ({
            boards: state.boards.map((b) =>
              b.id === board.id ? board : b
            ),
          }));
        } else {
          // Add new board
          useBoardStore.setState((state) => ({
            boards: [...state.boards, board],
          }));
        }
      }

      result.downloaded = toDownload.length;
    }

    return result;
  } catch (error) {
    result.errors.push(
      error instanceof Error ? error.message : 'Unknown board sync error'
    );
    return result;
  }
}

/**
 * Upload a single board to cloud
 */
export async function uploadBoard(board: Board, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('boards')
      .upsert(mapBoardLocalToCloud(board, userId));

    if (error) {
      console.error('[Sync] Error uploading board:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Sync] Error uploading board:', error);
    return false;
  }
}

/**
 * Delete a board from cloud
 */
export async function deleteBoardFromCloud(boardId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('boards').delete().eq('id', boardId);

    if (error) {
      console.error('[Sync] Error deleting board:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Sync] Error deleting board:', error);
    return false;
  }
}

/**
 * Subscribe to real-time board changes
 */
export function subscribeToBoards(
  userId: string,
  onUpdate: (board: Board) => void,
  onDelete?: (boardId: string) => void
): RealtimeChannel {
  console.log('[Sync] Setting up real-time subscription for boards');

  const channel = supabase
    .channel('boards-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'boards',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('[Sync] Realtime board event:', payload.eventType);

        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          onUpdate(mapBoardCloudToLocal(payload.new));
        } else if (payload.eventType === 'DELETE' && onDelete) {
          onDelete(payload.old.id);
        }
      }
    )
    .subscribe();

  return channel;
}

// ============================================
// LABEL SYNC
// ============================================

/**
 * Map cloud label schema to local Label type
 */
function mapLabelCloudToLocal(cloudLabel: any): Label {
  return {
    id: cloudLabel.id,
    name: cloudLabel.name || '',
    presetId: cloudLabel.preset_id || undefined,
    customDesignId: cloudLabel.custom_design_id || undefined,
    isSystemLabel: cloudLabel.is_system_label || false,
    createdAt: new Date(cloudLabel.created_at).getTime(),
    lastUsedAt: cloudLabel.last_used_at
      ? new Date(cloudLabel.last_used_at).getTime()
      : undefined,
  };
}

/**
 * Map local Label type to cloud schema
 */
function mapLabelLocalToCloud(label: Label, userId: string): any {
  return {
    id: label.id,
    user_id: userId,
    name: label.name,
    preset_id: label.presetId || null,
    custom_design_id: label.customDesignId || null,
    is_system_label: label.isSystemLabel || false,
    created_at: new Date(label.createdAt).toISOString(),
    last_used_at: label.lastUsedAt
      ? new Date(label.lastUsedAt).toISOString()
      : null,
  };
}

/**
 * Sync labels between local store and cloud
 */
export async function syncLabels(
  userId: string,
  options: SyncOptions = { conflictStrategy: 'latest_wins' }
): Promise<SyncResult> {
  const result: SyncResult = { uploaded: 0, downloaded: 0, errors: [] };

  if (!canSync()) {
    console.log('[Sync] User is not Pro, skipping label sync');
    return result;
  }

  try {
    const localLabels = useLabelStore.getState().labels;

    const { data: cloudLabels, error } = await supabase
      .from('labels')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      result.errors.push(`Fetch labels error: ${error.message}`);
      return result;
    }

    const cloudLabelsMap = new Map(cloudLabels?.map((l) => [l.id, l]) ?? []);
    const localLabelsMap = new Map(localLabels.map((l) => [l.id, l]));

    const toUpload: Label[] = [];
    const toDownload: Label[] = [];

    // Process local labels
    for (const [id, localLabel] of localLabelsMap) {
      const cloudLabel = cloudLabelsMap.get(id);

      if (!cloudLabel) {
        toUpload.push(localLabel);
      } else {
        const localTime = localLabel.lastUsedAt || localLabel.createdAt;
        const cloudTime = cloudLabel.last_used_at
          ? new Date(cloudLabel.last_used_at).getTime()
          : new Date(cloudLabel.created_at).getTime();

        if (options.conflictStrategy === 'latest_wins') {
          if (localTime > cloudTime) {
            toUpload.push(localLabel);
          } else if (cloudTime > localTime) {
            toDownload.push(mapLabelCloudToLocal(cloudLabel));
          }
        } else if (options.conflictStrategy === 'local_wins') {
          if (localTime !== cloudTime) {
            toUpload.push(localLabel);
          }
        } else if (options.conflictStrategy === 'cloud_wins') {
          if (localTime !== cloudTime) {
            toDownload.push(mapLabelCloudToLocal(cloudLabel));
          }
        }
      }
    }

    // Find labels only in cloud
    for (const [id, cloudLabel] of cloudLabelsMap) {
      if (!localLabelsMap.has(id)) {
        toDownload.push(mapLabelCloudToLocal(cloudLabel));
      }
    }

    console.log('[Sync] Labels - To upload:', toUpload.length, 'To download:', toDownload.length);

    // Upload local changes
    if (toUpload.length > 0) {
      const { error: uploadError } = await supabase
        .from('labels')
        .upsert(toUpload.map((l) => mapLabelLocalToCloud(l, userId)));

      if (uploadError) {
        result.errors.push(`Upload labels error: ${uploadError.message}`);
      } else {
        result.uploaded = toUpload.length;
      }
    }

    // Download cloud changes to local store
    if (toDownload.length > 0) {
      for (const label of toDownload) {
        const existingLabel = useLabelStore.getState().labels.find((l) => l.id === label.id);
        if (existingLabel) {
          useLabelStore.getState().updateLabel(label.id, label);
        } else {
          useLabelStore.setState((state) => ({
            labels: [label, ...state.labels],
          }));
        }
      }

      result.downloaded = toDownload.length;
    }

    return result;
  } catch (error) {
    result.errors.push(
      error instanceof Error ? error.message : 'Unknown label sync error'
    );
    return result;
  }
}

/**
 * Upload a single label to cloud
 */
export async function uploadLabel(label: Label, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('labels')
      .upsert(mapLabelLocalToCloud(label, userId));

    if (error) {
      console.error('[Sync] Error uploading label:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Sync] Error uploading label:', error);
    return false;
  }
}

/**
 * Delete a label from cloud
 */
export async function deleteLabelFromCloud(labelId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('labels').delete().eq('id', labelId);

    if (error) {
      console.error('[Sync] Error deleting label:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Sync] Error deleting label:', error);
    return false;
  }
}

/**
 * Subscribe to real-time label changes
 */
export function subscribeToLabels(
  userId: string,
  onUpdate: (label: Label) => void,
  onDelete?: (labelId: string) => void
): RealtimeChannel {
  console.log('[Sync] Setting up real-time subscription for labels');

  const channel = supabase
    .channel('labels-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'labels',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('[Sync] Realtime label event:', payload.eventType);

        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          onUpdate(mapLabelCloudToLocal(payload.new));
        } else if (payload.eventType === 'DELETE' && onDelete) {
          onDelete(payload.old.id);
        }
      }
    )
    .subscribe();

  return channel;
}
