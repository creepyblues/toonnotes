/**
 * Nudge Store - MODE Framework v2.0
 *
 * Manages the nudge queue and delivery system for AI agent interactions.
 * Nudges are proactive prompts from AI agents that help guide notes
 * toward usefulness within each cognitive mode.
 *
 * Features:
 * - Priority-based queue management
 * - Scheduled delivery support
 * - Outcome tracking for behavior learning
 * - Cooldown management to prevent spam
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { debouncedStorage } from './debouncedStorage';
import {
  AgentId,
  Nudge,
  NudgeAction,
  NudgeDeliveryChannel,
  NudgeOption,
  NudgeOutcome,
  NudgePriority,
} from '@/types';

// ============================================
// Constants
// ============================================

const MAX_QUEUE_SIZE = 50;
const MAX_HISTORY_SIZE = 100;
const DEFAULT_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// Priority weights for sorting
const PRIORITY_WEIGHTS: Record<NudgePriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

// ============================================
// Helper Functions
// ============================================

const generateNudgeId = (): string => {
  return `nudge_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const sortByPriority = (a: Nudge, b: Nudge): number => {
  // First sort by priority weight (higher first)
  const priorityDiff = PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority];
  if (priorityDiff !== 0) return priorityDiff;

  // Then by creation time (older first)
  return a.createdAt - b.createdAt;
};

const isExpired = (nudge: Nudge): boolean => {
  if (!nudge.expiresAt) return false;
  return Date.now() > nudge.expiresAt;
};

const isReadyToShow = (nudge: Nudge): boolean => {
  if (nudge.shownAt) return false; // Already shown
  if (isExpired(nudge)) return false;
  if (nudge.showAt && Date.now() < nudge.showAt) return false; // Scheduled for later
  return true;
};

// ============================================
// Store Interface
// ============================================

interface NudgeState {
  // Data
  queue: Nudge[];
  history: Nudge[];
  activeNudge: Nudge | null;
  skillCooldowns: Record<string, number>; // skillId -> lastTriggeredAt

  // Actions - Queue management
  addNudge: (params: CreateNudgeParams) => Nudge;
  removeNudge: (nudgeId: string) => void;
  clearQueue: () => void;
  clearExpired: () => void;

  // Actions - Delivery
  getNextNudge: (channel?: NudgeDeliveryChannel) => Nudge | null;
  markAsShown: (nudgeId: string) => void;
  setActiveNudge: (nudge: Nudge | null) => void;

  // Actions - Outcomes
  recordOutcome: (nudgeId: string, outcome: NudgeOutcome) => void;
  dismissNudge: (nudgeId: string) => void;
  snoozeNudge: (nudgeId: string, durationMs: number) => void;
  acceptNudge: (nudgeId: string) => void;

  // Actions - Cooldowns
  setSkillCooldown: (skillId: string, durationMs: number) => void;
  isSkillOnCooldown: (skillId: string) => boolean;
  clearSkillCooldown: (skillId: string) => void;

  // Selectors
  getQueuedCount: () => number;
  getPendingForNote: (noteId: string) => Nudge[];
  getPendingForAgent: (agentId: AgentId) => Nudge[];
  getOutcomeStats: () => OutcomeStats;
}

interface CreateNudgeParams {
  skillId: string;
  agentId: AgentId;
  title: string;
  body: string;
  options: NudgeOption[];
  noteId?: string;
  boardId?: string;
  priority?: NudgePriority;
  deliveryChannel?: NudgeDeliveryChannel;
  showAt?: number;
  expiresAt?: number;
}

interface OutcomeStats {
  total: number;
  accepted: number;
  dismissed: number;
  snoozed: number;
  ignored: number;
  expired: number;
  acceptanceRate: number;
}

// ============================================
// Store Implementation
// ============================================

export const useNudgeStore = create<NudgeState>()(
  persist(
    (set, get) => ({
      queue: [],
      history: [],
      activeNudge: null,
      skillCooldowns: {},

      // Queue management
      addNudge: (params) => {
        const nudge: Nudge = {
          id: generateNudgeId(),
          skillId: params.skillId,
          agentId: params.agentId,
          title: params.title,
          body: params.body,
          options: params.options,
          noteId: params.noteId,
          boardId: params.boardId,
          priority: params.priority ?? 'medium',
          deliveryChannel: params.deliveryChannel ?? 'toast',
          createdAt: Date.now(),
          showAt: params.showAt,
          expiresAt: params.expiresAt ?? Date.now() + DEFAULT_EXPIRY_MS,
        };

        set((state) => {
          // Add to queue, sort by priority, and cap size
          const newQueue = [...state.queue, nudge]
            .sort(sortByPriority)
            .slice(0, MAX_QUEUE_SIZE);

          return { queue: newQueue };
        });

        return nudge;
      },

      removeNudge: (nudgeId) => {
        set((state) => ({
          queue: state.queue.filter((n) => n.id !== nudgeId),
          activeNudge: state.activeNudge?.id === nudgeId ? null : state.activeNudge,
        }));
      },

      clearQueue: () => {
        set({ queue: [], activeNudge: null });
      },

      clearExpired: () => {
        const now = Date.now();
        set((state) => {
          const expired = state.queue.filter((n) => isExpired(n));
          const valid = state.queue.filter((n) => !isExpired(n));

          // Move expired to history with outcome
          const expiredWithOutcome = expired.map((n) => ({
            ...n,
            outcome: 'expired' as NudgeOutcome,
          }));

          const newHistory = [...expiredWithOutcome, ...state.history].slice(0, MAX_HISTORY_SIZE);

          return {
            queue: valid,
            history: newHistory,
          };
        });
      },

      // Delivery
      getNextNudge: (channel) => {
        const { queue, clearExpired } = get();

        // Clean up expired first
        clearExpired();

        // Find first ready nudge, optionally filtered by channel
        return (
          queue.find((n) => {
            if (!isReadyToShow(n)) return false;
            if (channel && n.deliveryChannel !== channel) return false;
            return true;
          }) ?? null
        );
      },

      markAsShown: (nudgeId) => {
        set((state) => ({
          queue: state.queue.map((n) =>
            n.id === nudgeId ? { ...n, shownAt: Date.now() } : n
          ),
        }));
      },

      setActiveNudge: (nudge) => {
        set({ activeNudge: nudge });
      },

      // Outcomes
      recordOutcome: (nudgeId, outcome) => {
        set((state) => {
          const nudge = state.queue.find((n) => n.id === nudgeId);
          if (!nudge) return state;

          const updatedNudge: Nudge = {
            ...nudge,
            interactedAt: Date.now(),
            outcome,
          };

          // Remove from queue, add to history
          const newQueue = state.queue.filter((n) => n.id !== nudgeId);
          const newHistory = [updatedNudge, ...state.history].slice(0, MAX_HISTORY_SIZE);

          return {
            queue: newQueue,
            history: newHistory,
            activeNudge: state.activeNudge?.id === nudgeId ? null : state.activeNudge,
          };
        });
      },

      dismissNudge: (nudgeId) => {
        get().recordOutcome(nudgeId, 'dismissed');
      },

      snoozeNudge: (nudgeId, durationMs) => {
        set((state) => {
          const nudge = state.queue.find((n) => n.id === nudgeId);
          if (!nudge) return state;

          // Update showAt to future time
          const updatedNudge: Nudge = {
            ...nudge,
            showAt: Date.now() + durationMs,
            shownAt: undefined, // Clear shown state
          };

          return {
            queue: state.queue
              .map((n) => (n.id === nudgeId ? updatedNudge : n))
              .sort(sortByPriority),
            activeNudge: state.activeNudge?.id === nudgeId ? null : state.activeNudge,
          };
        });
      },

      acceptNudge: (nudgeId) => {
        get().recordOutcome(nudgeId, 'accepted');
      },

      // Cooldowns
      setSkillCooldown: (skillId, durationMs) => {
        set((state) => ({
          skillCooldowns: {
            ...state.skillCooldowns,
            [skillId]: Date.now() + durationMs,
          },
        }));
      },

      isSkillOnCooldown: (skillId) => {
        const cooldownEnd = get().skillCooldowns[skillId];
        if (!cooldownEnd) return false;
        return Date.now() < cooldownEnd;
      },

      clearSkillCooldown: (skillId) => {
        set((state) => {
          const { [skillId]: _, ...rest } = state.skillCooldowns;
          return { skillCooldowns: rest };
        });
      },

      // Selectors
      getQueuedCount: () => {
        return get().queue.filter((n) => isReadyToShow(n)).length;
      },

      getPendingForNote: (noteId) => {
        return get().queue.filter((n) => n.noteId === noteId && isReadyToShow(n));
      },

      getPendingForAgent: (agentId) => {
        return get().queue.filter((n) => n.agentId === agentId && isReadyToShow(n));
      },

      getOutcomeStats: () => {
        const { history } = get();
        const total = history.length;

        if (total === 0) {
          return {
            total: 0,
            accepted: 0,
            dismissed: 0,
            snoozed: 0,
            ignored: 0,
            expired: 0,
            acceptanceRate: 0,
          };
        }

        const accepted = history.filter((n) => n.outcome === 'accepted').length;
        const dismissed = history.filter((n) => n.outcome === 'dismissed').length;
        const snoozed = history.filter((n) => n.outcome === 'snoozed').length;
        const ignored = history.filter((n) => n.outcome === 'ignored').length;
        const expired = history.filter((n) => n.outcome === 'expired').length;

        return {
          total,
          accepted,
          dismissed,
          snoozed,
          ignored,
          expired,
          acceptanceRate: total > 0 ? accepted / total : 0,
        };
      },
    }),
    {
      name: 'nudge-storage',
      storage: createJSONStorage(() => debouncedStorage),
      partialize: (state) => ({
        queue: state.queue,
        history: state.history,
        skillCooldowns: state.skillCooldowns,
      }),
    }
  )
);

// ============================================
// Nudge Builder Helper
// ============================================

/**
 * Helper class to build nudges with a fluent API
 */
export class NudgeBuilder {
  private params: Partial<CreateNudgeParams> = {};

  constructor(skillId: string, agentId: AgentId) {
    this.params.skillId = skillId;
    this.params.agentId = agentId;
    this.params.options = [];
  }

  title(title: string): this {
    this.params.title = title;
    return this;
  }

  body(body: string): this {
    this.params.body = body;
    return this;
  }

  forNote(noteId: string): this {
    this.params.noteId = noteId;
    return this;
  }

  forBoard(boardId: string): this {
    this.params.boardId = boardId;
    return this;
  }

  priority(priority: NudgePriority): this {
    this.params.priority = priority;
    return this;
  }

  channel(channel: NudgeDeliveryChannel): this {
    this.params.deliveryChannel = channel;
    return this;
  }

  scheduleAt(timestamp: number): this {
    this.params.showAt = timestamp;
    return this;
  }

  expiresIn(durationMs: number): this {
    this.params.expiresAt = Date.now() + durationMs;
    return this;
  }

  addOption(option: NudgeOption): this {
    this.params.options = [...(this.params.options ?? []), option];
    return this;
  }

  addPrimaryOption(label: string, action: NudgeAction, icon?: string): this {
    return this.addOption({
      id: `opt_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      label,
      action,
      icon,
      isPrimary: true,
    });
  }

  addSecondaryOption(label: string, action: NudgeAction, icon?: string): this {
    return this.addOption({
      id: `opt_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      label,
      action,
      icon,
      isPrimary: false,
    });
  }

  build(): CreateNudgeParams {
    if (!this.params.skillId || !this.params.agentId) {
      throw new Error('Nudge requires skillId and agentId');
    }
    if (!this.params.title || !this.params.body) {
      throw new Error('Nudge requires title and body');
    }
    if (!this.params.options?.length) {
      throw new Error('Nudge requires at least one option');
    }

    return this.params as CreateNudgeParams;
  }

  /**
   * Build and immediately add to the nudge store
   */
  send(): Nudge {
    const params = this.build();
    return useNudgeStore.getState().addNudge(params);
  }
}

/**
 * Factory function to create a NudgeBuilder
 */
export const createNudge = (skillId: string, agentId: AgentId): NudgeBuilder => {
  return new NudgeBuilder(skillId, agentId);
};

// ============================================
// Common Nudge Actions
// ============================================

export const NudgeActions = {
  dismiss: (): NudgeAction => ({ type: 'dismiss' }),

  snooze: (hours: number): NudgeAction => ({
    type: 'snooze',
    duration: hours * 60 * 60 * 1000,
  }),

  navigate: (target: string): NudgeAction => ({
    type: 'navigate',
    target,
  }),

  updateNote: (noteId: string, changes: Partial<import('@/types').Note>): NudgeAction => ({
    type: 'update_note',
    noteId,
    changes,
  }),

  moveNote: (noteId: string, targetBoard: string): NudgeAction => ({
    type: 'move_note',
    noteId,
    targetBoard,
  }),

  custom: (handler: string, data?: Record<string, unknown>): NudgeAction => ({
    type: 'custom',
    handler,
    data,
  }),
};
