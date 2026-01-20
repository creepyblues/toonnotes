/**
 * Enrichment Prompts Skill - Biographer Agent
 *
 * Prompts users to add details when creating journal entries.
 * "Add location?" "Add a photo?" "How are you feeling?"
 */

import { SkillBuilder, skillRegistry, createNudgeResult, noAction, dismissOption } from '../index';
import type { SkillContext, SkillResult, NudgeParams } from '../../agents/Agent';
import type { NudgeOption } from '@/types';
import { BIOGRAPHER_SKILL_IDS, getBiographerAgent, getEnrichmentSuggestions, analyzeJournalEntry } from '../../agents/BiographerAgent';
import { ExperienceData } from '@/types';

// ============================================
// Skill Definition
// ============================================

const enrichSkill = new SkillBuilder({
  id: BIOGRAPHER_SKILL_IDS.ENRICH,
  name: 'Entry Enrichment',
  description: 'Prompts users to add details to journal entries',
  agentId: 'biographer',
  cooldownMs: 4 * 60 * 60 * 1000, // 4 hours per note
})
  // Trigger on note update
  .onEvent('note_updated')
  .onPattern('journal_entry')

  // Custom trigger logic
  .when((ctx: SkillContext) => {
    if (!ctx.note || !ctx.behavior || ctx.behavior.mode !== 'experience') return false;

    // Only for recently created entries (within last 30 minutes)
    const timeSinceCreation = Date.now() - ctx.note.createdAt;
    if (timeSinceCreation > 30 * 60 * 1000) return false;

    // Check if entry could use enrichment
    const suggestions = getEnrichmentSuggestions(ctx.note.content);
    return suggestions.length > 0;
  })

  // Execute skill
  .do(async (ctx: SkillContext): Promise<SkillResult> => {
    if (!ctx.note || !ctx.behavior) return noAction();

    const biographer = getBiographerAgent();
    const suggestions = biographer.suggestEnrichments(ctx.note.content);

    if (suggestions.length === 0) return noAction();

    const analysis = biographer.analyzeEntry(ctx.note);

    // Build options from suggestions
    const options: NudgeOption[] = suggestions.map(suggestion => ({
      id: suggestion.id,
      label: `${suggestion.emoji} ${suggestion.prompt}`,
      isPrimary: suggestion.id === suggestions[0].id,
      action: {
        type: 'custom' as const,
        handler: 'enrich_entry',
        data: {
          noteId: ctx.note!.id,
          field: suggestion.field,
        },
      },
    }));

    // Add dismiss option
    options.push({
      id: 'done',
      label: "I'm done",
      action: {
        type: 'dismiss',
      },
    });

    const nudgeParams: NudgeParams = {
      title: '✨ Capture the moment',
      body: 'A few details can make this memory richer.',
      priority: 'low',
      deliveryChannel: 'toast',
      options,
    };

    return createNudgeResult(nudgeParams);
  })

  .build();

// ============================================
// Registration
// ============================================

skillRegistry.register(enrichSkill, 'biographer');

export { enrichSkill };
export default enrichSkill;
