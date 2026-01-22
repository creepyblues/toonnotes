'use client';

/**
 * Onboarding Complete - MODE Framework v2.0 (Web)
 *
 * Final celebration screen shown when the user has completed
 * the agent onboarding flow (experienced all or some agents).
 */

import { Sparkle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { AgentId } from '@toonnotes/types';
import { ONBOARDING_TEXT, hasExperiencedAllAgents } from '@/lib/agentOnboardingContent';

interface OnboardingCompleteProps {
  experiencedAgents: AgentId[];
  onStart: () => void;
}

export function OnboardingComplete({
  experiencedAgents,
  onStart,
}: OnboardingCompleteProps) {
  const allAgentsExperienced = hasExperiencedAllAgents(experiencedAgents);

  return (
    <div className="flex flex-col items-center px-6 py-8">
      {/* Success Icon */}
      <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6">
        <Sparkle
          size={40}
          weight="fill"
          className="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
        {ONBOARDING_TEXT.completion.title}
      </h2>

      {/* Subtitle */}
      <p className="text-gray-500 dark:text-gray-400 mb-8 text-center max-w-xs">
        {allAgentsExperienced
          ? ONBOARDING_TEXT.completion.subtitle4Agents
          : ONBOARDING_TEXT.completion.subtitle}
      </p>

      {/* Start Button */}
      <button
        onClick={onStart}
        className={cn(
          'w-full max-w-sm py-3 px-4 rounded-lg font-medium',
          'bg-purple-600 hover:bg-purple-700 text-white',
          'transition-all duration-200'
        )}
      >
        {ONBOARDING_TEXT.completion.startButton}
      </button>
    </div>
  );
}
