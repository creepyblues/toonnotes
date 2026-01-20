/**
 * NudgeProvider - MODE Framework v2.0
 *
 * Context provider that manages the nudge display system.
 * Handles:
 * - Listening for new nudges from the delivery service
 * - Displaying toasts and sheets based on delivery channel
 * - Managing active nudge state
 * - Executing user actions
 * - Navigation integration
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Nudge, NudgeDeliveryChannel } from '@/types';
import { useNudgeStore } from '@/stores/nudgeStore';
import { nudgeDeliveryService } from '@/services/nudgeDeliveryService';
import { NudgeToast } from './NudgeToast';
import { NudgeSheet } from './NudgeSheet';

// ============================================
// Context Types
// ============================================

interface NudgeContextValue {
  /** Currently active nudge (if any) */
  activeNudge: Nudge | null;
  /** Number of pending nudges */
  pendingCount: number;
  /** Show a specific nudge */
  showNudge: (nudge: Nudge) => void;
  /** Dismiss the active nudge */
  dismissNudge: () => void;
  /** Execute an action on the active nudge */
  executeAction: (optionId: string) => Promise<void>;
  /** Check if nudge system is enabled */
  isEnabled: boolean;
  /** Enable/disable nudge system */
  setEnabled: (enabled: boolean) => void;
}

const NudgeContext = createContext<NudgeContextValue | null>(null);

// ============================================
// Provider Props
// ============================================

interface NudgeProviderProps {
  children: ReactNode;
  /** Enable automatic nudge delivery (default: true) */
  autoDeliver?: boolean;
  /** Disable all nudges (useful for onboarding, etc.) */
  disabled?: boolean;
}

// ============================================
// Provider Implementation
// ============================================

export function NudgeProvider({
  children,
  autoDeliver = true,
  disabled = false,
}: NudgeProviderProps) {
  const router = useRouter();
  const [activeNudge, setActiveNudge] = useState<Nudge | null>(null);
  const [isEnabled, setIsEnabled] = useState(!disabled);
  const stopProcessingRef = useRef<(() => void) | null>(null);

  // Get pending count from store
  const pendingCount = useNudgeStore((state) => state.getQueuedCount());

  // Handle showing a nudge
  const showNudge = useCallback((nudge: Nudge) => {
    if (!isEnabled) return;
    setActiveNudge(nudge);
    nudgeDeliveryService.markAsShown(nudge.id);
  }, [isEnabled]);

  // Handle dismissing the active nudge
  const dismissNudge = useCallback(() => {
    if (activeNudge) {
      nudgeDeliveryService.dismissNudge(activeNudge.id);
    }
    setActiveNudge(null);
  }, [activeNudge]);

  // Handle executing an action
  const executeAction = useCallback(
    async (optionId: string) => {
      if (!activeNudge) return;

      const result = await nudgeDeliveryService.handleNudgeAction(
        activeNudge.id,
        optionId
      );

      // Handle navigation actions
      const option = activeNudge.options.find((o) => o.id === optionId);
      if (option?.action.type === 'navigate') {
        router.push(option.action.target as any);
      }

      // Clear active nudge
      setActiveNudge(null);
    },
    [activeNudge, router]
  );

  // Start/stop auto-delivery based on settings
  useEffect(() => {
    if (autoDeliver && isEnabled) {
      stopProcessingRef.current = nudgeDeliveryService.startQueueProcessing(
        (nudge) => {
          // Only show if we don't already have an active nudge
          if (!activeNudge) {
            showNudge(nudge);
          }
        }
      );
    }

    return () => {
      if (stopProcessingRef.current) {
        stopProcessingRef.current();
        stopProcessingRef.current = null;
      }
    };
  }, [autoDeliver, isEnabled, showNudge, activeNudge]);

  // Listen for nudge ready events
  useEffect(() => {
    const unsubscribe = nudgeDeliveryService.on('nudge_ready', (nudge) => {
      // For high priority nudges, show immediately
      if (nudge.priority === 'urgent' || nudge.priority === 'high') {
        if (!activeNudge) {
          showNudge(nudge);
        }
      }
    });

    return unsubscribe;
  }, [showNudge, activeNudge]);

  // Update enabled state when disabled prop changes
  useEffect(() => {
    setIsEnabled(!disabled);
  }, [disabled]);

  const contextValue: NudgeContextValue = {
    activeNudge,
    pendingCount,
    showNudge,
    dismissNudge,
    executeAction,
    isEnabled,
    setEnabled: setIsEnabled,
  };

  // Determine which UI to show based on delivery channel
  const renderNudgeUI = () => {
    if (!activeNudge || !isEnabled) return null;

    switch (activeNudge.deliveryChannel) {
      case 'toast':
        return (
          <NudgeToast
            nudge={activeNudge}
            onAction={executeAction}
            onDismiss={dismissNudge}
          />
        );
      case 'sheet':
        return (
          <NudgeSheet
            nudge={activeNudge}
            visible={true}
            onAction={executeAction}
            onDismiss={dismissNudge}
          />
        );
      case 'inline':
        // Inline nudges are rendered within specific components
        return null;
      case 'notification':
        // Push notifications are handled by the notification service
        return null;
      default:
        return null;
    }
  };

  return (
    <NudgeContext.Provider value={contextValue}>
      {children}
      {renderNudgeUI()}
    </NudgeContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

/**
 * Hook to access nudge context
 */
export function useNudges(): NudgeContextValue {
  const context = useContext(NudgeContext);
  if (!context) {
    throw new Error('useNudges must be used within a NudgeProvider');
  }
  return context;
}

// ============================================
// Inline Nudge Component
// ============================================

interface InlineNudgeProps {
  noteId?: string;
  boardId?: string;
  /** Render function that receives the nudge */
  children: (nudge: Nudge | null, onAction: (optionId: string) => void) => ReactNode;
}

/**
 * Component for rendering inline nudges within specific views
 */
export function InlineNudge({ noteId, boardId, children }: InlineNudgeProps) {
  const { activeNudge, executeAction } = useNudges();

  // Filter to only show inline nudges for this context
  const relevantNudge =
    activeNudge?.deliveryChannel === 'inline' &&
    ((noteId && activeNudge.noteId === noteId) ||
      (boardId && activeNudge.boardId === boardId))
      ? activeNudge
      : null;

  return <>{children(relevantNudge, executeAction)}</>;
}

// ============================================
// Nudge Badge Component
// ============================================

interface NudgeBadgeProps {
  /** Style variant */
  variant?: 'dot' | 'count';
  /** Size of the badge */
  size?: 'small' | 'medium';
}

/**
 * Badge component to show pending nudge count
 */
export function NudgeBadge({ variant = 'count', size = 'small' }: NudgeBadgeProps) {
  const { pendingCount, isEnabled } = useNudges();

  if (!isEnabled || pendingCount === 0) return null;

  if (variant === 'dot') {
    return (
      <View
        style={{
          width: size === 'small' ? 8 : 10,
          height: size === 'small' ? 8 : 10,
          borderRadius: size === 'small' ? 4 : 5,
          backgroundColor: '#FF6B6B',
        }}
      />
    );
  }

  return (
    <View
      style={{
        minWidth: size === 'small' ? 18 : 22,
        height: size === 'small' ? 18 : 22,
        borderRadius: size === 'small' ? 9 : 11,
        backgroundColor: '#FF6B6B',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
      }}
    >
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: size === 'small' ? 11 : 13,
          fontWeight: '600',
        }}
      >
        {pendingCount > 9 ? '9+' : pendingCount}
      </Text>
    </View>
  );
}

export default NudgeProvider;
