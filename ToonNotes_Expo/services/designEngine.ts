/**
 * DesignEngine - Central service for composing note designs
 *
 * Generates view-ready ComposedStyle objects adapted to each display context
 * (grid, list, detail, share).
 */

import {
  NoteDesign,
  NoteColor,
  DesignViewContext,
  ComposedStyle,
  BorderTemplate,
  BorderThickness,
  StickerPosition,
  BorderStyleType,
  BackgroundOverride,
} from '@/types';
import { getPatternById } from '@/constants/patterns';

// ============================================
// Border Configuration Types
// ============================================

interface BorderConfig {
  borderWidth: { thin: number; medium: number; thick: number };
  borderRadius: number;
  borderStyle: BorderStyleType;
  shadowOffset: { width: number; height: number };
  shadowOpacity: { thin: number; medium: number; thick: number };
  shadowRadius: { thin: number; medium: number; thick: number };
  elevation: { thin: number; medium: number; thick: number };
  decorationType: 'shoujo' | 'pop' | 'vintage' | 'none';
}

// ============================================
// Pre-defined Border Configurations
// Based on toonnotes-design-preview.html
// ============================================

const BORDER_CONFIGS: Record<BorderTemplate, BorderConfig> = {
  // Panel Styles (Classic Comic/Manga)
  panel: {
    borderWidth: { thin: 2, medium: 3, thick: 5 },
    borderRadius: 0,
    borderStyle: 'solid',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: { thin: 0, medium: 0, thick: 0 },
    shadowRadius: { thin: 0, medium: 0, thick: 0 },
    elevation: { thin: 0, medium: 0, thick: 0 },
    decorationType: 'none',
  },
  webtoon: {
    borderWidth: { thin: 1, medium: 1, thick: 2 },
    borderRadius: 4,
    borderStyle: 'solid',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: { thin: 0.04, medium: 0.06, thick: 0.08 },
    shadowRadius: { thin: 4, medium: 8, thick: 12 },
    elevation: { thin: 1, medium: 2, thick: 3 },
    decorationType: 'none',
  },
  sketch: {
    borderWidth: { thin: 1, medium: 2, thick: 3 },
    borderRadius: 8, // Simplified from CSS wobbly radius
    borderStyle: 'dashed',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: { thin: 0, medium: 0, thick: 0 },
    shadowRadius: { thin: 0, medium: 0, thick: 0 },
    elevation: { thin: 0, medium: 0, thick: 0 },
    decorationType: 'none',
  },

  // Shoujo / Romance
  shoujo: {
    borderWidth: { thin: 1, medium: 2, thick: 3 },
    borderRadius: 20,
    borderStyle: 'solid',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: { thin: 0.3, medium: 0.4, thick: 0.5 },
    shadowRadius: { thin: 15, medium: 20, thick: 25 },
    elevation: { thin: 3, medium: 4, thick: 5 },
    decorationType: 'shoujo',
  },
  vintage_manga: {
    borderWidth: { thin: 2, medium: 3, thick: 4 },
    borderRadius: 2,
    borderStyle: 'solid',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: { thin: 0.15, medium: 0.2, thick: 0.25 },
    shadowRadius: { thin: 0, medium: 0, thick: 0 },
    elevation: { thin: 2, medium: 3, thick: 4 },
    decorationType: 'vintage',
  },
  watercolor: {
    borderWidth: { thin: 0, medium: 0, thick: 0 },
    borderRadius: 8,
    borderStyle: 'solid',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: { thin: 0.05, medium: 0.08, thick: 0.1 },
    shadowRadius: { thin: 10, medium: 15, thick: 20 },
    elevation: { thin: 1, medium: 2, thick: 3 },
    decorationType: 'none',
  },

  // Chibi / Fun
  speech_bubble: {
    borderWidth: { thin: 2, medium: 3, thick: 4 },
    borderRadius: 24,
    borderStyle: 'solid',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: { thin: 0.1, medium: 0.15, thick: 0.2 },
    shadowRadius: { thin: 4, medium: 6, thick: 8 },
    elevation: { thin: 2, medium: 3, thick: 4 },
    decorationType: 'none', // Tail would need SVG
  },
  pop: {
    borderWidth: { thin: 3, medium: 4, thick: 5 },
    borderRadius: 8,
    borderStyle: 'solid',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: { thin: 1, medium: 1, thick: 1 },
    shadowRadius: { thin: 0, medium: 0, thick: 0 },
    elevation: { thin: 4, medium: 6, thick: 8 },
    decorationType: 'pop',
  },
  sticker: {
    borderWidth: { thin: 3, medium: 4, thick: 6 },
    borderRadius: 16,
    borderStyle: 'solid',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: { thin: 0.2, medium: 0.25, thick: 0.3 },
    shadowRadius: { thin: 10, medium: 15, thick: 20 },
    elevation: { thin: 4, medium: 6, thick: 8 },
    decorationType: 'none',
  },

  // Action / Shonen
  speed_lines: {
    borderWidth: { thin: 2, medium: 3, thick: 4 },
    borderRadius: 4,
    borderStyle: 'solid',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: { thin: 0.2, medium: 0.3, thick: 0.4 },
    shadowRadius: { thin: 4, medium: 6, thick: 8 },
    elevation: { thin: 2, medium: 3, thick: 4 },
    decorationType: 'none', // Lines would need SVG
  },
  impact: {
    borderWidth: { thin: 3, medium: 4, thick: 6 },
    borderRadius: 4, // Jagged effect would need clip-path/SVG
    borderStyle: 'solid',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: { thin: 0.3, medium: 0.4, thick: 0.5 },
    shadowRadius: { thin: 6, medium: 8, thick: 10 },
    elevation: { thin: 4, medium: 6, thick: 8 },
    decorationType: 'none',
  },
  ink_splash: {
    borderWidth: { thin: 0, medium: 0, thick: 0 },
    borderRadius: 4,
    borderStyle: 'solid',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: { thin: 0.4, medium: 0.5, thick: 0.6 },
    shadowRadius: { thin: 2, medium: 3, thick: 4 },
    elevation: { thin: 3, medium: 4, thick: 5 },
    decorationType: 'none', // Ink dots would need additional views
  },
};

// ============================================
// Context-specific Rendering Rules
// ============================================

interface ContextRules {
  borderScale: number; // Multiply border width
  shadowScale: number; // Multiply shadow values
  radiusScale: number; // Multiply border radius
  showSticker: boolean;
  stickerScale: number;
  showDecorations: boolean;
  showBackground: boolean; // Show background image/pattern
}

const CONTEXT_RULES: Record<DesignViewContext, ContextRules> = {
  grid: {
    borderScale: 0.5,
    shadowScale: 0.5,
    radiusScale: 1,
    showSticker: true,
    stickerScale: 0.6,
    showDecorations: false,
    showBackground: false, // Skip for performance
  },
  list: {
    borderScale: 0,
    shadowScale: 0,
    radiusScale: 0.8,
    showSticker: false,
    stickerScale: 0,
    showDecorations: false,
    showBackground: false, // Minimal styling
  },
  detail: {
    borderScale: 1,
    shadowScale: 1,
    radiusScale: 1,
    showSticker: true,
    stickerScale: 1,
    showDecorations: true,
    showBackground: true, // Full background
  },
  share: {
    borderScale: 1.2,
    shadowScale: 1.5,
    radiusScale: 1,
    showSticker: true,
    stickerScale: 1.2,
    showDecorations: true,
    showBackground: true, // Full background for export
  },
};

// ============================================
// Default Dark Mode Colors
// ============================================

const DARK_MODE_COLORS = {
  background: '#2D2D2D',
  title: '#FFFFFF',
  body: '#D1D5DB',
  accent: '#60A5FA',
  border: '#4B5563',
};

// ============================================
// Main Compose Functions
// ============================================

/**
 * Compose a view-ready style from a NoteDesign
 */
export function composeStyle(
  design: NoteDesign | null,
  fallbackColor: NoteColor,
  context: DesignViewContext,
  isDark: boolean
): ComposedStyle {
  if (!design) {
    return composeBasicStyle(fallbackColor, context, isDark);
  }

  const borderConfig = BORDER_CONFIGS[design.border.template];
  const contextRules = CONTEXT_RULES[context];
  const thickness = design.border.thickness;

  // Calculate scaled values
  const borderWidth = Math.round(
    borderConfig.borderWidth[thickness] * contextRules.borderScale
  );
  const shadowOpacity =
    borderConfig.shadowOpacity[thickness] * contextRules.shadowScale;
  const shadowRadius = Math.round(
    borderConfig.shadowRadius[thickness] * contextRules.shadowScale
  );
  const borderRadius = Math.round(
    borderConfig.borderRadius * contextRules.radiusScale
  );

  // Determine sticker settings
  const stickerPosition = design.sticker?.suggestedPosition || 'bottom-right';
  const stickerBaseScale =
    design.sticker?.scale === 'small'
      ? 0.6
      : design.sticker?.scale === 'large'
      ? 1.2
      : 1;

  // Build composed style
  const composed: ComposedStyle = {
    // Colors from design
    backgroundColor: design.background.primaryColor,
    titleColor: design.colors.titleText,
    bodyColor: design.colors.bodyText,
    accentColor: design.colors.accent,
    borderColor: design.colors.border,

    // Gradient if applicable
    backgroundGradient:
      design.background.style === 'gradient' && design.background.secondaryColor
        ? {
            colors: [
              design.background.primaryColor,
              design.background.secondaryColor,
            ],
            start: { x: 0, y: 0 },
            end: { x: 0, y: 1 },
          }
        : undefined,

    // Background image/pattern (only in detail/share contexts)
    backgroundImageUri:
      contextRules.showBackground && design.background.style === 'image'
        ? design.background.imageUri
        : undefined,
    backgroundPattern:
      contextRules.showBackground && design.background.style === 'pattern' && design.background.patternId
        ? (() => {
            const pattern = getPatternById(design.background.patternId!);
            return pattern
              ? { patternId: design.background.patternId!, assetName: pattern.assetName }
              : undefined;
          })()
        : undefined,
    backgroundOpacity: design.background.opacity ?? 0.15,
    showBackground:
      contextRules.showBackground &&
      (design.background.style === 'image' || design.background.style === 'pattern'),

    // Border
    borderWidth,
    borderStyle: borderConfig.borderStyle,
    borderRadius,
    showBorder: borderWidth > 0,

    // Shadow
    shadowColor: design.colors.border,
    shadowOffset: {
      width: Math.round(
        borderConfig.shadowOffset.width * contextRules.shadowScale
      ),
      height: Math.round(
        borderConfig.shadowOffset.height * contextRules.shadowScale
      ),
    },
    shadowOpacity,
    shadowRadius,
    elevation: Math.round(
      borderConfig.elevation[thickness] * contextRules.shadowScale
    ),

    // Sticker
    showSticker: contextRules.showSticker && !!design.sticker?.imageUri,
    stickerScale: stickerBaseScale * contextRules.stickerScale,
    stickerPosition,
    stickerUri: design.sticker?.imageUri,

    // Decorations
    decorations: contextRules.showDecorations
      ? {
          type: borderConfig.decorationType,
          color: design.colors.accent,
        }
      : { type: 'none' },
  };

  return composed;
}

/**
 * Compose a basic style for notes without a custom design
 */
export function composeBasicStyle(
  color: NoteColor,
  context: DesignViewContext,
  isDark: boolean
): ComposedStyle {
  const contextRules = CONTEXT_RULES[context];

  // For white notes in dark mode, use dark background
  const isWhiteInDark = isDark && color === NoteColor.White;
  const backgroundColor = isWhiteInDark ? DARK_MODE_COLORS.background : color;
  const titleColor = isWhiteInDark ? DARK_MODE_COLORS.title : '#1F2937';
  const bodyColor = isWhiteInDark ? DARK_MODE_COLORS.body : '#4B5563';
  const borderColor = isWhiteInDark ? DARK_MODE_COLORS.border : 'rgba(0,0,0,0.1)';

  // Basic rounded card style
  const baseBorderRadius = 12;
  const baseElevation = context === 'detail' ? 4 : context === 'grid' ? 2 : 0;

  return {
    backgroundColor,
    titleColor,
    bodyColor,
    accentColor: '#0ea5e9',
    borderColor,

    // No background image/pattern for basic style
    backgroundOpacity: 0.15,
    showBackground: false,

    borderWidth: 0,
    borderStyle: 'solid',
    borderRadius: Math.round(baseBorderRadius * contextRules.radiusScale),
    showBorder: false,

    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: context === 'list' ? 0 : 0.1,
    shadowRadius: context === 'list' ? 0 : 4,
    elevation: baseElevation,

    showSticker: false,
    stickerScale: 0,
    stickerPosition: 'bottom-right',

    decorations: { type: 'none' },
  };
}

/**
 * Get border color with special handling for certain templates
 */
export function getBorderColor(
  template: BorderTemplate,
  designBorderColor: string
): string {
  // Sticker template always uses white border
  if (template === 'sticker') {
    return '#FFFFFF';
  }
  // Panel and pop use dark border
  if (template === 'panel' || template === 'pop') {
    return '#1a1a1a';
  }
  return designBorderColor;
}

/**
 * Get shadow color for pop template (solid shadow)
 */
export function getPopShadowColor(template: BorderTemplate): string | undefined {
  if (template === 'pop') {
    return '#1a1a1a';
  }
  return undefined;
}

// ============================================
// Theme-Based Style Composition
// ============================================

import { DesignTheme, ThemeId, AccentType } from '@/types';
import { getThemeById } from '@/constants/themes';

/**
 * Compose a view-ready style from a DesignTheme
 * Used when creating designs with theme presets
 */
export function composeThemeStyle(
  theme: DesignTheme,
  context: DesignViewContext,
  colorOverrides?: Partial<DesignTheme['colors']>
): ComposedStyle {
  const colors = colorOverrides
    ? { ...theme.colors, ...colorOverrides }
    : theme.colors;

  const borderConfig = BORDER_CONFIGS[theme.border.template];
  const contextRules = CONTEXT_RULES[context];
  const thickness = theme.border.thickness;

  // Calculate scaled values
  const borderWidth = Math.round(
    borderConfig.borderWidth[thickness] * contextRules.borderScale
  );
  const shadowOpacity =
    borderConfig.shadowOpacity[thickness] * contextRules.shadowScale;
  const shadowRadius = Math.round(
    borderConfig.shadowRadius[thickness] * contextRules.shadowScale
  );
  const borderRadius = Math.round(
    (theme.border.customRadius ?? borderConfig.borderRadius) * contextRules.radiusScale
  );

  // Build composed style
  const composed: ComposedStyle = {
    // Colors
    backgroundColor: colors.background,
    titleColor: colors.title,
    bodyColor: colors.body,
    accentColor: colors.accent,
    borderColor: colors.border,

    // Gradient
    backgroundGradient:
      theme.background.style === 'gradient' && theme.background.gradient
        ? {
            colors: theme.background.gradient.colors,
            start:
              theme.background.gradient.direction === 'horizontal'
                ? { x: 0, y: 0.5 }
                : theme.background.gradient.direction === 'diagonal'
                ? { x: 0, y: 0 }
                : { x: 0.5, y: 0 },
            end:
              theme.background.gradient.direction === 'horizontal'
                ? { x: 1, y: 0.5 }
                : theme.background.gradient.direction === 'diagonal'
                ? { x: 1, y: 1 }
                : { x: 0.5, y: 1 },
          }
        : colors.backgroundSecondary
        ? {
            colors: [colors.background, colors.backgroundSecondary],
            start: { x: 0.5, y: 0 },
            end: { x: 0.5, y: 1 },
          }
        : undefined,

    // Background pattern
    backgroundImageUri: undefined,
    backgroundPattern:
      contextRules.showBackground && theme.background.patternId
        ? (() => {
            const pattern = getPatternById(theme.background.patternId);
            return pattern
              ? { patternId: theme.background.patternId, assetName: pattern.assetName }
              : undefined;
          })()
        : undefined,
    backgroundOpacity: theme.background.defaultOpacity,
    showBackground: contextRules.showBackground && !!theme.background.patternId,

    // Border
    borderWidth,
    borderStyle: borderConfig.borderStyle,
    borderRadius,
    showBorder: borderWidth > 0,

    // Shadow
    shadowColor: colors.border,
    shadowOffset: {
      width: Math.round(borderConfig.shadowOffset.width * contextRules.shadowScale),
      height: Math.round(borderConfig.shadowOffset.height * contextRules.shadowScale),
    },
    shadowOpacity,
    shadowRadius,
    elevation: Math.round(borderConfig.elevation[thickness] * contextRules.shadowScale),

    // Sticker (will be set when sticker is generated)
    showSticker: false,
    stickerScale: 1,
    stickerPosition: theme.stickerHint.defaultPosition,
    stickerUri: undefined,

    // Decorations
    decorations: contextRules.showDecorations
      ? {
          type: borderConfig.decorationType,
          color: colors.accent,
        }
      : { type: 'none' },
  };

  return composed;
}

/**
 * Convert a theme-based style to a NoteDesign structure
 * Used when saving a design created from a theme
 */
export function themeToNoteDesign(
  theme: DesignTheme,
  sourceImageUri: string,
  sticker: NoteDesign['sticker'],
  colorOverrides?: Partial<DesignTheme['colors']>
): Omit<NoteDesign, 'id' | 'createdAt'> {
  const colors = colorOverrides
    ? { ...theme.colors, ...colorOverrides }
    : theme.colors;

  return {
    name: `${theme.name} Design`,
    sourceImageUri,
    background: {
      primaryColor: colors.background,
      secondaryColor: colors.backgroundSecondary,
      style: theme.background.style,
      patternId: theme.background.patternId,
      opacity: theme.background.defaultOpacity,
    },
    colors: {
      titleText: colors.title,
      bodyText: colors.body,
      accent: colors.accent,
      border: colors.border,
    },
    border: {
      template: theme.border.template,
      thickness: theme.border.thickness,
    },
    typography: theme.typography,
    sticker,
    designSummary: theme.description,
    vibe: undefined,
    isLucky: false,
  };
}

/**
 * Get accent configuration for rendering AccentLayer
 */
export function getThemeAccents(
  theme: DesignTheme,
  context: DesignViewContext
): {
  type: AccentType;
  color: string;
  positions: ('corners' | 'edges' | 'scattered' | 'around_sticker')[];
  animated: boolean;
} | null {
  const contextRules = CONTEXT_RULES[context];

  if (!contextRules.showDecorations || theme.accents.type === 'none') {
    return null;
  }

  return {
    type: theme.accents.type,
    color: theme.accents.color ?? theme.colors.accent,
    positions: theme.accents.positions,
    animated: theme.accents.animated ?? false,
  };
}
