/**
 * Unit Tests for labelSuggestionStore
 *
 * Tests suggestion management, toast state, economy tracking,
 * and helper functions for label suggestions.
 */

import {
  useLabelSuggestionStore,
  createPendingSuggestions,
  getAcceptedSuggestions,
  areAllSuggestionsHandled,
  hasAcceptedSuggestions,
  wereAllSuggestionsDeclined,
  PendingSuggestion,
} from '@/stores/labelSuggestionStore';

// Mock generateUUID to return predictable IDs
let mockUuidCounter = 0;
jest.mock('@/utils/uuid', () => ({
  generateUUID: jest.fn(() => `test-uuid-${++mockUuidCounter}`),
}));

// Mock labelingEngine constants
jest.mock('@/services/labelingEngine', () => ({
  CUSTOM_DESIGN_FREE_QUOTA: 3,
  CUSTOM_DESIGN_COST: 5,
}));

describe('labelSuggestionStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useLabelSuggestionStore.setState({
      pendingSuggestions: {},
      activeToast: null,
      isSuggestionSheetOpen: false,
      suggestionSheetNoteId: null,
      customDesignCount: 0,
    });
    mockUuidCounter = 0;
  });

  describe('Suggestion Management', () => {
    it('should set pending suggestions for a note', () => {
      const store = useLabelSuggestionStore.getState();
      const suggestions: PendingSuggestion[] = [
        {
          id: 'sug-1',
          noteId: 'note-1',
          labelName: 'anime',
          isNewLabel: false,
          confidence: 0.9,
          reason: 'Matches content',
          status: 'pending',
        },
      ];

      store.setPendingSuggestions('note-1', suggestions);

      const result = store.getSuggestionsForNote('note-1');
      expect(result).toHaveLength(1);
      expect(result[0].labelName).toBe('anime');
    });

    it('should add suggestion to existing list', () => {
      const store = useLabelSuggestionStore.getState();
      store.setPendingSuggestions('note-1', [
        {
          id: 'sug-1',
          noteId: 'note-1',
          labelName: 'anime',
          isNewLabel: false,
          confidence: 0.9,
          reason: 'Matches content',
          status: 'pending',
        },
      ]);

      store.addSuggestion('note-1', {
        id: 'sug-2',
        noteId: 'note-1',
        labelName: 'manga',
        isNewLabel: false,
        confidence: 0.8,
        reason: 'Related to anime',
        status: 'pending',
      });

      const result = store.getSuggestionsForNote('note-1');
      expect(result).toHaveLength(2);
    });

    it('should accept suggestion', () => {
      const store = useLabelSuggestionStore.getState();
      store.setPendingSuggestions('note-1', [
        {
          id: 'sug-1',
          noteId: 'note-1',
          labelName: 'anime',
          isNewLabel: false,
          confidence: 0.9,
          reason: 'Test',
          status: 'pending',
        },
      ]);

      store.acceptSuggestion('note-1', 'sug-1');

      const result = store.getSuggestionsForNote('note-1');
      expect(result[0].status).toBe('accepted');
    });

    it('should decline suggestion', () => {
      const store = useLabelSuggestionStore.getState();
      store.setPendingSuggestions('note-1', [
        {
          id: 'sug-1',
          noteId: 'note-1',
          labelName: 'anime',
          isNewLabel: false,
          confidence: 0.9,
          reason: 'Test',
          status: 'pending',
        },
      ]);

      store.declineSuggestion('note-1', 'sug-1');

      const result = store.getSuggestionsForNote('note-1');
      expect(result[0].status).toBe('declined');
    });

    it('should decline all suggestions', () => {
      const store = useLabelSuggestionStore.getState();
      store.setPendingSuggestions('note-1', [
        { id: 'sug-1', noteId: 'note-1', labelName: 'anime', isNewLabel: false, confidence: 0.9, reason: 'Test', status: 'pending' },
        { id: 'sug-2', noteId: 'note-1', labelName: 'manga', isNewLabel: false, confidence: 0.8, reason: 'Test', status: 'pending' },
      ]);

      store.declineAllSuggestions('note-1');

      const result = store.getSuggestionsForNote('note-1');
      expect(result.every((s) => s.status === 'declined')).toBe(true);
    });

    it('should clear suggestions for a note', () => {
      const store = useLabelSuggestionStore.getState();
      store.setPendingSuggestions('note-1', [
        { id: 'sug-1', noteId: 'note-1', labelName: 'anime', isNewLabel: false, confidence: 0.9, reason: 'Test', status: 'pending' },
      ]);

      store.clearSuggestions('note-1');

      const result = store.getSuggestionsForNote('note-1');
      expect(result).toHaveLength(0);
    });

    it('should return empty array for non-existent note', () => {
      const store = useLabelSuggestionStore.getState();
      const result = store.getSuggestionsForNote('non-existent');
      expect(result).toHaveLength(0);
    });
  });

  describe('Toast Actions', () => {
    it('should show auto-apply toast', () => {
      const store = useLabelSuggestionStore.getState();
      store.showAutoApplyToast('note-1', ['anime', 'manga']);

      const state = useLabelSuggestionStore.getState();
      expect(state.activeToast).not.toBeNull();
      expect(state.activeToast?.noteId).toBe('note-1');
      expect(state.activeToast?.labels).toEqual(['anime', 'manga']);
      expect(state.activeToast?.undone).toBe(false);
    });

    it('should hide auto-apply toast', () => {
      const store = useLabelSuggestionStore.getState();
      store.showAutoApplyToast('note-1', ['anime']);
      store.hideAutoApplyToast();

      const state = useLabelSuggestionStore.getState();
      expect(state.activeToast).toBeNull();
    });

    it('should undo auto-apply', () => {
      const store = useLabelSuggestionStore.getState();
      store.showAutoApplyToast('note-1', ['anime']);
      store.undoAutoApply();

      const state = useLabelSuggestionStore.getState();
      expect(state.activeToast?.undone).toBe(true);
    });

    it('should confirm auto-apply and return labels', () => {
      const store = useLabelSuggestionStore.getState();
      store.showAutoApplyToast('note-1', ['anime', 'manga']);

      const labels = store.confirmAutoApply();

      expect(labels).toEqual(['anime', 'manga']);
      expect(useLabelSuggestionStore.getState().activeToast).toBeNull();
    });

    it('should return empty array if auto-apply was undone', () => {
      const store = useLabelSuggestionStore.getState();
      store.showAutoApplyToast('note-1', ['anime']);
      store.undoAutoApply();

      const labels = store.confirmAutoApply();

      expect(labels).toEqual([]);
    });

    it('should return empty array if no active toast', () => {
      const store = useLabelSuggestionStore.getState();
      const labels = store.confirmAutoApply();
      expect(labels).toEqual([]);
    });
  });

  describe('Sheet Actions', () => {
    it('should open suggestion sheet', () => {
      const store = useLabelSuggestionStore.getState();
      store.openSuggestionSheet('note-1');

      const state = useLabelSuggestionStore.getState();
      expect(state.isSuggestionSheetOpen).toBe(true);
      expect(state.suggestionSheetNoteId).toBe('note-1');
    });

    it('should close suggestion sheet', () => {
      const store = useLabelSuggestionStore.getState();
      store.openSuggestionSheet('note-1');
      store.closeSuggestionSheet();

      const state = useLabelSuggestionStore.getState();
      expect(state.isSuggestionSheetOpen).toBe(false);
      expect(state.suggestionSheetNoteId).toBeNull();
    });
  });

  describe('Economy Actions', () => {
    it('should increment custom design count', () => {
      const store = useLabelSuggestionStore.getState();
      store.incrementCustomDesignCount();
      store.incrementCustomDesignCount();

      expect(useLabelSuggestionStore.getState().customDesignCount).toBe(2);
    });

    it('should afford custom design when under free quota', () => {
      const store = useLabelSuggestionStore.getState();
      expect(store.canAffordCustomDesign(0)).toBe(true); // Free quota = 3
    });

    it('should require coins after free quota exhausted', () => {
      useLabelSuggestionStore.setState({ customDesignCount: 3 });
      const store = useLabelSuggestionStore.getState();

      expect(store.canAffordCustomDesign(0)).toBe(false);
      expect(store.canAffordCustomDesign(5)).toBe(true); // Cost = 5
      expect(store.canAffordCustomDesign(4)).toBe(false);
    });

    it('should return 0 cost when under free quota', () => {
      const store = useLabelSuggestionStore.getState();
      expect(store.getCustomDesignCost()).toBe(0);
    });

    it('should return coin cost after free quota', () => {
      useLabelSuggestionStore.setState({ customDesignCount: 3 });
      const store = useLabelSuggestionStore.getState();
      expect(store.getCustomDesignCost()).toBe(5);
    });

    it('should calculate remaining free designs', () => {
      const store = useLabelSuggestionStore.getState();
      expect(store.getRemainingFreeDesigns()).toBe(3);

      store.incrementCustomDesignCount();
      expect(useLabelSuggestionStore.getState().getRemainingFreeDesigns()).toBe(2);

      useLabelSuggestionStore.setState({ customDesignCount: 5 });
      expect(useLabelSuggestionStore.getState().getRemainingFreeDesigns()).toBe(0);
    });
  });
});

describe('Helper Functions', () => {
  beforeEach(() => {
    mockUuidCounter = 0;
  });

  describe('createPendingSuggestions', () => {
    it('should create suggestions from matched labels', () => {
      const suggestions = createPendingSuggestions(
        'note-1',
        [{ labelName: 'anime', confidence: 0.9, reason: 'Matches content' }],
        []
      );

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].labelName).toBe('anime');
      expect(suggestions[0].isNewLabel).toBe(false);
      expect(suggestions[0].confidence).toBe(0.9);
      expect(suggestions[0].status).toBe('pending');
    });

    it('should create suggestions from new label suggestions', () => {
      const suggestions = createPendingSuggestions(
        'note-1',
        [],
        [{ name: 'watchlist', category: 'media', reason: 'Good for tracking' }]
      );

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].labelName).toBe('watchlist');
      expect(suggestions[0].isNewLabel).toBe(true);
      expect(suggestions[0].confidence).toBe(0.7);
      expect(suggestions[0].category).toBe('media');
    });

    it('should combine matched and new labels', () => {
      const suggestions = createPendingSuggestions(
        'note-1',
        [{ labelName: 'anime', confidence: 0.9, reason: 'Match' }],
        [{ name: 'watchlist', category: 'media', reason: 'New' }]
      );

      expect(suggestions).toHaveLength(2);
    });
  });

  describe('getAcceptedSuggestions', () => {
    it('should filter accepted suggestions', () => {
      const suggestions: PendingSuggestion[] = [
        { id: '1', noteId: 'n1', labelName: 'a', isNewLabel: false, confidence: 0.9, reason: '', status: 'accepted' },
        { id: '2', noteId: 'n1', labelName: 'b', isNewLabel: false, confidence: 0.8, reason: '', status: 'declined' },
        { id: '3', noteId: 'n1', labelName: 'c', isNewLabel: false, confidence: 0.7, reason: '', status: 'pending' },
      ];

      const accepted = getAcceptedSuggestions(suggestions);
      expect(accepted).toHaveLength(1);
      expect(accepted[0].labelName).toBe('a');
    });
  });

  describe('areAllSuggestionsHandled', () => {
    it('should return true when all handled', () => {
      const suggestions: PendingSuggestion[] = [
        { id: '1', noteId: 'n1', labelName: 'a', isNewLabel: false, confidence: 0.9, reason: '', status: 'accepted' },
        { id: '2', noteId: 'n1', labelName: 'b', isNewLabel: false, confidence: 0.8, reason: '', status: 'declined' },
      ];

      expect(areAllSuggestionsHandled(suggestions)).toBe(true);
    });

    it('should return false when some pending', () => {
      const suggestions: PendingSuggestion[] = [
        { id: '1', noteId: 'n1', labelName: 'a', isNewLabel: false, confidence: 0.9, reason: '', status: 'accepted' },
        { id: '2', noteId: 'n1', labelName: 'b', isNewLabel: false, confidence: 0.8, reason: '', status: 'pending' },
      ];

      expect(areAllSuggestionsHandled(suggestions)).toBe(false);
    });
  });

  describe('hasAcceptedSuggestions', () => {
    it('should return true when at least one accepted', () => {
      const suggestions: PendingSuggestion[] = [
        { id: '1', noteId: 'n1', labelName: 'a', isNewLabel: false, confidence: 0.9, reason: '', status: 'accepted' },
        { id: '2', noteId: 'n1', labelName: 'b', isNewLabel: false, confidence: 0.8, reason: '', status: 'declined' },
      ];

      expect(hasAcceptedSuggestions(suggestions)).toBe(true);
    });

    it('should return false when none accepted', () => {
      const suggestions: PendingSuggestion[] = [
        { id: '1', noteId: 'n1', labelName: 'a', isNewLabel: false, confidence: 0.9, reason: '', status: 'declined' },
        { id: '2', noteId: 'n1', labelName: 'b', isNewLabel: false, confidence: 0.8, reason: '', status: 'pending' },
      ];

      expect(hasAcceptedSuggestions(suggestions)).toBe(false);
    });
  });

  describe('wereAllSuggestionsDeclined', () => {
    it('should return true when all declined', () => {
      const suggestions: PendingSuggestion[] = [
        { id: '1', noteId: 'n1', labelName: 'a', isNewLabel: false, confidence: 0.9, reason: '', status: 'declined' },
        { id: '2', noteId: 'n1', labelName: 'b', isNewLabel: false, confidence: 0.8, reason: '', status: 'declined' },
      ];

      expect(wereAllSuggestionsDeclined(suggestions)).toBe(true);
    });

    it('should return false when empty array', () => {
      expect(wereAllSuggestionsDeclined([])).toBe(false);
    });

    it('should return false when some not declined', () => {
      const suggestions: PendingSuggestion[] = [
        { id: '1', noteId: 'n1', labelName: 'a', isNewLabel: false, confidence: 0.9, reason: '', status: 'declined' },
        { id: '2', noteId: 'n1', labelName: 'b', isNewLabel: false, confidence: 0.8, reason: '', status: 'accepted' },
      ];

      expect(wereAllSuggestionsDeclined(suggestions)).toBe(false);
    });
  });
});
