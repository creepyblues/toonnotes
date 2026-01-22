'use client';

/**
 * Nudge Toast - MODE Framework v2.0 (Web)
 *
 * Displays nudge notifications as toast messages.
 * Appears at the bottom of the screen with agent styling.
 */

import { useEffect, useState } from 'react';
import { X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Nudge, AgentId } from '@toonnotes/types';
import { AGENT_CONFIGS } from '@/services/agents';

interface NudgeToastProps {
  nudge: Nudge;
  onAction: (optionId: string) => void;
  onDismiss: () => void;
  autoHideDuration?: number;
}

export function NudgeToast({
  nudge,
  onAction,
  onDismiss,
  autoHideDuration = 10000,
}: NudgeToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const agentConfig = AGENT_CONFIGS[nudge.agentId as AgentId];

  // Animate in on mount
  useEffect(() => {
    const enterTimer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(enterTimer);
  }, []);

  // Auto-hide after duration
  useEffect(() => {
    if (autoHideDuration > 0) {
      const hideTimer = setTimeout(() => {
        handleClose();
      }, autoHideDuration);
      return () => clearTimeout(hideTimer);
    }
  }, [autoHideDuration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss();
    }, 200);
  };

  const handleAction = (optionId: string) => {
    setIsExiting(true);
    setTimeout(() => {
      onAction(optionId);
    }, 200);
  };

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50',
        'w-full max-w-sm',
        'bg-white dark:bg-gray-900',
        'rounded-xl shadow-lg',
        'border-l-4',
        'transform transition-all duration-200',
        isVisible && !isExiting
          ? 'translate-y-0 opacity-100'
          : 'translate-y-4 opacity-0'
      )}
      style={{ borderLeftColor: agentConfig?.color || '#6B7280' }}
      role="alert"
      aria-live="polite"
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className={cn(
          'absolute top-2 right-2',
          'p-1 rounded-full',
          'text-gray-400 dark:text-gray-500',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          'hover:text-gray-600 dark:hover:text-gray-300',
          'transition-colors duration-200'
        )}
        aria-label="Dismiss"
      >
        <X size={14} weight="bold" />
      </button>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-2 pr-6">
          <span className="text-xl flex-shrink-0">
            {agentConfig?.emoji || '🤖'}
          </span>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
              {nudge.title}
            </h4>
            <p className="text-gray-600 dark:text-gray-300 text-xs mt-0.5">
              {nudge.body}
            </p>
          </div>
        </div>

        {/* Actions */}
        {nudge.options && nudge.options.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {nudge.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAction(option.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium',
                  'transition-colors duration-200',
                  option.isPrimary
                    ? 'text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
                style={
                  option.isPrimary
                    ? { backgroundColor: agentConfig?.color || '#6B7280' }
                    : undefined
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
