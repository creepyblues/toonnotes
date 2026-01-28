/**
 * FeedbackSheet - Beta Feedback Collection
 *
 * Bottom sheet with text input for users to share feedback
 * about AI-generated goals. Sends to Slack + email via edge function.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { X, PaperPlaneTilt } from 'phosphor-react-native';
import Constants from 'expo-constants';

import { useGoalStore } from '@/stores/goalStore';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/src/theme';
import { trackEvent } from '@/services/firebaseAnalytics';

// ============================================
// Constants
// ============================================

const API_BASE_URL = 'https://toonnotes-api.vercel.app';

// ============================================
// Props
// ============================================

interface FeedbackSheetProps {
  visible: boolean;
  goalId: string | null;
  onClose: () => void;
}

// ============================================
// Component
// ============================================

export function FeedbackSheet({ visible, goalId, onClose }: FeedbackSheetProps) {
  const { colors, isDark } = useTheme();
  const [feedbackText, setFeedbackText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const goal = useMemo(() => {
    if (!goalId) return null;
    const goals = useGoalStore.getState().goals;
    const noteId = Object.keys(goals).find((nId) => goals[nId]?.id === goalId);
    return noteId ? goals[noteId] : null;
  }, [goalId]);

  const handleSend = async () => {
    if (!feedbackText.trim() || !goal) return;

    setIsSending(true);
    try {
      const authUser = useAuthStore.getState().user;
      const appVersion = Constants.expoConfig?.version ?? '1.0.0';

      const payload = {
        noteId: goal.noteId,
        goalId: goal.id,
        goalStatement: goal.goalStatement,
        engagement: goal.nudgeEngagement,
        feedbackText: feedbackText.trim(),
        timestamp: Date.now(),
        userId: authUser?.id,
        appVersion,
      };

      const response = await fetch(`${API_BASE_URL}/api/goal-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'feedback', ...payload }),
      });

      if (response.ok) {
        trackEvent('goal_feedback_sent', {
          goal_id: goal.id,
          engagement: goal.nudgeEngagement,
        });
        Alert.alert('Thank you!', 'Your feedback helps us improve.');
        setFeedbackText('');
        onClose();
      } else {
        Alert.alert('Error', 'Failed to send feedback. Please try again.');
      }
    } catch (error) {
      console.error('[FeedbackSheet] Send failed:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setFeedbackText('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} onPress={handleClose} activeOpacity={1} />

        <View style={[styles.sheet, { backgroundColor: colors.surfaceCard }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Share your feedback
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Text input */}
          <TextInput
            style={[
              styles.input,
              {
                color: colors.textPrimary,
                backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                borderColor: colors.separator,
              },
            ]}
            placeholder="What could be better about this goal?"
            placeholderTextColor={colors.textSecondary}
            value={feedbackText}
            onChangeText={setFeedbackText}
            multiline
            textAlignVertical="top"
            maxLength={500}
            autoFocus
          />

          {/* Context */}
          {goal && (
            <View style={styles.contextRow}>
              <Text style={[styles.contextLabel, { color: colors.textSecondary }]}>
                Goal: {goal.goalStatement}
              </Text>
              <Text style={[styles.contextLabel, { color: colors.textTertiary }]}>
                Engagement: {goal.nudgeEngagement}
              </Text>
            </View>
          )}

          {/* Send button */}
          <TouchableOpacity
            onPress={handleSend}
            disabled={!feedbackText.trim() || isSending}
            style={[
              styles.sendButton,
              {
                backgroundColor: feedbackText.trim() ? colors.accent : colors.separator,
                opacity: isSending ? 0.6 : 1,
              },
            ]}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <PaperPlaneTilt size={16} color="#FFFFFF" weight="fill" />
                <Text style={styles.sendText}>Send Feedback</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 34, // safe area
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  input: {
    height: 100,
    borderRadius: 10,
    borderWidth: 0.5,
    padding: 12,
    fontSize: 15,
  },
  contextRow: {
    marginTop: 8,
    gap: 2,
  },
  contextLabel: {
    fontSize: 12,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
  },
  sendText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
