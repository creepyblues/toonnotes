// ============================================
// Board Preset Design Specifications
// 20 Unique Board Themes aligned with Label Presets
// ============================================

export type BoardBgStyle =
  | 'checklist'
  | 'gradient-warm'
  | 'paper-stack'
  | 'gradient-mint'
  | 'bookshelf'
  | 'cinema'
  | 'stars-rating'
  | 'hearts'
  | 'lightbulb-glow'
  | 'constellation'
  | 'profile-cards'
  | 'sparkle-burst'
  | 'kraft-paper'
  | 'sketch-lines'
  | 'quote-marks'
  | 'data-grid'
  | 'leather-texture'
  | 'polaroid-scatter'
  | 'starfield'
  | 'paint-splatter';

export type DecorationStyle =
  | 'scattered-checks'
  | 'floating-emoji'
  | 'corner-cluster'
  | 'bottom-row'
  | 'top-row'
  | 'scattered'
  | 'radial-burst'
  | 'mystery-scatter'
  | 'corner-accent'
  | 'celebration'
  | 'corner-doodle'
  | 'wip-banner'
  | 'large-quotes'
  | 'corner-icons'
  | 'diary-lock'
  | 'photo-corners'
  | 'night-sky'
  | 'artistic-splash'
  | 'none';

export type BoardCategory = 'Productivity' | 'Reading' | 'Creative' | 'Content' | 'Personal';

export interface BoardPresetColors {
  bg: string;
  bgSecondary: string;
  accent: string;
  badge: string;
  badgeText: string;
  labelText: string;
  notePreview: string;
}

export interface BoardPreset {
  id: string;
  name: string;
  category: BoardCategory;
  colors: BoardPresetColors;
  bgStyle: BoardBgStyle;
  decorations: string[];
  decorationStyle: DecorationStyle;
  description: string;
  boardIcon: string; // Phosphor icon name for board background
}

// ============================================
// 20 Board Presets
// ============================================

export const BOARD_PRESETS: BoardPreset[] = [
  // ============================================
  // PRODUCTIVITY (4)
  // ============================================
  {
    id: 'todo',
    name: 'Todo',
    category: 'Productivity',
    colors: {
      bg: '#2D3436',
      bgSecondary: '#636E72',
      accent: '#FF6B6B',
      badge: '#FF6B6B',
      badgeText: '#FFFFFF',
      labelText: '#FFFFFF',
      notePreview: '#FFF5F5',
    },
    bgStyle: 'checklist',
    decorations: ['✓', '○'],
    decorationStyle: 'scattered-checks',
    description: 'Dark slate with checklist pattern',
    boardIcon: 'CheckCircle',
  },
  {
    id: 'important',
    name: 'Important',
    category: 'Productivity',
    colors: {
      bg: '#E17055',
      bgSecondary: '#D63031',
      accent: '#FDCB6E',
      badge: '#FDCB6E',
      badgeText: '#2D3436',
      labelText: '#FFFFFF',
      notePreview: '#FEF3E2',
    },
    bgStyle: 'gradient-warm',
    decorations: ['🔥', '⚡'],
    decorationStyle: 'floating-emoji',
    description: 'Warm orange gradient with fire accents',
    boardIcon: 'StarFour',
  },
  {
    id: 'archive',
    name: 'Archive',
    category: 'Productivity',
    colors: {
      bg: '#DFE6E9',
      bgSecondary: '#B2BEC3',
      accent: '#636E72',
      badge: '#636E72',
      badgeText: '#FFFFFF',
      labelText: '#2D3436',
      notePreview: '#FFFFFF',
    },
    bgStyle: 'paper-stack',
    decorations: [],
    decorationStyle: 'none',
    description: 'Clean gray with paper texture',
    boardIcon: 'Archive',
  },
  {
    id: 'goals',
    name: 'Goals',
    category: 'Productivity',
    colors: {
      bg: '#00B894',
      bgSecondary: '#00CEC9',
      accent: '#55EFC4',
      badge: '#FFFFFF',
      badgeText: '#00B894',
      labelText: '#FFFFFF',
      notePreview: '#E8FDF5',
    },
    bgStyle: 'gradient-mint',
    decorations: ['⛰️', '🎯', '✨'],
    decorationStyle: 'corner-cluster',
    description: 'Fresh mint gradient with achievement icons',
    boardIcon: 'Crosshair',
  },

  // ============================================
  // READING & WATCHING (4)
  // ============================================
  {
    id: 'reading',
    name: 'Reading',
    category: 'Reading',
    colors: {
      bg: '#6C5CE7',
      bgSecondary: '#A29BFE',
      accent: '#DDA0DD',
      badge: '#FFFFFF',
      badgeText: '#6C5CE7',
      labelText: '#FFFFFF',
      notePreview: '#F3F0FF',
    },
    bgStyle: 'bookshelf',
    decorations: ['📖', '📚'],
    decorationStyle: 'bottom-row',
    description: 'Purple with book spine pattern',
    boardIcon: 'Books',
  },
  {
    id: 'watchlist',
    name: 'Watchlist',
    category: 'Reading',
    colors: {
      bg: '#2D3436',
      bgSecondary: '#0984E3',
      accent: '#74B9FF',
      badge: '#74B9FF',
      badgeText: '#FFFFFF',
      labelText: '#FFFFFF',
      notePreview: '#E8F4FD',
    },
    bgStyle: 'cinema',
    decorations: ['🎬', '🍿', '📺'],
    decorationStyle: 'floating-emoji',
    description: 'Dark theater with screen glow',
    boardIcon: 'FilmSlate',
  },
  {
    id: 'review',
    name: 'Review',
    category: 'Reading',
    colors: {
      bg: '#FDCB6E',
      bgSecondary: '#F39C12',
      accent: '#E17055',
      badge: '#2D3436',
      badgeText: '#FDCB6E',
      labelText: '#2D3436',
      notePreview: '#FFFBF0',
    },
    bgStyle: 'stars-rating',
    decorations: ['⭐', '⭐', '⭐'],
    decorationStyle: 'top-row',
    description: 'Golden with star rating decoration',
    boardIcon: 'ChatTeardrop',
  },
  {
    id: 'recommendation',
    name: 'Recommendation',
    category: 'Reading',
    colors: {
      bg: '#FD79A8',
      bgSecondary: '#E84393',
      accent: '#FDCCE5',
      badge: '#FFFFFF',
      badgeText: '#FD79A8',
      labelText: '#FFFFFF',
      notePreview: '#FFF0F6',
    },
    bgStyle: 'hearts',
    decorations: ['💝', '💌', '✨'],
    decorationStyle: 'scattered',
    description: 'Pink with floating hearts',
    boardIcon: 'HeartHalf',
  },

  // ============================================
  // CREATIVE & FANDOM (4)
  // ============================================
  {
    id: 'ideas',
    name: 'Ideas',
    category: 'Creative',
    colors: {
      bg: '#2D3436',
      bgSecondary: '#FFEAA7',
      accent: '#FDCB6E',
      badge: '#FFEAA7',
      badgeText: '#2D3436',
      labelText: '#FFEAA7',
      notePreview: '#FFFEF5',
    },
    bgStyle: 'lightbulb-glow',
    decorations: ['💡', '✨', '⚡'],
    decorationStyle: 'radial-burst',
    description: 'Dark with glowing lightbulb center',
    boardIcon: 'LightbulbFilament',
  },
  {
    id: 'theory',
    name: 'Theory',
    category: 'Creative',
    colors: {
      bg: '#2D3436',
      bgSecondary: '#9B59B6',
      accent: '#8E44AD',
      badge: '#9B59B6',
      badgeText: '#FFFFFF',
      labelText: '#DDA0DD',
      notePreview: '#F5EEFF',
    },
    bgStyle: 'constellation',
    decorations: ['🔮', '🔍', '❓'],
    decorationStyle: 'mystery-scatter',
    description: 'Dark with constellation lines',
    boardIcon: 'Atom',
  },
  {
    id: 'character',
    name: 'Character',
    category: 'Creative',
    colors: {
      bg: '#00CEC9',
      bgSecondary: '#81ECEC',
      accent: '#00B894',
      badge: '#FFFFFF',
      badgeText: '#00CEC9',
      labelText: '#FFFFFF',
      notePreview: '#E8FFFE',
    },
    bgStyle: 'profile-cards',
    decorations: ['🎭', '👤'],
    decorationStyle: 'corner-accent',
    description: 'Teal with silhouette motif',
    boardIcon: 'UsersFour',
  },
  {
    id: 'favorites',
    name: 'Favorites',
    category: 'Creative',
    colors: {
      bg: '#E84393',
      bgSecondary: '#FD79A8',
      accent: '#FDCCE5',
      badge: '#FFFFFF',
      badgeText: '#E84393',
      labelText: '#FFFFFF',
      notePreview: '#FFEBF5',
    },
    bgStyle: 'sparkle-burst',
    decorations: ['💖', '⭐', '✨'],
    decorationStyle: 'celebration',
    description: 'Magenta with sparkle explosion',
    boardIcon: 'HeartBreak',
  },

  // ============================================
  // CONTENT & WRITING (4)
  // ============================================
  {
    id: 'blog',
    name: 'Blog',
    category: 'Content',
    colors: {
      bg: '#FDF8F3',
      bgSecondary: '#E8D5C4',
      accent: '#2D3436',
      badge: '#2D3436',
      badgeText: '#FDF8F3',
      labelText: '#2D3436',
      notePreview: '#FFFFFF',
    },
    bgStyle: 'kraft-paper',
    decorations: ['✍️', '📝'],
    decorationStyle: 'corner-doodle',
    description: 'Kraft paper with pen doodles',
    boardIcon: 'Feather',
  },
  {
    id: 'draft',
    name: 'Draft',
    category: 'Content',
    colors: {
      bg: '#F0F8FF',
      bgSecondary: '#A3DAFF',
      accent: '#74B9FF',
      badge: '#74B9FF',
      badgeText: '#FFFFFF',
      labelText: '#636E72',
      notePreview: '#FFFFFF',
    },
    bgStyle: 'sketch-lines',
    decorations: ['🚧', '📋'],
    decorationStyle: 'wip-banner',
    description: 'Light blue with sketch grid',
    boardIcon: 'FileText',
  },
  {
    id: 'quotes',
    name: 'Quotes',
    category: 'Content',
    colors: {
      bg: '#2D3436',
      bgSecondary: '#636E72',
      accent: '#DFE6E9',
      badge: '#DFE6E9',
      badgeText: '#2D3436',
      labelText: '#FFFFFF',
      notePreview: '#FAFBFC',
    },
    bgStyle: 'quote-marks',
    decorations: ['"', '"'],
    decorationStyle: 'large-quotes',
    description: 'Dark with elegant quote marks',
    boardIcon: 'ChatCenteredDots',
  },
  {
    id: 'research',
    name: 'Research',
    category: 'Content',
    colors: {
      bg: '#0984E3',
      bgSecondary: '#74B9FF',
      accent: '#FFFFFF',
      badge: '#FFFFFF',
      badgeText: '#0984E3',
      labelText: '#FFFFFF',
      notePreview: '#EDF5FC',
    },
    bgStyle: 'data-grid',
    decorations: ['🔬', '📊', '🔎'],
    decorationStyle: 'corner-icons',
    description: 'Blue with data visualization pattern',
    boardIcon: 'Flask',
  },

  // ============================================
  // PERSONAL & REFLECTION (4)
  // ============================================
  {
    id: 'journal',
    name: 'Journal',
    category: 'Personal',
    colors: {
      bg: '#D4A574',
      bgSecondary: '#C49A6C',
      accent: '#8B7355',
      badge: '#5D4E37',
      badgeText: '#F8E9C7',
      labelText: '#5D4E37',
      notePreview: '#FFFDF5',
    },
    bgStyle: 'leather-texture',
    decorations: ['🔒', '📔'],
    decorationStyle: 'diary-lock',
    description: 'Leather journal texture',
    boardIcon: 'BookBookmark',
  },
  {
    id: 'memory',
    name: 'Memory',
    category: 'Personal',
    colors: {
      bg: '#F9FAFB',
      bgSecondary: '#DFE6E9',
      accent: '#B2BEC3',
      badge: '#636E72',
      badgeText: '#FFFFFF',
      labelText: '#636E72',
      notePreview: '#FFFFFF',
    },
    bgStyle: 'polaroid-scatter',
    decorations: ['📷', '🌸', '✨'],
    decorationStyle: 'photo-corners',
    description: 'Soft gray with polaroid frames',
    boardIcon: 'ImageSquare',
  },
  {
    id: 'inspiration',
    name: 'Inspiration',
    category: 'Personal',
    colors: {
      bg: '#2D3436',
      bgSecondary: '#4A4A4A',
      accent: '#F8B500',
      badge: '#F8B500',
      badgeText: '#2D3436',
      labelText: '#FFFFFF',
      notePreview: '#FFFEF0',
    },
    bgStyle: 'starfield',
    decorations: ['⭐', '✨', '🌟'],
    decorationStyle: 'night-sky',
    description: 'Night sky with golden stars',
    boardIcon: 'Sparkle',
  },
  {
    id: 'art',
    name: 'Art',
    category: 'Personal',
    colors: {
      bg: '#FFFFFF',
      bgSecondary: '#FFF5F2',
      accent: '#E17055',
      badge: '#E17055',
      badgeText: '#FFFFFF',
      labelText: '#2D3436',
      notePreview: '#FFF5F2',
    },
    bgStyle: 'paint-splatter',
    decorations: ['🎨', '🖌️', '🖼️'],
    decorationStyle: 'artistic-splash',
    description: 'White canvas with paint splatters',
    boardIcon: 'PaintBrush',
  },
];

// ============================================
// Helper Functions
// ============================================

export const getBoardPresetById = (id: string): BoardPreset | undefined =>
  BOARD_PRESETS.find((p) => p.id === id);

export const getBoardPresetByName = (name: string): BoardPreset | undefined =>
  BOARD_PRESETS.find((p) => p.name.toLowerCase() === name.toLowerCase());

// Match hashtag to preset (case-insensitive, handles "#" prefix)
export const getPresetForHashtag = (hashtag: string): BoardPreset | undefined => {
  const normalized = hashtag.replace(/^#/, '').toLowerCase();
  return BOARD_PRESETS.find((p) => p.name.toLowerCase() === normalized);
};

export const getBoardPresetsByCategory = (category: BoardCategory): BoardPreset[] =>
  BOARD_PRESETS.filter((p) => p.category === category);

export const BOARD_CATEGORIES: BoardCategory[] = [
  'Productivity',
  'Reading',
  'Creative',
  'Content',
  'Personal',
];

// Category colors for section headers
export const BOARD_CATEGORY_COLORS: Record<BoardCategory, string> = {
  Productivity: '#FF6B6B',
  Reading: '#6C5CE7',
  Creative: '#00CEC9',
  Content: '#74B9FF',
  Personal: '#F8B500',
};
