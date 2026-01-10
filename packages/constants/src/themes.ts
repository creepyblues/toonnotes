/**
 * Design Theme Presets for ToonNotes
 *
 * @deprecated This file contains legacy theme presets (7 anime themes).
 * New features should use Label Presets from `constants/labelPresets.ts`
 * which provides 20 label-based design presets.
 *
 * These themes are kept for backward compatibility with existing designs
 * and the SYSTEM_DEFAULT_DESIGNS array used in the design picker.
 *
 * Migration path:
 * - ThemePicker -> LabelPresetPicker (in components/ThemePicker.tsx)
 * - generateThemedDesign -> generateLabelPresetDesign (in geminiService.ts)
 * - composeThemeStyle -> composeLabelPresetStyle (in designEngine.ts)
 */

import type {
  DesignTheme,
  ThemeId,
  NoteDesign,
  BackgroundStyle,
  TypographyStyle,
  TypographyVibe,
} from '@toonnotes/types';

// ============================================
// Theme Definitions
// ============================================

/**
 * Ghibli Dreamscape
 * Watercolor magic, soft and nostalgic
 */
const GHIBLI: DesignTheme = {
  id: 'ghibli',
  name: 'Ghibli Dreamscape',
  emoji: '🎨',
  description: 'Soft watercolor magic with dreamy, nostalgic vibes',

  colors: {
    background: '#F5E6D3',     // Warm cream
    backgroundSecondary: '#E8D5C4', // Soft peach undertone
    title: '#5C4033',          // Warm brown
    body: '#6B5B4F',           // Muted brown
    accent: '#7BA3B5',         // Sky blue
  },

  background: {
    style: 'solid',
    defaultOpacity: 0.15,
  },

  typography: {
    titleStyle: 'serif',
    vibe: 'classic',
  },

  accents: {
    type: 'clouds',
    positions: ['corners', 'scattered'],
    animated: false,
  },

  stickerHint: {
    artStyle: 'watercolor soft shading, gentle brush strokes, Ghibli-inspired',
    mood: 'warm',
    defaultPosition: 'bottom-right',
    defaultScale: 'medium',
  },

  aiPromptHints: [
    'soft watercolor style',
    'dreamy atmosphere',
    'warm pastel colors',
    'gentle hand-drawn feel',
    'nostalgic and cozy',
  ],
};

/**
 * Manga Panel
 * Bold, dynamic, classic manga feel
 */
const MANGA: DesignTheme = {
  id: 'manga',
  name: 'Manga Panel',
  emoji: '📖',
  description: 'Bold black borders with classic manga screentone',

  colors: {
    background: '#FFFEF7',     // Slightly warm white
    title: '#1A1A1A',          // Near black
    body: '#333333',           // Dark gray
    accent: '#FF4444',         // Manga red
  },

  background: {
    style: 'solid',
    defaultOpacity: 0.15,
  },

  typography: {
    titleStyle: 'sans-serif',
    vibe: 'dramatic',
  },

  accents: {
    type: 'speed_lines',
    positions: ['edges'],
    color: '#000000',
  },

  stickerHint: {
    artStyle: 'high contrast manga style, bold ink lines, minimal shading',
    mood: 'energetic',
    defaultPosition: 'bottom-right',
    defaultScale: 'large',
  },

  aiPromptHints: [
    'manga art style',
    'bold black outlines',
    'high contrast',
    'screentone shading',
    'dramatic composition',
  ],
};

/**
 * Webtoon Modern
 * Clean, minimal, scroll-optimized
 */
const WEBTOON: DesignTheme = {
  id: 'webtoon',
  name: 'Webtoon Modern',
  emoji: '📱',
  description: 'Clean and minimal with subtle shadows',

  colors: {
    background: '#FFFFFF',
    title: '#2D3436',          // Dark slate
    body: '#636E72',           // Medium gray
    accent: '#00B894',         // Mint green
  },

  background: {
    style: 'solid',
    defaultOpacity: 0,
  },

  typography: {
    titleStyle: 'sans-serif',
    vibe: 'modern',
  },

  accents: {
    type: 'none',
    positions: [],
  },

  stickerHint: {
    artStyle: 'clean digital art, soft cel shading, webtoon style',
    mood: 'cool',
    defaultPosition: 'bottom-right',
    defaultScale: 'medium',
  },

  aiPromptHints: [
    'clean digital art',
    'modern webtoon style',
    'soft shading',
    'minimal design',
    'pastel accent colors',
  ],
};

/**
 * Shoujo Romance
 * Sparkles, flowers, dreamy vibes
 */
const SHOUJO: DesignTheme = {
  id: 'shoujo',
  name: 'Shoujo Romance',
  emoji: '💕',
  description: 'Dreamy sparkles with soft pink gradients',

  colors: {
    background: '#FFF0F5',     // Lavender blush
    backgroundSecondary: '#FFE4EC', // Soft pink
    title: '#9B4DCA',          // Purple
    body: '#7B6B8D',           // Muted purple
    accent: '#FF69B4',         // Hot pink
  },

  background: {
    style: 'solid',
    defaultOpacity: 0.15,
  },

  typography: {
    titleStyle: 'serif',
    vibe: 'cute',
  },

  accents: {
    type: 'sparkles',
    positions: ['corners', 'around_sticker', 'scattered'],
    animated: true,
  },

  stickerHint: {
    artStyle: 'shoujo manga style, sparkling eyes, soft blush, flower accents',
    mood: 'warm',
    defaultPosition: 'bottom-right',
    defaultScale: 'medium',
  },

  aiPromptHints: [
    'shoujo manga aesthetic',
    'sparkles and flowers',
    'soft romantic colors',
    'dreamy atmosphere',
    'bishojo/bishonen style',
  ],
};

/**
 * Shonen Impact
 * Explosive, energetic, action-packed
 */
const SHONEN: DesignTheme = {
  id: 'shonen',
  name: 'Shonen Impact',
  emoji: '🔥',
  description: 'Explosive energy with bold impact effects',

  colors: {
    background: '#1A1A2E',     // Dark blue-black
    backgroundSecondary: '#16213E', // Navy
    title: '#FFFFFF',          // White
    body: '#E8E8E8',           // Light gray
    accent: '#FF6B35',         // Fiery orange
  },

  background: {
    style: 'solid',
    defaultOpacity: 0.15,
  },

  typography: {
    titleStyle: 'sans-serif',
    vibe: 'dramatic',
  },

  accents: {
    type: 'impact_stars',
    positions: ['corners', 'edges'],
    color: '#FFD700',
    animated: true,
  },

  stickerHint: {
    artStyle: 'dynamic action pose, shonen manga style, bold linework, energy effects',
    mood: 'energetic',
    defaultPosition: 'bottom-right',
    defaultScale: 'large',
  },

  aiPromptHints: [
    'shonen action style',
    'dynamic poses',
    'energy effects',
    'bold dramatic colors',
    'impact frames',
  ],
};

/**
 * Kawaii Memo
 * Cute Japanese stationery style
 */
const KAWAII: DesignTheme = {
  id: 'kawaii',
  name: 'Kawaii Memo',
  emoji: '🎌',
  description: 'Adorable Japanese stationery with cute doodles',

  colors: {
    background: '#FFFBF0',     // Warm cream
    title: '#FF6B9D',          // Kawaii pink
    body: '#666666',           // Medium gray
    accent: '#FFB347',         // Peach
  },

  background: {
    style: 'solid',
    defaultOpacity: 0.15,
  },

  typography: {
    titleStyle: 'sans-serif',
    vibe: 'cute',
  },

  accents: {
    type: 'hearts',
    positions: ['corners', 'scattered'],
    animated: false,
  },

  stickerHint: {
    artStyle: 'chibi kawaii style, big eyes, soft colors, cute expression',
    mood: 'playful',
    defaultPosition: 'bottom-right',
    defaultScale: 'medium',
  },

  aiPromptHints: [
    'kawaii cute style',
    'chibi proportions',
    'pastel colors',
    'adorable expression',
    'Japanese stationery aesthetic',
  ],
};

/**
 * Vintage Anime
 * 90s/Y2K anime aesthetic
 */
const VINTAGE: DesignTheme = {
  id: 'vintage',
  name: 'Vintage Anime',
  emoji: '🌙',
  description: 'Nostalgic 90s anime with retro grain',

  colors: {
    background: '#2C2137',     // Dark purple
    backgroundSecondary: '#1A1423', // Deeper purple
    title: '#FFE66D',          // Retro yellow
    body: '#C9B1FF',           // Light purple
    accent: '#FF6B9D',         // 90s pink
  },

  background: {
    style: 'solid',
    defaultOpacity: 0.15,
  },

  typography: {
    titleStyle: 'sans-serif',
    vibe: 'dramatic',
  },

  accents: {
    type: 'retro_shapes',
    positions: ['corners', 'edges'],
    color: '#FFE66D',
  },

  stickerHint: {
    artStyle: '90s anime style, Sailor Moon era, retro cel shading, VHS aesthetic',
    mood: 'cool',
    defaultPosition: 'bottom-right',
    defaultScale: 'medium',
  },

  aiPromptHints: [
    '90s anime aesthetic',
    'retro cel shading',
    'Y2K nostalgia',
    'muted VHS colors',
    'Sailor Moon / Eva era style',
  ],
};

// ============================================
// Theme Collection
// ============================================

export const DESIGN_THEMES: Record<ThemeId, DesignTheme> = {
  ghibli: GHIBLI,
  manga: MANGA,
  webtoon: WEBTOON,
  shoujo: SHOUJO,
  shonen: SHONEN,
  kawaii: KAWAII,
  vintage: VINTAGE,
};

// Ordered array for UI display
export const THEME_LIST: DesignTheme[] = [
  GHIBLI,
  MANGA,
  WEBTOON,
  SHOUJO,
  SHONEN,
  KAWAII,
  VINTAGE,
];

// ============================================
// Helper Functions
// ============================================

export function getThemeById(id: ThemeId): DesignTheme {
  return DESIGN_THEMES[id];
}

export function getRandomTheme(): DesignTheme {
  const themes = THEME_LIST;
  return themes[Math.floor(Math.random() * themes.length)];
}

/**
 * Get AI prompt for sticker generation based on theme
 */
export function getThemeStickerPrompt(theme: DesignTheme, characterDescription: string): string {
  const styleHints = theme.aiPromptHints.join(', ');
  return `Create a character sticker: ${characterDescription}. Art style: ${theme.stickerHint.artStyle}. Additional style hints: ${styleHints}. The character should match the ${theme.name} aesthetic.`;
}

/**
 * Get colors adjusted by AI based on source image
 * Returns the theme's default colors merged with any AI-suggested adjustments
 */
export function mergeThemeWithAIColors(
  theme: DesignTheme,
  aiColors?: Partial<DesignTheme['colors']>
): DesignTheme['colors'] {
  if (!aiColors) return theme.colors;
  return {
    ...theme.colors,
    ...aiColors,
  };
}

/**
 * Convert a DesignTheme to a NoteDesign object for system presets.
 * These are built-in designs that users can apply without creating custom ones.
 * System presets use solid color backgrounds only (no patterns or blurred images).
 */
export function themeToSystemDesign(theme: DesignTheme): NoteDesign {
  return {
    id: `system-${theme.id}`,
    name: theme.name,
    sourceImageUri: '', // System presets don't have source images
    createdAt: 0, // System presets have no creation time

    background: {
      primaryColor: theme.colors.background,
      secondaryColor: theme.colors.backgroundSecondary,
      style: 'solid' as BackgroundStyle, // Always solid for system presets
    },

    colors: {
      titleText: theme.colors.title,
      bodyText: theme.colors.body,
      accent: theme.colors.accent,
    },

    typography: {
      titleStyle: theme.typography.titleStyle as TypographyStyle,
      vibe: theme.typography.vibe as TypographyVibe,
    },

    sticker: {
      id: `system-${theme.id}`,
      imageUri: '', // System presets don't have sticker images
      description: `${theme.name} themed sticker`,
      suggestedPosition: theme.stickerHint.defaultPosition,
      scale: theme.stickerHint.defaultScale,
    },

    designSummary: theme.description,

    // Mark as system default
    isSystemDefault: true,
    themeId: theme.id,
  };
}

/**
 * Get all system default designs (7 theme presets)
 */
export const SYSTEM_DEFAULT_DESIGNS: NoteDesign[] = THEME_LIST.map(themeToSystemDesign);
