/**
 * Agent Exports - MODE Framework v2.0
 *
 * Central export point for all AI agents.
 */

// Re-export types from @/types
export type { AgentId, AgentPersonality, NudgeOption, NudgeAction } from '@/types';

// Base agent
export {
  Agent,
  AGENT_CONFIGS,
  AGENT_PERSONALITIES,
  getAgentConfigForMode,
  modeToAgentId,
  agentIdToMode,
  agentRegistry,
} from './Agent';
export type { AgentConfig, SkillContext, SkillResult, NudgeParams, Skill, AutoAction } from './Agent';

// Manager Agent (MANAGE mode)
export { ManagerAgent, getManagerAgent, MANAGER_SKILL_IDS } from './ManagerAgent';
export type { TaskAnalysis, TaskSuggestion } from './ManagerAgent';

// Librarian Agent (ORGANIZE mode)
export { LibrarianAgent, getLibrarianAgent, LIBRARIAN_SKILL_IDS, REVIEW_INTERVALS, calculateNextReview } from './LibrarianAgent';

// Muse Agent (DEVELOP mode)
export { MuseAgent, getMuseAgent, MUSE_SKILL_IDS, detectContentType, getPromptsForType, getMaturityEmoji, getMaturityLabel } from './MuseAgent';
export type { ContentType, IdeaMaturity, IdeaSuggestion, IdeaAnalysis, ExpansionAngle } from './MuseAgent';

// Biographer Agent (EXPERIENCE mode)
export {
  BiographerAgent,
  getBiographerAgent,
  BIOGRAPHER_SKILL_IDS,
  analyzeSentiment,
  extractPeopleMentioned,
  analyzeJournalEntry,
  analyzeContent,
  getEnrichmentSuggestions,
  calculateStreak,
  detectEntryType,
} from './BiographerAgent';
export type { Sentiment, JournalAnalysis, EnrichmentSuggestion, EntryType } from './BiographerAgent';

/**
 * Get agent instance by ID
 */
export function getAgent(agentId: import('@/types').AgentId) {
  const { getManagerAgent } = require('./ManagerAgent');
  const { getLibrarianAgent } = require('./LibrarianAgent');
  const { getMuseAgent } = require('./MuseAgent');
  const { getBiographerAgent } = require('./BiographerAgent');

  switch (agentId) {
    case 'manager':
      return getManagerAgent();
    case 'librarian':
      return getLibrarianAgent();
    case 'muse':
      return getMuseAgent();
    case 'biographer':
      return getBiographerAgent();
    default:
      throw new Error(`Unknown agent ID: ${agentId}`);
  }
}

/**
 * Initialize all agents
 * Call this once at app startup
 */
export function initializeAgents(): void {
  const { getManagerAgent } = require('./ManagerAgent');
  const { getLibrarianAgent } = require('./LibrarianAgent');
  const { getMuseAgent } = require('./MuseAgent');
  const { getBiographerAgent } = require('./BiographerAgent');

  // Instantiate all agents
  getManagerAgent();
  getLibrarianAgent();
  getMuseAgent();
  getBiographerAgent();
  console.log('[Agents] All agents initialized');
}
