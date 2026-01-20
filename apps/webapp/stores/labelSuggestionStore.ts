'use client';

/**
 * Label Suggestion Store (Webapp)
 *
 * Manages the state for auto-labeling suggestions:
 * - Pending suggestions awaiting user review
 * - Auto-apply toast state
 * - Analysis in progress tracking
 */

import { create } from 'zustand';
import { v4 as generateUUID } from 'uuid';
import type {
  PendingSuggestion,
  AutoApplyToast,
  ToastType,
  ValidatedMatchedLabel,
  ValidatedSuggestedNewLabel,
  CUSTOM_DESIGN_FREE_QUOTA,
  CUSTOM_DESIGN_COST,
} from '@toonnotes/label-ai';

// ============================================
// Store State
// ============================================

interface LabelSuggestionState {
  // Pending suggestions per note
  pendingSuggestions: Record<string, PendingSuggestion[]>;

  // Auto-apply toast state
  activeToast: AutoApplyToast | null;

  // Analysis state
  isAnalyzing: boolean;
  analyzingNoteId: string | null;

  // Actions
  setPendingSuggestions: (noteId: string, suggestions: PendingSuggestion[]) => void;
  addSuggestion: (noteId: string, suggestion: PendingSuggestion) => void;
  acceptSuggestion: (noteId: string, suggestionId: string) => void;
  declineSuggestion: (noteId: string, suggestionId: string) => void;
  declineAllSuggestions: (noteId: string) => void;
  clearSuggestions: (noteId: string) => void;
  getSuggestionsForNote: (noteId: string) => PendingSuggestion[];

  // Toast actions
  showAutoApplyToast: (noteId: string, labels: string[]) => void;
  showSuggestionToast: (noteId: string, labels: string[]) => void;
  showErrorToast: (noteId: string, error: { message: string; code: number | null }) => void;
  hideAutoApplyToast: () => void;
  undoAutoApply: () => void;
  confirmAutoApply: () => string[];

  // Analysis actions
  setAnalyzing: (isAnalyzing: boolean, noteId?: string | null) => void;
}

// Toast duration in milliseconds (3 seconds)
const TOAST_DURATION_MS = 3000;
const ERROR_TOAST_DURATION_MS = 5000;

// ============================================
// Store
// ============================================

export const useLabelSuggestionStore = create<LabelSuggestionState>()((set, get) => ({
  pendingSuggestions: {},
  activeToast: null,
  isAnalyzing: false,
  analyzingNoteId: null,

  // Suggestion management
  setPendingSuggestions: (noteId, suggestions) => {
    set((state) => ({
      pendingSuggestions: {
        ...state.pendingSuggestions,
        [noteId]: suggestions,
      },
    }));
  },

  addSuggestion: (noteId, suggestion) => {
    set((state) => ({
      pendingSuggestions: {
        ...state.pendingSuggestions,
        [noteId]: [...(state.pendingSuggestions[noteId] || []), suggestion],
      },
    }));
  },

  acceptSuggestion: (noteId, suggestionId) => {
    set((state) => ({
      pendingSuggestions: {
        ...state.pendingSuggestions,
        [noteId]: (state.pendingSuggestions[noteId] || []).map((s) =>
          s.id === suggestionId ? { ...s, status: 'accepted' as const } : s
        ),
      },
    }));
  },

  declineSuggestion: (noteId, suggestionId) => {
    set((state) => ({
      pendingSuggestions: {
        ...state.pendingSuggestions,
        [noteId]: (state.pendingSuggestions[noteId] || []).map((s) =>
          s.id === suggestionId ? { ...s, status: 'declined' as const } : s
        ),
      },
    }));
  },

  declineAllSuggestions: (noteId) => {
    set((state) => ({
      pendingSuggestions: {
        ...state.pendingSuggestions,
        [noteId]: (state.pendingSuggestions[noteId] || []).map((s) => ({
          ...s,
          status: 'declined' as const,
        })),
      },
    }));
  },

  clearSuggestions: (noteId) => {
    set((state) => {
      const newSuggestions = { ...state.pendingSuggestions };
      delete newSuggestions[noteId];
      return { pendingSuggestions: newSuggestions };
    });
  },

  getSuggestionsForNote: (noteId) => {
    return get().pendingSuggestions[noteId] || [];
  },

  // Toast actions
  showAutoApplyToast: (noteId, labels) => {
    set({
      activeToast: {
        noteId,
        labels,
        expiresAt: Date.now() + TOAST_DURATION_MS,
        undone: false,
        type: 'auto-apply',
      },
    });
  },

  showSuggestionToast: (noteId, labels) => {
    // Suggestion toasts don't auto-dismiss - user must accept or decline
    set({
      activeToast: {
        noteId,
        labels,
        expiresAt: 0, // No expiration for suggestions
        undone: false,
        type: 'suggestion',
      },
    });
  },

  showErrorToast: (noteId, error) => {
    set({
      activeToast: {
        noteId,
        labels: [],
        expiresAt: Date.now() + ERROR_TOAST_DURATION_MS,
        undone: false,
        error,
      },
    });
  },

  hideAutoApplyToast: () => {
    set({ activeToast: null });
  },

  undoAutoApply: () => {
    set((state) => ({
      activeToast: state.activeToast
        ? { ...state.activeToast, undone: true }
        : null,
    }));
  },

  confirmAutoApply: () => {
    const { activeToast } = get();
    if (!activeToast || activeToast.undone) {
      set({ activeToast: null });
      return [];
    }

    const labels = activeToast.labels;
    set({ activeToast: null });
    return labels;
  },

  // Analysis actions
  setAnalyzing: (isAnalyzing, noteId = null) => {
    set({ isAnalyzing, analyzingNoteId: noteId });
  },
}));

// ============================================
// Helper Functions
// ============================================

/**
 * Create PendingSuggestions from analysis results
 */
export function createPendingSuggestions(
  noteId: string,
  matchedLabels: ValidatedMatchedLabel[],
  suggestedNewLabels: ValidatedSuggestedNewLabel[]
): PendingSuggestion[] {
  const suggestions: PendingSuggestion[] = [];

  // Add matched labels
  for (const match of matchedLabels) {
    suggestions.push({
      id: generateUUID(),
      noteId,
      labelName: match.labelName,
      isNewLabel: false,
      confidence: match.confidence,
      reason: match.reason,
      status: 'pending',
    });
  }

  // Add suggested new labels
  for (const newLabel of suggestedNewLabels) {
    suggestions.push({
      id: generateUUID(),
      noteId,
      labelName: newLabel.name,
      isNewLabel: true,
      confidence: 0.7, // New labels get medium-high confidence
      reason: newLabel.reason,
      category: newLabel.category,
      status: 'pending',
    });
  }

  return suggestions;
}

/**
 * Get accepted suggestions from a note
 */
export function getAcceptedSuggestions(
  suggestions: PendingSuggestion[]
): PendingSuggestion[] {
  return suggestions.filter((s) => s.status === 'accepted');
}

/**
 * Check if all suggestions have been handled (accepted or declined)
 */
export function areAllSuggestionsHandled(
  suggestions: PendingSuggestion[]
): boolean {
  return suggestions.every((s) => s.status !== 'pending');
}
