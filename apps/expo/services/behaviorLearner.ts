/**
 * Behavior Learner Service - MODE Framework v2.0
 *
 * Learns from user interactions to improve nudge timing, relevance,
 * and personalization. Tracks patterns across sessions and adapts
 * agent behavior accordingly.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Mode,
  NoteBehavior,
  UserPatterns,
  NudgeDeliveryChannel,
  Nudge,
} from '@/types';

// ============================================
// Constants
// ============================================

const STORAGE_KEY = 'behavior_learner_data';
const PATTERN_UPDATE_DEBOUNCE_MS = 5000;
const MIN_EVENTS_FOR_PATTERN = 5;

// ============================================
// Types
// ============================================

export interface UserEvent {
  type: UserEventType;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export type UserEventType =
  | 'app_opened'
  | 'note_created'
  | 'note_updated'
  | 'note_viewed'
  | 'nudge_shown'
  | 'nudge_accepted'
  | 'nudge_dismissed'
  | 'nudge_snoozed'
  | 'nudge_ignored'
  | 'mode_changed'
  | 'skill_triggered';

export interface NudgeOutcome {
  nudgeId: string;
  skillId: string;
  agentId: string;
  outcome: 'accepted' | 'dismissed' | 'snoozed' | 'ignored';
  responseTimeMs?: number;
  timestamp: number;
}

export interface SkillConfidence {
  skillId: string;
  confidence: number; // 0-1
  totalShown: number;
  totalAccepted: number;
  lastUpdated: number;
}

export interface LearnerData {
  patterns: UserPatterns;
  skillConfidences: Record<string, SkillConfidence>;
  recentEvents: UserEvent[];
  nudgeOutcomes: NudgeOutcome[];
  lastUpdated: number;
}

// ============================================
// Default Values
// ============================================

const DEFAULT_PATTERNS: UserPatterns = {
  activeHours: [],
  journalingTime: undefined,
  taskCompletionTime: undefined,
  nudgeResponseRate: 0.5,
  preferredNudgeChannel: 'toast',
  dismissedSkillIds: [],
  averageNoteLength: 0,
  commonTags: [],
  modeDistribution: {
    manage: 0.25,
    develop: 0.25,
    organize: 0.25,
    experience: 0.25,
  },
  lastUpdatedAt: Date.now(),
};

const DEFAULT_LEARNER_DATA: LearnerData = {
  patterns: DEFAULT_PATTERNS,
  skillConfidences: {},
  recentEvents: [],
  nudgeOutcomes: [],
  lastUpdated: Date.now(),
};

// ============================================
// Behavior Learner Class
// ============================================

class BehaviorLearner {
  private data: LearnerData = DEFAULT_LEARNER_DATA;
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;
  private initialized = false;

  /**
   * Initialize the learner by loading persisted data
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.data = { ...DEFAULT_LEARNER_DATA, ...JSON.parse(stored) };
      }
      this.initialized = true;
      console.log('[BehaviorLearner] Initialized with data');
    } catch (error) {
      console.error('[BehaviorLearner] Failed to load data:', error);
      this.data = DEFAULT_LEARNER_DATA;
      this.initialized = true;
    }
  }

  /**
   * Save data with debouncing
   */
  private scheduleSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        console.log('[BehaviorLearner] Data saved');
      } catch (error) {
        console.error('[BehaviorLearner] Failed to save data:', error);
      }
    }, PATTERN_UPDATE_DEBOUNCE_MS);
  }

  // ============================================
  // Event Tracking
  // ============================================

  /**
   * Track a user event
   */
  trackEvent(event: UserEvent): void {
    // Keep only last 1000 events
    this.data.recentEvents = [
      event,
      ...this.data.recentEvents.slice(0, 999),
    ];

    // Update patterns based on event type
    this.updatePatternsFromEvent(event);

    this.data.lastUpdated = Date.now();
    this.scheduleSave();
  }

  /**
   * Update patterns based on event
   */
  private updatePatternsFromEvent(event: UserEvent): void {
    const hour = new Date(event.timestamp).getHours();

    switch (event.type) {
      case 'app_opened':
        this.recordActiveHour(hour);
        break;

      case 'note_created':
      case 'note_updated':
        this.recordActiveHour(hour);
        if (event.metadata?.mode) {
          this.updateModeDistribution(event.metadata.mode as Mode);
        }
        if (event.metadata?.contentLength) {
          this.updateAverageNoteLength(event.metadata.contentLength as number);
        }
        if (event.metadata?.tags) {
          this.updateCommonTags(event.metadata.tags as string[]);
        }
        break;

      case 'nudge_accepted':
      case 'nudge_dismissed':
      case 'nudge_snoozed':
      case 'nudge_ignored':
        this.updateNudgeResponseRate(event.type);
        break;
    }

    this.data.patterns.lastUpdatedAt = Date.now();
  }

  /**
   * Record an active hour
   */
  private recordActiveHour(hour: number): void {
    const hours = this.data.patterns.activeHours;
    if (!hours.includes(hour)) {
      // Keep top 8 most common hours
      const hourCounts = new Map<number, number>();
      for (const h of hours) {
        hourCounts.set(h, (hourCounts.get(h) || 0) + 1);
      }
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);

      const sorted = Array.from(hourCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([h]) => h);

      this.data.patterns.activeHours = sorted;
    }
  }

  /**
   * Update mode distribution
   */
  private updateModeDistribution(mode: Mode): void {
    const dist = this.data.patterns.modeDistribution;
    const total = Object.values(dist).reduce((sum, v) => sum + v, 0) + 1;

    // Increment the mode count
    dist[mode] = (dist[mode] || 0) + 1;

    // Normalize to percentages
    for (const m of Object.keys(dist) as Mode[]) {
      dist[m] = dist[m] / total;
    }
  }

  /**
   * Update average note length
   */
  private updateAverageNoteLength(length: number): void {
    const current = this.data.patterns.averageNoteLength;
    const eventCount = this.data.recentEvents.filter(
      e => e.type === 'note_created' || e.type === 'note_updated'
    ).length;

    // Rolling average
    this.data.patterns.averageNoteLength =
      (current * (eventCount - 1) + length) / eventCount;
  }

  /**
   * Update common tags
   */
  private updateCommonTags(tags: string[]): void {
    const tagCounts = new Map<string, number>();

    // Count existing tags
    for (const tag of this.data.patterns.commonTags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }

    // Add new tags
    for (const tag of tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }

    // Keep top 20 tags
    this.data.patterns.commonTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([tag]) => tag);
  }

  /**
   * Update nudge response rate
   */
  private updateNudgeResponseRate(eventType: UserEventType): void {
    const outcomes = this.data.nudgeOutcomes;
    const recentOutcomes = outcomes.slice(0, 50); // Last 50 nudges

    if (recentOutcomes.length === 0) return;

    const accepted = recentOutcomes.filter(o => o.outcome === 'accepted').length;
    this.data.patterns.nudgeResponseRate = accepted / recentOutcomes.length;
  }

  // ============================================
  // Pattern Retrieval
  // ============================================

  /**
   * Get learned patterns for a user
   */
  getPatterns(): UserPatterns {
    return { ...this.data.patterns };
  }

  /**
   * Predict best time to show a nudge for a skill
   */
  predictBestTime(skillId: string): Date {
    const activeHours = this.data.patterns.activeHours;

    if (activeHours.length === 0) {
      // Default to evening hours if no data
      const now = new Date();
      now.setHours(19, 0, 0, 0);
      return now;
    }

    // Find the next active hour from now
    const now = new Date();
    const currentHour = now.getHours();

    // Sort active hours
    const sortedHours = [...activeHours].sort((a, b) => a - b);

    // Find next active hour
    let nextHour = sortedHours.find(h => h > currentHour);
    if (!nextHour) {
      // Wrap to tomorrow
      nextHour = sortedHours[0];
      now.setDate(now.getDate() + 1);
    }

    now.setHours(nextHour, 0, 0, 0);
    return now;
  }

  /**
   * Check if a skill is frequently dismissed
   */
  isSkillFrequentlyDismissed(skillId: string): boolean {
    return this.data.patterns.dismissedSkillIds.includes(skillId);
  }

  // ============================================
  // Nudge Outcome Tracking
  // ============================================

  /**
   * Record a nudge outcome
   */
  recordNudgeOutcome(outcome: NudgeOutcome): void {
    // Keep last 200 outcomes
    this.data.nudgeOutcomes = [
      outcome,
      ...this.data.nudgeOutcomes.slice(0, 199),
    ];

    // Update skill confidence
    this.updateSkillConfidence(outcome);

    // Track if skill is being dismissed frequently
    this.trackDismissedSkills(outcome);

    // Track as event
    this.trackEvent({
      type: `nudge_${outcome.outcome}` as UserEventType,
      timestamp: outcome.timestamp,
      metadata: {
        nudgeId: outcome.nudgeId,
        skillId: outcome.skillId,
        agentId: outcome.agentId,
        responseTimeMs: outcome.responseTimeMs,
      },
    });
  }

  /**
   * Track skills that are frequently dismissed
   */
  private trackDismissedSkills(outcome: NudgeOutcome): void {
    const skillOutcomes = this.data.nudgeOutcomes.filter(
      o => o.skillId === outcome.skillId
    );

    if (skillOutcomes.length < MIN_EVENTS_FOR_PATTERN) return;

    const dismissRate = skillOutcomes.filter(
      o => o.outcome === 'dismissed'
    ).length / skillOutcomes.length;

    // If dismissed more than 70% of the time, mark as frequently dismissed
    if (dismissRate > 0.7) {
      if (!this.data.patterns.dismissedSkillIds.includes(outcome.skillId)) {
        this.data.patterns.dismissedSkillIds.push(outcome.skillId);
      }
    } else {
      // Remove from dismissed list if improved
      this.data.patterns.dismissedSkillIds =
        this.data.patterns.dismissedSkillIds.filter(
          id => id !== outcome.skillId
        );
    }
  }

  // ============================================
  // Skill Confidence
  // ============================================

  /**
   * Update skill confidence based on outcome
   */
  updateSkillConfidence(outcome: NudgeOutcome): void {
    const { skillId } = outcome;
    let confidence = this.data.skillConfidences[skillId];

    if (!confidence) {
      confidence = {
        skillId,
        confidence: 0.5, // Start at 50%
        totalShown: 0,
        totalAccepted: 0,
        lastUpdated: Date.now(),
      };
    }

    confidence.totalShown++;
    if (outcome.outcome === 'accepted') {
      confidence.totalAccepted++;
    }

    // Calculate new confidence with decay factor for recent outcomes
    const recentOutcomes = this.data.nudgeOutcomes
      .filter(o => o.skillId === skillId)
      .slice(0, 20);

    if (recentOutcomes.length > 0) {
      let weightedSum = 0;
      let weightTotal = 0;

      recentOutcomes.forEach((o, index) => {
        // More recent outcomes have higher weight
        const weight = 1 / (index + 1);
        const value = o.outcome === 'accepted' ? 1 : 0;
        weightedSum += value * weight;
        weightTotal += weight;
      });

      confidence.confidence = weightedSum / weightTotal;
    }

    confidence.lastUpdated = Date.now();
    this.data.skillConfidences[skillId] = confidence;
  }

  /**
   * Get confidence for a skill
   */
  getSkillConfidence(skillId: string): number {
    return this.data.skillConfidences[skillId]?.confidence ?? 0.5;
  }

  /**
   * Get all skill confidences
   */
  getAllSkillConfidences(): Record<string, SkillConfidence> {
    return { ...this.data.skillConfidences };
  }

  /**
   * Check if skill should be suppressed due to low confidence
   */
  shouldSuppressSkill(skillId: string): boolean {
    const confidence = this.getSkillConfidence(skillId);
    const skillData = this.data.skillConfidences[skillId];

    // Don't suppress if not enough data
    if (!skillData || skillData.totalShown < MIN_EVENTS_FOR_PATTERN) {
      return false;
    }

    // Suppress if confidence is below 20%
    return confidence < 0.2;
  }

  // ============================================
  // Preferred Nudge Channel
  // ============================================

  /**
   * Get preferred nudge delivery channel
   */
  getPreferredChannel(): NudgeDeliveryChannel {
    return this.data.patterns.preferredNudgeChannel;
  }

  /**
   * Update preferred channel based on engagement
   */
  updatePreferredChannel(): void {
    const recentOutcomes = this.data.nudgeOutcomes.slice(0, 50);

    // Group by channel (from metadata)
    const channelAcceptance: Record<string, { accepted: number; total: number }> = {};

    for (const outcome of recentOutcomes) {
      const channel = (outcome as any).metadata?.channel || 'toast';
      if (!channelAcceptance[channel]) {
        channelAcceptance[channel] = { accepted: 0, total: 0 };
      }
      channelAcceptance[channel].total++;
      if (outcome.outcome === 'accepted') {
        channelAcceptance[channel].accepted++;
      }
    }

    // Find channel with highest acceptance rate
    let bestChannel: NudgeDeliveryChannel = 'toast';
    let bestRate = 0;

    for (const [channel, data] of Object.entries(channelAcceptance)) {
      if (data.total >= MIN_EVENTS_FOR_PATTERN) {
        const rate = data.accepted / data.total;
        if (rate > bestRate) {
          bestRate = rate;
          bestChannel = channel as NudgeDeliveryChannel;
        }
      }
    }

    this.data.patterns.preferredNudgeChannel = bestChannel;
  }

  // ============================================
  // Journaling Time Detection
  // ============================================

  /**
   * Detect preferred journaling time from behavior history
   */
  detectJournalingTime(behaviors: NoteBehavior[]): number | undefined {
    const experienceBehaviors = behaviors.filter(b => b.mode === 'experience');

    if (experienceBehaviors.length < MIN_EVENTS_FOR_PATTERN) {
      return undefined;
    }

    // Count hours
    const hourCounts = new Map<number, number>();
    for (const behavior of experienceBehaviors) {
      const hour = new Date(behavior.createdAt).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    }

    // Find most common hour
    let mostCommonHour = 20; // Default to 8 PM
    let maxCount = 0;

    for (const [hour, count] of hourCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonHour = hour;
      }
    }

    this.data.patterns.journalingTime = mostCommonHour;
    return mostCommonHour;
  }

  // ============================================
  // Data Export/Reset
  // ============================================

  /**
   * Export all learner data
   */
  exportData(): LearnerData {
    return { ...this.data };
  }

  /**
   * Reset all learned data
   */
  async reset(): Promise<void> {
    // Clear any pending saves
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }

    // Reset data to defaults (create new object to avoid reference issues)
    this.data = {
      patterns: { ...DEFAULT_PATTERNS },
      skillConfidences: {},
      recentEvents: [],
      nudgeOutcomes: [],
      lastUpdated: Date.now(),
    };

    // Reset initialized flag so initialize() will reload from storage
    this.initialized = false;

    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('[BehaviorLearner] Data reset');
  }
}

// ============================================
// Singleton Instance
// ============================================

export const behaviorLearner = new BehaviorLearner();

export default behaviorLearner;
