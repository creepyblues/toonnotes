/**
 * Labeling API Response Validation
 *
 * Zod schemas for validating responses from the auto-labeling API endpoints.
 * Ensures type safety and graceful fallbacks when APIs return unexpected data.
 */

import { z } from 'zod';

// ============================================
// Analyze Note Content Response Schemas
// ============================================

/**
 * Schema for a matched label with confidence score
 */
export const MatchedLabelSchema = z.object({
  labelName: z.string(),
  confidence: z.number().min(0).max(1),
  reason: z.string().default(''),
});

export type ValidatedMatchedLabel = z.infer<typeof MatchedLabelSchema>;

/**
 * Schema for a suggested new label
 */
export const SuggestedNewLabelSchema = z.object({
  name: z.string(),
  category: z.enum(['productivity', 'planning', 'checklists', 'media', 'creative', 'personal']),
  reason: z.string().default(''),
});

export type ValidatedSuggestedNewLabel = z.infer<typeof SuggestedNewLabelSchema>;

/**
 * Schema for content analysis metadata
 */
export const ContentAnalysisSchema = z.object({
  topics: z.array(z.string()).default([]),
  mood: z.enum(['energetic', 'calm', 'playful', 'serious', 'dreamy', 'bold']).default('calm'),
  contentType: z.string().default('notes'),
});

export type ValidatedContentAnalysis = z.infer<typeof ContentAnalysisSchema>;

/**
 * Full analysis result from /api/analyze-note-content
 */
export const AnalysisResultSchema = z.object({
  matchedLabels: z.array(MatchedLabelSchema).default([]),
  suggestedNewLabels: z.array(SuggestedNewLabelSchema).default([]),
  analysis: ContentAnalysisSchema.default({
    topics: [],
    mood: 'calm',
    contentType: 'notes',
  }),
});

export type ValidatedAnalysisResult = z.infer<typeof AnalysisResultSchema>;

// ============================================
// Generate Label Design Response Schemas
// ============================================

/**
 * Schema for label design colors
 */
export const LabelDesignColorsSchema = z.object({
  primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#6C5CE7'),
  secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#A29BFE'),
  bg: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#F3F0FF'),
  text: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#2D3436'),
});

export type ValidatedLabelDesignColors = z.infer<typeof LabelDesignColorsSchema>;

/**
 * Full label design from /api/generate-label-design
 */
export const GeneratedLabelDesignSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['productivity', 'planning', 'checklists', 'media', 'creative', 'personal']).default('personal'),
  icon: z.string().default('📝✨'),
  noteIcon: z.string().default('Note'),
  mood: z.enum(['energetic', 'calm', 'playful', 'serious', 'dreamy', 'bold']).default('calm'),
  description: z.string().default('Custom label'),
  colors: LabelDesignColorsSchema,
  bgStyle: z.enum(['solid', 'gradient', 'pattern', 'texture', 'illustration']).default('solid'),
  bgGradient: z.array(z.string()).optional(),
  bgPattern: z.string().optional(),
  fontStyle: z.enum(['sans-serif', 'serif', 'display', 'handwritten', 'mono']).default('sans-serif'),
  stickerType: z.enum(['corner', 'floating', 'border', 'stamp', 'none']).default('none'),
  stickerEmoji: z.string().default('✨'),
  stickerPosition: z.enum(['top-right', 'top-left', 'bottom-right', 'bottom-left']).default('bottom-right'),
  aiPromptHints: z.array(z.string()).default([]),
  artStyle: z.string().default('cute anime character, soft colors'),
});

export type ValidatedGeneratedLabelDesign = z.infer<typeof GeneratedLabelDesignSchema>;

// ============================================
// Validation Helper Functions
// ============================================

/**
 * Safely parse and validate an analysis result response
 * Returns default empty result on validation failure
 */
export function parseAnalysisResult(data: unknown): ValidatedAnalysisResult {
  const result = AnalysisResultSchema.safeParse(data);

  if (!result.success) {
    console.warn('Invalid analysis response, using defaults:', result.error.issues);
    return {
      matchedLabels: [],
      suggestedNewLabels: [],
      analysis: {
        topics: [],
        mood: 'calm',
        contentType: 'notes',
      },
    };
  }

  return result.data;
}

/**
 * Safely parse and validate a generated label design response
 * Returns a default design on validation failure
 */
export function parseGeneratedLabelDesign(data: unknown, labelName: string): ValidatedGeneratedLabelDesign {
  const result = GeneratedLabelDesignSchema.safeParse(data);

  if (!result.success) {
    console.warn('Invalid label design response, using defaults:', result.error.issues);
    return createDefaultLabelDesign(labelName);
  }

  return result.data;
}

/**
 * Create a default label design for a given name
 */
export function createDefaultLabelDesign(labelName: string): ValidatedGeneratedLabelDesign {
  return {
    id: labelName.toLowerCase().replace(/\s+/g, '-'),
    name: labelName,
    category: 'personal',
    icon: '📝✨',
    noteIcon: 'Note',
    mood: 'calm',
    description: `Notes about ${labelName}`.slice(0, 30),
    colors: {
      primary: '#6C5CE7',
      secondary: '#A29BFE',
      bg: '#F3F0FF',
      text: '#2D3436',
    },
    bgStyle: 'solid',
    fontStyle: 'sans-serif',
    stickerType: 'none',
    stickerEmoji: '✨',
    stickerPosition: 'bottom-right',
    aiPromptHints: [labelName.toLowerCase(), 'notes', 'personal'],
    artStyle: `cute anime character with ${labelName} theme, soft colors`,
  };
}

// ============================================
// Confidence Thresholds
// ============================================

/**
 * Confidence thresholds for auto-labeling decisions
 */
export const LABELING_THRESHOLDS = {
  /** Auto-apply with toast notification */
  AUTO_APPLY: 0.85,
  /** Show in suggestion sheet */
  SUGGEST: 0.50,
  /** Don't show at all */
  IGNORE: 0.50,
} as const;

/**
 * Check if a confidence level qualifies for auto-apply
 */
export function shouldAutoApply(confidence: number): boolean {
  return confidence >= LABELING_THRESHOLDS.AUTO_APPLY;
}

/**
 * Check if a confidence level qualifies for suggestion
 */
export function shouldSuggest(confidence: number): boolean {
  return confidence >= LABELING_THRESHOLDS.SUGGEST && confidence < LABELING_THRESHOLDS.AUTO_APPLY;
}

/**
 * Filter matched labels by confidence thresholds
 */
export function categorizeMatchedLabels(labels: ValidatedMatchedLabel[]): {
  autoApply: ValidatedMatchedLabel[];
  suggest: ValidatedMatchedLabel[];
} {
  return {
    autoApply: labels.filter(l => shouldAutoApply(l.confidence)),
    suggest: labels.filter(l => shouldSuggest(l.confidence)),
  };
}
