/**
 * Librarian Agent - MODE Framework v2.0
 *
 * The Librarian 📚 - "Where should this live?"
 *
 * AI agent for ORGANIZE mode notes. Manages the three-stage flow:
 * - INBOX 📥: Triage and process new items
 * - STORE 🗄️: File and maintain reference materials
 * - LEARN 🎓: Spaced repetition for knowledge retention
 *
 * Personality: Organized, helpful, prevents hoarding
 * Values: Organization, accessibility, curation, learning
 * Avoids: Clutter, information overload, forgetting
 */

import { Agent, AgentConfig, agentRegistry, AGENT_CONFIGS } from './Agent';
import { skillRegistry } from '../skills';
import type { Skill, SkillContext, SkillResult } from './Agent';
import { OrganizeData, OrganizeStage, Note, NoteBehavior } from '@/types';

// ============================================
// Librarian Skill IDs
// ============================================

export const LIBRARIAN_SKILL_IDS = {
  // INBOX stage
  ENRICH: 'lib-enrich',
  DAILY_SWEEP: 'lib-daily',
  WEEKLY_REVIEW: 'lib-weekly',
  MONTHLY_FORCE: 'lib-monthly',
  CATEGORIZE: 'lib-categorize',
  DEDUPE: 'lib-dedupe',

  // STORE stage
  AUTO_TAG: 'lib-autotag',
  FORMAT: 'lib-format',
  SUMMARIZE: 'lib-summarize',
  SURFACE: 'lib-surface',
  ARCHIVE: 'lib-archive',

  // LEARN stage
  FLASHCARD: 'lib-flashcard',
  SCHEDULE: 'lib-schedule',
  REVIEW: 'lib-review',
  ADAPT: 'lib-adapt',
  GRADUATE: 'lib-graduate',
} as const;

// ============================================
// Spaced Repetition Constants
// ============================================

/**
 * Spaced repetition intervals (in days)
 * Based on SM-2 algorithm principles
 */
export const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60, 120];

/**
 * Calculate next review date based on mastery level
 */
export function calculateNextReview(masteryLevel: number): number {
  const intervalIndex = Math.min(masteryLevel, REVIEW_INTERVALS.length - 1);
  const days = REVIEW_INTERVALS[intervalIndex];
  return Date.now() + days * 24 * 60 * 60 * 1000;
}

// ============================================
// Librarian Agent Implementation
// ============================================

export class LibrarianAgent extends Agent {
  constructor() {
    super('librarian');
  }

  /**
   * Initialize all Librarian skills
   */
  initializeSkills(): void {
    console.log('[LibrarianAgent] Initialized with skills:', Object.values(LIBRARIAN_SKILL_IDS));
  }

  /**
   * Generate greeting in agent's voice
   */
  protected generateGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning! Let's get your inbox organized.";
    if (hour < 17) return "Good afternoon! Need help finding something?";
    return "Good evening! Time for a quick review?";
  }

  /**
   * Generate help text in agent's voice
   */
  protected generateHelpText(): string {
    return "I help you organize and remember things. I can process your inbox, suggest where to file items, and help you learn important information through spaced repetition.";
  }

  /**
   * Get stage-specific greeting
   */
  getStageGreeting(stage: OrganizeStage): string {
    switch (stage) {
      case 'inbox':
        return "Let's process these items together.";
      case 'store':
        return 'Your reference library is well organized.';
      case 'learn':
        return 'Ready to strengthen your knowledge?';
    }
  }

  /**
   * Analyze an organize-mode note
   */
  analyzeNote(note: Note, behavior: NoteBehavior): OrganizeAnalysis {
    const data = behavior.modeData as OrganizeData;
    const suggestions: OrganizeSuggestion[] = [];

    // Check stage-specific issues
    switch (data.stage) {
      case 'inbox':
        suggestions.push(...this.analyzeInboxItem(note, data));
        break;
      case 'store':
        suggestions.push(...this.analyzeStoredItem(note, data));
        break;
      case 'learn':
        suggestions.push(...this.analyzeLearningItem(note, data));
        break;
    }

    return {
      stage: data.stage,
      usefulness: this.calculateUsefulness(data),
      suggestions,
      nextAction: suggestions[0]?.type ?? null,
    };
  }

  /**
   * Analyze an inbox item
   */
  private analyzeInboxItem(note: Note, data: OrganizeData): OrganizeSuggestion[] {
    const suggestions: OrganizeSuggestion[] = [];
    const daysSinceCreated = (Date.now() - note.createdAt) / (1000 * 60 * 60 * 24);

    // Check if it's been sitting too long
    if (daysSinceCreated > 7) {
      suggestions.push({
        type: 'process',
        message: "This has been in your inbox for a while. Time to decide!",
        priority: 'high',
      });
    }

    // Check if it looks like a URL that could be enriched
    if (this.hasUrl(note.content) && !data.tags.includes('enriched')) {
      suggestions.push({
        type: 'enrich',
        message: 'This contains a link. Want me to fetch more details?',
        priority: 'medium',
      });
    }

    // Check if no tags
    if (data.tags.length === 0) {
      suggestions.push({
        type: 'categorize',
        message: 'Adding tags will help you find this later.',
        priority: 'low',
      });
    }

    return suggestions;
  }

  /**
   * Analyze a stored item
   */
  private analyzeStoredItem(note: Note, data: OrganizeData): OrganizeSuggestion[] {
    const suggestions: OrganizeSuggestion[] = [];
    const daysSinceAccess = data.lastUsedAt
      ? (Date.now() - data.lastUsedAt) / (1000 * 60 * 60 * 24)
      : Infinity;

    // Check if unused for a long time
    if (daysSinceAccess > 180) {
      suggestions.push({
        type: 'archive',
        message: "You haven't used this in 6 months. Still valuable?",
        priority: 'low',
      });
    }

    // Celebrate frequent use
    if (data.usageCount >= 5) {
      suggestions.push({
        type: 'celebrate',
        message: `You've used this ${data.usageCount} times! It's clearly valuable.`,
        priority: 'low',
      });
    }

    return suggestions;
  }

  /**
   * Analyze a learning item
   */
  private analyzeLearningItem(note: Note, data: OrganizeData): OrganizeSuggestion[] {
    const suggestions: OrganizeSuggestion[] = [];

    // Check if review is due
    if (data.nextReviewAt && Date.now() >= data.nextReviewAt) {
      suggestions.push({
        type: 'review',
        message: "Time to review this! Let's test your memory.",
        priority: 'high',
      });
    }

    // Check if mastery is high enough to graduate
    if ((data.masteryLevel ?? 0) >= 5) {
      suggestions.push({
        type: 'graduate',
        message: "You've mastered this! Move to reference?",
        priority: 'medium',
      });
    }

    return suggestions;
  }

  /**
   * Calculate usefulness score for organize items
   */
  private calculateUsefulness(data: OrganizeData): UsefulnessLevel {
    const usageCount = data.usageCount ?? 0;

    if (usageCount >= 5) return 'essential';
    if (usageCount >= 3) return 'valuable';
    if (usageCount >= 1) return 'accessed';
    return 'filed';
  }

  /**
   * Check if content contains a URL
   */
  private hasUrl(content: string): boolean {
    return /https?:\/\/[^\s]+/.test(content);
  }

  /**
   * Extract URL from content
   */
  extractUrl(content: string): string | null {
    const match = content.match(/https?:\/\/[^\s]+/);
    return match ? match[0] : null;
  }

  /**
   * Suggest tags based on content
   */
  suggestTags(note: Note): string[] {
    const content = (note.title + ' ' + note.content).toLowerCase();
    const suggestions: string[] = [];

    // Common category patterns
    const patterns: [RegExp, string][] = [
      [/recipe|cook|ingredient|bake/i, 'recipe'],
      [/article|blog|news|read/i, 'article'],
      [/video|watch|youtube|tutorial/i, 'video'],
      [/book|read|author/i, 'book'],
      [/quote|said|wrote/i, 'quote'],
      [/code|programming|developer|api/i, 'code'],
      [/research|study|paper|journal/i, 'research'],
      [/travel|trip|visit|hotel/i, 'travel'],
      [/product|buy|price|review/i, 'product'],
      [/health|medical|doctor|symptom/i, 'health'],
    ];

    for (const [pattern, tag] of patterns) {
      if (pattern.test(content)) {
        suggestions.push(tag);
      }
    }

    return suggestions.slice(0, 3); // Max 3 suggestions
  }

  /**
   * Get stage emoji
   */
  getStageEmoji(stage: OrganizeStage): string {
    switch (stage) {
      case 'inbox': return '📥';
      case 'store': return '🗄️';
      case 'learn': return '🎓';
    }
  }

  /**
   * Get stage label
   */
  getStageLabel(stage: OrganizeStage): string {
    switch (stage) {
      case 'inbox': return 'Inbox';
      case 'store': return 'Reference';
      case 'learn': return 'Learning';
    }
  }

  /**
   * Get usefulness emoji
   */
  getUsefulnessEmoji(level: UsefulnessLevel): string {
    switch (level) {
      case 'filed': return '🗂️';
      case 'accessed': return '📖';
      case 'valuable': return '⭐';
      case 'essential': return '🏆';
    }
  }
}

// ============================================
// Types
// ============================================

export type UsefulnessLevel = 'filed' | 'accessed' | 'valuable' | 'essential';

export interface OrganizeSuggestion {
  type: 'process' | 'enrich' | 'categorize' | 'archive' | 'review' | 'graduate' | 'celebrate';
  message: string;
  priority: 'high' | 'medium' | 'low';
}

export interface OrganizeAnalysis {
  stage: OrganizeStage;
  usefulness: UsefulnessLevel;
  suggestions: OrganizeSuggestion[];
  nextAction: OrganizeSuggestion['type'] | null;
}

// ============================================
// Singleton Instance
// ============================================

let librarianInstance: LibrarianAgent | null = null;

export function getLibrarianAgent(): LibrarianAgent {
  if (!librarianInstance) {
    librarianInstance = new LibrarianAgent();
    agentRegistry.register(librarianInstance);
  }
  return librarianInstance;
}

// Auto-initialize on import
getLibrarianAgent();
