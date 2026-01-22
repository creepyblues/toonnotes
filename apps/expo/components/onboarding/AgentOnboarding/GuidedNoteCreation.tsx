/**
 * GuidedNoteCreation - Instructions + Create Note
 *
 * Shows agent-specific instructions and allows user to create a real note.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ArrowLeft, PaperPlaneTilt } from 'phosphor-react-native';

import { AgentId } from '@/types';
import { useTheme } from '@/src/theme';
import { AGENT_CONFIGS } from '@/services/agents/Agent';
import {
  GUIDED_NOTE_INSTRUCTIONS,
  AGENT_DESCRIPTIONS,
  ONBOARDING_TEXT,
  getAgentEmoji,
  getAgentColor,
  getAgentName,
} from '@/constants/agentOnboardingContent';

interface GuidedNoteCreationProps {
  agentId: AgentId;
  onNoteCreated: (noteTitle: string) => void;
  onBack: () => void;
}

export function GuidedNoteCreation({
  agentId,
  onNoteCreated,
  onBack,
}: GuidedNoteCreationProps) {
  const { colors, isDark } = useTheme();
  const [noteText, setNoteText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const instruction = GUIDED_NOTE_INSTRUCTIONS[agentId];
  const agentColor = getAgentColor(agentId);
  const agentEmoji = getAgentEmoji(agentId);
  const agentName = getAgentName(agentId);
  const agentDescription = AGENT_DESCRIPTIONS[agentId];

  const canSubmit = noteText.trim().length > 0;

  // Focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    if (canSubmit) {
      onNoteCreated(noteText.trim());
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Back Button */}
      <Animated.View entering={FadeIn.delay(100)}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ArrowLeft size={24} color={colors.textSecondary} weight="bold" />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.content}>
        {/* Agent Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.agentHeader}>
          <View style={[styles.emojiContainer, { backgroundColor: agentColor + '20' }]}>
            <Text style={styles.emoji}>{agentEmoji}</Text>
          </View>
          <Text style={[styles.agentName, { color: agentColor }]}>
            {agentName}
          </Text>
        </Animated.View>

        {/* Description */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {agentDescription}
          </Text>
        </Animated.View>

        {/* Instruction */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.instructionContainer}>
          <Text style={[styles.instruction, { color: colors.textPrimary }]}>
            {instruction.instruction}
          </Text>
          <View
            style={[
              styles.exampleCard,
              { backgroundColor: isDark ? '#1F1F1F' : '#F9FAFB' },
            ]}
          >
            <Text style={[styles.exampleText, { color: colors.textSecondary }]}>
              "{instruction.exampleNote}"
            </Text>
          </View>
        </Animated.View>

        {/* Input */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              {
                backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
                color: colors.textPrimary,
                borderColor: isDark ? '#374151' : '#E5E7EB',
              },
            ]}
            placeholder={instruction.placeholder}
            placeholderTextColor={colors.textTertiary}
            value={noteText}
            onChangeText={setNoteText}
            multiline
            maxLength={200}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            blurOnSubmit
            accessibilityLabel={instruction.placeholder}
          />

          {/* Create Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={[
              styles.createButton,
              {
                backgroundColor: canSubmit ? agentColor : isDark ? '#374151' : '#E5E7EB',
              },
            ]}
            accessibilityLabel="Create note"
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSubmit }}
          >
            <Text
              style={[
                styles.createButtonText,
                { color: canSubmit ? '#FFFFFF' : colors.textTertiary },
              ]}
            >
              {ONBOARDING_TEXT.guidedCreation.createButton}
            </Text>
            <PaperPlaneTilt
              size={18}
              color={canSubmit ? '#FFFFFF' : colors.textTertiary}
              weight="fill"
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    padding: 16,
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  agentHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  emojiContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 36,
  },
  agentName: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  instructionContainer: {
    marginBottom: 24,
  },
  instruction: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  exampleCard: {
    padding: 16,
    borderRadius: 12,
  },
  exampleText: {
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  inputContainer: {
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GuidedNoteCreation;
