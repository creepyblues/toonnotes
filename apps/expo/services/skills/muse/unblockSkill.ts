/**
 * Creative Unblock Skill - Muse Agent
 *
 * Detects when a user might be stuck and offers creative prompts.
 * Helps overcome writer's block and creative paralysis.
 */

import { SkillBuilder, skillRegistry, createNudgeResult, noAction, dismissOption, snoozeOption } from '../index';
import type { SkillContext, SkillResult, NudgeParams } from '../../agents/Agent';
import { DevelopData } from '@/types';
import { MUSE_SKILL_IDS, getMuseAgent } from '../../agents/MuseAgent';

// ============================================
// Block Detection
// ============================================

/**
 * Check if content shows signs of being stuck
 */
function showsBlockSignals(content: string): boolean {
  const blockPhrases = [
    /\b(?:stuck|blocked|don't know|not sure|help|confused)\b/i,
    /\?\s*$/m, // Ends with question mark
    /\.{3,}/, // Trailing ellipsis
    /\b(?:maybe|perhaps|idk|hmm)\b/i,
    /TODO|TBD|FIX/i,
  ];

  return blockPhrases.some(p => p.test(content));
}

/**
 * Check if content is mid-draft (started but incomplete)
 */
function isMidDraft(content: string): boolean {
  const lines = content.split('\n').filter(l => l.trim().length > 0);

  // Has some content but not much
  if (lines.length < 3 || lines.length > 20) return false;

  // Ends abruptly (last line is short)
  const lastLine = lines[lines.length - 1].trim();
  if (lastLine.length < 50 && !lastLine.endsWith('.') && !lastLine.endsWith('!')) {
    return true;
  }

  return false;
}

// ============================================
// Skill Definition
// ============================================

const unblockSkill = new SkillBuilder({
  id: MUSE_SKILL_IDS.UNBLOCK,
  name: 'Creative Unblock',
  description: 'Offers prompts when user seems stuck',
  agentId: 'muse',
  cooldownMs: 2 * 60 * 60 * 1000, // 2 hours
})
  // Trigger on note update
  .onEvent('note_updated')

  // Custom trigger logic
  .when((ctx: SkillContext) => {
    if (!ctx.note || !ctx.behavior || ctx.behavior.mode !== 'develop') return false;

    // Check for block signals or mid-draft status
    return showsBlockSignals(ctx.note.content) || isMidDraft(ctx.note.content);
  })

  // Execute skill
  .do(async (ctx: SkillContext): Promise<SkillResult> => {
    if (!ctx.note || !ctx.behavior) return noAction();

    // Double-check block signals
    const isBlocked = showsBlockSignals(ctx.note.content);
    const isMid = isMidDraft(ctx.note.content);

    if (!isBlocked && !isMid) return noAction();

    const muse = getMuseAgent();
    const prompts = muse.getUnblockPrompts();

    // Pick 3 random prompts
    const shuffled = prompts.sort(() => Math.random() - 0.5);
    const selectedPrompts = shuffled.slice(0, 3);

    const nudgeParams: NudgeParams = {
      title: '✨ Need a spark?',
      body: isBlocked
        ? "Feeling stuck? Here are some ways to shake things loose."
        : "Your idea is taking shape. Here are some prompts to keep going.",
      priority: 'low',
      deliveryChannel: 'sheet',
      options: [
        {
          id: 'prompt-1',
          label: selectedPrompts[0],
          isPrimary: true,
          action: {
            type: 'custom',
            handler: 'inject_prompt',
            data: {
              noteId: ctx.note.id,
              prompt: selectedPrompts[0],
            },
          },
        },
        {
          id: 'prompt-2',
          label: selectedPrompts[1],
          action: {
            type: 'custom',
            handler: 'inject_prompt',
            data: {
              noteId: ctx.note.id,
              prompt: selectedPrompts[1],
            },
          },
        },
        {
          id: 'prompt-3',
          label: selectedPrompts[2],
          action: {
            type: 'custom',
            handler: 'inject_prompt',
            data: {
              noteId: ctx.note.id,
              prompt: selectedPrompts[2],
            },
          },
        },
        {
          id: 'take-break',
          label: '☕ Take a break',
          action: {
            type: 'dismiss',
          },
        },
        snoozeOption(1), // 1 hour
      ],
    };

    return createNudgeResult(nudgeParams);
  })

  .build();

// ============================================
// Registration
// ============================================

skillRegistry.register(unblockSkill, 'muse');

export { unblockSkill, showsBlockSignals, isMidDraft };
export default unblockSkill;
