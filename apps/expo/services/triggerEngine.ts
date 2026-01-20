/**
 * Trigger Engine - MODE Framework v2.0
 *
 * Evaluates skill triggers and determines when skills should activate.
 * Supports multiple trigger types:
 * - Event triggers: React to specific events (note_created, note_updated, etc.)
 * - Pattern triggers: Match behavioral patterns (no_deadline, untouched_7_days, etc.)
 * - Time triggers: Schedule-based activation
 * - Manual triggers: User-initiated
 *
 * The engine also manages cooldowns and deduplication.
 */

import {
  Note,
  NoteBehavior,
  ManageData,
  DevelopData,
  OrganizeData,
  ExperienceData,
  SkillTrigger,
  SkillTriggerCondition,
  SkillTriggerType,
} from '@/types';
import { useNudgeStore } from '@/stores/nudgeStore';
import { useBehaviorStore } from '@/stores/behaviorStore';
import type { Skill, SkillContext } from './agents/Agent';
import { skillRegistry } from './skills';
import { behaviorLearner } from './behaviorLearner';

// ============================================
// Event Types
// ============================================

/**
 * Events that can trigger skills
 */
export type TriggerEvent =
  | 'note_created'
  | 'note_updated'
  | 'note_accessed'
  | 'note_archived'
  | 'note_deleted'
  | 'board_created'
  | 'board_accessed'
  | 'label_added'
  | 'label_removed'
  | 'task_completed'
  | 'task_created'
  | 'daily_check'
  | 'weekly_check'
  | 'app_opened'
  | 'app_backgrounded';

/**
 * Event payload
 */
export interface TriggerEventPayload {
  event: TriggerEvent;
  noteId?: string;
  boardId?: string;
  labelName?: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// ============================================
// Pattern Definitions
// ============================================

/**
 * Pattern matchers for behavioral triggers
 */
type PatternMatcher = (note: Note, behavior: NoteBehavior) => boolean;

const PATTERN_MATCHERS: Record<string, PatternMatcher> = {
  // MANAGE patterns
  no_deadline: (note, behavior) => {
    if (behavior.mode !== 'manage') return false;
    const data = behavior.modeData as ManageData;
    return !data.hasDeadline;
  },

  no_priority: (note, behavior) => {
    if (behavior.mode !== 'manage') return false;
    const data = behavior.modeData as ManageData;
    return !data.hasPriority;
  },

  has_subtasks_incomplete: (note, behavior) => {
    if (behavior.mode !== 'manage') return false;
    const data = behavior.modeData as ManageData;
    return data.hasSubtasks && (data.completedSubtasks ?? 0) < (data.subtaskCount ?? 0);
  },

  task_completed: (note, behavior) => {
    if (behavior.mode !== 'manage') return false;
    const data = behavior.modeData as ManageData;
    return !!data.completedAt;
  },

  // DEVELOP patterns
  single_line_idea: (note, behavior) => {
    if (behavior.mode !== 'develop') return false;
    const lines = note.content.split('\n').filter((l) => l.trim().length > 0);
    return lines.length <= 2 && note.content.length < 200;
  },

  idea_unexpanded: (note, behavior) => {
    if (behavior.mode !== 'develop') return false;
    const data = behavior.modeData as DevelopData;
    return data.expansionCount === 0;
  },

  idea_mature: (note, behavior) => {
    if (behavior.mode !== 'develop') return false;
    const data = behavior.modeData as DevelopData;
    return data.maturityLevel === 'developed' || data.maturityLevel === 'ready';
  },

  // ORGANIZE patterns
  in_inbox: (note, behavior) => {
    if (behavior.mode !== 'organize') return false;
    const data = behavior.modeData as OrganizeData;
    return data.stage === 'inbox';
  },

  has_url: (note) => {
    return /https?:\/\/[^\s]+/.test(note.content);
  },

  no_tags: (note, behavior) => {
    if (behavior.mode !== 'organize') return false;
    const data = behavior.modeData as OrganizeData;
    return data.tags.length === 0;
  },

  needs_review: (note, behavior) => {
    if (behavior.mode !== 'organize') return false;
    const data = behavior.modeData as OrganizeData;
    if (data.stage !== 'learn' || !data.nextReviewAt) return false;
    return Date.now() >= data.nextReviewAt;
  },

  // EXPERIENCE patterns
  no_media: (note, behavior) => {
    if (behavior.mode !== 'experience') return false;
    const data = behavior.modeData as ExperienceData;
    return !data.hasMedia;
  },

  no_location: (note, behavior) => {
    if (behavior.mode !== 'experience') return false;
    const data = behavior.modeData as ExperienceData;
    return !data.hasLocation;
  },

  short_entry: (note, behavior) => {
    if (behavior.mode !== 'experience') return false;
    return note.content.length < 100;
  },

  // Time-based patterns (require threshold in days)
  untouched: (note, behavior) => {
    // This pattern requires a threshold, handled specially
    return true;
  },
};

/**
 * Check if a pattern matches with optional threshold
 */
function matchPattern(
  pattern: string,
  note: Note,
  behavior: NoteBehavior,
  threshold?: number
): boolean {
  // Handle time-based patterns with thresholds
  if (pattern.includes('_days')) {
    const baseName = pattern.replace(/_\d+_days$/, '');
    const daysMatch = pattern.match(/_(\d+)_days$/);
    const days = daysMatch ? parseInt(daysMatch[1], 10) : threshold ?? 7;
    const thresholdMs = days * 24 * 60 * 60 * 1000;
    const timeSinceAccess = Date.now() - behavior.lastAccessedAt;
    return timeSinceAccess >= thresholdMs;
  }

  // Handle 'untouched' pattern with explicit threshold
  if (pattern === 'untouched' && threshold) {
    const thresholdMs = threshold * 24 * 60 * 60 * 1000;
    const timeSinceAccess = Date.now() - behavior.lastAccessedAt;
    return timeSinceAccess >= thresholdMs;
  }

  // Standard pattern matching
  const matcher = PATTERN_MATCHERS[pattern];
  if (!matcher) {
    console.warn(`[TriggerEngine] Unknown pattern: ${pattern}`);
    return false;
  }

  return matcher(note, behavior);
}

// ============================================
// Trigger Evaluation
// ============================================

/**
 * Evaluate a single trigger condition
 */
function evaluateTriggerCondition(
  condition: SkillTriggerCondition,
  context: SkillContext,
  event?: TriggerEventPayload
): boolean {
  switch (condition.type) {
    case 'event':
      // Check if the event matches
      if (!event || !condition.event) return false;
      return event.event === condition.event;

    case 'pattern':
      // Check if the pattern matches
      if (!condition.pattern || !context.note || !context.behavior) return false;
      return matchPattern(condition.pattern, context.note, context.behavior, condition.threshold);

    case 'time':
      // Time triggers are handled by a scheduler, not inline
      // This just checks if we're within the scheduled window
      // For now, always return false (handled externally)
      return false;

    case 'manual':
      // Manual triggers only fire when explicitly called
      return false;

    default:
      return false;
  }
}

/**
 * Evaluate all triggers for a skill
 */
function evaluateSkillTriggers(
  skill: Skill,
  context: SkillContext,
  event?: TriggerEventPayload
): boolean {
  // If no triggers defined, skill doesn't auto-trigger
  if (skill.triggers.length === 0) return false;

  // Check if ANY trigger matches (OR logic)
  return skill.triggers.some((trigger) =>
    evaluateTriggerCondition(trigger.condition, context, event)
  );
}

// ============================================
// Cooldown Management
// ============================================

/**
 * Check if a skill is on cooldown
 */
function isOnCooldown(skillId: string): boolean {
  return useNudgeStore.getState().isSkillOnCooldown(skillId);
}

/**
 * Set cooldown for a skill
 */
function setCooldown(skillId: string, durationMs: number): void {
  useNudgeStore.getState().setSkillCooldown(skillId, durationMs);
}

// ============================================
// Main Trigger Engine
// ============================================

/**
 * Context for trigger evaluation
 */
export interface TriggerContext {
  note?: Note;
  behavior?: NoteBehavior;
  boardId?: string;
  boardHashtag?: string;
}

/**
 * Result from trigger evaluation
 */
export interface TriggerEvaluationResult {
  skill: Skill;
  triggered: boolean;
  reason?: string;
  cooldownRemaining?: number;
}

/**
 * Trigger Engine - evaluates skills and manages activation
 */
export class TriggerEngine {
  private static instance: TriggerEngine;

  private constructor() {}

  static getInstance(): TriggerEngine {
    if (!TriggerEngine.instance) {
      TriggerEngine.instance = new TriggerEngine();
    }
    return TriggerEngine.instance;
  }

  /**
   * Process an event and find triggered skills
   */
  async processEvent(
    event: TriggerEventPayload,
    context: TriggerContext
  ): Promise<TriggerEvaluationResult[]> {
    const results: TriggerEvaluationResult[] = [];
    const skills = skillRegistry.getAll();

    // Get recent behavior history for pattern detection
    const allBehaviors = Object.values(useBehaviorStore.getState().behaviors);
    const behaviorHistory = allBehaviors
      .filter(b => context.behavior ? b.mode === context.behavior.mode : true)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 20); // Last 20 behaviors for pattern analysis

    const skillContext: SkillContext = {
      note: context.note,
      behavior: context.behavior,
      boardId: context.boardId,
      boardHashtag: context.boardHashtag,
      timestamp: event.timestamp,
      behaviorHistory,
    };

    for (const skill of skills) {
      // Skip disabled skills
      if (!skill.enabled) {
        results.push({
          skill,
          triggered: false,
          reason: 'disabled',
        });
        continue;
      }

      // Check cooldown
      if (isOnCooldown(skill.id)) {
        const cooldownEnd = useNudgeStore.getState().skillCooldowns[skill.id];
        results.push({
          skill,
          triggered: false,
          reason: 'cooldown',
          cooldownRemaining: cooldownEnd - Date.now(),
        });
        continue;
      }

      // Check if skill is suppressed due to user behavior (frequent dismissals)
      if (behaviorLearner.shouldSuppressSkill(skill.id)) {
        results.push({
          skill,
          triggered: false,
          reason: 'suppressed',
        });
        continue;
      }

      // Evaluate triggers
      const shouldTrigger = evaluateSkillTriggers(skill, skillContext, event);

      // Also check custom shouldTrigger if defined
      const customShouldTrigger = skill.shouldTrigger(skillContext);

      const triggered = shouldTrigger || customShouldTrigger;

      results.push({
        skill,
        triggered,
        reason: triggered ? 'matched' : 'no_match',
      });

      // Set cooldown if triggered
      if (triggered) {
        setCooldown(skill.id, skill.cooldownMs);
      }
    }

    return results;
  }

  /**
   * Manually trigger a specific skill
   */
  async manualTrigger(
    skillId: string,
    context: TriggerContext
  ): Promise<TriggerEvaluationResult | null> {
    const skill = skillRegistry.get(skillId);
    if (!skill) {
      console.warn(`[TriggerEngine] Skill not found: ${skillId}`);
      return null;
    }

    if (!skill.enabled) {
      return {
        skill,
        triggered: false,
        reason: 'disabled',
      };
    }

    // Bypass cooldown for manual triggers
    const skillContext: SkillContext = {
      note: context.note,
      behavior: context.behavior,
      boardId: context.boardId,
      boardHashtag: context.boardHashtag,
      timestamp: Date.now(),
    };

    return {
      skill,
      triggered: true,
      reason: 'manual',
    };
  }

  /**
   * Find all skills that would trigger for a given context (without event)
   */
  findTriggeredSkills(context: TriggerContext): Skill[] {
    const skills = skillRegistry.getAll();
    const triggered: Skill[] = [];

    const skillContext: SkillContext = {
      note: context.note,
      behavior: context.behavior,
      boardId: context.boardId,
      boardHashtag: context.boardHashtag,
      timestamp: Date.now(),
    };

    for (const skill of skills) {
      if (!skill.enabled) continue;
      if (isOnCooldown(skill.id)) continue;

      // Check pattern-based triggers only (no event)
      const hasPatternTrigger = skill.triggers.some((t) => t.type === 'pattern');
      if (!hasPatternTrigger) continue;

      const shouldTrigger = skill.shouldTrigger(skillContext);
      if (shouldTrigger) {
        triggered.push(skill);
      }
    }

    return triggered;
  }

  /**
   * Run daily checks for all notes
   */
  async runDailyChecks(): Promise<void> {
    const behaviors = useBehaviorStore.getState().behaviors;

    for (const behavior of Object.values(behaviors)) {
      // Create synthetic event for daily check
      const event: TriggerEventPayload = {
        event: 'daily_check',
        noteId: behavior.noteId,
        timestamp: Date.now(),
      };

      // Get the note from store (lazy import to avoid circular dep)
      const { useNoteStore } = require('@/stores');
      const note = useNoteStore.getState().notes.find(
        (n: Note) => n.id === behavior.noteId
      );

      if (note) {
        await this.processEvent(event, { note, behavior });
      }
    }
  }

  /**
   * Run weekly checks for all notes
   */
  async runWeeklyChecks(): Promise<void> {
    const behaviors = useBehaviorStore.getState().behaviors;

    for (const behavior of Object.values(behaviors)) {
      const event: TriggerEventPayload = {
        event: 'weekly_check',
        noteId: behavior.noteId,
        timestamp: Date.now(),
      };

      const { useNoteStore } = require('@/stores');
      const note = useNoteStore.getState().notes.find(
        (n: Note) => n.id === behavior.noteId
      );

      if (note) {
        await this.processEvent(event, { note, behavior });
      }
    }
  }
}

// Export singleton instance
export const triggerEngine = TriggerEngine.getInstance();

// ============================================
// Event Emitter Helpers
// ============================================

/**
 * Emit a trigger event (convenience function)
 */
export async function emitTriggerEvent(
  event: TriggerEvent,
  context: TriggerContext & { metadata?: Record<string, unknown> }
): Promise<TriggerEvaluationResult[]> {
  const payload: TriggerEventPayload = {
    event,
    noteId: context.note?.id,
    boardId: context.boardId,
    timestamp: Date.now(),
    metadata: context.metadata,
  };

  return triggerEngine.processEvent(payload, context);
}

/**
 * Emit note_created event
 */
export function onNoteCreated(note: Note, behavior?: NoteBehavior) {
  return emitTriggerEvent('note_created', { note, behavior });
}

/**
 * Emit note_updated event
 */
export function onNoteUpdated(note: Note, behavior?: NoteBehavior) {
  return emitTriggerEvent('note_updated', { note, behavior });
}

/**
 * Emit note_accessed event
 */
export function onNoteAccessed(note: Note, behavior?: NoteBehavior) {
  return emitTriggerEvent('note_accessed', { note, behavior });
}

/**
 * Emit task_completed event
 */
export function onTaskCompleted(note: Note, behavior?: NoteBehavior) {
  return emitTriggerEvent('task_completed', { note, behavior });
}

/**
 * Emit label_added event
 */
export function onLabelAdded(note: Note, labelName: string, behavior?: NoteBehavior) {
  return emitTriggerEvent('label_added', {
    note,
    behavior,
    metadata: { labelName },
  });
}
