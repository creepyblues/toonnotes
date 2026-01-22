'use client';

/**
 * Behavior Store - MODE Framework v2.0 (Web)
 *
 * Tracks note behaviors and engagement patterns within the MODE framework.
 * Adapted from Expo version for Next.js web application.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Mode,
  OrganizeStage,
  ManageData,
  DevelopData,
  OrganizeData,
  ExperienceData,
  ModeData,
  NoteBehavior,
  UserPatterns,
  NudgeDeliveryChannel,
} from '@toonnotes/types';

// ============================================
// Default Values
// ============================================

const createDefaultManageData = (): ManageData => ({
  hasDeadline: false,
  hasPriority: false,
  hasSubtasks: false,
  stateHistory: [],
  usefulnessLevel: 'captured',
});

const createDefaultDevelopData = (): DevelopData => ({
  maturityLevel: 'spark',
  expansionCount: 0,
  linkedIdeas: [],
});

const createDefaultOrganizeData = (stage: OrganizeStage = 'inbox'): OrganizeData => ({
  stage,
  usageCount: 0,
  tags: [],
  flowStage: 'filed',
});

const createDefaultExperienceData = (): ExperienceData => ({
  entryDate: Date.now(),
  hasMedia: false,
  hasLocation: false,
  peopleTagged: [],
  streakDays: 0,
  depthLevel: 'logged',
});

const createDefaultModeData = (mode: Mode, organizeStage?: OrganizeStage): ModeData => {
  switch (mode) {
    case 'manage':
      return createDefaultManageData();
    case 'develop':
      return createDefaultDevelopData();
    case 'organize':
      return createDefaultOrganizeData(organizeStage);
    case 'experience':
      return createDefaultExperienceData();
  }
};

const getInitialUsefulnessLevel = (mode: Mode): string => {
  switch (mode) {
    case 'manage':
      return 'captured';
    case 'develop':
      return 'spark';
    case 'organize':
      return 'filed';
    case 'experience':
      return 'logged';
  }
};

const createDefaultBehavior = (
  noteId: string,
  mode: Mode,
  organizeStage?: OrganizeStage
): NoteBehavior => ({
  noteId,
  mode,
  usefulnessScore: 0,
  usefulnessLevel: getInitialUsefulnessLevel(mode),
  lastAccessedAt: Date.now(),
  accessCount: 0,
  editCount: 0,
  createdAt: Date.now(),
  modeData: createDefaultModeData(mode, organizeStage),
  nudgeCount: 0,
});

// ============================================
// Usefulness Score Calculation
// ============================================

const calculateManageScore = (data: ManageData): number => {
  let score = 10; // Base score
  if (data.hasDeadline) score += 25;
  if (data.hasPriority) score += 20;
  if (data.hasSubtasks) score += 15;
  if (data.completedAt) score += 30;
  return Math.min(score, 100);
};

const calculateDevelopScore = (data: DevelopData): number => {
  let score = 0;
  switch (data.maturityLevel) {
    case 'spark':
      score = 15;
      break;
    case 'explored':
      score = 40;
      break;
    case 'developed':
      score = 70;
      break;
    case 'ready':
      score = 100;
      break;
  }
  score += Math.min(data.expansionCount * 5, 15);
  score += Math.min(data.linkedIdeas.length * 3, 10);
  return Math.min(score, 100);
};

const calculateOrganizeScore = (data: OrganizeData): number => {
  let score = 0;
  switch (data.flowStage) {
    case 'filed':
      score = 20;
      break;
    case 'accessed':
      score = 50;
      break;
    case 'valuable':
      score = 80;
      break;
    case 'essential':
      score = 100;
      break;
  }
  score += Math.min(data.tags.length * 2, 10);
  score += Math.min(data.usageCount * 4, 20);
  return Math.min(score, 100);
};

const calculateExperienceScore = (data: ExperienceData): number => {
  let score = 0;
  switch (data.depthLevel) {
    case 'logged':
      score = 20;
      break;
    case 'detailed':
      score = 50;
      break;
    case 'connected':
      score = 75;
      break;
    case 'memory':
      score = 100;
      break;
  }
  if (data.hasMedia) score += 10;
  if (data.hasLocation) score += 5;
  score += Math.min(data.peopleTagged.length * 3, 10);
  score += Math.min(data.streakDays * 2, 15);
  return Math.min(score, 100);
};

const calculateUsefulnessScore = (mode: Mode, modeData: ModeData): number => {
  switch (mode) {
    case 'manage':
      return calculateManageScore(modeData as ManageData);
    case 'develop':
      return calculateDevelopScore(modeData as DevelopData);
    case 'organize':
      return calculateOrganizeScore(modeData as OrganizeData);
    case 'experience':
      return calculateExperienceScore(modeData as ExperienceData);
  }
};

// ============================================
// Store Interface
// ============================================

interface BehaviorState {
  behaviors: Record<string, NoteBehavior>;
  userPatterns: UserPatterns | null;

  // CRUD
  getBehavior: (noteId: string) => NoteBehavior | undefined;
  initBehavior: (noteId: string, mode: Mode, organizeStage?: OrganizeStage) => NoteBehavior;
  updateBehavior: (noteId: string, updates: Partial<NoteBehavior>) => void;
  deleteBehavior: (noteId: string) => void;

  // Engagement tracking
  trackAccess: (noteId: string) => void;
  trackEdit: (noteId: string) => void;
  trackNudgeResponse: (noteId: string, responded: boolean) => void;

  // Mode-specific updates
  updateManageData: (noteId: string, updates: Partial<ManageData>) => void;
  updateDevelopData: (noteId: string, updates: Partial<DevelopData>) => void;
  updateOrganizeData: (noteId: string, updates: Partial<OrganizeData>) => void;
  updateExperienceData: (noteId: string, updates: Partial<ExperienceData>) => void;

  // Usefulness
  recalculateScore: (noteId: string) => number;

  // User patterns
  updateUserPatterns: (updates: Partial<UserPatterns>) => void;

  // Selectors
  getBehaviorsByMode: (mode: Mode) => NoteBehavior[];
  getLowUsefulnessNotes: (threshold?: number) => NoteBehavior[];
  getStaleNotes: (daysThreshold: number) => NoteBehavior[];
}

// ============================================
// Store Implementation
// ============================================

export const useBehaviorStore = create<BehaviorState>()(
  persist(
    (set, get) => ({
      behaviors: {},
      userPatterns: null,

      getBehavior: (noteId) => get().behaviors[noteId],

      initBehavior: (noteId, mode, organizeStage) => {
        const existing = get().behaviors[noteId];
        if (existing) return existing;

        const behavior = createDefaultBehavior(noteId, mode, organizeStage);
        set((state) => ({
          behaviors: { ...state.behaviors, [noteId]: behavior },
        }));
        return behavior;
      },

      updateBehavior: (noteId, updates) => {
        set((state) => {
          const existing = state.behaviors[noteId];
          if (!existing) return state;

          const updated = { ...existing, ...updates };
          if (updates.modeData) {
            updated.usefulnessScore = calculateUsefulnessScore(updated.mode, updated.modeData);
          }

          return {
            behaviors: { ...state.behaviors, [noteId]: updated },
          };
        });
      },

      deleteBehavior: (noteId) => {
        set((state) => {
          const { [noteId]: _, ...rest } = state.behaviors;
          return { behaviors: rest };
        });
      },

      trackAccess: (noteId) => {
        set((state) => {
          const existing = state.behaviors[noteId];
          if (!existing) return state;

          const updated: NoteBehavior = {
            ...existing,
            lastAccessedAt: Date.now(),
            accessCount: existing.accessCount + 1,
          };

          if (existing.mode === 'organize') {
            const organizeData = existing.modeData as OrganizeData;
            if (organizeData.flowStage === 'filed' && updated.accessCount >= 3) {
              updated.modeData = {
                ...organizeData,
                flowStage: 'accessed',
                lastUsedAt: Date.now(),
              };
              updated.usefulnessScore = calculateUsefulnessScore('organize', updated.modeData);
            }
          }

          return {
            behaviors: { ...state.behaviors, [noteId]: updated },
          };
        });
      },

      trackEdit: (noteId) => {
        set((state) => {
          const existing = state.behaviors[noteId];
          if (!existing) return state;

          return {
            behaviors: {
              ...state.behaviors,
              [noteId]: {
                ...existing,
                editCount: existing.editCount + 1,
              },
            },
          };
        });
      },

      trackNudgeResponse: (noteId, responded) => {
        set((state) => {
          const existing = state.behaviors[noteId];
          if (!existing) return state;

          const newCount = existing.nudgeCount + 1;
          const currentRate = existing.nudgeResponseRate ?? 0;
          const newRate = (currentRate * (newCount - 1) + (responded ? 1 : 0)) / newCount;

          return {
            behaviors: {
              ...state.behaviors,
              [noteId]: {
                ...existing,
                lastNudgedAt: Date.now(),
                nudgeCount: newCount,
                nudgeResponseRate: newRate,
              },
            },
          };
        });
      },

      updateManageData: (noteId, updates) => {
        const { behaviors, updateBehavior } = get();
        const existing = behaviors[noteId];
        if (!existing || existing.mode !== 'manage') return;

        const currentData = existing.modeData as ManageData;
        const newData: ManageData = { ...currentData, ...updates };

        if (newData.completedAt) {
          newData.usefulnessLevel = 'complete';
        } else if (newData.hasDeadline && newData.hasPriority) {
          newData.usefulnessLevel = 'ready';
        } else if (newData.hasDeadline) {
          newData.usefulnessLevel = 'scheduled';
        } else {
          newData.usefulnessLevel = 'captured';
        }

        updateBehavior(noteId, {
          modeData: newData,
          usefulnessLevel: newData.usefulnessLevel,
        });
      },

      updateDevelopData: (noteId, updates) => {
        const { behaviors, updateBehavior } = get();
        const existing = behaviors[noteId];
        if (!existing || existing.mode !== 'develop') return;

        const currentData = existing.modeData as DevelopData;
        const newData: DevelopData = { ...currentData, ...updates };

        updateBehavior(noteId, {
          modeData: newData,
          usefulnessLevel: newData.maturityLevel,
        });
      },

      updateOrganizeData: (noteId, updates) => {
        const { behaviors, updateBehavior } = get();
        const existing = behaviors[noteId];
        if (!existing || existing.mode !== 'organize') return;

        const currentData = existing.modeData as OrganizeData;
        const newData: OrganizeData = { ...currentData, ...updates };

        if (newData.usageCount >= 5 && newData.flowStage !== 'essential') {
          newData.flowStage = 'valuable';
        }

        updateBehavior(noteId, {
          modeData: newData,
          usefulnessLevel: newData.flowStage,
        });
      },

      updateExperienceData: (noteId, updates) => {
        const { behaviors, updateBehavior } = get();
        const existing = behaviors[noteId];
        if (!existing || existing.mode !== 'experience') return;

        const currentData = existing.modeData as ExperienceData;
        const newData: ExperienceData = { ...currentData, ...updates };

        const hasRichContent =
          newData.hasMedia || newData.hasLocation || newData.peopleTagged.length > 0;
        if (newData.depthLevel === 'logged' && hasRichContent) {
          newData.depthLevel = 'detailed';
        }

        updateBehavior(noteId, {
          modeData: newData,
          usefulnessLevel: newData.depthLevel,
        });
      },

      recalculateScore: (noteId) => {
        const { behaviors, updateBehavior } = get();
        const existing = behaviors[noteId];
        if (!existing) return 0;

        const score = calculateUsefulnessScore(existing.mode, existing.modeData);
        updateBehavior(noteId, { usefulnessScore: score });
        return score;
      },

      updateUserPatterns: (updates) => {
        set((state) => ({
          userPatterns: {
            activeHours: state.userPatterns?.activeHours ?? [],
            nudgeResponseRate: state.userPatterns?.nudgeResponseRate ?? 0,
            preferredNudgeChannel: state.userPatterns?.preferredNudgeChannel ?? 'toast',
            dismissedSkillIds: state.userPatterns?.dismissedSkillIds ?? [],
            averageNoteLength: state.userPatterns?.averageNoteLength ?? 0,
            commonTags: state.userPatterns?.commonTags ?? [],
            modeDistribution: state.userPatterns?.modeDistribution ?? {
              manage: 0,
              develop: 0,
              organize: 0,
              experience: 0,
            },
            lastUpdatedAt: Date.now(),
            ...updates,
          },
        }));
      },

      getBehaviorsByMode: (mode) => {
        return Object.values(get().behaviors).filter((b) => b.mode === mode);
      },

      getLowUsefulnessNotes: (threshold = 30) => {
        return Object.values(get().behaviors).filter((b) => b.usefulnessScore < threshold);
      },

      getStaleNotes: (daysThreshold) => {
        const thresholdMs = daysThreshold * 24 * 60 * 60 * 1000;
        const cutoff = Date.now() - thresholdMs;
        return Object.values(get().behaviors).filter((b) => b.lastAccessedAt < cutoff);
      },
    }),
    {
      name: 'toonnotes-behavior',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        behaviors: state.behaviors,
        userPatterns: state.userPatterns,
      }),
    }
  )
);

export {
  calculateUsefulnessScore,
  createDefaultBehavior,
  createDefaultDevelopData,
  createDefaultExperienceData,
  createDefaultManageData,
  createDefaultOrganizeData,
};
