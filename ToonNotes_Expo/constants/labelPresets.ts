/**
 * Label-Based Design Presets
 *
 * 20 unique label presets organized by category:
 * - Productivity: Todo, Important, Archive, Goals
 * - Reading: Reading, Watchlist, Review, Recommendation
 * - Creative: Ideas, Theory, Character, Favorites
 * - Content: Blog, Draft, Quotes, Research
 * - Personal: Journal, Memory, Inspiration, Art
 *
 * Each preset defines a complete visual design that auto-applies
 * when the corresponding label is added to a note.
 */

import { StickerPosition } from '@/types';

// ============================================
// Type Definitions
// ============================================

export type LabelPresetId =
  // Productivity
  | 'todo'
  | 'important'
  | 'archive'
  | 'goals'
  // Reading
  | 'reading'
  | 'watchlist'
  | 'review'
  | 'recommendation'
  // Creative
  | 'ideas'
  | 'theory'
  | 'character'
  | 'favorites'
  // Content
  | 'blog'
  | 'draft'
  | 'quotes'
  | 'research'
  // Personal
  | 'journal'
  | 'memory'
  | 'inspiration'
  | 'art';

export type LabelCategory =
  | 'productivity'
  | 'reading'
  | 'creative'
  | 'content'
  | 'personal';

export type PresetBgStyle = 'solid' | 'gradient' | 'pattern' | 'texture' | 'illustration';

export type PresetFontStyle =
  | 'sans-serif'
  | 'serif'
  | 'display'
  | 'handwritten'
  | 'mono';

export type PresetStickerType = 'corner' | 'floating' | 'border' | 'stamp' | 'none';

export type PresetMood =
  | 'energetic'
  | 'calm'
  | 'playful'
  | 'serious'
  | 'dreamy'
  | 'bold';

export interface LabelPreset {
  id: LabelPresetId;
  name: string;
  category: LabelCategory;
  icon: string;            // Enhanced emoji for boards (large, expressive)
  noteIcon: string;        // Phosphor icon name for notes (small, crisp)
  mood: PresetMood;
  description: string;

  colors: {
    primary: string; // Main accent color
    secondary: string; // Secondary accent
    bg: string; // Card background
    text: string; // Primary text color
  };

  bgStyle: PresetBgStyle;
  bgGradient?: string[]; // For gradient backgrounds
  bgPattern?: string; // Pattern identifier
  bgIllustration?: string; // Illustration identifier for illustration bg style

  fontStyle: PresetFontStyle;

  stickerType: PresetStickerType;
  stickerEmoji: string;
  stickerPosition: StickerPosition;

  // AI generation hints
  aiPromptHints: string[];
  artStyle: string;
}

// ============================================
// Category Colors (for UI grouping)
// ============================================

export const CATEGORY_COLORS: Record<LabelCategory, string> = {
  productivity: '#FF6B6B',
  reading: '#6C5CE7',
  creative: '#00CEC9',
  content: '#0984E3',
  personal: '#FDCB6E',
};

export const CATEGORY_LABELS: Record<LabelCategory, string> = {
  productivity: 'Productivity',
  reading: 'Reading',
  creative: 'Creative',
  content: 'Content',
  personal: 'Personal',
};

// ============================================
// 20 Label Presets
// ============================================

export const LABEL_PRESETS: Record<LabelPresetId, LabelPreset> = {
  // ==========================================
  // PRODUCTIVITY (4 presets)
  // ==========================================

  todo: {
    id: 'todo',
    name: 'Todo',
    category: 'productivity',
    icon: '✅✨',
    noteIcon: 'CheckSquare',
    mood: 'energetic',
    description: 'Tasks & action items',
    colors: {
      primary: '#FF6B6B',
      secondary: '#FFE66D',
      bg: '#FFF5F5',
      text: '#2D3436',
    },
    bgStyle: 'pattern',
    bgPattern: 'lines-horizontal',
    fontStyle: 'sans-serif',
    stickerType: 'corner',
    stickerEmoji: '✏️',
    stickerPosition: 'top-right',
    aiPromptHints: ['productivity', 'checklist', 'organized', 'focused'],
    artStyle: 'cute chibi character holding a pencil or checklist, anime style',
  },

  important: {
    id: 'important',
    name: 'Important',
    category: 'productivity',
    icon: '⭐🔥',
    noteIcon: 'Star',
    mood: 'bold',
    description: 'Priority & urgent notes',
    colors: {
      primary: '#E17055',
      secondary: '#FDCB6E',
      bg: '#FEF3E2',
      text: '#2D3436',
    },
    bgStyle: 'gradient',
    bgGradient: ['#FEF3E2', '#FDEAA8'],
    fontStyle: 'display',
    stickerType: 'stamp',
    stickerEmoji: '🔥',
    stickerPosition: 'bottom-right',
    aiPromptHints: ['important', 'priority', 'urgent', 'attention'],
    artStyle:
      'dynamic anime character with exclamation mark, bold pose, energetic',
  },

  archive: {
    id: 'archive',
    name: 'Archive',
    category: 'productivity',
    icon: '📦💫',
    noteIcon: 'Archive',
    mood: 'calm',
    description: 'Completed & stored',
    colors: {
      primary: '#636E72',
      secondary: '#B2BEC3',
      bg: '#F5F6F7',
      text: '#2D3436',
    },
    bgStyle: 'texture',
    bgPattern: 'paper-subtle',
    fontStyle: 'serif',
    stickerType: 'none',
    stickerEmoji: '📦',
    stickerPosition: 'bottom-right',
    aiPromptHints: ['archive', 'stored', 'completed', 'organized'],
    artStyle: 'minimalist anime character organizing boxes, calm expression',
  },

  goals: {
    id: 'goals',
    name: 'Goals',
    category: 'productivity',
    icon: '🎯✨',
    noteIcon: 'Target',
    mood: 'energetic',
    description: 'Personal goals & challenges',
    colors: {
      primary: '#00B894',
      secondary: '#55EFC4',
      bg: '#E8FDF5',
      text: '#2D3436',
    },
    bgStyle: 'illustration',
    bgIllustration: 'mountain-peak',
    fontStyle: 'display',
    stickerType: 'floating',
    stickerEmoji: '🏔️',
    stickerPosition: 'bottom-right',
    aiPromptHints: ['goals', 'achievement', 'motivation', 'success'],
    artStyle:
      'determined anime character reaching for the top, mountain backdrop',
  },

  // ==========================================
  // READING (4 presets)
  // ==========================================

  reading: {
    id: 'reading',
    name: 'Reading',
    category: 'reading',
    icon: '📚✨',
    noteIcon: 'BookOpen',
    mood: 'calm',
    description: 'Manga & book notes',
    colors: {
      primary: '#6C5CE7',
      secondary: '#A29BFE',
      bg: '#F3F0FF',
      text: '#2D3436',
    },
    bgStyle: 'pattern',
    bgPattern: 'lines-horizontal',
    fontStyle: 'serif',
    stickerType: 'corner',
    stickerEmoji: '📚',
    stickerPosition: 'top-right',
    aiPromptHints: ['reading', 'books', 'manga', 'literature', 'cozy'],
    artStyle:
      'cozy anime character reading a book, soft lighting, peaceful mood',
  },

  watchlist: {
    id: 'watchlist',
    name: 'Watchlist',
    category: 'reading',
    icon: '📺🍿',
    noteIcon: 'Television',
    mood: 'playful',
    description: 'Anime to watch',
    colors: {
      primary: '#0984E3',
      secondary: '#74B9FF',
      bg: '#E8F4FD',
      text: '#2D3436',
    },
    bgStyle: 'gradient',
    bgGradient: ['#E8F4FD', '#D4E9FC'],
    fontStyle: 'sans-serif',
    stickerType: 'floating',
    stickerEmoji: '🍿',
    stickerPosition: 'bottom-right',
    aiPromptHints: ['anime', 'watchlist', 'entertainment', 'excited'],
    artStyle:
      'excited anime character with popcorn watching screen, glowing eyes',
  },

  review: {
    id: 'review',
    name: 'Review',
    category: 'reading',
    icon: '⭐💭',
    noteIcon: 'ChatCircleText',
    mood: 'serious',
    description: 'Series reviews & ratings',
    colors: {
      primary: '#FDCB6E',
      secondary: '#F39C12',
      bg: '#FFFBF0',
      text: '#2D3436',
    },
    bgStyle: 'solid',
    fontStyle: 'sans-serif',
    stickerType: 'stamp',
    stickerEmoji: '🏆',
    stickerPosition: 'bottom-right',
    aiPromptHints: ['review', 'rating', 'critique', 'thoughtful'],
    artStyle:
      'anime character as critic with notepad, contemplative expression',
  },

  recommendation: {
    id: 'recommendation',
    name: 'Recommendation',
    category: 'reading',
    icon: '💝✨',
    noteIcon: 'HeartStraight',
    mood: 'playful',
    description: 'Series to share',
    colors: {
      primary: '#FD79A8',
      secondary: '#FDCCE5',
      bg: '#FFF0F6',
      text: '#2D3436',
    },
    bgStyle: 'pattern',
    bgPattern: 'lines-diagonal',
    fontStyle: 'handwritten',
    stickerType: 'border',
    stickerEmoji: '💌',
    stickerPosition: 'bottom-right',
    aiPromptHints: ['recommendation', 'sharing', 'love', 'enthusiasm'],
    artStyle:
      'cheerful anime character holding a heart, sharing excitement, shoujo style',
  },

  // ==========================================
  // CREATIVE (4 presets)
  // ==========================================

  ideas: {
    id: 'ideas',
    name: 'Ideas',
    category: 'creative',
    icon: '💡✨',
    noteIcon: 'Lightbulb',
    mood: 'energetic',
    description: 'Story concepts & inspiration',
    colors: {
      primary: '#FFEAA7',
      secondary: '#FDCB6E',
      bg: '#FFFEF5',
      text: '#2D3436',
    },
    bgStyle: 'illustration',
    bgIllustration: 'lightbulb-rays',
    fontStyle: 'display',
    stickerType: 'floating',
    stickerEmoji: '✨',
    stickerPosition: 'top-right',
    aiPromptHints: ['ideas', 'creativity', 'inspiration', 'lightbulb', 'spark'],
    artStyle:
      'imaginative anime character with lightbulb above head, sparkling eyes',
  },

  theory: {
    id: 'theory',
    name: 'Theory',
    category: 'creative',
    icon: '🔮🌀',
    noteIcon: 'Brain',
    mood: 'dreamy',
    description: 'Fan theories & predictions',
    colors: {
      primary: '#9B59B6',
      secondary: '#8E44AD',
      bg: '#F5EEFF',
      text: '#2D3436',
    },
    bgStyle: 'gradient',
    bgGradient: ['#F5EEFF', '#E8DAFF'],
    fontStyle: 'mono',
    stickerType: 'corner',
    stickerEmoji: '🔍',
    stickerPosition: 'top-right',
    aiPromptHints: ['theory', 'mystery', 'detective', 'thinking', 'analysis'],
    artStyle:
      'mysterious anime character with magnifying glass, detective vibe, purple aura',
  },

  character: {
    id: 'character',
    name: 'Character',
    category: 'creative',
    icon: '👤🎭',
    noteIcon: 'UserCircle',
    mood: 'serious',
    description: 'Character analysis',
    colors: {
      primary: '#00CEC9',
      secondary: '#81ECEC',
      bg: '#E8FFFE',
      text: '#2D3436',
    },
    bgStyle: 'solid',
    fontStyle: 'sans-serif',
    stickerType: 'stamp',
    stickerEmoji: '🎭',
    stickerPosition: 'bottom-right',
    aiPromptHints: ['character', 'analysis', 'personality', 'depth'],
    artStyle:
      'anime character with theatrical masks, dual personality visual, expressive',
  },

  favorites: {
    id: 'favorites',
    name: 'Favorites',
    category: 'creative',
    icon: '❤️‍🔥',
    noteIcon: 'Heart',
    mood: 'playful',
    description: 'Favorite moments',
    colors: {
      primary: '#E84393',
      secondary: '#FD79A8',
      bg: '#FFEBF5',
      text: '#2D3436',
    },
    bgStyle: 'pattern',
    bgPattern: 'dots-large',
    fontStyle: 'display',
    stickerType: 'floating',
    stickerEmoji: '💖',
    stickerPosition: 'bottom-right',
    aiPromptHints: ['favorites', 'love', 'best', 'treasured', 'collection'],
    artStyle:
      'happy anime character hugging a heart pillow, surrounded by sparkles',
  },

  // ==========================================
  // CONTENT (4 presets)
  // ==========================================

  blog: {
    id: 'blog',
    name: 'Blog',
    category: 'content',
    icon: '✍️✨',
    noteIcon: 'PencilLine',
    mood: 'calm',
    description: 'Content for posting',
    colors: {
      primary: '#2D3436',
      secondary: '#636E72',
      bg: '#FDF8F3',
      text: '#2D3436',
    },
    bgStyle: 'texture',
    bgPattern: 'paper-rough',
    fontStyle: 'serif',
    stickerType: 'corner',
    stickerEmoji: '📝',
    stickerPosition: 'top-right',
    aiPromptHints: ['blog', 'writing', 'content', 'creative', 'author'],
    artStyle:
      'thoughtful anime character typing on laptop, coffee nearby, cozy workspace',
  },

  draft: {
    id: 'draft',
    name: 'Draft',
    category: 'content',
    icon: '📝💭',
    noteIcon: 'NotePencil',
    mood: 'calm',
    description: 'Work in progress',
    colors: {
      primary: '#74B9FF',
      secondary: '#A3DAFF',
      bg: '#F0F8FF',
      text: '#636E72',
    },
    bgStyle: 'pattern',
    bgPattern: 'lines-diagonal',
    fontStyle: 'handwritten',
    stickerType: 'stamp',
    stickerEmoji: '🚧',
    stickerPosition: 'top-right',
    aiPromptHints: ['draft', 'wip', 'sketching', 'brainstorming'],
    artStyle:
      'anime character surrounded by scattered papers, pencil in hand, focused',
  },

  quotes: {
    id: 'quotes',
    name: 'Quotes',
    category: 'content',
    icon: '💬✨',
    noteIcon: 'Quotes',
    mood: 'dreamy',
    description: 'Memorable lines',
    colors: {
      primary: '#DFE6E9',
      secondary: '#B2BEC3',
      bg: '#FAFBFC',
      text: '#2D3436',
    },
    bgStyle: 'illustration',
    bgIllustration: 'quote-marks',
    fontStyle: 'serif',
    stickerType: 'border',
    stickerEmoji: '✨',
    stickerPosition: 'bottom-right',
    aiPromptHints: ['quotes', 'words', 'meaningful', 'profound', 'elegant'],
    artStyle:
      'elegant anime character in contemplative pose, surrounded by floating text',
  },

  research: {
    id: 'research',
    name: 'Research',
    category: 'content',
    icon: '🔬🧪',
    noteIcon: 'MagnifyingGlass',
    mood: 'serious',
    description: 'Deep dives & analysis',
    colors: {
      primary: '#0984E3',
      secondary: '#74B9FF',
      bg: '#EDF5FC',
      text: '#2D3436',
    },
    bgStyle: 'solid',
    fontStyle: 'mono',
    stickerType: 'none',
    stickerEmoji: '🔬',
    stickerPosition: 'bottom-right',
    aiPromptHints: ['research', 'analysis', 'data', 'scientific', 'detailed'],
    artStyle:
      'focused anime character with glasses, surrounded by charts and data',
  },

  // ==========================================
  // PERSONAL (4 presets)
  // ==========================================

  journal: {
    id: 'journal',
    name: 'Journal',
    category: 'personal',
    icon: '📔✨',
    noteIcon: 'Notebook',
    mood: 'dreamy',
    description: 'Daily reflections',
    colors: {
      primary: '#FDCB6E',
      secondary: '#F8E9C7',
      bg: '#FFFDF5',
      text: '#5D4E37',
    },
    bgStyle: 'texture',
    bgPattern: 'paper-rough',
    fontStyle: 'handwritten',
    stickerType: 'corner',
    stickerEmoji: '🔒',
    stickerPosition: 'top-right',
    aiPromptHints: ['journal', 'diary', 'personal', 'reflective', 'intimate'],
    artStyle:
      'serene anime character writing in diary, soft golden lighting, peaceful',
  },

  memory: {
    id: 'memory',
    name: 'Memory',
    category: 'personal',
    icon: '📷💫',
    noteIcon: 'Camera',
    mood: 'dreamy',
    description: 'Nostalgic moments',
    colors: {
      primary: '#DFE6E9',
      secondary: '#B2BEC3',
      bg: '#F9FAFB',
      text: '#636E72',
    },
    bgStyle: 'illustration',
    bgIllustration: 'polaroid-frame',
    fontStyle: 'serif',
    stickerType: 'floating',
    stickerEmoji: '🌸',
    stickerPosition: 'bottom-right',
    aiPromptHints: ['memory', 'nostalgia', 'past', 'cherished', 'wistful'],
    artStyle:
      'wistful anime character looking at polaroid photos, cherry blossoms falling',
  },

  inspiration: {
    id: 'inspiration',
    name: 'Inspiration',
    category: 'personal',
    icon: '✨🌈',
    noteIcon: 'Sparkle',
    mood: 'energetic',
    description: 'Mood boards & references',
    colors: {
      primary: '#F8B500',
      secondary: '#FFEAA7',
      bg: '#FFFEF0',
      text: '#2D3436',
    },
    bgStyle: 'gradient',
    bgGradient: ['#FFFEF0', '#FFF9D6', '#FFEAA7'],
    fontStyle: 'display',
    stickerType: 'floating',
    stickerEmoji: '🌟',
    stickerPosition: 'top-right',
    aiPromptHints: ['inspiration', 'motivation', 'spark', 'creativity', 'glow'],
    artStyle:
      'inspired anime character reaching toward a star, glowing aura, hopeful',
  },

  art: {
    id: 'art',
    name: 'Art',
    category: 'personal',
    icon: '🎨🖌️',
    noteIcon: 'Palette',
    mood: 'playful',
    description: 'Visual references',
    colors: {
      primary: '#E17055',
      secondary: '#FAB1A0',
      bg: '#FFF5F2',
      text: '#2D3436',
    },
    bgStyle: 'pattern',
    bgPattern: 'watercolor-wash',
    fontStyle: 'display',
    stickerType: 'border',
    stickerEmoji: '🖌️',
    stickerPosition: 'bottom-right',
    aiPromptHints: ['art', 'creative', 'colorful', 'expressive', 'artistic'],
    artStyle:
      'artistic anime character holding paintbrush, colorful paint splatters around',
  },
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get all presets as an array
 */
export const LABEL_PRESET_LIST: LabelPreset[] = Object.values(LABEL_PRESETS);

/**
 * Get presets grouped by category
 */
export const PRESETS_BY_CATEGORY: Record<LabelCategory, LabelPreset[]> = {
  productivity: LABEL_PRESET_LIST.filter((p) => p.category === 'productivity'),
  reading: LABEL_PRESET_LIST.filter((p) => p.category === 'reading'),
  creative: LABEL_PRESET_LIST.filter((p) => p.category === 'creative'),
  content: LABEL_PRESET_LIST.filter((p) => p.category === 'content'),
  personal: LABEL_PRESET_LIST.filter((p) => p.category === 'personal'),
};

/**
 * Get a preset by ID
 */
export function getPresetById(id: LabelPresetId): LabelPreset | undefined {
  return LABEL_PRESETS[id];
}

/**
 * Check if a label name matches a preset
 * Case-insensitive matching
 */
export function getPresetForLabel(labelName: string): LabelPreset | undefined {
  const normalized = labelName.toLowerCase().trim();
  return LABEL_PRESETS[normalized as LabelPresetId];
}

/**
 * Check if a label name has a matching preset
 */
export function hasPresetForLabel(labelName: string): boolean {
  return getPresetForLabel(labelName) !== undefined;
}

/**
 * Get all preset IDs
 */
export const ALL_PRESET_IDS: LabelPresetId[] = Object.keys(
  LABEL_PRESETS
) as LabelPresetId[];

/**
 * Get all category names in display order
 */
export const CATEGORY_ORDER: LabelCategory[] = [
  'productivity',
  'reading',
  'creative',
  'content',
  'personal',
];
