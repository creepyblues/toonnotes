/**
 * Memory Link Skill - Biographer Agent
 *
 * Links entries that mention the same people or places.
 * "Last time you wrote about [person] was..."
 */

import { SkillBuilder, skillRegistry, createNudgeResult, noAction, dismissOption } from '../index';
import type { SkillContext, SkillResult, NudgeParams } from '../../agents/Agent';
import { BIOGRAPHER_SKILL_IDS, extractPeopleMentioned } from '../../agents/BiographerAgent';
import { ExperienceData, NoteBehavior } from '@/types';

// ============================================
// Memory Linking Logic
// ============================================

interface LinkedMemory {
  noteId: string;
  noteTitle: string;
  person: string;
  daysSince: number;
  createdAt: number;
}

/**
 * Format days since into human-readable text
 */
function formatDaysSince(days: number): string {
  if (days === 0) return 'earlier today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return 'last week';
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return 'last month';
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  if (days < 730) return 'last year';
  return `${Math.floor(days / 365)} years ago`;
}

// ============================================
// Skill Definition
// ============================================

const linkSkill = new SkillBuilder({
  id: BIOGRAPHER_SKILL_IDS.LINK,
  name: 'Memory Link',
  description: 'Links entries mentioning the same people',
  agentId: 'biographer',
  cooldownMs: 24 * 60 * 60 * 1000, // 24 hours per person mention
})
  // Trigger on note update
  .onEvent('note_updated')
  .onPattern('person_mentioned')

  // Custom trigger logic
  .when((ctx: SkillContext) => {
    if (!ctx.note || !ctx.behavior || ctx.behavior.mode !== 'experience') return false;

    // Check if note mentions people
    const data = ctx.behavior.modeData as ExperienceData;
    const peopleMentioned = data.peopleTagged || extractPeopleMentioned(ctx.note.content);

    if (peopleMentioned.length === 0) return false;

    // Need behavior history to find links
    if (!ctx.behaviorHistory || ctx.behaviorHistory.length < 2) return false;

    return true;
  })

  // Execute skill
  .do(async (ctx: SkillContext): Promise<SkillResult> => {
    if (!ctx.note || !ctx.behavior || !ctx.behaviorHistory) return noAction();

    const data = ctx.behavior.modeData as ExperienceData;
    const peopleMentioned = data.peopleTagged || extractPeopleMentioned(ctx.note.content);

    if (peopleMentioned.length === 0) return noAction();

    // Find previous entries mentioning the same people
    const linkedMemories: LinkedMemory[] = [];
    const now = Date.now();

    for (const behavior of ctx.behaviorHistory) {
      // Skip current note
      if (behavior.noteId === ctx.note.id) continue;
      if (behavior.mode !== 'experience') continue;

      const behaviorData = behavior.modeData as ExperienceData;
      const otherPeople = behaviorData.peopleTagged || [];

      // Find overlapping people
      for (const person of peopleMentioned) {
        if (otherPeople.some(p => p.toLowerCase() === person.toLowerCase())) {
          const daysSince = Math.floor((now - behavior.lastAccessedAt) / (24 * 60 * 60 * 1000));

          // Only link if it's been more than a day
          if (daysSince >= 1) {
            linkedMemories.push({
              noteId: behavior.noteId,
              noteTitle: 'Previous entry', // Would need note data to get actual title
              person,
              daysSince,
              createdAt: behavior.lastAccessedAt,
            });
          }
        }
      }
    }

    // No linked memories found
    if (linkedMemories.length === 0) return noAction();

    // Sort by most recent and get the best match
    linkedMemories.sort((a, b) => b.createdAt - a.createdAt);
    const bestMatch = linkedMemories[0];

    const nudgeParams: NudgeParams = {
      title: `👥 Memory of ${bestMatch.person}`,
      body: `Last time you wrote about ${bestMatch.person} was ${formatDaysSince(bestMatch.daysSince)}.`,
      priority: 'low',
      deliveryChannel: 'toast',
      options: [
        {
          id: 'view-memory',
          label: '📖 Read it',
          isPrimary: true,
          action: {
            type: 'navigate',
            target: `/note/${bestMatch.noteId}`,
          },
        },
        {
          id: 'view-all',
          label: `📚 All about ${bestMatch.person}`,
          action: {
            type: 'custom',
            handler: 'show_person_memories',
            data: {
              person: bestMatch.person,
              noteIds: linkedMemories
                .filter(m => m.person === bestMatch.person)
                .map(m => m.noteId),
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

skillRegistry.register(linkSkill, 'biographer');

export { linkSkill, formatDaysSince };
export default linkSkill;
