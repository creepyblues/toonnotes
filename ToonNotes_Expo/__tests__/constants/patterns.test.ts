/**
 * Unit Tests for Pattern Constants and Helper Functions
 *
 * Tests pattern retrieval, categorization, and asset mapping.
 */

import {
  PATTERNS,
  getPatternById,
  getPatternsByCategory,
  PATTERN_CATEGORIES,
  PatternCategory,
} from '@/constants/patterns';

describe('Pattern Constants', () => {
  describe('Pattern Data Structure', () => {
    it('should have all required pattern properties', () => {
      PATTERNS.forEach((pattern) => {
        expect(pattern).toHaveProperty('id');
        expect(pattern).toHaveProperty('name');
        expect(pattern).toHaveProperty('assetName');
        expect(pattern).toHaveProperty('category');
        expect(pattern).toHaveProperty('defaultOpacity');

        expect(typeof pattern.id).toBe('string');
        expect(typeof pattern.name).toBe('string');
        expect(typeof pattern.assetName).toBe('string');
        expect(typeof pattern.category).toBe('string');
        expect(typeof pattern.defaultOpacity).toBe('number');
      });
    });

    it('should have unique pattern IDs', () => {
      const ids = PATTERNS.map((p) => p.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique pattern names', () => {
      const names = PATTERNS.map((p) => p.name);
      const uniqueNames = new Set(names);

      expect(uniqueNames.size).toBe(names.length);
    });

    it('should have default opacity between 0 and 1', () => {
      PATTERNS.forEach((pattern) => {
        expect(pattern.defaultOpacity).toBeGreaterThanOrEqual(0);
        expect(pattern.defaultOpacity).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Pattern Categories', () => {
    it('should have all pattern categories defined', () => {
      expect(PATTERN_CATEGORIES).toEqual(['dots', 'lines', 'paper', 'manga', 'artistic']);
    });

    it('should only use valid categories', () => {
      const validCategories = new Set<PatternCategory>([
        'dots',
        'lines',
        'paper',
        'manga',
        'artistic',
      ]);

      PATTERNS.forEach((pattern) => {
        expect(validCategories.has(pattern.category)).toBe(true);
      });
    });

    it('should have at least one pattern per category', () => {
      PATTERN_CATEGORIES.forEach((category) => {
        const patternsInCategory = PATTERNS.filter((p) => p.category === category);
        expect(patternsInCategory.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getPatternById', () => {
    it('should retrieve pattern by id', () => {
      const pattern = getPatternById('dots-small');

      expect(pattern).toBeDefined();
      expect(pattern?.id).toBe('dots-small');
      expect(pattern?.name).toBe('Small Dots');
      expect(pattern?.category).toBe('dots');
    });

    it('should return undefined for non-existent pattern', () => {
      const pattern = getPatternById('non-existent-pattern');

      expect(pattern).toBeUndefined();
    });

    it('should retrieve all defined patterns', () => {
      const expectedPatterns = [
        'dots-small',
        'dots-large',
        'lines-horizontal',
        'lines-diagonal',
        'grid',
        'paper-subtle',
        'paper-rough',
        'screentone-light',
        'halftone',
        'watercolor-wash',
        'noise',
      ];

      expectedPatterns.forEach((id) => {
        const pattern = getPatternById(id);
        expect(pattern).toBeDefined();
        expect(pattern?.id).toBe(id);
      });
    });

    it('should be case-sensitive', () => {
      const pattern = getPatternById('DOTS-SMALL');

      expect(pattern).toBeUndefined();
    });
  });

  describe('getPatternsByCategory', () => {
    it('should retrieve all dots patterns', () => {
      const patterns = getPatternsByCategory('dots');

      expect(patterns).toHaveLength(2);
      expect(patterns.every((p) => p.category === 'dots')).toBe(true);
      expect(patterns.map((p) => p.id)).toEqual(['dots-small', 'dots-large']);
    });

    it('should retrieve all lines patterns', () => {
      const patterns = getPatternsByCategory('lines');

      expect(patterns).toHaveLength(3);
      expect(patterns.every((p) => p.category === 'lines')).toBe(true);
      expect(patterns.map((p) => p.id)).toEqual([
        'lines-horizontal',
        'lines-diagonal',
        'grid',
      ]);
    });

    it('should retrieve all paper patterns', () => {
      const patterns = getPatternsByCategory('paper');

      expect(patterns).toHaveLength(2);
      expect(patterns.every((p) => p.category === 'paper')).toBe(true);
    });

    it('should retrieve all manga patterns', () => {
      const patterns = getPatternsByCategory('manga');

      expect(patterns).toHaveLength(2);
      expect(patterns.every((p) => p.category === 'manga')).toBe(true);
    });

    it('should retrieve all artistic patterns', () => {
      const patterns = getPatternsByCategory('artistic');

      expect(patterns).toHaveLength(2);
      expect(patterns.every((p) => p.category === 'artistic')).toBe(true);
    });

    it('should return empty array for non-existent category', () => {
      // @ts-expect-error Testing invalid category
      const patterns = getPatternsByCategory('non-existent');

      expect(patterns).toEqual([]);
    });
  });

  describe('Specific Pattern Properties', () => {
    it('should have correct properties for dots-small', () => {
      const pattern = getPatternById('dots-small');

      expect(pattern).toEqual({
        id: 'dots-small',
        name: 'Small Dots',
        assetName: 'dots-small',
        category: 'dots',
        defaultOpacity: 0.15,
      });
    });

    it('should have correct properties for watercolor-wash', () => {
      const pattern = getPatternById('watercolor-wash');

      expect(pattern).toEqual({
        id: 'watercolor-wash',
        name: 'Watercolor Wash',
        assetName: 'watercolor',
        category: 'artistic',
        defaultOpacity: 0.2,
      });
    });

    it('should have correct properties for halftone', () => {
      const pattern = getPatternById('halftone');

      expect(pattern).toEqual({
        id: 'halftone',
        name: 'Halftone',
        assetName: 'halftone',
        category: 'manga',
        defaultOpacity: 0.12,
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string pattern id', () => {
      const pattern = getPatternById('');

      expect(pattern).toBeUndefined();
    });

    it('should handle whitespace in pattern id', () => {
      const pattern = getPatternById('  dots-small  ');

      expect(pattern).toBeUndefined();
    });

    it('should retrieve patterns in consistent order', () => {
      const patterns1 = getPatternsByCategory('dots');
      const patterns2 = getPatternsByCategory('dots');

      expect(patterns1).toEqual(patterns2);
    });

    it('should not modify original pattern array', () => {
      const originalLength = PATTERNS.length;
      const patterns = getPatternsByCategory('dots');

      patterns.push({
        id: 'test',
        name: 'Test',
        assetName: 'test',
        category: 'dots',
        defaultOpacity: 0.5,
      });

      expect(PATTERNS.length).toBe(originalLength);
    });
  });

  describe('Pattern Count', () => {
    it('should have exactly 11 patterns defined', () => {
      expect(PATTERNS).toHaveLength(11);
    });

    it('should distribute patterns across categories', () => {
      const categoryCounts = {
        dots: 2,
        lines: 3,
        paper: 2,
        manga: 2,
        artistic: 2,
      };

      Object.entries(categoryCounts).forEach(([category, expectedCount]) => {
        const patterns = getPatternsByCategory(category as PatternCategory);
        expect(patterns).toHaveLength(expectedCount);
      });
    });
  });
});
