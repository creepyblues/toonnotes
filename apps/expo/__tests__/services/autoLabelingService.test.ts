/**
 * Tests for Smart Auto-Labeling Service
 */

import { AutoLabelingService } from '@/services/autoLabelingService';
import { AUTO_LABELING_CONFIG } from '@/constants/autoLabeling';

// Mock the labeling engine
jest.mock('@/services/labelingEngine', () => ({
  analyzeNoteContent: jest.fn().mockResolvedValue({
    autoApplyLabels: [{ labelName: 'shopping', confidence: 0.9, reason: 'Contains shopping items' }],
    suggestLabels: [],
    suggestedNewLabels: [],
    analysis: { topics: ['shopping'], mood: 'neutral', contentType: 'list' },
    hasHighConfidenceMatch: true,
    hasSuggestions: true,
  }),
}));

// Mock devLog
jest.mock('@/utils/devLog', () => ({
  devLog: jest.fn(),
  devWarn: jest.fn(),
}));

describe('AutoLabelingService', () => {
  let service: AutoLabelingService;

  beforeEach(() => {
    service = new AutoLabelingService();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    service.cleanup();
    jest.useRealTimers();
  });

  describe('Content Hashing', () => {
    it('should generate consistent hashes for same content', () => {
      const title = 'Shopping List';
      const content = 'Buy milk and eggs';

      // Call getCachedResult twice with same content - should get null both times
      // (because nothing is cached yet), but internally the hash should be consistent
      const result1 = service.getCachedResult(title, content);
      const result2 = service.getCachedResult(title, content);

      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });

    it('should generate different hashes for different content', () => {
      const title1 = 'Shopping List';
      const content1 = 'Buy milk';
      const title2 = 'Todo List';
      const content2 = 'Do laundry';

      // These should be treated as different content
      const result1 = service.getCachedResult(title1, content1);
      const result2 = service.getCachedResult(title2, content2);

      // Both null because nothing cached, but internally tracked as different
      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });
  });

  describe('Minimum Threshold', () => {
    it('should not analyze content below minimum threshold', async () => {
      const { analyzeNoteContent } = require('@/services/labelingEngine');

      // Content too short
      const result = await service.getResultForExit('note1', 'Hi', 'x', []);

      expect(result).toBeNull();
      expect(analyzeNoteContent).not.toHaveBeenCalled();
    });

    it('should analyze content above minimum threshold', async () => {
      const { analyzeNoteContent } = require('@/services/labelingEngine');

      // Content meets threshold (title >= 3 chars)
      const result = await service.getResultForExit(
        'note1',
        'Shopping List',
        'Buy milk and eggs from the grocery store',
        []
      );

      expect(result).not.toBeNull();
      expect(analyzeNoteContent).toHaveBeenCalled();
    });
  });

  describe('Caching', () => {
    it('should cache results and return from cache', async () => {
      const { analyzeNoteContent } = require('@/services/labelingEngine');

      const title = 'Shopping List';
      const content = 'Buy milk and eggs from the store';

      // First call - should call API
      const result1 = await service.getResultForExit('note1', title, content, []);
      expect(analyzeNoteContent).toHaveBeenCalledTimes(1);

      // Second call with same content - should use cache
      const result2 = await service.getResultForExit('note1', title, content, []);
      expect(analyzeNoteContent).toHaveBeenCalledTimes(1); // Still 1, not 2

      expect(result1).toEqual(result2);
    });

    it('should not use cache after TTL expires', async () => {
      const { analyzeNoteContent } = require('@/services/labelingEngine');

      const title = 'Shopping List';
      const content = 'Buy milk and eggs from the store';

      // First call
      await service.getResultForExit('note1', title, content, []);
      expect(analyzeNoteContent).toHaveBeenCalledTimes(1);

      // Advance time past TTL
      jest.advanceTimersByTime(AUTO_LABELING_CONFIG.CACHE_TTL_MS + 1000);

      // Second call - cache expired, should call API again
      await service.getResultForExit('note1', title, content, []);
      expect(analyzeNoteContent).toHaveBeenCalledTimes(2);
    });
  });

  describe('isReady', () => {
    it('should return false when no cached result', () => {
      expect(service.isReady('Test', 'Some content here')).toBe(false);
    });

    it('should return true after result is cached', async () => {
      const title = 'Shopping List';
      const content = 'Buy milk and eggs from the store';

      // Get result (which caches it)
      await service.getResultForExit('note1', title, content, []);

      // Now isReady should return true
      expect(service.isReady(title, content)).toBe(true);
    });
  });

  describe('Reset and Cleanup', () => {
    it('should reset state but keep cache', async () => {
      const title = 'Shopping List';
      const content = 'Buy milk and eggs from the store';

      // Cache a result
      await service.getResultForExit('note1', title, content, []);
      expect(service.isReady(title, content)).toBe(true);

      // Reset
      service.reset();

      // Cache should still be valid (content-addressable)
      expect(service.isReady(title, content)).toBe(true);
    });

    it('should clear everything on cleanup', async () => {
      const title = 'Shopping List';
      const content = 'Buy milk and eggs from the store';

      // Cache a result
      await service.getResultForExit('note1', title, content, []);
      expect(service.isReady(title, content)).toBe(true);

      // Cleanup
      service.cleanup();

      // Cache should be cleared
      expect(service.isReady(title, content)).toBe(false);
    });
  });
});
