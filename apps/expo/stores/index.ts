export { useNoteStore } from './noteStore';
export { useUserStore } from './userStore';
export { useDesignStore } from './designStore';
export { useAuthStore } from './authStore';
export { useBoardStore, computeBoardsFromNotes, deriveGradientFromColors } from './boardStore';
export { useBoardDesignStore } from './boardDesignStore';
export { useLabelStore } from './labelStore';
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

// MODE Framework v2.0 stores
export {
  useBehaviorStore,
  calculateUsefulnessScore,
  createDefaultBehavior,
  createDefaultManageData,
  createDefaultDevelopData,
  createDefaultOrganizeData,
  createDefaultExperienceData,
} from './behaviorStore';

export {
  useNudgeStore,
  NudgeBuilder,
  createNudge,
  NudgeActions,
} from './nudgeStore';

// Share status store
export { useShareStatusStore } from './shareStatusStore';
