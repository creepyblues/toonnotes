/**
 * Librarian Skills - MODE Framework v2.0
 *
 * All skills for the Librarian agent (ORGANIZE mode).
 * Import this file to register all librarian skills with the skill registry.
 */

// Import all skills to trigger registration
export { dailySweepSkill } from './dailySweepSkill';
export { enrichSkill, extractUrls, getDomain } from './enrichSkill';
export { categorizeSkill, detectCategory, CATEGORY_PATTERNS } from './categorizeSkill';
export { reviewSkill, formatReviewInterval } from './reviewSkill';
export { archiveSkill } from './archiveSkill';

// Re-export skill IDs from agent
export { LIBRARIAN_SKILL_IDS, calculateNextReview, REVIEW_INTERVALS } from '../../agents/LibrarianAgent';

/**
 * Initialize all librarian skills
 * Call this once at app startup to register all skills
 */
export function initializeLibrarianSkills(): void {
  // Skills are auto-registered on import via skillRegistry.register()
  console.log('[LibrarianSkills] All skills initialized');
}
