// ============================================
// ToonNotes Type Definitions
// Based on PRD.md specifications
// ============================================

// Border template types (comic/webtoon inspired)
export type BorderTemplate =
  // Panel Styles (Classic Comic/Manga)
  | 'panel'           // Bold black border, sharp corners
  | 'webtoon'         // Clean minimal, modern vertical-scroll style
  | 'sketch'          // Hand-drawn storyboard feel
  // Shoujo / Romance
  | 'shoujo'          // Soft glow with flower & sparkle accents
  | 'vintage_manga'   // Retro 80s/90s manga with offset shadow
  | 'watercolor'      // Dreamy bleed effect
  // Chibi / Fun
  | 'speech_bubble'   // Comic dialogue bubble with tail
  | 'pop'             // Bold offset shadow + halftone dots
  | 'sticker'         // White outline + drop shadow (die-cut look)
  // Action / Shonen
  | 'speed_lines'     // Motion lines shooting off edge
  | 'impact'          // Jagged explosive frame
  | 'ink_splash';     // Brush stroke with ink splatters

export type BorderThickness = 'thin' | 'medium' | 'thick';

export type StickerPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
export type StickerScale = 'small' | 'medium' | 'large';

export type TypographyStyle = 'serif' | 'sans-serif' | 'handwritten';
export type TypographyVibe = 'modern' | 'classic' | 'cute' | 'dramatic';

export type MoodTone = 'playful' | 'elegant' | 'dark' | 'warm' | 'cool' | 'energetic';

// Keep-style note background colors
export enum NoteColor {
  White = '#FFFFFF',
  Red = '#F28B82',
  Orange = '#FBBC04',
  Yellow = '#FFF475',
  Green = '#CCFF90',
  Teal = '#A7FFEB',
  Blue = '#CBF0F8',
  Purple = '#D7AEFB',
}

// Character sticker generated from AI
export interface CharacterSticker {
  id: string;
  imageUri: string;           // Local URI to sticker image
  description: string;        // What the sticker depicts
  suggestedPosition: StickerPosition;
  scale: StickerScale;
}

// Lucky design vibe types
export type DesignVibe = 'chaotic' | 'unhinged' | 'dramatic' | 'cursed' | 'blessed' | 'feral' | 'normal';

// Background style types
export type BackgroundStyle = 'solid' | 'gradient' | 'image' | 'pattern';

// AI-generated note design
export interface NoteDesign {
  id: string;
  name: string;
  sourceImageUri: string;     // Original uploaded image
  createdAt: number;          // Unix timestamp

  background: {
    primaryColor: string;     // Hex color
    secondaryColor?: string;  // For gradients
    style: BackgroundStyle;
    // Background image/pattern fields
    imageUri?: string;        // URI to background image (usually sourceImageUri)
    patternId?: string;       // ID from built-in pattern library
    opacity?: number;         // 0.1-0.3 for subtle overlay (default: 0.15)
  };

  colors: {
    titleText: string;
    bodyText: string;
    accent: string;
    border: string;
  };

  border: {
    template: BorderTemplate;
    thickness: BorderThickness;
  };

  typography: {
    titleStyle: TypographyStyle;
    vibe: TypographyVibe;
  };

  sticker: CharacterSticker;

  designSummary: string;      // AI-generated description

  // "Feeling Lucky" fields
  vibe?: DesignVibe;          // Energy/mood of the design
  isLucky?: boolean;          // True if generated via "Feeling Lucky"
}

// Background override for per-note customization
export interface BackgroundOverride {
  style: BackgroundStyle | 'none';  // 'none' removes background from design
  imageUri?: string;
  patternId?: string;
  opacity?: number;
}

// Core note entity
export interface Note {
  id: string;
  title: string;
  content: string;            // Rich text (format TBD)
  labels: string[];           // Array of label names
  color: NoteColor;           // Basic background color
  designId?: string;          // Reference to NoteDesign
  backgroundOverride?: BackgroundOverride;  // Per-note background customization
  webtoonSketchUri?: string;  // Webtoon Artist generated sketch image
  isPinned: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  deletedAt?: number;         // For 30-day trash
  createdAt: number;
  updatedAt: number;
}

// Label for organizing notes
export interface Label {
  id: string;
  name: string;
  createdAt: number;
}

// User state and economy
export interface User {
  id: string;
  email?: string;
  freeDesignUsed: boolean;
  coinBalance: number;
  createdAt: number;
}

// In-app purchase record
export interface Purchase {
  id: string;
  productId: string;
  coinsGranted: number;
  purchasedAt: number;
  transactionId: string;
}

// App settings
export interface AppSettings {
  darkMode: boolean;
  defaultNoteColor: NoteColor;
  geminiApiKey?: string;
}

// View context for design adaptation
export type DesignViewContext = 'grid' | 'list' | 'detail' | 'share';

// ============================================
// Design Engine Types
// ============================================

// Border style for React Native
export type BorderStyleType = 'solid' | 'dashed' | 'dotted';

// Composed style output from DesignEngine
// This is the view-ready style that adapts to each context
export interface ComposedStyle {
  // Colors
  backgroundColor: string;
  backgroundGradient?: {
    colors: string[];
    start: { x: number; y: number };
    end: { x: number; y: number };
  };
  // Background image/pattern (only shown in detail/share contexts)
  backgroundImageUri?: string;
  backgroundPattern?: {
    patternId: string;
    assetName: string;
  };
  backgroundOpacity: number;
  showBackground: boolean;    // False in grid/list for performance

  titleColor: string;
  bodyColor: string;
  accentColor: string;
  borderColor: string;

  // Border
  borderWidth: number;
  borderStyle: BorderStyleType;
  borderRadius: number;

  // Shadow
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number; // Android shadow

  // Effects
  showBorder: boolean;

  // Sticker (only visible in detail/share)
  showSticker: boolean;
  stickerScale: number;
  stickerPosition: StickerPosition;
  stickerUri?: string;

  // Decorations (for special borders like shoujo, pop)
  decorations?: {
    type: 'shoujo' | 'pop' | 'vintage' | 'none';
    color?: string;
  };
}

// ============================================
// Board Types
// ============================================

// Custom styling for board (optional override)
export interface BoardStyle {
  coverColor?: string;       // Solid background color
  coverGradient?: string[];  // Gradient colors [start, end]
  icon?: string;             // Lucide icon name
}

// Board entity (persisted)
export interface Board {
  id: string;
  hashtag: string;           // Links to notes via labels
  customStyle?: BoardStyle;  // Optional custom styling override
  createdAt: number;
  updatedAt: number;
}

// Derived board data (for UI, computed from notes)
export interface BoardData {
  hashtag: string;
  noteCount: number;
  previewNotes: Note[];      // First 3 notes for collage preview
  mostRecentUpdate: number;  // Timestamp of most recently updated note
  derivedColors: string[];   // Colors derived from note backgrounds
}

// ============================================
// Design Theme System
// ============================================

export type ThemeId =
  | 'ghibli'
  | 'manga'
  | 'webtoon'
  | 'shoujo'
  | 'shonen'
  | 'kawaii'
  | 'vintage';

export type AccentType =
  | 'sparkles'
  | 'flowers'
  | 'speed_lines'
  | 'impact_stars'
  | 'hearts'
  | 'clouds'
  | 'bokeh'
  | 'retro_shapes'
  | 'none';

// Pre-defined design theme
export interface DesignTheme {
  id: ThemeId;
  name: string;
  emoji: string;
  description: string;

  // Default color palette (can be customized by AI based on image)
  colors: {
    background: string;
    backgroundSecondary?: string; // For gradients
    title: string;
    body: string;
    accent: string;
    border: string;
  };

  // Background style
  background: {
    style: BackgroundStyle;
    patternId?: string;      // From pattern library
    defaultOpacity: number;
    gradient?: {
      direction: 'vertical' | 'horizontal' | 'diagonal';
      colors: string[];
    };
  };

  // Border configuration
  border: {
    template: BorderTemplate;
    thickness: BorderThickness;
    customRadius?: number;
  };

  // Typography hints (used by AI for sticker style)
  typography: {
    titleStyle: TypographyStyle;
    vibe: TypographyVibe;
  };

  // Decorative accents
  accents: {
    type: AccentType;
    positions: ('corners' | 'edges' | 'scattered' | 'around_sticker')[];
    color?: string;         // Uses accent color if not specified
    animated?: boolean;
  };

  // Sticker generation hints
  stickerHint: {
    artStyle: string;       // e.g., "watercolor soft shading", "bold manga lines"
    mood: MoodTone;
    defaultPosition: StickerPosition;
    defaultScale: StickerScale;
  };

  // AI prompt modifiers
  aiPromptHints: string[];
}

// Theme selection for design creation
export interface ThemeSelection {
  themeId: ThemeId;
  customizations?: {
    primaryColor?: string;
    accentColor?: string;
    borderTemplate?: BorderTemplate;
    patternId?: string;
  };
}

// Gemini API response for design generation
export interface GeminiDesignResponse {
  background: {
    primary_color: string;
    secondary_color?: string;
    style: 'solid' | 'gradient';
  };
  colors: {
    title_text: string;
    body_text: string;
    accent: string;
    border: string;
  };
  border: {
    template: BorderTemplate;
    thickness: BorderThickness;
  };
  typography: {
    title_style: TypographyStyle;
    vibe: TypographyVibe;
  };
  mood: {
    tone: MoodTone;
    theme: string;
  };
  character: {
    description: string;
    suggested_position: StickerPosition;
    scale: StickerScale;
  };
  design_summary: string;
}

// ============================================
// Story Style - Text Analysis Types
// ============================================

// Text analysis result from AI
export interface TextAnalysis {
  context: {
    purpose: 'work' | 'personal' | 'creative' | 'learning' | 'journal';
    type: 'notes' | 'todo' | 'writing' | 'planning' | 'reflection' | 'list' | 'diary';
    formality: 'casual' | 'professional' | 'creative' | 'intimate';
  };
  keywords: {
    topics: string[];
    category: string;
    entities: string[];
  };
  mood: {
    primary: string;
    energy: 'low' | 'medium' | 'high';
    tone: 'informational' | 'emotional' | 'motivational' | 'reflective' | 'humorous';
  };
  suggestedStyle: {
    aesthetic: string;
    colorMood: string;
    intensity: 'subtle' | 'moderate' | 'bold';
  };
}

// Story Style design response from AI
export interface StoryStyleDesignResponse {
  name: string;
  colors: {
    background: string;
    text: string;
    accent: string;
    border: string;
  };
  styles: {
    borderStyle: 'solid' | 'dashed' | 'dotted';
    borderWidth: string;
    borderRadius: string;
    boxShadow: 'none' | 'subtle' | 'medium' | 'glow';
  };
  matchedTheme: ThemeId;
  designRationale: string;
}

// ============================================
// Webtoon Artist - AI Image Generation
// ============================================

// Available webtoon art styles
export type WebtoonStylePreset = 'shonen' | 'shoujo' | 'simple';

// Webtoon style preset configurations
export interface WebtoonStyleConfig {
  id: WebtoonStylePreset;
  name: string;
  emoji: string;
  description: string;
  artDirection: string;  // Prompt hints for AI
  lineStyle: string;
  mood: string;
  examples: string[];    // Example series for reference
}

// Webtoon sketch generation request
export interface WebtoonSketchRequest {
  analysis: TextAnalysis;
  style: WebtoonStylePreset;
  noteTitle: string;
  noteContent: string;
}

// Webtoon sketch generation response
export interface WebtoonSketchResponse {
  imageBase64: string;
  mimeType: string;
  style: WebtoonStylePreset;
  sceneDescription: string;  // What the AI drew
  artistNotes: string;       // Why it chose this composition
}
