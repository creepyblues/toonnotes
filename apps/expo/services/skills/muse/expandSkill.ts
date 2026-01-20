/**
 * Idea Expansion Skill - Muse Agent
 *
 * Detects single-line/brief ideas and offers expansion angles.
 * "Yes, and..." approach to help ideas grow.
 */

import { SkillBuilder, skillRegistry, createNudgeResult, noAction, dismissOption, snoozeOption } from '../index';
import type { SkillContext, SkillResult, NudgeParams } from '../../agents/Agent';
import { DevelopData } from '@/types';
import { MUSE_SKILL_IDS, detectContentType, getPromptsForType, getMuseAgent } from '../../agents/MuseAgent';

// ============================================
// Helpers
// ============================================

function isBriefIdea(content: string): boolean {
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  return lines.length <= 2 && content.length < 200;
}

// ============================================
// Skill Definition
// ============================================

const expandSkill = new SkillBuilder({
  id: MUSE_SKILL_IDS.EXPAND,
  name: 'Yes And',
  description: 'Offers expansion angles for brief ideas',
  agentId: 'muse',
  cooldownMs: 4 * 60 * 60 * 1000, // 4 hours per note
})
  // Trigger on note creation or when idea is brief
  .onEvent('note_created')
  .onPattern('single_line_idea')

  // Custom trigger logic
  .when((ctx: SkillContext) => {
    if (!ctx.note || !ctx.behavior || ctx.behavior.mode !== 'develop') return false;

    const data = ctx.behavior.modeData as DevelopData | undefined;

    // Only for unexpanded ideas (defensive null check)
    const expansionCount = data?.expansionCount ?? 0;
    if (expansionCount > 0) return false;

    // Check if it's a brief idea
    return isBriefIdea(ctx.note.content);
  })

  // Execute skill
  .do(async (ctx: SkillContext): Promise<SkillResult> => {
    if (!ctx.note || !ctx.behavior) return noAction();

    const data = ctx.behavior.modeData as DevelopData | undefined;

    // Already expanded (defensive null check)
    const expansionCount = data?.expansionCount ?? 0;
    if (expansionCount > 0) return noAction();

    // Not brief enough
    if (!isBriefIdea(ctx.note.content)) return noAction();

    const contentType = detectContentType(ctx.note.content);
    const prompts = getPromptsForType(contentType);
    const muse = getMuseAgent();
    const angles = muse.generateExpansionAngles(ctx.note);

    const ideaTitle = ctx.note.title || ctx.note.content.split('\n')[0].slice(0, 40);

    const nudgeParams: NudgeParams = {
      title: "💡 This spark has potential!",
      body: `"${ideaTitle}" - Let's explore it together. ${prompts[0]}`,
      priority: 'medium',
      deliveryChannel: 'sheet',
      options: [
        {
          id: 'expand-deep',
          label: `${angles[0].emoji} ${angles[0].label}`,
          isPrimary: true,
          action: {
            type: 'custom',
            handler: 'expand_idea',
            data: {
              noteId: ctx.note.id,
              angle: angles[0].id,
              prompt: angles[0].prompt,
            },
          },
        },
        {
          id: 'expand-flip',
          label: `${angles[1].emoji} ${angles[1].label}`,
          action: {
            type: 'custom',
            handler: 'expand_idea',
            data: {
              noteId: ctx.note.id,
              angle: angles[1].id,
              prompt: angles[1].prompt,
            },
          },
        },
        {
          id: 'expand-combine',
          label: `${angles[2].emoji} ${angles[2].label}`,
          action: {
            type: 'custom',
            handler: 'expand_idea',
            data: {
              noteId: ctx.note.id,
              angle: angles[2].id,
              prompt: angles[2].prompt,
            },
          },
        },
        {
          id: 'write-freely',
          label: '✍️ Just write',
          action: {
            type: 'navigate',
            target: `/note/${ctx.note.id}`,
          },
        },
        snoozeOption(24), // Come back tomorrow
      ],
    };

    return createNudgeResult(nudgeParams);
  })

  .build();

// ============================================
// Registration
// ============================================

skillRegistry.register(expandSkill, 'muse');

export { expandSkill, isBriefIdea };
export default expandSkill;
