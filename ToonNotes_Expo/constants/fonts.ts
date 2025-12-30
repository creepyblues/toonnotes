/**
 * Font Configuration for ToonNotes
 *
 * Maps label presets to specific Google Fonts for distinctive typography.
 * Each preset can have different title and body fonts.
 */

import { LabelPresetId } from './labelPresets';

// ============================================
// Font Family Definitions
// ============================================

/**
 * Maps internal font keys to actual Google Font family names.
 * These names must match exactly what's loaded in useFonts().
 */
export const FONT_FAMILIES = {
  // Sans-serif fonts
  'Inter-Regular': 'Inter_400Regular',
  'Inter-Medium': 'Inter_500Medium',
  'Inter-SemiBold': 'Inter_600SemiBold',
  'Inter-Bold': 'Inter_700Bold',
  'Poppins-Regular': 'Poppins_400Regular',
  'Poppins-Medium': 'Poppins_500Medium',
  'Poppins-SemiBold': 'Poppins_600SemiBold',
  'Nunito-Regular': 'Nunito_400Regular',
  'Nunito-SemiBold': 'Nunito_600SemiBold',
  'Nunito-Bold': 'Nunito_700Bold',

  // Serif fonts
  'PlayfairDisplay-Regular': 'PlayfairDisplay_400Regular',
  'PlayfairDisplay-SemiBold': 'PlayfairDisplay_600SemiBold',
  'PlayfairDisplay-Bold': 'PlayfairDisplay_700Bold',
  'Lora-Regular': 'Lora_400Regular',
  'Lora-Medium': 'Lora_500Medium',
  'Lora-SemiBold': 'Lora_600SemiBold',
  'Merriweather-Regular': 'Merriweather_400Regular',
  'Merriweather-Bold': 'Merriweather_700Bold',

  // Display fonts
  'Outfit-Medium': 'Outfit_500Medium',
  'Outfit-SemiBold': 'Outfit_600SemiBold',
  'Outfit-Bold': 'Outfit_700Bold',
  'BebasNeue-Regular': 'BebasNeue_400Regular',
  'Righteous-Regular': 'Righteous_400Regular',

  // Handwritten fonts
  'Caveat-Regular': 'Caveat_400Regular',
  'Caveat-Medium': 'Caveat_500Medium',
  'Caveat-Bold': 'Caveat_700Bold',
  'DancingScript-Regular': 'DancingScript_400Regular',
  'DancingScript-Medium': 'DancingScript_500Medium',
  'DancingScript-Bold': 'DancingScript_700Bold',
  'Pacifico-Regular': 'Pacifico_400Regular',
  'IndieFlower-Regular': 'IndieFlower_400Regular',

  // Mono fonts
  'JetBrainsMono-Regular': 'JetBrainsMono_400Regular',
  'JetBrainsMono-Medium': 'JetBrainsMono_500Medium',
  'FiraCode-Regular': 'FiraCode_400Regular',
  'FiraCode-Medium': 'FiraCode_500Medium',
} as const;

export type FontFamilyKey = keyof typeof FONT_FAMILIES;

// ============================================
// Preset-to-Font Mapping
// ============================================

/**
 * Maps each label preset to specific fonts for title and body text.
 * This creates visual variety across presets while maintaining consistency
 * within each preset.
 */
export const PRESET_FONT_MAPPING: Record<LabelPresetId, {
  title: FontFamilyKey;
  body: FontFamilyKey;
}> = {
  // ==========================================
  // PRODUCTIVITY
  // ==========================================
  todo: {
    title: 'Inter-SemiBold',
    body: 'Inter-Regular',
  },
  important: {
    title: 'Outfit-Bold',
    body: 'Poppins-Regular',
  },
  archive: {
    title: 'Lora-SemiBold',
    body: 'Lora-Regular',
  },
  goals: {
    title: 'Righteous-Regular',
    body: 'Poppins-Regular',
  },

  // ==========================================
  // READING
  // ==========================================
  reading: {
    title: 'PlayfairDisplay-SemiBold',
    body: 'Lora-Regular',
  },
  watchlist: {
    title: 'Poppins-SemiBold',
    body: 'Poppins-Regular',
  },
  review: {
    title: 'Nunito-Bold',
    body: 'Nunito-Regular',
  },
  recommendation: {
    title: 'Caveat-Bold',
    body: 'Caveat-Regular',
  },

  // ==========================================
  // CREATIVE
  // ==========================================
  ideas: {
    title: 'Outfit-Bold',
    body: 'Nunito-Regular',
  },
  theory: {
    title: 'JetBrainsMono-Medium',
    body: 'JetBrainsMono-Regular',
  },
  character: {
    title: 'Poppins-SemiBold',
    body: 'Poppins-Regular',
  },
  favorites: {
    title: 'BebasNeue-Regular',
    body: 'Poppins-Regular',
  },

  // ==========================================
  // CONTENT
  // ==========================================
  blog: {
    title: 'Merriweather-Bold',
    body: 'Merriweather-Regular',
  },
  draft: {
    title: 'DancingScript-Bold',
    body: 'Caveat-Regular',
  },
  quotes: {
    title: 'PlayfairDisplay-SemiBold',
    body: 'PlayfairDisplay-Regular',
  },
  research: {
    title: 'FiraCode-Medium',
    body: 'FiraCode-Regular',
  },

  // ==========================================
  // PERSONAL
  // ==========================================
  journal: {
    title: 'Pacifico-Regular',
    body: 'Caveat-Regular',
  },
  memory: {
    title: 'Lora-SemiBold',
    body: 'Lora-Regular',
  },
  inspiration: {
    title: 'Righteous-Regular',
    body: 'Nunito-Regular',
  },
  art: {
    title: 'BebasNeue-Regular',
    body: 'IndieFlower-Regular',
  },
};

// ============================================
// Font Style Defaults
// ============================================

export type PresetFontStyle = 'sans-serif' | 'serif' | 'display' | 'handwritten' | 'mono';

/**
 * Default fonts for each font style category.
 * Used when a preset doesn't have a specific mapping.
 */
export const DEFAULT_FONT_BY_STYLE: Record<PresetFontStyle, {
  title: FontFamilyKey;
  body: FontFamilyKey;
}> = {
  'sans-serif': {
    title: 'Inter-SemiBold',
    body: 'Inter-Regular',
  },
  serif: {
    title: 'PlayfairDisplay-SemiBold',
    body: 'Lora-Regular',
  },
  display: {
    title: 'Outfit-Bold',
    body: 'Poppins-Regular',
  },
  handwritten: {
    title: 'Caveat-Bold',
    body: 'Caveat-Regular',
  },
  mono: {
    title: 'JetBrainsMono-Medium',
    body: 'JetBrainsMono-Regular',
  },
};

// ============================================
// System Font Fallbacks
// ============================================

/**
 * Native system fonts to use while Google Fonts are loading,
 * or if they fail to load.
 */
export const SYSTEM_FONT_FALLBACKS: Record<PresetFontStyle, string> = {
  'sans-serif': 'System',
  serif: 'Georgia',
  display: 'System',
  handwritten: 'System',
  mono: 'Menlo',
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get the actual font family name from a font key.
 */
export function getFontFamilyName(key: FontFamilyKey): string {
  return FONT_FAMILIES[key];
}

/**
 * Get fonts for a specific label preset.
 */
export function getPresetFonts(
  presetId: LabelPresetId,
  fontStyle: PresetFontStyle
): {
  titleFontFamily: string;
  bodyFontFamily: string;
  titleFallback: string;
  bodyFallback: string;
} {
  // Check if preset has specific font mapping
  const presetMapping = PRESET_FONT_MAPPING[presetId];
  if (presetMapping) {
    return {
      titleFontFamily: getFontFamilyName(presetMapping.title),
      bodyFontFamily: getFontFamilyName(presetMapping.body),
      titleFallback: SYSTEM_FONT_FALLBACKS[fontStyle],
      bodyFallback: SYSTEM_FONT_FALLBACKS[fontStyle],
    };
  }

  // Fall back to default font by style category
  const defaultMapping = DEFAULT_FONT_BY_STYLE[fontStyle];
  return {
    titleFontFamily: getFontFamilyName(defaultMapping.title),
    bodyFontFamily: getFontFamilyName(defaultMapping.body),
    titleFallback: SYSTEM_FONT_FALLBACKS[fontStyle],
    bodyFallback: SYSTEM_FONT_FALLBACKS[fontStyle],
  };
}
