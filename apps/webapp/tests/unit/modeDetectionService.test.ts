import { describe, it, expect } from 'vitest';
import { inferBoardMode } from '@/services/modeDetectionService';

describe('modeDetectionService', () => {
  describe('inferBoardMode', () => {
    describe('manage mode detection', () => {
      it('should detect "todo" as manage', () => {
        const result = inferBoardMode('todo');
        expect(result.mode).toBe('manage');
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
      });

      it('should detect "deadline" as manage', () => {
        const result = inferBoardMode('deadline');
        expect(result.mode).toBe('manage');
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
      });

      it('should detect "shopping" as manage', () => {
        const result = inferBoardMode('shopping');
        expect(result.mode).toBe('manage');
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
      });

      it('should detect "in-progress" as manage', () => {
        const result = inferBoardMode('in-progress');
        expect(result.mode).toBe('manage');
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
      });
    });

    describe('develop mode detection', () => {
      it('should detect "ideas" as develop', () => {
        const result = inferBoardMode('ideas');
        expect(result.mode).toBe('develop');
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
      });

      it('should detect "brainstorm" as develop', () => {
        const result = inferBoardMode('brainstorm');
        expect(result.mode).toBe('develop');
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
      });

      it('should detect "draft" as develop', () => {
        const result = inferBoardMode('draft');
        expect(result.mode).toBe('develop');
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
      });
    });

    describe('organize mode detection', () => {
      it('should detect "bookmarks" as organize', () => {
        const result = inferBoardMode('bookmarks');
        expect(result.mode).toBe('organize');
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
      });

      it('should detect "reading" as organize', () => {
        const result = inferBoardMode('reading');
        expect(result.mode).toBe('organize');
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
      });

      it('should detect "watchlist" as organize', () => {
        const result = inferBoardMode('watchlist');
        expect(result.mode).toBe('organize');
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
      });
    });

    describe('experience mode detection', () => {
      it('should detect "journal" as experience', () => {
        const result = inferBoardMode('journal');
        expect(result.mode).toBe('experience');
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
      });

      it('should detect "memories" as experience', () => {
        const result = inferBoardMode('memories');
        expect(result.mode).toBe('experience');
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
      });

      it('should detect "gratitude" as experience', () => {
        const result = inferBoardMode('gratitude');
        expect(result.mode).toBe('experience');
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
      });
    });

    describe('low confidence / unknown hashtags', () => {
      it('should return low confidence for unrecognized hashtag', () => {
        const result = inferBoardMode('xyzabc');
        expect(result.confidence).toBeLessThan(0.5);
      });

      it('should default to organize mode for unknown hashtags', () => {
        const result = inferBoardMode('xyzabc');
        expect(result.mode).toBe('organize');
      });
    });

    describe('label preset matching', () => {
      it('should detect preset-matched hashtags with high confidence', () => {
        // "todo" matches a label preset in the productivity category → manage
        const result = inferBoardMode('todo');
        expect(result.confidence).toBeGreaterThanOrEqual(0.5);
      });

      it('should handle hyphenated hashtags', () => {
        // "bucket-list" should match via keyword
        const result = inferBoardMode('bucket-list');
        expect(result.mode).toBe('manage');
      });
    });

    describe('result shape', () => {
      it('should always return mode and confidence', () => {
        const result = inferBoardMode('anything');
        expect(result).toHaveProperty('mode');
        expect(result).toHaveProperty('confidence');
        expect(typeof result.mode).toBe('string');
        expect(typeof result.confidence).toBe('number');
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
      });
    });
  });
});
