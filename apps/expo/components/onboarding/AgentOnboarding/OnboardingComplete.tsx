/**
 * OnboardingComplete - Celebration screen
 *
 * Shown when user has completed the agent onboarding.
 * Shows all agents they've met with a celebration message.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  ZoomIn,
  withSequence,
  withDelay,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { Rocket, Confetti, Sparkle } from 'phosphor-react-native';
import { useEffect } from 'react';

import { AgentId } from '@/types';
import { useTheme } from '@/src/theme';
import {
  ONBOARDING_TEXT,
  getAgentEmoji,
  getAgentColor,
  AGENT_DISCOVERY_CARDS,
} from '@/constants/agentOnboardingContent';

interface OnboardingCompleteProps {
  experiencedAgents: AgentId[];
  onComplete: () => void;
}

export function OnboardingComplete({
  experiencedAgents,
  onComplete,
}: OnboardingCompleteProps) {
  const { colors, isDark } = useTheme();

  const allAgentsExperienced = experiencedAgents.length >= 4;

  // Animated scale for sparkles
  const sparkleScale1 = useSharedValue(0);
  const sparkleScale2 = useSharedValue(0);
  const sparkleScale3 = useSharedValue(0);

  useEffect(() => {
    // Staggered sparkle animations
    sparkleScale1.value = withDelay(300, withSpring(1, { damping: 10 }));
    sparkleScale2.value = withDelay(500, withSpring(1, { damping: 10 }));
    sparkleScale3.value = withDelay(700, withSpring(1, { damping: 10 }));
  }, []);

  const sparkle1Style = useAnimatedStyle(() => ({
    transform: [{ scale: sparkleScale1.value }],
  }));

  const sparkle2Style = useAnimatedStyle(() => ({
    transform: [{ scale: sparkleScale2.value }],
  }));

  const sparkle3Style = useAnimatedStyle(() => ({
    transform: [{ scale: sparkleScale3.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Celebration Icon */}
      <Animated.View entering={ZoomIn.delay(100).springify()} style={styles.celebrationContainer}>
        {/* Sparkles */}
        <Animated.View style={[styles.sparkle, styles.sparkle1, sparkle1Style]}>
          <Sparkle size={24} color="#FBBF24" weight="fill" />
        </Animated.View>
        <Animated.View style={[styles.sparkle, styles.sparkle2, sparkle2Style]}>
          <Sparkle size={20} color="#F472B6" weight="fill" />
        </Animated.View>
        <Animated.View style={[styles.sparkle, styles.sparkle3, sparkle3Style]}>
          <Sparkle size={16} color="#8B5CF6" weight="fill" />
        </Animated.View>

        {/* Main icon */}
        <View style={[styles.iconCircle, { backgroundColor: colors.accent + '20' }]}>
          <Confetti size={48} color={colors.accent} weight="fill" />
        </View>
      </Animated.View>

      {/* Title */}
      <Animated.View entering={FadeIn.delay(300)}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {ONBOARDING_TEXT.completion.title}
        </Text>
      </Animated.View>

      {/* Subtitle */}
      <Animated.View entering={FadeIn.delay(400)}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {allAgentsExperienced
            ? ONBOARDING_TEXT.completion.subtitle4Agents
            : ONBOARDING_TEXT.completion.subtitle}
        </Text>
      </Animated.View>

      {/* Agent badges */}
      <Animated.View entering={FadeInUp.delay(500)} style={styles.agentBadges}>
        {experiencedAgents.length > 0 ? (
          experiencedAgents.map((agentId, index) => (
            <Animated.View
              key={agentId}
              entering={ZoomIn.delay(600 + index * 100)}
              style={[
                styles.agentBadge,
                { backgroundColor: getAgentColor(agentId) + '20' },
              ]}
            >
              <Text style={styles.agentBadgeEmoji}>{getAgentEmoji(agentId)}</Text>
            </Animated.View>
          ))
        ) : (
          // Show all 4 if none experienced (edge case)
          AGENT_DISCOVERY_CARDS.map((card, index) => (
            <Animated.View
              key={card.agentId}
              entering={ZoomIn.delay(600 + index * 100)}
              style={[styles.agentBadge, { backgroundColor: card.color + '20' }]}
            >
              <Text style={styles.agentBadgeEmoji}>{card.emoji}</Text>
            </Animated.View>
          ))
        )}
      </Animated.View>

      {/* Start Button */}
      <Animated.View entering={FadeInUp.delay(800)} style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={onComplete}
          style={[styles.startButton, { backgroundColor: colors.accent }]}
          accessibilityLabel="Start using ToonNotes"
          accessibilityRole="button"
        >
          <Text style={styles.startButtonText}>
            {ONBOARDING_TEXT.completion.startButton}
          </Text>
          <Rocket size={20} color="#FFFFFF" weight="fill" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: -10,
    right: -15,
  },
  sparkle2: {
    top: 10,
    left: -20,
  },
  sparkle3: {
    bottom: 5,
    right: -10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  agentBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 40,
  },
  agentBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentBadgeEmoji: {
    fontSize: 28,
  },
  buttonContainer: {
    width: '100%',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    gap: 8,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default OnboardingComplete;
