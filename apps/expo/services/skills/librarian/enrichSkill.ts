/**
 * Auto-Enrich Skill - Librarian Agent
 *
 * Detects URLs in notes and offers to fetch additional information.
 * Extracts title, description, and images from web pages.
 */

import { SkillBuilder, skillRegistry, createNudgeResult, noAction, dismissOption } from '../index';
import type { SkillContext, SkillResult, NudgeParams } from '../../agents/Agent';
import { OrganizeData } from '@/types';
import { LIBRARIAN_SKILL_IDS } from '../../agents/LibrarianAgent';

// ============================================
// URL Detection
// ============================================

const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;

function extractUrls(content: string): string[] {
  const matches = content.match(URL_REGEX);
  return matches ? [...new Set(matches)] : [];
}

function getDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace('www.', '');
  } catch {
    return 'link';
  }
}

// ============================================
// Skill Definition
// ============================================

const enrichSkill = new SkillBuilder({
  id: LIBRARIAN_SKILL_IDS.ENRICH,
  name: 'Auto-Enrich',
  description: 'Fetches additional information for URLs in notes',
  agentId: 'librarian',
  cooldownMs: 0, // No cooldown - enrich immediately
})
  // Trigger on note creation
  .onEvent('note_created')
  .onPattern('has_url')

  // Custom trigger logic
  .when((ctx: SkillContext) => {
    if (!ctx.note || !ctx.behavior || ctx.behavior.mode !== 'organize') return false;

    const data = ctx.behavior.modeData as OrganizeData;

    // Only enrich inbox items that haven't been enriched
    if (data.stage !== 'inbox') return false;
    if (data.tags.includes('enriched')) return false;

    // Check if content has URLs
    const urls = extractUrls(ctx.note.content);
    return urls.length > 0;
  })

  // Execute skill
  .do(async (ctx: SkillContext): Promise<SkillResult> => {
    if (!ctx.note || !ctx.behavior) return noAction();

    const data = ctx.behavior.modeData as OrganizeData;

    // Already enriched
    if (data.tags.includes('enriched')) return noAction();

    const urls = extractUrls(ctx.note.content);
    if (urls.length === 0) return noAction();

    const primaryUrl = urls[0];
    const domain = getDomain(primaryUrl);

    const nudgeParams: NudgeParams = {
      title: '🔗 Link detected',
      body: `This note contains a link to ${domain}. Want me to fetch more details?`,
      priority: 'low',
      deliveryChannel: 'toast',
      options: [
        {
          id: 'enrich',
          label: 'Fetch details',
          isPrimary: true,
          action: {
            type: 'custom',
            handler: 'enrich_url',
            data: {
              noteId: ctx.note.id,
              url: primaryUrl,
            },
          },
        },
        {
          id: 'skip',
          label: 'Skip',
          action: {
            type: 'custom',
            handler: 'mark_enriched',
            data: { noteId: ctx.note.id },
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

skillRegistry.register(enrichSkill, 'librarian');

export { enrichSkill, extractUrls, getDomain };
export default enrichSkill;
