/**
 * Pattern Alert Skill - Biographer Agent
 *
 * Notices patterns in journal entries (like multiple tough days)
 * and offers supportive prompts.
 * "Noticed some tough days. What usually helps?"
 */

import { SkillBuilder, skillRegistry, createNudgeResult, noAction, dismissOption, snoozeOption } from '../index';
import type { SkillContext, SkillResult, NudgeParams } from '../../agents/Agent';
import { BIOGRAPHER_SKILL_IDS, getBiographerAgent, analyzeSentiment, Sentiment } from '../../agents/BiographerAgent';
import { ExperienceData, NoteBehavior } from '@/types';

// ============================================
// Pattern Detection
// ============================================

interface SentimentPattern {
  type: 'tough_stretch' | 'positive_streak' | 'mood_shift';
  dayCount: number;
  sentiment: Sentiment;
}

/**
 * Detect sentiment patterns from recent entries
 */
function detectSentimentPattern(recentSentiments: Sentiment[]): SentimentPattern | null {
  if (recentSentiments.length < 3) return null;

  // Count consecutive negative days
  let negativeStreak = 0;
  for (const s of recentSentiments) {
    if (s === 'negative') negativeStreak++;
    else break;
  }

  if (negativeStreak >= 3) {
    return {
      type: 'tough_stretch',
      dayCount: negativeStreak,
      sentiment: 'negative',
    };
  }

  // Count consecutive positive days
  let positiveStreak = 0;
  for (const s of recentSentiments) {
    if (s === 'positive') positiveStreak++;
    else break;
  }

  if (positiveStreak >= 5) {
    return {
      type: 'positive_streak',
      dayCount: positiveStreak,
      sentiment: 'positive',
    };
  }

  // Detect mood shift (recent entry very different from pattern)
  if (recentSentiments.length >= 4) {
    const recent = recentSentiments[0];
    const previous = recentSentiments.slice(1, 4);
    const wasConsistentlyNegative = previous.every(s => s === 'negative');
    const wasConsistentlyPositive = previous.every(s => s === 'positive');

    if (wasConsistentlyNegative && recent === 'positive') {
      return {
        type: 'mood_shift',
        dayCount: 4,
        sentiment: 'positive',
      };
    }

    if (wasConsistentlyPositive && recent === 'negative') {
      return {
        type: 'mood_shift',
        dayCount: 4,
        sentiment: 'negative',
      };
    }
  }

  return null;
}

// ============================================
// Pattern Messages
// ============================================

interface PatternMessage {
  title: string;
  body: string;
  supportive: boolean;
}

function getPatternMessage(pattern: SentimentPattern): PatternMessage {
  switch (pattern.type) {
    case 'tough_stretch':
      return {
        title: "💙 I've noticed some tough days",
        body: `The last ${pattern.dayCount} entries show you've been going through a lot. What usually helps you feel better?`,
        supportive: true,
      };

    case 'positive_streak':
      return {
        title: "🌟 What a great stretch!",
        body: `${pattern.dayCount} positive days in a row! What's been going well?`,
        supportive: false,
      };

    case 'mood_shift':
      if (pattern.sentiment === 'positive') {
        return {
          title: '🌈 Things are looking up',
          body: "Your recent entry feels different - in a good way. What changed?",
          supportive: false,
        };
      } else {
        return {
          title: '💙 Checking in',
          body: "Today seems different from the past few days. Everything okay?",
          supportive: true,
        };
      }

    default:
      return {
        title: '💭 A pattern emerges',
        body: "I've noticed something in your recent entries.",
        supportive: false,
      };
  }
}

// ============================================
// Skill Definition
// ============================================

const patternSkill = new SkillBuilder({
  id: BIOGRAPHER_SKILL_IDS.PATTERN,
  name: 'Pattern Alert',
  description: 'Notices sentiment patterns and offers support',
  agentId: 'biographer',
  cooldownMs: 7 * 24 * 60 * 60 * 1000, // 7 days - very gentle
})
  // Trigger on note update or weekly check
  .onEvent('note_updated')
  .onEvent('weekly_check')
  .onPattern('sentiment_pattern')

  // Custom trigger logic
  .when((ctx: SkillContext) => {
    if (!ctx.note || !ctx.behavior || ctx.behavior.mode !== 'experience') return false;

    // Need behavior history to detect patterns
    if (!ctx.behaviorHistory || ctx.behaviorHistory.length < 3) return false;

    // Get recent sentiments from experience entries
    const recentSentiments: Sentiment[] = ctx.behaviorHistory
      .filter((b: NoteBehavior) => b.mode === 'experience')
      .slice(0, 7)
      .map((b: NoteBehavior) => {
        const data = b.modeData as ExperienceData;
        return data.sentiment || 'neutral';
      });

    // Check if there's a pattern worth noting
    const pattern = detectSentimentPattern(recentSentiments);
    return pattern !== null;
  })

  // Execute skill
  .do(async (ctx: SkillContext): Promise<SkillResult> => {
    if (!ctx.note || !ctx.behavior || !ctx.behaviorHistory) return noAction();

    // Get recent sentiments
    const recentSentiments: Sentiment[] = ctx.behaviorHistory
      .filter((b: NoteBehavior) => b.mode === 'experience')
      .slice(0, 7)
      .map((b: NoteBehavior) => {
        const data = b.modeData as ExperienceData;
        return data.sentiment || 'neutral';
      });

    const pattern = detectSentimentPattern(recentSentiments);
    if (!pattern) return noAction();

    const biographer = getBiographerAgent();
    const message = getPatternMessage(pattern);

    const nudgeParams: NudgeParams = {
      title: message.title,
      body: message.body,
      priority: message.supportive ? 'medium' : 'low',
      deliveryChannel: 'sheet',
      options: message.supportive
        ? [
            {
              id: 'reflect',
              label: '✍️ Write about it',
              isPrimary: true,
              action: {
                type: 'custom',
                handler: 'create_journal_entry',
                data: {
                  prompt: "What's been on your mind lately?",
                  mode: 'experience',
                },
              },
            },
            {
              id: 'resources',
              label: '💡 Self-care ideas',
              action: {
                type: 'custom',
                handler: 'show_self_care_prompts',
                data: {},
              },
            },
            snoozeOption(72), // 3 days
            dismissOption(),
          ]
        : [
            {
              id: 'reflect',
              label: '✍️ Capture the moment',
              isPrimary: true,
              action: {
                type: 'custom',
                handler: 'create_journal_entry',
                data: {
                  prompt: pattern.type === 'positive_streak'
                    ? "What's been making these days so good?"
                    : "What led to this change?",
                  mode: 'experience',
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

skillRegistry.register(patternSkill, 'biographer');

export { patternSkill, detectSentimentPattern };
export default patternSkill;
