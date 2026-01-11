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
 * Converts plain text content to HTML for TipTap editor
 * Handles bullet points (•), newlines, and plain text
 */
export function textToHtml(content: string): string {
  if (!content) return '';

  // If already HTML (contains tags), return as-is
  if (/<[a-z][\s\S]*>/i.test(content)) {
    return content;
  }

  // Split by bullet points or newlines
  const lines = content
    .split(/(?:•|\n)+/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) return '';

  // If only one line, wrap in paragraph
  if (lines.length === 1) {
    return `<p>${escapeHtml(lines[0])}</p>`;
  }

  // Multiple lines - create list or paragraphs
  // Check if content looks like a list (had bullets)
  const hadBullets = content.includes('•');

  if (hadBullets) {
    const items = lines.map(line => `<li><p>${escapeHtml(line)}</p></li>`).join('');
    return `<ul>${items}</ul>`;
  }

  // Plain paragraphs
  return lines.map(line => `<p>${escapeHtml(line)}</p>`).join('');
}

/**
 * Escapes HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
