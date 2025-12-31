/**
 * API Response Validation
 *
 * Uses Zod for runtime validation of external API responses.
 * This ensures type safety and graceful error handling when
 * the API returns unexpected data.
 */

import { z } from 'zod';

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
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

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
