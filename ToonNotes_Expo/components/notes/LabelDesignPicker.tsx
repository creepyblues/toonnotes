/**
 * LabelDesignPicker - Multi-label design selector for notes
 *
 * Shows all labels with presets that are attached to a note,
 * allowing the user to choose which label's design to apply.
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Check, Sparkle } from 'phosphor-react-native';
import {
  LabelPreset,
  getPresetForLabel,
  CATEGORY_COLORS,
} from '@/constants/labelPresets';

interface LabelWithPreset {
  labelName: string;
  preset: LabelPreset;
}

interface LabelDesignPickerProps {
  /** Array of label names attached to the note */
  noteLabels: string[];
  /** Currently active design label (the one whose design is applied) */
  activeDesignLabel?: string;
  /** Callback when a label design is selected */
  onSelectLabelDesign: (labelName: string, preset: LabelPreset) => void;
  /** Whether dark mode is enabled */
  isDark?: boolean;
  /** Show hint text below the picker */
  showHint?: boolean;
}

/**
 * Extracts labels with presets from a list of label names
 */
export function getLabelsWithPresets(labelNames: string[]): LabelWithPreset[] {
  return labelNames
    .map((labelName) => {
      const preset = getPresetForLabel(labelName);
      return preset ? { labelName, preset } : null;
    })
    .filter((item): item is LabelWithPreset => item !== null);
}

/**
 * LabelDesignPicker component
 *
 * Displays labels with design presets as selectable pills.
 * Shows category color dot, icon, and label name.
 * Active selection is highlighted with the preset's primary color.
 */
export function LabelDesignPicker({
  noteLabels,
  activeDesignLabel,
  onSelectLabelDesign,
  isDark = false,
  showHint = true,
}: LabelDesignPickerProps) {
  const labelsWithPresets = getLabelsWithPresets(noteLabels);

  if (labelsWithPresets.length === 0) {
    return null;
  }

  return (
    <View style={{ marginBottom: 20 }}>
      {/* Section Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: '#10B981',
            marginRight: 8,
          }}
        />
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: isDark ? '#A8A8B8' : '#6B6B7B',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          Label Designs
        </Text>
        <View
          style={{
            marginLeft: 8,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
            backgroundColor: isDark
              ? 'rgba(16, 185, 129, 0.2)'
              : 'rgba(16, 185, 129, 0.15)',
          }}
        >
          <Text style={{ fontSize: 10, color: '#10B981', fontWeight: '500' }}>
            FROM HASHTAGS
          </Text>
        </View>
      </View>

      {/* Label Pills */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {labelsWithPresets.map(({ labelName, preset }) => {
          const presetDesignId = `label-preset-${preset.id}`;
          const isActive =
            activeDesignLabel?.toLowerCase() === labelName.toLowerCase();

          return (
            <TouchableOpacity
              key={labelName}
              onPress={() => onSelectLabelDesign(labelName, preset)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 16,
                backgroundColor: isActive
                  ? preset.colors.primary
                  : isDark
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.05)',
                borderWidth: isActive ? 0 : 1,
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.08)',
              }}
            >
              {/* Category dot */}
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: isActive
                    ? '#FFFFFF'
                    : CATEGORY_COLORS[preset.category],
                  marginRight: 8,
                }}
              />
              {/* Icon */}
              <Text style={{ fontSize: 16, marginRight: 6 }}>{preset.icon}</Text>
              {/* Label name */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: isActive
                    ? '#FFFFFF'
                    : isDark
                    ? '#F5F3FF'
                    : '#1A1625',
                }}
              >
                #{labelName}
              </Text>
              {/* Active indicator */}
              {isActive && (
                <View style={{ marginLeft: 8 }}>
                  <Check size={14} color="#FFFFFF" weight="bold" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Hint text */}
      {showHint && (
        <Text
          style={{
            fontSize: 11,
            color: isDark ? '#6B6B7B' : '#9CA3AF',
            marginTop: 8,
          }}
        >
          Tap a hashtag to apply its design style
        </Text>
      )}
    </View>
  );
}

/**
 * Compact version of the picker for horizontal scroll
 */
interface CompactLabelDesignPickerProps {
  noteLabels: string[];
  activeDesignLabel?: string;
  onSelectLabelDesign: (labelName: string, preset: LabelPreset) => void;
  isDark?: boolean;
}

export function CompactLabelDesignPicker({
  noteLabels,
  activeDesignLabel,
  onSelectLabelDesign,
  isDark = false,
}: CompactLabelDesignPickerProps) {
  const labelsWithPresets = getLabelsWithPresets(noteLabels);

  if (labelsWithPresets.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16 }}
    >
      {labelsWithPresets.map(({ labelName, preset }) => {
        const isActive =
          activeDesignLabel?.toLowerCase() === labelName.toLowerCase();

        return (
          <TouchableOpacity
            key={labelName}
            onPress={() => onSelectLabelDesign(labelName, preset)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: isActive
                ? preset.colors.primary
                : isDark
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.05)',
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: isActive
                  ? '#FFFFFF'
                  : CATEGORY_COLORS[preset.category],
                marginRight: 6,
              }}
            />
            <Text style={{ fontSize: 14, marginRight: 4 }}>{preset.icon}</Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '500',
                color: isActive
                  ? '#FFFFFF'
                  : isDark
                  ? '#E0E0E0'
                  : '#4A4A4A',
              }}
            >
              {labelName}
            </Text>
            {isActive && (
              <Check
                size={12}
                color="#FFFFFF"
                weight="bold"
                style={{ marginLeft: 4 }}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export default LabelDesignPicker;
