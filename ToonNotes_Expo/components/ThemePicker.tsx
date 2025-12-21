/**
 * ThemePicker - Theme selection UI for design creation
 *
 * Displays anime-inspired themes as a carousel/grid with live preview.
 * Used in the design creation flow for style-first design.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Check, Shuffle, Sparkles } from 'lucide-react-native';
import { DesignTheme, ThemeId } from '@/types';
import { THEME_LIST, getRandomTheme } from '@/constants/themes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2; // 2 columns with padding

interface ThemePickerProps {
  selectedTheme: ThemeId | null;
  onSelectTheme: (theme: DesignTheme) => void;
  onSurpriseMe?: () => void;
  isDark?: boolean;
}

export function ThemePicker({
  selectedTheme,
  onSelectTheme,
  onSurpriseMe,
  isDark = false,
}: ThemePickerProps) {
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';

  const handleSurpriseMe = () => {
    const randomTheme = getRandomTheme();
    onSelectTheme(randomTheme);
    onSurpriseMe?.();
  };

  return (
    <View className={`flex-1 ${bgColor}`}>
      {/* Header with Surprise Me */}
      <View className="px-4 pt-4 pb-2 flex-row items-center justify-between">
        <Text className={`text-lg font-semibold ${textColor}`}>
          Choose Your Style
        </Text>
        <TouchableOpacity
          onPress={handleSurpriseMe}
          className="flex-row items-center px-3 py-2 rounded-full bg-gradient-to-r"
          style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
        >
          <Shuffle size={16} color={isDark ? '#D1D5DB' : '#6B7280'} />
          <Text className={`ml-1.5 text-sm font-medium ${textMuted}`}>
            Surprise Me
          </Text>
        </TouchableOpacity>
      </View>

      {/* Theme Grid */}
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="flex-row flex-wrap justify-between pt-2">
          {THEME_LIST.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isSelected={selectedTheme === theme.id}
              onSelect={() => onSelectTheme(theme)}
              isDark={isDark}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ============================================
// Theme Card Component
// ============================================

interface ThemeCardProps {
  theme: DesignTheme;
  isSelected: boolean;
  onSelect: () => void;
  isDark: boolean;
}

function ThemeCard({ theme, isSelected, onSelect, isDark }: ThemeCardProps) {
  const borderColor = isSelected
    ? 'border-sky-500'
    : isDark
    ? 'border-gray-700'
    : 'border-gray-200';

  return (
    <TouchableOpacity
      onPress={onSelect}
      className={`mb-3 rounded-2xl border-2 overflow-hidden ${borderColor}`}
      style={{ width: CARD_WIDTH }}
      activeOpacity={0.8}
    >
      {/* Theme Preview */}
      <View
        style={{
          backgroundColor: theme.colors.background,
          height: 100,
        }}
        className="relative items-center justify-center"
      >
        {/* Gradient overlay for gradient themes */}
        {theme.background.gradient && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.5,
              backgroundColor: theme.background.gradient.colors[1],
            }}
          />
        )}

        {/* Border preview */}
        <View
          style={{
            width: '70%',
            height: '60%',
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
            borderWidth: theme.border.thickness === 'thick' ? 3 : theme.border.thickness === 'medium' ? 2 : 1,
            borderRadius: theme.border.customRadius || 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
          className="items-center justify-center"
        >
          {/* Sample text */}
          <Text
            style={{ color: theme.colors.title, fontSize: 10, fontWeight: '600' }}
            numberOfLines={1}
          >
            Sample Note
          </Text>
          <Text
            style={{ color: theme.colors.body, fontSize: 8, marginTop: 2 }}
            numberOfLines={1}
          >
            Your content here
          </Text>
          {/* Accent dot */}
          <View
            style={{
              position: 'absolute',
              bottom: 6,
              right: 6,
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: theme.colors.accent,
            }}
          />
        </View>

        {/* Selected indicator */}
        {isSelected && (
          <View className="absolute top-2 right-2 bg-sky-500 rounded-full p-1">
            <Check size={14} color="#FFFFFF" />
          </View>
        )}

        {/* Accent type indicator */}
        {theme.accents.type !== 'none' && (
          <View
            className="absolute bottom-2 right-2"
            style={{ opacity: 0.6 }}
          >
            <Sparkles size={14} color={theme.colors.accent} />
          </View>
        )}
      </View>

      {/* Theme Info */}
      <View
        className="p-3"
        style={{
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        }}
      >
        <View className="flex-row items-center">
          <Text style={{ fontSize: 16 }}>{theme.emoji}</Text>
          <Text
            className={`ml-1.5 font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
            numberOfLines={1}
          >
            {theme.name}
          </Text>
        </View>
        <Text
          className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          numberOfLines={2}
        >
          {theme.description}
        </Text>

        {/* Color palette preview */}
        <View className="flex-row mt-2 space-x-1">
          {[
            theme.colors.background,
            theme.colors.accent,
            theme.colors.title,
            theme.colors.border,
          ].map((color, index) => (
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
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ============================================
// Compact Theme Selector (for inline use)
// ============================================

interface CompactThemePickerProps {
  selectedTheme: ThemeId | null;
  onSelectTheme: (theme: DesignTheme) => void;
  isDark?: boolean;
}

export function CompactThemePicker({
  selectedTheme,
  onSelectTheme,
  isDark = false,
}: CompactThemePickerProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16 }}
    >
      {THEME_LIST.map((theme) => (
        <TouchableOpacity
          key={theme.id}
          onPress={() => onSelectTheme(theme)}
          className={`mr-3 px-4 py-2 rounded-full flex-row items-center ${
            selectedTheme === theme.id
              ? 'bg-sky-500'
              : isDark
              ? 'bg-gray-800'
              : 'bg-gray-100'
          }`}
        >
          <Text style={{ fontSize: 14 }}>{theme.emoji}</Text>
          <Text
            className={`ml-1.5 font-medium ${
              selectedTheme === theme.id
                ? 'text-white'
                : isDark
                ? 'text-gray-300'
                : 'text-gray-700'
            }`}
          >
            {theme.name.split(' ')[0]}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

export default ThemePicker;
