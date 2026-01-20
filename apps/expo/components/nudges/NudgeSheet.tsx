/**
 * NudgeSheet - MODE Framework v2.0
 *
 * Bottom sheet for detailed AI agent nudges that require more context
 * or multiple options. Used for complex interactions like:
 * - Daily inbox sweep
 * - Task decomposition
 * - Idea expansion choices
 * - Mode transition suggestions
 */

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import {
  ArrowRight,
  Check,
  Clock,
  X,
  Lightbulb,
  Target,
  Archive,
  BookOpen,
  Notebook,
} from 'phosphor-react-native';
import { useTheme } from '@/src/theme';
import { BottomSheet } from '@/src/components/sheets/BottomSheet';
import { Nudge, NudgeOption, AgentId } from '@/types';
import { AGENT_CONFIGS } from '@/services/agents/Agent';

interface NudgeSheetProps {
  nudge: Nudge | null;
  visible: boolean;
  onAction: (optionId: string) => void;
  onDismiss: () => void;
}

/**
 * Get agent icon based on agent ID
 */
function AgentIcon({ agentId, color, size = 24 }: { agentId: AgentId; color: string; size?: number }) {
  switch (agentId) {
    case 'manager':
      return <Target size={size} color={color} weight="fill" />;
    case 'muse':
      return <Lightbulb size={size} color={color} weight="fill" />;
    case 'librarian':
      return <BookOpen size={size} color={color} weight="fill" />;
    case 'biographer':
      return <Notebook size={size} color={color} weight="fill" />;
    default:
      return <Lightbulb size={size} color={color} weight="fill" />;
  }
}

/**
 * Get icon for option based on action type
 */
function OptionIcon({
  option,
  color,
  size = 18,
}: {
  option: NudgeOption;
  color: string;
  size?: number;
}) {
  if (option.action.type === 'snooze') {
    return <Clock size={size} color={color} weight="bold" />;
  }
  if (option.action.type === 'dismiss') {
    return <X size={size} color={color} weight="bold" />;
  }
  if (option.action.type === 'move_note') {
    return <Archive size={size} color={color} weight="bold" />;
  }
  if (option.isPrimary) {
    return <Check size={size} color={color} weight="bold" />;
  }
  return <ArrowRight size={size} color={color} weight="bold" />;
}

export function NudgeSheet({ nudge, visible, onAction, onDismiss }: NudgeSheetProps) {
  const { colors, isDark } = useTheme();

  const handleAction = useCallback(
    (optionId: string) => {
      onAction(optionId);
      onDismiss();
    },
    [onAction, onDismiss]
  );

  if (!nudge) return null;

  const agentConfig = AGENT_CONFIGS[nudge.agentId];
  const agentColor = agentConfig?.color ?? colors.accent;

  // Separate primary and secondary options
  const primaryOptions = nudge.options.filter((o) => o.isPrimary);
  const secondaryOptions = nudge.options.filter((o) => !o.isPrimary);

  // Custom header with agent branding
  const headerContent = (
    <View style={styles.header}>
      <View style={[styles.agentBadge, { backgroundColor: agentColor + '20' }]}>
        <AgentIcon agentId={nudge.agentId} color={agentColor} size={20} />
      </View>
      <View style={styles.headerText}>
        <Text style={[styles.agentName, { color: agentColor }]}>
          {agentConfig?.name ?? 'Assistant'}
        </Text>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {nudge.title}
        </Text>
      </View>
    </View>
  );

  // Footer with primary actions
  const footerContent = primaryOptions.length > 0 && (
    <View style={styles.footer}>
      {primaryOptions.map((option) => (
        <TouchableOpacity
          key={option.id}
          onPress={() => handleAction(option.id)}
          style={[styles.primaryButton, { backgroundColor: agentColor }]}
          accessibilityLabel={option.label}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>{option.label}</Text>
          <OptionIcon option={option} color="#FFFFFF" size={18} />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={onDismiss}
      size="auto"
      showCloseButton={true}
      headerContent={headerContent}
      footerContent={footerContent}
    >
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Body text */}
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          {nudge.body}
        </Text>

        {/* Agent's core question */}
        {agentConfig?.coreQuestion && (
          <View
            style={[
              styles.questionCard,
              { backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB' },
            ]}
          >
            <Text style={[styles.questionText, { color: colors.textPrimary }]}>
              "{agentConfig.coreQuestion}"
            </Text>
          </View>
        )}

        {/* Secondary options */}
        {secondaryOptions.length > 0 && (
          <View style={styles.optionsContainer}>
            <Text style={[styles.optionsLabel, { color: colors.textTertiary }]}>
              Other options
            </Text>
            {secondaryOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => handleAction(option.id)}
                style={[
                  styles.secondaryButton,
                  { backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6' },
                ]}
                accessibilityLabel={option.label}
                accessibilityRole="button"
              >
                <OptionIcon
                  option={option}
                  color={isDark ? '#9CA3AF' : '#6B7280'}
                  size={16}
                />
                <Text
                  style={[
                    styles.secondaryButtonText,
                    { color: isDark ? '#D1D5DB' : '#4B5563' },
                  ]}
                >
                  {option.label}
                </Text>
                <ArrowRight
                  size={14}
                  color={isDark ? '#6B7280' : '#9CA3AF'}
                  weight="bold"
                  style={styles.secondaryArrow}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Note context if available */}
        {nudge.noteId && (
          <View style={styles.contextContainer}>
            <Text style={[styles.contextLabel, { color: colors.textTertiary }]}>
              Related to note
            </Text>
            <Text
              style={[styles.contextValue, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {nudge.noteId}
            </Text>
          </View>
        )}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  agentBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  agentName: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    paddingTop: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  questionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  questionText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    marginLeft: 12,
  },
  secondaryArrow: {
    marginLeft: 8,
  },
  contextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  contextLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 8,
  },
  contextValue: {
    fontSize: 12,
    flex: 1,
  },
  footer: {
    gap: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default NudgeSheet;
