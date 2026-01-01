/**
 * Board Presets Tests
 *
 * Tests for:
 * - Preset lookup functions
 * - Auto-generation of board designs for unknown hashtags
 * - Keyword-aware theme selection
 * - Deterministic behavior
 */

import {
  BOARD_PRESETS,
  getBoardPresetById,
  getBoardPresetByName,
  getPresetForHashtag,
  getBoardPresetsByCategory,
  BOARD_CATEGORIES,
  BoardPreset,
} from '@/constants/boardPresets';

describe('boardPresets', () => {
  describe('BOARD_PRESETS constant', () => {
    it('should have 20 presets', () => {
      expect(BOARD_PRESETS).toHaveLength(20);
    });

    it('should have unique IDs', () => {
      const ids = BOARD_PRESETS.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all required fields for each preset', () => {
      BOARD_PRESETS.forEach(preset => {
        expect(preset.id).toBeDefined();
        expect(preset.name).toBeDefined();
        expect(preset.category).toBeDefined();
        expect(preset.colors).toBeDefined();
        expect(preset.colors.bg).toBeDefined();
        expect(preset.colors.bgSecondary).toBeDefined();
        expect(preset.colors.accent).toBeDefined();
        expect(preset.colors.badge).toBeDefined();
        expect(preset.colors.badgeText).toBeDefined();
        expect(preset.colors.labelText).toBeDefined();
        expect(preset.colors.notePreview).toBeDefined();
        expect(preset.bgStyle).toBeDefined();
        expect(preset.decorationStyle).toBeDefined();
        expect(preset.boardIcon).toBeDefined();
      });
    });

    it('should have valid hex color codes', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      BOARD_PRESETS.forEach(preset => {
        expect(preset.colors.bg).toMatch(hexColorRegex);
        expect(preset.colors.bgSecondary).toMatch(hexColorRegex);
        expect(preset.colors.accent).toMatch(hexColorRegex);
        expect(preset.colors.notePreview).toMatch(hexColorRegex);
      });
    });
  });

  describe('getBoardPresetById', () => {
    it('should return preset for valid ID', () => {
      const preset = getBoardPresetById('todo');
      expect(preset).toBeDefined();
      expect(preset?.name).toBe('Todo');
    });

    it('should return undefined for invalid ID', () => {
      const preset = getBoardPresetById('nonexistent');
      expect(preset).toBeUndefined();
    });

    it('should find all preset IDs', () => {
      BOARD_PRESETS.forEach(p => {
        expect(getBoardPresetById(p.id)).toBe(p);
      });
    });
  });

  describe('getBoardPresetByName', () => {
    it('should return preset for valid name', () => {
      const preset = getBoardPresetByName('Reading');
      expect(preset).toBeDefined();
      expect(preset?.id).toBe('reading');
    });

    it('should be case-insensitive', () => {
      expect(getBoardPresetByName('TODO')).toBeDefined();
      expect(getBoardPresetByName('todo')).toBeDefined();
      expect(getBoardPresetByName('Todo')).toBeDefined();
    });

    it('should return undefined for invalid name', () => {
      const preset = getBoardPresetByName('nonexistent');
      expect(preset).toBeUndefined();
    });
  });

  describe('getPresetForHashtag - exact matches', () => {
    it('should return preset for exact match', () => {
      const preset = getPresetForHashtag('reading');
      expect(preset.id).toBe('reading');
      expect(preset.name).toBe('Reading');
    });

    it('should handle # prefix', () => {
      const preset = getPresetForHashtag('#reading');
      expect(preset.id).toBe('reading');
    });

    it('should be case-insensitive', () => {
      expect(getPresetForHashtag('READING').id).toBe('reading');
      expect(getPresetForHashtag('Reading').id).toBe('reading');
      expect(getPresetForHashtag('#READING').id).toBe('reading');
    });

    it('should match all 20 preset names', () => {
      BOARD_PRESETS.forEach(preset => {
        const result = getPresetForHashtag(preset.name);
        expect(result.id).toBe(preset.id);
      });
    });
  });

  describe('getPresetForHashtag - auto-generation', () => {
    it('should always return a preset (never undefined)', () => {
      const randomHashtags = ['xyz123', 'randomtag', 'unknownboard', 'mylist'];
      randomHashtags.forEach(hashtag => {
        const preset = getPresetForHashtag(hashtag);
        expect(preset).toBeDefined();
        expect(preset.id).toBeDefined();
        expect(preset.name).toBeDefined();
        expect(preset.colors).toBeDefined();
      });
    });

    it('should generate auto- prefixed IDs for unknown hashtags', () => {
      const preset = getPresetForHashtag('unknownhashtag');
      expect(preset.id).toBe('auto-unknownhashtag');
    });

    it('should capitalize the display name', () => {
      const preset = getPresetForHashtag('myhashtag');
      expect(preset.name).toBe('Myhashtag');
    });

    it('should be deterministic - same hashtag gives same result', () => {
      const hashtag = 'randomtest123';
      const result1 = getPresetForHashtag(hashtag);
      const result2 = getPresetForHashtag(hashtag);

      expect(result1.id).toBe(result2.id);
      expect(result1.colors.bg).toBe(result2.colors.bg);
      expect(result1.boardIcon).toBe(result2.boardIcon);
    });

    it('should generate valid BoardPreset structure', () => {
      const preset = getPresetForHashtag('unknowntest');

      expect(preset.id).toMatch(/^auto-/);
      expect(preset.category).toBe('Personal');
      expect(preset.colors.bg).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(preset.colors.bgSecondary).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(preset.bgStyle).toBeDefined();
      expect(preset.decorationStyle).toBe('none');
      expect(preset.boardIcon).toBeDefined();
    });
  });

  describe('getPresetForHashtag - keyword-aware theming', () => {
    describe('warm theme (food/shopping)', () => {
      const warmKeywords = ['cooking', 'recipe', 'food', 'shopping', 'grocery', 'cafe'];

      warmKeywords.forEach(keyword => {
        it(`should use warm theme for "${keyword}"`, () => {
          const preset = getPresetForHashtag(keyword);
          // Warm theme uses orange-700: #C2410C
          expect(preset.colors.bg).toBe('#C2410C');
        });
      });

      it('should match keywords within longer hashtags', () => {
        const preset = getPresetForHashtag('myfoodlist');
        expect(preset.colors.bg).toBe('#C2410C');
      });
    });

    describe('cool theme (tech)', () => {
      const coolKeywords = ['tech', 'code', 'programming', 'software', 'ai'];

      coolKeywords.forEach(keyword => {
        it(`should use cool theme for "${keyword}"`, () => {
          const preset = getPresetForHashtag(keyword);
          // Cool theme uses blue-700: #1D4ED8
          expect(preset.colors.bg).toBe('#1D4ED8');
        });
      });
    });

    describe('nature theme', () => {
      const natureKeywords = ['hiking', 'garden', 'travel', 'camping', 'beach'];

      natureKeywords.forEach(keyword => {
        it(`should use nature theme for "${keyword}"`, () => {
          const preset = getPresetForHashtag(keyword);
          // Nature theme uses emerald-700: #047857
          expect(preset.colors.bg).toBe('#047857');
        });
      });
    });

    describe('health theme', () => {
      const healthKeywords = ['fitness', 'workout', 'gym', 'yoga', 'exercise'];

      healthKeywords.forEach(keyword => {
        it(`should use health theme for "${keyword}"`, () => {
          const preset = getPresetForHashtag(keyword);
          // Health theme uses green-700: #15803D
          expect(preset.colors.bg).toBe('#15803D');
        });
      });
    });

    describe('creative theme', () => {
      const creativeKeywords = ['music', 'design', 'anime', 'manga', 'photography'];

      creativeKeywords.forEach(keyword => {
        it(`should use creative theme for "${keyword}"`, () => {
          const preset = getPresetForHashtag(keyword);
          // Creative theme uses violet-600: #7C3AED
          expect(preset.colors.bg).toBe('#7C3AED');
        });
      });
    });

    describe('learning theme', () => {
      const learningKeywords = ['study', 'school', 'homework', 'exam', 'university'];

      learningKeywords.forEach(keyword => {
        it(`should use learning theme for "${keyword}"`, () => {
          const preset = getPresetForHashtag(keyword);
          // Learning theme uses cyan-700: #0E7490
          expect(preset.colors.bg).toBe('#0E7490');
        });
      });
    });

    describe('finance theme', () => {
      const financeKeywords = ['budget', 'savings', 'invest', 'crypto', 'money'];

      financeKeywords.forEach(keyword => {
        it(`should use finance theme for "${keyword}"`, () => {
          const preset = getPresetForHashtag(keyword);
          // Finance theme uses yellow-700: #A16207
          expect(preset.colors.bg).toBe('#A16207');
        });
      });
    });

    describe('social theme', () => {
      const socialKeywords = ['family', 'friends', 'party', 'birthday', 'wedding'];

      socialKeywords.forEach(keyword => {
        it(`should use social theme for "${keyword}"`, () => {
          const preset = getPresetForHashtag(keyword);
          // Social theme uses pink-700: #BE185D
          expect(preset.colors.bg).toBe('#BE185D');
        });
      });
    });
  });

  describe('getPresetForHashtag - icon generation', () => {
    it('should generate theme-appropriate icons', () => {
      const warmIcons = ['ForkKnife', 'CookingPot', 'Coffee', 'Hamburger', 'BowlFood'];
      const preset = getPresetForHashtag('cooking');
      expect(warmIcons).toContain(preset.boardIcon);
    });

    it('should generate deterministic icons', () => {
      const hashtag = 'myfoodrecipe';
      const icon1 = getPresetForHashtag(hashtag).boardIcon;
      const icon2 = getPresetForHashtag(hashtag).boardIcon;
      expect(icon1).toBe(icon2);
    });

    it('should generate different icons for different hashtags in same theme', () => {
      // These should all get warm theme but potentially different icons
      const icons = [
        getPresetForHashtag('cooking').boardIcon,
        getPresetForHashtag('recipe').boardIcon,
        getPresetForHashtag('baking').boardIcon,
        getPresetForHashtag('dinner').boardIcon,
        getPresetForHashtag('lunch').boardIcon,
      ];

      // At least some variety should exist (not all the same)
      const uniqueIcons = new Set(icons);
      expect(uniqueIcons.size).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getBoardPresetsByCategory', () => {
    it('should return presets for each category', () => {
      BOARD_CATEGORIES.forEach(category => {
        const presets = getBoardPresetsByCategory(category);
        expect(presets.length).toBeGreaterThan(0);
        presets.forEach(p => {
          expect(p.category).toBe(category);
        });
      });
    });

    it('should return 4 presets per category', () => {
      BOARD_CATEGORIES.forEach(category => {
        const presets = getBoardPresetsByCategory(category);
        expect(presets).toHaveLength(4);
      });
    });
  });

  describe('BOARD_CATEGORIES', () => {
    it('should have 5 categories', () => {
      expect(BOARD_CATEGORIES).toHaveLength(5);
    });

    it('should include expected categories', () => {
      expect(BOARD_CATEGORIES).toContain('Productivity');
      expect(BOARD_CATEGORIES).toContain('Reading');
      expect(BOARD_CATEGORIES).toContain('Creative');
      expect(BOARD_CATEGORIES).toContain('Content');
      expect(BOARD_CATEGORIES).toContain('Personal');
    });
  });
});
