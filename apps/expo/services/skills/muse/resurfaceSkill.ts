/**
 * Idea Resurface Skill - Muse Agent
 *
 * Resurfaces ideas that have been untouched for a while.
 * "Still sparking joy?"
 */

import { SkillBuilder, skillRegistry, createNudgeResult, noAction, dismissOption, snoozeOption } from '../index';
import type { SkillContext, SkillResult, NudgeParams } from '../../agents/Agent';
import { DevelopData } from '@/types';
import { MUSE_SKILL_IDS, getMaturityEmoji, getMaturityLabel } from '../../agents/MuseAgent';

// ============================================
// Constants
// ============================================

const RESURFACE_THRESHOLD_DAYS = 14;
const RESURFACE_THRESHOLD_MS = RESURFACE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

// ============================================
// Skill Definition
// ============================================

const resurfaceSkill = new SkillBuilder({
  id: MUSE_SKILL_IDS.RESURFACE,
  name: 'Idea Resurface',
  description: 'Resurfaces forgotten ideas for review',
  agentId: 'muse',
  cooldownMs: 14 * 24 * 60 * 60 * 1000, // 14 days per note
})
  // Trigger on daily/weekly check
  .onEvent('daily_check')
  .onEvent('weekly_check')
  .onPattern('idea_unexpanded')

  // Custom trigger logic
  .when((ctx: SkillContext) => {
    if (!ctx.note || !ctx.behavior || ctx.behavior.mode !== 'develop') return false;

    const data = ctx.behavior.modeData as DevelopData;

    // Only for unexpanded or early-stage ideas
    if (data.maturityLevel === 'developed' || data.maturityLevel === 'ready') {
      return false;
    }

    // Check if untouched for a while
    const timeSinceAccess = Date.now() - ctx.behavior.lastAccessedAt;
    return timeSinceAccess >= RESURFACE_THRESHOLD_MS;
  })

  // Execute skill
  .do(async (ctx: SkillContext): Promise<SkillResult> => {
    if (!ctx.note || !ctx.behavior) return noAction();

    const data = ctx.behavior.modeData as DevelopData;
    const daysSinceAccess = Math.floor(
      (Date.now() - ctx.behavior.lastAccessedAt) / (1000 * 60 * 60 * 24)
    );

    // Not old enough
    if (daysSinceAccess < RESURFACE_THRESHOLD_DAYS) return noAction();

    const ideaTitle = ctx.note.title || ctx.note.content.split('\n')[0].slice(0, 40);
    const maturityEmoji = getMaturityEmoji(data.maturityLevel);

    const nudgeParams: NudgeParams = {
      title: '💭 Remember this idea?',
      body: `"${ideaTitle}" has been waiting ${daysSinceAccess} days. Still sparking joy?`,
      priority: 'low',
      deliveryChannel: 'toast',
      options: [
        {
          id: 'revisit',
          label: 'Revisit it',
          isPrimary: true,
          action: {
            type: 'navigate',
            target: `/note/${ctx.note.id}`,
          },
        },
        {
          id: 'archive',
          label: 'Let it rest',
          action: {
            type: 'update_note',
            noteId: ctx.note.id,
            changes: { isArchived: true },
          },
        },
        {
          id: 'transform',
          label: 'Make it a task',
          action: {
            type: 'custom',
            handler: 'change_mode',
            data: { noteId: ctx.note.id, mode: 'manage' },
          },
        },
        snoozeOption(168), // 1 week
      ],
    };

    return createNudgeResult(nudgeParams);
  })

  .build();

// ============================================
// Registration
// ============================================

skillRegistry.register(resurfaceSkill, 'muse');

export { resurfaceSkill };
export default resurfaceSkill;
