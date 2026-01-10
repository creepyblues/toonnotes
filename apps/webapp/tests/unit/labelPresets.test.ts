import { describe, it, expect, beforeEach } from 'vitest';
import { useNoteStore } from '@/stores/noteStore';
import {
  getPresetForLabel,
  getPresetForLabelFuzzy,
  getIconForLabel,
  hasPresetForLabel,
  LABEL_PRESETS,
  LABEL_PRESET_LIST,
  PRESETS_BY_CATEGORY,
  CATEGORY_ORDER,
} from '@toonnotes/constants';
import { NoteColor } from '@toonnotes/types';

// Test label preset constants
describe('Label Presets Constants', () => {
  describe('LABEL_PRESETS', () => {
    it('should have 31 total presets', () => {
      expect(Object.keys(LABEL_PRESETS)).toHaveLength(31);
    });

    it('should have required fields for each preset', () => {
      Object.values(LABEL_PRESETS).forEach((preset) => {
        expect(preset.id).toBeDefined();
        expect(preset.name).toBeDefined();
        expect(preset.category).toBeDefined();
        expect(preset.icon).toBeDefined();
        expect(preset.noteIcon).toBeDefined();
        expect(preset.colors).toBeDefined();
        expect(preset.colors.primary).toBeDefined();
        expect(preset.colors.bg).toBeDefined();
        expect(preset.colors.text).toBeDefined();
      });
    });
  });

  describe('LABEL_PRESET_LIST', () => {
    it('should have 30 user presets (excluding system)', () => {
      expect(LABEL_PRESET_LIST).toHaveLength(30);
    });

    it('should not include uncategorized', () => {
      expect(LABEL_PRESET_LIST.find((p) => p.id === 'uncategorized')).toBeUndefined();
    });
  });

  describe('PRESETS_BY_CATEGORY', () => {
    it('should have 6 categories', () => {
      expect(Object.keys(PRESETS_BY_CATEGORY)).toHaveLength(6);
    });

    it('should have 5 presets per category', () => {
      CATEGORY_ORDER.forEach((category) => {
        expect(PRESETS_BY_CATEGORY[category]).toHaveLength(5);
      });
    });
  });
});

// Test preset lookup functions
describe('Label Preset Lookup Functions', () => {
  describe('getPresetForLabel', () => {
    it('should find exact match for preset', () => {
      const preset = getPresetForLabel('todo');
      expect(preset).toBeDefined();
      expect(preset?.id).toBe('todo');
    });

    it('should be case insensitive', () => {
      const preset = getPresetForLabel('TODO');
      expect(preset).toBeDefined();
      expect(preset?.id).toBe('todo');
    });

    it('should return undefined for non-preset label', () => {
      const preset = getPresetForLabel('my-custom-label');
      expect(preset).toBeUndefined();
    });

    it('should handle whitespace', () => {
      const preset = getPresetForLabel('  todo  ');
      expect(preset).toBeDefined();
      expect(preset?.id).toBe('todo');
    });
  });

  describe('getPresetForLabelFuzzy', () => {
    it('should find exact match first', () => {
      const preset = getPresetForLabelFuzzy('shopping');
      expect(preset?.id).toBe('shopping');
    });

    it('should find partial match for compound labels', () => {
      const preset = getPresetForLabelFuzzy('my-shopping-list');
      expect(preset?.id).toBe('shopping');
    });

    it('should match by keywords', () => {
      const preset = getPresetForLabelFuzzy('groceries');
      expect(preset?.id).toBe('shopping');
    });

    it('should return undefined for unmatched label', () => {
      const preset = getPresetForLabelFuzzy('xyzabc123');
      expect(preset).toBeUndefined();
    });
  });

  describe('getIconForLabel', () => {
    it('should return preset icon for matching label', () => {
      const icon = getIconForLabel('todo');
      expect(icon).toBe('CheckSquare');
    });

    it('should return Tag for non-preset label', () => {
      const icon = getIconForLabel('custom-label');
      expect(icon).toBe('Tag');
    });
  });

  describe('hasPresetForLabel', () => {
    it('should return true for preset label', () => {
      expect(hasPresetForLabel('todo')).toBe(true);
      expect(hasPresetForLabel('shopping')).toBe(true);
      expect(hasPresetForLabel('ideas')).toBe(true);
    });

    it('should return false for non-preset label', () => {
      expect(hasPresetForLabel('custom')).toBe(false);
      expect(hasPresetForLabel('my-label')).toBe(false);
    });
  });
});

// Test note store label preset integration
describe('Note Store Label Preset Integration', () => {
  beforeEach(() => {
    useNoteStore.setState({
      notes: [],
      labels: [],
      isLoading: false,
      error: null,
    });
  });

  describe('addLabelToNote with presets', () => {
    it('should add preset label to note', () => {
      const note = useNoteStore.getState().addNote({
        title: 'Test',
        content: '',
        labels: [],
        color: NoteColor.White,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      useNoteStore.getState().addLabelToNote(note.id, 'todo');

      const updatedNote = useNoteStore.getState().getNoteById(note.id);
      expect(updatedNote?.labels).toContain('todo');
    });

    it('should set activeDesignLabelId for preset label on note without design', () => {
      const note = useNoteStore.getState().addNote({
        title: 'Test',
        content: '',
        labels: [],
        color: NoteColor.White,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      useNoteStore.getState().addLabelToNote(note.id, 'todo');

      const updatedNote = useNoteStore.getState().getNoteById(note.id);
      expect(updatedNote?.activeDesignLabelId).toBe('todo');
    });

    it('should NOT set activeDesignLabelId if note already has designId', () => {
      const note = useNoteStore.getState().addNote({
        title: 'Test',
        content: '',
        labels: [],
        color: NoteColor.White,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
        designId: 'existing-design',
      });

      useNoteStore.getState().addLabelToNote(note.id, 'todo');

      const updatedNote = useNoteStore.getState().getNoteById(note.id);
      expect(updatedNote?.activeDesignLabelId).toBeUndefined();
    });

    it('should NOT set activeDesignLabelId if note already has activeDesignLabelId', () => {
      // First add a note with no labels
      const note = useNoteStore.getState().addNote({
        title: 'Test',
        content: '',
        labels: [],
        color: NoteColor.White,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      // Add first preset label (this will set activeDesignLabelId)
      useNoteStore.getState().addLabelToNote(note.id, 'todo');

      // Add second preset label (should NOT change activeDesignLabelId)
      useNoteStore.getState().addLabelToNote(note.id, 'shopping');

      const updatedNote = useNoteStore.getState().getNoteById(note.id);
      expect(updatedNote?.activeDesignLabelId).toBe('todo');
      expect(updatedNote?.labels).toContain('shopping');
    });

    it('should NOT set activeDesignLabelId for non-preset label', () => {
      const note = useNoteStore.getState().addNote({
        title: 'Test',
        content: '',
        labels: [],
        color: NoteColor.White,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      useNoteStore.getState().addLabelToNote(note.id, 'custom-label');

      const updatedNote = useNoteStore.getState().getNoteById(note.id);
      expect(updatedNote?.activeDesignLabelId).toBeUndefined();
    });

    it('should create label with presetId when adding preset label', () => {
      const note = useNoteStore.getState().addNote({
        title: 'Test',
        content: '',
        labels: [],
        color: NoteColor.White,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      useNoteStore.getState().addLabelToNote(note.id, 'todo');

      const labels = useNoteStore.getState().labels;
      const todoLabel = labels.find((l) => l.name === 'todo');
      expect(todoLabel?.presetId).toBe('todo');
    });

    it('should NOT set presetId for non-preset label', () => {
      const note = useNoteStore.getState().addNote({
        title: 'Test',
        content: '',
        labels: [],
        color: NoteColor.White,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      useNoteStore.getState().addLabelToNote(note.id, 'custom');

      const labels = useNoteStore.getState().labels;
      const customLabel = labels.find((l) => l.name === 'custom');
      expect(customLabel?.presetId).toBeUndefined();
    });
  });

  describe('removeLabelFromNote with presets', () => {
    it('should clear activeDesignLabelId when removing active label', () => {
      const note = useNoteStore.getState().addNote({
        title: 'Test',
        content: '',
        labels: [],
        color: NoteColor.White,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      useNoteStore.getState().addLabelToNote(note.id, 'todo');
      useNoteStore.getState().removeLabelFromNote(note.id, 'todo');

      const updatedNote = useNoteStore.getState().getNoteById(note.id);
      expect(updatedNote?.activeDesignLabelId).toBeUndefined();
      expect(updatedNote?.labels).not.toContain('todo');
    });

    it('should NOT clear activeDesignLabelId when removing non-active label', () => {
      const note = useNoteStore.getState().addNote({
        title: 'Test',
        content: '',
        labels: [],
        color: NoteColor.White,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      useNoteStore.getState().addLabelToNote(note.id, 'todo');
      useNoteStore.getState().addLabelToNote(note.id, 'shopping');
      useNoteStore.getState().removeLabelFromNote(note.id, 'shopping');

      const updatedNote = useNoteStore.getState().getNoteById(note.id);
      expect(updatedNote?.activeDesignLabelId).toBe('todo');
      expect(updatedNote?.labels).not.toContain('shopping');
    });
  });
});

// Test preset categories
describe('Preset Categories', () => {
  it('should have productivity presets', () => {
    const productivityIds = ['todo', 'in-progress', 'done', 'waiting', 'priority'];
    productivityIds.forEach((id) => {
      expect(LABEL_PRESETS[id as keyof typeof LABEL_PRESETS]?.category).toBe('productivity');
    });
  });

  it('should have planning presets', () => {
    const planningIds = ['goals', 'meeting', 'planning', 'deadline', 'project'];
    planningIds.forEach((id) => {
      expect(LABEL_PRESETS[id as keyof typeof LABEL_PRESETS]?.category).toBe('planning');
    });
  });

  it('should have checklists presets', () => {
    const checklistIds = ['shopping', 'wishlist', 'packing', 'bucket-list', 'errands'];
    checklistIds.forEach((id) => {
      expect(LABEL_PRESETS[id as keyof typeof LABEL_PRESETS]?.category).toBe('checklists');
    });
  });

  it('should have media presets', () => {
    const mediaIds = ['reading', 'watchlist', 'bookmarks', 'review', 'recommendation'];
    mediaIds.forEach((id) => {
      expect(LABEL_PRESETS[id as keyof typeof LABEL_PRESETS]?.category).toBe('media');
    });
  });

  it('should have creative presets', () => {
    const creativeIds = ['ideas', 'draft', 'brainstorm', 'inspiration', 'research'];
    creativeIds.forEach((id) => {
      expect(LABEL_PRESETS[id as keyof typeof LABEL_PRESETS]?.category).toBe('creative');
    });
  });

  it('should have personal presets', () => {
    const personalIds = ['journal', 'memory', 'reflection', 'gratitude', 'quotes'];
    personalIds.forEach((id) => {
      expect(LABEL_PRESETS[id as keyof typeof LABEL_PRESETS]?.category).toBe('personal');
    });
  });

  it('should have uncategorized as system label', () => {
    expect(LABEL_PRESETS.uncategorized.category).toBe('system');
    expect(LABEL_PRESETS.uncategorized.isSystemLabel).toBe(true);
  });
});
