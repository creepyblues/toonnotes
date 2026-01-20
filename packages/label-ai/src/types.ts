/**
 * Label AI Types
 *
 * Shared types for the auto-labeling system across platforms.
 */

import type { ValidatedMatchedLabel, ValidatedSuggestedNewLabel, ValidatedContentAnalysis, ValidatedGeneratedLabelDesign } from './utils/validation';

// ============================================
// Request/Response Types
// ============================================

export interface LabelAnalysisRequest {
  noteTitle: string;
  noteContent: string;
  existingLabels?: string[];
}

export interface LabelAnalysisResponse {
  autoApplyLabels: ValidatedMatchedLabel[];
  suggestLabels: ValidatedMatchedLabel[];
  suggestedNewLabels: ValidatedSuggestedNewLabel[];
  analysis: ValidatedContentAnalysis;
  hasHighConfidenceMatch: boolean;
  hasSuggestions: boolean;
  error?: {
    message: string;
    code: number | null;
  };
}

export interface LabelDesignRequest {
  labelName: string;
  context?: string;
}

// ============================================
// Store Types
// ============================================

export interface PendingSuggestion {
  id: string;
  noteId: string;
  labelName: string;
  isNewLabel: boolean;
  confidence: number;
  reason: string;
  category?: string;
  status: 'pending' | 'accepted' | 'declined';
  design?: ValidatedGeneratedLabelDesign;
}

export type ToastType = 'auto-apply' | 'suggestion';

export interface AutoApplyToast {
  noteId: string;
  labels: string[];
  expiresAt: number;
  undone: boolean;
  type?: ToastType; // 'auto-apply' (default) or 'suggestion'
  error?: {
    message: string;
    code: number | null;
  };
}

// Re-export validation types
export type {
  ValidatedMatchedLabel,
  ValidatedSuggestedNewLabel,
  ValidatedContentAnalysis,
  ValidatedAnalysisResult,
  ValidatedLabelDesignColors,
  ValidatedGeneratedLabelDesign,
} from './utils/validation';
