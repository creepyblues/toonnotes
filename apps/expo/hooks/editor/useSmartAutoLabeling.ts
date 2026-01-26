/**
 * Smart Auto-Labeling Hook
 *
 * React hook for integrating smart auto-labeling into the note editor.
 * Manages background analysis triggers and provides cached results.
 *
 * @see docs/AUTO-SAVE-LABELING.md
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { autoLabelingService } from '@/services/autoLabelingService';
import { LabelAnalysisResponse } from '@/services/labelingEngine';
import { AUTO_LABELING_CONFIG } from '@/constants/autoLabeling';
import { devLog } from '@/utils/devLog';

interface UseSmartAutoLabelingOptions {
  /** Note ID */
  noteId: string | undefined;
  /** Current note title */
  title: string;
  /** Current note content */
  content: string;
  /** Existing labels on the note */
  existingLabels: string[];
  /** Whether smart labeling is enabled (default: true) */
  enabled?: boolean;
}

interface UseSmartAutoLabelingResult {
  /** The latest analysis result (from cache or background analysis) */
  analysisResult: LabelAnalysisResponse | null;
  /** Whether analysis is currently in progress */
  isAnalyzing: boolean;
  /** Whether we have a cached result ready for the current content */
  isReady: boolean;
  /** Manually trigger analysis */
  triggerAnalysis: () => Promise<void>;
  /** Get result for exit (uses cache if available, otherwise runs analysis) */
  getResultForExit: () => Promise<LabelAnalysisResponse | null>;
  /** Reset the service state (call when switching notes) */
  reset: () => void;
}

/**
 * Hook for smart auto-labeling with background analysis.
 *
 * Features:
 * - Tracks content changes and triggers background analysis
 * - Caches results by content hash
 * - Provides instant results on exit via cache
 * - Respects cooldown and minimum content thresholds
 */
export function useSmartAutoLabeling(
  options: UseSmartAutoLabelingOptions
): UseSmartAutoLabelingResult {
  const { noteId, title, content, existingLabels, enabled = true } = options;

  // State
  const [analysisResult, setAnalysisResult] = useState<LabelAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Track if we're mounted
  const isMountedRef = useRef(true);

  // Track last content for change detection
  const lastContentRef = useRef({ title, content });

  // Idle timer for triggering analysis after pause
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check if we have a cached result ready
  const isReady = enabled && autoLabelingService.isReady(title, content);

  // Set up callback for when background analysis completes
  useEffect(() => {
    if (!enabled) return;

    autoLabelingService.setOnAnalysisComplete((result) => {
      if (isMountedRef.current) {
        devLog('[useSmartAutoLabeling] Background analysis complete');
        setAnalysisResult(result);
        setIsAnalyzing(false);
      }
    });

    return () => {
      autoLabelingService.setOnAnalysisComplete(null);
    };
  }, [enabled]);

  // Track content changes and trigger background analysis
  useEffect(() => {
    if (!enabled || !noteId) return;

    const contentChanged =
      lastContentRef.current.title !== title ||
      lastContentRef.current.content !== content;

    if (!contentChanged) return;

    lastContentRef.current = { title, content };

    // Clear existing idle timer
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    // Check if we already have a cached result
    const cached = autoLabelingService.getCachedResult(title, content);
    if (cached) {
      devLog('[useSmartAutoLabeling] Using cached result');
      setAnalysisResult(cached);
      return;
    }

    // Set up idle timer to trigger analysis after pause
    idleTimerRef.current = setTimeout(() => {
      if (isMountedRef.current && noteId) {
        devLog('[useSmartAutoLabeling] Idle timeout, triggering analysis');
        setIsAnalyzing(true);
        autoLabelingService.trackContentChange(noteId, title, content, existingLabels);
      }
    }, AUTO_LABELING_CONFIG.IDLE_TIMEOUT_MS);

    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [enabled, noteId, title, content, existingLabels]);

  // Reset when note changes
  useEffect(() => {
    if (noteId) {
      autoLabelingService.reset();
      setAnalysisResult(null);
      setIsAnalyzing(false);
    }
  }, [noteId]);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Cleanup timers
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, []);

  // Manually trigger analysis
  const triggerAnalysis = useCallback(async () => {
    if (!enabled || !noteId) return;

    devLog('[useSmartAutoLabeling] Manual trigger');
    setIsAnalyzing(true);
    autoLabelingService.trackContentChange(noteId, title, content, existingLabels);
  }, [enabled, noteId, title, content, existingLabels]);

  // Get result for exit (main method for beforeRemove)
  const getResultForExit = useCallback(async (): Promise<LabelAnalysisResponse | null> => {
    if (!enabled || !noteId) return null;

    devLog('[useSmartAutoLabeling] Getting result for exit');
    setIsAnalyzing(true);

    try {
      const result = await autoLabelingService.getResultForExit(
        noteId,
        title,
        content,
        existingLabels
      );

      if (isMountedRef.current) {
        setAnalysisResult(result);
        setIsAnalyzing(false);
      }

      return result;
    } catch (error) {
      if (isMountedRef.current) {
        setIsAnalyzing(false);
      }
      return null;
    }
  }, [enabled, noteId, title, content, existingLabels]);

  // Reset function
  const reset = useCallback(() => {
    autoLabelingService.reset();
    setAnalysisResult(null);
    setIsAnalyzing(false);
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  return {
    analysisResult,
    isAnalyzing,
    isReady,
    triggerAnalysis,
    getResultForExit,
    reset,
  };
}
