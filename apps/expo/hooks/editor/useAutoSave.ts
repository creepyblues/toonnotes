import { useEffect, useRef, useCallback } from 'react';
import { useNoteStore } from '@/stores';
import type { NoteColor } from '@/types';
import { AUTO_SAVE_CONFIG } from '@/constants/autoLabeling';

export interface AutoSaveData {
  title: string;
  content: string;
  color?: NoteColor;
  designId?: string;
  activeDesignLabelId?: string;
  labels?: string[];
}

export interface ContentSnapshot {
  title: string;
  content: string;
  timestamp: number;
}

interface UseAutoSaveOptions {
  /** Debounce delay in ms (default: 500) */
  debounceMs?: number;
  /** Throttle ceiling in ms - max time between saves (default: 5000) */
  throttleMs?: number;
  /** Called after each save */
  onSave?: () => void;
  /** Called when content becomes stable (for labeling integration) */
  onContentStable?: (snapshot: ContentSnapshot) => void;
}

/**
 * Hook for auto-save with hybrid debounce + throttle strategy.
 *
 * - Debounce: Waits for pause in typing before saving (default 500ms)
 * - Throttle: Guarantees saves at least every N seconds (default 5s)
 *
 * Also provides onContentStable callback for smart labeling integration.
 *
 * @see docs/AUTO-SAVE-LABELING.md
 */
export function useAutoSave(
  noteId: string | undefined,
  data: AutoSaveData,
  options: UseAutoSaveOptions = {}
) {
  const {
    debounceMs = AUTO_SAVE_CONFIG.DEBOUNCE_MS,
    throttleMs = AUTO_SAVE_CONFIG.THROTTLE_MAX_MS,
    onSave,
    onContentStable,
  } = options;
  const updateNote = useNoteStore((state) => state.updateNote);

  // Track previous values to detect actual changes
  const prevDataRef = useRef<AutoSaveData>(data);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const throttleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  // Track last save time for throttle
  const lastSaveTimeRef = useRef<number>(Date.now());

  // Track content for stability detection
  const lastContentRef = useRef<{ title: string; content: string }>({
    title: data.title,
    content: data.content,
  });
  const stabilityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check if data has actually changed
  const hasChanges = useCallback((prev: AutoSaveData, current: AutoSaveData): boolean => {
    return (
      prev.title !== current.title ||
      prev.content !== current.content ||
      prev.color !== current.color ||
      prev.designId !== current.designId ||
      prev.activeDesignLabelId !== current.activeDesignLabelId ||
      JSON.stringify(prev.labels) !== JSON.stringify(current.labels)
    );
  }, []);

  // Check if content (title/content only) has changed
  const hasContentChanges = useCallback(
    (prev: { title: string; content: string }, current: { title: string; content: string }): boolean => {
      return prev.title !== current.title || prev.content !== current.content;
    },
    []
  );

  // Save function
  const save = useCallback(() => {
    if (!noteId || !isMountedRef.current) return;

    updateNote(noteId, {
      title: data.title,
      content: data.content,
      ...(data.color && { color: data.color }),
      ...(data.designId !== undefined && { designId: data.designId }),
      ...(data.activeDesignLabelId !== undefined && { activeDesignLabelId: data.activeDesignLabelId }),
      ...(data.labels && { labels: data.labels }),
    });

    lastSaveTimeRef.current = Date.now();
    prevDataRef.current = { ...data };
    onSave?.();
  }, [noteId, data, updateNote, onSave]);

  // Immediate save (for use before navigation)
  const saveImmediately = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current);
      throttleTimeoutRef.current = null;
    }
    save();
  }, [save]);

  // Auto-save effect with hybrid debounce + throttle
  useEffect(() => {
    if (!noteId) return;

    // Skip if no actual changes
    if (!hasChanges(prevDataRef.current, data)) {
      return;
    }

    // Clear existing debounce timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Calculate time since last save
    const timeSinceLastSave = Date.now() - lastSaveTimeRef.current;

    // If we've exceeded throttle ceiling, save immediately
    if (timeSinceLastSave >= throttleMs) {
      save();
      return;
    }

    // Schedule debounced save
    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        save();
      }
    }, debounceMs);

    // Set up throttle ceiling if not already set
    if (!throttleTimeoutRef.current) {
      const remainingThrottleTime = throttleMs - timeSinceLastSave;
      throttleTimeoutRef.current = setTimeout(() => {
        throttleTimeoutRef.current = null;
        if (isMountedRef.current && hasChanges(prevDataRef.current, data)) {
          // Clear debounce timeout since we're saving via throttle
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          save();
        }
      }, remainingThrottleTime);
    }

    // Cleanup on unmount or data change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [noteId, data, debounceMs, throttleMs, hasChanges, save]);

  // Content stability detection for labeling integration
  useEffect(() => {
    if (!onContentStable) return;

    const currentContent = { title: data.title, content: data.content };

    // If content changed, reset stability timer
    if (hasContentChanges(lastContentRef.current, currentContent)) {
      lastContentRef.current = currentContent;

      // Clear existing stability timeout
      if (stabilityTimeoutRef.current) {
        clearTimeout(stabilityTimeoutRef.current);
      }

      // Schedule stability callback (fires when content hasn't changed for debounceMs)
      stabilityTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          onContentStable({
            title: currentContent.title,
            content: currentContent.content,
            timestamp: Date.now(),
          });
        }
      }, debounceMs);
    }

    return () => {
      if (stabilityTimeoutRef.current) {
        clearTimeout(stabilityTimeoutRef.current);
      }
    };
  }, [data.title, data.content, debounceMs, hasContentChanges, onContentStable]);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Save on unmount if there are pending changes
  useEffect(() => {
    return () => {
      // Clear all timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
      if (stabilityTimeoutRef.current) {
        clearTimeout(stabilityTimeoutRef.current);
      }

      if (hasChanges(prevDataRef.current, data)) {
        // Note: This runs synchronously, updateNote should be sync-safe
        updateNote(noteId!, {
          title: data.title,
          content: data.content,
          ...(data.color && { color: data.color }),
          ...(data.designId !== undefined && { designId: data.designId }),
          ...(data.activeDesignLabelId !== undefined && { activeDesignLabelId: data.activeDesignLabelId }),
          ...(data.labels && { labels: data.labels }),
        });
      }
    };
  }, [noteId, data, hasChanges, updateNote]);

  return {
    save,
    saveImmediately,
  };
}
