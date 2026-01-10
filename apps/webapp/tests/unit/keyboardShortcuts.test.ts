import { describe, it, expect } from 'vitest';
import { KEYBOARD_SHORTCUTS } from '@/lib/hooks/useKeyboardShortcuts';

describe('Keyboard Shortcuts', () => {
  describe('KEYBOARD_SHORTCUTS constant', () => {
    it('should have all required shortcuts defined', () => {
      const shortcutDescriptions = KEYBOARD_SHORTCUTS.map((s) => s.description);

      // Core shortcuts
      expect(shortcutDescriptions).toContain('Create new note');
      expect(shortcutDescriptions).toContain('Open command palette');
      expect(shortcutDescriptions).toContain('Archive current note');
      expect(shortcutDescriptions).toContain('Show keyboard shortcuts');
      expect(shortcutDescriptions).toContain('Close modal / Go back');

      // Navigation shortcuts
      expect(shortcutDescriptions).toContain('Go to Notes');
      expect(shortcutDescriptions).toContain('Go to Boards');
      expect(shortcutDescriptions).toContain('Go to Designs');
      expect(shortcutDescriptions).toContain('Go to Settings');
    });

    it('should have correct key combinations', () => {
      const findShortcut = (description: string) =>
        KEYBOARD_SHORTCUTS.find((s) => s.description === description);

      // New note: ⌘ + N
      const newNote = findShortcut('Create new note');
      expect(newNote?.keys).toEqual(['⌘', 'N']);

      // Command palette: ⌘ + K
      const cmdPalette = findShortcut('Open command palette');
      expect(cmdPalette?.keys).toEqual(['⌘', 'K']);

      // Archive: ⌘ + E
      const archive = findShortcut('Archive current note');
      expect(archive?.keys).toEqual(['⌘', 'E']);

      // Help: ⌘ + /
      const help = findShortcut('Show keyboard shortcuts');
      expect(help?.keys).toEqual(['⌘', '/']);

      // Escape
      const escape = findShortcut('Close modal / Go back');
      expect(escape?.keys).toEqual(['Esc']);

      // G-prefixed navigation
      const goNotes = findShortcut('Go to Notes');
      expect(goNotes?.keys).toEqual(['G', 'N']);

      const goBoards = findShortcut('Go to Boards');
      expect(goBoards?.keys).toEqual(['G', 'B']);

      const goDesigns = findShortcut('Go to Designs');
      expect(goDesigns?.keys).toEqual(['G', 'D']);

      const goSettings = findShortcut('Go to Settings');
      expect(goSettings?.keys).toEqual(['G', 'S']);
    });

    it('should categorize shortcuts correctly', () => {
      const categories = [...new Set(KEYBOARD_SHORTCUTS.map((s) => s.category))];

      expect(categories).toContain('Notes');
      expect(categories).toContain('Navigation');
      expect(categories).toContain('Help');
    });

    it('should have unique descriptions', () => {
      const descriptions = KEYBOARD_SHORTCUTS.map((s) => s.description);
      const uniqueDescriptions = [...new Set(descriptions)];

      expect(descriptions.length).toBe(uniqueDescriptions.length);
    });

    it('should have all shortcuts with at least one key', () => {
      KEYBOARD_SHORTCUTS.forEach((shortcut) => {
        expect(shortcut.keys.length).toBeGreaterThanOrEqual(1);
      });
    });
  });
});
