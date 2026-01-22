'use client';

/**
 * Agent Continue Prompt - MODE Framework v2.0 (Web)
 *
 * Shows after completing an agent demo, asking if the user
 * wants to try another agent or start using the app.
 */

import { Check } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { AgentId } from '@toonnotes/types';
import { ONBOARDING_TEXT, getAgentName, getAgentColor } from '@/lib/agentOnboardingContent';

interface AgentContinuePromptProps {
  agentId: AgentId;
  hasMoreAgents: boolean;
  onTryAnother: () => void;
  onFinish: () => void;
}

export function AgentContinuePrompt({
  agentId,
  hasMoreAgents,
  onTryAnother,
  onFinish,
}: AgentContinuePromptProps) {
  const agentName = getAgentName(agentId);
  const agentColor = getAgentColor(agentId);

  return (
    <div className="flex flex-col items-center px-6 py-8">
      {/* Success Icon */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: `${agentColor}20` }}
      >
        <Check
          size={32}
          weight="bold"
          className="text-green-600 dark:text-green-400"
        />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
        {ONBOARDING_TEXT.continuePrompt.title}
      </h2>

      {/* Subtitle */}
      <p className="text-gray-500 dark:text-gray-400 mb-8 text-center">
        {ONBOARDING_TEXT.continuePrompt.subtitle(agentName)}
      </p>

      {/* Action Buttons */}
      <div className="w-full max-w-sm space-y-3">
        {hasMoreAgents && (
          <button
            onClick={onTryAnother}
            className={cn(
              'w-full py-3 px-4 rounded-lg font-medium',
              'bg-purple-600 hover:bg-purple-700 text-white',
              'transition-all duration-200'
            )}
          >
            {ONBOARDING_TEXT.continuePrompt.tryAnotherButton}
          </button>
        )}
        <button
          onClick={onFinish}
          className={cn(
            'w-full py-3 px-4 rounded-lg font-medium',
            'transition-all duration-200',
            hasMoreAgents
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          )}
        >
          {ONBOARDING_TEXT.continuePrompt.startButton}
        </button>
      </div>
    </div>
  );
}
