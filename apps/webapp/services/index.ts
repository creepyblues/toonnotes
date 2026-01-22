/**
 * Services Index - ToonNotes Webapp
 *
 * Re-exports all services for the webapp.
 */

// MODE Framework - Agents
export {
  Agent,
  agentRegistry,
  AGENT_CONFIGS,
  AGENT_PERSONALITIES,
  getAgentConfigForMode,
  modeToAgentId,
  agentIdToMode,
  initializeAgents,
  getAllAgents,
  managerAgent,
  museAgent,
  librarianAgent,
  biographerAgent,
} from './agents';

export type {
  AgentConfig,
  Skill,
  SkillContext,
  SkillResult,
  NudgeParams,
  AutoAction,
} from './agents';

// MODE Framework - Skills
export {
  SkillBuilder,
  defineSkill,
  skillRegistry,
  createNudgeResult,
  noAction,
  dismissOption,
  snoozeOption,
  navigateOption,
  customOption,
  MANAGER_SKILLS,
  MUSE_SKILLS,
  LIBRARIAN_SKILLS,
  BIOGRAPHER_SKILLS,
  ALL_SKILL_IDS,
} from './skills';

export type { SkillId, SkillOptions } from './skills';
