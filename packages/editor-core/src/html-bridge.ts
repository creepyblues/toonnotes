import { parseLineType } from './parser';

/**
 * Escapes HTML special characters.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Decodes HTML entities to their character equivalents.
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
 * Converts plain text content to HTML for the TipTap editor.
 * Handles bullet points (•), checkboxes (- [ ], - [x]), and plain text.
 *
 * Uses the shared parseLineType() to detect line types consistently
 * with the Expo parser.
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
    const { type, prefixLength } = parseLineType(trimmed);
    const text = trimmed.slice(prefixLength);

    if (type === 'checkbox-checked' || type === 'checkbox-unchecked') {
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

      const isChecked = type === 'checkbox-checked';
      result.push(
        `<li data-type="taskItem" data-checked="${isChecked}" class="task-item"><label><input type="checkbox" ${isChecked ? 'checked' : ''}></label><div><p>${escapeHtml(text)}</p></div></li>`
      );
    } else if (type === 'bullet') {
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

      result.push(`<li><p>${escapeHtml(text)}</p></li>`);
    } else {
      // Regular paragraph — close any open lists
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
        // Empty line — preserve as empty paragraph (but not at start)
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
 * Converts HTML content to plain text with markdown-like markers.
 * This is the inverse of textToHtml() — used when saving to ensure
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

  // Handle task list items (checked) — TipTap format
  result = result.replace(
    /<li[^>]*data-checked="true"[^>]*>[\s\S]*?<p>([\s\S]*?)<\/p>[\s\S]*?<\/li>/gi,
    (_, content) => `- [x] ${decodeHtmlEntities(content.trim())}\n`
  );

  // Handle task list items (unchecked) — TipTap format
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
