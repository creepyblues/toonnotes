import { describe, it, expect, beforeEach } from 'vitest';
import { useBoardStore } from '@/stores/boardStore';
import { BOARD_PRESETS } from '@toonnotes/constants';

describe('BoardStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useBoardStore.setState({
      boardStyles: [],
      isLoading: false,
      error: null,
    });
  });

  describe('setBoardStyle', () => {
    it('should set a board style for a hashtag', () => {
      const store = useBoardStore.getState();

      store.setBoardStyle('todo', 'todo');

      const assignment = store.getBoardStyle('todo');
      expect(assignment).toBeDefined();
      expect(assignment?.hashtag).toBe('todo');
      expect(assignment?.presetId).toBe('todo');
    });

    it('should normalize hashtag to lowercase', () => {
      const store = useBoardStore.getState();

      store.setBoardStyle('TODO', 'todo');

      const assignment = store.getBoardStyle('todo');
      expect(assignment).toBeDefined();
      expect(assignment?.hashtag).toBe('todo');
    });

    it('should update existing assignment', () => {
      const store = useBoardStore.getState();

      store.setBoardStyle('work', 'todo');
      store.setBoardStyle('work', 'important');

      const assignment = store.getBoardStyle('work');
      expect(assignment?.presetId).toBe('important');

      // Should still only have one assignment
      expect(useBoardStore.getState().boardStyles).toHaveLength(1);
    });
  });

  describe('removeBoardStyle', () => {
    it('should remove a board style assignment', () => {
      const store = useBoardStore.getState();

      store.setBoardStyle('todo', 'todo');
      expect(store.getBoardStyle('todo')).toBeDefined();

      store.removeBoardStyle('todo');
      expect(useBoardStore.getState().getBoardStyle('todo')).toBeUndefined();
    });

    it('should handle removing non-existent assignment gracefully', () => {
      const store = useBoardStore.getState();

      expect(() => store.removeBoardStyle('nonexistent')).not.toThrow();
    });
  });

  describe('getPresetForBoard', () => {
    it('should return the assigned preset when set', () => {
      const store = useBoardStore.getState();

      store.setBoardStyle('myboard', 'reading');

      const preset = store.getPresetForBoard('myboard');
      expect(preset.id).toBe('reading');
      expect(preset.name).toBe('Reading');
    });

    it('should return auto-generated preset when no assignment', () => {
      const store = useBoardStore.getState();

      const preset = store.getPresetForBoard('cooking');

      // Should get a preset (auto-generated based on keyword)
      expect(preset).toBeDefined();
      expect(preset.id).toContain('auto-');
    });

    it('should return matching preset for known hashtag', () => {
      const store = useBoardStore.getState();

      // "todo" matches the preset name, so it should auto-match
      const preset = store.getPresetForBoard('todo');
      expect(preset.id).toBe('todo');
      expect(preset.name).toBe('Todo');
    });

    it('should apply custom colors when set', () => {
      const store = useBoardStore.getState();

      store.setBoardStyle('myboard', 'todo');
      store.setCustomColors('myboard', { bg: '#FF0000' });

      const preset = store.getPresetForBoard('myboard');
      expect(preset.colors.bg).toBe('#FF0000');
      // Other colors should remain from the preset
      expect(preset.colors.accent).toBe(BOARD_PRESETS.find((p) => p.id === 'todo')?.colors.accent);
    });
  });

  describe('setCustomColors', () => {
    it('should set custom colors for existing assignment', () => {
      const store = useBoardStore.getState();

      store.setBoardStyle('myboard', 'todo');
      store.setCustomColors('myboard', { bg: '#123456', accent: '#654321' });

      const preset = store.getPresetForBoard('myboard');
      expect(preset.colors.bg).toBe('#123456');
      expect(preset.colors.accent).toBe('#654321');
    });

    it('should create assignment with auto-preset when setting colors for new hashtag', () => {
      const store = useBoardStore.getState();

      store.setCustomColors('newboard', { bg: '#AABBCC' });

      const assignment = store.getBoardStyle('newboard');
      expect(assignment).toBeDefined();
      expect(assignment?.customColors?.bg).toBe('#AABBCC');
    });
  });

  describe('clearCustomColors', () => {
    it('should clear custom colors', () => {
      const store = useBoardStore.getState();

      store.setBoardStyle('myboard', 'todo');
      store.setCustomColors('myboard', { bg: '#FF0000' });

      expect(store.getPresetForBoard('myboard').colors.bg).toBe('#FF0000');

      store.clearCustomColors('myboard');

      const preset = store.getPresetForBoard('myboard');
      const originalTodo = BOARD_PRESETS.find((p) => p.id === 'todo');
      expect(preset.colors.bg).toBe(originalTodo?.colors.bg);
    });
  });

  describe('bulk operations', () => {
    it('should set multiple board styles via setBoardStyles', () => {
      const store = useBoardStore.getState();

      store.setBoardStyles([
        { hashtag: 'work', presetId: 'todo' },
        { hashtag: 'reading', presetId: 'reading' },
        { hashtag: 'ideas', presetId: 'ideas' },
      ]);

      expect(useBoardStore.getState().boardStyles).toHaveLength(3);
      expect(store.getBoardStyle('work')?.presetId).toBe('todo');
      expect(store.getBoardStyle('reading')?.presetId).toBe('reading');
      expect(store.getBoardStyle('ideas')?.presetId).toBe('ideas');
    });
  });

  describe('error handling', () => {
    it('should set and clear loading state', () => {
      const store = useBoardStore.getState();

      store.setLoading(true);
      expect(useBoardStore.getState().isLoading).toBe(true);

      store.setLoading(false);
      expect(useBoardStore.getState().isLoading).toBe(false);
    });

    it('should set and clear error state', () => {
      const store = useBoardStore.getState();

      store.setError('Test error');
      expect(useBoardStore.getState().error).toBe('Test error');

      store.setError(null);
      expect(useBoardStore.getState().error).toBeNull();
    });
  });
});

describe('Board Presets Integration', () => {
  it('should have BOARD_PRESETS available', () => {
    expect(BOARD_PRESETS).toBeDefined();
    expect(BOARD_PRESETS.length).toBeGreaterThan(0);
  });

  it('should have all required fields in presets', () => {
    BOARD_PRESETS.forEach((preset) => {
      expect(preset.id).toBeDefined();
      expect(preset.name).toBeDefined();
      expect(preset.category).toBeDefined();
      expect(preset.colors).toBeDefined();
      expect(preset.colors.bg).toBeDefined();
      expect(preset.colors.bgSecondary).toBeDefined();
      expect(preset.colors.accent).toBeDefined();
      expect(preset.colors.badge).toBeDefined();
      expect(preset.colors.badgeText).toBeDefined();
      expect(preset.colors.labelText).toBeDefined();
      expect(preset.colors.notePreview).toBeDefined();
    });
  });

  it('should have unique preset IDs', () => {
    const ids = BOARD_PRESETS.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
