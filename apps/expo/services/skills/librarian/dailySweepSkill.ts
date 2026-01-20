/**
 * Daily Sweep Skill - Librarian Agent
 *
 * Prompts users to process items that have been in inbox for 24+ hours.
 * "Quick look: Keep, Process, or Let Go?"
 */

import { SkillBuilder, skillRegistry, createNudgeResult, noAction, dismissOption, snoozeOption } from '../index';
import type { SkillContext, SkillResult, NudgeParams } from '../../agents/Agent';
import { OrganizeData } from '@/types';
import { LIBRARIAN_SKILL_IDS } from '../../agents/LibrarianAgent';

// ============================================
// Constants
// ============================================

const INBOX_THRESHOLD_HOURS = 24;
const INBOX_THRESHOLD_MS = INBOX_THRESHOLD_HOURS * 60 * 60 * 1000;

// ============================================
// Skill Definition
// ============================================

const dailySweepSkill = new SkillBuilder({
  id: LIBRARIAN_SKILL_IDS.DAILY_SWEEP,
  name: 'Daily Inbox Sweep',
  description: 'Prompts users to process inbox items daily',
  agentId: 'librarian',
  cooldownMs: 12 * 60 * 60 * 1000, // 12 hours
})
  // Trigger on daily check or app open
  .onEvent('daily_check')
  .onEvent('app_opened')
  .onPattern('in_inbox')

  // Custom trigger logic
  .when((ctx: SkillContext) => {
    if (!ctx.note || !ctx.behavior || ctx.behavior.mode !== 'organize') return false;

    const data = ctx.behavior.modeData as OrganizeData;

    // Only for inbox items
    if (data.stage !== 'inbox') return false;

    // Check if been in inbox long enough
    const timeInInbox = Date.now() - ctx.behavior.createdAt;
    return timeInInbox >= INBOX_THRESHOLD_MS;
  })

  // Execute skill
  .do(async (ctx: SkillContext): Promise<SkillResult> => {
    if (!ctx.note || !ctx.behavior) return noAction();

    const data = ctx.behavior.modeData as OrganizeData;

    // Must be inbox item
    if (data.stage !== 'inbox') return noAction();

    const itemTitle = ctx.note.title || ctx.note.content.split('\n')[0].slice(0, 40);
    const hoursInInbox = Math.floor((Date.now() - ctx.behavior.createdAt) / (1000 * 60 * 60));

    const nudgeParams: NudgeParams = {
      title: '📥 Inbox check',
      body: `"${itemTitle}" has been waiting ${hoursInInbox > 24 ? Math.floor(hoursInInbox / 24) + ' days' : hoursInInbox + ' hours'}. What would you like to do?`,
      priority: hoursInInbox > 72 ? 'high' : 'medium',
      deliveryChannel: 'sheet',
      options: [
        {
          id: 'file-it',
          label: '📁 File it',
          isPrimary: true,
          action: {
            type: 'custom',
            handler: 'move_to_store',
            data: { noteId: ctx.note.id },
          },
        },
        {
          id: 'learn-it',
          label: '📖 Learn it',
          action: {
            type: 'custom',
            handler: 'move_to_learn',
            data: { noteId: ctx.note.id },
          },
        },
        {
          id: 'develop-it',
          label: '💡 Develop it',
          action: {
            type: 'custom',
            handler: 'change_mode',
            data: { noteId: ctx.note.id, mode: 'develop' },
          },
        },
        {
          id: 'do-it',
          label: '🎯 Do it',
          action: {
            type: 'custom',
            handler: 'change_mode',
            data: { noteId: ctx.note.id, mode: 'manage' },
          },
        },
        {
          id: 'let-go',
          label: '🗑️ Let go',
          action: {
            type: 'update_note',
            noteId: ctx.note.id,
            changes: { isDeleted: true },
          },
        },
        snoozeOption(24), // 24 hours
      ],
    };

    return createNudgeResult(nudgeParams);
  })

  .build();

// ============================================
// Registration
// ============================================

skillRegistry.register(dailySweepSkill, 'librarian');

export { dailySweepSkill };
export default dailySweepSkill;
