import { useMemo, useCallback } from 'react';

// Line type detection
export type LineType = 'checkbox-unchecked' | 'checkbox-checked' | 'bullet' | 'text';

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

// Regex patterns
const CHECKBOX_UNCHECKED = /^-?\s*\[\s*\]\s*/;
const CHECKBOX_CHECKED = /^-?\s*\[[xX]\]\s*/;
const BULLET = /^([•\-\*])\s+/;

/**
 * Parse a single line to determine its type
 */
function parseLineType(line: string): { type: LineType; prefixLength: number } {
  const uncheckedMatch = line.match(CHECKBOX_UNCHECKED);
  if (uncheckedMatch) {
    return { type: 'checkbox-unchecked', prefixLength: uncheckedMatch[0].length };
  }

  const checkedMatch = line.match(CHECKBOX_CHECKED);
  if (checkedMatch) {
    return { type: 'checkbox-checked', prefixLength: checkedMatch[0].length };
  }

  const bulletMatch = line.match(BULLET);
  if (bulletMatch) {
    return { type: 'bullet', prefixLength: bulletMatch[0].length };
  }

  return { type: 'text', prefixLength: 0 };
}

/**
 * Parse content into structured lines
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
 * Strip all checkbox prefixes from content
 * "- [ ] text" → "text"
 * "- [x] text" → "text"
 */
export function stripCheckboxPrefixes(content: string): string {
  return content
    .split('\n')
    .map(line => line.replace(/^-?\s*\[[ xX]\]\s*/, ''))
    .join('\n');
}

/**
 * Strip all bullet prefixes from content
 * "• text" → "text"
 * "- text" → "text" (when used as bullet, not checkbox)
 * "* text" → "text"
 */
export function stripBulletPrefixes(content: string): string {
  return content
    .split('\n')
    .map(line => line.replace(/^[•\-\*]\s+/, ''))
    .join('\n');
}

/**
 * Strip ALL formatting prefixes (both checkbox and bullet)
 */
export function stripAllFormatting(content: string): string {
  return content
    .split('\n')
    .map(line => {
      // First try checkbox (more specific pattern)
      const stripped = line.replace(/^-?\s*\[[ xX]\]\s*/, '');
      if (stripped !== line) return stripped;
      // Then try bullet
      return line.replace(/^[•\-\*]\s+/, '');
    })
    .join('\n');
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
 * Find where a newline was inserted by comparing old and new content
 */
function findNewlineInsertPosition(oldContent: string, newContent: string): number {
  // Find first difference
  let i = 0;
  while (i < oldContent.length && i < newContent.length && oldContent[i] === newContent[i]) {
    i++;
  }

  // The newline should be around position i in newContent
  // Find the actual newline
  const searchStart = Math.max(0, i - 1);
  const newlinePos = newContent.indexOf('\n', searchStart);

  return newlinePos >= 0 ? newlinePos : i;
}

/**
 * Process content change and handle auto-continue/auto-remove for lists
 */
export function processContentChange(
  oldContent: string,
  newContent: string,
  cursorPosition: number
): ContentChangeResult {
  const lengthDiff = newContent.length - oldContent.length;

  // Detect single character insertion
  if (lengthDiff === 1) {
    // Find where the character was inserted by comparing strings
    // This is more reliable than using cursor position which may be stale
    let insertPos = 0;
    while (insertPos < oldContent.length && oldContent[insertPos] === newContent[insertPos]) {
      insertPos++;
    }
    const insertedChar = newContent[insertPos];

    if (insertedChar === '\n') {
      // insertPos is where the newline is in newContent
      // The line before the newline is from lineStart to insertPos
      const lineStart = newContent.lastIndexOf('\n', insertPos - 1) + 1;
      const prevLine = newContent.substring(lineStart, insertPos);
      const cursorAfterNewline = insertPos + 1;

      // Auto-continue checkbox with content: "- [ ] text" + Enter -> new "- [ ] "
      if (prevLine.match(/^- \[ \] .+/) || prevLine.match(/^- \[x\] .+/i)) {
        const prefix = '- [ ] ';
        const result = newContent.slice(0, cursorAfterNewline) + prefix + newContent.slice(cursorAfterNewline);
        const newCursor = cursorAfterNewline + prefix.length;
        return { content: result, selection: { start: newCursor, end: newCursor } };
      }

      // Auto-remove empty checkbox: "- [ ] " + Enter -> remove checkbox line
      if (prevLine === '- [ ] ' || prevLine === '- [x] ') {
        const result = newContent.slice(0, lineStart) + newContent.slice(cursorAfterNewline);
        return { content: result, selection: { start: lineStart, end: lineStart } };
      }

      // Auto-continue bullet with content: "• text" + Enter -> new "• "
      if (prevLine.match(/^[•\-\*] .+/)) {
        const prefix = '• ';
        const result = newContent.slice(0, cursorAfterNewline) + prefix + newContent.slice(cursorAfterNewline);
        const newCursor = cursorAfterNewline + prefix.length;
        return { content: result, selection: { start: newCursor, end: newCursor } };
      }

      // Auto-remove empty bullet: "• " + Enter -> remove bullet line
      if (prevLine === '• ' || prevLine === '- ' || prevLine === '* ') {
        const result = newContent.slice(0, lineStart) + newContent.slice(cursorAfterNewline);
        return { content: result, selection: { start: lineStart, end: lineStart } };
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
    // Change [ ] to [x]
    lines[lineIndex] = line.replace(/\[\s*\]/, '[x]');
  } else if (type === 'checkbox-checked') {
    // Change [x] to [ ]
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

  // Don't add checkbox if line already has one
  if (type === 'checkbox-unchecked' || type === 'checkbox-checked') {
    return { content, selection: null };
  }

  // Remove bullet if present, then add checkbox
  let cleanLine = line;
  if (type === 'bullet') {
    cleanLine = line.replace(BULLET, '');
  }

  const newLine = '- [ ] ' + cleanLine;
  const result = content.substring(0, lineStart) + newLine + content.substring(lineStart + line.length);

  // Position cursor at end of the new prefix
  const newCursor = lineStart + 6 + (cursorPosition - lineStart - (line.length - cleanLine.length));

  return { content: result, selection: { start: newCursor, end: newCursor } };
}

/**
 * Insert a bullet at cursor position (start of current line)
 */
export function insertBulletAtCursor(content: string, cursorPosition: number): ContentChangeResult {
  const { lineStart, line } = getLineAtPosition(content, cursorPosition);
  const { type, prefixLength } = parseLineType(line);

  // Don't add bullet if line already has one
  if (type === 'bullet') {
    return { content, selection: null };
  }

  // Remove checkbox if present, then add bullet
  let cleanLine = line;
  if (type === 'checkbox-unchecked' || type === 'checkbox-checked') {
    cleanLine = line.slice(prefixLength);
  }

  const newLine = '• ' + cleanLine;
  const result = content.substring(0, lineStart) + newLine + content.substring(lineStart + line.length);

  // Position cursor at end of the new prefix
  const newCursor = lineStart + 2 + (cursorPosition - lineStart - (line.length - cleanLine.length));

  return { content: result, selection: { start: newCursor, end: newCursor } };
}

/**
 * Hook to manage editor content with list item support
 */
export function useEditorContent(content: string) {
  // Parse content into structured lines
  const parsedLines = useMemo(() => parseContent(content), [content]);

  // Get only checkbox lines for overlay rendering
  const checkboxLines = useMemo(() =>
    parsedLines.filter(line =>
      line.type === 'checkbox-unchecked' || line.type === 'checkbox-checked'
    ),
    [parsedLines]
  );

  // Get only bullet lines
  const bulletLines = useMemo(() =>
    parsedLines.filter(line => line.type === 'bullet'),
    [parsedLines]
  );

  // Toggle checkbox
  const toggleCheckbox = useCallback((lineIndex: number): string => {
    return toggleCheckboxAtLine(content, lineIndex);
  }, [content]);

  // Process content change with auto-continue/remove
  const handleContentChange = useCallback((
    newContent: string,
    cursorPosition: number
  ): ContentChangeResult => {
    return processContentChange(content, newContent, cursorPosition);
  }, [content]);

  // Insert checkbox
  const insertCheckbox = useCallback((cursorPosition: number): ContentChangeResult => {
    return insertCheckboxAtCursor(content, cursorPosition);
  }, [content]);

  // Insert bullet
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
