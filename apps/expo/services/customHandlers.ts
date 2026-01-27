/**
 * Custom Handlers - MODE Framework v2.0
 *
 * Registers custom action handlers for nudge options.
 * These handlers are invoked when users tap nudge buttons with
 * action type 'custom'.
 *
 * Handler registration should happen once at app startup.
 */

import { nudgeDeliveryService, ActionResult } from './nudgeDeliveryService';
import { useNoteStore } from '@/stores';
import { useBehaviorStore } from '@/stores/behaviorStore';
import { Nudge } from '@/types';

// Import skills to trigger their registration with skillRegistry
// These imports cause the skill files to execute, which calls skillRegistry.register()
import './skills/manager/deadlineSkill';
import './skills/manager/relevanceSkill';
import './skills/manager/decomposeSkill';
import './skills/manager/celebrateSkill';
import './skills/manager/prioritySkill';

// ============================================
// Handler Registration
// ============================================

let handlersRegistered = false;

/**
 * Register all custom handlers for nudge actions.
 * Call this once at app startup.
 */
export function registerCustomHandlers(): void {
  if (handlersRegistered) {
    console.log('[CustomHandlers] Already registered, skipping');
    return;
  }

  console.log('[CustomHandlers] Registering custom handlers...');

  // TEMP: Clear skill cooldowns for testing
  try {
    const { useNudgeStore } = require('@/stores/nudgeStore');
    const cooldowns = useNudgeStore.getState().skillCooldowns;
    console.log('[CustomHandlers] Current cooldowns:', Object.keys(cooldowns));
    // Clear all cooldowns
    Object.keys(cooldowns).forEach((skillId) => {
      useNudgeStore.getState().clearSkillCooldown(skillId);
    });
    console.log('[CustomHandlers] Cleared all skill cooldowns');
  } catch (e) {
    console.log('[CustomHandlers] Could not clear cooldowns:', e);
  }

  // ============================================
  // Manager Agent Handlers
  // ============================================

  /**
   * Handler: set_deadline_today
   * Sets the deadline field on a note to today's date.
   * Used by the deadline skill nudge.
   */
  nudgeDeliveryService.registerCustomHandler(
    'set_deadline_today',
    async (data: unknown, nudge: Nudge): Promise<ActionResult> => {
      const { noteId } = data as { noteId: string };

      if (!noteId) {
        return { success: false, error: 'No noteId provided' };
      }

      try {
        // Get today's date in ISO format (YYYY-MM-DD)
        const today = new Date().toISOString().split('T')[0];

        // Update the note with the deadline
        useNoteStore.getState().updateNote(noteId, { deadline: today });

        // Update behavior tracking to reflect the deadline
        useBehaviorStore.getState().updateManageData(noteId, {
          hasDeadline: true,
          deadline: Date.now(),
        });

        console.log(`[CustomHandlers] set_deadline_today: noteId=${noteId}, deadline=${today}`);

        return {
          success: true,
          message: `Deadline set to ${today}`,
        };
      } catch (error) {
        console.error('[CustomHandlers] set_deadline_today failed:', error);
        return {
          success: false,
          error: `Failed to set deadline: ${error}`,
        };
      }
    }
  );

  /**
   * Handler: set_deadline_tomorrow
   * Sets the deadline field on a note to tomorrow's date.
   */
  nudgeDeliveryService.registerCustomHandler(
    'set_deadline_tomorrow',
    async (data: unknown, nudge: Nudge): Promise<ActionResult> => {
      const { noteId } = data as { noteId: string };

      if (!noteId) {
        return { success: false, error: 'No noteId provided' };
      }

      try {
        // Get tomorrow's date in ISO format
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        // Update the note with the deadline
        useNoteStore.getState().updateNote(noteId, { deadline: tomorrowStr });

        // Update behavior tracking
        useBehaviorStore.getState().updateManageData(noteId, {
          hasDeadline: true,
          deadline: tomorrow.getTime(),
        });

        console.log(`[CustomHandlers] set_deadline_tomorrow: noteId=${noteId}, deadline=${tomorrowStr}`);

        return {
          success: true,
          message: `Deadline set to ${tomorrowStr}`,
        };
      } catch (error) {
        console.error('[CustomHandlers] set_deadline_tomorrow failed:', error);
        return {
          success: false,
          error: `Failed to set deadline: ${error}`,
        };
      }
    }
  );

  /**
   * Handler: set_priority_high
   * Sets the priority on a task note to high.
   */
  nudgeDeliveryService.registerCustomHandler(
    'set_priority_high',
    async (data: unknown, nudge: Nudge): Promise<ActionResult> => {
      const { noteId } = data as { noteId: string };

      if (!noteId) {
        return { success: false, error: 'No noteId provided' };
      }

      try {
        // Update behavior tracking with priority
        useBehaviorStore.getState().updateManageData(noteId, {
          hasPriority: true,
          priority: 'high',
        });

        console.log(`[CustomHandlers] set_priority_high: noteId=${noteId}`);

        return {
          success: true,
          message: 'Priority set to high',
        };
      } catch (error) {
        console.error('[CustomHandlers] set_priority_high failed:', error);
        return {
          success: false,
          error: `Failed to set priority: ${error}`,
        };
      }
    }
  );

  /**
   * Handler: mark_task_complete
   * Marks a task as complete.
   */
  nudgeDeliveryService.registerCustomHandler(
    'mark_task_complete',
    async (data: unknown, nudge: Nudge): Promise<ActionResult> => {
      const { noteId } = data as { noteId: string };

      if (!noteId) {
        return { success: false, error: 'No noteId provided' };
      }

      try {
        // Update behavior tracking with completion
        useBehaviorStore.getState().updateManageData(noteId, {
          completedAt: Date.now(),
        });

        console.log(`[CustomHandlers] mark_task_complete: noteId=${noteId}`);

        return {
          success: true,
          message: 'Task marked as complete',
        };
      } catch (error) {
        console.error('[CustomHandlers] mark_task_complete failed:', error);
        return {
          success: false,
          error: `Failed to mark complete: ${error}`,
        };
      }
    }
  );

  // ============================================
  // Goal-Agent System Handlers
  // ============================================

  /**
   * Handler: complete_goal_step
   * Marks a goal step as completed when user taps "Done" on a goal nudge.
   */
  nudgeDeliveryService.registerCustomHandler(
    'complete_goal_step',
    async (data: unknown, nudge: Nudge): Promise<ActionResult> => {
      const { noteId, goalId, stepId } = data as {
        noteId: string;
        goalId: string;
        stepId: string;
      };

      if (!noteId || !goalId || !stepId) {
        return { success: false, error: 'Missing noteId, goalId, or stepId' };
      }

      try {
        const { useGoalStore } = require('@/stores/goalStore');
        const goalStore = useGoalStore.getState();

        goalStore.completeStep(noteId, stepId);
        // Reset nudge cadence on step completion
        goalStore.resetNudgeCadence(noteId);

        console.log(`[CustomHandlers] complete_goal_step: noteId=${noteId}, stepId=${stepId}`);

        return {
          success: true,
          message: 'Step completed!',
        };
      } catch (error) {
        console.error('[CustomHandlers] complete_goal_step failed:', error);
        return {
          success: false,
          error: `Failed to complete step: ${error}`,
        };
      }
    }
  );

  /**
   * Handler: open_goal_feedback
   * Opens the feedback sheet for a goal. The actual UI opening is handled
   * by the NudgeProvider/NudgeToast via event emission.
   */
  nudgeDeliveryService.registerCustomHandler(
    'open_goal_feedback',
    async (data: unknown, nudge: Nudge): Promise<ActionResult> => {
      // This handler signals the UI to open the feedback sheet.
      // The NudgeProvider listens for the action result and opens FeedbackSheet.
      console.log('[CustomHandlers] open_goal_feedback triggered');
      return {
        success: true,
        message: 'Opening feedback...',
      };
    }
  );

  // ============================================
  // Future: Muse Agent Handlers
  // ============================================

  // Handler: expand_idea - AI expansion of brief ideas
  // Handler: suggest_connections - Find related notes

  // ============================================
  // Future: Librarian Agent Handlers
  // ============================================

  // Handler: enrich_url - Fetch metadata for URLs
  // Handler: auto_categorize - AI categorization

  // ============================================
  // Future: Biographer Agent Handlers
  // ============================================

  // Handler: create_journal_entry - Create journal note
  // Handler: create_time_capsule - Create time capsule reminder

  handlersRegistered = true;
  console.log('[CustomHandlers] Registration complete');
}

// ============================================
// Exports
// ============================================

export { handlersRegistered };
