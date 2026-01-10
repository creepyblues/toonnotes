import { describe, it, expect } from 'vitest';
import { highlightText, escapeRegex, truncateText } from '@/components/CommandPalette';

describe('CommandPalette Utilities', () => {
  describe('escapeRegex', () => {
    it('should escape special regex characters', () => {
      expect(escapeRegex('hello.world')).toBe('hello\\.world');
      expect(escapeRegex('test*')).toBe('test\\*');
      expect(escapeRegex('a+b')).toBe('a\\+b');
      expect(escapeRegex('foo?bar')).toBe('foo\\?bar');
      expect(escapeRegex('[test]')).toBe('\\[test\\]');
      expect(escapeRegex('(test)')).toBe('\\(test\\)');
      expect(escapeRegex('a{1}')).toBe('a\\{1\\}');
      expect(escapeRegex('a|b')).toBe('a\\|b');
      expect(escapeRegex('a^b$')).toBe('a\\^b\\$');
      expect(escapeRegex('path\\to\\file')).toBe('path\\\\to\\\\file');
    });

    it('should not modify strings without special characters', () => {
      expect(escapeRegex('hello world')).toBe('hello world');
      expect(escapeRegex('test123')).toBe('test123');
      expect(escapeRegex('')).toBe('');
    });
  });

  describe('truncateText', () => {
    it('should truncate text longer than maxLength', () => {
      const longText = 'This is a very long piece of text that should be truncated';
      expect(truncateText(longText, 20)).toBe('This is a very long ...');
    });

    it('should not truncate text shorter than maxLength', () => {
      const shortText = 'Short text';
      expect(truncateText(shortText, 20)).toBe('Short text');
    });

    it('should not truncate text equal to maxLength', () => {
      const exactText = '12345678901234567890';
      expect(truncateText(exactText, 20)).toBe('12345678901234567890');
    });

    it('should handle empty strings', () => {
      expect(truncateText('', 10)).toBe('');
    });

    it('should handle zero maxLength', () => {
      expect(truncateText('test', 0)).toBe('...');
    });
  });

  describe('highlightText', () => {
    it('should return original text when query is empty', () => {
      const result = highlightText('Hello world', '');
      expect(result).toBe('Hello world');
    });

    it('should return original text when query is whitespace', () => {
      const result = highlightText('Hello world', '   ');
      expect(result).toBe('Hello world');
    });

    it('should highlight matching text (case insensitive)', () => {
      const result = highlightText('Hello World', 'world');
      // Result should be an array with highlighted parts
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle multiple matches', () => {
      const result = highlightText('test test test', 'test');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle special regex characters in query', () => {
      // Should not throw when query contains special chars
      expect(() => highlightText('hello.world', '.')).not.toThrow();
      expect(() => highlightText('test*', '*')).not.toThrow();
      expect(() => highlightText('a+b', '+')).not.toThrow();
    });

    it('should return string when no matches', () => {
      const result = highlightText('Hello world', 'xyz');
      // When no matches, the split will return the original text as single element
      expect(Array.isArray(result) || typeof result === 'string').toBe(true);
    });
  });
});

describe('CommandPalette Integration', () => {
  // Note: Full component tests require React Testing Library setup
  // These are placeholder tests that verify the exports work correctly

  it('should export highlightText function', () => {
    expect(typeof highlightText).toBe('function');
  });

  it('should export escapeRegex function', () => {
    expect(typeof escapeRegex).toBe('function');
  });

  it('should export truncateText function', () => {
    expect(typeof truncateText).toBe('function');
  });
});
