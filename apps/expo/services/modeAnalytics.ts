/**
 * MODE Framework Analytics - v2.0
 *
 * Analytics tracking for MODE Framework events including:
 * - Agent interactions
 * - Skill triggers
 * - Nudge outcomes
 * - Mode transitions
 * - Behavior patterns
 */

import { trackEvent, setUserProperty } from './firebaseAnalytics';
import type { AgentId, Mode, NudgeOutcome, NudgePriority, NudgeDeliveryChannel } from '@/types';

// ============================================
// Event Names (Object_Action convention)
// ============================================

const MODE_EVENTS = {
  // Agent Events
  AGENT_ENABLED: 'agent_enabled',
  AGENT_DISABLED: 'agent_disabled',
  AGENT_SKILL_TRIGGERED: 'agent_skill_triggered',

  // Nudge Events
  NUDGE_SHOWN: 'nudge_shown',
  NUDGE_ACCEPTED: 'nudge_accepted',
  NUDGE_DISMISSED: 'nudge_dismissed',
  NUDGE_SNOOZED: 'nudge_snoozed',
  NUDGE_IGNORED: 'nudge_ignored',
  NUDGE_EXPIRED: 'nudge_expired',

  // Mode Events
  MODE_ASSIGNED: 'mode_assigned',
  MODE_CHANGED: 'mode_changed',
  MODE_BRIDGE_SUGGESTED: 'mode_bridge_suggested',
  MODE_BRIDGE_ACCEPTED: 'mode_bridge_accepted',

  // Skill Events
  SKILL_CONFIDENCE_LOW: 'skill_confidence_low',
  SKILL_SUPPRESSED: 'skill_suppressed',
  SKILL_REACTIVATED: 'skill_reactivated',

  // Behavior Learning Events
  PATTERN_DETECTED: 'pattern_detected',
  PREFERENCE_LEARNED: 'preference_learned',
  LEARNING_RESET: 'learning_reset',

  // Usefulness Events
  USEFULNESS_MILESTONE: 'usefulness_milestone',
  NOTE_BECAME_USEFUL: 'note_became_useful',
} as const;

// ============================================
// Agent Analytics
// ============================================

/**
 * Track agent enabled/disabled
 */
export function trackAgentToggle(agentId: AgentId, enabled: boolean) {
  trackEvent(enabled ? MODE_EVENTS.AGENT_ENABLED : MODE_EVENTS.AGENT_DISABLED, {
    agent_id: agentId,
  });
}

/**
 * Track skill triggered
 */
export function trackSkillTriggered(
  skillId: string,
  agentId: AgentId,
  noteId?: string,
  boardId?: string
) {
  trackEvent(MODE_EVENTS.AGENT_SKILL_TRIGGERED, {
    skill_id: skillId,
    agent_id: agentId,
    has_note: noteId ? 'true' : 'false',
    has_board: boardId ? 'true' : 'false',
  });
}

// ============================================
// Nudge Analytics
// ============================================

/**
 * Track nudge shown to user
 */
export function trackNudgeShown(params: {
  nudgeId: string;
  skillId: string;
  agentId: AgentId;
  priority: NudgePriority;
  channel: NudgeDeliveryChannel;
}) {
  trackEvent(MODE_EVENTS.NUDGE_SHOWN, {
    nudge_id: params.nudgeId,
    skill_id: params.skillId,
    agent_id: params.agentId,
    priority: params.priority,
    channel: params.channel,
  });
}

/**
 * Track nudge outcome
 */
export function trackNudgeOutcome(params: {
  nudgeId: string;
  skillId: string;
  agentId: AgentId;
  outcome: NudgeOutcome;
  responseTimeMs?: number;
}) {
  const eventName = {
    accepted: MODE_EVENTS.NUDGE_ACCEPTED,
    dismissed: MODE_EVENTS.NUDGE_DISMISSED,
    snoozed: MODE_EVENTS.NUDGE_SNOOZED,
    ignored: MODE_EVENTS.NUDGE_IGNORED,
    expired: MODE_EVENTS.NUDGE_EXPIRED,
  }[params.outcome] || MODE_EVENTS.NUDGE_DISMISSED;

  trackEvent(eventName, {
    nudge_id: params.nudgeId,
    skill_id: params.skillId,
    agent_id: params.agentId,
    response_time_ms: params.responseTimeMs || 0,
  });
}

// ============================================
// Mode Analytics
// ============================================

/**
 * Track mode assigned to note/board
 */
export function trackModeAssigned(params: {
  mode: Mode;
  targetType: 'note' | 'board';
  targetId: string;
  isAutoDetected: boolean;
}) {
  trackEvent(MODE_EVENTS.MODE_ASSIGNED, {
    mode: params.mode,
    target_type: params.targetType,
    is_auto_detected: params.isAutoDetected ? 'true' : 'false',
  });
}

/**
 * Track mode change
 */
export function trackModeChanged(params: {
  fromMode: Mode;
  toMode: Mode;
  targetType: 'note' | 'board';
  targetId: string;
  reason?: string;
}) {
  trackEvent(MODE_EVENTS.MODE_CHANGED, {
    from_mode: params.fromMode,
    to_mode: params.toMode,
    target_type: params.targetType,
    reason: params.reason || 'user_action',
  });
}

/**
 * Track mode bridge suggestion
 */
export function trackModeBridgeSuggested(params: {
  fromMode: Mode;
  toMode: Mode;
  noteId: string;
}) {
  trackEvent(MODE_EVENTS.MODE_BRIDGE_SUGGESTED, {
    from_mode: params.fromMode,
    to_mode: params.toMode,
  });
}

/**
 * Track mode bridge accepted
 */
export function trackModeBridgeAccepted(params: {
  fromMode: Mode;
  toMode: Mode;
  noteId: string;
}) {
  trackEvent(MODE_EVENTS.MODE_BRIDGE_ACCEPTED, {
    from_mode: params.fromMode,
    to_mode: params.toMode,
  });
}

// ============================================
// Skill Analytics
// ============================================

/**
 * Track skill confidence dropping below threshold
 */
export function trackSkillConfidenceLow(skillId: string, confidence: number) {
  trackEvent(MODE_EVENTS.SKILL_CONFIDENCE_LOW, {
    skill_id: skillId,
    confidence: Math.round(confidence * 100),
  });
}

/**
 * Track skill being suppressed due to low engagement
 */
export function trackSkillSuppressed(skillId: string, reason: string) {
  trackEvent(MODE_EVENTS.SKILL_SUPPRESSED, {
    skill_id: skillId,
    reason,
  });
}

/**
 * Track skill reactivated after confidence improved
 */
export function trackSkillReactivated(skillId: string) {
  trackEvent(MODE_EVENTS.SKILL_REACTIVATED, {
    skill_id: skillId,
  });
}

// ============================================
// Behavior Learning Analytics
// ============================================

/**
 * Track pattern detected
 */
export function trackPatternDetected(params: {
  patternType: 'active_hours' | 'journaling_time' | 'mode_preference' | 'nudge_preference';
  value: string;
}) {
  trackEvent(MODE_EVENTS.PATTERN_DETECTED, {
    pattern_type: params.patternType,
    pattern_value: params.value,
  });
}

/**
 * Track preference learned
 */
export function trackPreferenceLearned(params: {
  preferenceType: string;
  value: string;
}) {
  trackEvent(MODE_EVENTS.PREFERENCE_LEARNED, {
    preference_type: params.preferenceType,
    preference_value: params.value,
  });
}

/**
 * Track learning data reset
 */
export function trackLearningReset() {
  trackEvent(MODE_EVENTS.LEARNING_RESET, {});
}

// ============================================
// Usefulness Analytics
// ============================================

/**
 * Track usefulness milestone
 */
export function trackUsefulnessMilestone(params: {
  mode: Mode;
  level: string;
  noteId: string;
}) {
  trackEvent(MODE_EVENTS.USEFULNESS_MILESTONE, {
    mode: params.mode,
    level: params.level,
  });
}

/**
 * Track note becoming "useful" (crossing threshold)
 */
export function trackNoteBecameUseful(params: {
  mode: Mode;
  noteId: string;
  daysToUseful: number;
}) {
  trackEvent(MODE_EVENTS.NOTE_BECAME_USEFUL, {
    mode: params.mode,
    days_to_useful: params.daysToUseful,
  });
}

// ============================================
// User Properties
// ============================================

/**
 * Set MODE-related user properties
 */
export function setModeUserProperties(params: {
  primaryMode?: Mode;
  nudgeResponseRate?: number;
  totalNudgesReceived?: number;
  agentsEnabled?: AgentId[];
}) {
  if (params.primaryMode) {
    setUserProperty('primary_mode', params.primaryMode);
  }
  if (params.nudgeResponseRate !== undefined) {
    setUserProperty('nudge_response_rate', String(Math.round(params.nudgeResponseRate * 100)));
  }
  if (params.totalNudgesReceived !== undefined) {
    // Bucket into ranges for privacy
    let bucket = '0';
    if (params.totalNudgesReceived > 100) bucket = '100+';
    else if (params.totalNudgesReceived > 50) bucket = '51-100';
    else if (params.totalNudgesReceived > 20) bucket = '21-50';
    else if (params.totalNudgesReceived > 10) bucket = '11-20';
    else if (params.totalNudgesReceived > 0) bucket = '1-10';
    setUserProperty('nudge_bucket', bucket);
  }
  if (params.agentsEnabled) {
    setUserProperty('agents_enabled', params.agentsEnabled.join(','));
  }
}

// ============================================
// Aggregate Tracking
// ============================================

/**
 * Track daily MODE framework stats (call once per day)
 */
export function trackDailyModeStats(params: {
  notesCreated: number;
  nudgesShown: number;
  nudgesAccepted: number;
  modeChanges: number;
  skillTriggersTotal: number;
}) {
  trackEvent('mode_daily_stats', {
    notes_created: params.notesCreated,
    nudges_shown: params.nudgesShown,
    nudges_accepted: params.nudgesAccepted,
    acceptance_rate: params.nudgesShown > 0
      ? Math.round((params.nudgesAccepted / params.nudgesShown) * 100)
      : 0,
    mode_changes: params.modeChanges,
    skill_triggers: params.skillTriggersTotal,
  });
}

export default {
  trackAgentToggle,
  trackSkillTriggered,
  trackNudgeShown,
  trackNudgeOutcome,
  trackModeAssigned,
  trackModeChanged,
  trackModeBridgeSuggested,
  trackModeBridgeAccepted,
  trackSkillConfidenceLow,
  trackSkillSuppressed,
  trackSkillReactivated,
  trackPatternDetected,
  trackPreferenceLearned,
  trackLearningReset,
  trackUsefulnessMilestone,
  trackNoteBecameUseful,
  setModeUserProperties,
  trackDailyModeStats,
};
