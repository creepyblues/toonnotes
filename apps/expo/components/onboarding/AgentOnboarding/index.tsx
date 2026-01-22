/**
 * AgentOnboarding - Main Orchestrator
 *
 * Interactive onboarding flow that introduces users to the four AI agents
 * through guided note creation and live demos of the nudge system.
 *
 * Flow:
 * 1. Discovery Question - "What would you like to try first?"
 * 2. Guided Note Creation - Instructions + create button
 * 3. Demo Nudge Preview - Shows demo nudge with explanation
 * 4. Continue Prompt - "Try another?" or "Start using ToonNotes"
 * 5. (Loop) Agent Selection - Pick remaining agents
 * 6. Completion - Celebration screen
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { AgentId, NoteColor } from '@/types';
import { useUserStore } from '@/stores';
import { useNoteStore } from '@/stores';
import { useTheme } from '@/src/theme';
import { Analytics } from '@/services/firebaseAnalytics';

import { AgentDiscoveryStep } from './AgentDiscoveryStep';
import { GuidedNoteCreation } from './GuidedNoteCreation';
import { DemoNudgePreview } from './DemoNudgePreview';
import { AgentContinuePrompt } from './AgentContinuePrompt';
import { AgentSelectionGrid } from './AgentSelectionGrid';
import { OnboardingComplete } from './OnboardingComplete';

// ============================================
// Types
// ============================================

type OnboardingStep =
  | 'discovery'
  | 'guided_creation'
  | 'demo_preview'
  | 'continue_prompt'
  | 'agent_selection'
  | 'complete';

interface AgentOnboardingProps {
  onComplete: () => void;
}

// ============================================
// Main Component
// ============================================

export function AgentOnboarding({ onComplete }: AgentOnboardingProps) {
  const { colors } = useTheme();

  // State
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('discovery');
  const [selectedAgent, setSelectedAgent] = useState<AgentId | null>(null);
  const [createdNoteId, setCreatedNoteId] = useState<string | null>(null);

  // Store actions
  const {
    agentOnboarding,
    startAgentOnboarding,
    completeAgentOnboarding,
    recordAgentExperienced,
    setFirstAgentChosen,
    skipAgentOnboarding,
  } = useUserStore();

  const { addNote } = useNoteStore();

  // Check if all agents have been experienced
  const allAgentsExperienced = agentOnboarding.experiencedAgents.length >= 4;

  // Handle agent selection from discovery or selection grid
  const handleAgentSelected = useCallback(
    (agentId: AgentId) => {
      // Start onboarding if not started
      if (!agentOnboarding.hasStartedAgentOnboarding) {
        startAgentOnboarding();
      }

      // Set first agent chosen if not set
      if (!agentOnboarding.firstAgentChosen) {
        setFirstAgentChosen(agentId);
      } else {
        // Track subsequent agent choices
        Analytics.agentOnboardingAgentChosen(agentId, false);
      }

      setSelectedAgent(agentId);
      setCurrentStep('guided_creation');
    },
    [agentOnboarding, startAgentOnboarding, setFirstAgentChosen]
  );

  // Handle note creation
  const handleNoteCreated = useCallback(
    (noteTitle: string) => {
      // Create actual note
      const newNote = addNote({
        title: noteTitle,
        content: '',
        labels: [],
        color: NoteColor.White,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      setCreatedNoteId(newNote.id);

      // Track demo viewed
      if (selectedAgent) {
        Analytics.agentOnboardingDemoViewed(selectedAgent);
      }

      setCurrentStep('demo_preview');
    },
    [selectedAgent, addNote]
  );

  // Handle demo nudge acknowledged
  const handleDemoAcknowledged = useCallback(() => {
    if (selectedAgent) {
      recordAgentExperienced(selectedAgent);
    }
    setCurrentStep('continue_prompt');
  }, [selectedAgent, recordAgentExperienced]);

  // Handle "Try Another Agent"
  const handleTryAnother = useCallback(() => {
    // Check if all agents experienced
    if (agentOnboarding.experiencedAgents.length >= 3) {
      // Only one agent left or all done
      if (agentOnboarding.experiencedAgents.length >= 4) {
        setCurrentStep('complete');
      } else {
        setCurrentStep('agent_selection');
      }
    } else {
      setCurrentStep('agent_selection');
    }
  }, [agentOnboarding.experiencedAgents.length]);

  // Handle skip
  const handleSkip = useCallback(() => {
    skipAgentOnboarding();
    onComplete();
  }, [skipAgentOnboarding, onComplete]);

  // Handle complete
  const handleComplete = useCallback(() => {
    completeAgentOnboarding();
    onComplete();
  }, [completeAgentOnboarding, onComplete]);

  // Handle back from guided creation
  const handleBack = useCallback(() => {
    setSelectedAgent(null);
    setCreatedNoteId(null);
    if (agentOnboarding.experiencedAgents.length > 0) {
      setCurrentStep('agent_selection');
    } else {
      setCurrentStep('discovery');
    }
  }, [agentOnboarding.experiencedAgents.length]);

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 'discovery':
        return (
          <AgentDiscoveryStep
            onAgentSelected={handleAgentSelected}
            onSkip={handleSkip}
          />
        );

      case 'guided_creation':
        return selectedAgent ? (
          <GuidedNoteCreation
            agentId={selectedAgent}
            onNoteCreated={handleNoteCreated}
            onBack={handleBack}
          />
        ) : null;

      case 'demo_preview':
        return selectedAgent ? (
          <DemoNudgePreview
            agentId={selectedAgent}
            onAcknowledge={handleDemoAcknowledged}
          />
        ) : null;

      case 'continue_prompt':
        return selectedAgent ? (
          <AgentContinuePrompt
            agentId={selectedAgent}
            onTryAnother={handleTryAnother}
            onComplete={handleComplete}
            hasMoreAgents={agentOnboarding.experiencedAgents.length < 4}
          />
        ) : null;

      case 'agent_selection':
        return (
          <AgentSelectionGrid
            experiencedAgents={agentOnboarding.experiencedAgents}
            onAgentSelected={handleAgentSelected}
            onSkip={handleComplete}
          />
        );

      case 'complete':
        return (
          <OnboardingComplete
            experiencedAgents={agentOnboarding.experiencedAgents}
            onComplete={handleComplete}
          />
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <StatusBar style="dark" />
      <View style={styles.content}>{renderStep()}</View>
    </SafeAreaView>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default AgentOnboarding;
