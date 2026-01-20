'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, ArrowCounterClockwise, Tag, SpinnerGap, Check } from '@phosphor-icons/react';
import { useLabelSuggestionStore } from '@/stores';
import { LabelPill } from './LabelPill';
import { cn } from '@/lib/utils';

interface LabelSuggestionToastProps {
  onApplyLabels: (labels: string[]) => void;
  onUndo: () => void;
  onDecline?: () => void;
}

export function LabelSuggestionToast({ onApplyLabels, onUndo, onDecline }: LabelSuggestionToastProps) {
  const { activeToast, hideAutoApplyToast, undoAutoApply, isAnalyzing } = useLabelSuggestionStore();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Determine toast type (default to 'auto-apply' for backwards compatibility)
  const toastType = activeToast?.type ?? 'auto-apply';
  const isSuggestion = toastType === 'suggestion';

  // Handle visibility and auto-apply timer
  useEffect(() => {
    if (!activeToast) {
      setIsVisible(false);
      return;
    }

    // Show toast
    setIsVisible(true);

    // Suggestion toasts don't auto-dismiss
    if (activeToast.type === 'suggestion') {
      return;
    }

    const duration = activeToast.expiresAt - Date.now();
    setTimeLeft(Math.ceil(duration / 1000));

    // Update countdown
    const interval = setInterval(() => {
      const remaining = activeToast.expiresAt - Date.now();
      if (remaining <= 0) {
        clearInterval(interval);
        // Auto-apply if not undone
        if (!activeToast.undone && !activeToast.error) {
          onApplyLabels(activeToast.labels);
        }
        hideAutoApplyToast();
      } else {
        setTimeLeft(Math.ceil(remaining / 1000));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [activeToast, hideAutoApplyToast, onApplyLabels]);

  const handleUndo = useCallback(() => {
    undoAutoApply();
    onUndo();
    hideAutoApplyToast();
  }, [undoAutoApply, onUndo, hideAutoApplyToast]);

  const handleDismiss = useCallback(() => {
    hideAutoApplyToast();
  }, [hideAutoApplyToast]);

  // Handle accepting suggestions (for suggestion type)
  const handleAccept = useCallback(() => {
    if (activeToast) {
      onApplyLabels(activeToast.labels);
    }
    hideAutoApplyToast();
  }, [activeToast, onApplyLabels, hideAutoApplyToast]);

  // Handle declining suggestions (for suggestion type)
  const handleDecline = useCallback(() => {
    hideAutoApplyToast();
    onDecline?.();
  }, [hideAutoApplyToast, onDecline]);

  // Show analyzing spinner
  if (isAnalyzing) {
    return (
      <div
        className={cn(
          'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
          'flex items-center gap-3 px-4 py-3 rounded-xl',
          'bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700',
          'animate-in fade-in slide-in-from-bottom-4 duration-300'
        )}
      >
        <SpinnerGap size={20} className="text-purple-500 animate-spin" />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Analyzing note for labels...
        </span>
      </div>
    );
  }

  // Don't render if no active toast
  if (!isVisible || !activeToast) {
    return null;
  }

  // Error toast
  if (activeToast.error) {
    return (
      <div
        className={cn(
          'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
          'flex items-center gap-3 px-4 py-3 rounded-xl max-w-md',
          'bg-red-50 dark:bg-red-900/20 shadow-lg border border-red-200 dark:border-red-800',
          'animate-in fade-in slide-in-from-bottom-4 duration-300'
        )}
      >
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            Label analysis failed
          </p>
          <p className="text-xs text-red-600 dark:text-red-300">
            {activeToast.error.message}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-800/50 transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} className="text-red-600 dark:text-red-400" />
        </button>
      </div>
    );
  }

  // Suggestion toast (user must accept or decline)
  if (isSuggestion) {
    return (
      <div
        className={cn(
          'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
          'flex items-center gap-3 px-4 py-3 rounded-xl max-w-md',
          'bg-white dark:bg-gray-800 shadow-lg border border-purple-200 dark:border-purple-700',
          'animate-in fade-in slide-in-from-bottom-4 duration-300'
        )}
      >
        {/* Icon and message */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Tag size={20} className="text-purple-500" weight="fill" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Add these labels?
          </span>
        </div>

        {/* Labels preview */}
        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
          {activeToast.labels.slice(0, 3).map((label) => (
            <LabelPill key={label} label={label} size="sm" />
          ))}
          {activeToast.labels.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400 self-center">
              +{activeToast.labels.length - 3} more
            </span>
          )}
        </div>

        {/* Accept button */}
        <button
          onClick={handleAccept}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
            'bg-purple-500 hover:bg-purple-600',
            'text-sm font-medium text-white',
            'transition-colors'
          )}
        >
          <Check size={14} weight="bold" />
          Add
        </button>

        {/* Decline button */}
        <button
          onClick={handleDecline}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
            'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600',
            'text-sm font-medium text-gray-700 dark:text-gray-300',
            'transition-colors'
          )}
        >
          <X size={14} />
          No
        </button>
      </div>
    );
  }

  // Auto-apply toast with countdown
  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-3 px-4 py-3 rounded-xl max-w-md',
        'bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700',
        'animate-in fade-in slide-in-from-bottom-4 duration-300'
      )}
    >
      {/* Icon and message */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Tag size={20} className="text-purple-500" weight="fill" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Adding labels in {timeLeft}s
        </span>
      </div>

      {/* Labels preview */}
      <div className="flex flex-wrap gap-1.5 max-w-[200px]">
        {activeToast.labels.slice(0, 3).map((label) => (
          <LabelPill key={label} label={label} size="sm" />
        ))}
        {activeToast.labels.length > 3 && (
          <span className="text-xs text-gray-500 dark:text-gray-400 self-center">
            +{activeToast.labels.length - 3} more
          </span>
        )}
      </div>

      {/* Undo button */}
      <button
        onClick={handleUndo}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
          'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600',
          'text-sm font-medium text-gray-700 dark:text-gray-300',
          'transition-colors'
        )}
      >
        <ArrowCounterClockwise size={14} />
        Undo
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-b-xl overflow-hidden">
        <div
          className="h-full bg-purple-500 transition-all duration-100"
          style={{
            width: `${(timeLeft / 3) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
