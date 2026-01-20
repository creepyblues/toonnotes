/**
 * Nudge Delivery Service - MODE Framework v2.0
 *
 * Orchestrates the delivery of nudges from AI agents to users.
 * Handles:
 * - Skill execution and result processing
 * - Nudge creation and queuing
 * - Delivery channel selection
 * - Action execution when users respond
 * - Analytics and learning feedback
 *
 * This service acts as the bridge between the agent/skill system
 * and the UI components that display nudges.
 */

import {
  AgentId,
  Note,
  NoteBehavior,
  Nudge,
  NudgeAction,
  NudgeDeliveryChannel,
  NudgeOutcome,
} from '@/types';
import { useNudgeStore, createNudge, NudgeActions } from '@/stores/nudgeStore';
import { useBehaviorStore } from '@/stores/behaviorStore';
import { agentRegistry } from './agents/Agent';
import type { Skill, SkillContext, SkillResult, NudgeParams } from './agents/Agent';
import { skillRegistry } from './skills';
import { triggerEngine, TriggerContext, TriggerEvaluationResult } from './triggerEngine';
import { trackEvent } from './firebaseAnalytics';

// ============================================
// Types
// ============================================

/**
 * Delivery result
 */
export interface DeliveryResult {
  success: boolean;
  nudge?: Nudge;
  error?: string;
}

/**
 * Action execution result
 */
export interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Listener for nudge events
 */
export type NudgeEventListener = (nudge: Nudge) => void;

// ============================================
// Nudge Delivery Service
// ============================================

class NudgeDeliveryService {
  private static instance: NudgeDeliveryService;
  private listeners: Map<string, Set<NudgeEventListener>> = new Map();
  private processingQueue: boolean = false;
  private isProcessingNudge: boolean = false; // Prevent race condition in queue processing

  private constructor() {
    // Initialize event listener maps
    this.listeners.set('nudge_ready', new Set());
    this.listeners.set('nudge_shown', new Set());
    this.listeners.set('nudge_interacted', new Set());
    this.listeners.set('nudge_dismissed', new Set());
  }

  static getInstance(): NudgeDeliveryService {
    if (!NudgeDeliveryService.instance) {
      NudgeDeliveryService.instance = new NudgeDeliveryService();
    }
    return NudgeDeliveryService.instance;
  }

  // ============================================
  // Skill Execution Pipeline
  // ============================================

  /**
   * Process triggered skills and create nudges from results
   */
  async processTriggeredSkills(
    results: TriggerEvaluationResult[],
    context: TriggerContext
  ): Promise<DeliveryResult[]> {
    const deliveryResults: DeliveryResult[] = [];

    // Filter to only triggered skills
    const triggeredResults = results.filter((r) => r.triggered);

    for (const result of triggeredResults) {
      try {
        // Build skill context
        const skillContext: SkillContext = {
          note: context.note,
          behavior: context.behavior,
          boardId: context.boardId,
          boardHashtag: context.boardHashtag,
          timestamp: Date.now(),
        };

        // Execute the skill
        const skillResult = await result.skill.execute(skillContext);

        // Process the result
        if (skillResult.shouldNudge && skillResult.nudgeParams) {
          const deliveryResult = await this.createAndQueueNudge(
            result.skill,
            skillResult.nudgeParams,
            context
          );
          deliveryResults.push(deliveryResult);
        }

        // Handle auto-actions
        if (skillResult.autoAction) {
          await this.executeAutoAction(skillResult.autoAction, context);
        }
      } catch (error) {
        console.error(`[NudgeDelivery] Skill ${result.skill.id} failed:`, error);
        deliveryResults.push({
          success: false,
          error: `Skill execution failed: ${error}`,
        });
      }
    }

    return deliveryResults;
  }

  /**
   * Create a nudge and add it to the queue
   */
  private async createAndQueueNudge(
    skill: Skill,
    params: NudgeParams,
    context: TriggerContext
  ): Promise<DeliveryResult> {
    try {
      // Determine agent ID from skill registry
      const agentId = this.getAgentIdForSkill(skill.id);

      // Create the nudge using the builder
      const nudge = createNudge(skill.id, agentId)
        .title(params.title)
        .body(params.body)
        .priority(params.priority ?? 'medium')
        .channel(params.deliveryChannel ?? 'toast');

      // Add note/board context
      if (context.note) {
        nudge.forNote(context.note.id);
      }
      if (context.boardId) {
        nudge.forBoard(context.boardId);
      }

      // Add options
      for (const option of params.options) {
        nudge.addOption(option);
      }

      // Set expiry if specified
      if (params.expiresIn) {
        nudge.expiresIn(params.expiresIn);
      }

      // Schedule if specified
      if (params.showAt) {
        nudge.scheduleAt(params.showAt);
      }

      // Send to queue
      const createdNudge = nudge.send();

      // Track analytics
      trackEvent('nudge_created', {
        skill_id: skill.id,
        agent_id: agentId,
        priority: params.priority ?? 'medium',
        channel: params.deliveryChannel ?? 'toast',
      });

      // Notify listeners
      this.emit('nudge_ready', createdNudge);

      return {
        success: true,
        nudge: createdNudge,
      };
    } catch (error) {
      console.error('[NudgeDelivery] Failed to create nudge:', error);
      return {
        success: false,
        error: `Failed to create nudge: ${error}`,
      };
    }
  }

  /**
   * Get agent ID for a skill
   */
  private getAgentIdForSkill(skillId: string): AgentId {
    // Check skill prefix to determine agent
    if (skillId.startsWith('mgr-')) return 'manager';
    if (skillId.startsWith('muse-')) return 'muse';
    if (skillId.startsWith('lib-')) return 'librarian';
    if (skillId.startsWith('bio-')) return 'biographer';

    // Default to librarian (organize mode)
    return 'librarian';
  }

  /**
   * Execute an auto-action from a skill result
   */
  private async executeAutoAction(
    action: import('./agents/Agent').AutoAction,
    context: TriggerContext
  ): Promise<void> {
    switch (action.type) {
      case 'update_behavior':
        if (context.note?.id) {
          useBehaviorStore.getState().updateBehavior(
            context.note.id,
            action.payload as Partial<NoteBehavior>
          );
        }
        break;

      case 'update_note':
        if (context.note?.id) {
          const { useNoteStore } = require('@/stores');
          useNoteStore.getState().updateNote(
            context.note.id,
            action.payload as Partial<Note>
          );
        }
        break;

      case 'log_event':
        trackEvent(
          action.payload.eventName as string,
          action.payload.params as Record<string, string | number | boolean>
        );
        break;

      default:
        console.warn('[NudgeDelivery] Unknown auto-action type:', action.type);
    }
  }

  // ============================================
  // Nudge Delivery
  // ============================================

  /**
   * Get the next nudge ready for delivery
   */
  getNextNudge(channel?: NudgeDeliveryChannel): Nudge | null {
    return useNudgeStore.getState().getNextNudge(channel);
  }

  /**
   * Mark a nudge as shown
   */
  markAsShown(nudgeId: string): void {
    useNudgeStore.getState().markAsShown(nudgeId);

    const nudge = this.findNudgeById(nudgeId);
    if (nudge) {
      trackEvent('nudge_shown', {
        nudge_id: nudgeId,
        skill_id: nudge.skillId,
        agent_id: nudge.agentId,
      });

      this.emit('nudge_shown', nudge);
    }
  }

  /**
   * Find a nudge by ID
   */
  private findNudgeById(nudgeId: string): Nudge | undefined {
    const state = useNudgeStore.getState();
    return state.queue.find((n) => n.id === nudgeId);
  }

  // ============================================
  // Action Handling
  // ============================================

  /**
   * Handle user interaction with a nudge
   */
  async handleNudgeAction(nudgeId: string, optionId: string): Promise<ActionResult> {
    const nudge = this.findNudgeById(nudgeId);
    if (!nudge) {
      return { success: false, error: 'Nudge not found' };
    }

    const option = nudge.options.find((o) => o.id === optionId);
    if (!option) {
      return { success: false, error: 'Option not found' };
    }

    try {
      // Execute the action
      const result = await this.executeAction(option.action, nudge);

      // Record outcome
      const outcome = this.actionToOutcome(option.action);
      useNudgeStore.getState().recordOutcome(nudgeId, outcome);

      // Track behavior response
      if (nudge.noteId) {
        useBehaviorStore.getState().trackNudgeResponse(nudge.noteId, outcome === 'accepted');
      }

      // Analytics
      trackEvent('nudge_interacted', {
        nudge_id: nudgeId,
        skill_id: nudge.skillId,
        agent_id: nudge.agentId,
        option_id: optionId,
        outcome,
      });

      // Notify listeners
      this.emit('nudge_interacted', nudge);

      return result;
    } catch (error) {
      console.error('[NudgeDelivery] Action failed:', error);
      return {
        success: false,
        error: `Action failed: ${error}`,
      };
    }
  }

  /**
   * Execute a nudge action
   */
  private async executeAction(action: NudgeAction, nudge: Nudge): Promise<ActionResult> {
    switch (action.type) {
      case 'dismiss':
        return { success: true, message: 'Dismissed' };

      case 'snooze':
        useNudgeStore.getState().snoozeNudge(nudge.id, action.duration);
        return { success: true, message: `Snoozed for ${action.duration / 3600000} hours` };

      case 'navigate':
        // Navigation is handled by the UI layer
        return { success: true, message: `Navigate to ${action.target}` };

      case 'update_note':
        if (action.noteId) {
          const { useNoteStore } = require('@/stores');
          useNoteStore.getState().updateNote(action.noteId, action.changes);
          return { success: true, message: 'Note updated' };
        }
        return { success: false, error: 'No note ID specified' };

      case 'move_note':
        if (action.noteId) {
          const { useNoteStore } = require('@/stores');
          const note = useNoteStore.getState().notes.find(
            (n: Note) => n.id === action.noteId
          );
          if (note) {
            // Add the target board as a label
            useNoteStore.getState().addLabelToNote(action.noteId, action.targetBoard);
            return { success: true, message: `Moved to ${action.targetBoard}` };
          }
        }
        return { success: false, error: 'Note not found' };

      case 'custom':
        // Custom handlers are registered elsewhere
        return this.executeCustomHandler(action.handler, action.data, nudge);

      default:
        return { success: false, error: 'Unknown action type' };
    }
  }

  /**
   * Convert action type to outcome
   */
  private actionToOutcome(action: NudgeAction): NudgeOutcome {
    switch (action.type) {
      case 'dismiss':
        return 'dismissed';
      case 'snooze':
        return 'snoozed';
      default:
        return 'accepted';
    }
  }

  /**
   * Execute a custom action handler
   */
  private customHandlers: Map<string, (data: unknown, nudge: Nudge) => Promise<ActionResult>> =
    new Map();

  registerCustomHandler(
    name: string,
    handler: (data: unknown, nudge: Nudge) => Promise<ActionResult>
  ): void {
    this.customHandlers.set(name, handler);
  }

  private async executeCustomHandler(
    handler: string,
    data: unknown,
    nudge: Nudge
  ): Promise<ActionResult> {
    const fn = this.customHandlers.get(handler);
    if (!fn) {
      return { success: false, error: `Unknown handler: ${handler}` };
    }
    return fn(data, nudge);
  }

  // ============================================
  // Convenience Methods
  // ============================================

  /**
   * Dismiss a nudge
   */
  dismissNudge(nudgeId: string): void {
    useNudgeStore.getState().dismissNudge(nudgeId);

    const nudge = this.findNudgeById(nudgeId);
    if (nudge) {
      trackEvent('nudge_dismissed', {
        nudge_id: nudgeId,
        skill_id: nudge.skillId,
        agent_id: nudge.agentId,
      });

      this.emit('nudge_dismissed', nudge);
    }
  }

  /**
   * Snooze a nudge
   */
  snoozeNudge(nudgeId: string, hours: number): void {
    useNudgeStore.getState().snoozeNudge(nudgeId, hours * 60 * 60 * 1000);
  }

  /**
   * Accept a nudge (mark as accepted without executing action)
   */
  acceptNudge(nudgeId: string): void {
    useNudgeStore.getState().acceptNudge(nudgeId);
  }

  /**
   * Get count of pending nudges
   */
  getPendingCount(): number {
    return useNudgeStore.getState().getQueuedCount();
  }

  /**
   * Get nudge statistics
   */
  getStats() {
    return useNudgeStore.getState().getOutcomeStats();
  }

  // ============================================
  // Event System
  // ============================================

  /**
   * Subscribe to nudge events
   */
  on(event: string, listener: NudgeEventListener): () => void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.add(listener);
    }

    // Return unsubscribe function
    return () => {
      listeners?.delete(listener);
    };
  }

  /**
   * Emit an event
   */
  private emit(event: string, nudge: Nudge): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(nudge);
        } catch (error) {
          console.error(`[NudgeDelivery] Event listener error:`, error);
        }
      }
    }
  }

  // ============================================
  // Queue Processing
  // ============================================

  /**
   * Start processing the nudge queue
   * This runs in the background and delivers nudges as they become ready
   */
  startQueueProcessing(onNudgeReady: (nudge: Nudge) => void | Promise<void>): () => void {
    this.processingQueue = true;

    const processNextNudge = async () => {
      // Prevent concurrent processing (race condition fix)
      if (!this.processingQueue || this.isProcessingNudge) return;

      this.isProcessingNudge = true;
      try {
        const nudge = this.getNextNudge();
        if (nudge) {
          // Await callback in case it's async
          await onNudgeReady(nudge);
          this.markAsShown(nudge.id);
        }

        // Also clear expired nudges
        useNudgeStore.getState().clearExpired();
      } catch (error) {
        console.error('[NudgeDeliveryService] Error processing nudge:', error);
      } finally {
        this.isProcessingNudge = false;
      }
    };

    const intervalId = setInterval(processNextNudge, 5000); // Check every 5 seconds

    // Return stop function
    return () => {
      this.processingQueue = false;
      this.isProcessingNudge = false;
      clearInterval(intervalId);
    };
  }

  /**
   * Stop queue processing
   */
  stopQueueProcessing(): void {
    this.processingQueue = false;
  }
}

// Export singleton instance
export const nudgeDeliveryService = NudgeDeliveryService.getInstance();

// ============================================
// Convenience Exports
// ============================================

export {
  NudgeDeliveryService,
};
