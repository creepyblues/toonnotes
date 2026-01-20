/**
 * Priority Sort Skill - Manager Agent
 *
 * Helps users prioritize when they have multiple tasks without clear priorities.
 * "What's the ONE thing for today?"
 */

import { SkillBuilder, skillRegistry, createNudgeResult, noAction, dismissOption, snoozeOption } from '../index';
import type { SkillContext, SkillResult, NudgeParams } from '../../agents/Agent';
import { ManageData } from '@/types';
import { MANAGER_SKILL_IDS } from '../../agents/ManagerAgent';

// ============================================
// Skill Definition
// ============================================

const prioritySkill = new SkillBuilder({
  id: MANAGER_SKILL_IDS.PRIORITY,
  name: 'Priority Sort',
  description: 'Helps users identify the most important task',
  agentId: 'manager',
  cooldownMs: 12 * 60 * 60 * 1000, // 12 hours
})
  // Trigger on daily check or app open
  .onEvent('daily_check')
  .onEvent('app_opened')
  .onPattern('no_priority')

  // Custom trigger logic
  .when((ctx: SkillContext) => {
    if (!ctx.behavior || ctx.behavior.mode !== 'manage') return false;
    const data = ctx.behavior.modeData as ManageData;
    return !data.hasPriority && !data.completedAt;
  })

  // Execute skill
  .do(async (ctx: SkillContext): Promise<SkillResult> => {
    if (!ctx.note || !ctx.behavior) return noAction();

    const data = ctx.behavior.modeData as ManageData;

    // Skip if already prioritized or complete
    if (data.hasPriority || data.completedAt) {
      return noAction();
    }

    const taskTitle = ctx.note.title || ctx.note.content.split('\n')[0].slice(0, 40);

    const nudgeParams: NudgeParams = {
      title: "What's the ONE thing?",
      body: `You have several tasks without priorities. Is "${taskTitle}" the most important one right now?`,
      priority: 'medium',
      deliveryChannel: 'toast',
      options: [
        {
          id: 'mark-priority',
          label: 'This is #1',
          isPrimary: true,
          action: {
            type: 'custom',
            handler: 'set_high_priority',
            data: { noteId: ctx.note.id },
          },
        },
        {
          id: 'view-all',
          label: 'View all tasks',
          action: {
            type: 'navigate',
            target: '/?filter=manage',
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

skillRegistry.register(prioritySkill, 'manager');

export { prioritySkill };
export default prioritySkill;
