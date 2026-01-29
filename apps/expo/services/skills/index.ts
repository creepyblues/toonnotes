/**
 * Skill System - MODE Framework v2.0
 *
 * Skills are the building blocks of agent intelligence. Each skill:
 * - Has trigger conditions that determine when it activates
 * - Executes logic to generate nudges or auto-actions
 * - Tracks its own cooldown to prevent spam
 * - Can be enabled/disabled independently
 *
 * This file provides the core skill infrastructure and registry.
 */

import {
  AgentId,
  Note,
  NoteBehavior,
  NudgeDeliveryChannel,
  NudgeOption,
  NudgePriority,
  SkillTrigger,
  SkillTriggerType,
} from '@/types';

// Re-export types from Agent
export type {
  Skill,
  SkillContext,
  SkillResult,
  NudgeParams,
  AutoAction,
} from '../agents/Agent';

// ============================================
// Skill Builder
// ============================================

import type { Skill, SkillContext, SkillResult, NudgeParams } from '../agents/Agent';

/**
 * Options for creating a skill
 */
export interface SkillOptions {
  id: string;
  name: string;
  description: string;
  agentId: AgentId;
  cooldownMs?: number;
  enabled?: boolean;
}

/**
 * Fluent builder for creating skills
 */
export class SkillBuilder {
  private options: SkillOptions;
  private triggers: SkillTrigger[] = [];
  private shouldTriggerFn?: (context: SkillContext) => boolean;
  private executeFn?: (context: SkillContext) => Promise<SkillResult>;

  constructor(options: SkillOptions) {
    this.options = {
      cooldownMs: 60 * 60 * 1000, // 1 hour default
      enabled: true,
      ...options,
    };
  }

  /**
   * Add an event trigger
   */
  onEvent(event: string, threshold?: number): this {
    this.triggers.push({
      type: 'event',
      condition: { type: 'event', event, threshold },
    });
    return this;
  }

  /**
   * Add a pattern trigger
   */
  onPattern(pattern: string, threshold?: number): this {
    this.triggers.push({
      type: 'pattern',
      condition: { type: 'pattern', pattern, threshold },
    });
    return this;
  }

  /**
   * Add a time-based trigger
   */
  onSchedule(schedule: string): this {
    this.triggers.push({
      type: 'time',
      condition: { type: 'time', schedule },
    });
    return this;
  }

  /**
   * Add a manual trigger
   */
  onManual(): this {
    this.triggers.push({
      type: 'manual',
      condition: { type: 'manual' },
    });
    return this;
  }

  /**
   * Set cooldown in milliseconds
   */
  withCooldown(ms: number): this {
    this.options.cooldownMs = ms;
    return this;
  }

  /**
   * Set cooldown in hours
   */
  withCooldownHours(hours: number): this {
    this.options.cooldownMs = hours * 60 * 60 * 1000;
    return this;
  }

  /**
   * Set cooldown in days
   */
  withCooldownDays(days: number): this {
    this.options.cooldownMs = days * 24 * 60 * 60 * 1000;
    return this;
  }

  /**
   * Set custom trigger condition
   */
  when(fn: (context: SkillContext) => boolean): this {
    this.shouldTriggerFn = fn;
    return this;
  }

  /**
   * Set execution logic
   */
  do(fn: (context: SkillContext) => Promise<SkillResult>): this {
    this.executeFn = fn;
    return this;
  }

  /**
   * Build the skill
   */
  build(): Skill {
    if (!this.executeFn) {
      throw new Error(`Skill ${this.options.id} must have an execute function`);
    }

    const defaultShouldTrigger = (context: SkillContext): boolean => {
      // Default: trigger on any event or pattern match
      return this.triggers.length > 0;
    };

    return {
      id: this.options.id,
      name: this.options.name,
      description: this.options.description,
      triggers: this.triggers,
      cooldownMs: this.options.cooldownMs!,
      enabled: this.options.enabled!,
      shouldTrigger: this.shouldTriggerFn ?? defaultShouldTrigger,
      execute: this.executeFn,
    };
  }
}

/**
 * Factory function to create a skill builder
 */
export function defineSkill(options: SkillOptions): SkillBuilder {
  return new SkillBuilder(options);
}

// ============================================
// Skill Registry
// ============================================

/**
 * Global registry for all skills
 */
class SkillRegistry {
  private skills: Map<string, Skill> = new Map();
  private skillsByAgent: Map<AgentId, Set<string>> = new Map();

  constructor() {
    // Initialize agent skill sets
    this.skillsByAgent.set('manager', new Set());
    this.skillsByAgent.set('muse', new Set());
    this.skillsByAgent.set('librarian', new Set());
    this.skillsByAgent.set('biographer', new Set());
  }

  /**
   * Register a skill
   */
  register(skill: Skill, agentId: AgentId): void {
    this.skills.set(skill.id, skill);
    this.skillsByAgent.get(agentId)?.add(skill.id);
    console.log(`[SkillRegistry] Registered skill: ${skill.id} for agent: ${agentId}`);
  }

  /**
   * Unregister a skill
   */
  unregister(skillId: string): void {
    this.skills.delete(skillId);
    for (const agentSkills of this.skillsByAgent.values()) {
      agentSkills.delete(skillId);
    }
  }

  /**
   * Get a skill by ID
   */
  get(skillId: string): Skill | undefined {
    return this.skills.get(skillId);
  }

  /**
   * Get all skills
   */
  getAll(): Skill[] {
    return Array.from(this.skills.values());
  }

  /**
   * Get skills for a specific agent
   */
  getForAgent(agentId: AgentId): Skill[] {
    const skillIds = this.skillsByAgent.get(agentId);
    if (!skillIds) return [];

    return Array.from(skillIds)
      .map((id) => this.skills.get(id))
      .filter((skill): skill is Skill => skill !== undefined);
  }

  /**
   * Enable a skill
   */
  enable(skillId: string): void {
    const skill = this.skills.get(skillId);
    if (skill) {
      skill.enabled = true;
    }
  }

  /**
   * Disable a skill
   */
  disable(skillId: string): void {
    const skill = this.skills.get(skillId);
    if (skill) {
      skill.enabled = false;
    }
  }

  /**
   * Check if a skill is enabled
   */
  isEnabled(skillId: string): boolean {
    return this.skills.get(skillId)?.enabled ?? false;
  }
}

// Singleton instance
export const skillRegistry = new SkillRegistry();

// ============================================
// Nudge Helper Functions
// ============================================

/**
 * Create a simple nudge result
 */
export function createNudgeResult(params: NudgeParams): SkillResult {
  return {
    shouldNudge: true,
    nudgeParams: params,
  };
}

/**
 * Create a no-action result
 */
export function noAction(): SkillResult {
  return {
    shouldNudge: false,
  };
}

/**
 * Create dismiss option
 */
export function dismissOption(label: string = 'Dismiss'): NudgeOption {
  return {
    id: 'dismiss',
    label,
    action: { type: 'dismiss' },
    isPrimary: false,
  };
}

/**
 * Create snooze option
 */
export function snoozeOption(hours: number, label?: string): NudgeOption {
  return {
    id: `snooze_${hours}h`,
    label: label ?? `Remind me in ${hours}h`,
    action: { type: 'snooze', duration: hours * 60 * 60 * 1000 },
    isPrimary: false,
  };
}

/**
 * Create navigate option
 */
export function navigateOption(target: string, label: string, isPrimary: boolean = true): NudgeOption {
  return {
    id: `nav_${target.replace(/\//g, '_')}`,
    label,
    action: { type: 'navigate', target },
    isPrimary,
  };
}

/**
 * Create custom action option
 */
export function customOption(
  id: string,
  label: string,
  handler: string,
  data?: Record<string, unknown>,
  isPrimary: boolean = false
): NudgeOption {
  return {
    id,
    label,
    action: { type: 'custom', handler, data },
    isPrimary,
  };
}

// ============================================
// Skill ID Constants
// ============================================

/**
 * Manager Agent Skills
 */
export const MANAGER_SKILLS = {
  DEADLINE_NUDGE: 'mgr-deadline',
  RELEVANCE_CHECK: 'mgr-relevance',
  TASK_DECOMPOSE: 'mgr-decompose',
  COMPLETION_CELEBRATE: 'mgr-celebrate',
  PRIORITY_SORT: 'mgr-priority',
  CHECKLIST_GENERATE: 'mgr-checklist',
} as const;

/**
 * Muse Agent Skills
 */
export const MUSE_SKILLS = {
  IDEA_EXPAND: 'muse-expand',
  IDEA_RESURFACE: 'muse-resurface',
  IDEA_CONNECT: 'muse-connect',
  CREATIVE_UNBLOCK: 'muse-unblock',
  MODE_BRIDGE: 'muse-bridge',
} as const;

/**
 * Librarian Agent Skills
 */
export const LIBRARIAN_SKILLS = {
  AUTO_ENRICH: 'lib-enrich',
  DAILY_SWEEP: 'lib-daily',
  WEEKLY_REVIEW: 'lib-weekly',
  FORCE_DECISION: 'lib-monthly',
  AUTO_CATEGORIZE: 'lib-categorize',
  DEDUPLICATION: 'lib-dedupe',
  AUTO_TAG: 'lib-autotag',
  AUTO_FORMAT: 'lib-format',
  URL_SUMMARIZE: 'lib-summarize',
  CONTEXTUAL_SURFACE: 'lib-surface',
  ARCHIVE_SUGGEST: 'lib-archive',
  FLASHCARD_EXTRACT: 'lib-flashcard',
  SPACED_SCHEDULE: 'lib-schedule',
  REVIEW_PROMPT: 'lib-review',
  ADAPT_SCHEDULE: 'lib-adapt',
  GRADUATION: 'lib-graduate',
} as const;

/**
 * Biographer Agent Skills
 */
export const BIOGRAPHER_SKILLS = {
  GENTLE_NUDGE: 'bio-nudge',
  REENGAGE: 'bio-reengage',
  MEDIA_ENRICH: 'bio-enrich',
  PATTERN_ALERT: 'bio-pattern',
  TIME_CAPSULE: 'bio-timecapsule',
  MEMORY_LINK: 'bio-link',
  TRIP_WRAPUP: 'bio-wrapup',
} as const;

/**
 * All skill IDs
 */
export const ALL_SKILL_IDS = {
  ...MANAGER_SKILLS,
  ...MUSE_SKILLS,
  ...LIBRARIAN_SKILLS,
  ...BIOGRAPHER_SKILLS,
} as const;

export type SkillId = typeof ALL_SKILL_IDS[keyof typeof ALL_SKILL_IDS];
