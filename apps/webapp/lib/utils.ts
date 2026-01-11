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

/**
 * Converts HTML content to plain text with markdown-like markers.
 * This is the inverse of textToHtml() - used when saving to ensure
 * consistent format with Expo app.
 *
 * Markers:
 * - Bullets: • (bullet character + space)
 * - Unchecked checkbox: - [ ]
 * - Checked checkbox: - [x]
 */
export function htmlToPlainText(html: string): string {
  if (!html) return '';

  // If already plain text (no HTML tags), return as-is
  if (!/<[a-z][\s\S]*>/i.test(html)) {
    return html;
  }

  let result = html;

  // Handle task list items (checked) - TipTap format
  result = result.replace(
    /<li[^>]*data-checked="true"[^>]*>[\s\S]*?<p>([\s\S]*?)<\/p>[\s\S]*?<\/li>/gi,
    (_, content) => `- [x] ${decodeHtmlEntities(content.trim())}\n`
  );

  // Handle task list items (unchecked) - TipTap format
  result = result.replace(
    /<li[^>]*data-checked="false"[^>]*>[\s\S]*?<p>([\s\S]*?)<\/p>[\s\S]*?<\/li>/gi,
    (_, content) => `- [ ] ${decodeHtmlEntities(content.trim())}\n`
  );

  // Handle regular bullet list items with paragraphs
  result = result.replace(
    /<li>\s*<p>([\s\S]*?)<\/p>\s*<\/li>/gi,
    (_, content) => `• ${decodeHtmlEntities(content.trim())}\n`
  );

  // Handle regular list items without paragraphs
  result = result.replace(
    /<li>([\s\S]*?)<\/li>/gi,
    (_, content) => `• ${decodeHtmlEntities(content.trim())}\n`
  );

  // Handle paragraphs
  result = result.replace(
    /<p>([\s\S]*?)<\/p>/gi,
    (_, content) => `${decodeHtmlEntities(content.trim())}\n`
  );

  // Handle line breaks
  result = result.replace(/<br\s*\/?>/gi, '\n');

  // Remove all remaining HTML tags (ul, ol, div, etc.)
  result = result.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  result = decodeHtmlEntities(result);

  // Clean up excessive newlines
  result = result.replace(/\n{3,}/g, '\n\n').trim();

  return result;
}

/**
 * Decodes HTML entities to their character equivalents
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'");
}

/**
 * Converts plain text content to HTML for TipTap editor
 * Handles bullet points (•), checkboxes (- [ ], - [x]), and plain text
 */
export function textToHtml(content: string): string {
  if (!content) return '';

  // If already HTML (contains tags), return as-is
  if (/<[a-z][\s\S]*>/i.test(content)) {
    return content;
  }

  const lines = content.split('\n');
  const result: string[] = [];
  let inBulletList = false;
  let inTaskList = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Check for checkbox markers: - [ ] or - [x]
    const checkedMatch = trimmed.match(/^-\s*\[x\]\s*(.*)$/i);
    const uncheckedMatch = trimmed.match(/^-\s*\[\s*\]\s*(.*)$/);

    // Check for bullet markers: •, -, or * followed by space (but not checkbox)
    const bulletMatch = !checkedMatch && !uncheckedMatch && trimmed.match(/^[•\-\*]\s+(.*)$/);

    if (checkedMatch || uncheckedMatch) {
      // Close bullet list if open
      if (inBulletList) {
        result.push('</ul>');
        inBulletList = false;
      }

      // Open task list if not open
      if (!inTaskList) {
        result.push('<ul data-type="taskList" class="task-list">');
        inTaskList = true;
      }

      const isChecked = !!checkedMatch;
      const text = escapeHtml(isChecked ? checkedMatch[1] : uncheckedMatch![1]);
      result.push(
        `<li data-type="taskItem" data-checked="${isChecked}" class="task-item"><label><input type="checkbox" ${isChecked ? 'checked' : ''}></label><div><p>${text}</p></div></li>`
      );
    } else if (bulletMatch) {
      // Close task list if open
      if (inTaskList) {
        result.push('</ul>');
        inTaskList = false;
      }

      // Open bullet list if not open
      if (!inBulletList) {
        result.push('<ul class="list-disc">');
        inBulletList = true;
      }

      result.push(`<li><p>${escapeHtml(bulletMatch[1])}</p></li>`);
    } else {
      // Regular paragraph - close any open lists
      if (inBulletList) {
        result.push('</ul>');
        inBulletList = false;
      }
      if (inTaskList) {
        result.push('</ul>');
        inTaskList = false;
      }

      if (trimmed) {
        result.push(`<p>${escapeHtml(trimmed)}</p>`);
      } else if (result.length > 0) {
        // Empty line - preserve as empty paragraph (but not at start)
        result.push('<p></p>');
      }
    }
  }

  // Close any open lists at end
  if (inBulletList) result.push('</ul>');
  if (inTaskList) result.push('</ul>');

  return result.join('');
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
