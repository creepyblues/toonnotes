/**
 * Muse Skills - MODE Framework v2.0
 *
 * All skills for the Muse agent (DEVELOP mode).
 * Import this file to register all muse skills with the skill registry.
 */

// Import all skills to trigger registration
export { expandSkill, isBriefIdea } from './expandSkill';
export { resurfaceSkill } from './resurfaceSkill';
export { connectSkill, extractKeywords } from './connectSkill';
export { bridgeSkill } from './bridgeSkill';
export { unblockSkill, showsBlockSignals, isMidDraft } from './unblockSkill';

// Re-export from agent
export {
  MUSE_SKILL_IDS,
  detectContentType,
  getPromptsForType,
  getMaturityEmoji,
  getMaturityLabel,
} from '../../agents/MuseAgent';

export type {
  ContentType,
  IdeaMaturity,
  IdeaSuggestion,
  IdeaAnalysis,
  ExpansionAngle,
} from '../../agents/MuseAgent';

/**
 * Initialize all muse skills
 * Call this once at app startup to register all skills
 */
export function initializeMuseSkills(): void {
  // Skills are auto-registered on import via skillRegistry.register()
  console.log('[MuseSkills] All skills initialized');
}
