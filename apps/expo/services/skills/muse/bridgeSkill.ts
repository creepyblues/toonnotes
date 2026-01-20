/**
 * Mode Bridge Skill - Muse Agent
 *
 * Suggests transitioning mature ideas to MANAGE mode for action.
 * "This idea seems ready. Time to make it happen?"
 */

import { SkillBuilder, skillRegistry, createNudgeResult, noAction, dismissOption, snoozeOption } from '../index';
import type { SkillContext, SkillResult, NudgeParams } from '../../agents/Agent';
import { DevelopData } from '@/types';
import { MUSE_SKILL_IDS, getMaturityEmoji, getMaturityLabel } from '../../agents/MuseAgent';

// ============================================
// Skill Definition
// ============================================

const bridgeSkill = new SkillBuilder({
  id: MUSE_SKILL_IDS.BRIDGE,
  name: 'Mode Bridge',
  description: 'Suggests transitioning mature ideas to action',
  agentId: 'muse',
  cooldownMs: 7 * 24 * 60 * 60 * 1000, // 7 days per note
})
  // Trigger on note update or pattern match
  .onEvent('note_updated')
  .onPattern('idea_mature')

  // Custom trigger logic
  .when((ctx: SkillContext) => {
    if (!ctx.note || !ctx.behavior || ctx.behavior.mode !== 'develop') return false;

    const data = ctx.behavior.modeData as DevelopData;

    // Only for developed or ready ideas
    return data.maturityLevel === 'developed' || data.maturityLevel === 'ready';
  })

  // Execute skill
  .do(async (ctx: SkillContext): Promise<SkillResult> => {
    if (!ctx.note || !ctx.behavior) return noAction();

    const data = ctx.behavior.modeData as DevelopData;

    // Not mature enough
    if (data.maturityLevel !== 'developed' && data.maturityLevel !== 'ready') {
      return noAction();
    }

    const ideaTitle = ctx.note.title || ctx.note.content.split('\n')[0].slice(0, 40);
    const maturityEmoji = getMaturityEmoji(data.maturityLevel);
    const maturityLabel = getMaturityLabel(data.maturityLevel);

    const nudgeParams: NudgeParams = {
      title: `${maturityEmoji} This idea has grown!`,
      body: `"${ideaTitle}" is ${maturityLabel.toLowerCase()}. Ready to turn it into action?`,
      priority: 'medium',
      deliveryChannel: 'sheet',
      options: [
        {
          id: 'create-task',
          label: '🎯 Create task',
          isPrimary: true,
          action: {
            type: 'custom',
            handler: 'bridge_to_manage',
            data: {
              noteId: ctx.note.id,
              createNew: true,
            },
          },
        },
        {
          id: 'convert',
          label: '🔄 Convert to task',
          action: {
            type: 'custom',
            handler: 'change_mode',
            data: {
              noteId: ctx.note.id,
              mode: 'manage',
            },
          },
        },
        {
          id: 'keep-developing',
          label: '💡 Keep developing',
          action: {
            type: 'navigate',
            target: `/note/${ctx.note.id}`,
          },
        },
        {
          id: 'archive',
          label: '📚 Save as reference',
          action: {
            type: 'custom',
            handler: 'change_mode',
            data: {
              noteId: ctx.note.id,
              mode: 'organize',
              stage: 'store',
            },
          },
        },
        snoozeOption(72), // 3 days
      ],
    };

    return createNudgeResult(nudgeParams);
  })

  .build();

// ============================================
// Registration
// ============================================

skillRegistry.register(bridgeSkill, 'muse');

export { bridgeSkill };
export default bridgeSkill;
