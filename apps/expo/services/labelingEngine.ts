/**
 * Labeling Engine Service
 *
 * Re-exports from @toonnotes/label-ai shared package.
 * This file maintains backward compatibility for Expo app imports.
 */

import { devLog, devWarn, devError } from '@/utils/devLog';

// Re-export everything from the shared package
export {
  // Core functions
  analyzeNoteContent,
  generateLabelDesign,
  filterExistingLabels,
  getAllSuggestedLabelNames,

  // Economy helpers
  canAffordCustomDesign,
  getCustomDesignCost,
  CUSTOM_DESIGN_FREE_QUOTA,
  CUSTOM_DESIGN_COST,

  // Thresholds
  LABELING_THRESHOLDS,
} from '@toonnotes/label-ai';

// Re-export types
export type {
  LabelAnalysisRequest,
  LabelAnalysisResponse,
  LabelDesignRequest,
} from '@toonnotes/label-ai';

// ============================================
// Local Helper Functions (Expo-specific)
// ============================================

import { normalizeLabel } from '@/utils/labelNormalization';
import { LabelPresetId, LABEL_PRESETS, LabelPreset, ALL_PRESET_IDS } from '@/constants/labelPresets';

/**
 * Check if a label name matches a built-in preset
 * Uses normalization to handle singular/plural variants
 */
export function isPresetLabel(labelName: string): boolean {
  const normalized = normalizeLabel(labelName);
  return ALL_PRESET_IDS.includes(normalized as LabelPresetId);
}

/**
 * Get the preset for a label name if it exists
 * Uses normalization to handle singular/plural variants
 */
export function getPresetForLabel(labelName: string): LabelPreset | null {
  const normalized = normalizeLabel(labelName);
  if (ALL_PRESET_IDS.includes(normalized as LabelPresetId)) {
    return LABEL_PRESETS[normalized as LabelPresetId];
  }
  return null;
}
