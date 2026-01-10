import { useState, useCallback, useMemo } from 'react';

// Regex to detect hashtag being typed: # followed by word characters
const HASHTAG_TYPING_REGEX = /#(\w*)$/;

// Regex to find all complete hashtags in content
const HASHTAG_COMPLETE_REGEX = /#(\w+)/g;

export interface HashtagDetectionResult {
  isTyping: boolean;
  query: string;          // Text after # (may be empty)
  hashtagStart: number;   // Position of # in content
  hashtagEnd: number;     // Position after the hashtag text
}

/**
 * Hook to detect hashtag typing in editor content
 */
export function useHashtagDetection(content: string, cursorPosition: number) {
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [hashtagQuery, setHashtagQuery] = useState('');

  // Detect if user is currently typing a hashtag
  const detection = useMemo((): HashtagDetectionResult | null => {
    if (cursorPosition < 0 || cursorPosition > content.length) {
      return null;
    }

    // Get text before cursor
    const textBeforeCursor = content.slice(0, cursorPosition);

    // Check if we're typing a hashtag
    const match = textBeforeCursor.match(HASHTAG_TYPING_REGEX);

    if (match) {
      const query = match[1] || '';
      const hashtagStart = textBeforeCursor.length - match[0].length;

      return {
        isTyping: true,
        query,
        hashtagStart,
        hashtagEnd: cursorPosition,
      };
    }

    return null;
  }, [content, cursorPosition]);

  // Update autocomplete state based on detection
  const updateDetection = useCallback((newContent: string, newCursor: number) => {
    const textBeforeCursor = newContent.slice(0, newCursor);
    const match = textBeforeCursor.match(HASHTAG_TYPING_REGEX);

    if (match) {
      setHashtagQuery(match[1] || '');
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
      setHashtagQuery('');
    }
  }, []);

  // Handle hashtag selection - replace the typed hashtag with selected one
  const replaceHashtag = useCallback((
    selectedTag: string,
    detection: HashtagDetectionResult
  ): { content: string; cursor: number } => {
    const before = content.slice(0, detection.hashtagStart);
    const after = content.slice(detection.hashtagEnd);

    // Insert the selected hashtag with a space after
    const newContent = before + '#' + selectedTag + ' ' + after;
    const newCursor = detection.hashtagStart + selectedTag.length + 2; // +2 for # and space

    return { content: newContent, cursor: newCursor };
  }, [content]);

  // Insert a new hashtag at cursor position
  const insertHashtag = useCallback((
    tagName: string,
    insertPosition: number
  ): { content: string; cursor: number } => {
    const before = content.slice(0, insertPosition);
    const after = content.slice(insertPosition);

    // Add space before if needed
    const needsSpaceBefore = before.length > 0 && !before.endsWith(' ') && !before.endsWith('\n');
    const prefix = needsSpaceBefore ? ' ' : '';

    const newContent = before + prefix + '#' + tagName + ' ' + after;
    const newCursor = insertPosition + prefix.length + tagName.length + 2;

    return { content: newContent, cursor: newCursor };
  }, [content]);

  // Close autocomplete
  const closeAutocomplete = useCallback(() => {
    setShowAutocomplete(false);
    setHashtagQuery('');
  }, []);

  // Extract all hashtags from content
  const allHashtags = useMemo(() => {
    const matches = content.matchAll(HASHTAG_COMPLETE_REGEX);
    const tags: string[] = [];
    for (const match of matches) {
      if (match[1]) {
        tags.push(match[1]);
      }
    }
    return [...new Set(tags)]; // Dedupe
  }, [content]);

  return {
    detection,
    showAutocomplete,
    hashtagQuery,
    updateDetection,
    replaceHashtag,
    insertHashtag,
    closeAutocomplete,
    allHashtags,
  };
}
