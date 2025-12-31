/**
 * LabelPresetPicker - Label preset selection UI for design creation
 *
 * Displays 20 label-based design presets organized by category.
 * Used in the design creation flow and note editor for auto-applying designs.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Check, Sparkle } from 'phosphor-react-native';
import {
  LabelPreset,
  LabelPresetId,
  LabelCategory,
  LABEL_PRESET_LIST,
  PRESETS_BY_CATEGORY,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
} from '@/constants/labelPresets';

// Also export old types for backward compatibility
import { DesignTheme, ThemeId } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2; // 2 columns with padding

// ============================================
// Main Label Preset Picker (Full Grid)
// ============================================

interface LabelPresetPickerProps {
  selectedPreset: LabelPresetId | null;
  onSelectPreset: (preset: LabelPreset) => void;
  isDark?: boolean;
}

export function LabelPresetPicker({
  selectedPreset,
  onSelectPreset,
  isDark = false,
}: LabelPresetPickerProps) {
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const textColor = isDark ? 'text-white' : 'text-gray-900';

  return (
    <View className={`flex-1 ${bgColor}`}>
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <Text className={`text-lg font-semibold ${textColor}`}>
          Choose a Label Style
        </Text>
        <Text className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Each label has a unique design that auto-applies
        </Text>
      </View>

      {/* Preset Grid by Category */}
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {CATEGORY_ORDER.map((category) => (
          <View key={category} className="mb-6">
            {/* Category Header */}
            <View className="flex-row items-center mb-3">
              <View
                style={{
                  width: 4,
                  height: 16,
                  borderRadius: 2,
                  backgroundColor: CATEGORY_COLORS[category],
                  marginRight: 8,
                }}
              />
              <Text className={`font-semibold ${textColor}`}>
                {CATEGORY_LABELS[category]}
              </Text>
            </View>

            {/* Presets in this category */}
            <View className="flex-row flex-wrap justify-between">
              {PRESETS_BY_CATEGORY[category].map((preset) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  isSelected={selectedPreset === preset.id}
                  onSelect={() => onSelectPreset(preset)}
                  isDark={isDark}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ============================================
// Preset Card Component
// ============================================

interface PresetCardProps {
  preset: LabelPreset;
  isSelected: boolean;
  onSelect: () => void;
  isDark: boolean;
}

function PresetCard({ preset, isSelected, onSelect, isDark }: PresetCardProps) {
  const borderColor = isSelected
    ? 'border-sky-500'
    : isDark
    ? 'border-gray-700'
    : 'border-gray-200';

  // Build gradient background style if applicable
  const backgroundStyle =
    preset.bgStyle === 'gradient' && preset.bgGradient
      ? { backgroundColor: preset.bgGradient[0] }
      : { backgroundColor: preset.colors.bg };

  return (
    <TouchableOpacity
      onPress={onSelect}
      className={`mb-3 rounded-2xl border-2 overflow-hidden ${borderColor}`}
      style={{ width: CARD_WIDTH }}
      activeOpacity={0.8}
    >
      {/* Preset Preview */}
      <View
        style={{
          ...backgroundStyle,
          height: 90,
        }}
        className="relative items-center justify-center"
      >
        {/* Icon */}
        <Text style={{ fontSize: 32 }}>{preset.icon}</Text>

        {/* Selected indicator */}
        {isSelected && (
          <View className="absolute top-2 right-2 bg-sky-500 rounded-full p-1">
            <Check size={14} color="#FFFFFF" />
          </View>
        )}

        {/* Sticker type indicator */}
        {preset.stickerType !== 'none' && (
          <View
            className="absolute bottom-2 right-2"
            style={{ opacity: 0.7 }}
          >
            <Text style={{ fontSize: 16 }}>{preset.stickerEmoji}</Text>
          </View>
        )}

        {/* Category badge */}
        <View
          className="absolute top-2 left-2 px-2 py-0.5 rounded-full"
          style={{ backgroundColor: CATEGORY_COLORS[preset.category] }}
        >
          <Text className="text-white text-[9px] font-medium">
            {CATEGORY_LABELS[preset.category]}
          </Text>
        </View>
      </View>

      {/* Preset Info */}
      <View
        className="p-3"
        style={{
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        }}
      >
        <View className="flex-row items-center">
          <Text
            className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
            numberOfLines={1}
          >
            #{preset.name}
          </Text>
        </View>
        <Text
          className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          numberOfLines={1}
        >
          {preset.description}
        </Text>

        {/* Color palette preview */}
        <View className="flex-row mt-2 space-x-1">
          {[preset.colors.bg, preset.colors.primary, preset.colors.text].map(
            (color, index) => (
              <View
                key={index}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  backgroundColor: color,
                  borderWidth: 1,
                  borderColor: isDark ? '#374151' : '#E5E7EB',
                }}
              />
            )
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ============================================
// Compact Label Preset Selector (Horizontal Scroll)
// ============================================

interface CompactLabelPresetPickerProps {
  selectedPreset: LabelPresetId | null;
  onSelectPreset: (preset: LabelPreset) => void;
  isDark?: boolean;
  showCategoryDots?: boolean;
}

export function CompactLabelPresetPicker({
  selectedPreset,
  onSelectPreset,
  isDark = false,
  showCategoryDots = true,
}: CompactLabelPresetPickerProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16 }}
    >
      {LABEL_PRESET_LIST.map((preset) => (
        <TouchableOpacity
          key={preset.id}
          onPress={() => onSelectPreset(preset)}
          className={`mr-3 px-4 py-2 rounded-full flex-row items-center ${
            selectedPreset === preset.id
              ? 'bg-sky-500'
              : isDark
              ? 'bg-gray-800'
              : 'bg-gray-100'
          }`}
        >
          {showCategoryDots && (
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor:
                  selectedPreset === preset.id
                    ? '#FFFFFF'
                    : CATEGORY_COLORS[preset.category],
                marginRight: 6,
              }}
            />
          )}
          <Text style={{ fontSize: 14 }}>{preset.icon}</Text>
          <Text
            className={`ml-1.5 font-medium ${
              selectedPreset === preset.id
                ? 'text-white'
                : isDark
                ? 'text-gray-300'
                : 'text-gray-700'
            }`}
          >
            {preset.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ============================================
// Backward Compatibility Exports
// (Keep old API working during transition)
// ============================================

interface ThemePickerProps {
  selectedTheme: ThemeId | null;
  onSelectTheme: (theme: DesignTheme) => void;
  onSurpriseMe?: () => void;
  isDark?: boolean;
}

// Legacy ThemePicker - redirects to LabelPresetPicker
export function ThemePicker({
  selectedTheme,
  onSelectTheme,
  isDark = false,
}: ThemePickerProps) {
  // Map old theme IDs to new preset IDs for backward compat
  const themeToPresetMap: Record<string, LabelPresetId> = {
    ghibli: 'inspiration',
    manga: 'brainstorm',
    webtoon: 'draft',
    shoujo: 'memory',
    shonen: 'goals',
    kawaii: 'wishlist',
    vintage: 'journal',
  };

  const mappedPreset = selectedTheme
    ? themeToPresetMap[selectedTheme]
    : null;

  return (
    <LabelPresetPicker
      selectedPreset={mappedPreset}
      onSelectPreset={(preset) => {
        // Create a mock DesignTheme from the preset for backward compat
        const mockTheme: DesignTheme = {
          id: preset.id as any,
          name: preset.name,
          emoji: preset.icon,
          description: preset.description,
          colors: {
            background: preset.colors.bg,
            title: preset.colors.text,
            body: preset.colors.text,
            accent: preset.colors.primary,
          },
          background: {
            style: preset.bgStyle === 'gradient' ? 'gradient' : 'solid',
            defaultOpacity: 0.15,
          },
          typography: {
            titleStyle:
              preset.fontStyle === 'serif'
                ? 'serif'
                : preset.fontStyle === 'handwritten'
                ? 'handwritten'
                : 'sans-serif',
            vibe: 'modern',
          },
          accents: {
            type: 'none',
            positions: ['corners'],
          },
          stickerHint: {
            artStyle: preset.artStyle,
            mood: 'playful',
            defaultPosition: preset.stickerPosition,
            defaultScale: 'medium',
          },
          aiPromptHints: preset.aiPromptHints,
        };
        onSelectTheme(mockTheme);
      }}
      isDark={isDark}
    />
  );
}

interface CompactThemePickerProps {
  selectedTheme: ThemeId | null;
  onSelectTheme: (theme: DesignTheme) => void;
  isDark?: boolean;
}

// Legacy CompactThemePicker - redirects to CompactLabelPresetPicker
export function CompactThemePicker({
  selectedTheme,
  onSelectTheme,
  isDark = false,
}: CompactThemePickerProps) {
  const themeToPresetMap: Record<string, LabelPresetId> = {
    ghibli: 'inspiration',
    manga: 'brainstorm',
    webtoon: 'draft',
    shoujo: 'memory',
    shonen: 'goals',
    kawaii: 'wishlist',
    vintage: 'journal',
  };

  const mappedPreset = selectedTheme
    ? themeToPresetMap[selectedTheme]
    : null;

  return (
    <CompactLabelPresetPicker
      selectedPreset={mappedPreset}
      onSelectPreset={(preset) => {
        // Create a mock DesignTheme from the preset for backward compat
        const mockTheme: DesignTheme = {
          id: preset.id as any,
          name: preset.name,
          emoji: preset.icon,
          description: preset.description,
          colors: {
            background: preset.colors.bg,
            title: preset.colors.text,
            body: preset.colors.text,
            accent: preset.colors.primary,
          },
          background: {
            style: preset.bgStyle === 'gradient' ? 'gradient' : 'solid',
            defaultOpacity: 0.15,
          },
          typography: {
            titleStyle:
              preset.fontStyle === 'serif'
                ? 'serif'
                : preset.fontStyle === 'handwritten'
                ? 'handwritten'
                : 'sans-serif',
            vibe: 'modern',
          },
          accents: {
            type: 'none',
            positions: ['corners'],
          },
          stickerHint: {
            artStyle: preset.artStyle,
            mood: 'playful',
            defaultPosition: preset.stickerPosition,
            defaultScale: 'medium',
          },
          aiPromptHints: preset.aiPromptHints,
        };
        onSelectTheme(mockTheme);
      }}
      isDark={isDark}
    />
  );
}

export default LabelPresetPicker;
