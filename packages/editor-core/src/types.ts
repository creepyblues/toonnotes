/**
 * Canonical line types for ToonNotes content parsing.
 * Shared across Expo (TextInput) and Web (TipTap) editors.
 */
export type LineType = 'text' | 'checkbox-unchecked' | 'checkbox-checked' | 'bullet';

export interface ParsedLine {
  type: LineType;
  text: string;
  rawLine: string;
  prefixLength: number;
}

export interface ChecklistItem {
  text: string;
  checked: boolean;
}

export interface BulletItem {
  text: string;
}
