import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with Tailwind CSS merge support
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Strips HTML tags and returns plain text for previews
 * Converts block elements to line breaks for readability
 */
export function stripHtml(html: string): string {
  if (!html) return '';

  return html
    // Replace block elements with newlines
    .replace(/<\/(p|div|h[1-6]|li|br)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    // Remove all remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode common HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    // Clean up whitespace
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

/**
 * Formats content for preview display in note cards.
 * Strips HTML and converts plain text markers to visual symbols.
 * - Unchecked checkbox: - [ ] → ☐
 * - Checked checkbox: - [x] → ☑
 * - Bullets: •, -, * → •
 */
export function formatPreview(content: string): string {
  if (!content) return '';

  // First strip any HTML if present
  let result = stripHtml(content);

  // Convert checkbox markers to visual symbols
  result = result.replace(/^-\s*\[x\]\s*/gim, '☑ ');
  result = result.replace(/^-\s*\[\s*\]\s*/gm, '☐ ');

  // Convert bullet markers to bullet symbol: -, * → •
  result = result.replace(/^-\s+(?!\[)/gm, '• ');
  result = result.replace(/^\*\s+/gm, '• ');

  // Clean up excessive whitespace while preserving single newlines
  result = result.replace(/\n{2,}/g, '\n').trim();

  return result;
}

