/**
 * Deadline Skill - Manager Agent
 *
 * Detects tasks without deadlines and prompts users to add one.
 * "When does this need to happen?"
 */

import { SkillBuilder, skillRegistry, createNudgeResult, noAction, dismissOption, snoozeOption } from '../index';
import type { SkillContext, SkillResult, NudgeParams } from '../../agents/Agent';
import { ManageData } from '@/types';
import { MANAGER_SKILL_IDS } from '../../agents/ManagerAgent';

// ============================================
// Skill Definition
// ============================================

const deadlineSkill = new SkillBuilder({
  id: MANAGER_SKILL_IDS.DEADLINE,
  name: 'Deadline Nudge',
  description: 'Prompts users to add deadlines to tasks',
  agentId: 'manager',
  cooldownMs: 24 * 60 * 60 * 1000, // 24 hours per note
})
  // Trigger when a task is created without a deadline
  .onEvent('note_created')
  .onPattern('no_deadline')

  // Custom trigger logic
  .when((ctx: SkillContext) => {
    if (!ctx.behavior || ctx.behavior.mode !== 'manage') return false;
    const data = ctx.behavior.modeData as ManageData;
    return !data.hasDeadline && !data.completedAt;
  })

  // Execute skill
  .do(async (ctx: SkillContext): Promise<SkillResult> => {
    if (!ctx.note || !ctx.behavior) return noAction();

    const data = ctx.behavior.modeData as ManageData;

    // Don't nudge if already has deadline or is complete
    if (data.hasDeadline || data.completedAt) {
      return noAction();
    }

    // Extract task title for personalized message
    const taskTitle = ctx.note.title || ctx.note.content.split('\n')[0].slice(0, 50);

    const nudgeParams: NudgeParams = {
      title: 'When does this need to happen?',
      body: `"${taskTitle}" doesn't have a deadline yet. Setting one helps you stay on track.`,
      priority: 'medium',
      deliveryChannel: 'toast',
      options: [
        {
          id: 'set-deadline',
          label: 'Set deadline',
          isPrimary: true,
          action: {
            type: 'navigate',
            target: `/note/${ctx.note.id}?focus=deadline`,
          },
        },
        {
          id: 'today',
          label: 'Today',
          action: {
            type: 'custom',
            handler: 'set_deadline_today',
            data: { noteId: ctx.note.id },
          },
        },
        snoozeOption(4), // 4 hours
        dismissOption(),
      ],
    };

    return createNudgeResult(nudgeParams);
  })

  .build();

// ============================================
// Registration
// ============================================

skillRegistry.register(deadlineSkill, 'manager');

export { deadlineSkill };
export default deadlineSkill;
