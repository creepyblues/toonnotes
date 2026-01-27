/**
 * Goal Nudge Scheduler - AI Goal-Agent System
 *
 * Manages nudge cadence for active goals:
 * - Scheduled proactive nudges with back-off
 * - Channel escalation (toast → sheet → notification)
 * - Max 3 nudges per goal per day
 * - Respects quiet hours
 *
 * For passive goals, nudges are triggered on note_accessed/note_updated
 * events via the trigger engine, not by this scheduler.
 */

import { useGoalStore } from '@/stores/goalStore';
import { useNudgeStore, NudgeActions } from '@/stores/nudgeStore';
import { NoteGoal, ActionStep, NudgeDeliveryChannel } from '@/types';
import { trackEvent } from './firebaseAnalytics';

// ============================================
// Constants
// ============================================

const MAX_NUDGES_PER_DAY = 3;
const QUIET_HOUR_START = 22; // 10 PM
const QUIET_HOUR_END = 8;   // 8 AM
const CHECK_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
const PASSIVE_STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ============================================
// Helpers
// ============================================

function isQuietHours(): boolean {
  const hour = new Date().getHours();
  return hour >= QUIET_HOUR_START || hour < QUIET_HOUR_END;
}

function getNudgesTodayCount(goal: NoteGoal): number {
  // Count nudges sent today by checking steps' lastNudgedAt timestamps
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayMs = todayStart.getTime();
  return goal.steps.filter(
    (s) => s.lastNudgedAt && s.lastNudgedAt >= todayMs
  ).length;
}

function getDeliveryChannel(goal: NoteGoal): NudgeDeliveryChannel {
  if (goal.consecutiveDismissals >= 4) return 'notification';
  if (goal.consecutiveDismissals >= 2) return 'sheet';
  return 'toast';
}

function getCurrentStep(goal: NoteGoal): ActionStep | undefined {
  return goal.steps.find((s) => s.status === 'pending' || s.status === 'in_progress');
}

// ============================================
// Scheduler
// ============================================

class GoalNudgeScheduler {
  private static instance: GoalNudgeScheduler;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private running = false;

  private constructor() {}

  static getInstance(): GoalNudgeScheduler {
    if (!GoalNudgeScheduler.instance) {
      GoalNudgeScheduler.instance = new GoalNudgeScheduler();
    }
    return GoalNudgeScheduler.instance;
  }

  /**
   * Start the scheduler. Call on app startup.
   */
  start(): void {
    if (this.running) return;
    this.running = true;

    console.log('[GoalNudgeScheduler] Starting');

    // Check immediately on start
    this.evaluateActiveGoals();

    // Check every 30 minutes
    this.intervalId = setInterval(() => {
      try {
        this.evaluateActiveGoals();
      } catch (error) {
        console.error('[GoalNudgeScheduler] Error in interval:', error);
      }
    }, CHECK_INTERVAL_MS);
  }

  /**
   * Stop the scheduler.
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.running = false;
    console.log('[GoalNudgeScheduler] Stopped');
  }

  /**
   * Evaluate all active goals and send nudges where due.
   * Also called on app_opened events.
   */
  evaluateActiveGoals(): void {
    const goalStore = useGoalStore.getState();

    if (!goalStore.goalSuggestionsEnabled) return;
    if (isQuietHours()) return;

    const activeGoals = goalStore.getActiveGoals();
    const now = Date.now();

    for (const goal of activeGoals) {
      if (!goal.nextNudgeAt || goal.nextNudgeAt > now) continue;

      // Check daily limit
      if (getNudgesTodayCount(goal) >= MAX_NUDGES_PER_DAY) continue;

      // Get current step to nudge about
      const currentStep = getCurrentStep(goal);
      if (!currentStep) continue;

      // Send nudge
      this.sendGoalNudge(goal, currentStep);
    }
  }

  /**
   * Evaluate passive goals on note access.
   * Shows gentle reminder if current step has been pending > 7 days.
   */
  evaluatePassiveGoal(noteId: string): void {
    const goalStore = useGoalStore.getState();
    if (!goalStore.goalSuggestionsEnabled) return;

    const goal = goalStore.getGoalForNote(noteId);
    if (!goal || goal.nudgeEngagement !== 'passive' || goal.status !== 'active') return;

    const currentStep = getCurrentStep(goal);
    if (!currentStep) return;

    // Only nudge if step has been pending for > 7 days
    const stepAge = Date.now() - (currentStep.lastNudgedAt || goal.createdAt);
    if (stepAge < PASSIVE_STALE_THRESHOLD_MS) return;

    this.sendGoalNudge(goal, currentStep);
  }

  /**
   * Send a nudge for a specific goal step
   */
  private sendGoalNudge(goal: NoteGoal, step: ActionStep): void {
    const channel = getDeliveryChannel(goal);
    const completedCount = goal.steps.filter((s) => s.status === 'completed').length;
    const totalCount = goal.steps.length;

    useNudgeStore.getState().addNudge({
      skillId: `goal-step-${goal.id}`,
      agentId: goal.agentId,
      noteId: goal.noteId,
      title: step.title,
      body: step.description,
      priority: goal.nudgeEngagement === 'active' ? 'medium' : 'low',
      deliveryChannel: channel,
      options: [
        {
          id: 'complete-step',
          label: 'Done',
          action: {
            type: 'complete_step',
            noteId: goal.noteId,
            goalId: goal.id,
            stepId: step.id,
          },
          isPrimary: true,
        },
        ...(goal.nudgeEngagement === 'active'
          ? [{
              id: 'snooze',
              label: 'Later',
              action: NudgeActions.snooze(4),
              isPrimary: false,
            }]
          : []),
        {
          id: 'feedback',
          label: 'Feedback',
          action: {
            type: 'custom' as const,
            handler: 'open_goal_feedback',
            data: { noteId: goal.noteId, goalId: goal.id },
          },
          isPrimary: false,
        },
      ],
    });

    // Update nudge tracking
    const goalStore = useGoalStore.getState();
    goalStore.recordNudgeSent(goal.noteId);

    // Update step status and nudge metadata
    goalStore.updateStepStatus(goal.noteId, step.id, 'in_progress');
    // Update step's lastNudgedAt and nudgeCount
    goalStore.updateStepNudgeTracking(goal.noteId, step.id);

    // Schedule next nudge
    const nextNudgeAt = Date.now() + goal.nudgeCadenceMs;
    goalStore.updateNextNudgeAt(goal.noteId, nextNudgeAt);

    trackEvent('goal_nudge_sent', {
      note_id: goal.noteId,
      goal_id: goal.id,
      step_id: step.id,
      step_order: step.order,
      channel,
      engagement: goal.nudgeEngagement,
      progress: `${completedCount}/${totalCount}`,
    });

    console.log(
      `[GoalNudgeScheduler] Nudge sent: "${step.title}" (${completedCount}/${totalCount}) via ${channel}`
    );
  }
}

// Export singleton
export const goalNudgeScheduler = GoalNudgeScheduler.getInstance();
