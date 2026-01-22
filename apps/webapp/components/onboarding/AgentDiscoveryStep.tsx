'use client';

/**
 * Agent Discovery Step - MODE Framework v2.0 (Web)
 *
 * Shows the initial "What would you like to try first?" question
 * with agent discovery cards for selection.
 */

import { cn } from '@/lib/utils';
import { AgentId } from '@toonnotes/types';
import { AGENT_DISCOVERY_CARDS, ONBOARDING_TEXT } from '@/lib/agentOnboardingContent';

interface AgentDiscoveryStepProps {
  onSelectAgent: (agentId: AgentId) => void;
  onSkip: () => void;
}

export function AgentDiscoveryStep({ onSelectAgent, onSkip }: AgentDiscoveryStepProps) {
  return (
    <div className="flex flex-col items-center px-6 py-8">
      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
        {ONBOARDING_TEXT.discoveryStep.title}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 text-center">
        {ONBOARDING_TEXT.discoveryStep.subtitle}
      </p>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {AGENT_DISCOVERY_CARDS.map((card) => (
          <button
            key={card.agentId}
            onClick={() => onSelectAgent(card.agentId)}
            className={cn(
              'flex flex-col items-center p-5 rounded-xl',
              'bg-gray-50 dark:bg-gray-800/50',
              'border-2 border-transparent',
              'hover:border-gray-200 dark:hover:border-gray-700',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-purple-500/50'
            )}
          >
            <span
              className="text-4xl mb-3"
              style={{ filter: `drop-shadow(0 2px 4px ${card.color}40)` }}
            >
              {card.emoji}
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
              {card.label}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {card.description}
            </span>
          </button>
        ))}
      </div>

      {/* Skip Button */}
      <button
        onClick={onSkip}
        className={cn(
          'mt-8 px-4 py-2 text-sm',
          'text-gray-400 dark:text-gray-500',
          'hover:text-gray-600 dark:hover:text-gray-300',
          'transition-colors duration-200'
        )}
      >
        {ONBOARDING_TEXT.discoveryStep.skipButton}
      </button>
    </div>
  );
}
