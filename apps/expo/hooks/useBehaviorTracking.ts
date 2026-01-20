/**
 * Behavior Tracking Hook - MODE Framework v2.0
 *
 * Integrates behavior learner with app state for automatic
 * pattern detection and outcome tracking.
 */

import { useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useNudgeStore } from '@/stores/nudgeStore';
import { behaviorLearner, UserEvent, NudgeOutcome } from '@/services/behaviorLearner';
import type { Mode, NoteBehavior } from '@/types';

// ============================================
// Hook: useBehaviorTracking
// ============================================

/**
 * Initialize behavior tracking on app startup
 */
export function useBehaviorTracking() {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;

    const initialize = async () => {
      await behaviorLearner.initialize();
      isInitialized.current = true;

      // Track app opened
      behaviorLearner.trackEvent({
        type: 'app_opened',
        timestamp: Date.now(),
      });
    };

    initialize();

    // Track app state changes
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        behaviorLearner.trackEvent({
          type: 'app_opened',
          timestamp: Date.now(),
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
}

// ============================================
// Hook: useNudgeOutcomeTracking
// ============================================

/**
 * Track nudge outcomes and update behavior learner
 */
export function useNudgeOutcomeTracking() {
  const history = useNudgeStore((state) => state.history);
  const previousHistoryLength = useRef(history.length);

  useEffect(() => {
    // Check for new outcomes
    if (history.length > previousHistoryLength.current) {
      const newOutcomes = history.slice(0, history.length - previousHistoryLength.current);

      for (const nudge of newOutcomes) {
        if (nudge.outcome) {
          const outcome: NudgeOutcome = {
            nudgeId: nudge.id,
            skillId: nudge.skillId,
            agentId: nudge.agentId,
            outcome: nudge.outcome as 'accepted' | 'dismissed' | 'snoozed' | 'ignored',
            responseTimeMs: nudge.interactedAt && nudge.shownAt
              ? nudge.interactedAt - nudge.shownAt
              : undefined,
            timestamp: Date.now(),
          };

          behaviorLearner.recordNudgeOutcome(outcome);
        }
      }
    }

    previousHistoryLength.current = history.length;
  }, [history]);
}

// ============================================
// Hook: useEventTracking
// ============================================

/**
 * Event tracking helpers for components
 */
export function useEventTracking() {
  const trackNoteCreated = useCallback((noteId: string, mode?: Mode, contentLength?: number, tags?: string[]) => {
    behaviorLearner.trackEvent({
      type: 'note_created',
      timestamp: Date.now(),
      metadata: { noteId, mode, contentLength, tags },
    });
  }, []);

  const trackNoteUpdated = useCallback((noteId: string, mode?: Mode, contentLength?: number, tags?: string[]) => {
    behaviorLearner.trackEvent({
      type: 'note_updated',
      timestamp: Date.now(),
      metadata: { noteId, mode, contentLength, tags },
    });
  }, []);

  const trackNoteViewed = useCallback((noteId: string, mode?: Mode) => {
    behaviorLearner.trackEvent({
      type: 'note_viewed',
      timestamp: Date.now(),
      metadata: { noteId, mode },
    });
  }, []);

  const trackModeChanged = useCallback((noteId: string, fromMode: Mode, toMode: Mode) => {
    behaviorLearner.trackEvent({
      type: 'mode_changed',
      timestamp: Date.now(),
      metadata: { noteId, fromMode, toMode },
    });
  }, []);

  const trackSkillTriggered = useCallback((skillId: string, agentId: string, noteId?: string) => {
    behaviorLearner.trackEvent({
      type: 'skill_triggered',
      timestamp: Date.now(),
      metadata: { skillId, agentId, noteId },
    });
  }, []);

  return {
    trackNoteCreated,
    trackNoteUpdated,
    trackNoteViewed,
    trackModeChanged,
    trackSkillTriggered,
  };
}

// ============================================
// Hook: useSkillConfidence
// ============================================

/**
 * Get skill confidence and suppression status
 */
export function useSkillConfidence(skillId: string) {
  const confidence = behaviorLearner.getSkillConfidence(skillId);
  const shouldSuppress = behaviorLearner.shouldSuppressSkill(skillId);
  const isFrequentlyDismissed = behaviorLearner.isSkillFrequentlyDismissed(skillId);

  return {
    confidence,
    shouldSuppress,
    isFrequentlyDismissed,
  };
}

// ============================================
// Hook: useUserPatterns
// ============================================

/**
 * Access learned user patterns
 */
export function useUserPatterns() {
  const patterns = behaviorLearner.getPatterns();

  const predictBestNudgeTime = useCallback((skillId: string) => {
    return behaviorLearner.predictBestTime(skillId);
  }, []);

  const preferredChannel = behaviorLearner.getPreferredChannel();

  return {
    patterns,
    predictBestNudgeTime,
    preferredChannel,
  };
}

// ============================================
// Hook: useJournalingReminder
// ============================================

/**
 * Get journaling time prediction for EXPERIENCE mode
 */
export function useJournalingReminder(behaviors: NoteBehavior[]) {
  const journalingTime = behaviorLearner.detectJournalingTime(behaviors);

  const isJournalingTime = useCallback(() => {
    if (!journalingTime) return false;
    const currentHour = new Date().getHours();
    // Within 1 hour of preferred time
    return Math.abs(currentHour - journalingTime) <= 1;
  }, [journalingTime]);

  return {
    journalingTime,
    isJournalingTime,
  };
}

export default useBehaviorTracking;
