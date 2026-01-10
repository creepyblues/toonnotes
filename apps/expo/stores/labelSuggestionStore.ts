/**
 * Label Suggestion Store
 *
 * Manages the state for auto-labeling suggestions:
 * - Pending suggestions awaiting user review
 * - Auto-apply toast state
 * - Suggestion sheet visibility
 * - Custom design economy tracking
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { debouncedStorage } from './debouncedStorage';
import { LabelSuggestion } from '@/types';
import {
  ValidatedMatchedLabel,
  ValidatedSuggestedNewLabel,
  ValidatedGeneratedLabelDesign,
} from '@/utils/validation/labelingResponse';
import { generateUUID } from '@/utils/uuid';
import {
  CUSTOM_DESIGN_FREE_QUOTA,
  CUSTOM_DESIGN_COST,
} from '@/services/labelingEngine';

// ============================================
// Types
// ============================================

export interface PendingSuggestion {
  id: string;
  noteId: string;
  labelName: string;
  isNewLabel: boolean;
  confidence: number;
  reason: string;
  category?: string;
  status: 'pending' | 'accepted' | 'declined';
  design?: ValidatedGeneratedLabelDesign; // Pre-generated design for new labels
}

export interface AutoApplyToast {
  noteId: string;
  labels: string[];
  expiresAt: number; // Timestamp when toast should auto-apply
  undone: boolean;
}

interface LabelSuggestionState {
  // Pending suggestions per note
  pendingSuggestions: Record<string, PendingSuggestion[]>;

  // Auto-apply toast state
  activeToast: AutoApplyToast | null;

  // Suggestion sheet state
  isSuggestionSheetOpen: boolean;
  suggestionSheetNoteId: string | null;

  // Economy tracking
  customDesignCount: number;

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
  hideAutoApplyToast: () => void;
  undoAutoApply: () => void;
  confirmAutoApply: () => string[]; // Returns labels to apply

  // Sheet actions
  openSuggestionSheet: (noteId: string) => void;
  closeSuggestionSheet: () => void;

  // Economy actions
  incrementCustomDesignCount: () => void;
  canAffordCustomDesign: (coinBalance: number) => boolean;
  getCustomDesignCost: () => number;
  getRemainingFreeDesigns: () => number;
}

// Toast duration in milliseconds (3 seconds)
const TOAST_DURATION_MS = 3000;

// ============================================
// Store
// ============================================

export const useLabelSuggestionStore = create<LabelSuggestionState>()(
  persist(
    (set, get) => ({
      pendingSuggestions: {},
      activeToast: null,
      isSuggestionSheetOpen: false,
      suggestionSheetNoteId: null,
      customDesignCount: 0,

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

      // Sheet actions
      openSuggestionSheet: (noteId) => {
        set({
          isSuggestionSheetOpen: true,
          suggestionSheetNoteId: noteId,
        });
      },

      closeSuggestionSheet: () => {
        set({
          isSuggestionSheetOpen: false,
          suggestionSheetNoteId: null,
        });
      },

      // Economy actions
      incrementCustomDesignCount: () => {
        set((state) => ({
          customDesignCount: state.customDesignCount + 1,
        }));
      },

      canAffordCustomDesign: (coinBalance) => {
        const { customDesignCount } = get();
        if (customDesignCount < CUSTOM_DESIGN_FREE_QUOTA) {
          return true;
        }
        return coinBalance >= CUSTOM_DESIGN_COST;
      },

      getCustomDesignCost: () => {
        const { customDesignCount } = get();
        if (customDesignCount < CUSTOM_DESIGN_FREE_QUOTA) {
          return 0;
        }
        return CUSTOM_DESIGN_COST;
      },

      getRemainingFreeDesigns: () => {
        const { customDesignCount } = get();
        return Math.max(0, CUSTOM_DESIGN_FREE_QUOTA - customDesignCount);
      },
    }),
    {
      name: 'toonnotes-label-suggestions',
      storage: createJSONStorage(() => debouncedStorage),
      // Only persist economy tracking, not transient UI state
      partialize: (state) => ({
        customDesignCount: state.customDesignCount,
      }),
    }
  )
);

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

/**
 * Check if any suggestions were accepted
 */
export function hasAcceptedSuggestions(
  suggestions: PendingSuggestion[]
): boolean {
  return suggestions.some((s) => s.status === 'accepted');
}

/**
 * Check if all suggestions were declined
 */
export function wereAllSuggestionsDeclined(
  suggestions: PendingSuggestion[]
): boolean {
  return suggestions.length > 0 && suggestions.every((s) => s.status === 'declined');
}
