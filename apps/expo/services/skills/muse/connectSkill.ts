/**
 * Idea Connection Skill - Muse Agent
 *
 * Suggests connections between related ideas.
 * "These ideas might be related..."
 */

import { SkillBuilder, skillRegistry, createNudgeResult, noAction, dismissOption } from '../index';
import type { SkillContext, SkillResult, NudgeParams } from '../../agents/Agent';
import { DevelopData } from '@/types';
import { MUSE_SKILL_IDS } from '../../agents/MuseAgent';

// ============================================
// Connection Detection
// ============================================

/**
 * Extract keywords from content for matching
 */
function extractKeywords(content: string): string[] {
  // Remove common words and extract meaningful terms
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her',
  ]);

  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));

  // Return unique words
  return [...new Set(words)];
}

// ============================================
// Skill Definition
// ============================================

const connectSkill = new SkillBuilder({
  id: MUSE_SKILL_IDS.CONNECT,
  name: 'Idea Connection',
  description: 'Suggests connections between related ideas',
  agentId: 'muse',
  cooldownMs: 24 * 60 * 60 * 1000, // 24 hours
})
  // Trigger on note update or when idea has linked items
  .onEvent('note_updated')

  // Custom trigger logic
  .when((ctx: SkillContext) => {
    if (!ctx.note || !ctx.behavior || ctx.behavior.mode !== 'develop') return false;

    const data = ctx.behavior.modeData as DevelopData;

    // Only trigger if there are linked ideas
    return data.linkedIdeas && data.linkedIdeas.length > 0;
  })

  // Execute skill
  .do(async (ctx: SkillContext): Promise<SkillResult> => {
    if (!ctx.note || !ctx.behavior) return noAction();

    const data = ctx.behavior.modeData as DevelopData;

    // No linked ideas
    if (!data.linkedIdeas || data.linkedIdeas.length === 0) {
      return noAction();
    }

    const ideaTitle = ctx.note.title || ctx.note.content.split('\n')[0].slice(0, 40);
    const linkedCount = data.linkedIdeas.length;

    const nudgeParams: NudgeParams = {
      title: '🔗 Ideas connecting...',
      body: `"${ideaTitle}" relates to ${linkedCount} other ${linkedCount === 1 ? 'idea' : 'ideas'}. Want to explore the connections?`,
      priority: 'low',
      deliveryChannel: 'toast',
      options: [
        {
          id: 'view-connections',
          label: 'See connections',
          isPrimary: true,
          action: {
            type: 'custom',
            handler: 'show_connected_ideas',
            data: {
              noteId: ctx.note.id,
              linkedIds: data.linkedIdeas,
            },
          },
        },
        {
          id: 'merge',
          label: 'Merge ideas',
          action: {
            type: 'custom',
            handler: 'merge_ideas',
            data: {
              noteId: ctx.note.id,
              linkedIds: data.linkedIdeas,
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

skillRegistry.register(connectSkill, 'muse');

export { connectSkill, extractKeywords };
export default connectSkill;
