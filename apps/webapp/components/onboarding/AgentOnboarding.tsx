'use client';

/**
 * Agent Onboarding - MODE Framework v2.0 (Web)
 *
 * Main orchestrator component for the agent onboarding flow.
 * Presents a modal-based flow that introduces users to the four AI agents.
 */

import { useState, useCallback, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { AgentId, NoteColor } from '@toonnotes/types';
import { useOnboardingStore } from '@/stores';
import { useNoteStore } from '@/stores';
import { getRemainingAgents } from '@/lib/agentOnboardingContent';

import { AgentDiscoveryStep } from './AgentDiscoveryStep';
import { GuidedNoteCreation } from './GuidedNoteCreation';
import { DemoNudgePreview } from './DemoNudgePreview';
import { AgentContinuePrompt } from './AgentContinuePrompt';
import { AgentSelectionGrid } from './AgentSelectionGrid';
import { OnboardingComplete } from './OnboardingComplete';

// Onboarding flow steps
type OnboardingStep =
  | 'discovery'
  | 'guided-creation'
  | 'demo-preview'
  | 'continue-prompt'
  | 'agent-selection'
  | 'complete';

interface AgentOnboardingProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AgentOnboarding({ open, onOpenChange }: AgentOnboardingProps) {
  // Store hooks
  const {
    agentOnboarding,
    shouldShowOnboarding,
    startAgentOnboarding,
    recordAgentExperienced,
    setFirstAgentChosen,
    completeAgentOnboarding,
    skipAgentOnboarding,
  } = useOnboardingStore();

  const addNote = useNoteStore((state) => state.addNote);

  // Local state
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('discovery');
  const [selectedAgent, setSelectedAgent] = useState<AgentId | null>(null);
  const [createdNoteContent, setCreatedNoteContent] = useState<string>('');

  // Determine if modal should be open
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : shouldShowOnboarding();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      // If already started, go to discovery or where they left off
      if (!agentOnboarding.hasStartedAgentOnboarding) {
        startAgentOnboarding();
      }
      setCurrentStep('discovery');
      setSelectedAgent(null);
      setCreatedNoteContent('');
    }
  }, [isOpen, agentOnboarding.hasStartedAgentOnboarding, startAgentOnboarding]);

  // Handle modal close
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (onOpenChange) {
        onOpenChange(newOpen);
      }
    },
    [onOpenChange]
  );

  // Get remaining agents that haven't been experienced
  const remainingAgents = getRemainingAgents(agentOnboarding.experiencedAgents);


  // Step handlers
  const handleSelectAgent = useCallback(
    (agentId: AgentId) => {
      setSelectedAgent(agentId);

      // Record first agent chosen
      if (agentOnboarding.experiencedAgents.length === 0) {
        setFirstAgentChosen(agentId);
      }

      setCurrentStep('guided-creation');
    },
    [agentOnboarding.experiencedAgents.length, setFirstAgentChosen]
  );

  const handleSkipOnboarding = useCallback(() => {
    skipAgentOnboarding();
    handleOpenChange(false);
  }, [skipAgentOnboarding, handleOpenChange]);

  const handleCreateNote = useCallback(
    (content: string) => {
      if (!selectedAgent) return;

      // Create a real note with the content
      addNote({
        title: '',
        content,
        labels: [],
        color: NoteColor.White,
        isPinned: false,
        isArchived: false,
        isDeleted: false,
      });

      setCreatedNoteContent(content);
      setCurrentStep('demo-preview');
    },
    [selectedAgent, addNote]
  );

  const handleBackToDiscovery = useCallback(() => {
    setSelectedAgent(null);
    setCurrentStep('discovery');
  }, []);

  const handleDemoComplete = useCallback(() => {
    if (selectedAgent) {
      recordAgentExperienced(selectedAgent);
    }
    setCurrentStep('continue-prompt');
  }, [selectedAgent, recordAgentExperienced]);

  const handleTryAnotherAgent = useCallback(() => {
    setCurrentStep('agent-selection');
  }, []);

  const handleFinishOnboarding = useCallback(() => {
    setCurrentStep('complete');
  }, []);

  const handleStartUsingApp = useCallback(() => {
    completeAgentOnboarding();
    handleOpenChange(false);
  }, [completeAgentOnboarding, handleOpenChange]);

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 'discovery':
        return (
          <AgentDiscoveryStep
            onSelectAgent={handleSelectAgent}
            onSkip={handleSkipOnboarding}
          />
        );

      case 'guided-creation':
        if (!selectedAgent) return null;
        return (
          <GuidedNoteCreation
            agentId={selectedAgent}
            onCreateNote={handleCreateNote}
            onBack={handleBackToDiscovery}
          />
        );

      case 'demo-preview':
        if (!selectedAgent) return null;
        return (
          <DemoNudgePreview
            agentId={selectedAgent}
            onComplete={handleDemoComplete}
          />
        );

      case 'continue-prompt':
        if (!selectedAgent) return null;
        return (
          <AgentContinuePrompt
            agentId={selectedAgent}
            hasMoreAgents={remainingAgents.length > 0}
            onTryAnother={handleTryAnotherAgent}
            onFinish={handleFinishOnboarding}
          />
        );

      case 'agent-selection':
        return (
          <AgentSelectionGrid
            experiencedAgents={agentOnboarding.experiencedAgents}
            onSelectAgent={handleSelectAgent}
          />
        );

      case 'complete':
        return (
          <OnboardingComplete
            experiencedAgents={agentOnboarding.experiencedAgents}
            onStart={handleStartUsingApp}
          />
        );

      default:
        return null;
    }
  };

  // Don't render if controlled mode and not open
  if (isControlled && !open) {
    return null;
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-50',
            'bg-black/50 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          )}
        />
        <Dialog.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-50',
            'w-full max-w-md max-h-[85vh]',
            'translate-x-[-50%] translate-y-[-50%]',
            'bg-white dark:bg-gray-900',
            'rounded-2xl shadow-2xl',
            'overflow-hidden overflow-y-auto',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            'duration-200'
          )}
          onPointerDownOutside={(e) => {
            // Prevent closing by clicking outside during onboarding
            e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            // Prevent closing by escape key during onboarding
            e.preventDefault();
          }}
        >
          {/* Close button - only show if not in controlled mode */}
          {!isControlled && currentStep !== 'discovery' && (
            <Dialog.Close asChild>
              <button
                onClick={handleSkipOnboarding}
                className={cn(
                  'absolute top-4 right-4 z-10',
                  'p-1.5 rounded-full',
                  'text-gray-400 dark:text-gray-500',
                  'hover:bg-gray-100 dark:hover:bg-gray-800',
                  'hover:text-gray-600 dark:hover:text-gray-300',
                  'transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-purple-500/50'
                )}
                aria-label="Close onboarding"
              >
                <X size={18} weight="bold" />
              </button>
            </Dialog.Close>
          )}

          {/* Step Content */}
          {renderStep()}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
