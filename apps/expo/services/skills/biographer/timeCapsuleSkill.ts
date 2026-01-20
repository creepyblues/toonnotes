/**
 * Time Capsule Skill - Biographer Agent
 *
 * Surfaces memories on anniversaries of past entries.
 * "One year ago today..."
 */

import { SkillBuilder, skillRegistry, createNudgeResult, noAction, dismissOption } from '../index';
import type { SkillContext, SkillResult, NudgeParams } from '../../agents/Agent';
import { BIOGRAPHER_SKILL_IDS, getBiographerAgent } from '../../agents/BiographerAgent';
import { ExperienceData } from '@/types';

// ============================================
// Anniversary Detection
// ============================================

interface MemoryMatch {
  noteId: string;
  title: string;
  yearsAgo: number;
  originalDate: Date;
}

/**
 * Check if a date is an anniversary of today
 */
function isAnniversary(date: Date, yearsAgo: number): boolean {
  const today = new Date();
  const anniversaryDate = new Date(date);
  anniversaryDate.setFullYear(today.getFullYear() - yearsAgo);

  return (
    anniversaryDate.getMonth() === today.getMonth() &&
    anniversaryDate.getDate() === today.getDate()
  );
}

/**
 * Get anniversary label text
 */
function getAnniversaryLabel(yearsAgo: number): string {
  if (yearsAgo === 1) return 'One year ago today';
  if (yearsAgo === 2) return 'Two years ago today';
  return `${yearsAgo} years ago today`;
}

// ============================================
// Skill Definition
// ============================================

const timeCapsuleSkill = new SkillBuilder({
  id: BIOGRAPHER_SKILL_IDS.TIMECAPSULE,
  name: 'Time Capsule',
  description: 'Surfaces memories on anniversaries',
  agentId: 'biographer',
  cooldownMs: 24 * 60 * 60 * 1000, // 24 hours per memory
})
  // Trigger on daily check
  .onEvent('daily_check')
  .onEvent('app_opened')
  .onPattern('anniversary')

  // Custom trigger logic - check if there are anniversary notes
  .when((ctx: SkillContext) => {
    if (!ctx.note || !ctx.behavior || ctx.behavior.mode !== 'experience') return false;

    const data = ctx.behavior.modeData as ExperienceData;
    if (!data.entryDate) return false;

    const entryDate = new Date(data.entryDate);
    const today = new Date();

    // Check for 1-5 year anniversaries
    for (let yearsAgo = 1; yearsAgo <= 5; yearsAgo++) {
      if (isAnniversary(entryDate, yearsAgo)) {
        return true;
      }
    }

    return false;
  })

  // Execute skill
  .do(async (ctx: SkillContext): Promise<SkillResult> => {
    if (!ctx.note || !ctx.behavior) return noAction();

    const data = ctx.behavior.modeData as ExperienceData;
    if (!data.entryDate) return noAction();

    const entryDate = new Date(data.entryDate);
    const today = new Date();

    // Find which anniversary this is
    let yearsAgo = 0;
    for (let y = 1; y <= 5; y++) {
      if (isAnniversary(entryDate, y)) {
        yearsAgo = y;
        break;
      }
    }

    if (yearsAgo === 0) return noAction();

    const biographer = getBiographerAgent();
    const noteTitle = ctx.note.title || ctx.note.content.split('\n')[0].slice(0, 40);
    const anniversaryLabel = getAnniversaryLabel(yearsAgo);

    // Get sentiment-appropriate emoji
    const sentiment = data.sentiment || 'neutral';
    const sentimentEmoji = biographer.getSentimentEmoji(sentiment);

    const nudgeParams: NudgeParams = {
      title: `📆 ${anniversaryLabel}...`,
      body: `${sentimentEmoji} "${noteTitle}"`,
      priority: 'medium',
      deliveryChannel: 'sheet',
      options: [
        {
          id: 'revisit',
          label: '📖 Read memory',
          isPrimary: true,
          action: {
            type: 'navigate',
            target: `/note/${ctx.note.id}`,
          },
        },
        {
          id: 'reflect',
          label: '✍️ Add reflection',
          action: {
            type: 'custom',
            handler: 'add_anniversary_reflection',
            data: {
              originalNoteId: ctx.note.id,
              yearsAgo,
            },
          },
        },
        {
          id: 'share',
          label: '📤 Share memory',
          action: {
            type: 'custom',
            handler: 'share_memory',
            data: {
              noteId: ctx.note.id,
            },
          },
        },
        dismissOption(),
      ],
    };

    return createNudgeResult(nudgeParams);
  })

  .build();

// ============================================
// Registration
// ============================================

skillRegistry.register(timeCapsuleSkill, 'biographer');

export { timeCapsuleSkill, isAnniversary, getAnniversaryLabel };
export default timeCapsuleSkill;
