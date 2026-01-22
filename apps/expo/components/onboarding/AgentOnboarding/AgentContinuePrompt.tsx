/**
 * AgentContinuePrompt - "Try another?" or "Start using ToonNotes"
 *
 * Shown after completing an agent demo. Gives user choice to continue
 * meeting more agents or start using the app.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInUp, BounceIn } from 'react-native-reanimated';
import { ArrowRight, Rocket, CheckCircle } from 'phosphor-react-native';

import { AgentId } from '@/types';
import { useTheme } from '@/src/theme';
import {
  ONBOARDING_TEXT,
  getAgentEmoji,
  getAgentColor,
  getAgentName,
} from '@/constants/agentOnboardingContent';

interface AgentContinuePromptProps {
  agentId: AgentId;
  onTryAnother: () => void;
  onComplete: () => void;
  hasMoreAgents: boolean;
}

export function AgentContinuePrompt({
  agentId,
  onTryAnother,
  onComplete,
  hasMoreAgents,
}: AgentContinuePromptProps) {
  const { colors, isDark } = useTheme();

  const agentColor = getAgentColor(agentId);
  const agentEmoji = getAgentEmoji(agentId);
  const agentName = getAgentName(agentId);

  return (
    <View style={styles.container}>
      {/* Success Icon */}
      <Animated.View entering={BounceIn.delay(100)} style={styles.successIcon}>
        <View style={[styles.checkCircle, { backgroundColor: agentColor + '20' }]}>
          <CheckCircle size={48} color={agentColor} weight="fill" />
        </View>
      </Animated.View>

      {/* Title */}
      <Animated.View entering={FadeIn.delay(300)}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {ONBOARDING_TEXT.continuePrompt.title}
        </Text>
      </Animated.View>

      {/* Subtitle with agent name */}
      <Animated.View entering={FadeIn.delay(400)}>
        <View style={styles.subtitleContainer}>
          <Text style={styles.agentEmoji}>{agentEmoji}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {ONBOARDING_TEXT.continuePrompt.subtitle(agentName)}
          </Text>
        </View>
      </Animated.View>

      {/* Buttons */}
      <Animated.View entering={FadeInUp.delay(500)} style={styles.buttonsContainer}>
        {hasMoreAgents && (
          <TouchableOpacity
            onPress={onTryAnother}
            style={[
              styles.tryAnotherButton,
              {
                backgroundColor: isDark ? '#1F1F1F' : '#F3F4F6',
                borderColor: isDark ? '#374151' : '#E5E7EB',
              },
            ]}
            accessibilityLabel="Try another agent"
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.tryAnotherText,
                { color: isDark ? '#D1D5DB' : '#4B5563' },
              ]}
            >
              {ONBOARDING_TEXT.continuePrompt.tryAnotherButton}
            </Text>
            <ArrowRight
              size={18}
              color={isDark ? '#9CA3AF' : '#6B7280'}
              weight="bold"
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={onComplete}
          style={[styles.startButton, { backgroundColor: colors.accent }]}
          accessibilityLabel="Start using ToonNotes"
          accessibilityRole="button"
        >
          <Text style={styles.startButtonText}>
            {ONBOARDING_TEXT.continuePrompt.startButton}
          </Text>
          <Rocket size={18} color="#FFFFFF" weight="fill" />
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
  successIcon: {
    marginBottom: 24,
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  agentEmoji: {
    fontSize: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  tryAnotherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  tryAnotherText: {
    fontSize: 16,
    fontWeight: '600',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AgentContinuePrompt;
