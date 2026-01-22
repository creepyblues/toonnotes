'use client';

/**
 * Demo Nudge Preview - MODE Framework v2.0 (Web)
 *
 * Shows a preview of what a nudge looks like from the selected agent,
 * with a DEMO badge and explanation of how the nudge system works.
 */

import { cn } from '@/lib/utils';
import { AgentId } from '@toonnotes/types';
import {
  DEMO_NUDGE_CONTENT,
  ONBOARDING_TEXT,
  getAgentEmoji,
  getAgentColor,
} from '@/lib/agentOnboardingContent';

interface DemoNudgePreviewProps {
  agentId: AgentId;
  onComplete: () => void;
}

export function DemoNudgePreview({ agentId, onComplete }: DemoNudgePreviewProps) {
  const nudgeContent = DEMO_NUDGE_CONTENT[agentId];
  const agentEmoji = getAgentEmoji(agentId);
  const agentColor = getAgentColor(agentId);

  return (
    <div className="flex flex-col px-6 py-8">
      {/* Demo Nudge Card */}
      <div
        className={cn(
          'relative rounded-xl overflow-hidden mb-6',
          'border-2',
          'bg-white dark:bg-gray-900'
        )}
        style={{ borderColor: `${agentColor}40` }}
      >
        {/* DEMO Badge */}
        <div
          className="absolute top-0 right-0 px-2 py-1 text-[10px] font-bold text-white rounded-bl-lg"
          style={{ backgroundColor: agentColor }}
        >
          {ONBOARDING_TEXT.demoPreview.demoBadge}
        </div>

        {/* Nudge Content */}
        <div className="p-4 pt-6">
          {/* Header with emoji */}
          <div className="flex items-start gap-3 mb-3">
            <span
              className="text-2xl"
              style={{ filter: `drop-shadow(0 1px 2px ${agentColor}40)` }}
            >
              {agentEmoji}
            </span>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {nudgeContent.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                {nudgeContent.body}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            {nudgeContent.options.map((option) => (
              <button
                key={option.id}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium',
                  'transition-colors duration-200',
                  option.isPrimary
                    ? 'text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
                style={
                  option.isPrimary
                    ? { backgroundColor: agentColor }
                    : undefined
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {nudgeContent.explanation}
        </p>
      </div>

      {/* Got It Button */}
      <button
        onClick={onComplete}
        className={cn(
          'w-full py-3 px-4 rounded-lg font-medium',
          'bg-purple-600 hover:bg-purple-700 text-white',
          'transition-all duration-200'
        )}
      >
        {ONBOARDING_TEXT.demoPreview.gotItButton}
      </button>
    </div>
  );
}
