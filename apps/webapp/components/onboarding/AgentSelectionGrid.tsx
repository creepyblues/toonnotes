'use client';

/**
 * Agent Selection Grid - MODE Framework v2.0 (Web)
 *
 * Shows a grid of agents to select from, with completed agents
 * marked as "done".
 */

import { Check } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { AgentId } from '@toonnotes/types';
import { AGENT_DISCOVERY_CARDS, ONBOARDING_TEXT } from '@/lib/agentOnboardingContent';

interface AgentSelectionGridProps {
  experiencedAgents: AgentId[];
  onSelectAgent: (agentId: AgentId) => void;
}

export function AgentSelectionGrid({
  experiencedAgents,
  onSelectAgent,
}: AgentSelectionGridProps) {
  return (
    <div className="flex flex-col items-center px-6 py-8">
      {/* Header */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
        {ONBOARDING_TEXT.agentSelection.title}
      </h2>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {AGENT_DISCOVERY_CARDS.map((card) => {
          const isExperienced = experiencedAgents.includes(card.agentId);

          return (
            <button
              key={card.agentId}
              onClick={() => !isExperienced && onSelectAgent(card.agentId)}
              disabled={isExperienced}
              className={cn(
                'relative flex flex-col items-center p-5 rounded-xl',
                'border-2 transition-all duration-200',
                isExperienced
                  ? 'bg-gray-50/50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60'
                  : 'bg-gray-50 dark:bg-gray-800/50 border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800',
                !isExperienced && 'focus:outline-none focus:ring-2 focus:ring-purple-500/50'
              )}
            >
              {/* Completed Badge */}
              {isExperienced && (
                <div className="absolute top-2 right-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: card.color }}
                  >
                    <Check size={12} weight="bold" className="text-white" />
                  </div>
                </div>
              )}

              <span
                className={cn('text-4xl mb-3', isExperienced && 'grayscale')}
                style={
                  isExperienced
                    ? undefined
                    : { filter: `drop-shadow(0 2px 4px ${card.color}40)` }
                }
              >
                {card.emoji}
              </span>
              <span
                className={cn(
                  'font-medium text-sm',
                  isExperienced
                    ? 'text-gray-400 dark:text-gray-500'
                    : 'text-gray-900 dark:text-gray-100'
                )}
              >
                {card.label}
              </span>
              {isExperienced ? (
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {ONBOARDING_TEXT.agentSelection.doneLabel}
                </span>
              ) : (
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {card.description}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
