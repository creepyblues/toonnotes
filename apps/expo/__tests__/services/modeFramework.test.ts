/**
 * MODE Framework v2.0 - Unit Tests
 *
 * Tests for:
 * - Agent initialization and configuration
 * - Skill registration and triggering
 * - Behavior learner pattern detection
 */

import {
  Agent,
  AGENT_CONFIGS,
  AGENT_PERSONALITIES,
  modeToAgentId,
  agentIdToMode,
} from '@/services/agents/Agent';
import { ManagerAgent, getManagerAgent, MANAGER_SKILL_IDS } from '@/services/agents/ManagerAgent';
import { MuseAgent, getMuseAgent, MUSE_SKILL_IDS, detectContentType } from '@/services/agents/MuseAgent';
import { LibrarianAgent, getLibrarianAgent, LIBRARIAN_SKILL_IDS, calculateNextReview } from '@/services/agents/LibrarianAgent';
import { BiographerAgent, getBiographerAgent, BIOGRAPHER_SKILL_IDS, analyzeSentiment, extractPeopleMentioned } from '@/services/agents/BiographerAgent';
import { skillRegistry, SkillBuilder, noAction, createNudgeResult } from '@/services/skills';
import type { SkillContext, SkillResult, NudgeParams } from '@/services/agents/Agent';
import type { Mode, ManageData, DevelopData, OrganizeData, ExperienceData } from '@/types';

// Import skill files to trigger registration
import '@/services/skills/manager/deadlineSkill';
import '@/services/skills/manager/relevanceSkill';
import '@/services/skills/manager/decomposeSkill';
import '@/services/skills/muse/expandSkill';
import '@/services/skills/muse/bridgeSkill';
import '@/services/skills/muse/resurfaceSkill';
import '@/services/skills/muse/connectSkill';
import '@/services/skills/muse/unblockSkill';
import '@/services/skills/librarian/dailySweepSkill';
import '@/services/skills/librarian/reviewSkill';
import '@/services/skills/biographer/nudgeSkill';
import '@/services/skills/biographer/timeCapsuleSkill';

// ============================================
// Agent Tests
// ============================================

describe('Agent Configuration', () => {
  test('all agents have valid configurations', () => {
    const agentIds = ['manager', 'muse', 'librarian', 'biographer'] as const;

    for (const agentId of agentIds) {
      const config = AGENT_CONFIGS[agentId];
      expect(config).toBeDefined();
      expect(config.id).toBe(agentId);
      expect(config.mode).toBeDefined();
      expect(config.name).toBeTruthy();
      expect(config.emoji).toBeTruthy();
      expect(config.coreQuestion).toBeTruthy();
      expect(config.personality).toBeDefined();
    }
  });

  test('all agents have personalities with required fields', () => {
    const agentIds = ['manager', 'muse', 'librarian', 'biographer'] as const;

    for (const agentId of agentIds) {
      const personality = AGENT_PERSONALITIES[agentId];
      expect(personality.tone).toBeTruthy();
      expect(personality.approach).toBeTruthy();
      expect(personality.values).toBeInstanceOf(Array);
      expect(personality.values.length).toBeGreaterThan(0);
      expect(personality.avoids).toBeInstanceOf(Array);
      expect(personality.avoids.length).toBeGreaterThan(0);
    }
  });

  test('modeToAgentId returns correct mappings', () => {
    expect(modeToAgentId('manage')).toBe('manager');
    expect(modeToAgentId('develop')).toBe('muse');
    expect(modeToAgentId('organize')).toBe('librarian');
    expect(modeToAgentId('experience')).toBe('biographer');
  });

  test('agentIdToMode returns correct mappings', () => {
    expect(agentIdToMode('manager')).toBe('manage');
    expect(agentIdToMode('muse')).toBe('develop');
    expect(agentIdToMode('librarian')).toBe('organize');
    expect(agentIdToMode('biographer')).toBe('experience');
  });
});

describe('Manager Agent', () => {
  let manager: ManagerAgent;

  beforeEach(() => {
    manager = getManagerAgent();
  });

  test('manager agent initializes correctly', () => {
    expect(manager.id).toBe('manager');
    expect(manager.mode).toBe('manage');
    expect(manager.config.name).toBe('The Manager');
  });

  test('manager generates greeting based on time of day', () => {
    const greeting = manager.getGreeting();
    expect(greeting).toBeTruthy();
    expect(typeof greeting).toBe('string');
  });

  test('manager provides help text', () => {
    const helpText = manager.getHelpText();
    expect(helpText).toContain('task');
  });

  test('manager analyzes task and returns assessment', () => {
    const mockNote = {
      id: 'task-1',
      title: 'Buy groceries',
      content: 'Need to buy milk and eggs',
      labels: [],
      color: 'white' as const,
      isPinned: false,
      isArchived: false,
      isDeleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const mockBehavior = {
      noteId: 'task-1',
      mode: 'manage' as const,
      usefulnessScore: 20,
      usefulnessLevel: 'captured',
      lastAccessedAt: Date.now(),
      accessCount: 1,
      editCount: 0,
      createdAt: Date.now(),
      modeData: {
        hasDeadline: false,
        hasPriority: false,
        hasSubtasks: false,
        stateHistory: [],
      } as ManageData,
      nudgeCount: 0,
    };

    const assessment = manager.analyzeTask(mockNote, mockBehavior);
    expect(assessment).toBeDefined();
    expect(assessment.readinessLevel).toBeDefined();
    expect(assessment.suggestions).toBeInstanceOf(Array);
  });
});

describe('Muse Agent', () => {
  let muse: MuseAgent;

  beforeEach(() => {
    muse = getMuseAgent();
  });

  test('muse agent initializes correctly', () => {
    expect(muse.id).toBe('muse');
    expect(muse.mode).toBe('develop');
    expect(muse.config.name).toBe('The Muse');
  });

  test('muse detects content types correctly', () => {
    // Story detection requires specific words like 'character', 'plot', 'chapter'
    expect(detectContentType('The character in my story is a hero')).toBe('story');
    // Business detection requires words like 'customer', 'market', 'revenue'
    expect(detectContentType('Our customer acquisition cost is too high')).toBe('business');
    // Blog detection requires words like 'article', 'readers'
    expect(detectContentType('In this article, readers will learn')).toBe('blog');
    // Design detection requires words like 'button', 'layout', 'UI'
    expect(detectContentType('The button layout needs improvement')).toBe('design');
    // General is fallback
    expect(detectContentType('Just a random thought')).toBe('general');
  });

  test('muse generates expansion angles for notes', () => {
    const mockNote = {
      id: 'test-1',
      title: 'App idea',
      content: 'An app that helps people track habits',
      labels: [],
      color: 'white' as const,
      isPinned: false,
      isArchived: false,
      isDeleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const angles = muse.generateExpansionAngles(mockNote);
    expect(angles).toBeInstanceOf(Array);
    expect(angles.length).toBeGreaterThan(0);
    expect(angles[0]).toHaveProperty('id');
    expect(angles[0]).toHaveProperty('label');
    expect(angles[0]).toHaveProperty('prompt');
  });

  test('muse provides unblock prompts', () => {
    const prompts = muse.getUnblockPrompts();
    expect(prompts).toBeInstanceOf(Array);
    expect(prompts.length).toBeGreaterThan(0);
    expect(typeof prompts[0]).toBe('string');
  });
});

describe('Librarian Agent', () => {
  let librarian: LibrarianAgent;

  beforeEach(() => {
    librarian = getLibrarianAgent();
  });

  test('librarian agent initializes correctly', () => {
    expect(librarian.id).toBe('librarian');
    expect(librarian.mode).toBe('organize');
    expect(librarian.config.name).toBe('The Librarian');
  });

  test('librarian calculates next review with spaced repetition', () => {
    // First review should be 1 day
    const firstReview = calculateNextReview(0);
    expect(firstReview).toBeGreaterThan(Date.now());
    expect(firstReview).toBeLessThan(Date.now() + 2 * 24 * 60 * 60 * 1000);

    // Higher mastery means longer interval
    const laterReview = calculateNextReview(3);
    expect(laterReview).toBeGreaterThan(firstReview);
  });
});

describe('Biographer Agent', () => {
  let biographer: BiographerAgent;

  beforeEach(() => {
    biographer = getBiographerAgent();
  });

  test('biographer agent initializes correctly', () => {
    expect(biographer.id).toBe('biographer');
    expect(biographer.mode).toBe('experience');
    expect(biographer.config.name).toBe('The Biographer');
  });

  test('biographer analyzes sentiment correctly', () => {
    expect(analyzeSentiment('I am so happy and grateful today!')).toBe('positive');
    expect(analyzeSentiment('Feeling sad and overwhelmed')).toBe('negative');
    expect(analyzeSentiment('Had coffee this morning')).toBe('neutral');
    expect(analyzeSentiment('Happy but also stressed about work')).toBe('mixed');
  });

  test('biographer extracts people mentioned', () => {
    // The extraction uses pattern: with/from/to/and + Name
    const content = 'Had coffee with Sarah today.';
    const people = extractPeopleMentioned(content);
    expect(people).toContain('Sarah');
  });

  test('biographer calculates journaling streak', () => {
    const today = Date.now();
    const yesterday = today - 24 * 60 * 60 * 1000;
    const twoDaysAgo = today - 2 * 24 * 60 * 60 * 1000;

    // Consecutive days
    const streak = biographer.calculateJournalStreak([today, yesterday, twoDaysAgo]);
    expect(streak).toBeGreaterThanOrEqual(1);

    // Single day should give streak of 1
    const singleStreak = biographer.calculateJournalStreak([today]);
    expect(singleStreak).toBe(1);
  });
});

// ============================================
// Skill Tests
// ============================================

describe('Skill Builder', () => {
  test('skill builder creates valid skills', () => {
    const testSkill = new SkillBuilder({
      id: 'test-skill',
      name: 'Test Skill',
      description: 'A test skill',
      agentId: 'manager',
      cooldownMs: 60000,
    })
      .onEvent('note_created')
      .when(() => true)
      .do(async () => noAction())
      .build();

    expect(testSkill.id).toBe('test-skill');
    expect(testSkill.name).toBe('Test Skill');
    expect(testSkill.cooldownMs).toBe(60000);
    expect(testSkill.enabled).toBe(true);
    expect(testSkill.triggers.length).toBeGreaterThan(0);
  });

  test('noAction returns correct result', () => {
    const result = noAction();
    expect(result.shouldNudge).toBe(false);
    expect(result.nudgeParams).toBeUndefined();
  });

  test('createNudgeResult creates valid nudge params', () => {
    const params: NudgeParams = {
      title: 'Test',
      body: 'Test body',
      options: [{ id: 'opt1', label: 'Option 1', action: { type: 'dismiss' } }],
      priority: 'medium',
      deliveryChannel: 'toast',
    };

    const result = createNudgeResult(params);
    expect(result.shouldNudge).toBe(true);
    expect(result.nudgeParams).toEqual(params);
  });
});

describe('Skill Registry', () => {
  test('skills are registered correctly', () => {
    // Manager skills
    expect(skillRegistry.get(MANAGER_SKILL_IDS.DEADLINE)).toBeDefined();
    expect(skillRegistry.get(MANAGER_SKILL_IDS.RELEVANCE)).toBeDefined();
    expect(skillRegistry.get(MANAGER_SKILL_IDS.DECOMPOSE)).toBeDefined();

    // Muse skills
    expect(skillRegistry.get(MUSE_SKILL_IDS.EXPAND)).toBeDefined();
    expect(skillRegistry.get(MUSE_SKILL_IDS.BRIDGE)).toBeDefined();

    // Librarian skills
    expect(skillRegistry.get(LIBRARIAN_SKILL_IDS.DAILY_SWEEP)).toBeDefined();
    expect(skillRegistry.get(LIBRARIAN_SKILL_IDS.REVIEW)).toBeDefined();

    // Biographer skills
    expect(skillRegistry.get(BIOGRAPHER_SKILL_IDS.NUDGE)).toBeDefined();
    expect(skillRegistry.get(BIOGRAPHER_SKILL_IDS.TIMECAPSULE)).toBeDefined();
  });

  test('getForAgent returns skills for specific agent', () => {
    const managerSkills = skillRegistry.getForAgent('manager');
    expect(managerSkills.length).toBeGreaterThan(0);
    expect(managerSkills.every(s => s.id.startsWith('mgr-'))).toBe(true);

    const museSkills = skillRegistry.getForAgent('muse');
    expect(museSkills.length).toBeGreaterThan(0);
    expect(museSkills.every(s => s.id.startsWith('muse-'))).toBe(true);
  });
});

// ============================================
// Use Case Scenario Tests
// ============================================

describe('Use Case: UC1 - Manager Deadline Nudge', () => {
  test('deadline skill triggers for tasks without deadline', () => {
    const deadlineSkill = skillRegistry.get(MANAGER_SKILL_IDS.DEADLINE);
    expect(deadlineSkill).toBeDefined();

    const context: SkillContext = {
      note: {
        id: 'task-1',
        title: 'Buy groceries',
        content: 'Need to buy milk and eggs',
        labels: [],
        color: 'white',
        isPinned: false,
        isArchived: false,
        isDeleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      behavior: {
        noteId: 'task-1',
        mode: 'manage',
        usefulnessScore: 20,
        usefulnessLevel: 'captured',
        lastAccessedAt: Date.now(),
        accessCount: 1,
        editCount: 0,
        createdAt: Date.now(),
        modeData: {
          hasDeadline: false,
          hasPriority: false,
          hasSubtasks: false,
          stateHistory: [],
        } as ManageData,
        nudgeCount: 0,
      },
      timestamp: Date.now(),
    };

    const shouldTrigger = deadlineSkill!.shouldTrigger(context);
    expect(shouldTrigger).toBe(true);
  });

  test('deadline skill does not trigger for tasks with deadline', () => {
    const deadlineSkill = skillRegistry.get(MANAGER_SKILL_IDS.DEADLINE);
    expect(deadlineSkill).toBeDefined();

    const context: SkillContext = {
      note: {
        id: 'task-1',
        title: 'Buy groceries',
        content: 'Need to buy milk and eggs',
        labels: [],
        color: 'white',
        isPinned: false,
        isArchived: false,
        isDeleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      behavior: {
        noteId: 'task-1',
        mode: 'manage',
        usefulnessScore: 50,
        usefulnessLevel: 'scheduled',
        lastAccessedAt: Date.now(),
        accessCount: 1,
        editCount: 0,
        createdAt: Date.now(),
        modeData: {
          hasDeadline: true, // Has deadline
          hasPriority: false,
          hasSubtasks: false,
          stateHistory: [],
        } as ManageData,
        nudgeCount: 0,
      },
      timestamp: Date.now(),
    };

    const shouldTrigger = deadlineSkill!.shouldTrigger(context);
    expect(shouldTrigger).toBe(false);
  });
});

describe('Use Case: UC2 - Muse Expansion Angles', () => {
  test('expand skill triggers for brief ideas in develop mode', () => {
    const expandSkill = skillRegistry.get(MUSE_SKILL_IDS.EXPAND);
    expect(expandSkill).toBeDefined();

    const context: SkillContext = {
      note: {
        id: 'idea-1',
        title: '',
        content: 'App for tracking habits', // Brief idea (< 200 chars)
        labels: [],
        color: 'white',
        isPinned: false,
        isArchived: false,
        isDeleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      behavior: {
        noteId: 'idea-1',
        mode: 'develop',
        usefulnessScore: 10,
        usefulnessLevel: 'spark',
        lastAccessedAt: Date.now(),
        accessCount: 1,
        editCount: 0,
        createdAt: Date.now(),
        modeData: {
          maturityLevel: 'spark',
          expansionCount: 0, // Not expanded yet
          linkedIdeas: [],
        } as DevelopData,
        nudgeCount: 0,
      },
      timestamp: Date.now(),
    };

    const shouldTrigger = expandSkill!.shouldTrigger(context);
    expect(shouldTrigger).toBe(true);
  });

  test('expand skill does not trigger for already expanded ideas', () => {
    const expandSkill = skillRegistry.get(MUSE_SKILL_IDS.EXPAND);
    expect(expandSkill).toBeDefined();

    const context: SkillContext = {
      note: {
        id: 'idea-1',
        title: '',
        content: 'App for tracking habits',
        labels: [],
        color: 'white',
        isPinned: false,
        isArchived: false,
        isDeleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      behavior: {
        noteId: 'idea-1',
        mode: 'develop',
        usefulnessScore: 40,
        usefulnessLevel: 'explored',
        lastAccessedAt: Date.now(),
        accessCount: 3,
        editCount: 2,
        createdAt: Date.now(),
        modeData: {
          maturityLevel: 'explored',
          expansionCount: 2, // Already expanded
          linkedIdeas: [],
        } as DevelopData,
        nudgeCount: 1,
      },
      timestamp: Date.now(),
    };

    const shouldTrigger = expandSkill!.shouldTrigger(context);
    expect(shouldTrigger).toBe(false);
  });
});

describe('Use Case: UC3 - Librarian Daily Sweep', () => {
  test('daily sweep triggers for unprocessed inbox items', () => {
    const sweepSkill = skillRegistry.get(LIBRARIAN_SKILL_IDS.DAILY_SWEEP);
    expect(sweepSkill).toBeDefined();

    const oneDayAgo = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago

    const context: SkillContext = {
      note: {
        id: 'item-1',
        title: 'Interesting article',
        content: 'https://example.com/article',
        labels: [],
        color: 'white',
        isPinned: false,
        isArchived: false,
        isDeleted: false,
        createdAt: oneDayAgo,
        updatedAt: oneDayAgo,
      },
      behavior: {
        noteId: 'item-1',
        mode: 'organize',
        usefulnessScore: 10,
        usefulnessLevel: 'inbox',
        lastAccessedAt: oneDayAgo,
        accessCount: 1,
        editCount: 0,
        createdAt: oneDayAgo,
        modeData: {
          stage: 'inbox',
          usageCount: 0,
          tags: [],
        } as OrganizeData,
        nudgeCount: 0,
      },
      timestamp: Date.now(),
    };

    const shouldTrigger = sweepSkill!.shouldTrigger(context);
    expect(shouldTrigger).toBe(true);
  });
});

describe('Use Case: UC4 - Biographer Sentiment Pattern', () => {
  test('biographer detects negative sentiment pattern', () => {
    // This tests the sentiment analysis helper
    const entries = [
      'Feeling overwhelmed and stressed',
      'Another frustrating day, so sad',
      'Exhausted and anxious about everything',
    ];

    const sentiments = entries.map(e => analyzeSentiment(e));
    expect(sentiments.every(s => s === 'negative' || s === 'mixed')).toBe(true);
  });

  test('biographer detects positive streak', () => {
    const entries = [
      'What a wonderful day! Grateful for everything.',
      'Happy and excited about the new project!',
      'Feeling blessed and content.',
    ];

    const sentiments = entries.map(e => analyzeSentiment(e));
    expect(sentiments.every(s => s === 'positive')).toBe(true);
  });
});

// ============================================
// Integration Tests
// ============================================

describe('Skill Execution Integration', () => {
  test('manager deadline skill executes and returns nudge params', async () => {
    const deadlineSkill = skillRegistry.get(MANAGER_SKILL_IDS.DEADLINE);
    expect(deadlineSkill).toBeDefined();

    const context: SkillContext = {
      note: {
        id: 'task-1',
        title: 'Important task',
        content: 'Something to do',
        labels: [],
        color: 'white',
        isPinned: false,
        isArchived: false,
        isDeleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      behavior: {
        noteId: 'task-1',
        mode: 'manage',
        usefulnessScore: 20,
        usefulnessLevel: 'captured',
        lastAccessedAt: Date.now(),
        accessCount: 1,
        editCount: 0,
        createdAt: Date.now(),
        modeData: {
          hasDeadline: false,
          hasPriority: false,
          hasSubtasks: false,
          stateHistory: [],
        } as ManageData,
        nudgeCount: 0,
      },
      timestamp: Date.now(),
    };

    const result = await deadlineSkill!.execute(context);

    expect(result.shouldNudge).toBe(true);
    expect(result.nudgeParams).toBeDefined();
    expect(result.nudgeParams?.title).toBeTruthy();
    expect(result.nudgeParams?.body).toBeTruthy();
    expect(result.nudgeParams?.options?.length).toBeGreaterThan(0);
  });
});
