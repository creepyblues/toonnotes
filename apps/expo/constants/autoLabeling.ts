/**
 * Configuration for the smart auto-labeling system.
 *
 * The system uses background analysis with intelligent triggers to
 * pre-compute label suggestions before the user exits the note editor.
 *
 * @see docs/AUTO-SAVE-LABELING.md
 */
export const AUTO_LABELING_CONFIG = {
  // Trigger timings
  /** Idle timeout - trigger analysis after this many ms of no typing */
  IDLE_TIMEOUT_MS: 3000,

  /** Stability timeout - trigger analysis if content unchanged for this long */
  STABILITY_TIMEOUT_MS: 5000,

  /** Minimum character change to trigger analysis (prevents micro-edit spam) */
  SIGNIFICANT_CHANGE_CHARS: 50,

  /** Cooldown between analyses to prevent API spam */
  COOLDOWN_MS: 30000,

  // Content thresholds
  /** Minimum title length to trigger analysis */
  MIN_TITLE_LENGTH: 3,

  /** Minimum content length to trigger analysis */
  MIN_CONTENT_LENGTH: 20,

  // Cache settings
  /** Cache TTL - how long to keep cached results */
  CACHE_TTL_MS: 600000, // 10 minutes

  /** Maximum cache entries per session (LRU eviction) */
  MAX_CACHE_ENTRIES: 50,
} as const;

/**
 * Auto-save configuration constants.
 *
 * Uses hybrid debounce + throttle approach:
 * - Debounce: Waits for pause in typing before saving
 * - Throttle: Guarantees saves at least every N seconds during continuous typing
 */
export const AUTO_SAVE_CONFIG = {
  /** Debounce delay - save after this many ms of no changes */
  DEBOUNCE_MS: 500,

  /** Throttle ceiling - maximum time between saves during continuous editing */
  THROTTLE_MAX_MS: 5000,
} as const;

export type AutoLabelingConfig = typeof AUTO_LABELING_CONFIG;
export type AutoSaveConfig = typeof AUTO_SAVE_CONFIG;
