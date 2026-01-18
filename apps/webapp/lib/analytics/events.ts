/**
 * Analytics Events for Web
 *
 * Mirrors the mobile app's firebaseAnalytics.ts events for consistency.
 * Uses the same event names and parameters for unified GA4 reporting.
 */

import { logEvent, setUserProperties } from './firebase';

/**
 * Pre-built analytics functions for common events.
 * Uses Firebase recommended event names where applicable.
 */
export const Analytics = {
  // ============================================
  // NOTES
  // ============================================
  noteCreated: (noteId: string) =>
    logEvent('note_created', { note_id: noteId }),

  noteOpened: (noteId: string) =>
    logEvent('note_opened', { note_id: noteId }),

  noteEdited: (noteId: string) =>
    logEvent('note_edited', { note_id: noteId }),

  noteDeleted: (noteId: string) =>
    logEvent('note_deleted', { note_id: noteId }),

  noteArchived: (noteId: string) =>
    logEvent('note_archived', { note_id: noteId }),

  noteRestored: (noteId: string) =>
    logEvent('note_restored', { note_id: noteId }),

  notePinned: (noteId: string, isPinned: boolean) =>
    logEvent('note_pinned', { note_id: noteId, is_pinned: isPinned }),

  noteShared: (noteId: string, shareMethod: 'link' | 'copy') =>
    logEvent('note_shared', { note_id: noteId, share_method: shareMethod }),

  // ============================================
  // DESIGNS
  // ============================================
  designFlowStarted: (source: 'toolbar' | 'sidebar' | 'designs_page') =>
    logEvent('design_flow_started', { source }),

  designGenerated: (type: string) =>
    logEvent('design_generated', { design_type: type }),

  designApplied: (designId: string) =>
    logEvent('design_applied', { design_id: designId }),

  designSaved: (designId: string) =>
    logEvent('design_saved', { design_id: designId }),

  designRemoved: (designId: string, noteId: string) =>
    logEvent('design_removed', { design_id: designId, note_id: noteId }),

  // ============================================
  // LABELS
  // ============================================
  labelCreated: (labelName: string) =>
    logEvent('label_created', { label_name: labelName }),

  labelAddedToNote: (labelName: string, noteId: string) =>
    logEvent('label_added', { label_name: labelName, note_id: noteId }),

  labelRemoved: (labelName: string, noteId: string) =>
    logEvent('label_removed', { label_name: labelName, note_id: noteId }),

  // ============================================
  // BOARDS
  // ============================================
  boardViewed: (boardId: string, hashtag: string) =>
    logEvent('board_viewed', { board_id: boardId, hashtag }),

  boardCustomized: (boardId: string, customizationType: string) =>
    logEvent('board_customized', { board_id: boardId, customization_type: customizationType }),

  // ============================================
  // AUTH
  // ============================================
  signUp: (method: 'google' | 'apple' | 'email') =>
    logEvent('sign_up', { method }),

  login: (method: 'google' | 'apple' | 'email') =>
    logEvent('login', { method }),

  signOut: () =>
    logEvent('sign_out'),

  // ============================================
  // NAVIGATION & PAGE VIEWS
  // ============================================
  pageView: (pageName: string, pageTitle?: string) =>
    logEvent('page_view', {
      page_title: pageTitle || pageName,
      page_location: typeof window !== 'undefined' ? window.location.href : '',
      page_path: typeof window !== 'undefined' ? window.location.pathname : '',
    }),

  // ============================================
  // EDITOR
  // ============================================
  editorModeChanged: (noteId: string, mode: 'text' | 'checklist' | 'bullet') =>
    logEvent('editor_mode_changed', { note_id: noteId, mode }),

  editorImageAdded: (noteId: string) =>
    logEvent('editor_image_added', { note_id: noteId }),

  // ============================================
  // SYNC
  // ============================================
  syncStarted: () =>
    logEvent('sync_started'),

  syncCompleted: (itemsSynced: number) =>
    logEvent('sync_completed', { items_synced: itemsSynced }),

  syncFailed: (error: string) =>
    logEvent('sync_failed', { error }),

  // ============================================
  // SETTINGS
  // ============================================
  settingsChanged: (setting: string, value: string | boolean) =>
    logEvent('settings_changed', {
      setting_name: setting,
      setting_value: String(value),
    }),

  darkModeToggled: (enabled: boolean) =>
    logEvent('dark_mode_toggled', { enabled }),

  // ============================================
  // KEYBOARD SHORTCUTS
  // ============================================
  keyboardShortcutUsed: (shortcut: string, action: string) =>
    logEvent('keyboard_shortcut_used', { shortcut, action }),

  commandPaletteOpened: () =>
    logEvent('command_palette_opened'),

  commandPaletteAction: (action: string) =>
    logEvent('command_palette_action', { action }),

  // ============================================
  // FEATURES (Generic)
  // ============================================
  featureUsed: (featureName: string) =>
    logEvent('feature_used', { feature_name: featureName }),
};

// ============================================
// USER PROPERTIES
// ============================================

export interface UserProperties {
  subscription_tier?: 'free' | 'pro';
  total_notes?: number;
  total_designs?: number;
  has_custom_design?: boolean;
  platform?: 'web' | 'ios' | 'android';
}

/**
 * Update multiple user properties at once.
 */
export function updateUserProperties(props: UserProperties): void {
  const properties: Record<string, string> = {};

  if (props.subscription_tier !== undefined) {
    properties.subscription_tier = props.subscription_tier;
  }
  if (props.total_notes !== undefined) {
    // Bucket into ranges for better segmentation
    const bucket =
      props.total_notes === 0
        ? '0'
        : props.total_notes <= 5
        ? '1-5'
        : props.total_notes <= 20
        ? '6-20'
        : props.total_notes <= 50
        ? '21-50'
        : '50+';
    properties.total_notes_bucket = bucket;
  }
  if (props.total_designs !== undefined) {
    const bucket =
      props.total_designs === 0
        ? '0'
        : props.total_designs <= 3
        ? '1-3'
        : props.total_designs <= 10
        ? '4-10'
        : '10+';
    properties.total_designs_bucket = bucket;
  }
  if (props.has_custom_design !== undefined) {
    properties.has_custom_design = props.has_custom_design ? 'true' : 'false';
  }
  if (props.platform !== undefined) {
    properties.platform = props.platform;
  }

  setUserProperties(properties);
}
