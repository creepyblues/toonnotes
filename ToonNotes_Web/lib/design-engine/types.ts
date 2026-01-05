/**
 * Design Engine Types - Ported from ToonNotes_Expo/types/index.ts
 */

// Note background color options
export type NoteColor =
  | 'White'
  | 'Lavender'
  | 'Rose'
  | 'Peach'
  | 'Mint'
  | 'Sky'
  | 'Violet';

// Map NoteColor enum to hex values
export const NOTE_COLOR_VALUES: Record<NoteColor, string> = {
  White: '#FFFFFF',
  Lavender: '#EDE9FE',
  Rose: '#FFE4E6',
  Peach: '#FED7AA',
  Mint: '#D1FAE5',
  Sky: '#E0F2FE',
  Violet: '#DDD6FE',
};

// Design view context
export type DesignViewContext = 'grid' | 'list' | 'detail' | 'share';

// Sticker position
export type StickerPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left';

// Background style
export type BackgroundStyle = 'solid' | 'gradient' | 'image' | 'pattern';

// Typography style
export type TypographyStyle = 'serif' | 'sans-serif' | 'handwritten';

// NoteDesign from database (JSONB fields)
export interface NoteDesign {
  id: string;
  name: string;
  sourceImageUri?: string;
  createdAt: number;

  background: {
    primaryColor: string;
    secondaryColor?: string;
    style: BackgroundStyle;
    imageUri?: string;
    patternId?: string;
    opacity?: number;
  };

  colors: {
    titleText: string;
    bodyText: string;
    accent: string;
  };

  typography: {
    titleStyle: TypographyStyle;
    vibe: string;
  };

  sticker?: {
    id: string;
    imageUri: string;
    description: string;
    suggestedPosition: StickerPosition;
    scale: 'small' | 'medium' | 'large';
  };

  designSummary?: string;
  vibe?: string;
  isLucky?: boolean;
  isSystemDefault?: boolean;
  labelPresetId?: string;
  isLabelPreset?: boolean;
}

// Composed style output for web rendering
export interface ComposedStyle {
  // Colors
  backgroundColor: string;
  titleColor: string;
  bodyColor: string;
  accentColor: string;

  // Typography
  fontStyle: TypographyStyle;
  titleFontFamily?: string;
  bodyFontFamily?: string;

  // Gradient
  backgroundGradient?: {
    colors: string[];
    direction: 'vertical' | 'horizontal' | 'diagonal';
  };

  // Background pattern/image
  backgroundImageUri?: string;
  backgroundPattern?: {
    patternId: string;
    assetName: string;
  };
  backgroundOpacity: number;
  showBackground: boolean;

  // Border and shadow (CSS values)
  borderRadius: number;
  boxShadow: string;

  // Sticker
  showSticker: boolean;
  stickerScale: number;
  stickerPosition: StickerPosition;
  stickerUri?: string;

  // Decorations
  showDecorations: boolean;
  decorationColor?: string;
}

// Shared note data from Supabase RPC
export interface SharedNoteData {
  id: string;
  title: string;
  content: string;
  labels: string[];
  color: string;
  design_id?: string;
  background_override?: unknown;
  typography_poster_uri?: string;
  character_mascot_uri?: string;
  images?: string[];
  created_at: string;
  updated_at: string;

  // Joined design fields
  design_name?: string;
  design_background?: NoteDesign['background'];
  design_colors?: NoteDesign['colors'];
  design_typography?: NoteDesign['typography'];
  design_sticker?: NoteDesign['sticker'];
}
