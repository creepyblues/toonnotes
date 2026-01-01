/**
 * Tests for fuzzy label matching functions
 */

import {
  getPresetForLabel,
  getPresetForLabelFuzzy,
  getIconForLabel,
} from '@/constants/labelPresets';

describe('getPresetForLabel (exact matching)', () => {
  it('returns todo preset for "todo"', () => {
    const preset = getPresetForLabel('todo');
    expect(preset?.id).toBe('todo');
  });

  it('returns undefined for non-preset label', () => {
    const preset = getPresetForLabel('my-custom-label');
    expect(preset).toBeUndefined();
  });

  it('is case-insensitive', () => {
    const preset = getPresetForLabel('TODO');
    expect(preset?.id).toBe('todo');
  });
});

describe('getPresetForLabelFuzzy', () => {
  // Exact matches should still work
  it('returns todo preset for exact match "todo"', () => {
    const preset = getPresetForLabelFuzzy('todo');
    expect(preset?.id).toBe('todo');
  });

  it('returns reading preset for exact match "reading"', () => {
    const preset = getPresetForLabelFuzzy('reading');
    expect(preset?.id).toBe('reading');
  });

  // Fuzzy matches - preset ID in label
  it('returns shopping preset for "my-shopping-list"', () => {
    const preset = getPresetForLabelFuzzy('my-shopping-list');
    expect(preset?.id).toBe('shopping');
  });

  it('returns watchlist preset for "anime-watchlist"', () => {
    const preset = getPresetForLabelFuzzy('anime-watchlist');
    expect(preset?.id).toBe('watchlist');
  });

  it('returns project preset for "project-ideas" (project in label)', () => {
    const preset = getPresetForLabelFuzzy('project-ideas');
    // "project" matches "project" preset directly
    expect(preset?.id).toBe('project');
  });

  // Fuzzy matches - aiPromptHints keywords
  it('returns watchlist preset for "anime-watch" (anime in hints)', () => {
    const preset = getPresetForLabelFuzzy('anime-watch');
    // watchlist has 'anime' in aiPromptHints
    expect(preset?.id).toBe('watchlist');
  });

  it('returns bookmarks preset for "book-notes" (book matches bookmarks)', () => {
    const preset = getPresetForLabelFuzzy('book-notes');
    // "book" partially matches "bookmarks" preset
    expect(preset?.id).toBe('bookmarks');
  });

  // No match cases
  it('returns undefined for completely unrelated label', () => {
    const preset = getPresetForLabelFuzzy('xyz-random-thing');
    expect(preset).toBeUndefined();
  });

  it('returns undefined for single short token', () => {
    const preset = getPresetForLabelFuzzy('x');
    expect(preset).toBeUndefined();
  });
});

describe('getIconForLabel', () => {
  // Preset matches
  it('returns CheckSquare for "todo"', () => {
    expect(getIconForLabel('todo')).toBe('CheckSquare');
  });

  it('returns BookOpen for "reading"', () => {
    expect(getIconForLabel('reading')).toBe('BookOpen');
  });

  it('returns ShoppingCart for "shopping"', () => {
    expect(getIconForLabel('shopping')).toBe('ShoppingCart');
  });

  // Fuzzy matches
  it('returns ShoppingCart for "my-shopping-list" (fuzzy match)', () => {
    expect(getIconForLabel('my-shopping-list')).toBe('ShoppingCart');
  });

  // Fallback
  it('returns Tag fallback for unmatched label', () => {
    expect(getIconForLabel('xyz-random')).toBe('Tag');
  });

  it('returns Tag fallback for empty string', () => {
    expect(getIconForLabel('')).toBe('Tag');
  });
});
