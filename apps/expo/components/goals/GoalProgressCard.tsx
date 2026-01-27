/**
 * GoalProgressCard - AI Goal-Agent System
 *
 * In-note UI component showing:
 * - Goal statement with target emoji
 * - Progress bar (completed/total steps)
 * - Step checklist with manual "Done" buttons
 * - Analyzing state with rotating tips
 * - Pause/Regenerate controls
 * - "Was this helpful?" feedback link (beta)
 *
 * Rendered inside note/[id].tsx for active and passive goals.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
} from 'react-native';
import {
  Target,
  Check,
  CaretDown,
  CaretRight,
  Pause,
  ArrowsClockwise,
  ChatCircleText,
} from 'phosphor-react-native';

import { useGoalStore } from '@/stores/goalStore';
import { goalAnalysisService } from '@/services/goalAnalysisService';
import { useTheme } from '@/src/theme';
import { NoteGoal, ActionStep, GoalStatus } from '@/types';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ============================================
// Tip rotation for analyzing state
// ============================================

const TIPS = [
  'Include dates and action items for smarter suggestions',
  'Be specific about your goal for better steps',
  'Checklist items help AI break down your plan',
  'Mention deadlines to get timely nudges',
  'Name people and places for concrete steps',
];

function getRandomTip(): string {
  return TIPS[Math.floor(Math.random() * TIPS.length)];
}

// ============================================
// Props
// ============================================

interface GoalProgressCardProps {
  noteId: string;
  noteTitle: string;
  noteContent: string;
  onFeedbackPress: (goalId: string) => void;
}

// ============================================
// Component
// ============================================

export function GoalProgressCard({
  noteId,
  noteTitle,
  noteContent,
  onFeedbackPress,
}: GoalProgressCardProps) {
  const { colors, isDark } = useTheme();
  const goal = useGoalStore((state) => state.goals[noteId]);
  const completeStep = useGoalStore((state) => state.completeStep);
  const resetNudgeCadence = useGoalStore((state) => state.resetNudgeCadence);
  const pauseGoal = useGoalStore((state) => state.pauseGoal);
  const resumeGoal = useGoalStore((state) => state.resumeGoal);
  const enabled = useGoalStore((state) => state.goalSuggestionsEnabled);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [tip] = useState(getRandomTip);

  const isAnalyzing = goalAnalysisService.isAnalyzing(noteId);

  // Don't render if disabled or no goal
  if (!enabled) return null;
  if (!goal && !isAnalyzing) return null;

  // Analyzing state
  if (!goal || goal.status === 'analyzing') {
    return (
      <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
        <View style={styles.analyzingRow}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={[styles.analyzingText, { color: colors.textPrimary }]}>
            Analyzing your note...
          </Text>
        </View>
        <Text style={[styles.tipText, { color: colors.textSecondary }]}>
          Tip: {tip}
        </Text>
      </View>
    );
  }

  // Achieved state
  if (goal.status === 'achieved') {
    return (
      <View style={[styles.card, { backgroundColor: isDark ? '#1A2E1A' : '#F0FDF4' }]}>
        <View style={styles.headerRow}>
          <Text style={styles.achievedEmoji}>🎉</Text>
          <Text style={[styles.goalTitle, { color: isDark ? '#86EFAC' : '#16A34A' }]}>
            Goal achieved!
          </Text>
        </View>
        <Text style={[styles.goalStatement, { color: colors.textSecondary }]}>
          {goal.goalStatement}
        </Text>
        <FeedbackLink goalId={goal.id} onPress={onFeedbackPress} />
      </View>
    );
  }

  const completedCount = goal.steps.filter((s) => s.status === 'completed').length;
  const totalCount = goal.steps.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  const toggleCollapse = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsCollapsed(!isCollapsed);
  };

  const handleCompleteStep = (stepId: string) => {
    completeStep(noteId, stepId);
    resetNudgeCadence(noteId);
  };

  const handlePauseResume = () => {
    if (goal.status === 'paused') {
      resumeGoal(noteId);
    } else {
      pauseGoal(noteId);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await goalAnalysisService.analyzeImmediately(noteId, noteTitle, noteContent);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
      {/* Header: Goal title + collapse toggle */}
      <TouchableOpacity onPress={toggleCollapse} style={styles.headerRow} activeOpacity={0.7}>
        <Target size={18} color={colors.accent} weight="fill" />
        <Text
          style={[styles.goalTitle, { color: colors.textPrimary, flex: 1 }]}
          numberOfLines={1}
        >
          {goal.goalStatement}
        </Text>
        {isCollapsed ? (
          <CaretRight size={16} color={colors.textSecondary} />
        ) : (
          <CaretDown size={16} color={colors.textSecondary} />
        )}
      </TouchableOpacity>

      {/* Progress bar */}
      <View style={[styles.progressBar, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress * 100}%`,
              backgroundColor: colors.accent,
            },
          ]}
        />
      </View>
      <Text style={[styles.progressText, { color: colors.textSecondary }]}>
        {completedCount}/{totalCount} steps
        {goal.status === 'paused' && ' · Paused'}
      </Text>

      {/* Steps list (collapsible) */}
      {!isCollapsed && (
        <>
          <View style={styles.stepsContainer}>
            {goal.steps.map((step) => (
              <StepRow
                key={step.id}
                step={step}
                onComplete={() => handleCompleteStep(step.id)}
                colors={colors}
                isDark={isDark}
              />
            ))}
          </View>

          {/* Actions row */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={handlePauseResume}
              style={[styles.actionButton, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}
            >
              <Pause size={14} color={colors.textSecondary} weight="fill" />
              <Text style={[styles.actionText, { color: colors.textSecondary }]}>
                {goal.status === 'paused' ? 'Resume' : 'Pause'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRegenerate}
              disabled={isRegenerating}
              style={[
                styles.actionButton,
                { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA', opacity: isRegenerating ? 0.5 : 1 },
              ]}
            >
              {isRegenerating ? (
                <ActivityIndicator size={14} color={colors.textSecondary} />
              ) : (
                <ArrowsClockwise size={14} color={colors.textSecondary} />
              )}
              <Text style={[styles.actionText, { color: colors.textSecondary }]}>
                Regenerate
              </Text>
            </TouchableOpacity>
          </View>

          {/* Beta feedback link */}
          <FeedbackLink goalId={goal.id} onPress={onFeedbackPress} />
        </>
      )}
    </View>
  );
}

// ============================================
// Step Row
// ============================================

function StepRow({
  step,
  onComplete,
  colors,
  isDark,
}: {
  step: ActionStep;
  onComplete: () => void;
  colors: any;
  isDark: boolean;
}) {
  const isCompleted = step.status === 'completed';
  const isSkipped = step.status === 'skipped';
  const isCurrent = step.status === 'pending' || step.status === 'in_progress';

  return (
    <View style={[styles.stepRow, isCurrent && styles.stepRowCurrent]}>
      {/* Checkbox */}
      <View
        style={[
          styles.stepCheckbox,
          {
            borderColor: isCompleted ? colors.accent : colors.textSecondary,
            backgroundColor: isCompleted ? colors.accent : 'transparent',
          },
        ]}
      >
        {isCompleted && <Check size={12} color="#FFFFFF" weight="bold" />}
      </View>

      {/* Step title */}
      <Text
        style={[
          styles.stepTitle,
          {
            color: isCompleted || isSkipped ? colors.textSecondary : colors.textPrimary,
            textDecorationLine: isCompleted ? 'line-through' : 'none',
            flex: 1,
          },
        ]}
      >
        {step.title}
      </Text>

      {/* Done button for current/pending steps */}
      {isCurrent && (
        <TouchableOpacity
          onPress={onComplete}
          style={[styles.doneButton, { backgroundColor: `${colors.accent}20` }]}
        >
          <Text style={[styles.doneText, { color: colors.accent }]}>Done</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============================================
// Feedback Link (Beta)
// ============================================

function FeedbackLink({
  goalId,
  onPress,
}: {
  goalId: string;
  onPress: (goalId: string) => void;
}) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => onPress(goalId)}
      style={styles.feedbackLink}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <ChatCircleText size={12} color={colors.textTertiary} />
      <Text style={[styles.feedbackText, { color: colors.textTertiary }]}>
        Was this helpful?
      </Text>
    </TouchableOpacity>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  goalStatement: {
    fontSize: 13,
    marginTop: 4,
  },
  achievedEmoji: {
    fontSize: 18,
  },
  analyzingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  analyzingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tipText: {
    fontSize: 12,
    marginTop: 6,
    fontStyle: 'italic',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    marginTop: 4,
  },
  stepsContainer: {
    marginTop: 10,
    gap: 2,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  stepRowCurrent: {
    // subtle highlight for current step
  },
  stepCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 14,
  },
  doneButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  doneText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  feedbackLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    alignSelf: 'center',
  },
  feedbackText: {
    fontSize: 11,
  },
});
