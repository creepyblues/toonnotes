import { devLog, devWarn, devError } from '@/utils/devLog';
/**
 * Labeling Engine Service
 *
 * Orchestrates the auto-labeling system for notes:
 * - Analyzes note content to suggest labels
 * - Matches against existing labels with confidence scores
 * - Suggests new labels when existing ones don't fit
 * - Generates designs for new custom labels
 *
 * This is the main entry point for all labeling operations.
 */

import {
  parseAnalysisResult,
  parseGeneratedLabelDesign,
  categorizeMatchedLabels,
  LABELING_THRESHOLDS,
  ValidatedAnalysisResult,
  ValidatedMatchedLabel,
  ValidatedSuggestedNewLabel,
  ValidatedGeneratedLabelDesign,
} from '@/utils/validation/labelingResponse';
import { LabelPresetId, LABEL_PRESETS, LabelPreset, ALL_PRESET_IDS } from '@/constants/labelPresets';
import { normalizeLabel } from '@/utils/labelNormalization';

// API base URL - always use production Vercel (matches geminiService.ts pattern)
const API_BASE_URL = 'https://toonnotes-api.vercel.app';

const ANALYZE_API_URL = `${API_BASE_URL}/api/analyze-note-content`;
const GENERATE_DESIGN_API_URL = `${API_BASE_URL}/api/generate-label-design`;

// Retry configuration
const MAX_RETRIES = 2;
const BASE_DELAY_MS = 1000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// Types
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
  analysis: ValidatedAnalysisResult['analysis'];
  hasHighConfidenceMatch: boolean;
  hasSuggestions: boolean;
}

export interface LabelDesignRequest {
  labelName: string;
  context?: string;
}

// ============================================
// Core Analysis Function
// ============================================

/**
 * Analyze note content and return label suggestions
 *
 * @param request - Note title, content, and existing custom labels
 * @returns Categorized label suggestions with confidence scores
 */
export async function analyzeNoteContent(
  request: LabelAnalysisRequest
): Promise<LabelAnalysisResponse> {
  const { noteTitle, noteContent, existingLabels = [] } = request;

  // Skip analysis for empty notes
  if (!noteTitle?.trim() && !noteContent?.trim()) {
    return {
      autoApplyLabels: [],
      suggestLabels: [],
      suggestedNewLabels: [],
      analysis: { topics: [], mood: 'calm', contentType: 'notes' },
      hasHighConfidenceMatch: false,
      hasSuggestions: false,
    };
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      devLog(`🏷️ Analyzing note content (attempt ${attempt + 1}/${MAX_RETRIES})...`);
      devLog(`🏷️ API URL: ${ANALYZE_API_URL}`);

      const response = await fetch(ANALYZE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteTitle,
          noteContent,
          existingLabels,
        }),
      });

      // Handle rate limiting
      if (response.status === 429) {
        const errorData = await response.json().catch(() => ({}));
        const retryAfter = errorData.retryAfter || Math.pow(2, attempt) * (BASE_DELAY_MS / 1000);

        if (attempt < MAX_RETRIES - 1) {
          devLog(`🏷️ Rate limited. Retrying in ${retryAfter}s...`);
          await delay(retryAfter * 1000);
          continue;
        } else {
          throw new Error(`Rate limit exceeded. Please wait ${retryAfter} seconds.`);
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const rawData = await response.json();
      const analysisResult = parseAnalysisResult(rawData);

      // Categorize matched labels by confidence threshold
      const { autoApply, suggest } = categorizeMatchedLabels(analysisResult.matchedLabels);

      const result: LabelAnalysisResponse = {
        autoApplyLabels: autoApply,
        suggestLabels: suggest,
        suggestedNewLabels: analysisResult.suggestedNewLabels,
        analysis: analysisResult.analysis,
        hasHighConfidenceMatch: autoApply.length > 0,
        hasSuggestions: suggest.length > 0 || analysisResult.suggestedNewLabels.length > 0,
      };

      devLog(`🏷️ Analysis complete:`, {
        autoApply: result.autoApplyLabels.map(l => l.labelName),
        suggest: result.suggestLabels.map(l => l.labelName),
        newLabels: result.suggestedNewLabels.map(l => l.name),
      });

      return result;

    } catch (error: any) {
      lastError = error as Error;
      console.error(`🏷️ Analysis attempt ${attempt + 1} failed:`, error);

      // Check for network errors
      const isNetworkError = error.message?.includes('Network request failed') ||
                             error.message?.includes('fetch') ||
                             error.name === 'TypeError';

      if (isNetworkError && attempt < MAX_RETRIES - 1) {
        const waitTime = BASE_DELAY_MS * Math.pow(2, attempt);
        devLog(`🏷️ Network error, retrying in ${waitTime}ms...`);
        await delay(waitTime);
        continue;
      }
    }
  }

  // Return empty result on failure (don't block the user)
  devWarn('🏷️ Analysis failed, returning empty result:', lastError);
  return {
    autoApplyLabels: [],
    suggestLabels: [],
    suggestedNewLabels: [],
    analysis: { topics: [], mood: 'calm', contentType: 'notes' },
    hasHighConfidenceMatch: false,
    hasSuggestions: false,
  };
}

// ============================================
// Label Design Generation
// ============================================

/**
 * Generate a visual design for a new custom label
 *
 * @param request - Label name and optional context
 * @returns Complete label design preset
 */
export async function generateLabelDesign(
  request: LabelDesignRequest
): Promise<ValidatedGeneratedLabelDesign> {
  const { labelName, context } = request;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      devLog(`🎨 Generating design for "${labelName}" (attempt ${attempt + 1}/${MAX_RETRIES})...`);

      const response = await fetch(GENERATE_DESIGN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          labelName,
          context,
        }),
      });

      // Handle rate limiting
      if (response.status === 429) {
        const errorData = await response.json().catch(() => ({}));
        const retryAfter = errorData.retryAfter || Math.pow(2, attempt) * (BASE_DELAY_MS / 1000);

        if (attempt < MAX_RETRIES - 1) {
          devLog(`🎨 Rate limited. Retrying in ${retryAfter}s...`);
          await delay(retryAfter * 1000);
          continue;
        } else {
          throw new Error(`Rate limit exceeded. Please wait ${retryAfter} seconds.`);
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const rawData = await response.json();
      const design = parseGeneratedLabelDesign(rawData, labelName);

      devLog(`🎨 Design generated for "${labelName}":`, {
        category: design.category,
        mood: design.mood,
        primaryColor: design.colors.primary,
      });

      return design;

    } catch (error: any) {
      lastError = error as Error;
      console.error(`🎨 Design generation attempt ${attempt + 1} failed:`, error);

      // Check for network errors
      const isNetworkError = error.message?.includes('Network request failed') ||
                             error.message?.includes('fetch') ||
                             error.name === 'TypeError';

      if (isNetworkError && attempt < MAX_RETRIES - 1) {
        const waitTime = BASE_DELAY_MS * Math.pow(2, attempt);
        devLog(`🎨 Network error, retrying in ${waitTime}ms...`);
        await delay(waitTime);
        continue;
      }
    }
  }

  // Return default design on failure
  devWarn('🎨 Design generation failed, returning default:', lastError);
  return parseGeneratedLabelDesign(null, labelName);
}

// ============================================
// Helper Functions
// ============================================

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

/**
 * Filter out labels that are already applied to the note
 * Uses normalization to handle singular/plural variants
 */
export function filterExistingLabels(
  suggestions: ValidatedMatchedLabel[],
  currentLabels: string[]
): ValidatedMatchedLabel[] {
  const currentNormalized = new Set(currentLabels.map(l => normalizeLabel(l)));
  return suggestions.filter(s => !currentNormalized.has(normalizeLabel(s.labelName)));
}

/**
 * Get all unique label names from suggestions
 */
export function getAllSuggestedLabelNames(response: LabelAnalysisResponse): string[] {
  const labels = new Set<string>();

  response.autoApplyLabels.forEach(l => labels.add(l.labelName));
  response.suggestLabels.forEach(l => labels.add(l.labelName));
  response.suggestedNewLabels.forEach(l => labels.add(l.name));

  return Array.from(labels);
}

// ============================================
// Economy Helpers
// ============================================

/** Number of free custom label designs */
export const CUSTOM_DESIGN_FREE_QUOTA = 5;

/** Cost per custom label design after free quota */
export const CUSTOM_DESIGN_COST = 1;

/**
 * Check if user can afford a custom design
 * @param customDesignCount - Number of designs already created
 * @param coinBalance - User's current coin balance
 */
export function canAffordCustomDesign(
  customDesignCount: number,
  coinBalance: number
): boolean {
  // First 5 are free
  if (customDesignCount < CUSTOM_DESIGN_FREE_QUOTA) {
    return true;
  }
  // After that, need coins
  return coinBalance >= CUSTOM_DESIGN_COST;
}

/**
 * Calculate the cost of a custom design
 * @param customDesignCount - Number of designs already created
 * @returns 0 if within free quota, otherwise CUSTOM_DESIGN_COST
 */
export function getCustomDesignCost(customDesignCount: number): number {
  if (customDesignCount < CUSTOM_DESIGN_FREE_QUOTA) {
    return 0;
  }
  return CUSTOM_DESIGN_COST;
}

// Re-export thresholds for use in components
export { LABELING_THRESHOLDS };
