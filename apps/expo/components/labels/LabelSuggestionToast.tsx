/**
 * LabelSuggestionToast - Label suggestion toast with selectable labels
 *
 * Shows a toast notification with suggested labels as selectable chips.
 * User can toggle individual labels and confirm selection.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useLabelSuggestionStore, useNoteStore } from '@/stores';
import { Tag, X, Check, Hash, Plus, WarningCircle } from 'phosphor-react-native';
import { Linking } from 'react-native';
import { useTheme } from '@/src/theme';

const ANIMATION_DURATION_MS = 200;

interface LabelSuggestionToastProps {
  onComplete?: () => void;
}

export function LabelSuggestionToast({ onComplete }: LabelSuggestionToastProps) {
  const { isDark } = useTheme();

  const activeToast = useLabelSuggestionStore((state) => state.activeToast);
  const hideAutoApplyToast = useLabelSuggestionStore((state) => state.hideAutoApplyToast);

  const addLabelToNote = useNoteStore((state) => state.addLabelToNote);

  const [scale] = useState(new Animated.Value(0.9));
  const [opacity] = useState(new Animated.Value(0));

  // Track which labels are selected (all selected by default)
  const [selectedLabels, setSelectedLabels] = useState<Set<string>>(new Set());

  // Custom label input state
  const [inputValue, setInputValue] = useState('');
  const [customLabels, setCustomLabels] = useState<string[]>([]);

  // Initialize selected labels when toast appears
  useEffect(() => {
    if (activeToast && !activeToast.undone) {
      setSelectedLabels(new Set(activeToast.labels));
      setCustomLabels([]);
      setInputValue('');
    }
  }, [activeToast]);

  // Auto-dismiss error toast after 5 seconds
  useEffect(() => {
    if (activeToast?.error && !activeToast.undone) {
      const timeUntilExpiry = activeToast.expiresAt - Date.now();
      const timeout = setTimeout(() => {
        hideAutoApplyToast();
        onComplete?.();
      }, Math.max(0, timeUntilExpiry));

      return () => clearTimeout(timeout);
    }
  }, [activeToast, hideAutoApplyToast, onComplete]);

  // Animate toast in/out
  useEffect(() => {
    if (activeToast && !activeToast.undone) {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: ANIMATION_DURATION_MS,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: ANIMATION_DURATION_MS,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.9,
          duration: ANIMATION_DURATION_MS,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: ANIMATION_DURATION_MS,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [activeToast]);

  const toggleLabel = useCallback((label: string) => {
    setSelectedLabels((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }, []);

  // Add a custom label from input
  const handleAddCustomLabel = useCallback(() => {
    const trimmed = inputValue.trim().toLowerCase();
    if (!trimmed) return;

    // Check for duplicates in both AI suggestions and custom labels
    const allLabels = [...(activeToast?.labels || []), ...customLabels];
    if (allLabels.some(l => l.toLowerCase() === trimmed)) return;

    // Add to custom labels list and auto-select
    setCustomLabels(prev => [...prev, trimmed]);
    setSelectedLabels(prev => new Set([...prev, trimmed]));
    setInputValue('');
  }, [inputValue, activeToast?.labels, customLabels]);

  const handleApply = useCallback(() => {
    if (activeToast?.noteId && selectedLabels.size > 0) {
      selectedLabels.forEach((label) => {
        addLabelToNote(activeToast.noteId, label);
      });
    }
    hideAutoApplyToast();
    onComplete?.();
  }, [activeToast, selectedLabels, addLabelToNote, hideAutoApplyToast, onComplete]);

  const handleDismiss = useCallback(() => {
    hideAutoApplyToast();
    onComplete?.();
  }, [hideAutoApplyToast, onComplete]);

  // Handler for "Report this issue" link
  const handleReportIssue = useCallback(() => {
    const errorDetails = activeToast?.error;
    const errorCode = errorDetails?.code ? `Code: ${errorDetails.code}` : 'No code';
    const errorMessage = errorDetails?.message || 'Unknown error';
    const issueUrl = `https://github.com/anthropics/claude-code/issues/new?title=${encodeURIComponent('[ToonNotes] Auto-labeling API error')}&body=${encodeURIComponent(`## Error Details\n- Message: ${errorMessage}\n- ${errorCode}\n\n## Steps to Reproduce\n1. Edit a note with content\n2. Navigate back from the note editor\n3. Error toast appears\n\n## Expected Behavior\nAuto-labeling should suggest labels for the note.\n\n## Additional Context\n(Please add any additional context here)`)}`;
    Linking.openURL(issueUrl);
  }, [activeToast?.error]);

  if (!activeToast || activeToast.undone) {
    return null;
  }

  // Error state rendering
  if (activeToast.error) {
    const errorCode = activeToast.error.code;
    const errorMessage = activeToast.error.message;
    const errorDetail = errorCode ? `${errorMessage} (${errorCode})` : errorMessage;

    return (
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: isDark ? '#292524' : '#FFFFFF',
              transform: [{ scale }],
              opacity,
              shadowColor: '#000000',
            },
          ]}
        >
          <View style={styles.content}>
            {/* Header row with warning icon */}
            <View style={styles.headerRow}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? '#78350F' : '#FEF3C7' }]}>
                <WarningCircle size={18} color={isDark ? '#FBBF24' : '#D97706'} weight="bold" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#1F2937' }]}>
                  Auto-labeling unavailable
                </Text>
                <Text style={[styles.errorDetail, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  {errorDetail}
                </Text>
              </View>

              {/* Dismiss button only */}
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={handleDismiss}
                  style={[
                    styles.dismissButton,
                    { backgroundColor: isDark ? '#374151' : '#F3F4F6' },
                  ]}
                  accessibilityLabel="Dismiss"
                  accessibilityRole="button"
                >
                  <X size={18} color={isDark ? '#9CA3AF' : '#6B7280'} weight="bold" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Report issue link */}
            <TouchableOpacity
              onPress={handleReportIssue}
              style={styles.reportLinkRow}
              accessibilityLabel="Report this issue"
              accessibilityRole="link"
            >
              <Text style={[styles.reportLink, { color: isDark ? '#FBBF24' : '#D97706' }]}>
                Report this issue
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  }

  // Normal label suggestion toast
  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: isDark ? '#292524' : '#FFFFFF',
            transform: [{ scale }],
            opacity,
            shadowColor: '#000000',
          },
        ]}
      >
      <View style={styles.content}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={[styles.iconContainer, { backgroundColor: isDark ? '#367272' : '#C2E4E3' }]}>
            <Tag size={18} color={isDark ? '#70BFBD' : '#4C9C9B'} weight="bold" />
          </View>
          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#1F2937' }]}>
            Add labels?
          </Text>

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={handleApply}
              style={[
                styles.applyButton,
                { backgroundColor: isDark ? '#70BFBD' : '#4C9C9B' },
                selectedLabels.size === 0 && styles.applyButtonDisabled,
              ]}
              disabled={selectedLabels.size === 0}
              accessibilityLabel="Apply selected labels"
              accessibilityRole="button"
            >
              <Check size={18} color="#FFFFFF" weight="bold" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDismiss}
              style={[
                styles.dismissButton,
                { backgroundColor: isDark ? '#374151' : '#F3F4F6' },
              ]}
              accessibilityLabel="Dismiss"
              accessibilityRole="button"
            >
              <X size={18} color={isDark ? '#9CA3AF' : '#6B7280'} weight="bold" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Selectable label chips (AI suggestions + custom labels) */}
        <View style={styles.labelsRow}>
          {[...activeToast.labels, ...customLabels].map((label) => {
            const isSelected = selectedLabels.has(label);
            const isCustom = customLabels.includes(label);
            return (
              <TouchableOpacity
                key={label}
                onPress={() => toggleLabel(label)}
                style={[
                  styles.labelChip,
                  isSelected
                    ? { backgroundColor: isDark ? '#70BFBD' : '#4C9C9B' }
                    : { backgroundColor: isDark ? '#374151' : '#F3F4F6' },
                ]}
                accessibilityLabel={`${label}, ${isSelected ? 'selected' : 'not selected'}${isCustom ? ', custom' : ''}`}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
              >
                <Text
                  style={[
                    styles.labelText,
                    isSelected
                      ? styles.labelTextSelected
                      : { color: isDark ? '#9CA3AF' : '#6B7280' },
                  ]}
                >
                  #{label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom label input */}
        <View style={styles.inputRow}>
          <View style={[styles.inputContainer, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
            <Hash size={14} color={isDark ? '#9CA3AF' : '#6B7280'} weight="regular" />
            <TextInput
              style={[styles.input, { color: isDark ? '#FFFFFF' : '#1F2937' }]}
              placeholder="Add custom label..."
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              value={inputValue}
              onChangeText={setInputValue}
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={handleAddCustomLabel}
              returnKeyType="done"
              accessibilityLabel="Custom label input"
            />
            {inputValue.trim().length > 0 && (
              <TouchableOpacity
                onPress={handleAddCustomLabel}
                style={[styles.addInputButton, { backgroundColor: isDark ? '#70BFBD' : '#4C9C9B' }]}
                accessibilityLabel="Add custom label"
                accessibilityRole="button"
              >
                <Plus size={16} color="#FFFFFF" weight="bold" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  container: {
    width: '90%',
    maxWidth: 360,
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  errorDetail: {
    fontSize: 13,
    marginTop: 2,
  },
  reportLinkRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  reportLink: {
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  applyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: '#99D1D0',
    opacity: 0.5,
  },
  dismissButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  labelChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  labelChipSelected: {
    // Color set inline based on isDark
  },
  labelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  labelTextSelected: {
    color: '#FFFFFF',
  },
  inputRow: {
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  input: {
    flex: 1,
    marginLeft: 6,
    fontSize: 14,
    paddingVertical: 0,
  },
  addInputButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LabelSuggestionToast;
