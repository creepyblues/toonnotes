/**
 * NudgeToast - MODE Framework v2.0
 *
 * Toast notification for AI agent nudges.
 * Displays nudge content with action buttons in a floating toast.
 * Supports swipe-to-dismiss and auto-dismiss on timeout.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  PanResponder,
  Dimensions,
} from 'react-native';
import { X, Check, Clock, CaretRight } from 'phosphor-react-native';
import { useTheme } from '@/src/theme';
import { Nudge, NudgeOption, AgentId } from '@/types';
import { AGENT_CONFIGS } from '@/services/agents/Agent';

const ANIMATION_DURATION_MS = 250;
const SWIPE_THRESHOLD = 100;
const AUTO_DISMISS_MS = 8000; // 8 seconds

interface NudgeToastProps {
  nudge: Nudge;
  onAction: (optionId: string) => void;
  onDismiss: () => void;
  autoDismiss?: boolean;
}

/**
 * Get agent color based on agent ID
 */
function getAgentColor(agentId: AgentId, isDark: boolean): string {
  const config = AGENT_CONFIGS[agentId];
  return config?.color ?? (isDark ? '#70BFBD' : '#4C9C9B');
}

/**
 * Get agent emoji based on agent ID
 */
function getAgentEmoji(agentId: AgentId): string {
  const config = AGENT_CONFIGS[agentId];
  return config?.emoji ?? '🤖';
}

export function NudgeToast({
  nudge,
  onAction,
  onDismiss,
  autoDismiss = true,
}: NudgeToastProps) {
  const { isDark } = useTheme();
  const agentColor = getAgentColor(nudge.agentId, isDark);

  // Animation values
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  // Auto-dismiss timer
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pan responder for swipe-to-dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > SWIPE_THRESHOLD) {
          // Swipe out
          Animated.timing(translateX, {
            toValue: gestureState.dx > 0 ? Dimensions.get('window').width : -Dimensions.get('window').width,
            duration: 200,
            useNativeDriver: true,
          }).start(() => onDismiss());
        } else {
          // Snap back
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Animate in on mount
  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: ANIMATION_DURATION_MS,
        useNativeDriver: true,
      }),
    ]).start();

    // Set up auto-dismiss
    if (autoDismiss) {
      dismissTimer.current = setTimeout(() => {
        handleDismiss();
      }, AUTO_DISMISS_MS);
    }

    return () => {
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
      }
    };
  }, []);

  const handleDismiss = useCallback(() => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: ANIMATION_DURATION_MS,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: ANIMATION_DURATION_MS,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  }, [onDismiss, translateY, opacity]);

  const handleAction = useCallback(
    (optionId: string) => {
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
      }
      onAction(optionId);
    },
    [onAction]
  );

  // Find primary and secondary options
  const primaryOption = nudge.options.find((o) => o.isPrimary);
  const secondaryOptions = nudge.options.filter((o) => !o.isPrimary);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }, { translateX }],
          opacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View
        style={[
          styles.toast,
          {
            backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
            borderLeftColor: agentColor,
            shadowColor: '#000000',
          },
        ]}
      >
        {/* Header with agent emoji and dismiss */}
        <View style={styles.header}>
          <View style={styles.agentInfo}>
            <Text style={styles.agentEmoji}>{getAgentEmoji(nudge.agentId)}</Text>
            <View style={styles.titleContainer}>
              <Text
                style={[styles.title, { color: isDark ? '#FFFFFF' : '#1F2937' }]}
                numberOfLines={1}
              >
                {nudge.title}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleDismiss}
            style={[
              styles.dismissButton,
              { backgroundColor: isDark ? '#374151' : '#F3F4F6' },
            ]}
            accessibilityLabel="Dismiss"
            accessibilityRole="button"
          >
            <X size={16} color={isDark ? '#9CA3AF' : '#6B7280'} weight="bold" />
          </TouchableOpacity>
        </View>

        {/* Body */}
        <Text
          style={[styles.body, { color: isDark ? '#D1D5DB' : '#4B5563' }]}
          numberOfLines={2}
        >
          {nudge.body}
        </Text>

        {/* Actions */}
        <View style={styles.actions}>
          {/* Secondary options */}
          {secondaryOptions.slice(0, 2).map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => handleAction(option.id)}
              style={[
                styles.secondaryButton,
                { backgroundColor: isDark ? '#374151' : '#F3F4F6' },
              ]}
              accessibilityLabel={option.label}
              accessibilityRole="button"
            >
              {option.action.type === 'snooze' && (
                <Clock
                  size={12}
                  color={isDark ? '#9CA3AF' : '#6B7280'}
                  weight="bold"
                  style={{ marginRight: 3 }}
                />
              )}
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: isDark ? '#D1D5DB' : '#4B5563' },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Primary option */}
          {primaryOption && (
            <TouchableOpacity
              onPress={() => handleAction(primaryOption.id)}
              style={[styles.primaryButton, { backgroundColor: agentColor }]}
              accessibilityLabel={primaryOption.label}
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>{primaryOption.label}</Text>
              <CaretRight size={12} color="#FFFFFF" weight="bold" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60, // Below status bar
    left: 16,
    right: 16,
    zIndex: 99999,
    elevation: 999, // Android needs elevation for proper layering
    // TEMP: Debug border
    // borderWidth: 2,
    // borderColor: 'red',
  },
  toast: {
    borderRadius: 16,
    borderLeftWidth: 4,
    padding: 16,
    paddingBottom: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  agentEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  dismissButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    rowGap: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 3,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default NudgeToast;
