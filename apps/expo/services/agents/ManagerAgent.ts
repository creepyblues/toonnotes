/**
 * Manager Agent - MODE Framework v2.0
 *
 * The Manager 🎯 - "What needs to happen?"
 *
 * AI agent for MANAGE mode notes. Helps users:
 * - Set deadlines and priorities
 * - Break down complex tasks
 * - Stay on track with relevance checks
 * - Celebrate completions
 *
 * Personality: Direct, supportive, action-oriented
 * Values: Efficiency, completion, clarity
 * Avoids: Overwhelm, guilt, pressure
 */

import { Agent, AgentConfig, agentRegistry, AGENT_CONFIGS } from './Agent';
import { skillRegistry } from '../skills';
import type { Skill, SkillContext, SkillResult } from './Agent';
import { ManageData, Note, NoteBehavior } from '@/types';

// ============================================
// Manager Skill IDs
// ============================================

export const MANAGER_SKILL_IDS = {
  DEADLINE: 'mgr-deadline',
  RELEVANCE: 'mgr-relevance',
  DECOMPOSE: 'mgr-decompose',
  CELEBRATE: 'mgr-celebrate',
  PRIORITY: 'mgr-priority',
  CHECKLIST: 'mgr-checklist',
} as const;

// ============================================
// Manager Agent Implementation
// ============================================

export class ManagerAgent extends Agent {
  constructor() {
    super('manager');
  }

  /**
   * Initialize all Manager skills
   */
  initializeSkills(): void {
    // Skills are registered separately in the skills directory
    // This method can be used for any agent-specific initialization
    console.log('[ManagerAgent] Initialized with skills:', Object.values(MANAGER_SKILL_IDS));
  }

  /**
   * Generate greeting in agent's voice
   */
  protected generateGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning! Let's make today count.";
    if (hour < 17) return "Good afternoon! What's next on your list?";
    return "Good evening! Time to wrap up or plan ahead?";
  }

  /**
   * Generate help text in agent's voice
   */
  protected generateHelpText(): string {
    return "I help you get things done. I can remind you about deadlines, help break down big tasks, and celebrate your wins. Just capture your tasks and I'll help you stay on track.";
  }

  /**
   * Generate encouragement based on task completion rate
   */
  getEncouragement(completedToday: number, totalToday: number): string {
    if (completedToday === 0) {
      return "Every journey starts with a single step. Pick one task to tackle.";
    }

    const rate = totalToday > 0 ? completedToday / totalToday : 0;

    if (rate >= 1) {
      return "All done! You've crushed it today. 🎉";
    }
    if (rate >= 0.75) {
      return "Almost there! Just a few more to go.";
    }
    if (rate >= 0.5) {
      return "Halfway through! Keep the momentum going.";
    }
    if (rate >= 0.25) {
      return "Good progress! One task at a time.";
    }
    return "You've started - that's what matters. Keep going!";
  }

  /**
   * Analyze a task note and suggest improvements
   */
  analyzeTask(note: Note, behavior: NoteBehavior): TaskAnalysis {
    const manageData = behavior.modeData as ManageData;
    const suggestions: TaskSuggestion[] = [];

    // Check for missing deadline
    if (!manageData.hasDeadline) {
      suggestions.push({
        type: 'deadline',
        message: 'When does this need to happen?',
        priority: 'high',
      });
    }

    // Check for missing priority
    if (!manageData.hasPriority) {
      suggestions.push({
        type: 'priority',
        message: 'How important is this compared to other tasks?',
        priority: 'medium',
      });
    }

    // Check if task might need breakdown
    if (this.mightNeedBreakdown(note)) {
      suggestions.push({
        type: 'decompose',
        message: 'This looks like a big task. Want to break it down?',
        priority: 'medium',
      });
    }

    // Check for stale task
    const daysSinceAccess = (Date.now() - behavior.lastAccessedAt) / (1000 * 60 * 60 * 24);
    if (daysSinceAccess > 7 && !manageData.completedAt) {
      suggestions.push({
        type: 'relevance',
        message: "It's been a while. Still on your plate?",
        priority: 'low',
      });
    }

    return {
      readinessLevel: this.calculateReadiness(manageData),
      suggestions,
      nextAction: suggestions[0]?.type ?? null,
    };
  }

  /**
   * Calculate task readiness level
   */
  private calculateReadiness(data: ManageData): TaskReadiness {
    if (data.completedAt) return 'complete';

    let score = 0;
    if (data.hasDeadline) score += 1;
    if (data.hasPriority) score += 1;
    if (data.hasSubtasks) score += 1;

    if (score >= 3) return 'ready';
    if (score >= 2) return 'scheduled';
    if (score >= 1) return 'partial';
    return 'captured';
  }

  /**
   * Check if a task might need to be broken down
   */
  private mightNeedBreakdown(note: Note): boolean {
    const content = note.content.toLowerCase();

    // Check for complexity indicators
    const complexitySignals = [
      content.length > 500,
      /\band\b.*\band\b/i.test(content), // Multiple "and"s
      /(?:first|then|next|finally|after that)/i.test(content), // Sequential language
      /(?:research|plan|prepare|organize|coordinate)/i.test(content), // Complex verbs
      (content.match(/\n/g) || []).length > 5, // Many lines
    ];

    return complexitySignals.filter(Boolean).length >= 2;
  }

  /**
   * Generate subtask suggestions for a complex task
   */
  suggestSubtasks(note: Note): string[] {
    const content = note.content;
    const suggestions: string[] = [];

    // Look for action items in the content
    const lines = content.split('\n').filter(l => l.trim());

    for (const line of lines) {
      // Skip short lines or headers
      if (line.length < 10) continue;
      if (line.startsWith('#')) continue;

      // Look for actionable phrases
      if (/^[-•*]\s/.test(line)) {
        suggestions.push(line.replace(/^[-•*]\s*/, '').trim());
      } else if (/(?:need to|should|must|have to|want to)/i.test(line)) {
        suggestions.push(line.trim());
      }
    }

    // If no suggestions found, create generic breakdown
    if (suggestions.length === 0) {
      suggestions.push(
        'Define the goal clearly',
        'Identify first concrete step',
        'Set a deadline',
        'Review and complete'
      );
    }

    return suggestions.slice(0, 5); // Max 5 suggestions
  }

  /**
   * Get the readiness emoji for display
   */
  getReadinessEmoji(level: TaskReadiness): string {
    switch (level) {
      case 'captured': return '⚪';
      case 'partial': return '🟡';
      case 'scheduled': return '🟠';
      case 'ready': return '🟢';
      case 'complete': return '✅';
    }
  }

  /**
   * Get readiness label for display
   */
  getReadinessLabel(level: TaskReadiness): string {
    switch (level) {
      case 'captured': return 'Captured';
      case 'partial': return 'Needs info';
      case 'scheduled': return 'Scheduled';
      case 'ready': return 'Ready';
      case 'complete': return 'Complete';
    }
  }
}

// ============================================
// Types
// ============================================

export type TaskReadiness = 'captured' | 'partial' | 'scheduled' | 'ready' | 'complete';

export interface TaskSuggestion {
  type: 'deadline' | 'priority' | 'decompose' | 'relevance' | 'checklist';
  message: string;
  priority: 'high' | 'medium' | 'low';
}

export interface TaskAnalysis {
  readinessLevel: TaskReadiness;
  suggestions: TaskSuggestion[];
  nextAction: TaskSuggestion['type'] | null;
}

// ============================================
// Singleton Instance
// ============================================

let managerInstance: ManagerAgent | null = null;

export function getManagerAgent(): ManagerAgent {
  if (!managerInstance) {
    managerInstance = new ManagerAgent();
    agentRegistry.register(managerInstance);
  }
  return managerInstance;
}

// Auto-initialize on import
getManagerAgent();
