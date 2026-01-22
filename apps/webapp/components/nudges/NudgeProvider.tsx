'use client';

/**
 * Nudge Provider - MODE Framework v2.0 (Web)
 *
 * Manages the display of nudges from the nudge queue.
 * Shows nudges as toasts or sheets based on delivery channel.
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Nudge } from '@toonnotes/types';
import { useNudgeStore } from '@/stores';
import { NudgeToast } from './NudgeToast';
import { NudgeSheet } from './NudgeSheet';

interface NudgeProviderProps {
  children: React.ReactNode;
}

export function NudgeProvider({ children }: NudgeProviderProps) {
  const router = useRouter();

  // Store hooks
  const activeNudge = useNudgeStore((state) => state.activeNudge);
  const getNextNudge = useNudgeStore((state) => state.getNextNudge);
  const setActiveNudge = useNudgeStore((state) => state.setActiveNudge);
  const markAsShown = useNudgeStore((state) => state.markAsShown);
  const recordOutcome = useNudgeStore((state) => state.recordOutcome);
  const snoozeNudge = useNudgeStore((state) => state.snoozeNudge);
  const dismissNudge = useNudgeStore((state) => state.dismissNudge);

  // Local state for sheet open/close
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Present next nudge from queue
  const presentNextNudge = useCallback(() => {
    const nextNudge = getNextNudge();
    if (nextNudge) {
      markAsShown(nextNudge.id);
      setActiveNudge(nextNudge);
    }
  }, [getNextNudge, markAsShown, setActiveNudge]);

  // Dismiss the active nudge
  const dismissActiveNudge = useCallback(() => {
    if (activeNudge) {
      dismissNudge(activeNudge.id);
    }
    setActiveNudge(null);
  }, [activeNudge, dismissNudge, setActiveNudge]);

  // Present next nudge when there's one in the queue
  useEffect(() => {
    const checkForNudge = () => {
      if (!activeNudge) {
        presentNextNudge();
      }
    };

    // Check immediately and set up interval
    checkForNudge();
    const interval = setInterval(checkForNudge, 1000);

    return () => clearInterval(interval);
  }, [activeNudge, presentNextNudge]);

  // Open sheet when active nudge is sheet delivery
  useEffect(() => {
    if (activeNudge?.deliveryChannel === 'sheet') {
      setIsSheetOpen(true);
    }
  }, [activeNudge]);

  // Handle nudge action
  const handleAction = useCallback(
    (nudge: Nudge, optionId: string) => {
      const option = nudge.options?.find((o) => o.id === optionId);
      if (!option) {
        dismissActiveNudge();
        return;
      }

      // Execute the action
      switch (option.action.type) {
        case 'dismiss':
          recordOutcome(nudge.id, 'dismissed');
          break;

        case 'snooze':
          if (option.action.duration) {
            snoozeNudge(nudge.id, option.action.duration);
          }
          recordOutcome(nudge.id, 'snoozed');
          break;

        case 'navigate':
          if (option.action.target) {
            router.push(option.action.target);
          }
          recordOutcome(nudge.id, 'accepted');
          break;

        case 'custom':
          // Custom actions can be handled via event listeners or callbacks
          recordOutcome(nudge.id, 'accepted');
          break;

        default:
          recordOutcome(nudge.id, 'accepted');
      }

      // Clear active nudge and close sheet
      setActiveNudge(null);
      setIsSheetOpen(false);
    },
    [dismissActiveNudge, recordOutcome, snoozeNudge, setActiveNudge, router]
  );

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    if (activeNudge) {
      recordOutcome(activeNudge.id, 'dismissed');
    }
    setActiveNudge(null);
    setIsSheetOpen(false);
  }, [activeNudge, recordOutcome, setActiveNudge]);

  return (
    <>
      {children}

      {/* Toast Nudge */}
      {activeNudge && activeNudge.deliveryChannel === 'toast' && (
        <NudgeToast
          nudge={activeNudge}
          onAction={(optionId) => handleAction(activeNudge, optionId)}
          onDismiss={handleDismiss}
        />
      )}

      {/* Sheet Nudge */}
      {activeNudge && activeNudge.deliveryChannel === 'sheet' && (
        <NudgeSheet
          nudge={activeNudge}
          open={isSheetOpen}
          onAction={(optionId) => handleAction(activeNudge, optionId)}
          onDismiss={handleDismiss}
        />
      )}
    </>
  );
}
