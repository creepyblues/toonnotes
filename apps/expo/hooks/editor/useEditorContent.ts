import { useMemo, useCallback } from 'react';
import {
  parseLineType,
  stripCheckboxPrefixes,
  stripBulletPrefixes,
  stripAllFormatting,
  getAutoContinuePrefix,
  shouldRemoveEmptyLine,
} from '@toonnotes/editor-core';
import type { LineType } from '@toonnotes/editor-core';

// Re-export types from editor-core
export type { LineType } from '@toonnotes/editor-core';

// Extended ParsedLine with position info for cursor management (Expo-specific)
export interface ParsedLine {
  index: number;
  type: LineType;
  text: string;           // Text content after prefix
  fullLine: string;       // Original full line
  startIndex: number;     // Character position in full content
  endIndex: number;       // Character position end in full content
  prefixLength: number;   // Length of checkbox/bullet prefix
}

export interface ContentChangeResult {
  content: string;
  selection: { start: number; end: number } | null;
}

// Re-export strip functions from editor-core
export { stripCheckboxPrefixes, stripBulletPrefixes, stripAllFormatting };

/**
 * Parse content into structured lines with position info (Expo-specific).
 * Uses editor-core's parseLineType for consistent line detection.
 */
export function parseContent(content: string): ParsedLine[] {
  const lines = content.split('\n');
  const result: ParsedLine[] = [];
  let charIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const { type, prefixLength } = parseLineType(line);

    result.push({
      index: i,
      type,
      text: line.slice(prefixLength),
      fullLine: line,
      startIndex: charIndex,
      endIndex: charIndex + line.length,
      prefixLength,
    });

    charIndex += line.length + 1; // +1 for newline
  }

  return result;
}

/**
 * Get the line at a given character position
 */
function getLineAtPosition(content: string, position: number): { line: string; lineStart: number; lineIndex: number } {
  const lines = content.split('\n');
  let charIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const lineEnd = charIndex + lines[i].length;
    if (position <= lineEnd || i === lines.length - 1) {
      return { line: lines[i], lineStart: charIndex, lineIndex: i };
    }
    charIndex = lineEnd + 1; // +1 for newline
  }

  return { line: '', lineStart: 0, lineIndex: 0 };
}

/**
 * Process content change and handle auto-continue/auto-remove for lists.
 * Uses editor-core's getAutoContinuePrefix and shouldRemoveEmptyLine.
 */
export function processContentChange(
  oldContent: string,
  newContent: string,
  cursorPosition: number
): ContentChangeResult {
  const lengthDiff = newContent.length - oldContent.length;

  // Detect single character insertion
  if (lengthDiff === 1) {
    let insertPos = 0;
    while (insertPos < oldContent.length && oldContent[insertPos] === newContent[insertPos]) {
      insertPos++;
    }
    const insertedChar = newContent[insertPos];

    if (insertedChar === '\n') {
      const lineStart = newContent.lastIndexOf('\n', insertPos - 1) + 1;
      const prevLine = newContent.substring(lineStart, insertPos);
      const cursorAfterNewline = insertPos + 1;

      // Check if the previous line should be auto-removed (empty list item)
      if (shouldRemoveEmptyLine(prevLine)) {
        const result = newContent.slice(0, lineStart) + newContent.slice(cursorAfterNewline);
        return { content: result, selection: { start: lineStart, end: lineStart } };
      }

      // Check if we should auto-continue with a list prefix
      const prefix = getAutoContinuePrefix(prevLine);
      if (prefix) {
        const result = newContent.slice(0, cursorAfterNewline) + prefix + newContent.slice(cursorAfterNewline);
        const newCursor = cursorAfterNewline + prefix.length;
        return { content: result, selection: { start: newCursor, end: newCursor } };
      }
    }
  }

  // No special handling needed
  return { content: newContent, selection: null };
}

/**
 * Toggle checkbox at a specific line index
 */
export function toggleCheckboxAtLine(content: string, lineIndex: number): string {
  const lines = content.split('\n');
  if (lineIndex < 0 || lineIndex >= lines.length) return content;

  const line = lines[lineIndex];
  const { type } = parseLineType(line);

  if (type === 'checkbox-unchecked') {
    lines[lineIndex] = line.replace(/\[\s*\]/, '[x]');
  } else if (type === 'checkbox-checked') {
    lines[lineIndex] = line.replace(/\[[xX]\]/, '[ ]');
  }

  return lines.join('\n');
}

/**
 * Insert a checkbox at cursor position (start of current line)
 */
export function insertCheckboxAtCursor(content: string, cursorPosition: number): ContentChangeResult {
  const { lineStart, line } = getLineAtPosition(content, cursorPosition);
  const { type } = parseLineType(line);

  if (type === 'checkbox-unchecked' || type === 'checkbox-checked') {
    return { content, selection: null };
  }

  let cleanLine = line;
  if (type === 'bullet') {
    cleanLine = line.replace(/^([•\-\*])\s+/, '');
  }

  const newLine = '- [ ] ' + cleanLine;
  const result = content.substring(0, lineStart) + newLine + content.substring(lineStart + line.length);
  const newCursor = lineStart + 6 + (cursorPosition - lineStart - (line.length - cleanLine.length));

  return { content: result, selection: { start: newCursor, end: newCursor } };
}

/**
 * Insert a bullet at cursor position (start of current line)
 */
export function insertBulletAtCursor(content: string, cursorPosition: number): ContentChangeResult {
  const { lineStart, line } = getLineAtPosition(content, cursorPosition);
  const { type, prefixLength } = parseLineType(line);

  if (type === 'bullet') {
    return { content, selection: null };
  }

  let cleanLine = line;
  if (type === 'checkbox-unchecked' || type === 'checkbox-checked') {
    cleanLine = line.slice(prefixLength);
  }

  const newLine = '• ' + cleanLine;
  const result = content.substring(0, lineStart) + newLine + content.substring(lineStart + line.length);
  const newCursor = lineStart + 2 + (cursorPosition - lineStart - (line.length - cleanLine.length));

  return { content: result, selection: { start: newCursor, end: newCursor } };
}

/**
 * Hook to manage editor content with list item support
 */
export function useEditorContent(content: string) {
  const parsedLines = useMemo(() => parseContent(content), [content]);

  const checkboxLines = useMemo(() =>
    parsedLines.filter(line =>
      line.type === 'checkbox-unchecked' || line.type === 'checkbox-checked'
    ),
    [parsedLines]
  );

  const bulletLines = useMemo(() =>
    parsedLines.filter(line => line.type === 'bullet'),
    [parsedLines]
  );

  const toggleCheckbox = useCallback((lineIndex: number): string => {
    return toggleCheckboxAtLine(content, lineIndex);
  }, [content]);

  const handleContentChange = useCallback((
    newContent: string,
    cursorPosition: number
  ): ContentChangeResult => {
    return processContentChange(content, newContent, cursorPosition);
  }, [content]);

  const insertCheckbox = useCallback((cursorPosition: number): ContentChangeResult => {
    return insertCheckboxAtCursor(content, cursorPosition);
  }, [content]);

  const insertBullet = useCallback((cursorPosition: number): ContentChangeResult => {
    return insertBulletAtCursor(content, cursorPosition);
  }, [content]);

  return {
    parsedLines,
    checkboxLines,
    bulletLines,
    toggleCheckbox,
    handleContentChange,
    insertCheckbox,
    insertBullet,
  };
}
