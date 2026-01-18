/**
 * LabelSuggestionSheet - Bottom sheet for medium-confidence label suggestions
 *
 * Shows label suggestions that need user confirmation before applying.
 * Includes both matched existing labels and suggested new labels.
 *
 * Actions:
 * - Select/deselect suggestions
 * - Apply selected labels
 * - Skip all (assigns "uncategorized")
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import {
  useLabelSuggestionStore,
  useNoteStore,
  PendingSuggestion,
} from '@/stores';
import {
  Tag,
  Check,
  Plus,
  X,
  Sparkle,
  WarningCircle,
  CheckCircle,
} from 'phosphor-react-native';
import { useTheme } from '@/src/theme';
import { getPresetForLabel, CATEGORY_COLORS, LabelCategory } from '@/constants/labelPresets';
import { Analytics } from '@/services/firebaseAnalytics';

interface LabelSuggestionSheetProps {
  noteId: string;
  onClose: () => void;
  onApply: (labelNames: string[], newLabels: string[]) => void;
  onSkip: () => void;
}

export function LabelSuggestionSheet({
  noteId,
  onClose,
  onApply,
  onSkip,
}: LabelSuggestionSheetProps) {
  const { colors, isDark } = useTheme();

  const suggestions = useLabelSuggestionStore((state) =>
    state.getSuggestionsForNote(noteId)
  );
  const clearSuggestions = useLabelSuggestionStore((state) => state.clearSuggestions);

  // Track when suggestions are shown (on mount)
  React.useEffect(() => {
    suggestions.forEach((s) => {
      Analytics.labelSuggestionShown(s.labelName, noteId);
    });
  }, []);

  // Track selected suggestions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(suggestions.map((s) => s.id))
  );

  // Separate matched vs new labels
  const { matchedLabels, newLabels } = useMemo(() => {
    return {
      matchedLabels: suggestions.filter((s) => !s.isNewLabel),
      newLabels: suggestions.filter((s) => s.isNewLabel),
    };
  }, [suggestions]);

  const toggleSelection = useCallback((suggestionId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(suggestionId)) {
        next.delete(suggestionId);
      } else {
        next.add(suggestionId);
      }
      return next;
    });
  }, []);

  const handleApply = useCallback(() => {
    const selectedSuggestions = suggestions.filter((s) => selectedIds.has(s.id));
    const existingLabels = selectedSuggestions
      .filter((s) => !s.isNewLabel)
      .map((s) => s.labelName);
    const newLabelNames = selectedSuggestions
      .filter((s) => s.isNewLabel)
      .map((s) => s.labelName);

    // Track each accepted suggestion
    selectedSuggestions.forEach((s) => {
      Analytics.labelSuggestionAccepted(s.labelName, noteId);
    });

    clearSuggestions(noteId);
    onApply(existingLabels, newLabelNames);
  }, [suggestions, selectedIds, noteId, clearSuggestions, onApply]);

  const handleSkip = useCallback(() => {
    // Track declined suggestions
    suggestions.forEach((s) => {
      Analytics.labelSuggestionDeclined(s.labelName, noteId);
    });

    clearSuggestions(noteId);
    onSkip();
  }, [noteId, clearSuggestions, onSkip]);

  const handleClose = useCallback(() => {
    clearSuggestions(noteId);
    onClose();
  }, [noteId, clearSuggestions, onClose]);

  const selectedCount = selectedIds.size;
  const hasSelection = selectedCount > 0;

  return (
    <Modal
      visible
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Sparkle size={24} color="#6C5CE7" weight="fill" />
              <Text
                style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1F2937' }]}
              >
                Suggested Labels
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              accessibilityLabel="Close suggestions"
              accessibilityRole="button"
            >
              <X size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>

          {/* Drag indicator */}
          <View style={styles.dragIndicator}>
            <View
              style={[
                styles.dragHandle,
                { backgroundColor: isDark ? '#4B5563' : '#D1D5DB' },
              ]}
            />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Matched Labels Section */}
            {matchedLabels.length > 0 && (
              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: isDark ? '#9CA3AF' : '#6B7280' },
                  ]}
                >
                  Matching Labels
                </Text>
                {matchedLabels.map((suggestion) => (
                  <SuggestionRow
                    key={suggestion.id}
                    suggestion={suggestion}
                    isSelected={selectedIds.has(suggestion.id)}
                    onToggle={() => toggleSelection(suggestion.id)}
                    isDark={isDark}
                  />
                ))}
              </View>
            )}

            {/* New Labels Section */}
            {newLabels.length > 0 && (
              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: isDark ? '#9CA3AF' : '#6B7280' },
                  ]}
                >
                  Suggested New Labels
                </Text>
                <View
                  style={[
                    styles.newLabelWarning,
                    { backgroundColor: isDark ? '#374151' : '#FEF3C7' },
                  ]}
                >
                  <WarningCircle size={16} color="#F59E0B" />
                  <Text
                    style={[
                      styles.warningText,
                      { color: isDark ? '#FCD34D' : '#92400E' },
                    ]}
                  >
                    New labels will be created
                  </Text>
                </View>
                {newLabels.map((suggestion) => (
                  <SuggestionRow
                    key={suggestion.id}
                    suggestion={suggestion}
                    isSelected={selectedIds.has(suggestion.id)}
                    onToggle={() => toggleSelection(suggestion.id)}
                    isDark={isDark}
                  />
                ))}
              </View>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={[styles.actions, { borderTopColor: isDark ? '#374151' : '#E5E7EB' }]}>
            <TouchableOpacity
              onPress={handleSkip}
              style={[
                styles.skipButton,
                { backgroundColor: isDark ? '#374151' : '#F3F4F6' },
              ]}
              accessibilityLabel="Skip all suggestions"
              accessibilityRole="button"
            >
              <Text
                style={[styles.skipButtonText, { color: isDark ? '#D1D5DB' : '#6B7280' }]}
              >
                Skip All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleApply}
              disabled={!hasSelection}
              style={[
                styles.applyButton,
                { opacity: hasSelection ? 1 : 0.5 },
              ]}
              accessibilityLabel={`Apply ${selectedCount} selected labels`}
              accessibilityRole="button"
            >
              <CheckCircle size={18} color="#FFFFFF" weight="bold" />
              <Text style={styles.applyButtonText}>
                Apply {selectedCount > 0 ? `(${selectedCount})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ============================================
// Suggestion Row Component
// ============================================

interface SuggestionRowProps {
  suggestion: PendingSuggestion;
  isSelected: boolean;
  onToggle: () => void;
  isDark: boolean;
}

function SuggestionRow({
  suggestion,
  isSelected,
  onToggle,
  isDark,
}: SuggestionRowProps) {
  const preset = getPresetForLabel(suggestion.labelName);
  const categoryColor = suggestion.category
    ? CATEGORY_COLORS[suggestion.category as LabelCategory]
    : preset
    ? CATEGORY_COLORS[preset.category]
    : '#6B7280';

  const confidencePercent = Math.round(suggestion.confidence * 100);

  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[
        styles.suggestionRow,
        {
          backgroundColor: isSelected
            ? isDark
              ? '#374151'
              : '#EDE9FE'
            : isDark
            ? '#1F2937'
            : '#FFFFFF',
          borderColor: isSelected ? '#6C5CE7' : isDark ? '#374151' : '#E5E7EB',
        },
      ]}
      accessibilityLabel={`${suggestion.labelName}, ${confidencePercent}% confidence`}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
    >
      <View style={styles.suggestionLeft}>
        {/* Selection indicator */}
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: isSelected ? '#6C5CE7' : 'transparent',
              borderColor: isSelected ? '#6C5CE7' : isDark ? '#4B5563' : '#D1D5DB',
            },
          ]}
        >
          {isSelected && <Check size={14} color="#FFFFFF" weight="bold" />}
        </View>

        {/* Label info */}
        <View style={styles.labelInfo}>
          <View style={styles.labelNameRow}>
            {suggestion.isNewLabel ? (
              <Plus size={14} color={categoryColor} weight="bold" />
            ) : (
              <Tag size={14} color={categoryColor} weight="bold" />
            )}
            <Text
              style={[styles.labelName, { color: isDark ? '#FFFFFF' : '#1F2937' }]}
            >
              #{suggestion.labelName}
            </Text>
            {suggestion.isNewLabel && (
              <View style={[styles.newBadge, { backgroundColor: categoryColor }]}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            )}
          </View>
          <Text
            style={[styles.labelReason, { color: isDark ? '#9CA3AF' : '#6B7280' }]}
            numberOfLines={2}
          >
            {suggestion.reason}
          </Text>
        </View>
      </View>

      {/* Confidence indicator */}
      <View style={styles.confidenceContainer}>
        <Text
          style={[
            styles.confidenceText,
            {
              color:
                confidencePercent >= 80
                  ? '#10B981'
                  : confidencePercent >= 60
                  ? '#F59E0B'
                  : '#6B7280',
            },
          ]}
        >
          {confidencePercent}%
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 34, // Safe area
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  dragIndicator: {
    alignItems: 'center',
    paddingBottom: 12,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  newLabelWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  warningText: {
    fontSize: 12,
    fontWeight: '500',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  suggestionLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  labelInfo: {
    flex: 1,
  },
  labelNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  labelName: {
    fontSize: 15,
    fontWeight: '600',
  },
  newBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  labelReason: {
    fontSize: 13,
    lineHeight: 18,
  },
  confidenceContainer: {
    alignItems: 'flex-end',
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
    borderTopWidth: 1,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#6C5CE7',
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default LabelSuggestionSheet;
