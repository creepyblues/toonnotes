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
 * Cross-platform compatible (React Native + Web).
 */

import {
  parseAnalysisResult,
  parseGeneratedLabelDesign,
  categorizeMatchedLabels,
  LABELING_THRESHOLDS,
  type ValidatedGeneratedLabelDesign,
} from '../utils/validation';
import type { LabelAnalysisRequest, LabelAnalysisResponse, LabelDesignRequest } from '../types';

// API base URL - always use production Vercel
const API_BASE_URL = 'https://toonnotes-api.vercel.app';

const ANALYZE_API_URL = `${API_BASE_URL}/api/analyze-note-content`;
const GENERATE_DESIGN_API_URL = `${API_BASE_URL}/api/generate-label-design`;

// Retry configuration
const MAX_RETRIES = 2;
const BASE_DELAY_MS = 1000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// Logger (platform-agnostic)
// ============================================

// Detect development mode in a cross-platform way
const isDev = (): boolean => {
  // Check React Native's __DEV__ global
  if (typeof (globalThis as { __DEV__?: boolean }).__DEV__ !== 'undefined') {
    return (globalThis as { __DEV__?: boolean }).__DEV__ === true;
  }
  // Fall back to Node.js environment variable
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV !== 'production';
  }
  // Default to false in unknown environments
  return false;
};

const log = (message: string, ...args: unknown[]) => {
  if (isDev()) {
    console.log(message, ...args);
  }
};

const warn = (message: string, ...args: unknown[]) => {
  console.warn(message, ...args);
};

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
  let lastStatusCode: number | null = null;
  let lastErrorMessage: string = 'Unknown error';

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      log(`[label-ai] Analyzing note content (attempt ${attempt + 1}/${MAX_RETRIES})...`);

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
        lastStatusCode = 429;
        const errorData = await response.json().catch(() => ({}));
        const retryAfter = errorData.retryAfter || Math.pow(2, attempt) * (BASE_DELAY_MS / 1000);

        if (attempt < MAX_RETRIES - 1) {
          log(`[label-ai] Rate limited. Retrying in ${retryAfter}s...`);
          await delay(retryAfter * 1000);
          continue;
        } else {
          lastErrorMessage = 'Rate limited';
          throw new Error(`Rate limit exceeded. Please wait ${retryAfter} seconds.`);
        }
      }

      if (!response.ok) {
        lastStatusCode = response.status;
        const errorData = await response.json().catch(() => ({}));
        lastErrorMessage = response.status === 404 ? 'API not available' : `API error`;
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

      log(`[label-ai] Analysis complete:`, {
        autoApply: result.autoApplyLabels.map(l => l.labelName),
        suggest: result.suggestLabels.map(l => l.labelName),
        newLabels: result.suggestedNewLabels.map(l => l.name),
      });

      return result;

    } catch (error: unknown) {
      lastError = error as Error;
      console.error(`[label-ai] Analysis attempt ${attempt + 1} failed:`, error);

      // Check for network errors
      const errorMessage = error instanceof Error ? error.message : '';
      const isNetworkError = errorMessage.includes('Network request failed') ||
                             errorMessage.includes('fetch') ||
                             (error as Error)?.name === 'TypeError';

      if (isNetworkError) {
        lastStatusCode = null;
        lastErrorMessage = 'Network error';

        if (attempt < MAX_RETRIES - 1) {
          const waitTime = BASE_DELAY_MS * Math.pow(2, attempt);
          log(`[label-ai] Network error, retrying in ${waitTime}ms...`);
          await delay(waitTime);
          continue;
        }
      }
    }
  }

  // Return empty result with error info (don't block the user)
  warn('[label-ai] Analysis failed, returning error result:', lastError);
  return {
    autoApplyLabels: [],
    suggestLabels: [],
    suggestedNewLabels: [],
    analysis: { topics: [], mood: 'calm', contentType: 'notes' },
    hasHighConfidenceMatch: false,
    hasSuggestions: false,
    error: {
      message: lastErrorMessage,
      code: lastStatusCode,
    },
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
      log(`[label-ai] Generating design for "${labelName}" (attempt ${attempt + 1}/${MAX_RETRIES})...`);

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
          log(`[label-ai] Rate limited. Retrying in ${retryAfter}s...`);
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

      log(`[label-ai] Design generated for "${labelName}":`, {
        category: design.category,
        mood: design.mood,
        primaryColor: design.colors.primary,
      });

      return design;

    } catch (error: unknown) {
      lastError = error as Error;
      console.error(`[label-ai] Design generation attempt ${attempt + 1} failed:`, error);

      // Check for network errors
      const errorMessage = error instanceof Error ? error.message : '';
      const isNetworkError = errorMessage.includes('Network request failed') ||
                             errorMessage.includes('fetch') ||
                             (error as Error)?.name === 'TypeError';

      if (isNetworkError && attempt < MAX_RETRIES - 1) {
        const waitTime = BASE_DELAY_MS * Math.pow(2, attempt);
        log(`[label-ai] Network error, retrying in ${waitTime}ms...`);
        await delay(waitTime);
        continue;
      }
    }
  }

  // Return default design on failure
  warn('[label-ai] Design generation failed, returning default:', lastError);
  return parseGeneratedLabelDesign(null, labelName);
}

// ============================================
// Helper Functions
// ============================================

/**
 * Filter out labels that are already applied to the note
 * @param suggestions - Suggested labels from analysis
 * @param currentLabels - Labels currently on the note
 * @param normalizeLabel - Optional function to normalize label names
 */
export function filterExistingLabels<T extends { labelName: string }>(
  suggestions: T[],
  currentLabels: string[],
  normalizeLabel: (s: string) => string = (s) => s.toLowerCase().trim()
): T[] {
  const currentNormalized = new Set(currentLabels.map(l => normalizeLabel(l)));
  return suggestions.filter(s => !currentNormalized.has(normalizeLabel(s.labelName)));
}

/**
 * Get all unique label names from a response
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
