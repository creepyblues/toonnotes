import { describe, it, expect } from 'vitest';
import {
  MODE_TAB_CONFIGS,
  getModeConfig,
  getModeTabIds,
  isValidMode,
  type ModeTabId,
} from '@/constants/modeConfig';

describe('modeConfig', () => {
  describe('MODE_TAB_CONFIGS', () => {
    it('should have exactly 5 tabs', () => {
      expect(MODE_TAB_CONFIGS).toHaveLength(5);
    });

    it('should include all 4 modes + uncategorized', () => {
      const ids = MODE_TAB_CONFIGS.map((c) => c.id);
      expect(ids).toContain('manage');
      expect(ids).toContain('organize');
      expect(ids).toContain('develop');
      expect(ids).toContain('experience');
      expect(ids).toContain('uncategorized');
    });

    it('should have unique IDs', () => {
      const ids = MODE_TAB_CONFIGS.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have all required fields', () => {
      MODE_TAB_CONFIGS.forEach((config) => {
        expect(config.id).toBeDefined();
        expect(config.label).toBeDefined();
        expect(config.shortLabel).toBeDefined();
        expect(config.icon).toBeDefined();
        expect(config.color).toBeDefined();
        expect(config.description).toBeDefined();
        expect(config.icon).toBeDefined();
        expect(config.color).toMatch(/^#/);
      });
    });
  });

  describe('getModeConfig', () => {
    it('should return config for valid mode', () => {
      const config = getModeConfig('manage');
      expect(config.id).toBe('manage');
      expect(config.label).toBe('Manage');
    });

    it('should return uncategorized for unknown mode', () => {
      const config = getModeConfig('nonexistent' as ModeTabId);
      expect(config.id).toBe('uncategorized');
    });

    it('should return uncategorized config for uncategorized', () => {
      const config = getModeConfig('uncategorized');
      expect(config.id).toBe('uncategorized');
      expect(config.label).toBe('Uncategorized');
    });
  });

  describe('getModeTabIds', () => {
    it('should return all tab IDs', () => {
      const ids = getModeTabIds();
      expect(ids).toHaveLength(5);
      expect(ids).toContain('manage');
      expect(ids).toContain('uncategorized');
    });
  });

  describe('isValidMode', () => {
    it('should return true for valid modes', () => {
      expect(isValidMode('manage')).toBe(true);
      expect(isValidMode('develop')).toBe(true);
      expect(isValidMode('organize')).toBe(true);
      expect(isValidMode('experience')).toBe(true);
    });

    it('should return false for uncategorized', () => {
      expect(isValidMode('uncategorized')).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isValidMode(undefined)).toBe(false);
    });

    it('should return false for arbitrary strings', () => {
      expect(isValidMode('hello')).toBe(false);
      expect(isValidMode('')).toBe(false);
    });
  });
});
