/**
 * Behavior Learner Service - Unit Tests
 *
 * Tests for:
 * - Event tracking
 * - Pattern detection
 * - Skill confidence calculation
 * - Nudge outcome tracking
 * - Skill suppression
 */

// Mock AsyncStorage before imports
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { behaviorLearner } from '@/services/behaviorLearner';

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe('Behavior Learner', () => {
  beforeEach(async () => {
    // Reset the learner state by calling reset
    await behaviorLearner.reset();
    await behaviorLearner.initialize();
  });

  afterEach(async () => {
    // Clean up any pending timeouts
    await behaviorLearner.reset();
  });

  describe('Initialization', () => {
    test('initializes with default patterns', async () => {
      const patterns = behaviorLearner.getPatterns();

      expect(patterns).toBeDefined();
      expect(patterns.activeHours).toEqual([]);
      expect(patterns.nudgeResponseRate).toBe(0.5);
      expect(patterns.preferredNudgeChannel).toBe('toast');
      expect(patterns.dismissedSkillIds).toEqual([]);
    });

    test('loads persisted data on initialize', async () => {
      // First reset to clear initialized state
      await behaviorLearner.reset();

      // Set up the mock BEFORE calling initialize
      const savedData = {
        patterns: {
          activeHours: [9, 14, 20],
          nudgeResponseRate: 0.7,
          preferredNudgeChannel: 'sheet',
          dismissedSkillIds: ['test-skill'],
          averageNoteLength: 150,
          commonTags: ['work', 'personal'],
          modeDistribution: { manage: 0.5, develop: 0.2, organize: 0.2, experience: 0.1 },
          lastUpdatedAt: Date.now(),
        },
        skillConfidences: {},
        recentEvents: [],
        nudgeOutcomes: [],
        lastUpdated: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(savedData));

      // Initialize should now load the persisted data
      await behaviorLearner.initialize();

      const patterns = behaviorLearner.getPatterns();
      expect(patterns.activeHours).toEqual([9, 14, 20]);
      expect(patterns.nudgeResponseRate).toBe(0.7);
    });
  });

  describe('Event Tracking', () => {
    test('tracks app_opened events', () => {
      behaviorLearner.trackEvent({
        type: 'app_opened',
        timestamp: Date.now(),
      });

      const patterns = behaviorLearner.getPatterns();
      expect(patterns.activeHours.length).toBeGreaterThan(0);
    });

    test('tracks note events with mode metadata', () => {
      behaviorLearner.trackEvent({
        type: 'note_created',
        timestamp: Date.now(),
        metadata: {
          mode: 'manage',
          contentLength: 100,
          tags: ['work'],
        },
      });

      const patterns = behaviorLearner.getPatterns();
      expect(patterns.commonTags).toContain('work');
    });

    test('limits recent events to 1000', () => {
      // Track more than 1000 events
      for (let i = 0; i < 1100; i++) {
        behaviorLearner.trackEvent({
          type: 'app_opened',
          timestamp: Date.now() - i * 1000,
        });
      }

      const data = behaviorLearner.exportData();
      expect(data.recentEvents.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('Nudge Outcome Tracking', () => {
    test('records nudge outcomes', () => {
      behaviorLearner.recordNudgeOutcome({
        nudgeId: 'nudge-1',
        skillId: 'test-skill',
        agentId: 'manager',
        outcome: 'accepted',
        responseTimeMs: 5000,
        timestamp: Date.now(),
      });

      const data = behaviorLearner.exportData();
      expect(data.nudgeOutcomes.length).toBe(1);
      expect(data.nudgeOutcomes[0].outcome).toBe('accepted');
    });

    test('updates skill confidence on outcomes', () => {
      // Record several accepted outcomes
      for (let i = 0; i < 5; i++) {
        behaviorLearner.recordNudgeOutcome({
          nudgeId: `nudge-${i}`,
          skillId: 'popular-skill',
          agentId: 'manager',
          outcome: 'accepted',
          timestamp: Date.now(),
        });
      }

      const confidence = behaviorLearner.getSkillConfidence('popular-skill');
      expect(confidence).toBeGreaterThan(0.5);
    });

    test('lowers confidence for dismissed skills', () => {
      // First set baseline
      behaviorLearner.recordNudgeOutcome({
        nudgeId: 'nudge-1',
        skillId: 'unpopular-skill',
        agentId: 'manager',
        outcome: 'accepted',
        timestamp: Date.now(),
      });

      // Then dismiss several times
      for (let i = 0; i < 5; i++) {
        behaviorLearner.recordNudgeOutcome({
          nudgeId: `nudge-dismiss-${i}`,
          skillId: 'unpopular-skill',
          agentId: 'manager',
          outcome: 'dismissed',
          timestamp: Date.now(),
        });
      }

      const confidence = behaviorLearner.getSkillConfidence('unpopular-skill');
      expect(confidence).toBeLessThan(0.5);
    });
  });

  describe('Use Case UC5: Skill Suppression', () => {
    test('marks frequently dismissed skills for suppression', () => {
      const skillId = 'annoying-skill';

      // Record 10 dismissals (above threshold)
      for (let i = 0; i < 10; i++) {
        behaviorLearner.recordNudgeOutcome({
          nudgeId: `nudge-${i}`,
          skillId,
          agentId: 'manager',
          outcome: 'dismissed',
          timestamp: Date.now(),
        });
      }

      expect(behaviorLearner.isSkillFrequentlyDismissed(skillId)).toBe(true);
    });

    test('suppresses skills with very low confidence', () => {
      const skillId = 'low-confidence-skill';

      // Need minimum events for pattern detection
      for (let i = 0; i < 10; i++) {
        behaviorLearner.recordNudgeOutcome({
          nudgeId: `nudge-${i}`,
          skillId,
          agentId: 'manager',
          outcome: 'dismissed',
          timestamp: Date.now(),
        });
      }

      // Should suppress if confidence < 20%
      expect(behaviorLearner.shouldSuppressSkill(skillId)).toBe(true);
    });

    test('does not suppress skills with insufficient data', () => {
      const skillId = 'new-skill';

      // Only 2 outcomes (below MIN_EVENTS_FOR_PATTERN)
      behaviorLearner.recordNudgeOutcome({
        nudgeId: 'nudge-1',
        skillId,
        agentId: 'manager',
        outcome: 'dismissed',
        timestamp: Date.now(),
      });
      behaviorLearner.recordNudgeOutcome({
        nudgeId: 'nudge-2',
        skillId,
        agentId: 'manager',
        outcome: 'dismissed',
        timestamp: Date.now(),
      });

      // Should not suppress without enough data
      expect(behaviorLearner.shouldSuppressSkill(skillId)).toBe(false);
    });

    test('removes skill from dismissed list when engagement improves', () => {
      const skillId = 'recovering-skill';

      // First, make it dismissed frequently
      for (let i = 0; i < 8; i++) {
        behaviorLearner.recordNudgeOutcome({
          nudgeId: `nudge-dismiss-${i}`,
          skillId,
          agentId: 'manager',
          outcome: 'dismissed',
          timestamp: Date.now(),
        });
      }

      // Then, user starts accepting
      for (let i = 0; i < 10; i++) {
        behaviorLearner.recordNudgeOutcome({
          nudgeId: `nudge-accept-${i}`,
          skillId,
          agentId: 'manager',
          outcome: 'accepted',
          timestamp: Date.now(),
        });
      }

      // Should no longer be dismissed frequently
      expect(behaviorLearner.isSkillFrequentlyDismissed(skillId)).toBe(false);
    });
  });

  describe('Pattern Detection', () => {
    test('predicts best time for nudges', () => {
      // Track activity at specific hours
      const mockHours = [9, 14, 20];
      for (const hour of mockHours) {
        const timestamp = new Date();
        timestamp.setHours(hour, 0, 0, 0);

        behaviorLearner.trackEvent({
          type: 'app_opened',
          timestamp: timestamp.getTime(),
        });
      }

      const bestTime = behaviorLearner.predictBestTime('any-skill');
      expect(bestTime).toBeInstanceOf(Date);
    });

    test('detects journaling time from behavior history', () => {
      // Create mock behaviors with EXPERIENCE mode entries at 9pm
      const behaviors = [];
      for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setHours(21, 0, 0, 0);
        date.setDate(date.getDate() - i);

        behaviors.push({
          noteId: `journal-${i}`,
          mode: 'experience' as const,
          usefulnessScore: 50,
          usefulnessLevel: 'detailed',
          lastAccessedAt: date.getTime(),
          accessCount: 1,
          editCount: 1,
          createdAt: date.getTime(),
          modeData: {},
          nudgeCount: 0,
        });
      }

      const journalingTime = behaviorLearner.detectJournalingTime(behaviors);
      expect(journalingTime).toBe(21); // 9 PM
    });
  });

  describe('Data Management', () => {
    test('exports all learner data', () => {
      behaviorLearner.trackEvent({
        type: 'app_opened',
        timestamp: Date.now(),
      });

      const exported = behaviorLearner.exportData();

      expect(exported).toHaveProperty('patterns');
      expect(exported).toHaveProperty('skillConfidences');
      expect(exported).toHaveProperty('recentEvents');
      expect(exported).toHaveProperty('nudgeOutcomes');
      expect(exported).toHaveProperty('lastUpdated');
    });

    test('resets all data', async () => {
      // Add some data
      behaviorLearner.trackEvent({
        type: 'app_opened',
        timestamp: Date.now(),
      });
      behaviorLearner.recordNudgeOutcome({
        nudgeId: 'nudge-1',
        skillId: 'test-skill',
        agentId: 'manager',
        outcome: 'accepted',
        timestamp: Date.now(),
      });

      // Reset
      await behaviorLearner.reset();

      // Verify reset
      const patterns = behaviorLearner.getPatterns();
      expect(patterns.activeHours).toEqual([]);
      expect(AsyncStorage.removeItem).toHaveBeenCalled();
    });
  });
});
