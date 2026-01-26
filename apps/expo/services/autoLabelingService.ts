/**
 * Smart Auto-Labeling Service
 *
 * Provides background label analysis with intelligent triggers and caching.
 * Runs analysis BEFORE user exits so results are ready instantly.
 *
 * @see docs/AUTO-SAVE-LABELING.md
 */

import { AUTO_LABELING_CONFIG } from '@/constants/autoLabeling';
import { analyzeNoteContent, LabelAnalysisResponse } from './labelingEngine';
import { devLog, devWarn } from '@/utils/devLog';

// ============================================
// Types
// ============================================

interface ContentSnapshot {
  noteId: string;
  title: string;
  content: string;
  existingLabels: string[];
  hash: string;
  timestamp: number;
}

interface AnalysisCache {
  contentHash: string;
  result: LabelAnalysisResponse;
  timestamp: number;
}

type TriggerType = 'idle' | 'stability' | 'significant_change' | 'manual';

interface TriggerResult {
  shouldAnalyze: boolean;
  reason: TriggerType | 'cooldown' | 'cached' | 'insufficient_content' | 'no_change';
}

// ============================================
// Utility Functions
// ============================================

/**
 * Simple hash function for content deduplication.
 * Uses djb2 algorithm - fast and good enough for our use case.
 */
function hashContent(title: string, content: string): string {
  const str = `${title}|${content}`;
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

/**
 * Check if content meets minimum thresholds for analysis.
 */
function meetsMinimumThreshold(title: string, content: string): boolean {
  const titleLen = title.trim().length;
  const contentLen = content.trim().length;
  return (
    titleLen >= AUTO_LABELING_CONFIG.MIN_TITLE_LENGTH ||
    contentLen >= AUTO_LABELING_CONFIG.MIN_CONTENT_LENGTH
  );
}

// ============================================
// AutoLabelingService Class
// ============================================

class AutoLabelingService {
  // State
  private lastSnapshot: ContentSnapshot | null = null;
  private lastAnalysisTime = 0;
  private lastAnalyzedHash: string | null = null;

  // Cache (in-memory, per session)
  private cache = new Map<string, AnalysisCache>();

  // Timers
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private stabilityTimer: ReturnType<typeof setTimeout> | null = null;

  // Pending analysis promise (to avoid duplicate calls)
  private pendingAnalysis: Promise<LabelAnalysisResponse | null> | null = null;

  // Callback for when analysis completes
  private onAnalysisComplete: ((result: LabelAnalysisResponse) => void) | null = null;

  /**
   * Set callback for when background analysis completes.
   */
  setOnAnalysisComplete(callback: ((result: LabelAnalysisResponse) => void) | null): void {
    this.onAnalysisComplete = callback;
  }

  /**
   * Track content changes and evaluate triggers.
   * Called by the editor on content stability.
   */
  trackContentChange(
    noteId: string,
    title: string,
    content: string,
    existingLabels: string[]
  ): void {
    const hash = hashContent(title, content);
    const now = Date.now();

    const newSnapshot: ContentSnapshot = {
      noteId,
      title,
      content,
      existingLabels,
      hash,
      timestamp: now,
    };

    // Check if content actually changed
    if (this.lastSnapshot?.hash === hash) {
      devLog('[AutoLabeling] Content unchanged, skipping');
      return;
    }

    this.lastSnapshot = newSnapshot;

    // Clear existing timers
    this.clearTimers();

    // Check triggers
    const triggerResult = this.checkTriggers(newSnapshot);

    if (triggerResult.shouldAnalyze) {
      devLog(`[AutoLabeling] Triggering analysis: ${triggerResult.reason}`);
      this.queueAnalysis(newSnapshot, triggerResult.reason as TriggerType);
    } else {
      devLog(`[AutoLabeling] Skipping analysis: ${triggerResult.reason}`);

      // Set up idle timer for future trigger
      this.idleTimer = setTimeout(() => {
        if (this.lastSnapshot?.hash === hash) {
          devLog('[AutoLabeling] Idle timeout reached, triggering analysis');
          this.queueAnalysis(newSnapshot, 'idle');
        }
      }, AUTO_LABELING_CONFIG.IDLE_TIMEOUT_MS);

      // Set up stability timer
      this.stabilityTimer = setTimeout(() => {
        if (this.lastSnapshot?.hash === hash) {
          devLog('[AutoLabeling] Stability timeout reached, triggering analysis');
          this.queueAnalysis(newSnapshot, 'stability');
        }
      }, AUTO_LABELING_CONFIG.STABILITY_TIMEOUT_MS);
    }
  }

  /**
   * Check if analysis should be triggered.
   */
  private checkTriggers(snapshot: ContentSnapshot): TriggerResult {
    const now = Date.now();

    // Gate: Check minimum content threshold
    if (!meetsMinimumThreshold(snapshot.title, snapshot.content)) {
      return { shouldAnalyze: false, reason: 'insufficient_content' };
    }

    // Gate: Check if already cached
    if (this.cache.has(snapshot.hash)) {
      const cached = this.cache.get(snapshot.hash)!;
      if (now - cached.timestamp < AUTO_LABELING_CONFIG.CACHE_TTL_MS) {
        return { shouldAnalyze: false, reason: 'cached' };
      }
    }

    // Gate: Check cooldown
    if (now - this.lastAnalysisTime < AUTO_LABELING_CONFIG.COOLDOWN_MS) {
      return { shouldAnalyze: false, reason: 'cooldown' };
    }

    // Trigger: Significant change
    if (this.lastSnapshot && this.lastAnalyzedHash) {
      const prevContent = this.lastSnapshot.title + this.lastSnapshot.content;
      const newContent = snapshot.title + snapshot.content;
      const charDiff = Math.abs(newContent.length - prevContent.length);

      if (charDiff >= AUTO_LABELING_CONFIG.SIGNIFICANT_CHANGE_CHARS) {
        return { shouldAnalyze: true, reason: 'significant_change' };
      }
    }

    // Default: Don't analyze immediately, wait for idle/stability timer
    return { shouldAnalyze: false, reason: 'no_change' };
  }

  /**
   * Queue background analysis.
   */
  private async queueAnalysis(
    snapshot: ContentSnapshot,
    trigger: TriggerType
  ): Promise<void> {
    // Avoid duplicate concurrent analyses
    if (this.pendingAnalysis) {
      devLog('[AutoLabeling] Analysis already pending, skipping');
      return;
    }

    this.pendingAnalysis = this.runAnalysis(snapshot, trigger);

    try {
      const result = await this.pendingAnalysis;
      if (result) {
        this.onAnalysisComplete?.(result);
      }
    } finally {
      this.pendingAnalysis = null;
    }
  }

  /**
   * Run the actual analysis.
   */
  private async runAnalysis(
    snapshot: ContentSnapshot,
    trigger: TriggerType
  ): Promise<LabelAnalysisResponse | null> {
    const { noteId, title, content, existingLabels, hash } = snapshot;

    devLog(`[AutoLabeling] Running analysis for note ${noteId} (trigger: ${trigger})`);

    try {
      const result = await analyzeNoteContent({
        noteTitle: title,
        noteContent: content,
        existingLabels,
      });

      // Update tracking
      this.lastAnalysisTime = Date.now();
      this.lastAnalyzedHash = hash;

      // Cache result
      this.cacheResult(hash, result);

      devLog(`[AutoLabeling] Analysis complete, cached for hash ${hash}`);
      return result;
    } catch (error) {
      devWarn('[AutoLabeling] Analysis failed:', error);
      return null;
    }
  }

  /**
   * Cache an analysis result.
   */
  private cacheResult(hash: string, result: LabelAnalysisResponse): void {
    // Enforce max cache size (LRU eviction)
    if (this.cache.size >= AUTO_LABELING_CONFIG.MAX_CACHE_ENTRIES) {
      // Remove oldest entry
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(hash, {
      contentHash: hash,
      result,
      timestamp: Date.now(),
    });
  }

  /**
   * Get cached result for content hash.
   */
  getCachedResult(title: string, content: string): LabelAnalysisResponse | null {
    const hash = hashContent(title, content);
    const cached = this.cache.get(hash);

    if (!cached) {
      return null;
    }

    // Check TTL
    if (Date.now() - cached.timestamp > AUTO_LABELING_CONFIG.CACHE_TTL_MS) {
      this.cache.delete(hash);
      return null;
    }

    devLog(`[AutoLabeling] Cache hit for hash ${hash}`);
    return cached.result;
  }

  /**
   * Get result for exit - uses cache if available, otherwise runs analysis.
   * This is the main method called when user exits the editor.
   */
  async getResultForExit(
    noteId: string,
    title: string,
    content: string,
    existingLabels: string[]
  ): Promise<LabelAnalysisResponse | null> {
    // Check minimum threshold
    if (!meetsMinimumThreshold(title, content)) {
      devLog('[AutoLabeling] Content below threshold, skipping exit analysis');
      return null;
    }

    // Try cache first (instant!)
    const cached = this.getCachedResult(title, content);
    if (cached) {
      devLog('[AutoLabeling] Using cached result for exit');
      return cached;
    }

    // Wait for pending analysis if any
    if (this.pendingAnalysis) {
      devLog('[AutoLabeling] Waiting for pending analysis');
      const result = await this.pendingAnalysis;
      if (result) {
        return result;
      }
    }

    // No cache and no pending - run synchronous analysis (fallback)
    devLog('[AutoLabeling] No cache, running exit analysis');
    const hash = hashContent(title, content);
    return this.runAnalysis(
      { noteId, title, content, existingLabels, hash, timestamp: Date.now() },
      'manual'
    );
  }

  /**
   * Check if we have a cached result ready.
   */
  isReady(title: string, content: string): boolean {
    return this.getCachedResult(title, content) !== null;
  }

  /**
   * Check if analysis is currently in progress.
   */
  isAnalyzing(): boolean {
    return this.pendingAnalysis !== null;
  }

  /**
   * Clear all timers.
   */
  private clearTimers(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    if (this.stabilityTimer) {
      clearTimeout(this.stabilityTimer);
      this.stabilityTimer = null;
    }
  }

  /**
   * Reset state for a new note.
   */
  reset(): void {
    this.clearTimers();
    this.lastSnapshot = null;
    this.pendingAnalysis = null;
    // Keep cache - it's content-addressable so still valid
  }

  /**
   * Full cleanup - clears everything including cache.
   */
  cleanup(): void {
    this.clearTimers();
    this.lastSnapshot = null;
    this.lastAnalysisTime = 0;
    this.lastAnalyzedHash = null;
    this.pendingAnalysis = null;
    this.cache.clear();
    this.onAnalysisComplete = null;
  }

  /**
   * Invalidate cache (e.g., when new labels are created).
   */
  invalidateCache(): void {
    devLog('[AutoLabeling] Invalidating cache');
    this.cache.clear();
    this.lastAnalyzedHash = null;
  }
}

// ============================================
// Singleton Export
// ============================================

export const autoLabelingService = new AutoLabelingService();

// Also export the class for testing
export { AutoLabelingService };
