/**
 * Biographer Skills - MODE Framework v2.0
 *
 * All skills for the Biographer agent (EXPERIENCE mode).
 * Import this file to register all biographer skills with the skill registry.
 */

// Import all skills to trigger registration
export { nudgeSkill } from './nudgeSkill';
export { timeCapsuleSkill, isAnniversary, getAnniversaryLabel } from './timeCapsuleSkill';
export { enrichSkill } from './enrichSkill';
export { patternSkill, detectSentimentPattern } from './patternSkill';
export { linkSkill, formatDaysSince } from './linkSkill';

// Re-export from agent
export {
  BIOGRAPHER_SKILL_IDS,
  analyzeSentiment,
  extractPeopleMentioned,
  analyzeJournalEntry,
  getEnrichmentSuggestions,
  calculateStreak,
  detectEntryType,
} from '../../agents/BiographerAgent';

export type {
  Sentiment,
  JournalAnalysis,
  EnrichmentSuggestion,
  EntryType,
} from '../../agents/BiographerAgent';

/**
 * Initialize all biographer skills
 * Call this once at app startup to register all skills
 */
export function initializeBiographerSkills(): void {
  // Skills are auto-registered on import via skillRegistry.register()
  console.log('[BiographerSkills] All skills initialized');
}
