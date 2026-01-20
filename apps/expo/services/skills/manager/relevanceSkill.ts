/**
 * Relevance Check Skill - Manager Agent
 *
 * Checks on tasks that haven't been touched in a while.
 * "Still on your plate, or archive?"
 */

import { SkillBuilder, skillRegistry, createNudgeResult, noAction, dismissOption, snoozeOption } from '../index';
import type { SkillContext, SkillResult, NudgeParams } from '../../agents/Agent';
import { ManageData } from '@/types';
import { MANAGER_SKILL_IDS } from '../../agents/ManagerAgent';

// ============================================
// Constants
// ============================================

const STALE_THRESHOLD_DAYS = 7;
const STALE_THRESHOLD_MS = STALE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

// ============================================
// Skill Definition
// ============================================

const relevanceSkill = new SkillBuilder({
  id: MANAGER_SKILL_IDS.RELEVANCE,
  name: 'Relevance Check',
  description: 'Checks on stale tasks and offers to archive or re-engage',
  agentId: 'manager',
  cooldownMs: 7 * 24 * 60 * 60 * 1000, // 7 days per note
})
  // Trigger on daily check for untouched notes
  .onEvent('daily_check')
  .onPattern('untouched', STALE_THRESHOLD_DAYS)

  // Custom trigger logic
  .when((ctx: SkillContext) => {
    if (!ctx.behavior || ctx.behavior.mode !== 'manage') return false;

    const data = ctx.behavior.modeData as ManageData;

    // Skip if completed
    if (data.completedAt) return false;

    // Check if stale
    const timeSinceAccess = Date.now() - ctx.behavior.lastAccessedAt;
    return timeSinceAccess >= STALE_THRESHOLD_MS;
  })

  // Execute skill
  .do(async (ctx: SkillContext): Promise<SkillResult> => {
    if (!ctx.note || !ctx.behavior) return noAction();

    const data = ctx.behavior.modeData as ManageData;

    // Double-check not completed
    if (data.completedAt) return noAction();

    // Calculate days since last access
    const daysSinceAccess = Math.floor(
      (Date.now() - ctx.behavior.lastAccessedAt) / (1000 * 60 * 60 * 24)
    );

    const taskTitle = ctx.note.title || ctx.note.content.split('\n')[0].slice(0, 40);

    const nudgeParams: NudgeParams = {
      title: 'Still on your plate?',
      body: `"${taskTitle}" hasn't been touched in ${daysSinceAccess} days. Is this still relevant?`,
      priority: 'low',
      deliveryChannel: 'toast',
      options: [
        {
          id: 'keep',
          label: 'Still need it',
          isPrimary: true,
          action: {
            type: 'navigate',
            target: `/note/${ctx.note.id}`,
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
          id: 'complete',
          label: 'Done',
          action: {
            type: 'custom',
            handler: 'mark_task_complete',
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

skillRegistry.register(relevanceSkill, 'manager');

export { relevanceSkill };
export default relevanceSkill;
