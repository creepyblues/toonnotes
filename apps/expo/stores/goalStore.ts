/**
 * Goal Store - AI Goal-Agent System
 *
 * Manages NoteGoal state with AsyncStorage persistence.
 * Tracks AI-inferred goals, action steps, engagement levels,
 * and scheduling data for proactive nudges.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { debouncedStorage } from './debouncedStorage';
import {
  NoteGoal,
  ActionStep,
  ActionStepStatus,
  GoalStatus,
} from '@/types';
import { trackEvent } from '@/services/firebaseAnalytics';

// ============================================
// Types
// ============================================

interface GoalMetrics {
  totalGoalsCreated: number;
  totalGoalsAchieved: number;
  totalGoalsAbandoned: number;
  totalGoalsPaused: number;
  totalGoalsRegenerated: number;
  totalStepsCompleted: number;
  totalStepsPending: number;
  averageConfidence: number;
  engagementDistribution: { active: number; passive: number; none: number };
}

interface AccuracyReport {
  completionRate: number;
  stepCompletionRate: number;
  averageConfidence: number;
}

interface GoalStoreState {
  /** All goals keyed by noteId */
  goals: Record<string, NoteGoal>;

  /** Notes that AI classified as 'none' (no goal needed) */
  noGoalNotes: Record<string, { analyzedAt: number; contentHash: string }>;

  /** Whether AI goal suggestions are enabled */
  goalSuggestionsEnabled: boolean;

  /** Aggregate accuracy metrics */
  goalMetrics: GoalMetrics;
}

interface GoalStoreActions {
  // CRUD
  setGoal: (goal: NoteGoal) => void;
  removeGoal: (noteId: string) => void;
  getGoalForNote: (noteId: string) => NoteGoal | undefined;

  // No-goal tracking
  markAsNoGoal: (noteId: string, contentHash: string) => void;
  isNoGoalNote: (noteId: string) => boolean;
  clearNoGoalFlag: (noteId: string) => void;

  // Step management
  updateStepStatus: (noteId: string, stepId: string, status: ActionStepStatus) => void;
  updateStepNudgeTracking: (noteId: string, stepId: string) => void;
  completeStep: (noteId: string, stepId: string) => void;
  skipStep: (noteId: string, stepId: string) => void;

  // Goal status
  updateGoalStatus: (noteId: string, status: GoalStatus) => void;
  pauseGoal: (noteId: string) => void;
  resumeGoal: (noteId: string) => void;
  achieveGoal: (noteId: string) => void;
  abandonGoal: (noteId: string) => void;

  // Nudge tracking (active goals only)
  recordNudgeSent: (noteId: string) => void;
  recordNudgeDismissal: (noteId: string) => void;
  resetNudgeCadence: (noteId: string) => void;
  updateNextNudgeAt: (noteId: string, timestamp: number) => void;

  // Confidence tracking
  updateConfidence: (noteId: string, delta: number, reason: string) => void;

  // Settings
  setGoalSuggestionsEnabled: (enabled: boolean) => void;

  // Helpers
  getActiveGoals: () => NoteGoal[];
  getPassiveGoals: () => NoteGoal[];
  getCompletedStepCount: (noteId: string) => number;
  getTotalStepCount: (noteId: string) => number;
  getCurrentStep: (noteId: string) => ActionStep | undefined;
  getAccuracyReport: () => AccuracyReport;
}

// ============================================
// Constants
// ============================================

const DEFAULT_NUDGE_CADENCE_MS = 4 * 60 * 60 * 1000; // 4 hours
const MAX_NUDGE_CADENCE_MS = 48 * 60 * 60 * 1000; // 48 hours

// ============================================
// Store
// ============================================

export const useGoalStore = create<GoalStoreState & GoalStoreActions>()(
  persist(
    (set, get) => ({
      // State
      goals: {},
      noGoalNotes: {},
      goalSuggestionsEnabled: true,
      goalMetrics: {
        totalGoalsCreated: 0,
        totalGoalsAchieved: 0,
        totalGoalsAbandoned: 0,
        totalGoalsPaused: 0,
        totalGoalsRegenerated: 0,
        totalStepsCompleted: 0,
        totalStepsPending: 0,
        averageConfidence: 50,
        engagementDistribution: { active: 0, passive: 0, none: 0 },
      },

      // CRUD
      setGoal: (goal) => {
        set((state) => {
          const isNew = !state.goals[goal.noteId];
          const isRegeneration = !isNew && state.goals[goal.noteId].revision < goal.revision;
          const metrics = { ...state.goalMetrics };

          if (isNew) {
            metrics.totalGoalsCreated++;
            metrics.totalStepsPending += goal.steps.filter((s) => s.status !== 'completed').length;
            if (goal.nudgeEngagement === 'active') metrics.engagementDistribution.active++;
            else if (goal.nudgeEngagement === 'passive') metrics.engagementDistribution.passive++;
            else metrics.engagementDistribution.none++;
          }
          if (isRegeneration) {
            metrics.totalGoalsRegenerated++;
          }

          return {
            goals: { ...state.goals, [goal.noteId]: goal },
            goalMetrics: metrics,
            // Clear no-goal flag if it existed
            noGoalNotes: (() => {
              const { [goal.noteId]: _, ...rest } = state.noGoalNotes;
              return rest;
            })(),
          };
        });
      },

      removeGoal: (noteId) => {
        set((state) => {
          const { [noteId]: _, ...rest } = state.goals;
          return { goals: rest };
        });
      },

      getGoalForNote: (noteId) => {
        return get().goals[noteId];
      },

      // No-goal tracking
      markAsNoGoal: (noteId, contentHash) => {
        set((state) => ({
          noGoalNotes: {
            ...state.noGoalNotes,
            [noteId]: { analyzedAt: Date.now(), contentHash },
          },
        }));
      },

      isNoGoalNote: (noteId) => {
        return noteId in get().noGoalNotes;
      },

      clearNoGoalFlag: (noteId) => {
        set((state) => {
          const { [noteId]: _, ...rest } = state.noGoalNotes;
          return { noGoalNotes: rest };
        });
      },

      // Step management
      updateStepStatus: (noteId, stepId, status) => {
        set((state) => {
          const goal = state.goals[noteId];
          if (!goal) return state;

          const steps = goal.steps.map((s) =>
            s.id === stepId
              ? {
                  ...s,
                  status,
                  completedAt: status === 'completed' ? Date.now() : s.completedAt,
                }
              : s
          );

          return {
            goals: {
              ...state.goals,
              [noteId]: { ...goal, steps, updatedAt: Date.now() },
            },
          };
        });
      },

      updateStepNudgeTracking: (noteId, stepId) => {
        set((state) => {
          const goal = state.goals[noteId];
          if (!goal) return state;

          const steps = goal.steps.map((s) =>
            s.id === stepId
              ? { ...s, lastNudgedAt: Date.now(), nudgeCount: s.nudgeCount + 1 }
              : s
          );

          return {
            goals: {
              ...state.goals,
              [noteId]: { ...goal, steps },
            },
          };
        });
      },

      completeStep: (noteId, stepId) => {
        get().updateStepStatus(noteId, stepId, 'completed');
        get().updateConfidence(noteId, 10, 'step_completed');

        // Update metrics
        set((state) => ({
          goalMetrics: {
            ...state.goalMetrics,
            totalStepsCompleted: state.goalMetrics.totalStepsCompleted + 1,
            totalStepsPending: Math.max(0, state.goalMetrics.totalStepsPending - 1),
          },
        }));

        // Check if all steps are complete
        const goal = get().goals[noteId];
        if (goal) {
          const allComplete = goal.steps.every(
            (s) => s.status === 'completed' || s.status === 'skipped'
          );
          if (allComplete) {
            get().achieveGoal(noteId);
          }
        }
      },

      skipStep: (noteId, stepId) => {
        get().updateStepStatus(noteId, stepId, 'skipped');
      },

      // Goal status
      updateGoalStatus: (noteId, status) => {
        set((state) => {
          const goal = state.goals[noteId];
          if (!goal) return state;

          return {
            goals: {
              ...state.goals,
              [noteId]: {
                ...goal,
                status,
                updatedAt: Date.now(),
                achievedAt: status === 'achieved' ? Date.now() : goal.achievedAt,
              },
            },
          };
        });
      },

      pauseGoal: (noteId) => {
        get().updateGoalStatus(noteId, 'paused');
        get().updateConfidence(noteId, -10, 'goal_paused');
        set((state) => ({
          goalMetrics: { ...state.goalMetrics, totalGoalsPaused: state.goalMetrics.totalGoalsPaused + 1 },
        }));
      },
      resumeGoal: (noteId) => {
        get().updateGoalStatus(noteId, 'active');
        get().updateConfidence(noteId, 5, 'goal_resumed');
      },
      achieveGoal: (noteId) => {
        get().updateGoalStatus(noteId, 'achieved');
        get().updateConfidence(noteId, 20, 'goal_achieved');
        set((state) => ({
          goalMetrics: { ...state.goalMetrics, totalGoalsAchieved: state.goalMetrics.totalGoalsAchieved + 1 },
        }));
      },
      abandonGoal: (noteId) => {
        get().updateGoalStatus(noteId, 'abandoned');
        get().updateConfidence(noteId, -30, 'goal_abandoned');
        set((state) => ({
          goalMetrics: { ...state.goalMetrics, totalGoalsAbandoned: state.goalMetrics.totalGoalsAbandoned + 1 },
        }));
      },

      // Nudge tracking
      recordNudgeSent: (noteId) => {
        set((state) => {
          const goal = state.goals[noteId];
          if (!goal) return state;

          return {
            goals: {
              ...state.goals,
              [noteId]: {
                ...goal,
                totalNudgesSent: goal.totalNudgesSent + 1,
                updatedAt: Date.now(),
              },
            },
          };
        });
      },

      recordNudgeDismissal: (noteId) => {
        set((state) => {
          const goal = state.goals[noteId];
          if (!goal) return state;

          const newDismissals = goal.consecutiveDismissals + 1;
          // Back-off: double cadence after 2 consecutive dismissals
          const newCadence =
            newDismissals >= 2
              ? Math.min(goal.nudgeCadenceMs * 2, MAX_NUDGE_CADENCE_MS)
              : goal.nudgeCadenceMs;

          return {
            goals: {
              ...state.goals,
              [noteId]: {
                ...goal,
                consecutiveDismissals: newDismissals,
                nudgeCadenceMs: newCadence,
                updatedAt: Date.now(),
              },
            },
          };
        });

        // Confidence penalty for 3+ consecutive dismissals
        const goal = get().goals[noteId];
        if (goal && goal.consecutiveDismissals >= 3) {
          get().updateConfidence(noteId, -5, 'consecutive_dismissals');
        }
      },

      resetNudgeCadence: (noteId) => {
        set((state) => {
          const goal = state.goals[noteId];
          if (!goal) return state;

          return {
            goals: {
              ...state.goals,
              [noteId]: {
                ...goal,
                consecutiveDismissals: 0,
                nudgeCadenceMs: DEFAULT_NUDGE_CADENCE_MS,
                updatedAt: Date.now(),
              },
            },
          };
        });
      },

      updateNextNudgeAt: (noteId, timestamp) => {
        set((state) => {
          const goal = state.goals[noteId];
          if (!goal) return state;

          return {
            goals: {
              ...state.goals,
              [noteId]: { ...goal, nextNudgeAt: timestamp },
            },
          };
        });
      },

      // Confidence tracking
      updateConfidence: (noteId, delta, reason) => {
        set((state) => {
          const goal = state.goals[noteId];
          if (!goal) return state;

          const oldScore = goal.confidenceScore ?? 50;
          const newScore = Math.max(0, Math.min(100, oldScore + delta));

          trackEvent('goal_confidence_changed', {
            note_id: noteId,
            old_score: oldScore,
            new_score: newScore,
            reason,
          });

          // Recompute average confidence across active goals
          const allGoals = Object.values(state.goals);
          const activeGoals = allGoals.filter((g) => g.status === 'active');
          const totalConfidence = activeGoals.reduce(
            (sum, g) => sum + (g.noteId === noteId ? newScore : (g.confidenceScore ?? 50)),
            0
          );
          const avgConfidence = activeGoals.length > 0 ? Math.round(totalConfidence / activeGoals.length) : 50;

          return {
            goals: {
              ...state.goals,
              [noteId]: { ...goal, confidenceScore: newScore, updatedAt: Date.now() },
            },
            goalMetrics: { ...state.goalMetrics, averageConfidence: avgConfidence },
          };
        });
      },

      // Settings
      setGoalSuggestionsEnabled: (enabled) => {
        set({ goalSuggestionsEnabled: enabled });
      },

      // Helpers
      getActiveGoals: () => {
        return Object.values(get().goals).filter(
          (g) => g.nudgeEngagement === 'active' && g.status === 'active'
        );
      },

      getPassiveGoals: () => {
        return Object.values(get().goals).filter(
          (g) => g.nudgeEngagement === 'passive' && g.status === 'active'
        );
      },

      getCompletedStepCount: (noteId) => {
        const goal = get().goals[noteId];
        if (!goal) return 0;
        return goal.steps.filter((s) => s.status === 'completed').length;
      },

      getTotalStepCount: (noteId) => {
        const goal = get().goals[noteId];
        if (!goal) return 0;
        return goal.steps.length;
      },

      getCurrentStep: (noteId) => {
        const goal = get().goals[noteId];
        if (!goal) return undefined;
        return goal.steps.find(
          (s) => s.status === 'pending' || s.status === 'in_progress'
        );
      },

      getAccuracyReport: () => {
        const { goalMetrics } = get();
        const achieved = goalMetrics.totalGoalsAchieved;
        const abandoned = goalMetrics.totalGoalsAbandoned;
        const completionRate = (achieved + abandoned) > 0 ? achieved / (achieved + abandoned) : 0;

        const stepsCompleted = goalMetrics.totalStepsCompleted;
        const stepsPending = goalMetrics.totalStepsPending;
        const stepCompletionRate = (stepsCompleted + stepsPending) > 0
          ? stepsCompleted / (stepsCompleted + stepsPending)
          : 0;

        return {
          completionRate,
          stepCompletionRate,
          averageConfidence: goalMetrics.averageConfidence,
        };
      },
    }),
    {
      name: 'goal-store',
      storage: createJSONStorage(() => debouncedStorage),
    }
  )
);
