/**
 * AgentSelectionGrid - Pick from remaining agents
 *
 * Shows a grid of agents with completed ones marked as "done".
 * User can select from remaining agents to continue onboarding.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Check, Rocket } from 'phosphor-react-native';

import { AgentId } from '@/types';
import { useTheme } from '@/src/theme';
import {
  AGENT_DISCOVERY_CARDS,
  ONBOARDING_TEXT,
} from '@/constants/agentOnboardingContent';

const { width } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = (width - 48 - CARD_GAP) / 2;

interface AgentSelectionGridProps {
  experiencedAgents: AgentId[];
  onAgentSelected: (agentId: AgentId) => void;
  onSkip: () => void;
}

interface SelectionCardProps {
  emoji: string;
  label: string;
  color: string;
  isCompleted: boolean;
  onPress: () => void;
  index: number;
}

function SelectionCard({
  emoji,
  label,
  color,
  isCompleted,
  onPress,
  index,
}: SelectionCardProps) {
  const { isDark } = useTheme();

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
      <TouchableOpacity
        onPress={onPress}
        disabled={isCompleted}
        style={[
          styles.card,
          {
            backgroundColor: isCompleted
              ? isDark
                ? '#1F1F1F'
                : '#F9FAFB'
              : isDark
              ? '#1F1F1F'
              : '#FFFFFF',
            borderColor: isCompleted ? (isDark ? '#374151' : '#E5E7EB') : color + '40',
            opacity: isCompleted ? 0.7 : 1,
          },
        ]}
        activeOpacity={isCompleted ? 1 : 0.7}
        accessibilityLabel={`${label}${isCompleted ? ', completed' : ''}`}
        accessibilityRole="button"
        accessibilityState={{ disabled: isCompleted }}
      >
        {/* Emoji or Checkmark */}
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isCompleted
                ? isDark
                  ? '#374151'
                  : '#E5E7EB'
                : color + '20',
            },
          ]}
        >
          {isCompleted ? (
            <Check
              size={24}
              color={isDark ? '#9CA3AF' : '#6B7280'}
              weight="bold"
            />
          ) : (
            <Text style={styles.emoji}>{emoji}</Text>
          )}
        </View>

        {/* Label */}
        <Text
          style={[
            styles.cardLabel,
            {
              color: isCompleted
                ? isDark
                  ? '#6B7280'
                  : '#9CA3AF'
                : isDark
                ? '#FFFFFF'
                : '#1F2937',
            },
          ]}
        >
          {label}
        </Text>

        {/* Done indicator */}
        {isCompleted && (
          <Text style={[styles.doneLabel, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
            {ONBOARDING_TEXT.agentSelection.doneLabel}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export function AgentSelectionGrid({
  experiencedAgents,
  onAgentSelected,
  onSkip,
}: AgentSelectionGridProps) {
  const { colors, isDark } = useTheme();

  const allDone = experiencedAgents.length >= 4;

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {ONBOARDING_TEXT.agentSelection.title}
        </Text>
      </Animated.View>

      {/* Agent Cards Grid */}
      <View style={styles.grid}>
        {AGENT_DISCOVERY_CARDS.map((card, index) => {
          const isCompleted = experiencedAgents.includes(card.agentId);
          return (
            <SelectionCard
              key={card.agentId}
              emoji={card.emoji}
              label={card.label}
              color={card.color}
              isCompleted={isCompleted}
              onPress={() => onAgentSelected(card.agentId)}
              index={index}
            />
          );
        })}
      </View>

      {/* Done/Skip Button */}
      <Animated.View entering={FadeIn.delay(400)}>
        <TouchableOpacity
          onPress={onSkip}
          style={[
            styles.continueButton,
            {
              backgroundColor: allDone
                ? colors.accent
                : isDark
                ? '#374151'
                : '#F3F4F6',
            },
          ]}
          accessibilityLabel={allDone ? 'Start using ToonNotes' : 'Skip for now'}
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.continueText,
              { color: allDone ? '#FFFFFF' : colors.textSecondary },
            ]}
          >
            {allDone
              ? ONBOARDING_TEXT.completion.startButton
              : ONBOARDING_TEXT.discoveryStep.skipButton}
          </Text>
          {allDone && <Rocket size={18} color="#FFFFFF" weight="fill" />}
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
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    justifyContent: 'center',
    marginBottom: 32,
  },
  card: {
    width: CARD_WIDTH,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emoji: {
    fontSize: 24,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  doneLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'center',
    gap: 8,
  },
  continueText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default AgentSelectionGrid;
