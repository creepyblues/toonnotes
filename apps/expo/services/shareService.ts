/**
 * Share Service - Manages shareable note links via Supabase
 *
 * Creates unique share tokens that allow anonymous viewing of notes
 * on the ToonNotes website (toonnotes.com/note/{token})
 */

import { supabase } from './supabase';
import { uploadNote } from './syncService';
import { Note } from '@/types';

// Base URL for shareable links (hardcoded production domain)
const SHARE_BASE_URL = 'https://toonnotes.com/note';

export interface ShareLinkResult {
  shareToken: string;
  shareUrl: string;
  isNew: boolean;
}

export interface ShareStatus {
  noteId: string;
  shareToken: string;
  shareUrl: string;
}

/**
 * Create or get existing share link for a note
 *
 * Flow:
 * 1. Check if share link already exists for this note
 * 2. If exists, return existing link
 * 3. If not, create new share token and insert into shared_notes
 */
export async function createShareLink(
  note: Note,
  userId: string
): Promise<ShareLinkResult | null> {
  try {
    // First, ensure the note is synced to cloud
    const syncSuccess = await uploadNote(note, userId);
    if (!syncSuccess) {
      console.error('[ShareService] Failed to sync note to cloud');
      return null;
    }

    // Check for existing share link
    const existing = await getExistingShareLink(note.id);
    if (existing) {
      return {
        shareToken: existing,
        shareUrl: `${SHARE_BASE_URL}/${existing}`,
        isNew: false,
      };
    }

    // Generate a new share token using Supabase function
    const { data: tokenData, error: tokenError } = await supabase.rpc(
      'generate_share_token'
    );

    if (tokenError || !tokenData) {
      console.error('[ShareService] Failed to generate share token:', tokenError);
      // Fallback: generate token client-side
      const fallbackToken = generateClientToken();
      return await insertShareLink(note.id, userId, fallbackToken);
    }

    return await insertShareLink(note.id, userId, tokenData);
  } catch (error) {
    console.error('[ShareService] Error creating share link:', error);
    return null;
  }
}

/**
 * Insert a new share link into the database
 */
async function insertShareLink(
  noteId: string,
  userId: string,
  shareToken: string
): Promise<ShareLinkResult | null> {
  const { error } = await supabase.from('shared_notes').insert({
    note_id: noteId,
    share_token: shareToken,
    created_by: userId,
    is_active: true,
  });

  if (error) {
    console.error('[ShareService] Failed to insert share link:', error);
    return null;
  }

  return {
    shareToken,
    shareUrl: `${SHARE_BASE_URL}/${shareToken}`,
    isNew: true,
  };
}

/**
 * Get existing share link for a note (if any)
 */
export async function getExistingShareLink(
  noteId: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('shared_notes')
      .select('share_token')
      .eq('note_id', noteId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('[ShareService] Error fetching existing share link:', error);
      return null;
    }

    return data?.share_token || null;
  } catch (error) {
    console.error('[ShareService] Error in getExistingShareLink:', error);
    return null;
  }
}

/**
 * Revoke (deactivate) a share link for a note
 */
export async function revokeShareLink(
  noteId: string,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('shared_notes')
      .update({ is_active: false })
      .eq('note_id', noteId)
      .eq('created_by', userId);

    if (error) {
      console.error('[ShareService] Error revoking share link:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[ShareService] Error in revokeShareLink:', error);
    return false;
  }
}

/**
 * Check if a note has an active share link
 */
export async function hasActiveShareLink(noteId: string): Promise<boolean> {
  const token = await getExistingShareLink(noteId);
  return token !== null;
}

/**
 * Get share analytics for a note
 */
export async function getShareAnalytics(
  noteId: string
): Promise<{ viewCount: number; lastViewedAt: Date | null } | null> {
  try {
    const { data, error } = await supabase
      .from('shared_notes')
      .select('view_count, last_viewed_at')
      .eq('note_id', noteId)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      viewCount: data.view_count || 0,
      lastViewedAt: data.last_viewed_at ? new Date(data.last_viewed_at) : null,
    };
  } catch (error) {
    console.error('[ShareService] Error fetching share analytics:', error);
    return null;
  }
}

/**
 * Get share status for multiple notes in a single query
 * Returns a Map for O(1) lookup by noteId
 */
export async function getShareStatusBatch(
  noteIds: string[]
): Promise<Map<string, ShareStatus>> {
  const statusMap = new Map<string, ShareStatus>();

  if (noteIds.length === 0) {
    return statusMap;
  }

  try {
    const { data, error } = await supabase.rpc('get_share_status_batch', {
      p_note_ids: noteIds,
    });

    if (error) {
      console.error('[ShareService] Error fetching batch share status:', error);
      return statusMap;
    }

    if (data) {
      for (const row of data) {
        statusMap.set(row.note_id, {
          noteId: row.note_id,
          shareToken: row.share_token,
          shareUrl: `${SHARE_BASE_URL}/${row.share_token}`,
        });
      }
    }

    return statusMap;
  } catch (error) {
    console.error('[ShareService] Error in getShareStatusBatch:', error);
    return statusMap;
  }
}

/**
 * Generate a URL-safe token client-side (fallback)
 * Creates a 12-character base64url token
 */
function generateClientToken(): string {
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);

  // Convert to base64url (URL-safe)
  let base64 = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = bytes[i + 1] || 0;
    const c = bytes[i + 2] || 0;

    base64 += chars[a >> 2];
    base64 += chars[((a & 3) << 4) | (b >> 4)];
    base64 += chars[((b & 15) << 2) | (c >> 6)];
    base64 += chars[c & 63];
  }

  return base64.slice(0, 12);
}
