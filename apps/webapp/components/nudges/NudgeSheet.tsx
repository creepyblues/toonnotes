'use client';

/**
 * Nudge Sheet - MODE Framework v2.0 (Web)
 *
 * Displays nudge notifications as a bottom sheet modal.
 * Used for more complex nudges that need more space.
 */

import * as Dialog from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Nudge, AgentId } from '@toonnotes/types';
import { AGENT_CONFIGS } from '@/services/agents';

interface NudgeSheetProps {
  nudge: Nudge;
  open: boolean;
  onAction: (optionId: string) => void;
  onDismiss: () => void;
}

export function NudgeSheet({
  nudge,
  open,
  onAction,
  onDismiss,
}: NudgeSheetProps) {
  const agentConfig = AGENT_CONFIGS[nudge.agentId as AgentId];

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onDismiss()}>
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
            'fixed bottom-0 left-0 right-0 z-50',
            'mx-auto max-w-lg',
            'bg-white dark:bg-gray-900',
            'rounded-t-2xl shadow-2xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
            'duration-200'
          )}
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
          </div>

          {/* Close button */}
          <Dialog.Close asChild>
            <button
              className={cn(
                'absolute top-4 right-4',
                'p-1.5 rounded-full',
                'text-gray-400 dark:text-gray-500',
                'hover:bg-gray-100 dark:hover:bg-gray-800',
                'hover:text-gray-600 dark:hover:text-gray-300',
                'transition-colors duration-200'
              )}
              aria-label="Dismiss"
            >
              <X size={18} weight="bold" />
            </button>
          </Dialog.Close>

          <div className="p-6 pt-2">
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${agentConfig?.color || '#6B7280'}20` }}
              >
                <span className="text-2xl">{agentConfig?.emoji || '🤖'}</span>
              </div>
              <div className="flex-1 pt-1">
                <Dialog.Title className="font-semibold text-gray-900 dark:text-gray-100">
                  {nudge.title}
                </Dialog.Title>
                <Dialog.Description className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                  {nudge.body}
                </Dialog.Description>
              </div>
            </div>

            {/* Actions */}
            {nudge.options && nudge.options.length > 0 && (
              <div className="space-y-2 mb-2">
                {nudge.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => onAction(option.id)}
                    className={cn(
                      'w-full px-4 py-3 rounded-lg font-medium text-sm',
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

          {/* Safe area padding for mobile */}
          <div className="h-6" />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
