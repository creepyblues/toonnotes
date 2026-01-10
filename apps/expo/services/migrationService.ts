/**
 * Migration Service
 *
 * Handles migration of local data to Supabase cloud when users first sign in.
 * Supports:
 * - Local to cloud migration
 * - Checking for existing cloud data
 * - Conflict detection
 */

import { supabase } from './supabase';
import { useNoteStore } from '@/stores/noteStore';
import { useUserStore } from '@/stores/userStore';
import { useDesignStore } from '@/stores/designStore';
import { useBoardStore } from '@/stores/boardStore';
import { useLabelStore } from '@/stores/labelStore';
import { Note, Label, NoteDesign, Board } from '@/types';

export interface MigrationResult {
  success: boolean;
  migratedCounts: {
    notes: number;
    labels: number;
    designs: number;
    boards: number;
  };
  errors: string[];
}

/**
 * Migrate all local data to Supabase cloud
 */
export async function migrateLocalDataToCloud(userId: string): Promise<MigrationResult> {
  const errors: string[] = [];
  const migratedCounts = { notes: 0, labels: 0, designs: 0, boards: 0 };

  try {
    // Get current local data from stores
    const noteStore = useNoteStore.getState();
    const userStore = useUserStore.getState();
    const designStore = useDesignStore.getState();
    const boardStore = useBoardStore.getState();
    const labelStore = useLabelStore.getState();

    console.log('[Migration] Starting migration for user:', userId);
    console.log('[Migration] Local data:', {
      notes: noteStore.notes.length,
      labels: labelStore.labels.length,
      designs: designStore.designs.length,
      boards: boardStore.boards.length,
    });

    // 1. Migrate user profile/settings
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      free_designs_used: userStore.user.freeDesignsUsed,
      coin_balance: userStore.user.coinBalance,
      has_completed_welcome: userStore.onboarding.hasCompletedWelcome,
      seen_coach_marks: userStore.onboarding.seenCoachMarks,
      onboarding_version: userStore.onboarding.onboardingVersion,
      notes_created_count: userStore.onboarding.notesCreatedCount,
      dark_mode: userStore.settings.darkMode,
      default_note_color: userStore.settings.defaultNoteColor,
    });

    if (profileError) {
      console.error('[Migration] Profile error:', profileError);
      errors.push(`Profile: ${profileError.message}`);
    }

    // 2. Migrate labels
    if (labelStore.labels.length > 0) {
      const labelsToInsert = labelStore.labels.map((label) => ({
        id: label.id,
        user_id: userId,
        name: label.name,
        preset_id: label.presetId || null,
        custom_design_id: label.customDesignId || null,
        is_system_label: label.isSystemLabel || false,
        last_used_at: label.lastUsedAt
          ? new Date(label.lastUsedAt).toISOString()
          : null,
        created_at: new Date(label.createdAt).toISOString(),
      }));

      const { error: labelsError } = await supabase
        .from('labels')
        .upsert(labelsToInsert, { onConflict: 'id' });

      if (labelsError) {
        console.error('[Migration] Labels error:', labelsError);
        errors.push(`Labels: ${labelsError.message}`);
      } else {
        migratedCounts.labels = labelsToInsert.length;
      }
    }

    // 3. Migrate notes
    if (noteStore.notes.length > 0) {
      const notesToInsert = noteStore.notes.map((note) => ({
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
        deleted_at: note.deletedAt
          ? new Date(note.deletedAt).toISOString()
          : null,
        created_at: new Date(note.createdAt).toISOString(),
        updated_at: new Date(note.updatedAt).toISOString(),
      }));

      const { error: notesError } = await supabase
        .from('notes')
        .upsert(notesToInsert, { onConflict: 'id' });

      if (notesError) {
        console.error('[Migration] Notes error:', notesError);
        errors.push(`Notes: ${notesError.message}`);
      } else {
        migratedCounts.notes = notesToInsert.length;
      }
    }

    // 4. Migrate designs (user-created only, not system presets)
    if (designStore.designs.length > 0) {
      const designsToInsert = designStore.designs.map((design) => ({
        id: design.id,
        user_id: userId,
        name: design.name,
        source_image_uri: design.sourceImageUri,
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
      }));

      const { error: designsError } = await supabase
        .from('designs')
        .upsert(designsToInsert, { onConflict: 'id' });

      if (designsError) {
        console.error('[Migration] Designs error:', designsError);
        errors.push(`Designs: ${designsError.message}`);
      } else {
        migratedCounts.designs = designsToInsert.length;
      }
    }

    // 5. Migrate boards
    if (boardStore.boards.length > 0) {
      const boardsToInsert = boardStore.boards.map((board) => ({
        id: board.id,
        user_id: userId,
        hashtag: board.hashtag,
        custom_style: board.customStyle || null,
        board_design_id: board.boardDesignId || null,
        created_at: new Date(board.createdAt).toISOString(),
        updated_at: new Date(board.updatedAt).toISOString(),
      }));

      const { error: boardsError } = await supabase
        .from('boards')
        .upsert(boardsToInsert, { onConflict: 'id' });

      if (boardsError) {
        console.error('[Migration] Boards error:', boardsError);
        errors.push(`Boards: ${boardsError.message}`);
      } else {
        migratedCounts.boards = boardsToInsert.length;
      }
    }

    console.log('[Migration] Complete:', migratedCounts);

    return {
      success: errors.length === 0,
      migratedCounts,
      errors,
    };
  } catch (error) {
    console.error('[Migration] Unexpected error:', error);
    return {
      success: false,
      migratedCounts,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

/**
 * Check if user has existing data in the cloud
 */
export async function hasCloudData(userId: string): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('[Migration] Error checking cloud data:', error);
      return false;
    }

    return (count ?? 0) > 0;
  } catch (error) {
    console.error('[Migration] Error checking cloud data:', error);
    return false;
  }
}

/**
 * Check if user has local data to migrate
 */
export function hasLocalData(): boolean {
  const noteStore = useNoteStore.getState();
  return noteStore.notes.length > 0;
}

/**
 * Get count of local items
 */
export function getLocalDataCounts(): {
  notes: number;
  labels: number;
  designs: number;
  boards: number;
} {
  const noteStore = useNoteStore.getState();
  const designStore = useDesignStore.getState();
  const boardStore = useBoardStore.getState();
  const labelStore = useLabelStore.getState();

  return {
    notes: noteStore.notes.length,
    labels: labelStore.labels.length,
    designs: designStore.designs.length,
    boards: boardStore.boards.length,
  };
}

/**
 * Migrate notes with labels to have associated preset designs.
 * This is a local-only migration for notes that were created before
 * the auto-apply design feature was added to addNote().
 */
export function migrateNotesWithLabelsToDesigns(): number {
  // Import at runtime to avoid circular dependencies
  const { normalizeLabel } = require('@/utils/labelNormalization');
  const { getPresetForLabel } = require('@/constants/labelPresets');

  const noteStore = useNoteStore.getState();
  let migratedCount = 0;

  for (const note of noteStore.notes) {
    // Skip if note already has a design or no labels
    if (note.designId || note.labels.length === 0) continue;

    // Find first label with a preset
    for (const label of note.labels) {
      const normalizedName = normalizeLabel(label);
      const preset = getPresetForLabel(normalizedName);
      if (preset) {
        noteStore.updateNote(note.id, {
          designId: `label-preset-${preset.id}`,
          activeDesignLabelId: normalizedName,
        });
        migratedCount++;
        break;
      }
    }
  }

  if (migratedCount > 0) {
    console.log(`[Migration] Applied designs to ${migratedCount} notes with labels`);
  }

  return migratedCount;
}
