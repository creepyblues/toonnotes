/**
 * Label Normalization Utility
 *
 * Normalizes label names to match canonical preset forms.
 * Handles singular/plural variants to treat them as the same label.
 */

import { ALL_PRESET_IDS, LabelPresetId } from '@/constants/labelPresets';

// Presets that use plural form as canonical
const PLURAL_PRESETS: LabelPresetId[] = ['goals', 'bookmarks', 'ideas', 'quotes', 'errands'];

// Special cases that don't follow simple s-suffix rules
const SPECIAL_MAPPINGS: Record<string, LabelPresetId> = {
  // Irregular plurals or common typos
  'memories': 'memory',
  'todos': 'todo',
  'deadlines': 'deadline',
  'priorities': 'priority',
  'meetings': 'meeting',
  'plannings': 'planning',
  'projects': 'project',
  'shoppings': 'shopping',
  'wishlists': 'wishlist',
  'packings': 'packing',
  'readings': 'reading',
  'watchlists': 'watchlist',
  'reviews': 'review',
  'recommendations': 'recommendation',
  'drafts': 'draft',
  'brainstorms': 'brainstorm',
  'inspirations': 'inspiration',
  'researches': 'research',
  'journals': 'journal',
  'reflections': 'reflection',
  'gratitudes': 'gratitude',
  // Singular forms of plural presets
  'goal': 'goals',
  'bookmark': 'bookmarks',
  'idea': 'ideas',
  'quote': 'quotes',
  'errand': 'errands',
};

/**
 * Normalize a label name to match canonical preset form.
 *
 * - Handles case insensitivity
 * - Maps singular ↔ plural variants to canonical preset names
 * - Preserves custom labels as-is (lowercase)
 *
 * @example
 * normalizeLabel('Goal') // → 'goals'
 * normalizeLabel('shoppings') // → 'shopping'
 * normalizeLabel('my-list') // → 'my-list'
 */
export function normalizeLabel(name: string): string {
  const lower = name.toLowerCase().trim();

  // Check direct preset match first
  if (ALL_PRESET_IDS.includes(lower as LabelPresetId)) {
    return lower;
  }

  // Check special mappings
  if (lower in SPECIAL_MAPPINGS) {
    return SPECIAL_MAPPINGS[lower];
  }

  // Try removing 's' suffix for singular presets
  if (lower.endsWith('s') && lower.length > 1) {
    const singular = lower.slice(0, -1);
    if (ALL_PRESET_IDS.includes(singular as LabelPresetId) && !PLURAL_PRESETS.includes(singular as LabelPresetId)) {
      return singular;
    }
  }

  // Try adding 's' suffix for plural presets
  const plural = lower + 's';
  if (PLURAL_PRESETS.includes(plural as LabelPresetId)) {
    return plural;
  }

  // Return as-is for custom labels
  return lower;
}

/**
 * Check if a label name (or its normalized form) matches a preset.
 */
export function isPresetLabelNormalized(name: string): boolean {
  const normalized = normalizeLabel(name);
  return ALL_PRESET_IDS.includes(normalized as LabelPresetId);
}

/**
 * Get the canonical preset ID for a label name.
 * Returns undefined if no preset match.
 */
export function getCanonicalPresetId(name: string): LabelPresetId | undefined {
  const normalized = normalizeLabel(name);
  if (ALL_PRESET_IDS.includes(normalized as LabelPresetId)) {
    return normalized as LabelPresetId;
  }
  return undefined;
}
