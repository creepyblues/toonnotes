/**
 * Agent Base Class - MODE Framework v2.0 (Web)
 *
 * Abstract base class for AI agents in the MODE framework.
 * Each cognitive mode (MANAGE, DEVELOP, ORGANIZE, EXPERIENCE) has
 * a dedicated agent with specialized skills and personality.
 *
 * Agents are responsible for:
 * - Evaluating skill triggers
 * - Generating contextual nudges
 * - Providing mode-specific guidance
 * - Learning from user interactions
 */

import {
  AgentId,
  AgentPersonality,
  Mode,
  Note,
  NoteBehavior,
  NudgeOption,
  NudgePriority,
  NudgeDeliveryChannel,
  SkillTrigger,
  UserPatterns,
} from '@toonnotes/types';

// ============================================
// Skill Types
// ============================================

/**
 * Context provided to skills when executing
 */
export interface SkillContext {
  note?: Note;
  behavior?: NoteBehavior;
  boardId?: string;
  boardHashtag?: string;
  timestamp: number;
  userPatterns?: UserPatterns;
  behaviorHistory?: NoteBehavior[]; // Recent behavior history for pattern detection
}

/**
 * Result from skill execution
 */
export interface SkillResult {
  shouldNudge: boolean;
  nudgeParams?: NudgeParams;
  autoAction?: AutoAction;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for creating a nudge
 */
export interface NudgeParams {
  title: string;
  body: string;
  options: NudgeOption[];
  priority?: NudgePriority;
  deliveryChannel?: NudgeDeliveryChannel;
  showAt?: number;
  expiresIn?: number;
}

/**
 * Auto-action that can be performed without user interaction
 */
export interface AutoAction {
  type: 'update_behavior' | 'update_note' | 'create_reminder' | 'log_event';
  payload: Record<string, unknown>;
}

/**
 * Skill definition
 */
export interface Skill {
  id: string;
  name: string;
  description: string;
  triggers: SkillTrigger[];
  cooldownMs: number;
  enabled: boolean;

  /**
   * Check if the skill should trigger for the given context
   */
  shouldTrigger: (context: SkillContext) => boolean;

  /**
   * Execute the skill and return the result
   */
  execute: (context: SkillContext) => Promise<SkillResult>;
}

// ============================================
// Agent Personality Presets
// ============================================

export const AGENT_PERSONALITIES: Record<AgentId, AgentPersonality> = {
  manager: {
    tone: 'Direct and action-oriented',
    approach: 'Breaks down complexity into actionable steps',
    values: ['efficiency', 'completion', 'clarity', 'momentum'],
    avoids: ['overwhelm', 'guilt', 'pressure', 'micromanagement'],
  },
  muse: {
    tone: 'Collaborative and generative',
    approach: 'Expands possibilities without judgment',
    values: ['creativity', 'exploration', 'connection', 'growth'],
    avoids: ['criticism', 'premature closure', 'perfectionism'],
  },
  librarian: {
    tone: 'Organized and helpful',
    approach: 'Prevents hoarding while ensuring findability',
    values: ['organization', 'accessibility', 'curation', 'learning'],
    avoids: ['clutter', 'information overload', 'forgetting'],
  },
  biographer: {
    tone: 'Reflective and emotionally intelligent',
    approach: 'Surfaces memories and encourages expression',
    values: ['preservation', 'meaning', 'connection', 'growth'],
    avoids: ['pressure', 'judgment', 'intrusion', 'guilt'],
  },
};

// ============================================
// Agent Configuration
// ============================================

export interface AgentConfig {
  id: AgentId;
  mode: Mode;
  name: string;
  emoji: string;
  color: string;
  coreQuestion: string;
  personality: AgentPersonality;
}

export const AGENT_CONFIGS: Record<AgentId, AgentConfig> = {
  manager: {
    id: 'manager',
    mode: 'manage',
    name: 'The Manager',
    emoji: '🎯',
    color: '#FF6B6B',
    coreQuestion: 'What needs to happen?',
    personality: AGENT_PERSONALITIES.manager,
  },
  muse: {
    id: 'muse',
    mode: 'develop',
    name: 'The Muse',
    emoji: '💡',
    color: '#FFEAA7',
    coreQuestion: 'What could this become?',
    personality: AGENT_PERSONALITIES.muse,
  },
  librarian: {
    id: 'librarian',
    mode: 'organize',
    name: 'The Librarian',
    emoji: '📚',
    color: '#00CEC9',
    coreQuestion: 'Where should this live?',
    personality: AGENT_PERSONALITIES.librarian,
  },
  biographer: {
    id: 'biographer',
    mode: 'experience',
    name: 'The Biographer',
    emoji: '📔',
    color: '#A29BFE',
    coreQuestion: 'What do you want to remember?',
    personality: AGENT_PERSONALITIES.biographer,
  },
};

// ============================================
// Abstract Agent Class
// ============================================

/**
 * Abstract base class for MODE Framework agents
 */
export abstract class Agent {
  readonly id: AgentId;
  readonly mode: Mode;
  readonly config: AgentConfig;
  protected skills: Map<string, Skill> = new Map();
  protected enabled: boolean = true;

  constructor(id: AgentId) {
    this.id = id;
    this.config = AGENT_CONFIGS[id];
    this.mode = this.config.mode;
  }

  /**
   * Get the agent's personality
   */
  get personality(): AgentPersonality {
    return this.config.personality;
  }

  /**
   * Get all registered skills
   */
  getSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  /**
   * Get a skill by ID
   */
  getSkill(skillId: string): Skill | undefined {
    return this.skills.get(skillId);
  }

  /**
   * Register a skill with this agent
   */
  registerSkill(skill: Skill): void {
    this.skills.set(skill.id, skill);
  }

  /**
   * Unregister a skill
   */
  unregisterSkill(skillId: string): void {
    this.skills.delete(skillId);
  }

  /**
   * Enable or disable the agent
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if agent is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Find skills that should trigger for the given context
   */
  findTriggeredSkills(context: SkillContext): Skill[] {
    if (!this.enabled) return [];

    return Array.from(this.skills.values()).filter(
      (skill) => skill.enabled && skill.shouldTrigger(context)
    );
  }

  /**
   * Execute all triggered skills and collect results
   */
  async executeTriggeredSkills(context: SkillContext): Promise<SkillResult[]> {
    const triggeredSkills = this.findTriggeredSkills(context);
    const results: SkillResult[] = [];

    for (const skill of triggeredSkills) {
      try {
        const result = await skill.execute(context);
        results.push(result);
      } catch (error) {
        console.error(`[${this.id}] Skill ${skill.id} failed:`, error);
      }
    }

    return results;
  }

  /**
   * Generate a greeting message in the agent's voice
   */
  getGreeting(): string {
    return this.generateGreeting();
  }

  /**
   * Generate contextual help text
   */
  getHelpText(context?: SkillContext): string {
    return this.generateHelpText(context);
  }

  /**
   * Generate a prompt in the agent's voice
   */
  generatePrompt(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return result;
  }

  /**
   * Abstract method: Generate greeting in agent's voice
   */
  protected abstract generateGreeting(): string;

  /**
   * Abstract method: Generate help text in agent's voice
   */
  protected abstract generateHelpText(context?: SkillContext): string;

  /**
   * Abstract method: Initialize agent-specific skills
   */
  abstract initializeSkills(): void;
}

// ============================================
// Agent Registry
// ============================================

/**
 * Registry for managing all agents
 */
class AgentRegistry {
  private agents: Map<AgentId, Agent> = new Map();

  /**
   * Register an agent
   */
  register(agent: Agent): void {
    this.agents.set(agent.id, agent);
  }

  /**
   * Get an agent by ID
   */
  get(id: AgentId): Agent | undefined {
    return this.agents.get(id);
  }

  /**
   * Get agent for a specific mode
   */
  getForMode(mode: Mode): Agent | undefined {
    for (const agent of this.agents.values()) {
      if (agent.mode === mode) {
        return agent;
      }
    }
    return undefined;
  }

  /**
   * Get all registered agents
   */
  getAll(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Execute skills across all agents for a context
   */
  async executeAllTriggeredSkills(context: SkillContext): Promise<Map<AgentId, SkillResult[]>> {
    const results = new Map<AgentId, SkillResult[]>();

    for (const agent of this.agents.values()) {
      const agentResults = await agent.executeTriggeredSkills(context);
      if (agentResults.length > 0) {
        results.set(agent.id, agentResults);
      }
    }

    return results;
  }
}

// Singleton instance
export const agentRegistry = new AgentRegistry();

// ============================================
// Utility Functions
// ============================================

/**
 * Get the agent config for a mode
 */
export function getAgentConfigForMode(mode: Mode): AgentConfig {
  const agentId = modeToAgentId(mode);
  return AGENT_CONFIGS[agentId];
}

/**
 * Convert mode to agent ID
 */
export function modeToAgentId(mode: Mode): AgentId {
  switch (mode) {
    case 'manage':
      return 'manager';
    case 'develop':
      return 'muse';
    case 'organize':
      return 'librarian';
    case 'experience':
      return 'biographer';
  }
}

/**
 * Convert agent ID to mode
 */
export function agentIdToMode(agentId: AgentId): Mode {
  return AGENT_CONFIGS[agentId].mode;
}
