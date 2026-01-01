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
  StickerPosition,
  BackgroundOverride,
} from '@/types';
import { getPatternById } from '@/constants/patterns';

// ============================================
// Context-specific Rendering Rules
// ============================================

interface ContextRules {
  shadowScale: number; // Multiply shadow values
  radiusScale: number; // Multiply border radius
  showSticker: boolean;
  stickerScale: number;
  showDecorations: boolean;
  showBackground: boolean; // Show background image/pattern
}

const CONTEXT_RULES: Record<DesignViewContext, ContextRules> = {
  grid: {
    shadowScale: 0.5,
    radiusScale: 1,
    showSticker: true,
    stickerScale: 0.6,
    showDecorations: false,
    showBackground: false, // Skip for performance
  },
  list: {
    shadowScale: 0,
    radiusScale: 0.8,
    showSticker: false,
    stickerScale: 0,
    showDecorations: false,
    showBackground: false, // Minimal styling
  },
  detail: {
    shadowScale: 1,
    radiusScale: 1,
    showSticker: true,
    stickerScale: 1,
    showDecorations: true,
    showBackground: true, // Full background
  },
  share: {
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
  background: '#292524',  // neutral-800 (warm gray)
  title: '#FAFAF9',       // neutral-50
  body: '#A8A29E',        // neutral-400
  accent: '#70BFBD',      // teal-300 (Hanok Teal for dark mode)
};

// ============================================
// Main Compose Functions
// ============================================

// Default iOS-style card styling
const DEFAULT_BORDER_RADIUS = 12;
const DEFAULT_SHADOW = {
  offset: { width: 0, height: 2 },
  opacity: 0.06,
  radius: 8,
  elevation: 2,
};

/**
 * Compose a view-ready style from a NoteDesign
 */
export function composeStyle(
  design: NoteDesign | null,
  fallbackColor: NoteColor,
  context: DesignViewContext,
  isDark: boolean,
  labelNames?: string[]
): ComposedStyle {
  if (!design) {
    return composeBasicStyle(fallbackColor, context, isDark, labelNames);
  }

  const contextRules = CONTEXT_RULES[context];

  // Determine sticker settings
  const stickerPosition = design.sticker?.suggestedPosition || 'bottom-right';
  const stickerBaseScale =
    design.sticker?.scale === 'small'
      ? 0.6
      : design.sticker?.scale === 'large'
      ? 1.2
      : 1;

  // Calculate scaled shadow values
  const shadowOpacity = DEFAULT_SHADOW.opacity * contextRules.shadowScale;
  const shadowRadius = Math.round(DEFAULT_SHADOW.radius * contextRules.shadowScale);
  const borderRadius = Math.round(DEFAULT_BORDER_RADIUS * contextRules.radiusScale);

  // Get typography info - pass through the titleStyle directly
  const fontStyle = design.typography?.titleStyle || 'sans-serif';

  // Get label icons if this is a label preset design
  const preset = design.labelPresetId
    ? getPresetById(design.labelPresetId as any)
    : undefined;
  const labelIcon = preset?.icon;
  // Use preset icon, or fall back to fuzzy matching for custom labels
  let noteIcon = preset?.noteIcon;
  if (!noteIcon && labelNames && labelNames.length > 0) {
    noteIcon = getIconForLabel(labelNames[0]);
  }

  // Get font families based on preset or default font style
  const validFontStyle = (fontStyle as PresetFontStyle) in DEFAULT_FONT_BY_STYLE
    ? (fontStyle as PresetFontStyle)
    : 'sans-serif';
  const fonts = design.labelPresetId
    ? getPresetFonts(design.labelPresetId as LabelPresetId, validFontStyle)
    : {
        titleFontFamily: getFontFamilyName(DEFAULT_FONT_BY_STYLE[validFontStyle].title),
        bodyFontFamily: getFontFamilyName(DEFAULT_FONT_BY_STYLE[validFontStyle].body),
      };

  // Build composed style
  const composed: ComposedStyle = {
    // Colors from design
    backgroundColor: design.background.primaryColor,
    titleColor: design.colors.titleText,
    bodyColor: design.colors.bodyText,
    accentColor: design.colors.accent,

    // Typography
    fontStyle: fontStyle as any,
    titleFontFamily: fonts.titleFontFamily,
    bodyFontFamily: fonts.bodyFontFamily,
    labelIcon,
    noteIcon,

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
    patternTintColor:
      contextRules.showBackground && design.background.style === 'pattern'
        ? design.colors.accent
        : undefined,
    backgroundOpacity: design.background.opacity ?? 0.15,
    showBackground:
      contextRules.showBackground &&
      (design.background.style === 'image' || design.background.style === 'pattern'),

    // Border radius for card corners
    borderRadius,

    // iOS-style shadow
    shadowColor: '#000000',
    shadowOffset: {
      width: Math.round(DEFAULT_SHADOW.offset.width * contextRules.shadowScale),
      height: Math.round(DEFAULT_SHADOW.offset.height * contextRules.shadowScale),
    },
    shadowOpacity,
    shadowRadius,
    elevation: Math.round(DEFAULT_SHADOW.elevation * contextRules.shadowScale),

    // Sticker
    showSticker: contextRules.showSticker && !!design.sticker?.imageUri,
    stickerScale: stickerBaseScale * contextRules.stickerScale,
    stickerPosition,
    stickerUri: design.sticker?.imageUri,

    // Decorations (shoujo sparkles, etc.)
    decorations: contextRules.showDecorations
      ? {
          type: 'shoujo', // Default decoration style
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
  isDark: boolean,
  labelNames?: string[]
): ComposedStyle {
  const contextRules = CONTEXT_RULES[context];

  // For white notes in dark mode, use dark background
  const isWhiteInDark = isDark && color === NoteColor.White;
  const backgroundColor = isWhiteInDark ? DARK_MODE_COLORS.background : color;
  const titleColor = isWhiteInDark ? DARK_MODE_COLORS.title : '#1F2937';
  const bodyColor = isWhiteInDark ? DARK_MODE_COLORS.body : '#4B5563';

  // Basic rounded card style
  const baseElevation = context === 'detail' ? 4 : context === 'grid' ? 2 : 0;

  // Default fonts for basic style
  const defaultFonts = DEFAULT_FONT_BY_STYLE['sans-serif'];

  // Get icon from labels using fuzzy matching
  const noteIcon = labelNames && labelNames.length > 0
    ? getIconForLabel(labelNames[0])
    : undefined;

  return {
    backgroundColor,
    titleColor,
    bodyColor,
    accentColor: '#4C9C9B',  // teal-500 (Hanok Teal)

    // Typography - default sans-serif
    fontStyle: 'sans-serif',
    titleFontFamily: getFontFamilyName(defaultFonts.title),
    bodyFontFamily: getFontFamilyName(defaultFonts.body),

    // No background image/pattern for basic style
    backgroundOpacity: 0.15,
    showBackground: false,

    borderRadius: Math.round(DEFAULT_BORDER_RADIUS * contextRules.radiusScale),

    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: context === 'list' ? 0 : 0.06,
    shadowRadius: context === 'list' ? 0 : 8,
    elevation: baseElevation,

    showSticker: false,
    stickerScale: 0,
    stickerPosition: 'bottom-right',

    decorations: { type: 'none' },

    // Label icons from fuzzy matching
    noteIcon,
    labelIcon: undefined,
  };
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

  const contextRules = CONTEXT_RULES[context];

  // Calculate scaled values
  const shadowOpacity = DEFAULT_SHADOW.opacity * contextRules.shadowScale;
  const shadowRadius = Math.round(DEFAULT_SHADOW.radius * contextRules.shadowScale);
  const borderRadius = Math.round(DEFAULT_BORDER_RADIUS * contextRules.radiusScale);

  // Build composed style
  const composed: ComposedStyle = {
    // Colors
    backgroundColor: colors.background,
    titleColor: colors.title,
    bodyColor: colors.body,
    accentColor: colors.accent,

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

    // Border radius for card corners
    borderRadius,

    // iOS-style shadow
    shadowColor: '#000000',
    shadowOffset: {
      width: Math.round(DEFAULT_SHADOW.offset.width * contextRules.shadowScale),
      height: Math.round(DEFAULT_SHADOW.offset.height * contextRules.shadowScale),
    },
    shadowOpacity,
    shadowRadius,
    elevation: Math.round(DEFAULT_SHADOW.elevation * contextRules.shadowScale),

    // Sticker (will be set when sticker is generated)
    showSticker: false,
    stickerScale: 1,
    stickerPosition: theme.stickerHint.defaultPosition,
    stickerUri: undefined,

    // Decorations
    decorations: contextRules.showDecorations
      ? {
          type: 'shoujo',
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

// ============================================
// Label Preset Style Composition
// ============================================

import { LabelPreset, getPresetById, LabelPresetId, getIconForLabel } from '@/constants/labelPresets';
import { getPresetFonts, PresetFontStyle, getFontFamilyName, DEFAULT_FONT_BY_STYLE } from '@/constants/fonts';

/**
 * Compose a view-ready style from a LabelPreset
 * Used for auto-applying designs when labels are selected
 */
export function composeLabelPresetStyle(
  preset: LabelPreset,
  context: DesignViewContext,
  isDark: boolean
): ComposedStyle {
  const contextRules = CONTEXT_RULES[context];

  // Calculate scaled values
  const shadowOpacity = DEFAULT_SHADOW.opacity * contextRules.shadowScale;
  const shadowRadius = Math.round(DEFAULT_SHADOW.radius * contextRules.shadowScale);
  const borderRadius = Math.round(DEFAULT_BORDER_RADIUS * contextRules.radiusScale);

  // Adjust colors for dark mode
  const backgroundColor = isDark ? adjustColorForDarkMode(preset.colors.bg) : preset.colors.bg;
  const titleColor = isDark ? '#FFFFFF' : preset.colors.text;
  const bodyColor = isDark ? '#D1D5DB' : adjustColorOpacity(preset.colors.text, 0.8);

  // Build gradient if preset uses gradient style
  const backgroundGradient =
    preset.bgStyle === 'gradient' && preset.bgGradient
      ? {
          colors: isDark
            ? preset.bgGradient.map(adjustColorForDarkMode)
            : preset.bgGradient,
          start: { x: 0, y: 0 },
          end: { x: 1, y: 1 },
        }
      : undefined;

  // Get fonts for this preset using the font mapping
  const fonts = getPresetFonts(preset.id as LabelPresetId, preset.fontStyle as PresetFontStyle);

  // Build composed style
  const composed: ComposedStyle = {
    // Colors
    backgroundColor,
    titleColor,
    bodyColor,
    accentColor: preset.colors.primary,

    // Typography - now with Google Fonts
    fontStyle: preset.fontStyle,
    titleFontFamily: fonts.titleFontFamily,
    bodyFontFamily: fonts.bodyFontFamily,

    // Label icons
    labelIcon: preset.icon,
    noteIcon: preset.noteIcon,

    // Gradient
    backgroundGradient,

    // Background pattern
    backgroundImageUri: undefined,
    backgroundPattern:
      contextRules.showBackground &&
      (preset.bgStyle === 'pattern' || preset.bgStyle === 'texture') &&
      preset.bgPattern
        ? (() => {
            const pattern = getPatternById(preset.bgPattern!);
            return pattern
              ? { patternId: preset.bgPattern!, assetName: pattern.assetName }
              : undefined;
          })()
        : undefined,
    backgroundOpacity: 0.15,
    showBackground:
      contextRules.showBackground &&
      (preset.bgStyle === 'pattern' || preset.bgStyle === 'texture'),

    // Border radius for card corners
    borderRadius,

    // iOS-style shadow with accent color tint
    shadowColor: preset.colors.primary,
    shadowOffset: {
      width: Math.round(DEFAULT_SHADOW.offset.width * contextRules.shadowScale),
      height: Math.round(DEFAULT_SHADOW.offset.height * contextRules.shadowScale),
    },
    shadowOpacity: shadowOpacity * 1.5, // Slightly more visible
    shadowRadius,
    elevation: Math.round(DEFAULT_SHADOW.elevation * contextRules.shadowScale),

    // Sticker (will be set when sticker is generated)
    showSticker: false,
    stickerScale: contextRules.stickerScale,
    stickerPosition: preset.stickerPosition,
    stickerUri: undefined,

    // Decorations based on mood
    decorations: contextRules.showDecorations
      ? {
          type: preset.mood === 'playful' || preset.mood === 'dreamy' ? 'shoujo' : 'none',
          color: preset.colors.primary,
        }
      : { type: 'none' },
  };

  return composed;
}

/**
 * Convert a LabelPreset to a NoteDesign structure
 * Creates a design that can be stored and referenced
 */
export function labelPresetToNoteDesign(
  preset: LabelPreset,
  stickerUri?: string
): NoteDesign {
  return {
    id: `label-preset-${preset.id}`,
    name: `${preset.name} Design`,
    sourceImageUri: '',
    createdAt: 0, // System preset - always available

    background: {
      primaryColor: preset.colors.bg,
      secondaryColor: preset.bgGradient?.[1] || preset.colors.secondary,
      style: 'pattern',  // Always use pattern for universal diagonal stripes
      patternId: 'diagonal-stripes',  // Universal diagonal stripe pattern
      opacity: 0.15, // Subtle pattern visibility
    },

    colors: {
      titleText: preset.colors.text,
      bodyText: adjustColorOpacity(preset.colors.text, 0.8),
      accent: preset.colors.primary,
    },

    typography: {
      titleStyle: preset.fontStyle as any, // Pass through font style directly
      vibe:
        preset.mood === 'playful'
          ? 'cute'
          : preset.mood === 'dreamy'
          ? 'classic'
          : preset.mood === 'bold'
          ? 'dramatic'
          : 'modern',
    },

    sticker: stickerUri
      ? {
          id: `${preset.id}-sticker`,
          imageUri: stickerUri,
          description: `${preset.name} style character`,
          suggestedPosition: preset.stickerPosition,
          scale: 'medium',
        }
      : {
          id: `${preset.id}-placeholder`,
          imageUri: '',
          description: preset.description,
          suggestedPosition: preset.stickerPosition,
          scale: 'medium',
        },

    designSummary: preset.description,
    isSystemDefault: true,
    labelPresetId: preset.id,
    isLabelPreset: true,
  };
}

/**
 * Get a NoteDesign from a label preset ID
 * Useful for design store lookup
 */
export function getNoteDesignFromLabelPresetId(presetId: string): NoteDesign | null {
  const preset = getPresetById(presetId as any);
  if (!preset) return null;
  return labelPresetToNoteDesign(preset);
}

// ============================================
// Color Utility Functions
// ============================================

/**
 * Adjust a hex color's opacity (returns rgba string or darkened hex)
 */
function adjustColorOpacity(hex: string, opacity: number): string {
  // For simplicity, just darken/lighten the color
  // In a real app, you might convert to rgba
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  // Blend toward dark for text colors
  const r = Math.round(rgb.r * opacity + 0 * (1 - opacity));
  const g = Math.round(rgb.g * opacity + 0 * (1 - opacity));
  const b = Math.round(rgb.b * opacity + 0 * (1 - opacity));

  return rgbToHex(r, g, b);
}

/**
 * Adjust a color for dark mode (darken light colors)
 */
function adjustColorForDarkMode(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  // Check if it's a light color
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;

  if (brightness > 128) {
    // It's light, darken it significantly
    const factor = 0.3;
    const r = Math.round(rgb.r * factor);
    const g = Math.round(rgb.g * factor);
    const b = Math.round(rgb.b * factor);
    return rgbToHex(r, g, b);
  }

  // Already dark, return as is
  return hex;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = Math.max(0, Math.min(255, x)).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}
