/**
 * Unit Tests for Theme Constants and Helper Functions
 *
 * Tests theme retrieval, random selection, and AI prompt generation.
 */

import {
  DESIGN_THEMES,
  THEME_LIST,
  getThemeById,
  getRandomTheme,
  getThemeStickerPrompt,
  mergeThemeWithAIColors,
  ThemeId,
} from '@/constants/themes';

describe('Theme Constants', () => {
  describe('Theme Data Structure', () => {
    it('should have all 7 themes defined', () => {
      expect(THEME_LIST).toHaveLength(7);
      expect(Object.keys(DESIGN_THEMES)).toHaveLength(7);
    });

    it('should have all required theme properties', () => {
      THEME_LIST.forEach((theme) => {
        expect(theme).toHaveProperty('id');
        expect(theme).toHaveProperty('name');
        expect(theme).toHaveProperty('emoji');
        expect(theme).toHaveProperty('description');
        expect(theme).toHaveProperty('colors');
        expect(theme).toHaveProperty('background');
        expect(theme).toHaveProperty('border');
        expect(theme).toHaveProperty('typography');
        expect(theme).toHaveProperty('accents');
        expect(theme).toHaveProperty('stickerHint');
        expect(theme).toHaveProperty('aiPromptHints');
      });
    });

    it('should have unique theme IDs', () => {
      const ids = THEME_LIST.map((t) => t.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique theme names', () => {
      const names = THEME_LIST.map((t) => t.name);
      const uniqueNames = new Set(names);

      expect(uniqueNames.size).toBe(names.length);
    });

    it('should have valid theme IDs', () => {
      const expectedIds: ThemeId[] = [
        'ghibli',
        'manga',
        'webtoon',
        'shoujo',
        'shonen',
        'kawaii',
        'vintage',
      ];

      const actualIds = THEME_LIST.map((t) => t.id);
      expect(actualIds).toEqual(expectedIds);
    });
  });

  describe('Theme Color Structure', () => {
    it('should have all required color properties', () => {
      THEME_LIST.forEach((theme) => {
        expect(theme.colors).toHaveProperty('background');
        expect(theme.colors).toHaveProperty('title');
        expect(theme.colors).toHaveProperty('body');
        expect(theme.colors).toHaveProperty('accent');
        expect(theme.colors).toHaveProperty('border');

        expect(typeof theme.colors.background).toBe('string');
        expect(typeof theme.colors.title).toBe('string');
        expect(typeof theme.colors.body).toBe('string');
        expect(typeof theme.colors.accent).toBe('string');
        expect(typeof theme.colors.border).toBe('string');
      });
    });

    it('should have valid hex color format', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;

      THEME_LIST.forEach((theme) => {
        expect(theme.colors.background).toMatch(hexRegex);
        expect(theme.colors.title).toMatch(hexRegex);
        expect(theme.colors.body).toMatch(hexRegex);
        expect(theme.colors.accent).toMatch(hexRegex);
        expect(theme.colors.border).toMatch(hexRegex);

        if (theme.colors.backgroundSecondary) {
          expect(theme.colors.backgroundSecondary).toMatch(hexRegex);
        }
      });
    });
  });

  describe('getThemeById', () => {
    it('should retrieve theme by id', () => {
      const theme = getThemeById('ghibli');

      expect(theme).toBeDefined();
      expect(theme.id).toBe('ghibli');
      expect(theme.name).toBe('Ghibli Dreamscape');
      expect(theme.emoji).toBe('🎨');
    });

    it('should retrieve all defined themes', () => {
      const themeIds: ThemeId[] = [
        'ghibli',
        'manga',
        'webtoon',
        'shoujo',
        'shonen',
        'kawaii',
        'vintage',
      ];

      themeIds.forEach((id) => {
        const theme = getThemeById(id);
        expect(theme).toBeDefined();
        expect(theme.id).toBe(id);
      });
    });

    it('should retrieve ghibli theme correctly', () => {
      const theme = getThemeById('ghibli');

      expect(theme.name).toBe('Ghibli Dreamscape');
      expect(theme.border.template).toBe('watercolor');
      expect(theme.background.style).toBe('pattern');
      expect(theme.accents.type).toBe('clouds');
    });

    it('should retrieve manga theme correctly', () => {
      const theme = getThemeById('manga');

      expect(theme.name).toBe('Manga Panel');
      expect(theme.border.template).toBe('panel');
      expect(theme.border.thickness).toBe('thick');
      expect(theme.accents.type).toBe('speed_lines');
    });

    it('should retrieve shoujo theme correctly', () => {
      const theme = getThemeById('shoujo');

      expect(theme.name).toBe('Shoujo Romance');
      expect(theme.border.template).toBe('shoujo');
      expect(theme.accents.type).toBe('sparkles');
      expect(theme.accents.animated).toBe(true);
    });
  });

  describe('getRandomTheme', () => {
    it('should return a valid theme', () => {
      const theme = getRandomTheme();

      expect(theme).toBeDefined();
      expect(THEME_LIST).toContain(theme);
    });

    it('should return different themes over multiple calls', () => {
      const themes = new Set();

      // Generate 50 random themes
      for (let i = 0; i < 50; i++) {
        const theme = getRandomTheme();
        themes.add(theme.id);
      }

      // With 50 calls and 7 themes, we should get multiple different themes
      expect(themes.size).toBeGreaterThan(1);
    });

    it('should return themes from THEME_LIST', () => {
      const randomTheme = getRandomTheme();
      const isInList = THEME_LIST.some((t) => t.id === randomTheme.id);

      expect(isInList).toBe(true);
    });
  });

  describe('getThemeStickerPrompt', () => {
    it('should generate sticker prompt for ghibli theme', () => {
      const theme = getThemeById('ghibli');
      const prompt = getThemeStickerPrompt(theme, 'a magical forest spirit');

      expect(prompt).toContain('a magical forest spirit');
      expect(prompt).toContain(theme.stickerHint.artStyle);
      expect(prompt).toContain('Ghibli Dreamscape');
    });

    it('should include theme art style', () => {
      const theme = getThemeById('manga');
      const prompt = getThemeStickerPrompt(theme, 'a cool ninja');

      expect(prompt).toContain('high contrast manga style');
      expect(prompt).toContain('bold ink lines');
    });

    it('should include AI prompt hints', () => {
      const theme = getThemeById('shoujo');
      const prompt = getThemeStickerPrompt(theme, 'a romantic couple');

      expect(prompt).toContain('shoujo manga aesthetic');
      expect(prompt).toContain('sparkles and flowers');
    });

    it('should work for all themes', () => {
      THEME_LIST.forEach((theme) => {
        const prompt = getThemeStickerPrompt(theme, 'test character');

        expect(prompt).toContain('test character');
        expect(prompt).toContain(theme.name);
        expect(prompt.length).toBeGreaterThan(50); // Should be substantial
      });
    });

    it('should handle empty character description', () => {
      const theme = getThemeById('kawaii');
      const prompt = getThemeStickerPrompt(theme, '');

      expect(prompt).toBeDefined();
      expect(prompt).toContain(theme.name);
    });
  });

  describe('mergeThemeWithAIColors', () => {
    it('should return original colors when no AI colors provided', () => {
      const theme = getThemeById('webtoon');
      const merged = mergeThemeWithAIColors(theme);

      expect(merged).toEqual(theme.colors);
    });

    it('should return original colors when AI colors is undefined', () => {
      const theme = getThemeById('vintage');
      const merged = mergeThemeWithAIColors(theme, undefined);

      expect(merged).toEqual(theme.colors);
    });

    it('should merge AI background color', () => {
      const theme = getThemeById('shoujo');
      const merged = mergeThemeWithAIColors(theme, {
        background: '#FF0000',
      });

      expect(merged.background).toBe('#FF0000');
      expect(merged.title).toBe(theme.colors.title); // Unchanged
      expect(merged.body).toBe(theme.colors.body); // Unchanged
    });

    it('should merge multiple AI colors', () => {
      const theme = getThemeById('shonen');
      const aiColors = {
        background: '#AAAAAA',
        accent: '#BBBBBB',
        border: '#CCCCCC',
      };
      const merged = mergeThemeWithAIColors(theme, aiColors);

      expect(merged.background).toBe('#AAAAAA');
      expect(merged.accent).toBe('#BBBBBB');
      expect(merged.border).toBe('#CCCCCC');
      expect(merged.title).toBe(theme.colors.title); // Unchanged
      expect(merged.body).toBe(theme.colors.body); // Unchanged
    });

    it('should override all colors if AI provides all', () => {
      const theme = getThemeById('kawaii');
      const aiColors = {
        background: '#111111',
        backgroundSecondary: '#222222',
        title: '#333333',
        body: '#444444',
        accent: '#555555',
        border: '#666666',
      };
      const merged = mergeThemeWithAIColors(theme, aiColors);

      expect(merged).toEqual(aiColors);
    });

    it('should preserve original theme colors object', () => {
      const theme = getThemeById('ghibli');
      const originalColors = { ...theme.colors };

      mergeThemeWithAIColors(theme, { background: '#000000' });

      expect(theme.colors).toEqual(originalColors);
    });
  });

  describe('Specific Theme Properties', () => {
    it('should have correct ghibli theme properties', () => {
      const theme = getThemeById('ghibli');

      expect(theme.emoji).toBe('🎨');
      expect(theme.typography.titleStyle).toBe('serif');
      expect(theme.typography.vibe).toBe('classic');
      expect(theme.stickerHint.mood).toBe('warm');
    });

    it('should have correct manga theme properties', () => {
      const theme = getThemeById('manga');

      expect(theme.emoji).toBe('📖');
      expect(theme.colors.accent).toBe('#FF4444');
      expect(theme.colors.border).toBe('#000000');
      expect(theme.border.thickness).toBe('thick');
    });

    it('should have correct webtoon theme properties', () => {
      const theme = getThemeById('webtoon');

      expect(theme.emoji).toBe('📱');
      expect(theme.background.style).toBe('solid');
      expect(theme.accents.type).toBe('none');
      expect(theme.border.template).toBe('webtoon');
    });

    it('should have correct shoujo theme properties', () => {
      const theme = getThemeById('shoujo');

      expect(theme.emoji).toBe('💕');
      expect(theme.accents.type).toBe('sparkles');
      expect(theme.accents.animated).toBe(true);
      expect(theme.typography.vibe).toBe('cute');
    });

    it('should have correct shonen theme properties', () => {
      const theme = getThemeById('shonen');

      expect(theme.emoji).toBe('🔥');
      expect(theme.accents.type).toBe('impact_stars');
      expect(theme.stickerHint.defaultScale).toBe('large');
    });

    it('should have correct kawaii theme properties', () => {
      const theme = getThemeById('kawaii');

      expect(theme.emoji).toBe('🎌');
      expect(theme.border.template).toBe('sticker');
      expect(theme.accents.type).toBe('hearts');
    });

    it('should have correct vintage theme properties', () => {
      const theme = getThemeById('vintage');

      expect(theme.emoji).toBe('🌙');
      expect(theme.border.template).toBe('vintage_manga');
      expect(theme.background.patternId).toBe('noise');
    });
  });

  describe('Theme Background Styles', () => {
    it('should have correct background styles', () => {
      expect(getThemeById('ghibli').background.style).toBe('pattern');
      expect(getThemeById('manga').background.style).toBe('pattern');
      expect(getThemeById('webtoon').background.style).toBe('solid');
      expect(getThemeById('shoujo').background.style).toBe('gradient');
      expect(getThemeById('shonen').background.style).toBe('gradient');
      expect(getThemeById('kawaii').background.style).toBe('pattern');
      expect(getThemeById('vintage').background.style).toBe('pattern');
    });

    it('should have gradient themes with gradient configuration', () => {
      const shoujo = getThemeById('shoujo');
      const shonen = getThemeById('shonen');

      expect(shoujo.background.gradient).toBeDefined();
      expect(shoujo.background.gradient?.direction).toBe('diagonal');
      expect(shoujo.background.gradient?.colors).toHaveLength(2);

      expect(shonen.background.gradient).toBeDefined();
      expect(shonen.background.gradient?.direction).toBe('diagonal');
      expect(shonen.background.gradient?.colors).toHaveLength(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle THEME_LIST and DESIGN_THEMES consistency', () => {
      const listIds = THEME_LIST.map((t) => t.id);
      const recordIds = Object.keys(DESIGN_THEMES);

      expect(listIds.sort()).toEqual(recordIds.sort());
    });

    it('should have all themes in both THEME_LIST and DESIGN_THEMES', () => {
      THEME_LIST.forEach((theme) => {
        expect(DESIGN_THEMES[theme.id]).toEqual(theme);
      });
    });

    it('should have AI prompt hints for all themes', () => {
      THEME_LIST.forEach((theme) => {
        expect(theme.aiPromptHints).toBeDefined();
        expect(Array.isArray(theme.aiPromptHints)).toBe(true);
        expect(theme.aiPromptHints.length).toBeGreaterThan(0);
      });
    });

    it('should have sticker hints for all themes', () => {
      THEME_LIST.forEach((theme) => {
        expect(theme.stickerHint).toBeDefined();
        expect(theme.stickerHint.artStyle).toBeDefined();
        expect(theme.stickerHint.mood).toBeDefined();
        expect(theme.stickerHint.defaultPosition).toBeDefined();
        expect(theme.stickerHint.defaultScale).toBeDefined();
      });
    });
  });
});
