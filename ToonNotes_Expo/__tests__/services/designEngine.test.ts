/**
 * Unit Tests for designEngine
 *
 * Tests style composition, context-based rendering, border configs,
 * and theme-based design generation.
 */

import {
  composeStyle,
  composeBasicStyle,
  getBorderColor,
  getPopShadowColor,
} from '@/services/designEngine';
import {
  NoteDesign,
  NoteColor,
  DesignViewContext,
  BorderTemplate,
  BorderThickness,
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
    border: '#E5E7EB',
  },
  border: {
    template: 'panel',
    thickness: 'medium',
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
      expect(style.borderColor).toBe('#E5E7EB');
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

  describe('composeStyle - Border Configurations', () => {
    it('should apply panel border config', () => {
      const design = createMockDesign({
        border: { template: 'panel', thickness: 'thick' },
      });
      const style = composeStyle(design, NoteColor.White, 'detail', false);

      expect(style.borderWidth).toBe(5); // thick panel = 5
      expect(style.borderStyle).toBe('solid');
      expect(style.borderRadius).toBe(0); // panel has no radius
      expect(style.showBorder).toBe(true);
    });

    it('should apply webtoon border config', () => {
      const design = createMockDesign({
        border: { template: 'webtoon', thickness: 'medium' },
      });
      const style = composeStyle(design, NoteColor.White, 'detail', false);

      expect(style.borderWidth).toBe(1);
      expect(style.borderRadius).toBe(4);
      expect(style.shadowOpacity).toBeGreaterThan(0);
    });

    it('should apply sketch border config with dashed style', () => {
      const design = createMockDesign({
        border: { template: 'sketch', thickness: 'medium' },
      });
      const style = composeStyle(design, NoteColor.White, 'detail', false);

      expect(style.borderStyle).toBe('dashed');
      expect(style.borderRadius).toBe(8);
    });

    it('should apply shoujo border config with decorations', () => {
      const design = createMockDesign({
        border: { template: 'shoujo', thickness: 'medium' },
      });
      const style = composeStyle(design, NoteColor.White, 'detail', false);

      expect(style.borderRadius).toBe(20);
      expect(style.decorations?.type).toBe('shoujo');
      expect(style.shadowOpacity).toBeGreaterThan(0);
    });

    it('should apply pop border config with decorations', () => {
      const design = createMockDesign({
        border: { template: 'pop', thickness: 'thick' },
      });
      const style = composeStyle(design, NoteColor.White, 'detail', false);

      expect(style.decorations?.type).toBe('pop');
      expect(style.shadowOpacity).toBe(1); // pop has solid shadow
    });

    it('should handle all border thicknesses', () => {
      const thicknesses: BorderThickness[] = ['thin', 'medium', 'thick'];

      thicknesses.forEach((thickness) => {
        const design = createMockDesign({
          border: { template: 'panel', thickness },
        });
        const style = composeStyle(design, NoteColor.White, 'detail', false);

        expect(style.borderWidth).toBeGreaterThan(0);
        expect(style.showBorder).toBe(true);
      });
    });
  });

  describe('composeStyle - Context-Based Rendering', () => {
    const design = createMockDesign({
      border: { template: 'shoujo', thickness: 'medium' },
    });

    it('should show full styling in detail context', () => {
      const style = composeStyle(design, NoteColor.White, 'detail', false);

      expect(style.showSticker).toBe(true);
      expect(style.stickerScale).toBe(1);
      expect(style.decorations?.type).toBe('shoujo');
      expect(style.showBackground).toBe(false); // no background image/pattern
    });

    it('should show scaled styling in grid context', () => {
      const style = composeStyle(design, NoteColor.White, 'grid', false);

      expect(style.showSticker).toBe(true);
      expect(style.stickerScale).toBe(0.6); // scaled down
      expect(style.decorations?.type).toBe('none'); // no decorations in grid
      expect(style.borderWidth).toBeLessThan(
        composeStyle(design, NoteColor.White, 'detail', false).borderWidth
      );
    });

    it('should show minimal styling in list context', () => {
      const style = composeStyle(design, NoteColor.White, 'list', false);

      expect(style.showSticker).toBe(false);
      expect(style.borderWidth).toBe(0); // no border in list
      expect(style.decorations?.type).toBe('none');
      expect(style.shadowOpacity).toBe(0);
    });

    it('should show enhanced styling in share context', () => {
      const style = composeStyle(design, NoteColor.White, 'share', false);

      expect(style.showSticker).toBe(true);
      expect(style.stickerScale).toBeGreaterThan(1); // scaled up for share
      expect(style.decorations?.type).toBe('shoujo');
      // Share context should have at least the same border width as detail
      expect(style.borderWidth).toBeGreaterThanOrEqual(
        composeStyle(design, NoteColor.White, 'detail', false).borderWidth
      );
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
      const style = composeBasicStyle(NoteColor.Blue, 'detail', false);

      expect(style.backgroundColor).toBe(NoteColor.Blue);
      expect(style.titleColor).toBe('#1F2937');
      expect(style.bodyColor).toBe('#4B5563');
      expect(style.showSticker).toBe(false);
      expect(style.showBorder).toBe(false);
      expect(style.decorations?.type).toBe('none');
    });

    it('should use dark mode colors for white notes in dark mode', () => {
      const style = composeBasicStyle(NoteColor.White, 'detail', true);

      expect(style.backgroundColor).toBe('#2D2D2D');
      expect(style.titleColor).toBe('#FFFFFF');
      expect(style.bodyColor).toBe('#D1D5DB');
    });

    it('should use regular colors for colored notes in dark mode', () => {
      const style = composeBasicStyle(NoteColor.Blue, 'detail', true);

      expect(style.backgroundColor).toBe(NoteColor.Blue);
      expect(style.titleColor).toBe('#1F2937');
    });

    it('should adapt shadow to context', () => {
      const detailStyle = composeBasicStyle(NoteColor.Yellow, 'detail', false);
      const listStyle = composeBasicStyle(NoteColor.Yellow, 'list', false);
      const gridStyle = composeBasicStyle(NoteColor.Yellow, 'grid', false);

      expect(detailStyle.shadowOpacity).toBeGreaterThan(0);
      expect(listStyle.shadowOpacity).toBe(0);
      expect(gridStyle.shadowOpacity).toBeGreaterThan(0);
    });

    it('should have no background image or pattern', () => {
      const style = composeBasicStyle(NoteColor.Green, 'detail', false);

      expect(style.showBackground).toBe(false);
      expect(style.backgroundImageUri).toBeUndefined();
      expect(style.backgroundPattern).toBeUndefined();
    });
  });

  describe('composeStyle - Null Design Fallback', () => {
    it('should use basic style when design is null', () => {
      const style = composeStyle(null, NoteColor.Purple, 'detail', false);

      expect(style.backgroundColor).toBe(NoteColor.Purple);
      expect(style.showSticker).toBe(false);
      expect(style.showBorder).toBe(false);
    });

    it('should respect context when using fallback', () => {
      const detailStyle = composeStyle(null, NoteColor.Red, 'detail', false);
      const listStyle = composeStyle(null, NoteColor.Red, 'list', false);

      expect(detailStyle.shadowOpacity).toBeGreaterThan(listStyle.shadowOpacity);
    });
  });

  describe('getBorderColor - Special Border Colors', () => {
    it('should return white for sticker template', () => {
      const color = getBorderColor('sticker', '#FF0000');
      expect(color).toBe('#FFFFFF');
    });

    it('should return dark color for panel template', () => {
      const color = getBorderColor('panel', '#FF0000');
      expect(color).toBe('#1a1a1a');
    });

    it('should return dark color for pop template', () => {
      const color = getBorderColor('pop', '#FF0000');
      expect(color).toBe('#1a1a1a');
    });

    it('should return design color for other templates', () => {
      const templates: BorderTemplate[] = [
        'webtoon',
        'sketch',
        'shoujo',
        'vintage_manga',
        'watercolor',
        'speech_bubble',
        'speed_lines',
        'impact',
        'ink_splash',
      ];

      templates.forEach((template) => {
        const color = getBorderColor(template, '#0ea5e9');
        expect(color).toBe('#0ea5e9');
      });
    });
  });

  describe('getPopShadowColor - Pop Shadow', () => {
    it('should return dark shadow color for pop template', () => {
      const color = getPopShadowColor('pop');
      expect(color).toBe('#1a1a1a');
    });

    it('should return undefined for other templates', () => {
      const templates: BorderTemplate[] = [
        'panel',
        'webtoon',
        'sketch',
        'shoujo',
        'vintage_manga',
        'watercolor',
        'speech_bubble',
        'sticker',
        'speed_lines',
        'impact',
        'ink_splash',
      ];

      templates.forEach((template) => {
        const color = getPopShadowColor(template);
        expect(color).toBeUndefined();
      });
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
        NoteColor.Red,
        NoteColor.Orange,
        NoteColor.Yellow,
        NoteColor.Green,
        NoteColor.Teal,
        NoteColor.Blue,
        NoteColor.Purple,
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

    it('should handle border width of 0 in list context', () => {
      const design = createMockDesign();
      const style = composeStyle(design, NoteColor.White, 'list', false);

      expect(style.borderWidth).toBe(0);
      expect(style.showBorder).toBe(false);
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
  });
});
