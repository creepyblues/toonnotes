/**
 * Unit Tests for designEngine
 *
 * Tests style composition and context-based rendering.
 * Note: Border configuration was simplified - tests updated accordingly.
 */

import {
  composeStyle,
  composeBasicStyle,
} from '@/services/designEngine';
import {
  NoteDesign,
  NoteColor,
  DesignViewContext,
} from '@/types';

// Mock pattern registry
jest.mock('@/constants/patterns', () => ({
  getPatternById: jest.fn((id: string) => {
    if (id === 'pattern-1') {
      return { id: 'pattern-1', assetName: 'pattern_asset_1' };
    }
    return null;
  }),
}));

// Mock label presets
jest.mock('@/constants/labelPresets', () => ({
  getPresetById: jest.fn(() => null),
}));

// Mock fonts
jest.mock('@/constants/fonts', () => ({
  getPresetFonts: jest.fn(() => ({
    titleFontFamily: 'Inter',
    bodyFontFamily: 'Inter',
  })),
  getFontFamilyName: jest.fn((font: string) => font),
  DEFAULT_FONT_BY_STYLE: {
    'sans-serif': { title: 'Inter', body: 'Inter' },
    'serif': { title: 'Merriweather', body: 'Merriweather' },
    'display': { title: 'Oswald', body: 'Oswald' },
    'handwritten': { title: 'Caveat', body: 'Caveat' },
    'mono': { title: 'JetBrains Mono', body: 'JetBrains Mono' },
  },
}));

const createMockDesign = (overrides?: Partial<NoteDesign>): NoteDesign => ({
  id: 'design-1',
  name: 'Test Design',
  sourceImageUri: 'file://test.jpg',
  createdAt: Date.now(),
  background: {
    primaryColor: '#FFFFFF',
    secondaryColor: '#F0F0F0',
    style: 'gradient',
    opacity: 0.15,
  },
  colors: {
    titleText: '#000000',
    bodyText: '#333333',
    accent: '#0ea5e9',
  },
  typography: {
    titleStyle: 'sans-serif',
    vibe: 'modern',
  },
  sticker: {
    id: 'sticker-1',
    imageUri: 'file://sticker.png',
    description: 'Cute character',
    suggestedPosition: 'bottom-right',
    scale: 'medium',
  },
  designSummary: 'A clean, modern design',
  ...overrides,
});

describe('designEngine', () => {
  describe('composeStyle - Basic Composition', () => {
    it('should compose style from design with gradient background', () => {
      const design = createMockDesign();
      const style = composeStyle(design, NoteColor.White, 'detail', false);

      expect(style.backgroundColor).toBe('#FFFFFF');
      expect(style.backgroundGradient).toBeDefined();
      expect(style.backgroundGradient?.colors).toEqual(['#FFFFFF', '#F0F0F0']);
      expect(style.titleColor).toBe('#000000');
      expect(style.bodyColor).toBe('#333333');
      expect(style.accentColor).toBe('#0ea5e9');
    });

    it('should compose style from design with solid background', () => {
      const design = createMockDesign({
        background: {
          primaryColor: '#FFCC00',
          style: 'solid',
        },
      });
      const style = composeStyle(design, NoteColor.White, 'detail', false);

      expect(style.backgroundColor).toBe('#FFCC00');
      expect(style.backgroundGradient).toBeUndefined();
    });

    it('should include background image in detail context', () => {
      const design = createMockDesign({
        background: {
          primaryColor: '#FFFFFF',
          style: 'image',
          imageUri: 'file://bg.jpg',
          opacity: 0.2,
        },
      });
      const style = composeStyle(design, NoteColor.White, 'detail', false);

      expect(style.backgroundImageUri).toBe('file://bg.jpg');
      expect(style.backgroundOpacity).toBe(0.2);
      expect(style.showBackground).toBe(true);
    });

    it('should not include background image in grid context', () => {
      const design = createMockDesign({
        background: {
          primaryColor: '#FFFFFF',
          style: 'image',
          imageUri: 'file://bg.jpg',
          opacity: 0.2,
        },
      });
      const style = composeStyle(design, NoteColor.White, 'grid', false);

      expect(style.backgroundImageUri).toBeUndefined();
      expect(style.showBackground).toBe(false);
    });

    it('should include background pattern in detail context', () => {
      const design = createMockDesign({
        background: {
          primaryColor: '#FFFFFF',
          style: 'pattern',
          patternId: 'pattern-1',
          opacity: 0.15,
        },
      });
      const style = composeStyle(design, NoteColor.White, 'detail', false);

      expect(style.backgroundPattern).toBeDefined();
      expect(style.backgroundPattern?.patternId).toBe('pattern-1');
      expect(style.backgroundPattern?.assetName).toBe('pattern_asset_1');
      expect(style.showBackground).toBe(true);
    });

    it('should handle non-existent pattern gracefully', () => {
      const design = createMockDesign({
        background: {
          primaryColor: '#FFFFFF',
          style: 'pattern',
          patternId: 'non-existent-pattern',
          opacity: 0.15,
        },
      });
      const style = composeStyle(design, NoteColor.White, 'detail', false);

      expect(style.backgroundPattern).toBeUndefined();
    });
  });

  describe('composeStyle - Context-Based Rendering', () => {
    const design = createMockDesign();

    it('should show full styling in detail context', () => {
      const style = composeStyle(design, NoteColor.White, 'detail', false);

      expect(style.showSticker).toBe(true);
      expect(style.stickerScale).toBe(1);
      expect(style.decorations?.type).toBe('shoujo');
    });

    it('should show scaled styling in grid context', () => {
      const style = composeStyle(design, NoteColor.White, 'grid', false);

      expect(style.showSticker).toBe(true);
      expect(style.stickerScale).toBe(0.6); // scaled down
      expect(style.decorations?.type).toBe('none'); // no decorations in grid
    });

    it('should show minimal styling in list context', () => {
      const style = composeStyle(design, NoteColor.White, 'list', false);

      expect(style.showSticker).toBe(false);
      expect(style.decorations?.type).toBe('none');
      expect(style.shadowOpacity).toBe(0);
    });

    it('should show enhanced styling in share context', () => {
      const style = composeStyle(design, NoteColor.White, 'share', false);

      expect(style.showSticker).toBe(true);
      expect(style.stickerScale).toBeGreaterThan(1); // scaled up for share
      expect(style.decorations?.type).toBe('shoujo');
    });
  });

  describe('composeStyle - Sticker Configuration', () => {
    it('should show sticker in detail context', () => {
      const design = createMockDesign();
      const style = composeStyle(design, NoteColor.White, 'detail', false);

      expect(style.showSticker).toBe(true);
      expect(style.stickerUri).toBe('file://sticker.png');
      expect(style.stickerPosition).toBe('bottom-right');
      expect(style.stickerScale).toBe(1); // medium sticker = 1
    });

    it('should handle small sticker scale', () => {
      const design = createMockDesign({
        sticker: {
          id: 'sticker-1',
          imageUri: 'file://sticker.png',
          description: 'Small',
          suggestedPosition: 'top-left',
          scale: 'small',
        },
      });
      const style = composeStyle(design, NoteColor.White, 'detail', false);

      expect(style.stickerScale).toBe(0.6);
    });

    it('should handle large sticker scale', () => {
      const design = createMockDesign({
        sticker: {
          id: 'sticker-1',
          imageUri: 'file://sticker.png',
          description: 'Large',
          suggestedPosition: 'top-right',
          scale: 'large',
        },
      });
      const style = composeStyle(design, NoteColor.White, 'detail', false);

      expect(style.stickerScale).toBe(1.2);
    });

    it('should not show sticker when sticker imageUri is missing', () => {
      const design = createMockDesign({
        sticker: {
          id: 'sticker-1',
          imageUri: '',
          description: 'No image',
          suggestedPosition: 'bottom-left',
          scale: 'medium',
        },
      });
      const style = composeStyle(design, NoteColor.White, 'detail', false);

      expect(style.showSticker).toBe(false);
    });
  });

  describe('composeBasicStyle - Fallback Styling', () => {
    it('should compose basic style without design', () => {
      const style = composeBasicStyle(NoteColor.Sky, 'detail', false);

      expect(style.backgroundColor).toBe(NoteColor.Sky);
      expect(style.titleColor).toBe('#1F2937');
      expect(style.bodyColor).toBe('#4B5563');
      expect(style.showSticker).toBe(false);
      expect(style.decorations?.type).toBe('none');
    });

    it('should use dark mode colors for white notes in dark mode', () => {
      const style = composeBasicStyle(NoteColor.White, 'detail', true);

      expect(style.backgroundColor).toBe('#292524'); // neutral-800 (warm gray)
      expect(style.titleColor).toBe('#FAFAF9');      // neutral-50
      expect(style.bodyColor).toBe('#A8A29E');       // neutral-400
    });

    it('should use regular colors for colored notes in dark mode', () => {
      const style = composeBasicStyle(NoteColor.Sky, 'detail', true);

      expect(style.backgroundColor).toBe(NoteColor.Sky);
      expect(style.titleColor).toBe('#1F2937');
    });

    it('should adapt shadow to context', () => {
      const detailStyle = composeBasicStyle(NoteColor.Peach, 'detail', false);
      const listStyle = composeBasicStyle(NoteColor.Peach, 'list', false);
      const gridStyle = composeBasicStyle(NoteColor.Peach, 'grid', false);

      expect(detailStyle.shadowOpacity).toBeGreaterThan(0);
      expect(listStyle.shadowOpacity).toBe(0);
      expect(gridStyle.shadowOpacity).toBeGreaterThan(0);
    });

    it('should have no background image or pattern', () => {
      const style = composeBasicStyle(NoteColor.Mint, 'detail', false);

      expect(style.showBackground).toBe(false);
      expect(style.backgroundImageUri).toBeUndefined();
      expect(style.backgroundPattern).toBeUndefined();
    });
  });

  describe('composeStyle - Null Design Fallback', () => {
    it('should use basic style when design is null', () => {
      const style = composeStyle(null, NoteColor.Violet, 'detail', false);

      expect(style.backgroundColor).toBe(NoteColor.Violet);
      expect(style.showSticker).toBe(false);
    });

    it('should respect context when using fallback', () => {
      const detailStyle = composeStyle(null, NoteColor.Rose, 'detail', false);
      const listStyle = composeStyle(null, NoteColor.Rose, 'list', false);

      expect(detailStyle.shadowOpacity).toBeGreaterThan(listStyle.shadowOpacity);
    });
  });

  describe('Edge Cases', () => {
    it('should handle design with missing sticker gracefully', () => {
      const design = createMockDesign();
      // @ts-expect-error Testing edge case
      design.sticker = undefined;

      const style = composeStyle(design, NoteColor.White, 'detail', false);

      expect(style.showSticker).toBe(false);
      expect(style.stickerUri).toBeUndefined();
    });

    it('should handle design with missing background secondary color', () => {
      const design = createMockDesign({
        background: {
          primaryColor: '#FFFFFF',
          style: 'gradient',
        },
      });

      const style = composeStyle(design, NoteColor.White, 'detail', false);

      expect(style.backgroundGradient).toBeUndefined(); // No gradient without secondary
    });

    it('should handle all note colors as fallback', () => {
      const colors = [
        NoteColor.White,
        NoteColor.Lavender,
        NoteColor.Rose,
        NoteColor.Peach,
        NoteColor.Mint,
        NoteColor.Sky,
        NoteColor.Violet,
      ];

      colors.forEach((color) => {
        const style = composeBasicStyle(color, 'detail', false);
        expect(style.backgroundColor).toBeDefined();
        expect(style.titleColor).toBeDefined();
      });
    });

    it('should handle all view contexts', () => {
      const contexts: DesignViewContext[] = ['grid', 'list', 'detail', 'share'];
      const design = createMockDesign();

      contexts.forEach((context) => {
        const style = composeStyle(design, NoteColor.White, context, false);
        expect(style).toBeDefined();
        expect(style.backgroundColor).toBeDefined();
      });
    });

    it('should compose style with default opacity when not specified', () => {
      const design = createMockDesign({
        background: {
          primaryColor: '#FFFFFF',
          style: 'image',
          imageUri: 'file://bg.jpg',
        },
      });

      const style = composeStyle(design, NoteColor.White, 'detail', false);

      expect(style.backgroundOpacity).toBe(0.15); // default opacity
    });

    it('should have border radius in all contexts', () => {
      const design = createMockDesign();
      const contexts: DesignViewContext[] = ['grid', 'list', 'detail', 'share'];

      contexts.forEach((context) => {
        const style = composeStyle(design, NoteColor.White, context, false);
        expect(style.borderRadius).toBeGreaterThan(0);
      });
    });

    it('should have iOS-style shadow properties', () => {
      const design = createMockDesign();
      const style = composeStyle(design, NoteColor.White, 'detail', false);

      expect(style.shadowColor).toBe('#000000');
      expect(style.shadowOffset).toBeDefined();
      expect(typeof style.shadowOpacity).toBe('number');
      expect(typeof style.shadowRadius).toBe('number');
      expect(typeof style.elevation).toBe('number');
    });
  });
});
