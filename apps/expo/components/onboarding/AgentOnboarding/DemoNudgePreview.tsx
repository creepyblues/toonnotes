/**
 * DemoNudgePreview - Shows demo nudge with explanation
 *
 * Displays a mock nudge that demonstrates what the agent's nudges will look like.
 * Includes a "DEMO" badge and explanation text.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInUp, SlideInDown } from 'react-native-reanimated';
import { Check } from 'phosphor-react-native';

import { AgentId } from '@/types';
import { useTheme } from '@/src/theme';
import {
  DEMO_NUDGE_CONTENT,
  ONBOARDING_TEXT,
  getAgentEmoji,
  getAgentColor,
  getAgentName,
} from '@/constants/agentOnboardingContent';

interface DemoNudgePreviewProps {
  agentId: AgentId;
  onAcknowledge: () => void;
}

export function DemoNudgePreview({
  agentId,
  onAcknowledge,
}: DemoNudgePreviewProps) {
  const { colors, isDark } = useTheme();

  const nudgeContent = DEMO_NUDGE_CONTENT[agentId];
  const agentColor = getAgentColor(agentId);
  const agentEmoji = getAgentEmoji(agentId);
  const agentName = getAgentName(agentId);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Demo Nudge Card */}
        <Animated.View
          entering={SlideInDown.delay(200).springify()}
          style={[
            styles.demoCard,
            {
              backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
              borderLeftColor: agentColor,
            },
          ]}
        >
          {/* DEMO Badge */}
          <View style={[styles.demoBadge, { backgroundColor: agentColor + '20' }]}>
            <Text style={[styles.demoBadgeText, { color: agentColor }]}>
              {ONBOARDING_TEXT.demoPreview.demoBadge}
            </Text>
          </View>

          {/* Header */}
          <View style={styles.nudgeHeader}>
            <Text style={styles.agentEmoji}>{agentEmoji}</Text>
            <Text
              style={[styles.nudgeTitle, { color: isDark ? '#FFFFFF' : '#1F2937' }]}
            >
              {nudgeContent.title}
            </Text>
          </View>

          {/* Body */}
          <Text
            style={[styles.nudgeBody, { color: isDark ? '#D1D5DB' : '#4B5563' }]}
          >
            {nudgeContent.body}
          </Text>

          {/* Options */}
          <View style={styles.nudgeOptions}>
            {nudgeContent.options.map((option) => (
              <View
                key={option.id}
                style={[
                  styles.optionButton,
                  option.isPrimary
                    ? { backgroundColor: agentColor }
                    : { backgroundColor: isDark ? '#374151' : '#F3F4F6' },
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: option.isPrimary
                        ? '#FFFFFF'
                        : isDark
                        ? '#D1D5DB'
                        : '#4B5563',
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Explanation */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.explanationContainer}>
          <Text style={[styles.explanation, { color: colors.textSecondary }]}>
            {nudgeContent.explanation}
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Got it Button */}
      <Animated.View entering={FadeIn.delay(600)} style={styles.footer}>
        <TouchableOpacity
          onPress={onAcknowledge}
          style={[styles.gotItButton, { backgroundColor: agentColor }]}
          accessibilityLabel="Got it"
          accessibilityRole="button"
        >
          <Text style={styles.gotItText}>
            {ONBOARDING_TEXT.demoPreview.gotItButton}
          </Text>
          <Check size={20} color="#FFFFFF" weight="bold" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    justifyContent: 'center',
    flexGrow: 1,
  },
  demoCard: {
    borderRadius: 16,
    borderLeftWidth: 4,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  demoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  demoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  nudgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  agentEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  nudgeTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  nudgeBody: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  nudgeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  explanationContainer: {
    marginTop: 32,
    paddingHorizontal: 8,
  },
  explanation: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  gotItButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    gap: 8,
  },
  gotItText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default DemoNudgePreview;
