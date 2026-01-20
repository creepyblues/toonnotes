/**
 * Celebration Skill - Manager Agent
 *
 * Celebrates task completions and shows daily progress.
 * Positive reinforcement to encourage continued productivity.
 */

import { SkillBuilder, skillRegistry, createNudgeResult, noAction, dismissOption } from '../index';
import type { SkillContext, SkillResult, NudgeParams } from '../../agents/Agent';
import { ManageData } from '@/types';
import { MANAGER_SKILL_IDS } from '../../agents/ManagerAgent';

// ============================================
// Celebration Messages
// ============================================

const CELEBRATION_MESSAGES = [
  { emoji: '🎉', message: 'Nice work! Another one off the list.' },
  { emoji: '✨', message: "Done and dusted! You're making progress." },
  { emoji: '💪', message: 'Crushed it! Keep the momentum going.' },
  { emoji: '🌟', message: "Task complete! You're on a roll." },
  { emoji: '🚀', message: "Boom! That's how it's done." },
  { emoji: '👏', message: 'Well done! Every task counts.' },
  { emoji: '🎯', message: 'Bullseye! Task complete.' },
  { emoji: '⚡', message: 'Zap! Another one bites the dust.' },
];

const STREAK_MESSAGES: Record<number, string> = {
  3: "That's 3 tasks today! You're in the zone. 🔥",
  5: "5 tasks complete! You're unstoppable. 💫",
  7: '7 tasks! This is a legendary day. 🏆',
  10: "10 tasks?! You're an absolute machine! 🤖",
};

function getRandomCelebration(): { emoji: string; message: string } {
  return CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];
}

function getStreakMessage(count: number): string | null {
  // Check for exact milestone matches
  if (STREAK_MESSAGES[count]) {
    return STREAK_MESSAGES[count];
  }

  // For counts above 10, celebrate every 5
  if (count > 10 && count % 5 === 0) {
    return `${count} tasks today! You're setting records. 🏅`;
  }

  return null;
}

// ============================================
// Skill Definition
// ============================================

const celebrateSkill = new SkillBuilder({
  id: MANAGER_SKILL_IDS.CELEBRATE,
  name: 'Completion Celebration',
  description: 'Celebrates task completions with positive reinforcement',
  agentId: 'manager',
  cooldownMs: 0, // No cooldown - celebrate every completion!
})
  // Trigger on task completion
  .onEvent('task_completed')
  .onPattern('task_completed')

  // Custom trigger logic
  .when((ctx: SkillContext) => {
    if (!ctx.behavior || ctx.behavior.mode !== 'manage') return false;
    const data = ctx.behavior.modeData as ManageData;
    return !!data.completedAt;
  })

  // Execute skill
  .do(async (ctx: SkillContext): Promise<SkillResult> => {
    if (!ctx.note || !ctx.behavior) return noAction();

    const data = ctx.behavior.modeData as ManageData;

    // Must be a completed task
    if (!data.completedAt) return noAction();

    // Get completion stats (would normally come from a service)
    const todayCompletions = getTodayCompletionCount();
    const streakMessage = getStreakMessage(todayCompletions);

    const celebration = getRandomCelebration();
    const taskTitle = ctx.note.title || ctx.note.content.split('\n')[0].slice(0, 30);

    // Build body message
    let body = `"${taskTitle}" is done!`;
    if (streakMessage) {
      body = streakMessage;
    } else if (todayCompletions > 1) {
      body += ` That's ${todayCompletions} tasks today.`;
    }

    const nudgeParams: NudgeParams = {
      title: `${celebration.emoji} ${celebration.message}`,
      body,
      priority: 'low', // Celebrations are nice but not urgent
      deliveryChannel: 'toast',
      expiresIn: 10 * 1000, // Auto-dismiss after 10 seconds
      options: [
        {
          id: 'view-progress',
          label: 'View progress',
          isPrimary: true,
          action: {
            type: 'navigate',
            target: '/progress',
          },
        },
        {
          id: 'next-task',
          label: 'Next task',
          action: {
            type: 'navigate',
            target: '/',
          },
        },
        dismissOption(),
      ],
    };

    return createNudgeResult(nudgeParams);
  })

  .build();

// ============================================
// Helpers
// ============================================

/**
 * Get count of tasks completed today
 * This would normally query the behavior store
 */
function getTodayCompletionCount(): number {
  // TODO: Implement actual counting from behaviorStore
  // For now, return a mock value
  return 1;
}

// ============================================
// Registration
// ============================================

skillRegistry.register(celebrateSkill, 'manager');

export { celebrateSkill, getRandomCelebration, getStreakMessage };
export default celebrateSkill;
