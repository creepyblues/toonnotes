import type { ChecklistItem, BulletItem } from './types';
import { parseLineType } from './parser';

/**
 * Convert checklist items to canonical markdown content.
 *   checked → "- [x] text"
 *   unchecked → "- [ ] text"
 */
export function checklistToContent(items: ChecklistItem[]): string {
  return items
    .map((item) => `- [${item.checked ? 'x' : ' '}] ${item.text}`)
    .join('\n');
}

/**
 * Parse content into checklist items.
 * Lines without checkbox prefix are treated as unchecked items.
 */
export function parseChecklistFromContent(content: string): ChecklistItem[] {
  if (!content.trim()) {
    return [{ text: '', checked: false }];
  }

  const lines = content.split('\n');
  return lines.map((line) => {
    const isChecked = /\[x\]/i.test(line);
    // Strip checkbox prefix first
    let text = line.replace(/^-?\s*\[[ xX]\]\s*/, '');
    // If no checkbox was stripped, strip bullet prefix
    if (text === line) {
      text = line.replace(/^[•\-\*]\s+/, '');
    }
    return { text, checked: isChecked };
  });
}

/**
 * Convert bullet items to canonical markdown content.
 *   "• text"
 */
export function bulletToContent(items: BulletItem[]): string {
  return items.map((item) => `• ${item.text}`).join('\n');
}

/**
 * Parse content into bullet items.
 * Strips any existing bullet prefix.
 */
export function parseBulletFromContent(content: string): BulletItem[] {
  if (!content.trim()) {
    return [{ text: '' }];
  }

  const lines = content.split('\n');
  return lines.map((line) => ({
    text: line.replace(/^[•\-\*]\s*/, ''),
  }));
}

/**
 * Strip all checkbox prefixes from content.
 *   "- [ ] text" → "text"
 *   "- [x] text" → "text"
 */
export function stripCheckboxPrefixes(content: string): string {
  return content
    .split('\n')
    .map((line) => line.replace(/^-?\s*\[[ xX]\]\s*/, ''))
    .join('\n');
}

/**
 * Strip all bullet prefixes from content.
 *   "• text" → "text"
 *   "- text" → "text" (when used as bullet, not checkbox)
 *   "* text" → "text"
 */
export function stripBulletPrefixes(content: string): string {
  return content
    .split('\n')
    .map((line) => line.replace(/^[•\-\*]\s+/, ''))
    .join('\n');
}

/**
 * Strip ALL formatting prefixes (both checkbox and bullet).
 */
export function stripAllFormatting(content: string): string {
  return content
    .split('\n')
    .map((line) => {
      // First try checkbox (more specific pattern)
      const stripped = line.replace(/^-?\s*\[[ xX]\]\s*/, '');
      if (stripped !== line) return stripped;
      // Then try bullet
      return line.replace(/^[•\-\*]\s+/, '');
    })
    .join('\n');
}

/**
 * Normalize content to canonical form.
 * Re-serializes each line using its detected type to ensure consistent formatting.
 *   "- [X] text"  → "- [x] text"
 *   "* text"       → "• text"
 *   "[ ] text"     → "- [ ] text"
 */
export function normalizeContent(content: string): string {
  if (!content) return '';

  return content
    .split('\n')
    .map((line) => {
      const { type, prefixLength } = parseLineType(line);
      const text = line.slice(prefixLength);

      switch (type) {
        case 'checkbox-checked':
          return `- [x] ${text}`;
        case 'checkbox-unchecked':
          return `- [ ] ${text}`;
        case 'bullet':
          return `• ${text}`;
        case 'text':
        default:
          return line;
      }
    })
    .join('\n');
}
