import type { LineType, ParsedLine } from './types';

// Regex patterns — order matters: check checkbox before bullet since
// "- [x] text" would also match the bullet pattern "- text".
const CHECKBOX_UNCHECKED = /^-?\s*\[\s*\]\s*/;
const CHECKBOX_CHECKED = /^-?\s*\[[xX]\]\s*/;
const BULLET = /^([•\-\*])\s+/;

/**
 * Parse a single line to determine its type and prefix length.
 */
export function parseLineType(line: string): { type: LineType; prefixLength: number } {
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
 * Parse multi-line content into an array of structured ParsedLine objects.
 */
export function parseContent(content: string): ParsedLine[] {
  const lines = content.split('\n');
  return lines.map((line) => {
    const { type, prefixLength } = parseLineType(line);
    return {
      type,
      text: line.slice(prefixLength),
      rawLine: line,
      prefixLength,
    };
  });
}
