import type { EditorMode } from '@toonnotes/types';
import { parseContent } from './parser';

/**
 * Detect the editor mode from content by analyzing line types.
 *
 * Returns 'checklist' if any checkbox lines are found,
 * 'bullet' if any bullet lines are found (and no checkboxes),
 * 'plain' otherwise.
 *
 * This is the single canonical implementation — both Expo and Webapp
 * must use this instead of inline regex checks.
 */
export function detectEditorMode(content: string): EditorMode {
  if (!content || !content.trim()) return 'plain';

  const parsed = parseContent(content);

  const hasCheckboxes = parsed.some(
    (l) => l.type === 'checkbox-checked' || l.type === 'checkbox-unchecked'
  );
  if (hasCheckboxes) return 'checklist';

  const hasBullets = parsed.some((l) => l.type === 'bullet');
  if (hasBullets) return 'bullet';

  return 'plain';
}
