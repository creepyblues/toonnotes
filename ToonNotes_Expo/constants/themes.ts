/**
 * Design Theme Presets for ToonNotes
 *
 * 7 anime/manga-inspired themes for creating beautiful, shareable notes.
 * Each theme defines colors, borders, accents, and AI generation hints.
 */

import { DesignTheme, ThemeId } from '@/types';

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
    border: '#D4C4B0',         // Soft tan
  },

  background: {
    style: 'pattern',
    patternId: 'watercolor-wash',
    defaultOpacity: 0.25,
    gradient: {
      direction: 'vertical',
      colors: ['#E8F4F8', '#F5E6D3'], // Sky to cream
    },
  },

  border: {
    template: 'watercolor',
    thickness: 'thin',
    customRadius: 16,
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
    border: '#000000',         // Pure black
  },

  background: {
    style: 'pattern',
    patternId: 'screentone-light',
    defaultOpacity: 0.12,
  },

  border: {
    template: 'panel',
    thickness: 'thick',
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
    border: '#DFE6E9',         // Light gray
  },

  background: {
    style: 'solid',
    defaultOpacity: 0,
  },

  border: {
    template: 'webtoon',
    thickness: 'thin',
    customRadius: 12,
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
    border: '#FFB6C1',         // Light pink
  },

  background: {
    style: 'gradient',
    patternId: 'paper-subtle',
    defaultOpacity: 0.15,
    gradient: {
      direction: 'diagonal',
      colors: ['#FFE4EC', '#E8D5F5'], // Pink to lavender
    },
  },

  border: {
    template: 'shoujo',
    thickness: 'medium',
    customRadius: 24,
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
    border: '#4A00E0',         // Electric purple
  },

  background: {
    style: 'gradient',
    patternId: 'halftone',
    defaultOpacity: 0.15,
    gradient: {
      direction: 'diagonal',
      colors: ['#0F0C29', '#302B63', '#24243E'], // Dark gradient
    },
  },

  border: {
    template: 'impact',
    thickness: 'thick',
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
    border: '#FFD1DC',         // Light pink
  },

  background: {
    style: 'pattern',
    patternId: 'dots-small',
    defaultOpacity: 0.15,
  },

  border: {
    template: 'sticker',
    thickness: 'medium',
    customRadius: 20,
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
    border: '#4A3B5C',         // Muted purple
  },

  background: {
    style: 'pattern',
    patternId: 'noise',
    defaultOpacity: 0.2,
    gradient: {
      direction: 'vertical',
      colors: ['#2C2137', '#1A1423'],
    },
  },

  border: {
    template: 'vintage_manga',
    thickness: 'medium',
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
