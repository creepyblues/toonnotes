import React, { memo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { X, Plus, Hash, Sparkle } from 'phosphor-react-native';
import { useTheme } from '@/src/theme';
import type { Label } from '@/types';

// Label colors configuration
const LABEL_COLORS = {
  primary: {
    light: { background: 'rgba(60, 60, 67, 0.12)', text: '#3C3C43' },
    dark: { background: 'rgba(255, 255, 255, 0.16)', text: '#E5E5E7' },
  },
  secondary: {
    light: { background: 'rgba(142, 142, 147, 0.08)', text: '#8E8E93' },
    dark: { background: 'rgba(142, 142, 147, 0.12)', text: '#98989D' },
  },
};

const getLabelColor = (index: number, isDark: boolean) => {
  const colorType = index === 0 ? 'primary' : 'secondary';
  return isDark ? LABEL_COLORS[colorType].dark : LABEL_COLORS[colorType].light;
};

interface HashtagAutocompleteProps {
  noteLabels: string[];
  allLabels: Label[];
  hashtagQuery: string;
  analyzedSuggestions: string[];
  isAnalyzing: boolean;
  onSelectHashtag: (tagName: string) => void;
  onCreateHashtag: (tagName: string) => void;
  onRemoveLabel: (labelName: string) => void;
  onClose: () => void;
}

/**
 * Hashtag/Label autocomplete panel for the note editor
 */
export const HashtagAutocomplete = memo(function HashtagAutocomplete({
  noteLabels,
  allLabels,
  hashtagQuery,
  analyzedSuggestions,
  isAnalyzing,
  onSelectHashtag,
  onCreateHashtag,
  onRemoveLabel,
  onClose,
}: HashtagAutocompleteProps) {
  const { isDark, colors } = useTheme();
  const [inputValue, setInputValue] = useState('');

  // Filter labels based on query
  const filteredLabels = allLabels.filter((label) => {
    const query = (hashtagQuery || inputValue).toLowerCase();
    return (
      label.name.toLowerCase().includes(query) &&
      !noteLabels.includes(label.name.toLowerCase())
    );
  });

  // Handle creating and inserting a new hashtag
  const handleCreate = useCallback((tagName: string) => {
    onCreateHashtag(tagName);
    setInputValue('');
  }, [onCreateHashtag]);

  // Handle selecting an existing hashtag
  const handleSelect = useCallback((tagName: string) => {
    onSelectHashtag(tagName);
    setInputValue('');
  }, [onSelectHashtag]);

  // Handle submit from input field
  const handleSubmit = useCallback(() => {
    if (inputValue.trim()) {
      handleCreate(inputValue.trim());
    }
  }, [inputValue, handleCreate]);

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary, borderTopColor: colors.separator }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.separator }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Labels
        </Text>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Close labels panel"
        >
          <X size={20} color={colors.textSecondary} weight="regular" />
        </TouchableOpacity>
      </View>

      {/* Input field */}
      <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.backgroundTertiary : '#EFEFF0' }]}>
        <Hash size={16} color={colors.textSecondary} weight="regular" />
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          placeholder="Type label name..."
          placeholderTextColor={colors.textSecondary}
          value={inputValue}
          onChangeText={setInputValue}
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={handleSubmit}
          returnKeyType="done"
          accessibilityLabel="Label name input"
        />
        {inputValue.trim().length > 0 && (
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.addButton, { backgroundColor: colors.accent }]}
            accessibilityLabel="Add label"
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Current labels */}
      {noteLabels.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Current
          </Text>
          <View style={styles.labelRow}>
            {noteLabels.map((label, index) => {
              const labelColor = getLabelColor(index, isDark);
              return (
                <View
                  key={label}
                  style={[styles.currentLabel, { backgroundColor: labelColor.background }]}
                >
                  <Text style={[styles.labelText, { color: labelColor.text }]}>
                    #{label}
                  </Text>
                  <TouchableOpacity
                    onPress={() => onRemoveLabel(label)}
                    style={styles.removeButton}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel={`Remove ${label} label`}
                  >
                    <X size={14} color={colors.textSecondary} weight="bold" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Create new option */}
      {(hashtagQuery.length > 0 || inputValue.length > 0) && (
        <TouchableOpacity
          onPress={() => handleCreate(hashtagQuery || inputValue)}
          style={[styles.createOption, { backgroundColor: isDark ? colors.backgroundTertiary : '#EFEFF0' }]}
          accessibilityLabel={`Create new label ${hashtagQuery || inputValue}`}
        >
          <Plus size={16} color={colors.accent} weight="bold" />
          <Text style={[styles.createText, { color: colors.accent }]}>
            Create "{hashtagQuery || inputValue}"
          </Text>
        </TouchableOpacity>
      )}

      {/* AI Suggestions Section */}
      {(isAnalyzing || analyzedSuggestions.length > 0) && (
        <View>
          <View style={styles.aiHeader}>
            <Sparkle size={14} color={colors.accent} weight="fill" style={{ marginRight: 4 }} />
            <Text style={[styles.aiTitle, { color: colors.accent }]}>
              AI Suggestions
            </Text>
            {isAnalyzing && (
              <Text style={[styles.analyzingText, { color: colors.textSecondary }]}>
                Analyzing...
              </Text>
            )}
          </View>

          {analyzedSuggestions.length > 0 && (
            <View style={styles.suggestionsRow}>
              {analyzedSuggestions.map((labelName) => {
                const suggestionColor = getLabelColor(1, isDark);
                return (
                  <TouchableOpacity
                    key={labelName}
                    onPress={() => handleSelect(labelName)}
                    style={[
                      styles.suggestionLabel,
                      { backgroundColor: suggestionColor.background, borderColor: colors.accent },
                    ]}
                    accessibilityLabel={`Add ${labelName} label`}
                  >
                    <Text style={[styles.labelText, { color: suggestionColor.text }]}>
                      #{labelName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* All Labels Section */}
      {filteredLabels.length > 0 && (
        <Text style={[styles.sectionTitle, styles.allLabelsTitle, { color: colors.textSecondary }]}>
          All Labels
        </Text>
      )}

      {/* Labels list */}
      <ScrollView
        style={styles.labelsList}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.labelRow}>
          {filteredLabels
            .filter((label) => !analyzedSuggestions.includes(label.name))
            .map((label) => {
              const labelColor = getLabelColor(1, isDark);
              return (
                <TouchableOpacity
                  key={label.id}
                  onPress={() => handleSelect(label.name)}
                  style={[styles.availableLabel, { backgroundColor: labelColor.background }]}
                  accessibilityLabel={`Add ${label.name} label`}
                >
                  <Text style={[styles.labelText, { color: labelColor.text }]}>
                    #{label.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </View>

        {/* Empty state */}
        {filteredLabels.length === 0 && allLabels.length === 0 && !isAnalyzing && analyzedSuggestions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Type to create a new label
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderTopWidth: 1,
    maxHeight: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    paddingVertical: 0,
  },
  addButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  allLabelsTitle: {
    marginTop: 12,
    marginHorizontal: 16,
  },
  labelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  currentLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 8,
  },
  removeButton: {
    marginLeft: 6,
    padding: 2,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '500',
  },
  createOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 10,
  },
  createText: {
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 8,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  aiTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  analyzingText: {
    fontSize: 12,
    marginLeft: 8,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  suggestionLabel: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  availableLabel: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  labelsList: {
    maxHeight: 120,
    paddingHorizontal: 16,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default HashtagAutocomplete;
