/**
 * Design Engine - Web CSS Port
 * Ported from ToonNotes_Expo/services/designEngine.ts
 */

import {
  NoteDesign,
  NoteColor,
  DesignViewContext,
  ComposedStyle,
  StickerPosition,
  NOTE_COLOR_VALUES,
} from './types';

// ============================================
// Context-specific Rendering Rules
// ============================================

interface ContextRules {
  shadowScale: number;
  radiusScale: number;
  showSticker: boolean;
  stickerScale: number;
  showDecorations: boolean;
  showBackground: boolean;
}

const CONTEXT_RULES: Record<DesignViewContext, ContextRules> = {
  grid: {
    shadowScale: 0.5,
    radiusScale: 1,
    showSticker: true,
    stickerScale: 0.6,
    showDecorations: false,
    showBackground: false,
  },
  list: {
    shadowScale: 0,
    radiusScale: 0.8,
    showSticker: false,
    stickerScale: 0,
    showDecorations: false,
    showBackground: false,
  },
  detail: {
    shadowScale: 1,
    radiusScale: 1,
    showSticker: true,
    stickerScale: 1,
    showDecorations: true,
    showBackground: true,
  },
  share: {
    shadowScale: 1.5,
    radiusScale: 1,
    showSticker: true,
    stickerScale: 1.2,
    showDecorations: true,
    showBackground: true,
  },
};

// ============================================
// Default Styling Constants
// ============================================

const DEFAULT_BORDER_RADIUS = 12;
const DEFAULT_SHADOW = {
  x: 0,
  y: 2,
  blur: 8,
  opacity: 0.06,
};

// Font family mapping
const FONT_FAMILIES: Record<string, string> = {
  'sans-serif': "'Inter', ui-sans-serif, system-ui, sans-serif",
  serif: "'Playfair Display', ui-serif, Georgia, serif",
  handwritten: "'Caveat', cursive",
};

// ============================================
// Main Compose Function
// ============================================

export function composeStyle(
  design: NoteDesign | null,
  fallbackColor: NoteColor | string,
  context: DesignViewContext = 'share'
): ComposedStyle {
  if (!design) {
    return composeBasicStyle(fallbackColor, context);
  }

  const contextRules = CONTEXT_RULES[context];

  // Determine sticker settings
  const stickerPosition: StickerPosition =
    design.sticker?.suggestedPosition || 'bottom-right';
  const stickerBaseScale =
    design.sticker?.scale === 'small'
      ? 0.6
      : design.sticker?.scale === 'large'
        ? 1.2
        : 1;

  // Calculate scaled values
  const shadowOpacity = DEFAULT_SHADOW.opacity * contextRules.shadowScale;
  const shadowBlur = Math.round(DEFAULT_SHADOW.blur * contextRules.shadowScale);
  const borderRadius = Math.round(
    DEFAULT_BORDER_RADIUS * contextRules.radiusScale
  );

  // Get typography info
  const fontStyle = design.typography?.titleStyle || 'sans-serif';

  // Build composed style
  const composed: ComposedStyle = {
    // Colors from design
    backgroundColor: design.background.primaryColor,
    titleColor: design.colors.titleText,
    bodyColor: design.colors.bodyText,
    accentColor: design.colors.accent,

    // Typography
    fontStyle: fontStyle as 'serif' | 'sans-serif' | 'handwritten',
    titleFontFamily: FONT_FAMILIES[fontStyle] || FONT_FAMILIES['sans-serif'],
    bodyFontFamily: FONT_FAMILIES['sans-serif'],

    // Gradient if applicable
    backgroundGradient:
      design.background.style === 'gradient' && design.background.secondaryColor
        ? {
            colors: [
              design.background.primaryColor,
              design.background.secondaryColor,
            ],
            direction: 'vertical',
          }
        : undefined,

    // Background image/pattern
    backgroundImageUri:
      contextRules.showBackground && design.background.style === 'image'
        ? design.background.imageUri
        : undefined,
    backgroundPattern:
      contextRules.showBackground &&
      design.background.style === 'pattern' &&
      design.background.patternId
        ? {
            patternId: design.background.patternId,
            assetName: `/patterns/${design.background.patternId}.png`,
          }
        : undefined,
    backgroundOpacity: design.background.opacity ?? 0.15,
    showBackground:
      contextRules.showBackground &&
      (design.background.style === 'image' ||
        design.background.style === 'pattern'),

    // Border radius for card corners
    borderRadius,

    // CSS box-shadow
    boxShadow:
      shadowOpacity > 0
        ? `${DEFAULT_SHADOW.x}px ${Math.round(DEFAULT_SHADOW.y * contextRules.shadowScale)}px ${shadowBlur}px rgba(0, 0, 0, ${shadowOpacity})`
        : 'none',

    // Sticker
    showSticker: contextRules.showSticker && !!design.sticker?.imageUri,
    stickerScale: stickerBaseScale * contextRules.stickerScale,
    stickerPosition,
    stickerUri: design.sticker?.imageUri,

    // Decorations
    showDecorations: contextRules.showDecorations,
    decorationColor: design.colors.accent,
  };

  return composed;
}

/**
 * Compose a basic style for notes without a custom design
 */
export function composeBasicStyle(
  color: NoteColor | string,
  context: DesignViewContext
): ComposedStyle {
  const contextRules = CONTEXT_RULES[context];

  // Get hex color value
  const backgroundColor =
    NOTE_COLOR_VALUES[color as NoteColor] ||
    (color.startsWith('#') ? color : '#FFFFFF');

  // Calculate scaled values
  const shadowOpacity = DEFAULT_SHADOW.opacity * contextRules.shadowScale;
  const shadowBlur = Math.round(DEFAULT_SHADOW.blur * contextRules.shadowScale);
  const borderRadius = Math.round(
    DEFAULT_BORDER_RADIUS * contextRules.radiusScale
  );

  return {
    backgroundColor,
    titleColor: '#1F2937',
    bodyColor: '#4B5563',
    accentColor: '#4C9C9B', // teal-500 (Hanok Teal)

    // Typography - default sans-serif
    fontStyle: 'sans-serif',
    titleFontFamily: FONT_FAMILIES['sans-serif'],
    bodyFontFamily: FONT_FAMILIES['sans-serif'],

    // No background image/pattern for basic style
    backgroundOpacity: 0.15,
    showBackground: false,

    borderRadius,

    boxShadow:
      shadowOpacity > 0
        ? `${DEFAULT_SHADOW.x}px ${Math.round(DEFAULT_SHADOW.y * contextRules.shadowScale)}px ${shadowBlur}px rgba(0, 0, 0, ${shadowOpacity})`
        : 'none',

    showSticker: false,
    stickerScale: 0,
    stickerPosition: 'bottom-right',

    showDecorations: false,
  };
}

/**
 * Convert ComposedStyle to React CSSProperties
 */
export function composedStyleToCSS(
  style: ComposedStyle
): React.CSSProperties {
  const css: React.CSSProperties = {
    backgroundColor: style.backgroundColor,
    borderRadius: `${style.borderRadius}px`,
    boxShadow: style.boxShadow,
  };

  // Add gradient if present
  if (style.backgroundGradient) {
    const { colors, direction } = style.backgroundGradient;
    const gradientDirection =
      direction === 'horizontal'
        ? 'to right'
        : direction === 'diagonal'
          ? 'to bottom right'
          : 'to bottom';
    css.background = `linear-gradient(${gradientDirection}, ${colors.join(', ')})`;
  }

  return css;
}

/**
 * Get sticker position CSS classes
 */
export function getStickerPositionClasses(position: StickerPosition): string {
  const positions: Record<StickerPosition, string> = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };
  return positions[position];
}
