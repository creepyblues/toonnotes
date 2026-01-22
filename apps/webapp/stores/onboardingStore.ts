'use client';

/**
 * Onboarding Store - MODE Framework v2.0 (Web)
 *
 * Manages agent onboarding state for the webapp.
 * Tracks which agents the user has experienced during onboarding.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AgentId, AgentOnboardingState } from '@toonnotes/types';

// ============================================
// Default Values
// ============================================

const defaultAgentOnboarding: AgentOnboardingState = {
  hasStartedAgentOnboarding: false,
  hasCompletedAgentOnboarding: false,
  experiencedAgents: [],
  firstAgentChosen: null,
  onboardingStartedAt: null,
  onboardingCompletedAt: null,
  skippedAfterAgent: false,
};

// ============================================
// Store Interface
// ============================================

interface OnboardingState {
  // Welcome flow (legacy)
  hasCompletedWelcome: boolean;

  // Agent onboarding
  agentOnboarding: AgentOnboardingState;

  // Welcome actions
  completeWelcome: () => void;
  resetWelcome: () => void;

  // Agent onboarding actions
  startAgentOnboarding: () => void;
  completeAgentOnboarding: () => void;
  recordAgentExperienced: (agentId: AgentId) => void;
  setFirstAgentChosen: (agentId: AgentId) => void;
  skipAgentOnboarding: () => void;
  resetAgentOnboarding: () => void;

  // Selectors
  isAgentExperienced: (agentId: AgentId) => boolean;
  getExperiencedAgentsCount: () => number;
  shouldShowOnboarding: () => boolean;
}

// ============================================
// Store Implementation
// ============================================

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      hasCompletedWelcome: false,
      agentOnboarding: defaultAgentOnboarding,

      // Welcome actions
      completeWelcome: () => {
        set({ hasCompletedWelcome: true });
      },

      resetWelcome: () => {
        set({ hasCompletedWelcome: false });
      },

      // Agent onboarding actions
      startAgentOnboarding: () => {
        set((state) => ({
          agentOnboarding: {
            ...state.agentOnboarding,
            hasStartedAgentOnboarding: true,
            onboardingStartedAt: Date.now(),
          },
        }));
      },

      completeAgentOnboarding: () => {
        set((state) => ({
          hasCompletedWelcome: true,
          agentOnboarding: {
            ...state.agentOnboarding,
            hasCompletedAgentOnboarding: true,
            onboardingCompletedAt: Date.now(),
          },
        }));
      },

      recordAgentExperienced: (agentId) => {
        set((state) => {
          // Don't add duplicates
          if (state.agentOnboarding.experiencedAgents.includes(agentId)) {
            return state;
          }

          return {
            agentOnboarding: {
              ...state.agentOnboarding,
              experiencedAgents: [...state.agentOnboarding.experiencedAgents, agentId],
            },
          };
        });
      },

      setFirstAgentChosen: (agentId) => {
        set((state) => ({
          agentOnboarding: {
            ...state.agentOnboarding,
            firstAgentChosen: agentId,
          },
        }));
      },

      skipAgentOnboarding: () => {
        set((state) => ({
          hasCompletedWelcome: true,
          agentOnboarding: {
            ...state.agentOnboarding,
            hasCompletedAgentOnboarding: true,
            skippedAfterAgent: true,
            onboardingCompletedAt: Date.now(),
          },
        }));
      },

      resetAgentOnboarding: () => {
        set({
          agentOnboarding: defaultAgentOnboarding,
        });
      },

      // Selectors
      isAgentExperienced: (agentId) => {
        return get().agentOnboarding.experiencedAgents.includes(agentId);
      },

      getExperiencedAgentsCount: () => {
        return get().agentOnboarding.experiencedAgents.length;
      },

      shouldShowOnboarding: () => {
        const state = get();
        return !state.hasCompletedWelcome && !state.agentOnboarding.hasCompletedAgentOnboarding;
      },
    }),
    {
      name: 'toonnotes-onboarding',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        hasCompletedWelcome: state.hasCompletedWelcome,
        agentOnboarding: state.agentOnboarding,
      }),
    }
  )
);
