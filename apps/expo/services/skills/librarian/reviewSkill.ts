/**
 * Spaced Repetition Review Skill - Librarian Agent
 *
 * Prompts users when it's time to review learning items.
 * Uses spaced repetition intervals for optimal retention.
 */

import { SkillBuilder, skillRegistry, createNudgeResult, noAction, dismissOption, snoozeOption } from '../index';
import type { SkillContext, SkillResult, NudgeParams } from '../../agents/Agent';
import { OrganizeData } from '@/types';
import { LIBRARIAN_SKILL_IDS, calculateNextReview } from '../../agents/LibrarianAgent';

// ============================================
// Review Helpers
// ============================================

function formatReviewInterval(masteryLevel: number): string {
  const intervals = ['1 day', '3 days', '1 week', '2 weeks', '1 month', '2 months', '4 months'];
  return intervals[Math.min(masteryLevel, intervals.length - 1)];
}

// ============================================
// Skill Definition
// ============================================

const reviewSkill = new SkillBuilder({
  id: LIBRARIAN_SKILL_IDS.REVIEW,
  name: 'Spaced Repetition Review',
  description: 'Prompts users to review learning items at optimal intervals',
  agentId: 'librarian',
  cooldownMs: 60 * 60 * 1000, // 1 hour between reviews
})
  // Trigger on daily check or app open
  .onEvent('daily_check')
  .onEvent('app_opened')
  .onPattern('needs_review')

  // Custom trigger logic
  .when((ctx: SkillContext) => {
    if (!ctx.note || !ctx.behavior || ctx.behavior.mode !== 'organize') return false;

    const data = ctx.behavior.modeData as OrganizeData;

    // Only for learn stage items
    if (data.stage !== 'learn') return false;

    // Check if review is due
    if (!data.nextReviewAt) return false;
    return Date.now() >= data.nextReviewAt;
  })

  // Execute skill
  .do(async (ctx: SkillContext): Promise<SkillResult> => {
    if (!ctx.note || !ctx.behavior) return noAction();

    const data = ctx.behavior.modeData as OrganizeData;

    // Must be learn stage with due review
    if (data.stage !== 'learn' || !data.nextReviewAt) return noAction();
    if (Date.now() < data.nextReviewAt) return noAction();

    const itemTitle = ctx.note.title || ctx.note.content.split('\n')[0].slice(0, 40);
    const masteryLevel = data.masteryLevel ?? 0;
    const nextInterval = formatReviewInterval(masteryLevel + 1);

    const nudgeParams: NudgeParams = {
      title: '🎓 Time to review!',
      body: `"${itemTitle}" is ready for review. Can you recall the key points?`,
      priority: 'high',
      deliveryChannel: 'sheet',
      options: [
        {
          id: 'know-it',
          label: '✅ I know this',
          isPrimary: true,
          action: {
            type: 'custom',
            handler: 'review_success',
            data: {
              noteId: ctx.note.id,
              newMastery: masteryLevel + 1,
              nextReview: calculateNextReview(masteryLevel + 1),
            },
          },
        },
        {
          id: 'need-review',
          label: '🔄 Need more practice',
          action: {
            type: 'custom',
            handler: 'review_reset',
            data: {
              noteId: ctx.note.id,
              newMastery: Math.max(0, masteryLevel - 1),
              nextReview: calculateNextReview(0), // Reset to 1 day
            },
          },
        },
        {
          id: 'show-content',
          label: '👀 Show me',
          action: {
            type: 'navigate',
            target: `/note/${ctx.note.id}`,
          },
        },
        snoozeOption(4), // 4 hours
      ],
    };

    return createNudgeResult(nudgeParams);
  })

  .build();

// ============================================
// Registration
// ============================================

skillRegistry.register(reviewSkill, 'librarian');

export { reviewSkill, formatReviewInterval };
export default reviewSkill;
