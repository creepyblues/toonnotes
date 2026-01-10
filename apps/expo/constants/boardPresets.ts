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
  // PRODUCTIVITY (4) - Muted/Professional
  // Slate and gray tones - serious, focused, gets-things-done vibe
  // ============================================
  {
    id: 'todo',
    name: 'Todo',
    category: 'Productivity',
    colors: {
      bg: '#475569', // slate-600
      bgSecondary: '#64748B', // slate-500
      accent: '#F87171', // red-400
      badge: '#F87171',
      badgeText: '#FFFFFF',
      labelText: '#FFFFFF',
      notePreview: '#FFF5F5',
    },
    bgStyle: 'checklist',
    decorations: ['✓', '○'],
    decorationStyle: 'scattered-checks',
    description: 'Professional slate with checklist pattern',
    boardIcon: 'CheckCircle',
  },
  {
    id: 'important',
    name: 'Important',
    category: 'Productivity',
    colors: {
      bg: '#7C2D12', // orange-900
      bgSecondary: '#9A3412', // orange-800
      accent: '#FDBA74', // orange-300
      badge: '#FDBA74',
      badgeText: '#7C2D12',
      labelText: '#FFFFFF',
      notePreview: '#FEF3E2',
    },
    bgStyle: 'gradient-warm',
    decorations: ['🔥', '⚡'],
    decorationStyle: 'floating-emoji',
    description: 'Deep burnt orange with urgency accents',
    boardIcon: 'StarFour',
  },
  {
    id: 'archive',
    name: 'Archive',
    category: 'Productivity',
    colors: {
      bg: '#64748B', // slate-500
      bgSecondary: '#94A3B8', // slate-400
      accent: '#CBD5E1', // slate-300
      badge: '#94A3B8',
      badgeText: '#FFFFFF',
      labelText: '#F1F5F9',
      notePreview: '#FFFFFF',
    },
    bgStyle: 'paper-stack',
    decorations: [],
    decorationStyle: 'none',
    description: 'Muted slate with paper texture',
    boardIcon: 'Archive',
  },
  {
    id: 'goals',
    name: 'Goals',
    category: 'Productivity',
    colors: {
      bg: '#065F46', // emerald-800
      bgSecondary: '#047857', // emerald-700
      accent: '#6EE7B7', // emerald-300
      badge: '#34D399', // emerald-400
      badgeText: '#FFFFFF',
      labelText: '#FFFFFF',
      notePreview: '#E8FDF5',
    },
    bgStyle: 'gradient-mint',
    decorations: ['⛰️', '🎯', '✨'],
    decorationStyle: 'corner-cluster',
    description: 'Deep emerald with achievement icons',
    boardIcon: 'Crosshair',
  },

  // ============================================
  // READING & WATCHING (4) - Rich/Immersive
  // Deep purples and blues - cozy, literary, cinematic feel
  // ============================================
  {
    id: 'reading',
    name: 'Reading',
    category: 'Reading',
    colors: {
      bg: '#5B21B6', // violet-800
      bgSecondary: '#6D28D9', // violet-700
      accent: '#C4B5FD', // violet-300
      badge: '#A78BFA', // violet-400
      badgeText: '#FFFFFF',
      labelText: '#FFFFFF',
      notePreview: '#F3F0FF',
    },
    bgStyle: 'bookshelf',
    decorations: ['📖', '📚'],
    decorationStyle: 'bottom-row',
    description: 'Deep violet with book spine pattern',
    boardIcon: 'Books',
  },
  {
    id: 'watchlist',
    name: 'Watchlist',
    category: 'Reading',
    colors: {
      bg: '#1E3A8A', // blue-900
      bgSecondary: '#1E40AF', // blue-800
      accent: '#93C5FD', // blue-300
      badge: '#60A5FA', // blue-400
      badgeText: '#FFFFFF',
      labelText: '#FFFFFF',
      notePreview: '#E8F4FD',
    },
    bgStyle: 'cinema',
    decorations: ['🎬', '🍿', '📺'],
    decorationStyle: 'floating-emoji',
    description: 'Deep navy theater with screen glow',
    boardIcon: 'FilmSlate',
  },
  {
    id: 'review',
    name: 'Review',
    category: 'Reading',
    colors: {
      bg: '#854D0E', // yellow-800
      bgSecondary: '#A16207', // yellow-700
      accent: '#FDE047', // yellow-300
      badge: '#FACC15', // yellow-400
      badgeText: '#FFFFFF',
      labelText: '#FFFFFF',
      notePreview: '#FFFBF0',
    },
    bgStyle: 'stars-rating',
    decorations: ['⭐', '⭐', '⭐'],
    decorationStyle: 'top-row',
    description: 'Rich amber with star rating decoration',
    boardIcon: 'ChatTeardrop',
  },
  {
    id: 'recommendation',
    name: 'Recommendation',
    category: 'Reading',
    colors: {
      bg: '#9D174D', // pink-800
      bgSecondary: '#BE185D', // pink-700
      accent: '#F9A8D4', // pink-300
      badge: '#F472B6', // pink-400
      badgeText: '#FFFFFF',
      labelText: '#FFFFFF',
      notePreview: '#FFF0F6',
    },
    bgStyle: 'hearts',
    decorations: ['💝', '💌', '✨'],
    decorationStyle: 'scattered',
    description: 'Deep rose with floating hearts',
    boardIcon: 'HeartHalf',
  },

  // ============================================
  // CREATIVE & FANDOM (4) - Vibrant/Dynamic
  // Bold, saturated colors - energetic, expressive, artistic
  // ============================================
  {
    id: 'ideas',
    name: 'Ideas',
    category: 'Creative',
    colors: {
      bg: '#0891B2', // cyan-600
      bgSecondary: '#06B6D4', // cyan-500
      accent: '#FBBF24', // amber-400
      badge: '#FCD34D', // amber-300
      badgeText: '#0891B2',
      labelText: '#FFFFFF',
      notePreview: '#FFFEF5',
    },
    bgStyle: 'lightbulb-glow',
    decorations: ['💡', '✨', '⚡'],
    decorationStyle: 'radial-burst',
    description: 'Vibrant cyan with golden sparks',
    boardIcon: 'LightbulbFilament',
  },
  {
    id: 'theory',
    name: 'Theory',
    category: 'Creative',
    colors: {
      bg: '#7C3AED', // violet-600
      bgSecondary: '#8B5CF6', // violet-500
      accent: '#FCA5A5', // red-300
      badge: '#F87171', // red-400
      badgeText: '#FFFFFF',
      labelText: '#FFFFFF',
      notePreview: '#F5EEFF',
    },
    bgStyle: 'constellation',
    decorations: ['🔮', '🔍', '❓'],
    decorationStyle: 'mystery-scatter',
    description: 'Electric violet with mystery accents',
    boardIcon: 'Atom',
  },
  {
    id: 'character',
    name: 'Character',
    category: 'Creative',
    colors: {
      bg: '#0D9488', // teal-600
      bgSecondary: '#14B8A6', // teal-500
      accent: '#5EEAD4', // teal-300
      badge: '#2DD4BF', // teal-400
      badgeText: '#FFFFFF',
      labelText: '#FFFFFF',
      notePreview: '#E8FFFE',
    },
    bgStyle: 'profile-cards',
    decorations: ['🎭', '👤'],
    decorationStyle: 'corner-accent',
    description: 'Rich teal with character silhouettes',
    boardIcon: 'UsersFour',
  },
  {
    id: 'favorites',
    name: 'Favorites',
    category: 'Creative',
    colors: {
      bg: '#DB2777', // pink-600
      bgSecondary: '#EC4899', // pink-500
      accent: '#FDE68A', // amber-200
      badge: '#FBBF24', // amber-400
      badgeText: '#DB2777',
      labelText: '#FFFFFF',
      notePreview: '#FFEBF5',
    },
    bgStyle: 'sparkle-burst',
    decorations: ['💖', '⭐', '✨'],
    decorationStyle: 'celebration',
    description: 'Hot pink with golden sparkles',
    boardIcon: 'HeartBreak',
  },

  // ============================================
  // CONTENT & WRITING (4) - Warm/Writerly
  // Earth tones - craft paper, coffee shop, writing desk
  // ============================================
  {
    id: 'blog',
    name: 'Blog',
    category: 'Content',
    colors: {
      bg: '#78716C', // stone-500
      bgSecondary: '#A8A29E', // stone-400
      accent: '#FDE68A', // amber-200
      badge: '#D6D3D1', // stone-300
      badgeText: '#44403C',
      labelText: '#FFFFFF',
      notePreview: '#FFFFFF',
    },
    bgStyle: 'kraft-paper',
    decorations: ['✍️', '📝'],
    decorationStyle: 'corner-doodle',
    description: 'Warm stone with pen doodles',
    boardIcon: 'Feather',
  },
  {
    id: 'draft',
    name: 'Draft',
    category: 'Content',
    colors: {
      bg: '#2563EB', // blue-600
      bgSecondary: '#3B82F6', // blue-500
      accent: '#BFDBFE', // blue-200
      badge: '#93C5FD', // blue-300
      badgeText: '#FFFFFF',
      labelText: '#FFFFFF',
      notePreview: '#FFFFFF',
    },
    bgStyle: 'sketch-lines',
    decorations: ['🚧', '📋'],
    decorationStyle: 'wip-banner',
    description: 'Blueprint blue with sketch grid',
    boardIcon: 'FileText',
  },
  {
    id: 'quotes',
    name: 'Quotes',
    category: 'Content',
    colors: {
      bg: '#374151', // gray-700
      bgSecondary: '#4B5563', // gray-600
      accent: '#E5E7EB', // gray-200
      badge: '#9CA3AF', // gray-400
      badgeText: '#FFFFFF',
      labelText: '#FFFFFF',
      notePreview: '#FAFBFC',
    },
    bgStyle: 'quote-marks',
    decorations: ['"', '"'],
    decorationStyle: 'large-quotes',
    description: 'Sophisticated gray with elegant quotes',
    boardIcon: 'ChatCenteredDots',
  },
  {
    id: 'research',
    name: 'Research',
    category: 'Content',
    colors: {
      bg: '#0369A1', // sky-700
      bgSecondary: '#0284C7', // sky-600
      accent: '#7DD3FC', // sky-300
      badge: '#38BDF8', // sky-400
      badgeText: '#FFFFFF',
      labelText: '#FFFFFF',
      notePreview: '#EDF5FC',
    },
    bgStyle: 'data-grid',
    decorations: ['🔬', '📊', '🔎'],
    decorationStyle: 'corner-icons',
    description: 'Deep sky blue with data patterns',
    boardIcon: 'Flask',
  },

  // ============================================
  // PERSONAL & REFLECTION (4) - Warm/Cozy
  // Warm amber, terracotta, rose - intimate, nostalgic, heartfelt
  // ============================================
  {
    id: 'journal',
    name: 'Journal',
    category: 'Personal',
    colors: {
      bg: '#92400E', // amber-800
      bgSecondary: '#B45309', // amber-700
      accent: '#FDE68A', // amber-200
      badge: '#FBBF24', // amber-400
      badgeText: '#FFFFFF',
      labelText: '#FFFFFF',
      notePreview: '#FFFDF5',
    },
    bgStyle: 'leather-texture',
    decorations: ['🔒', '📔'],
    decorationStyle: 'diary-lock',
    description: 'Rich leather journal texture',
    boardIcon: 'BookBookmark',
  },
  {
    id: 'memory',
    name: 'Memory',
    category: 'Personal',
    colors: {
      bg: '#6D28D9', // violet-700
      bgSecondary: '#7C3AED', // violet-600
      accent: '#DDD6FE', // violet-200
      badge: '#A78BFA', // violet-400
      badgeText: '#FFFFFF',
      labelText: '#FFFFFF',
      notePreview: '#FFFFFF',
    },
    bgStyle: 'polaroid-scatter',
    decorations: ['📷', '🌸', '✨'],
    decorationStyle: 'photo-corners',
    description: 'Dreamy violet with polaroid frames',
    boardIcon: 'ImageSquare',
  },
  {
    id: 'inspiration',
    name: 'Inspiration',
    category: 'Personal',
    colors: {
      bg: '#1F2937', // gray-800
      bgSecondary: '#374151', // gray-700
      accent: '#FCD34D', // amber-300
      badge: '#FBBF24', // amber-400
      badgeText: '#1F2937',
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
      bg: '#EA580C', // orange-600
      bgSecondary: '#F97316', // orange-500
      accent: '#FED7AA', // orange-200
      badge: '#FB923C', // orange-400
      badgeText: '#FFFFFF',
      labelText: '#FFFFFF',
      notePreview: '#FFF5F2',
    },
    bgStyle: 'paint-splatter',
    decorations: ['🎨', '🖌️', '🖼️'],
    decorationStyle: 'artistic-splash',
    description: 'Vibrant orange canvas with paint splatters',
    boardIcon: 'PaintBrush',
  },
];

// ============================================
// Auto-Generated Board Themes
// For hashtags that don't match any preset
// ============================================

// Keyword categories that map common words to color themes
const KEYWORD_THEMES: Record<string, string[]> = {
  warm: ['food', 'recipe', 'cooking', 'baking', 'dinner', 'lunch', 'breakfast', 'meal', 'kitchen', 'chef', 'restaurant', 'cafe', 'coffee', 'tea', 'shopping', 'grocery', 'groceries', 'shop', 'store', 'market'],
  cool: ['tech', 'code', 'coding', 'programming', 'dev', 'software', 'app', 'web', 'data', 'ai', 'computer', 'digital', 'cyber'],
  nature: ['nature', 'outdoor', 'outdoors', 'hiking', 'garden', 'gardening', 'plant', 'plants', 'travel', 'adventure', 'camping', 'beach', 'mountain', 'forest', 'ocean', 'wildlife'],
  creative: ['music', 'design', 'photo', 'photography', 'craft', 'crafts', 'diy', 'draw', 'drawing', 'paint', 'painting', 'sketch', 'illustration', 'anime', 'manga', 'webtoon', 'comic'],
  health: ['fitness', 'workout', 'workouts', 'gym', 'health', 'healthy', 'yoga', 'running', 'exercise', 'diet', 'nutrition', 'wellness', 'meditation', 'sports', 'sport'],
  finance: ['money', 'finance', 'financial', 'budget', 'budgeting', 'savings', 'saving', 'invest', 'investing', 'investment', 'crypto', 'stocks', 'trading', 'expense', 'expenses'],
  social: ['family', 'friends', 'party', 'birthday', 'wedding', 'event', 'events', 'celebration', 'holiday', 'holidays', 'vacation', 'dating', 'relationship', 'love', 'kids', 'baby'],
  learning: ['study', 'studying', 'learn', 'learning', 'school', 'class', 'course', 'courses', 'education', 'homework', 'exam', 'exams', 'test', 'university', 'college', 'language', 'math', 'science'],
};

// Curated color palettes for each theme
const GENERATED_PALETTES: Record<string, BoardPresetColors> = {
  warm: {
    bg: '#C2410C', // orange-700
    bgSecondary: '#EA580C', // orange-600
    accent: '#FDBA74', // orange-300
    badge: '#FB923C', // orange-400
    badgeText: '#FFFFFF',
    labelText: '#FFFFFF',
    notePreview: '#FFF7ED',
  },
  cool: {
    bg: '#1D4ED8', // blue-700
    bgSecondary: '#2563EB', // blue-600
    accent: '#93C5FD', // blue-300
    badge: '#60A5FA', // blue-400
    badgeText: '#FFFFFF',
    labelText: '#FFFFFF',
    notePreview: '#EFF6FF',
  },
  nature: {
    bg: '#047857', // emerald-700
    bgSecondary: '#059669', // emerald-600
    accent: '#6EE7B7', // emerald-300
    badge: '#34D399', // emerald-400
    badgeText: '#FFFFFF',
    labelText: '#FFFFFF',
    notePreview: '#ECFDF5',
  },
  creative: {
    bg: '#7C3AED', // violet-600
    bgSecondary: '#8B5CF6', // violet-500
    accent: '#C4B5FD', // violet-300
    badge: '#A78BFA', // violet-400
    badgeText: '#FFFFFF',
    labelText: '#FFFFFF',
    notePreview: '#F5F3FF',
  },
  health: {
    bg: '#15803D', // green-700
    bgSecondary: '#16A34A', // green-600
    accent: '#86EFAC', // green-300
    badge: '#4ADE80', // green-400
    badgeText: '#FFFFFF',
    labelText: '#FFFFFF',
    notePreview: '#F0FDF4',
  },
  finance: {
    bg: '#A16207', // yellow-700
    bgSecondary: '#CA8A04', // yellow-600
    accent: '#FDE047', // yellow-300
    badge: '#FACC15', // yellow-400
    badgeText: '#422006',
    labelText: '#FFFFFF',
    notePreview: '#FEFCE8',
  },
  social: {
    bg: '#BE185D', // pink-700
    bgSecondary: '#DB2777', // pink-600
    accent: '#F9A8D4', // pink-300
    badge: '#F472B6', // pink-400
    badgeText: '#FFFFFF',
    labelText: '#FFFFFF',
    notePreview: '#FDF2F8',
  },
  learning: {
    bg: '#0E7490', // cyan-700
    bgSecondary: '#0891B2', // cyan-600
    accent: '#67E8F9', // cyan-300
    badge: '#22D3EE', // cyan-400
    badgeText: '#FFFFFF',
    labelText: '#FFFFFF',
    notePreview: '#ECFEFF',
  },
};

// Icons for each theme (multiple options for variety)
const THEME_ICONS: Record<string, string[]> = {
  warm: ['ForkKnife', 'CookingPot', 'Coffee', 'Hamburger', 'BowlFood'],
  cool: ['Desktop', 'Code', 'Cpu', 'DeviceMobile', 'CloudArrowUp'],
  nature: ['Tree', 'Leaf', 'Mountains', 'Compass', 'Sun'],
  creative: ['MusicNotes', 'Palette', 'Camera', 'PencilLine', 'Microphone'],
  health: ['Heartbeat', 'Barbell', 'PersonSimpleRun', 'Heart', 'Bicycle'],
  finance: ['CurrencyDollar', 'PiggyBank', 'ChartLineUp', 'Wallet', 'Coins'],
  social: ['Users', 'Gift', 'Confetti', 'HandHeart', 'ChatCircle'],
  learning: ['GraduationCap', 'BookOpen', 'Brain', 'Student', 'Notebook'],
};

// Deterministic string hash function
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Generate a board preset for unknown hashtags
function generateBoardForHashtag(hashtag: string): BoardPreset {
  const normalized = hashtag.replace(/^#/, '').toLowerCase();

  // Find matching keyword theme
  let themeName: string | null = null;
  for (const [theme, keywords] of Object.entries(KEYWORD_THEMES)) {
    if (keywords.some(kw => normalized.includes(kw))) {
      themeName = theme;
      break;
    }
  }

  // If no keyword match, use hash to pick theme deterministically
  if (!themeName) {
    const themes = Object.keys(GENERATED_PALETTES);
    themeName = themes[hashString(normalized) % themes.length];
  }

  const colors = GENERATED_PALETTES[themeName];
  const displayName = normalized.charAt(0).toUpperCase() + normalized.slice(1);

  // Pick icon deterministically from theme's icon set
  const icons = THEME_ICONS[themeName];
  const iconIndex = hashString(normalized + 'icon') % icons.length;
  const boardIcon = icons[iconIndex];

  return {
    id: `auto-${normalized}`,
    name: displayName,
    category: 'Personal',
    colors,
    bgStyle: 'gradient-warm',
    decorations: [],
    decorationStyle: 'none',
    description: `Auto-generated board for #${normalized}`,
    boardIcon,
  };
}

// ============================================
// Helper Functions
// ============================================

export const getBoardPresetById = (id: string): BoardPreset | undefined =>
  BOARD_PRESETS.find((p) => p.id === id);

export const getBoardPresetByName = (name: string): BoardPreset | undefined =>
  BOARD_PRESETS.find((p) => p.name.toLowerCase() === name.toLowerCase());

// Match hashtag to preset (case-insensitive, handles "#" prefix)
// Always returns a preset - generates one if no exact match found
export const getPresetForHashtag = (hashtag: string): BoardPreset => {
  const normalized = hashtag.replace(/^#/, '').toLowerCase();

  // Try exact preset match first
  const exactMatch = BOARD_PRESETS.find((p) => p.name.toLowerCase() === normalized);
  if (exactMatch) return exactMatch;

  // Generate deterministic preset for unknown hashtags
  return generateBoardForHashtag(hashtag);
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
