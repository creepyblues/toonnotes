/**
 * Labeling API Response Validation
 *
 * Re-exports from @toonnotes/label-ai shared package.
 * This file maintains backward compatibility for Expo app imports.
 */

// Re-export everything from the shared package
export {
  // Schemas (for advanced use cases)
  // Note: Schemas are not exported, only types and functions

  // Validation functions
  parseAnalysisResult,
  parseGeneratedLabelDesign,
  createDefaultLabelDesign,

  // Threshold functions
  LABELING_THRESHOLDS,
  shouldAutoApply,
  shouldSuggest,
  categorizeMatchedLabels,
} from '@toonnotes/label-ai';

// Re-export types
export type {
  ValidatedMatchedLabel,
  ValidatedSuggestedNewLabel,
  ValidatedContentAnalysis,
  ValidatedAnalysisResult,
  ValidatedLabelDesignColors,
  ValidatedGeneratedLabelDesign,
} from '@toonnotes/label-ai';
