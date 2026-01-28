/**
 * Goal Analysis Service - AI Goal-Agent System
 *
 * Orchestrates AI goal inference for notes:
 * - Content threshold checking (minimum content before analysis)
 * - Debounced analysis (10s after last edit)
 * - Edge function calls for goal + engagement classification
 * - Content hash tracking to avoid re-analysis
 */

import {
  NoteGoal,
  ActionStep,
  NudgeEngagement,
  Mode,
  AgentId,
  Note,
} from '@/types';
import { useGoalStore } from '@/stores/goalStore';
import { useBehaviorStore } from '@/stores/behaviorStore';
import { trackEvent } from './firebaseAnalytics';

// ============================================
// Constants
// ============================================

const API_BASE_URL = 'https://toonnotes-api.vercel.app';
const ANALYSIS_DEBOUNCE_MS = 10_000; // 10 seconds after last edit
const MIN_TITLE_LENGTH = 3;
const MIN_CONTENT_LENGTH = 20;
const MIN_CHECKLIST_ITEMS = 2;
const DEFAULT_NUDGE_CADENCE_MS = 4 * 60 * 60 * 1000; // 4 hours

// ============================================
// Types
// ============================================

interface AnalysisResult {
  nudgeEngagement: NudgeEngagement;
  goalStatement: string;
  reasoning: string;
  engagementReasoning: string;
  steps: Array<{
    title: string;
    description: string;
    actionType: 'prompt_user' | 'auto_detect' | 'manual_check';
    autoDetectField?: string;
    autoDetectCondition?: 'exists' | 'gt' | 'contains';
    autoDetectValue?: string | number;
  }>;
}

// ============================================
// Helpers
// ============================================

let idCounter = 0;
function generateId(): string {
  return `goal_${Date.now()}_${++idCounter}_${Math.random().toString(36).substring(2, 9)}`;
}

function generateStepId(): string {
  return `step_${Date.now()}_${++idCounter}_${Math.random().toString(36).substring(2, 9)}`;
}

function hashContent(title: string, content: string): string {
  // Simple hash for change detection
  const str = `${title}::${content}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

function countChecklistItems(content: string): number {
  return (content.match(/^-?\s*\[[ xX]\]/gm) || []).length;
}

function getAgentIdForMode(mode: Mode): AgentId {
  switch (mode) {
    case 'manage': return 'manager';
    case 'develop': return 'muse';
    case 'organize': return 'librarian';
    case 'experience': return 'biographer';
  }
}

// ============================================
// Service
// ============================================

class GoalAnalysisService {
  private static instance: GoalAnalysisService;
  private debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private analyzingNotes: Set<string> = new Set();

  private constructor() {}

  static getInstance(): GoalAnalysisService {
    if (!GoalAnalysisService.instance) {
      GoalAnalysisService.instance = new GoalAnalysisService();
    }
    return GoalAnalysisService.instance;
  }

  /**
   * Check if a note meets the content threshold for goal analysis
   */
  meetsContentThreshold(title: string, content: string): boolean {
    if (title.length < MIN_TITLE_LENGTH) return false;
    return content.length >= MIN_CONTENT_LENGTH || countChecklistItems(content) >= MIN_CHECKLIST_ITEMS;
  }

  /**
   * Schedule debounced goal analysis for a note.
   * Called on note update; waits 10s after last edit.
   */
  scheduleAnalysis(noteId: string, title: string, content: string): void {
    const goalStore = useGoalStore.getState();

    // Check if feature is enabled
    if (!goalStore.goalSuggestionsEnabled) return;

    // Check content threshold
    if (!this.meetsContentThreshold(title, content)) return;

    // Check if content has changed since last analysis
    const existingGoal = goalStore.getGoalForNote(noteId);
    const currentHash = hashContent(title, content);
    if (existingGoal && existingGoal.lastAnalyzedContentHash === currentHash) return;

    // Check no-goal notes (skip if content hash unchanged)
    const noGoal = goalStore.noGoalNotes[noteId];
    if (noGoal && noGoal.contentHash === currentHash) return;

    // Clear existing timer
    const existingTimer = this.debounceTimers.get(noteId);
    if (existingTimer) clearTimeout(existingTimer);

    // Set new debounced timer
    const timer = setTimeout(() => {
      this.debounceTimers.delete(noteId);
      this.analyzeAndGenerateGoal(noteId, title, content);
    }, ANALYSIS_DEBOUNCE_MS);

    this.debounceTimers.set(noteId, timer);
  }

  /**
   * Trigger immediate analysis (e.g., on editor blur/navigate away)
   */
  async analyzeImmediately(noteId: string, title: string, content: string): Promise<void> {
    // Clear any pending debounce
    const existingTimer = this.debounceTimers.get(noteId);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.debounceTimers.delete(noteId);
    }

    await this.analyzeAndGenerateGoal(noteId, title, content);
  }

  /**
   * Core analysis: calls edge function and stores result
   */
  async analyzeAndGenerateGoal(
    noteId: string,
    title: string,
    content: string,
  ): Promise<NoteGoal | null> {
    const goalStore = useGoalStore.getState();

    if (!goalStore.goalSuggestionsEnabled) return null;
    if (!this.meetsContentThreshold(title, content)) return null;
    if (this.analyzingNotes.has(noteId)) return null;

    this.analyzingNotes.add(noteId);

    try {
      // Get mode + agent info from behavior store
      const behavior = useBehaviorStore.getState().getBehavior(noteId);
      const mode: Mode = behavior?.mode || 'manage';
      const agentId = getAgentIdForMode(mode);
      const contentHash = hashContent(title, content);

      // Get existing completed steps for plan adaptation
      const existingGoal = goalStore.getGoalForNote(noteId);
      const completedSteps = existingGoal
        ? existingGoal.steps.filter((s) => s.status === 'completed').map((s) => s.title)
        : [];

      // Call edge function
      const result = await this.callAnalyzeEndpoint({
        noteTitle: title,
        noteContent: content,
        mode,
        agentId,
        completedSteps,
      });

      if (!result) return null;

      // Handle 'none' engagement - no goal needed
      if (result.nudgeEngagement === 'none') {
        goalStore.markAsNoGoal(noteId, contentHash);
        trackEvent('goal_classified_none', { note_id: noteId, mode });
        return null;
      }

      // Build NoteGoal
      const goal: NoteGoal = {
        id: existingGoal?.id || generateId(),
        noteId,
        mode,
        agentId,
        nudgeEngagement: result.nudgeEngagement,
        goalStatement: result.goalStatement,
        reasoning: result.reasoning,
        engagementReasoning: result.engagementReasoning,
        steps: result.steps.map((s, i) => ({
          id: generateStepId(),
          order: i + 1,
          title: s.title,
          description: s.description,
          status: 'pending' as const,
          nudgeCount: 0,
          actionType: s.actionType,
          autoDetectField: s.autoDetectField,
          autoDetectCondition: s.autoDetectCondition,
          autoDetectValue: s.autoDetectValue,
        })),
        status: 'active',
        createdAt: existingGoal?.createdAt || Date.now(),
        updatedAt: Date.now(),
        revision: (existingGoal?.revision || 0) + 1,
        lastAnalyzedContentHash: contentHash,
        nudgeCadenceMs: DEFAULT_NUDGE_CADENCE_MS,
        totalNudgesSent: existingGoal?.totalNudgesSent || 0,
        consecutiveDismissals: existingGoal?.consecutiveDismissals || 0,
      };

      // Preserve completed steps from previous revision
      if (existingGoal) {
        const completedMap = new Map(
          existingGoal.steps
            .filter((s) => s.status === 'completed')
            .map((s) => [s.title.toLowerCase(), s])
        );
        goal.steps = goal.steps.map((step) => {
          const prev = completedMap.get(step.title.toLowerCase());
          if (prev) {
            return { ...step, status: 'completed' as const, completedAt: prev.completedAt };
          }
          return step;
        });
      }

      // Schedule first nudge for active goals
      if (goal.nudgeEngagement === 'active') {
        goal.nextNudgeAt = Date.now() + 60 * 60 * 1000; // +1 hour
      }

      goalStore.setGoal(goal);

      trackEvent('goal_created', {
        note_id: noteId,
        mode,
        engagement: result.nudgeEngagement,
        step_count: goal.steps.length,
        revision: goal.revision,
      });

      return goal;
    } catch (error) {
      console.error('[GoalAnalysis] Analysis failed:', error);
      return null;
    } finally {
      this.analyzingNotes.delete(noteId);
    }
  }

  /**
   * Call the edge function to analyze a note and generate a goal
   */
  private async callAnalyzeEndpoint(params: {
    noteTitle: string;
    noteContent: string;
    mode: Mode;
    agentId: AgentId;
    completedSteps: string[];
  }): Promise<AnalysisResult | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/goal-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze', ...params }),
      });

      if (!response.ok) {
        console.error('[GoalAnalysis] API error:', response.status);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('[GoalAnalysis] Network error:', error);
      return null;
    }
  }

  /**
   * Cancel pending analysis for a note
   */
  cancelAnalysis(noteId: string): void {
    const timer = this.debounceTimers.get(noteId);
    if (timer) {
      clearTimeout(timer);
      this.debounceTimers.delete(noteId);
    }
  }

  /**
   * Full cleanup for a deleted note — cancel pending timers and clear tracking state
   */
  cleanupForNote(noteId: string): void {
    this.cancelAnalysis(noteId);
    this.analyzingNotes.delete(noteId);
  }

  /**
   * Check if a note is currently being analyzed
   */
  isAnalyzing(noteId: string): boolean {
    return this.analyzingNotes.has(noteId);
  }
}

// Export singleton
export const goalAnalysisService = GoalAnalysisService.getInstance();
