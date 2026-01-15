/**
 * API Response Validation
 *
 * Uses Zod for runtime validation of external API responses.
 * This ensures type safety and graceful error handling when
 * the API returns unexpected data.
 */

import { z } from 'zod';
// Re-export shared color validation from validation.ts
import { isValidHexColor as isValidHexColorBase } from '../validation';

// ============================================
// Theme Generation Response Schemas
// ============================================

/**
 * Colors schema for theme responses
 */
const ThemeColorsSchema = z.object({
  background: z.string().default('#FFFFFF'),
  text: z.string().default('#1A1625'),
  accent: z.string().default('#8B5CF6'),
});

/**
 * Styles schema for theme responses
 */
const ThemeStylesSchema = z.object({
  borderRadius: z.string().optional().default('16px'),
  boxShadow: z.string().optional().default('none'),
  backgroundGradient: z.string().optional().default('none'),
});

/**
 * Standard theme response from /api/generate-theme
 */
export const ThemeResponseSchema = z.object({
  name: z.string().default('Custom Design'),
  colors: ThemeColorsSchema,
  styles: ThemeStylesSchema.optional(),
});

export type ValidatedThemeResponse = z.infer<typeof ThemeResponseSchema>;

/**
 * Lucky theme response with vibe field
 */
export const LuckyThemeResponseSchema = ThemeResponseSchema.extend({
  vibe: z.enum(['chaotic', 'unhinged', 'dramatic', 'cursed', 'blessed', 'feral']).optional(),
});

export type ValidatedLuckyThemeResponse = z.infer<typeof LuckyThemeResponseSchema>;

// ============================================
// Sticker Generation Response Schemas
// ============================================

/**
 * Sticker response from /api/generate-sticker
 */
export const StickerResponseSchema = z.object({
  stickerData: z.string(), // Base64 image data
  mimeType: z.string().default('image/png'),
  fallback: z.boolean().optional(),
  transformed: z.boolean().optional(),
  error: z.string().optional(),
});

export type ValidatedStickerResponse = z.infer<typeof StickerResponseSchema>;

// ============================================
// Board Design Response Schemas
// ============================================

/**
 * Board design response from /api/generate-board-design
 */
export const BoardDesignResponseSchema = z.object({
  headerGradient: z.object({
    colors: z.array(z.string()).min(2),
    direction: z.string().optional(),
  }),
  corkboardStyle: z.object({
    backgroundColor: z.string(),
    textureOpacity: z.number().min(0).max(1).optional(),
    patternType: z.string().optional(),
  }),
  decorations: z.object({
    pushPinColors: z.array(z.string()).optional(),
    tapeStyle: z.string().optional(),
    shadowIntensity: z.number().min(0).max(1).optional(),
  }).optional(),
  accentColor: z.string().optional(),
});

export type ValidatedBoardDesignResponse = z.infer<typeof BoardDesignResponseSchema>;

// ============================================
// Typography & Character Response Schemas
// ============================================

/**
 * Typography image response
 */
export const TypographyImageResponseSchema = z.object({
  imageData: z.string(), // Base64 image data
  mimeType: z.string().default('image/png'),
  style: z.string().optional(),
  error: z.string().optional(),
});

export type ValidatedTypographyResponse = z.infer<typeof TypographyImageResponseSchema>;

/**
 * Character mascot response
 */
export const CharacterMascotResponseSchema = z.object({
  imageData: z.string(), // Base64 image data
  mimeType: z.string().default('image/png'),
  characterType: z.string().optional(),
  error: z.string().optional(),
});

export type ValidatedCharacterResponse = z.infer<typeof CharacterMascotResponseSchema>;

// ============================================
// Validation Helper Functions
// ============================================

/**
 * Safely parse and validate a theme response
 * Returns a default theme on validation failure
 */
export function parseThemeResponse(data: unknown): ValidatedThemeResponse {
  const result = ThemeResponseSchema.safeParse(data);

  if (!result.success) {
    console.warn('Invalid theme response, using defaults:', result.error.issues);
    return {
      name: 'Custom Design',
      colors: {
        background: '#FFFFFF',
        text: '#1A1625',
        accent: '#8B5CF6',
      },
      styles: {
        borderRadius: '16px',
        boxShadow: 'none',
        backgroundGradient: 'none',
      },
    };
  }

  return result.data;
}

/**
 * Safely parse and validate a lucky theme response
 */
export function parseLuckyThemeResponse(data: unknown): ValidatedLuckyThemeResponse {
  const result = LuckyThemeResponseSchema.safeParse(data);

  if (!result.success) {
    console.warn('Invalid lucky theme response, using defaults:', result.error.issues);
    return {
      name: 'Lucky Design',
      colors: {
        background: '#FFF7ED',
        text: '#1A1625',
        accent: '#F59E0B',
      },
      vibe: 'chaotic',
    };
  }

  return result.data;
}

/**
 * Safely parse and validate a sticker response
 * Returns null on validation failure (sticker is optional)
 */
export function parseStickerResponse(data: unknown): ValidatedStickerResponse | null {
  const result = StickerResponseSchema.safeParse(data);

  if (!result.success) {
    console.warn('Invalid sticker response:', result.error.issues);
    return null;
  }

  // Check for error field in response
  if (result.data.error) {
    console.warn('Sticker generation error:', result.data.error);
    return null;
  }

  return result.data;
}

/**
 * Safely parse and validate a board design response
 */
export function parseBoardDesignResponse(data: unknown): ValidatedBoardDesignResponse | null {
  const result = BoardDesignResponseSchema.safeParse(data);

  if (!result.success) {
    console.warn('Invalid board design response:', result.error.issues);
    return null;
  }

  return result.data;
}

/**
 * Validate hex color format
 * Re-exported from utils/validation.ts for API response usage
 */
export const isValidHexColor = isValidHexColorBase;

/**
 * Sanitize a color string, returning a default if invalid
 */
export function sanitizeColor(color: string, defaultColor: string = '#8B5CF6'): string {
  if (isValidHexColor(color)) {
    return color;
  }
  console.warn(`Invalid color "${color}", using default: ${defaultColor}`);
  return defaultColor;
}

// ============================================
// Quality Assessment Response Schemas
// ============================================

/**
 * Quality signals schema for AI image generation
 */
export const QualitySignalsSchema = z.object({
  hasTransparency: z.boolean(),
  transparencyRatio: z.number().min(0).max(1),
  edgeSharpness: z.enum(['clean', 'rough', 'unknown']),
  processingMethod: z.enum(['ai', 'threshold', 'fallback']),
  confidenceScore: z.number().min(0).max(1),
});

export type ValidatedQualitySignals = z.infer<typeof QualitySignalsSchema>;

/**
 * Quality metadata schema
 */
export const QualityMetadataSchema = z.object({
  qualitySignals: QualitySignalsSchema,
  warnings: z.array(z.string()),
});

export type ValidatedQualityMetadata = z.infer<typeof QualityMetadataSchema>;

/**
 * Enhanced sticker response with quality metadata
 */
export const EnhancedStickerResponseSchema = z.object({
  stickerData: z.string(),
  stickerBase64: z.string().optional(), // Backward compat
  mimeType: z.string().default('image/png'),
  fallback: z.boolean().optional(),
  transformed: z.boolean().optional(),
  qualityMetadata: QualityMetadataSchema.optional(),
  error: z.string().optional(),
});

export type ValidatedEnhancedStickerResponse = z.infer<typeof EnhancedStickerResponseSchema>;

/**
 * Enhanced character mascot response with quality metadata
 */
export const EnhancedCharacterResponseSchema = z.object({
  imageBase64: z.string(),
  mimeType: z.string().default('image/png'),
  characterType: z.string().optional(),
  characterDescription: z.string().optional(),
  poseDescription: z.string().optional(),
  artistNotes: z.string().optional(),
  qualityMetadata: QualityMetadataSchema.optional(),
  error: z.string().optional(),
});

export type ValidatedEnhancedCharacterResponse = z.infer<typeof EnhancedCharacterResponseSchema>;

/**
 * Default quality signals for fallback scenarios
 */
export const DEFAULT_FALLBACK_QUALITY: ValidatedQualityMetadata = {
  qualitySignals: {
    hasTransparency: false,
    transparencyRatio: 0,
    edgeSharpness: 'unknown',
    processingMethod: 'fallback',
    confidenceScore: 0.3,
  },
  warnings: ['Original image used as fallback - processing may have failed'],
};

/**
 * Default quality signals for successful generation with no metadata
 */
export const DEFAULT_SUCCESS_QUALITY: ValidatedQualityMetadata = {
  qualitySignals: {
    hasTransparency: true,
    transparencyRatio: 0.5,
    edgeSharpness: 'unknown',
    processingMethod: 'ai',
    confidenceScore: 0.7,
  },
  warnings: [],
};

/**
 * Parse enhanced sticker response with quality metadata
 * Adds default quality metadata if missing (backward compatibility)
 */
export function parseEnhancedStickerResponse(
  data: unknown
): ValidatedEnhancedStickerResponse | null {
  const result = EnhancedStickerResponseSchema.safeParse(data);

  if (!result.success) {
    console.warn('Invalid enhanced sticker response:', result.error.issues);
    return null;
  }

  if (result.data.error) {
    console.warn('Sticker generation error:', result.data.error);
    return null;
  }

  // Add default quality metadata if missing (backward compat)
  if (!result.data.qualityMetadata) {
    result.data.qualityMetadata = result.data.fallback
      ? DEFAULT_FALLBACK_QUALITY
      : DEFAULT_SUCCESS_QUALITY;
  }

  return result.data;
}

/**
 * Parse enhanced character response with quality metadata
 */
export function parseEnhancedCharacterResponse(
  data: unknown
): ValidatedEnhancedCharacterResponse | null {
  const result = EnhancedCharacterResponseSchema.safeParse(data);

  if (!result.success) {
    console.warn('Invalid enhanced character response:', result.error.issues);
    return null;
  }

  if (result.data.error) {
    console.warn('Character generation error:', result.data.error);
    return null;
  }

  // Add default quality metadata if missing
  if (!result.data.qualityMetadata) {
    result.data.qualityMetadata = DEFAULT_SUCCESS_QUALITY;
  }

  return result.data;
}

/**
 * Check if quality metadata indicates low quality result
 */
export function isLowQuality(metadata: ValidatedQualityMetadata | undefined): boolean {
  if (!metadata) return false;
  return metadata.qualitySignals.confidenceScore < 0.6 || metadata.warnings.length > 0;
}

/**
 * Get quality level description for UI display
 */
export function getQualityLevel(
  metadata: ValidatedQualityMetadata | undefined
): 'good' | 'fair' | 'poor' {
  if (!metadata) return 'fair';
  const score = metadata.qualitySignals.confidenceScore;
  if (score >= 0.8) return 'good';
  if (score >= 0.5) return 'fair';
  return 'poor';
}
