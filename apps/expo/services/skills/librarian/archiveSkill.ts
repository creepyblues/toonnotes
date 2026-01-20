/**
 * Archive Suggest Skill - Librarian Agent
 *
 * Suggests archiving items that haven't been accessed in a long time.
 * Prevents clutter while keeping things accessible.
 */

import { SkillBuilder, skillRegistry, createNudgeResult, noAction, dismissOption, snoozeOption } from '../index';
import type { SkillContext, SkillResult, NudgeParams } from '../../agents/Agent';
import { OrganizeData } from '@/types';
import { LIBRARIAN_SKILL_IDS } from '../../agents/LibrarianAgent';

// ============================================
// Constants
// ============================================

const STALE_THRESHOLD_DAYS = 180; // 6 months
const STALE_THRESHOLD_MS = STALE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

// ============================================
// Skill Definition
// ============================================

const archiveSkill = new SkillBuilder({
  id: LIBRARIAN_SKILL_IDS.ARCHIVE,
  name: 'Archive Suggest',
  description: 'Suggests archiving unused stored items',
  agentId: 'librarian',
  cooldownMs: 30 * 24 * 60 * 60 * 1000, // 30 days per note
})
  // Trigger on weekly check
  .onEvent('weekly_check')

  // Custom trigger logic
  .when((ctx: SkillContext) => {
    if (!ctx.note || !ctx.behavior || ctx.behavior.mode !== 'organize') return false;

    const data = ctx.behavior.modeData as OrganizeData;

    // Only for store stage items
    if (data.stage !== 'store') return false;

    // Check if unused for a long time
    const lastUsed = data.lastUsedAt ?? ctx.behavior.createdAt;
    const timeSinceUse = Date.now() - lastUsed;
    return timeSinceUse >= STALE_THRESHOLD_MS;
  })

  // Execute skill
  .do(async (ctx: SkillContext): Promise<SkillResult> => {
    if (!ctx.note || !ctx.behavior) return noAction();

    const data = ctx.behavior.modeData as OrganizeData;

    // Must be store stage
    if (data.stage !== 'store') return noAction();

    const lastUsed = data.lastUsedAt ?? ctx.behavior.createdAt;
    const daysSinceUse = Math.floor((Date.now() - lastUsed) / (1000 * 60 * 60 * 24));

    // Not stale enough
    if (daysSinceUse < STALE_THRESHOLD_DAYS) return noAction();

    const itemTitle = ctx.note.title || ctx.note.content.split('\n')[0].slice(0, 40);
    const monthsSinceUse = Math.floor(daysSinceUse / 30);

    const nudgeParams: NudgeParams = {
      title: '🗄️ Spring cleaning time?',
      body: `"${itemTitle}" hasn't been accessed in ${monthsSinceUse} months. Still need it?`,
      priority: 'low',
      deliveryChannel: 'toast',
      options: [
        {
          id: 'keep',
          label: 'Keep it',
          isPrimary: true,
          action: {
            type: 'custom',
            handler: 'mark_accessed',
            data: { noteId: ctx.note.id },
          },
        },
        {
          id: 'archive',
          label: 'Archive',
          action: {
            type: 'update_note',
            noteId: ctx.note.id,
            changes: { isArchived: true },
          },
        },
        {
          id: 'delete',
          label: 'Delete',
          action: {
            type: 'update_note',
            noteId: ctx.note.id,
            changes: { isDeleted: true },
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

skillRegistry.register(archiveSkill, 'librarian');

export { archiveSkill };
export default archiveSkill;
