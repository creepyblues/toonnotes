/**
 * @toonnotes/label-ai
 *
 * Cross-platform AI-powered label suggestion system for ToonNotes.
 * Works on both React Native (Expo) and Web (Next.js).
 */

// Services
export {
  analyzeNoteContent,
  generateLabelDesign,
  filterExistingLabels,
  getAllSuggestedLabelNames,
  canAffordCustomDesign,
  getCustomDesignCost,
  CUSTOM_DESIGN_FREE_QUOTA,
  CUSTOM_DESIGN_COST,
} from './services/labelingEngine';

// Validation utilities
export {
  LABELING_THRESHOLDS,
  categorizeMatchedLabels,
  shouldAutoApply,
  shouldSuggest,
  parseAnalysisResult,
  parseGeneratedLabelDesign,
  createDefaultLabelDesign,
} from './utils/validation';

// Types
export type {
  LabelAnalysisRequest,
  LabelAnalysisResponse,
  LabelDesignRequest,
  PendingSuggestion,
  AutoApplyToast,
  ToastType,
  ValidatedMatchedLabel,
  ValidatedSuggestedNewLabel,
  ValidatedContentAnalysis,
  ValidatedAnalysisResult,
  ValidatedLabelDesignColors,
  ValidatedGeneratedLabelDesign,
} from './types';
