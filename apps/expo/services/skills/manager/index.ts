/**
 * Manager Skills - MODE Framework v2.0
 *
 * All skills for the Manager agent (MANAGE mode).
 * Import this file to register all manager skills with the skill registry.
 */

// Import all skills to trigger registration
export { deadlineSkill } from './deadlineSkill';
export { relevanceSkill } from './relevanceSkill';
export { decomposeSkill, detectComplexity, isComplex } from './decomposeSkill';
export { celebrateSkill, getRandomCelebration, getStreakMessage } from './celebrateSkill';
export { prioritySkill } from './prioritySkill';

// Re-export skill IDs from agent
export { MANAGER_SKILL_IDS } from '../../agents/ManagerAgent';

/**
 * Initialize all manager skills
 * Call this once at app startup to register all skills
 */
export function initializeManagerSkills(): void {
  // Skills are auto-registered on import via skillRegistry.register()
  console.log('[ManagerSkills] All skills initialized');
}
