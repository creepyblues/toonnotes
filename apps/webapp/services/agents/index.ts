/**
 * Agents Index - MODE Framework v2.0 (Web)
 *
 * Re-exports all agent classes and utilities for the MODE framework.
 */

// Base agent class and utilities
export {
  Agent,
  agentRegistry,
  AGENT_CONFIGS,
  AGENT_PERSONALITIES,
  getAgentConfigForMode,
  modeToAgentId,
  agentIdToMode,
} from './Agent';

export type {
  AgentConfig,
  Skill,
  SkillContext,
  SkillResult,
  NudgeParams,
  AutoAction,
} from './Agent';

// Individual agents
export { ManagerAgent, managerAgent } from './ManagerAgent';
export { MuseAgent, museAgent } from './MuseAgent';
export { LibrarianAgent, librarianAgent } from './LibrarianAgent';
export { BiographerAgent, biographerAgent } from './BiographerAgent';

// ============================================
// Agent Initialization
// ============================================

import { agentRegistry } from './Agent';
import { managerAgent } from './ManagerAgent';
import { museAgent } from './MuseAgent';
import { librarianAgent } from './LibrarianAgent';
import { biographerAgent } from './BiographerAgent';

/**
 * Initialize and register all agents with the registry.
 * Call this once at app startup.
 */
export function initializeAgents(): void {
  // Register all agents
  agentRegistry.register(managerAgent);
  agentRegistry.register(museAgent);
  agentRegistry.register(librarianAgent);
  agentRegistry.register(biographerAgent);

  // Initialize skills for each agent
  managerAgent.initializeSkills();
  museAgent.initializeSkills();
  librarianAgent.initializeSkills();
  biographerAgent.initializeSkills();

  console.log('[MODE Framework] Agents initialized');
}

/**
 * Get all agent instances
 */
export function getAllAgents() {
  return {
    manager: managerAgent,
    muse: museAgent,
    librarian: librarianAgent,
    biographer: biographerAgent,
  };
}
