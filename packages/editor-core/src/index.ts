// Types
export type { LineType, ParsedLine, ChecklistItem, BulletItem } from './types';

// Parser
export { parseLineType, parseContent } from './parser';

// Serializer
export {
  checklistToContent,
  parseChecklistFromContent,
  bulletToContent,
  parseBulletFromContent,
  stripCheckboxPrefixes,
  stripBulletPrefixes,
  stripAllFormatting,
  normalizeContent,
} from './serializer';

// Mode detection
export { detectEditorMode } from './mode-detection';

// HTML bridge (web-only TipTap integration)
export { textToHtml, htmlToPlainText } from './html-bridge';

// Auto-continue (Enter-key behavior for lists)
export { getAutoContinuePrefix, shouldRemoveEmptyLine } from './auto-continue';
