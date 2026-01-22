/**
 * AgentDiscoveryStep - "What would you like to try first?"
 *
 * Shows 4 agent cards in a 2x2 grid for user to choose their first experience.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { AgentId } from '@/types';
import { useTheme } from '@/src/theme';
import {
  AGENT_DISCOVERY_CARDS,
  ONBOARDING_TEXT,
} from '@/constants/agentOnboardingContent';

const { width } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = (width - 48 - CARD_GAP) / 2;

interface AgentDiscoveryStepProps {
  onAgentSelected: (agentId: AgentId) => void;
  onSkip: () => void;
}

interface AgentCardProps {
  emoji: string;
  label: string;
  description: string;
  color: string;
  onPress: () => void;
  index: number;
}

function AgentCard({
  emoji,
  label,
  description,
  color,
  onPress,
  index,
}: AgentCardProps) {
  const { isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={animatedStyle}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          {
            backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
            borderColor: color + '30',
          },
        ]}
        activeOpacity={1}
        accessibilityLabel={`${label}. ${description}`}
        accessibilityRole="button"
      >
        {/* Emoji */}
        <View style={[styles.emojiContainer, { backgroundColor: color + '20' }]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>

        {/* Label */}
        <Text
          style={[styles.cardLabel, { color: isDark ? '#FFFFFF' : '#1F2937' }]}
        >
          {label}
        </Text>

        {/* Description */}
        <Text
          style={[
            styles.cardDescription,
            { color: isDark ? '#9CA3AF' : '#6B7280' },
          ]}
        >
          {description}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function AgentDiscoveryStep({
  onAgentSelected,
  onSkip,
}: AgentDiscoveryStepProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {ONBOARDING_TEXT.discoveryStep.title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {ONBOARDING_TEXT.discoveryStep.subtitle}
        </Text>
      </Animated.View>

      {/* Agent Cards Grid */}
      <View style={styles.grid}>
        {AGENT_DISCOVERY_CARDS.map((card, index) => (
          <AgentCard
            key={card.agentId}
            emoji={card.emoji}
            label={card.label}
            description={card.description}
            color={card.color}
            onPress={() => onAgentSelected(card.agentId)}
            index={index}
          />
        ))}
      </View>

      {/* Skip Button */}
      <Animated.View entering={FadeIn.delay(500)}>
        <TouchableOpacity
          onPress={onSkip}
          style={styles.skipButton}
          accessibilityLabel="Skip for now"
          accessibilityRole="button"
        >
          <Text style={[styles.skipText, { color: colors.textTertiary }]}>
            {ONBOARDING_TEXT.discoveryStep.skipButton}
          </Text>
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
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    justifyContent: 'center',
  },
  card: {
    width: CARD_WIDTH,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emojiContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 28,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    textAlign: 'center',
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 32,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '500',
  },
});

export default AgentDiscoveryStep;
