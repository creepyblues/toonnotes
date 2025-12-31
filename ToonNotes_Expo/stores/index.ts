export { useNoteStore } from './noteStore';
export { useUserStore } from './userStore';
export { useDesignStore } from './designStore';
export { useBoardStore, computeBoardsFromNotes, deriveGradientFromColors } from './boardStore';
export { useBoardDesignStore } from './boardDesignStore';
export {
  useLabelSuggestionStore,
  createPendingSuggestions,
  getAcceptedSuggestions,
  areAllSuggestionsHandled,
  hasAcceptedSuggestions,
  wereAllSuggestionsDeclined,
  type PendingSuggestion,
  type AutoApplyToast,
} from './labelSuggestionStore';
