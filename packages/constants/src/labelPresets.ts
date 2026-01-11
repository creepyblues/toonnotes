/**
 * Label-Based Design Presets
 *
 * 30 unique label presets organized by category:
 * - Productivity (5): Todo, In-Progress, Done, Waiting, Priority
 * - Planning (5): Goals, Meeting, Planning, Deadline, Project
 * - Checklists (5): Shopping, Wishlist, Packing, Bucket-List, Errands
 * - Media (5): Reading, Watchlist, Bookmarks, Review, Recommendation
 * - Creative (5): Ideas, Draft, Brainstorm, Inspiration, Research
 * - Personal (5): Journal, Memory, Reflection, Gratitude, Quotes
 * - System (1): Uncategorized (fallback for unmatched notes)
 *
 * Each preset defines a complete visual design that auto-applies
 * when the corresponding label is added to a note.
 */

import type { StickerPosition } from '@toonnotes/types';

// ============================================
// Type Definitions
// ============================================

export type LabelPresetId =
  // Productivity (5)
  | 'todo'
  | 'in-progress'
  | 'done'
  | 'waiting'
  | 'priority'
  // Planning (5)
  | 'goals'
  | 'meeting'
  | 'planning'
  | 'deadline'
  | 'project'
  // Checklists (5)
  | 'shopping'
  | 'wishlist'
  | 'packing'
  | 'bucket-list'
  | 'errands'
  // Media (5)
  | 'reading'
  | 'watchlist'
  | 'bookmarks'
  | 'review'
  | 'recommendation'
  // Creative (5)
  | 'ideas'
  | 'draft'
  | 'brainstorm'
  | 'inspiration'
  | 'research'
  // Personal (5)
  | 'journal'
  | 'memory'
  | 'reflection'
  | 'gratitude'
  | 'quotes'
  // System (1)
  | 'uncategorized';

export type LabelCategory =
  | 'productivity'
  | 'planning'
  | 'checklists'
  | 'media'
  | 'creative'
  | 'personal'
  | 'system';

export type PresetBgStyle = 'solid' | 'gradient' | 'pattern' | 'texture' | 'illustration';

// PresetFontStyle is imported from fonts.ts (not re-exported to avoid duplicate export)
import type { PresetFontStyle } from './fonts';

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
  isSystemLabel?: boolean; // True for system labels like 'uncategorized'

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
  planning: '#E17055',
  checklists: '#00CEC9',
  media: '#6C5CE7',
  creative: '#FDCB6E',
  personal: '#FD79A8',
  system: '#636E72',
};

export const CATEGORY_LABELS: Record<LabelCategory, string> = {
  productivity: 'Productivity',
  planning: 'Planning',
  checklists: 'Checklists',
  media: 'Media',
  creative: 'Creative',
  personal: 'Personal',
  system: 'System',
};

// ============================================
// 31 Label Presets (30 user + 1 system)
// ============================================

export const LABEL_PRESETS: Record<LabelPresetId, LabelPreset> = {
  // ==========================================
  // PRODUCTIVITY (5 presets)
  // ==========================================

  'todo': {
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

  'in-progress': {
    id: 'in-progress',
    name: 'In Progress',
    category: 'productivity',
    icon: '🔄⚡',
    noteIcon: 'Spinner',
    mood: 'energetic',
    description: 'Currently working on',
    colors: {
      primary: '#0984E3',
      secondary: '#74B9FF',
      bg: '#E8F4FD',
      text: '#2D3436',
    },
    bgStyle: 'gradient',
    bgGradient: ['#E8F4FD', '#D0E8FC'],
    fontStyle: 'sans-serif',
    stickerType: 'floating',
    stickerEmoji: '⚡',
    stickerPosition: 'top-right',
    aiPromptHints: ['working', 'active', 'progress', 'momentum'],
    artStyle: 'dynamic anime character in motion, working energetically, blue energy aura',
  },

  'done': {
    id: 'done',
    name: 'Done',
    category: 'productivity',
    icon: '✔️🎉',
    noteIcon: 'CheckCircle',
    mood: 'calm',
    description: 'Completed tasks',
    colors: {
      primary: '#00B894',
      secondary: '#55EFC4',
      bg: '#E8FDF5',
      text: '#2D3436',
    },
    bgStyle: 'solid',
    fontStyle: 'sans-serif',
    stickerType: 'stamp',
    stickerEmoji: '🏆',
    stickerPosition: 'bottom-right',
    aiPromptHints: ['completed', 'success', 'achievement', 'finished'],
    artStyle: 'proud anime character with trophy, celebrating accomplishment, green sparkles',
  },

  'waiting': {
    id: 'waiting',
    name: 'Waiting',
    category: 'productivity',
    icon: '⏳💭',
    noteIcon: 'Hourglass',
    mood: 'calm',
    description: 'Blocked or pending',
    colors: {
      primary: '#FDCB6E',
      secondary: '#F8E9C7',
      bg: '#FFFDF5',
      text: '#5D4E37',
    },
    bgStyle: 'pattern',
    bgPattern: 'dots-small',
    fontStyle: 'sans-serif',
    stickerType: 'floating',
    stickerEmoji: '⏳',
    stickerPosition: 'top-right',
    aiPromptHints: ['waiting', 'pending', 'paused', 'patient'],
    artStyle: 'patient anime character with hourglass, calm expression, soft yellow tones',
  },

  'priority': {
    id: 'priority',
    name: 'Priority',
    category: 'productivity',
    icon: '⭐🔥',
    noteIcon: 'Star',
    mood: 'bold',
    description: 'High priority items',
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
    artStyle: 'dynamic anime character with exclamation mark, bold pose, energetic',
  },

  // ==========================================
  // PLANNING (5 presets)
  // ==========================================

  'goals': {
    id: 'goals',
    name: 'Goals',
    category: 'planning',
    icon: '🎯✨',
    noteIcon: 'Target',
    mood: 'energetic',
    description: 'Personal goals & milestones',
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
    artStyle: 'determined anime character reaching for the top, mountain backdrop',
  },

  'meeting': {
    id: 'meeting',
    name: 'Meeting',
    category: 'planning',
    icon: '👥📋',
    noteIcon: 'Users',
    mood: 'serious',
    description: 'Meeting notes & agendas',
    colors: {
      primary: '#636E72',
      secondary: '#B2BEC3',
      bg: '#F5F6F7',
      text: '#2D3436',
    },
    bgStyle: 'solid',
    fontStyle: 'sans-serif',
    stickerType: 'corner',
    stickerEmoji: '📋',
    stickerPosition: 'top-right',
    aiPromptHints: ['meeting', 'discussion', 'agenda', 'team', 'notes'],
    artStyle: 'professional anime character with clipboard, meeting room setting',
  },

  'planning': {
    id: 'planning',
    name: 'Planning',
    category: 'planning',
    icon: '📅🗓️',
    noteIcon: 'Calendar',
    mood: 'calm',
    description: 'Plans & schedules',
    colors: {
      primary: '#6C5CE7',
      secondary: '#A29BFE',
      bg: '#F3F0FF',
      text: '#2D3436',
    },
    bgStyle: 'pattern',
    bgPattern: 'grid',
    fontStyle: 'sans-serif',
    stickerType: 'corner',
    stickerEmoji: '📅',
    stickerPosition: 'top-right',
    aiPromptHints: ['planning', 'schedule', 'organize', 'calendar'],
    artStyle: 'organized anime character with planner, thoughtful expression, purple tones',
  },

  'deadline': {
    id: 'deadline',
    name: 'Deadline',
    category: 'planning',
    icon: '⏰🚨',
    noteIcon: 'Alarm',
    mood: 'bold',
    description: 'Time-sensitive tasks',
    colors: {
      primary: '#D63031',
      secondary: '#FF7675',
      bg: '#FFEBEE',
      text: '#2D3436',
    },
    bgStyle: 'gradient',
    bgGradient: ['#FFEBEE', '#FFCDD2'],
    fontStyle: 'display',
    stickerType: 'stamp',
    stickerEmoji: '⏰',
    stickerPosition: 'top-right',
    aiPromptHints: ['deadline', 'urgent', 'time', 'countdown'],
    artStyle: 'anime character racing against clock, dynamic speed lines, red urgency',
  },

  'project': {
    id: 'project',
    name: 'Project',
    category: 'planning',
    icon: '📁🔧',
    noteIcon: 'Folder',
    mood: 'serious',
    description: 'Project documentation',
    colors: {
      primary: '#E17055',
      secondary: '#FAB1A0',
      bg: '#FFF5F2',
      text: '#2D3436',
    },
    bgStyle: 'solid',
    fontStyle: 'sans-serif',
    stickerType: 'corner',
    stickerEmoji: '📁',
    stickerPosition: 'top-right',
    aiPromptHints: ['project', 'work', 'documentation', 'organized'],
    artStyle: 'focused anime character managing files, professional workspace',
  },

  // ==========================================
  // CHECKLISTS (5 presets)
  // ==========================================

  'shopping': {
    id: 'shopping',
    name: 'Shopping',
    category: 'checklists',
    icon: '🛒🛍️',
    noteIcon: 'ShoppingCart',
    mood: 'playful',
    description: 'Shopping & grocery lists',
    colors: {
      primary: '#00CEC9',
      secondary: '#81ECEC',
      bg: '#E8FFFE',
      text: '#2D3436',
    },
    bgStyle: 'pattern',
    bgPattern: 'lines-horizontal',
    fontStyle: 'sans-serif',
    stickerType: 'floating',
    stickerEmoji: '🛒',
    stickerPosition: 'bottom-right',
    aiPromptHints: ['shopping', 'groceries', 'buy', 'store', 'list'],
    artStyle: 'cheerful anime character with shopping cart, colorful bags, teal accents',
  },

  'wishlist': {
    id: 'wishlist',
    name: 'Wishlist',
    category: 'checklists',
    icon: '⭐💝',
    noteIcon: 'Star',
    mood: 'dreamy',
    description: 'Things you want',
    colors: {
      primary: '#FD79A8',
      secondary: '#FDCCE5',
      bg: '#FFF0F6',
      text: '#2D3436',
    },
    bgStyle: 'gradient',
    bgGradient: ['#FFF0F6', '#FFE4EE'],
    fontStyle: 'handwritten',
    stickerType: 'floating',
    stickerEmoji: '💫',
    stickerPosition: 'top-right',
    aiPromptHints: ['wishlist', 'want', 'dream', 'desire', 'hope'],
    artStyle: 'dreamy anime character gazing at stars, soft pink sparkles, hopeful',
  },

  'packing': {
    id: 'packing',
    name: 'Packing',
    category: 'checklists',
    icon: '🧳✈️',
    noteIcon: 'Suitcase',
    mood: 'energetic',
    description: 'Travel packing lists',
    colors: {
      primary: '#0984E3',
      secondary: '#74B9FF',
      bg: '#E8F4FD',
      text: '#2D3436',
    },
    bgStyle: 'pattern',
    bgPattern: 'lines-horizontal',
    fontStyle: 'sans-serif',
    stickerType: 'corner',
    stickerEmoji: '✈️',
    stickerPosition: 'top-right',
    aiPromptHints: ['packing', 'travel', 'trip', 'suitcase', 'vacation'],
    artStyle: 'excited anime character with suitcase, adventure awaits, blue sky backdrop',
  },

  'bucket-list': {
    id: 'bucket-list',
    name: 'Bucket List',
    category: 'checklists',
    icon: '🌟🗺️',
    noteIcon: 'MapPin',
    mood: 'dreamy',
    description: 'Life goals & experiences',
    colors: {
      primary: '#F8B500',
      secondary: '#FFEAA7',
      bg: '#FFFEF0',
      text: '#2D3436',
    },
    bgStyle: 'illustration',
    bgIllustration: 'world-map',
    fontStyle: 'display',
    stickerType: 'floating',
    stickerEmoji: '🌍',
    stickerPosition: 'bottom-right',
    aiPromptHints: ['bucket-list', 'dreams', 'adventures', 'experiences', 'life'],
    artStyle: 'adventurous anime character with map, starry eyes, golden glow',
  },

  'errands': {
    id: 'errands',
    name: 'Errands',
    category: 'checklists',
    icon: '🏃📍',
    noteIcon: 'MapTrifold',
    mood: 'energetic',
    description: 'Tasks to do outside',
    colors: {
      primary: '#00B894',
      secondary: '#55EFC4',
      bg: '#E8FDF5',
      text: '#2D3436',
    },
    bgStyle: 'solid',
    fontStyle: 'sans-serif',
    stickerType: 'corner',
    stickerEmoji: '🏃',
    stickerPosition: 'top-right',
    aiPromptHints: ['errands', 'tasks', 'outside', 'run', 'quick'],
    artStyle: 'active anime character running with checklist, city background, green energy',
  },

  // ==========================================
  // MEDIA (5 presets)
  // ==========================================

  'reading': {
    id: 'reading',
    name: 'Reading',
    category: 'media',
    icon: '📚✨',
    noteIcon: 'BookOpen',
    mood: 'calm',
    description: 'Books & manga notes',
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
    artStyle: 'cozy anime character reading a book, soft lighting, peaceful mood',
  },

  'watchlist': {
    id: 'watchlist',
    name: 'Watchlist',
    category: 'media',
    icon: '📺🍿',
    noteIcon: 'Television',
    mood: 'playful',
    description: 'Shows & anime to watch',
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
    artStyle: 'excited anime character with popcorn watching screen, glowing eyes',
  },

  'bookmarks': {
    id: 'bookmarks',
    name: 'Bookmarks',
    category: 'media',
    icon: '🔖🔗',
    noteIcon: 'BookmarkSimple',
    mood: 'calm',
    description: 'Saved links & references',
    colors: {
      primary: '#9B59B6',
      secondary: '#D7BDE2',
      bg: '#F5EEF8',
      text: '#2D3436',
    },
    bgStyle: 'solid',
    fontStyle: 'sans-serif',
    stickerType: 'corner',
    stickerEmoji: '🔖',
    stickerPosition: 'top-right',
    aiPromptHints: ['bookmarks', 'saved', 'links', 'reference', 'collection'],
    artStyle: 'organized anime character with bookmarks floating around, purple theme',
  },

  'review': {
    id: 'review',
    name: 'Review',
    category: 'media',
    icon: '⭐💭',
    noteIcon: 'ChatCircleText',
    mood: 'serious',
    description: 'Reviews & ratings',
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
    artStyle: 'anime character as critic with notepad, contemplative expression',
  },

  'recommendation': {
    id: 'recommendation',
    name: 'Recommendation',
    category: 'media',
    icon: '💝✨',
    noteIcon: 'HeartStraight',
    mood: 'playful',
    description: 'Things to share',
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
    artStyle: 'cheerful anime character holding a heart, sharing excitement, shoujo style',
  },

  // ==========================================
  // CREATIVE (5 presets)
  // ==========================================

  'ideas': {
    id: 'ideas',
    name: 'Ideas',
    category: 'creative',
    icon: '💡✨',
    noteIcon: 'Lightbulb',
    mood: 'energetic',
    description: 'Concepts & inspiration',
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
    artStyle: 'imaginative anime character with lightbulb above head, sparkling eyes',
  },

  'draft': {
    id: 'draft',
    name: 'Draft',
    category: 'creative',
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
    artStyle: 'anime character surrounded by scattered papers, pencil in hand, focused',
  },

  'brainstorm': {
    id: 'brainstorm',
    name: 'Brainstorm',
    category: 'creative',
    icon: '🧠⚡',
    noteIcon: 'Brain',
    mood: 'energetic',
    description: 'Mind maps & free thinking',
    colors: {
      primary: '#9B59B6',
      secondary: '#8E44AD',
      bg: '#F5EEFF',
      text: '#2D3436',
    },
    bgStyle: 'gradient',
    bgGradient: ['#F5EEFF', '#E8DAFF'],
    fontStyle: 'sans-serif',
    stickerType: 'floating',
    stickerEmoji: '⚡',
    stickerPosition: 'top-right',
    aiPromptHints: ['brainstorm', 'thinking', 'ideas', 'creative', 'mind'],
    artStyle: 'anime character with thought bubbles swirling around, electric purple energy',
  },

  'inspiration': {
    id: 'inspiration',
    name: 'Inspiration',
    category: 'creative',
    icon: '✨🌈',
    noteIcon: 'Sparkle',
    mood: 'dreamy',
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
    artStyle: 'inspired anime character reaching toward a star, glowing aura, hopeful',
  },

  'research': {
    id: 'research',
    name: 'Research',
    category: 'creative',
    icon: '🔬🔍',
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
    artStyle: 'focused anime character with glasses, surrounded by charts and data',
  },

  // ==========================================
  // PERSONAL (5 presets)
  // ==========================================

  'journal': {
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
    artStyle: 'serene anime character writing in diary, soft golden lighting, peaceful',
  },

  'memory': {
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
    artStyle: 'wistful anime character looking at polaroid photos, cherry blossoms falling',
  },

  'reflection': {
    id: 'reflection',
    name: 'Reflection',
    category: 'personal',
    icon: '🪞💭',
    noteIcon: 'SunHorizon',
    mood: 'calm',
    description: 'Self-reflection & thoughts',
    colors: {
      primary: '#81ECEC',
      secondary: '#00CEC9',
      bg: '#E8FFFE',
      text: '#2D3436',
    },
    bgStyle: 'gradient',
    bgGradient: ['#E8FFFE', '#D4FFFE'],
    fontStyle: 'serif',
    stickerType: 'none',
    stickerEmoji: '🪞',
    stickerPosition: 'bottom-right',
    aiPromptHints: ['reflection', 'thinking', 'introspection', 'peaceful', 'mindful'],
    artStyle: 'contemplative anime character by water, serene reflection, soft teal tones',
  },

  'gratitude': {
    id: 'gratitude',
    name: 'Gratitude',
    category: 'personal',
    icon: '🙏💖',
    noteIcon: 'Heart',
    mood: 'calm',
    description: 'Things to be thankful for',
    colors: {
      primary: '#FF7675',
      secondary: '#FAB1A0',
      bg: '#FFF5F5',
      text: '#2D3436',
    },
    bgStyle: 'pattern',
    bgPattern: 'dots-small',
    fontStyle: 'handwritten',
    stickerType: 'floating',
    stickerEmoji: '💖',
    stickerPosition: 'top-right',
    aiPromptHints: ['gratitude', 'thankful', 'appreciation', 'blessing', 'warm'],
    artStyle: 'warm anime character with hands together, soft pink glow, grateful expression',
  },

  'quotes': {
    id: 'quotes',
    name: 'Quotes',
    category: 'personal',
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
    artStyle: 'elegant anime character in contemplative pose, surrounded by floating text',
  },

  // ==========================================
  // SYSTEM (1 preset)
  // ==========================================

  'uncategorized': {
    id: 'uncategorized',
    name: 'Uncategorized',
    category: 'system',
    icon: '📥',
    noteIcon: 'Tray',
    mood: 'calm',
    description: 'Notes awaiting organization',
    isSystemLabel: true,
    colors: {
      primary: '#636E72',
      secondary: '#B2BEC3',
      bg: '#F5F6F7',
      text: '#636E72',
    },
    bgStyle: 'solid',
    fontStyle: 'sans-serif',
    stickerType: 'none',
    stickerEmoji: '📥',
    stickerPosition: 'bottom-right',
    aiPromptHints: ['inbox', 'unsorted', 'new', 'organize'],
    artStyle: 'minimal anime character with inbox tray, neutral expression, gray tones',
  },
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get all presets as an array (excluding system labels by default)
 */
export const LABEL_PRESET_LIST: LabelPreset[] = Object.values(LABEL_PRESETS).filter(
  (p) => !p.isSystemLabel
);

/**
 * Get all presets including system labels
 */
export const ALL_LABEL_PRESETS: LabelPreset[] = Object.values(LABEL_PRESETS);

/**
 * Get presets grouped by category (excluding system)
 */
export const PRESETS_BY_CATEGORY: Record<Exclude<LabelCategory, 'system'>, LabelPreset[]> = {
  productivity: LABEL_PRESET_LIST.filter((p) => p.category === 'productivity'),
  planning: LABEL_PRESET_LIST.filter((p) => p.category === 'planning'),
  checklists: LABEL_PRESET_LIST.filter((p) => p.category === 'checklists'),
  media: LABEL_PRESET_LIST.filter((p) => p.category === 'media'),
  creative: LABEL_PRESET_LIST.filter((p) => p.category === 'creative'),
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

// ============================================
// Fuzzy/Keyword Matching for Custom Labels
// ============================================

const FUZZY_MATCH_THRESHOLD = 0.3;

/**
 * Split a label name into matchable tokens
 */
function tokenizeLabel(name: string): string[] {
  return name
    .toLowerCase()
    .split(/[-_\s]+/)
    .filter((token) => token.length >= 2);
}

/**
 * Calculate fuzzy match score between label tokens and a preset
 */
function calculatePresetScore(tokens: string[], preset: LabelPreset): number {
  let score = 0;
  const presetId = preset.id;
  const hints = preset.aiPromptHints.map((h) => h.toLowerCase());

  for (const token of tokens) {
    // Match against preset ID (e.g., "shopping" in "my-shopping-list")
    if (presetId.includes(token) || token.includes(presetId)) {
      score += 0.5;
    }
    // Exact match in aiPromptHints
    if (hints.includes(token)) {
      score += 0.35;
    } else if (hints.some((h) => h.includes(token) || token.includes(h))) {
      // Partial match in hints
      score += 0.2;
    }
  }

  return Math.min(score, 1.0);
}

/**
 * Get a preset for a label using fuzzy keyword matching
 * First tries exact match, then falls back to keyword matching
 */
export function getPresetForLabelFuzzy(labelName: string): LabelPreset | undefined {
  // First try exact match
  const exactMatch = getPresetForLabel(labelName);
  if (exactMatch) return exactMatch;

  // Tokenize the label
  const tokens = tokenizeLabel(labelName);
  if (tokens.length === 0) return undefined;

  // Score each preset
  let best: LabelPreset | undefined;
  let bestScore = 0;

  for (const preset of LABEL_PRESET_LIST) {
    const score = calculatePresetScore(tokens, preset);
    if (score > bestScore && score >= FUZZY_MATCH_THRESHOLD) {
      bestScore = score;
      best = preset;
    }
  }

  return best;
}

/**
 * Get the icon name for a label (for rendering)
 * Returns 'Tag' as fallback for unmatched labels
 */
export function getIconForLabel(labelName: string): string {
  const preset = getPresetForLabelFuzzy(labelName);
  return preset?.noteIcon || 'Tag';
}

/**
 * Check if a label name has a matching preset
 */
export function hasPresetForLabel(labelName: string): boolean {
  return getPresetForLabel(labelName) !== undefined;
}

/**
 * Check if a label is a system label
 */
export function isSystemLabel(labelName: string): boolean {
  const preset = getPresetForLabel(labelName);
  return preset?.isSystemLabel === true;
}

/**
 * Get all preset IDs (excluding system labels)
 */
export const ALL_PRESET_IDS: LabelPresetId[] = Object.keys(LABEL_PRESETS).filter(
  (id) => !LABEL_PRESETS[id as LabelPresetId].isSystemLabel
) as LabelPresetId[];

/**
 * Get all category names in display order (excluding system)
 */
export const CATEGORY_ORDER: Exclude<LabelCategory, 'system'>[] = [
  'productivity',
  'planning',
  'checklists',
  'media',
  'creative',
  'personal',
];
