/**
 * Supabase Table Names and Constants
 *
 * Centralizes table names to prevent typos and enable refactoring.
 */

export const TABLES = {
  // User data
  profiles: 'profiles',

  // Notes
  notes: 'notes',

  // Designs
  designs: 'designs',

  // Labels
  labels: 'labels',
  note_labels: 'note_labels',

  // Boards
  boards: 'boards',

  // Subscriptions
  subscriptions: 'subscriptions',

  // Economy
  coins: 'coins',
  transactions: 'transactions',
} as const;

export type TableName = typeof TABLES[keyof typeof TABLES];

/**
 * Realtime channel names
 */
export const REALTIME_CHANNELS = {
  notes: 'notes-changes',
  designs: 'designs-changes',
  labels: 'labels-changes',
  boards: 'boards-changes',
} as const;
