/**
 * useCoachMark Hook
 *
 * Simplified hook for triggering individual coach marks.
 * Use this in components that need to show a spotlight tooltip.
 */

import { useCallback } from 'react';
import { useUserStore } from '@/stores';
import { CoachMarkId, COACH_MARK_IDS } from '@/constants/onboardingConfig';

// ============================================================================
// Types
// ============================================================================

interface UseCoachMarkOptions {
  /** Callback when coach mark is dismissed */
  onDismiss?: () => void;
  /** Additional condition to check before showing */
  condition?: boolean;
}

interface UseCoachMarkReturn {
  /** Whether the coach mark should be shown */
  shouldShow: boolean;
  /** Mark the coach mark as seen */
  markAsSeen: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for managing a single coach mark
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { shouldShow, markAsSeen } = useCoachMark('designs-tab');
 *
 *   useEffect(() => {
 *     if (shouldShow) {
 *       // Show tooltip or modal
 *     }
 *   }, [shouldShow]);
 *
 *   return (
 *     <TouchableOpacity onPress={() => markAsSeen()}>
 *       <Text>Create Design</Text>
 *     </TouchableOpacity>
 *   );
 * }
 * ```
 */
export function useCoachMark(
  markId: CoachMarkId | string,
  options: UseCoachMarkOptions = {}
): UseCoachMarkReturn {
  const { onDismiss, condition = true } = options;

  const { onboarding, hasSeenCoachMark, markCoachMarkSeen } = useUserStore();

  // Check if we should show this coach mark
  const shouldShow =
    onboarding.hasCompletedWelcome &&
    !hasSeenCoachMark(markId) &&
    condition;

  // Mark as seen
  const markAsSeen = useCallback(() => {
    markCoachMarkSeen(markId);
    onDismiss?.();
  }, [markId, markCoachMarkSeen, onDismiss]);

  return {
    shouldShow,
    markAsSeen,
  };
}

// ============================================================================
// Specialized Hooks for Common Coach Marks
// ============================================================================

/**
 * Hook for the note editor coach marks sequence
 */
export function useEditorCoachMarks() {
  const { onboarding, hasSeenCoachMark, markCoachMarkSeen } = useUserStore();

  const isFirstNote = onboarding.notesCreatedCount === 0;

  return {
    /** Whether to show the title coach mark */
    showTitleMark:
      isFirstNote &&
      onboarding.hasCompletedWelcome &&
      !hasSeenCoachMark(COACH_MARK_IDS.NOTE_TITLE),

    /** Whether to show the content coach mark */
    showContentMark:
      isFirstNote &&
      hasSeenCoachMark(COACH_MARK_IDS.NOTE_TITLE) &&
      !hasSeenCoachMark(COACH_MARK_IDS.NOTE_CONTENT),

    /** Whether to show the editor modes coach mark */
    showModesMark:
      onboarding.notesCreatedCount >= 1 &&
      !hasSeenCoachMark(COACH_MARK_IDS.EDITOR_MODES),

    /** Mark title coach mark as seen */
    dismissTitleMark: () => markCoachMarkSeen(COACH_MARK_IDS.NOTE_TITLE),

    /** Mark content coach mark as seen */
    dismissContentMark: () => markCoachMarkSeen(COACH_MARK_IDS.NOTE_CONTENT),

    /** Mark modes coach mark as seen */
    dismissModesMark: () => markCoachMarkSeen(COACH_MARK_IDS.EDITOR_MODES),
  };
}

/**
 * Hook for the hashtag introduction coach mark
 */
export function useHashtagCoachMark() {
  const { onboarding, hasSeenCoachMark, markCoachMarkSeen } = useUserStore();

  return {
    /** Whether to show the hashtag coach mark */
    shouldShow:
      onboarding.hasCompletedWelcome &&
      !hasSeenCoachMark(COACH_MARK_IDS.HASHTAG_INTRO),

    /** Mark as seen */
    dismiss: () => markCoachMarkSeen(COACH_MARK_IDS.HASHTAG_INTRO),
  };
}

/**
 * Hook for the boards tab coach mark
 */
export function useBoardsTabCoachMark() {
  const { onboarding, hasSeenCoachMark, markCoachMarkSeen } = useUserStore();

  return {
    /** Whether to show on first visit to boards */
    shouldShow:
      onboarding.hasCompletedWelcome &&
      !hasSeenCoachMark(COACH_MARK_IDS.BOARDS_TAB),

    /** Mark as seen */
    dismiss: () => markCoachMarkSeen(COACH_MARK_IDS.BOARDS_TAB),
  };
}

/**
 * Hook for the designs tab coach mark
 */
export function useDesignsTabCoachMark() {
  const { onboarding, hasSeenCoachMark, markCoachMarkSeen } = useUserStore();

  return {
    /** Whether to show on first visit to designs */
    shouldShow:
      onboarding.hasCompletedWelcome &&
      !hasSeenCoachMark(COACH_MARK_IDS.DESIGNS_TAB),

    /** Mark as seen */
    dismiss: () => markCoachMarkSeen(COACH_MARK_IDS.DESIGNS_TAB),
  };
}

export { COACH_MARK_IDS };
