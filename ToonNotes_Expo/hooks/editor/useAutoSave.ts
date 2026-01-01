import { useEffect, useRef, useCallback } from 'react';
import { useNoteStore } from '@/stores';
import type { NoteColor } from '@/types';

interface AutoSaveData {
  title: string;
  content: string;
  color?: NoteColor;
  designId?: string;
  activeDesignLabelId?: string;
  labels?: string[];
}

interface UseAutoSaveOptions {
  debounceMs?: number;
  onSave?: () => void;
}

/**
 * Hook for debounced auto-save of note content
 */
export function useAutoSave(
  noteId: string | undefined,
  data: AutoSaveData,
  options: UseAutoSaveOptions = {}
) {
  const { debounceMs = 500, onSave } = options;
  const updateNote = useNoteStore((state) => state.updateNote);

  // Track previous values to detect actual changes
  const prevDataRef = useRef<AutoSaveData>(data);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

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

    onSave?.();
  }, [noteId, data, updateNote, onSave]);

  // Immediate save (for use before navigation)
  const saveImmediately = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    save();
  }, [save]);

  // Auto-save effect with debouncing
  useEffect(() => {
    if (!noteId) return;

    // Skip if no actual changes
    if (!hasChanges(prevDataRef.current, data)) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Schedule save
    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        save();
        prevDataRef.current = { ...data };
      }
    }, debounceMs);

    // Cleanup on unmount or data change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [noteId, data, debounceMs, hasChanges, save]);

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
      if (timeoutRef.current && hasChanges(prevDataRef.current, data)) {
        // Clear timeout and save immediately
        clearTimeout(timeoutRef.current);
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
