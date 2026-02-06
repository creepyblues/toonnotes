import { Note, BoardData } from '@toonnotes/types';

/**
 * Compute boards from notes by grouping active notes by label.
 * Pure function - no side effects.
 */
export function computeBoardsFromNotes(notes: Note[]): BoardData[] {
  const labelMap = new Map<string, Note[]>();

  notes.forEach((note) => {
    note.labels.forEach((label) => {
      const existing = labelMap.get(label) || [];
      labelMap.set(label, [...existing, note]);
    });
  });

  return Array.from(labelMap.entries())
    .map(([hashtag, boardNotes]) => {
      const sorted = [...boardNotes].sort((a, b) => b.updatedAt - a.updatedAt);
      const previewNotes = sorted.slice(0, 4);
      const derivedColors = sorted
        .slice(0, 3)
        .map((n) => n.color)
        .filter(Boolean) as string[];

      return {
        hashtag,
        noteCount: boardNotes.length,
        previewNotes,
        mostRecentUpdate: Math.max(...boardNotes.map((n) => n.updatedAt)),
        derivedColors,
      };
    })
    .sort((a, b) => b.mostRecentUpdate - a.mostRecentUpdate);
}
