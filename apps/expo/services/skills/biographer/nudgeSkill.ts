/**
 * Journaling Nudge Skill - Biographer Agent
 *
 * Gently prompts users to journal at their regular journaling time.
 * "Feel like writing?"
 */

import { SkillBuilder, skillRegistry, createNudgeResult, noAction, dismissOption, snoozeOption } from '../index';
import type { SkillContext, SkillResult, NudgeParams } from '../../agents/Agent';
import { BIOGRAPHER_SKILL_IDS, getBiographerAgent, calculateStreak } from '../../agents/BiographerAgent';

// ============================================
// Skill Definition
// ============================================

const nudgeSkill = new SkillBuilder({
  id: BIOGRAPHER_SKILL_IDS.NUDGE,
  name: 'Journal Nudge',
  description: 'Prompts users to journal at regular times',
  agentId: 'biographer',
  cooldownMs: 20 * 60 * 60 * 1000, // 20 hours (allows for slight daily variation)
})
  // Trigger on daily check or app open in evening
  .onEvent('daily_check')
  .onEvent('app_opened')
  .onPattern('evening_time')

  // Custom trigger logic
  .when((ctx: SkillContext) => {
    // Only for EXPERIENCE mode
    if (!ctx.behavior || ctx.behavior.mode !== 'experience') return false;

    // Check if it's a good time for journaling (evening hours)
    const hour = new Date().getHours();
    if (hour < 18 || hour > 23) return false;

    // Check if user has journaled today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();

    // If behavior has today's entry, don't nudge
    if (ctx.behavior.lastAccessedAt >= todayMs) return false;

    return true;
  })

  // Execute skill
  .do(async (ctx: SkillContext): Promise<SkillResult> => {
    if (!ctx.behavior) return noAction();

    const biographer = getBiographerAgent();
    const prompt = biographer.getReflectionPrompt();

    const title = '📔 Evening reflection time';
    const body = prompt;

    const nudgeParams: NudgeParams = {
      title,
      body,
      priority: 'low',
      deliveryChannel: 'toast',
      options: [
        {
          id: 'write',
          label: 'Write now',
          isPrimary: true,
          action: {
            type: 'custom',
            handler: 'create_journal_entry',
            data: {
              prompt,
              mode: 'experience',
            },
          },
        },
        {
          id: 'quick',
          label: 'Quick thought',
          action: {
            type: 'custom',
            handler: 'show_quick_entry',
            data: {
              mode: 'experience',
            },
          },
        },
        snoozeOption(2), // 2 hours
        dismissOption(),
      ],
    };

    return createNudgeResult(nudgeParams);
  })

  .build();

// ============================================
// Registration
// ============================================

skillRegistry.register(nudgeSkill, 'biographer');

export { nudgeSkill };
export default nudgeSkill;
