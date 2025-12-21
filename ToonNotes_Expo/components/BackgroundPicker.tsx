/**
 * BackgroundPicker - UI component for selecting note backgrounds
 *
 * Allows users to choose between:
 * - None (solid color only)
 * - Source Image (blurred background from design source)
 * - Patterns (from built-in pattern library)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import { X, ImageIcon, Grid3x3, Check } from 'lucide-react-native';
import {
  PATTERNS,
  PATTERN_CATEGORIES,
  CATEGORY_LABELS,
  PATTERN_ASSETS,
  PatternCategory,
  Pattern,
} from '@/constants/patterns';
import { BackgroundStyle } from '@/types';

interface BackgroundSelection {
  style: BackgroundStyle | 'none';
  imageUri?: string;
  patternId?: string;
  opacity?: number;
}

interface BackgroundPickerProps {
  visible: boolean;
  onClose: () => void;
  currentBackground?: BackgroundSelection;
  sourceImageUri?: string; // From design creation
  onSelect: (selection: BackgroundSelection) => void;
  isDark?: boolean;
}

export function BackgroundPicker({
  visible,
  onClose,
  currentBackground,
  sourceImageUri,
  onSelect,
  isDark = false,
}: BackgroundPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<PatternCategory>('dots');

  const bgColor = isDark ? 'bg-gray-900' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  const isSelected = (type: 'none' | 'image' | 'pattern', patternId?: string) => {
    if (type === 'none') return currentBackground?.style === 'none' || !currentBackground;
    if (type === 'image') return currentBackground?.style === 'image';
    if (type === 'pattern' && patternId) {
      return currentBackground?.style === 'pattern' && currentBackground?.patternId === patternId;
    }
    return false;
  };

  const handleSelectNone = () => {
    onSelect({ style: 'none' });
  };

  const handleSelectImage = () => {
    if (sourceImageUri) {
      onSelect({ style: 'image', imageUri: sourceImageUri, opacity: 0.15 });
    }
  };

  const handleSelectPattern = (pattern: Pattern) => {
    onSelect({
      style: 'pattern',
      patternId: pattern.id,
      opacity: pattern.defaultOpacity,
    });
  };

  const getPatternsByCategory = (category: PatternCategory): Pattern[] =>
    PATTERNS.filter((p) => p.category === category);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className={`flex-1 ${bgColor}`}>
        {/* Header */}
        <View className={`flex-row items-center justify-between px-4 py-3 border-b ${borderColor}`}>
          <Text className={`text-lg font-semibold ${textColor}`}>Choose Background</Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <X size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* None Option */}
          <View className="px-4 pt-4">
            <Text className={`text-sm font-medium mb-2 ${textMuted}`}>BACKGROUND TYPE</Text>
            <TouchableOpacity
              onPress={handleSelectNone}
              className={`flex-row items-center p-4 rounded-xl border ${borderColor} ${
                isSelected('none') ? 'border-sky-500 bg-sky-50' : ''
              }`}
              style={isSelected('none') && isDark ? { backgroundColor: 'rgba(14, 165, 233, 0.1)' } : {}}
            >
              <View className={`w-12 h-12 rounded-lg items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <Grid3x3 size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </View>
              <View className="ml-3 flex-1">
                <Text className={`font-medium ${textColor}`}>None</Text>
                <Text className={`text-sm ${textMuted}`}>Solid color only</Text>
              </View>
              {isSelected('none') && (
                <Check size={20} color="#0ea5e9" />
              )}
            </TouchableOpacity>
          </View>

          {/* Source Image Option (if available) */}
          {sourceImageUri && (
            <View className="px-4 pt-4">
              <TouchableOpacity
                onPress={handleSelectImage}
                className={`flex-row items-center p-4 rounded-xl border ${borderColor} ${
                  isSelected('image') ? 'border-sky-500 bg-sky-50' : ''
                }`}
                style={isSelected('image') && isDark ? { backgroundColor: 'rgba(14, 165, 233, 0.1)' } : {}}
              >
                <View className="w-12 h-12 rounded-lg overflow-hidden">
                  <Image
                    source={{ uri: sourceImageUri }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text className={`font-medium ${textColor}`}>Source Image</Text>
                  <Text className={`text-sm ${textMuted}`}>Blurred background from design</Text>
                </View>
                {isSelected('image') && (
                  <Check size={20} color="#0ea5e9" />
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Pattern Categories */}
          <View className="px-4 pt-6">
            <Text className={`text-sm font-medium mb-3 ${textMuted}`}>PATTERNS</Text>

            {/* Category Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              {PATTERN_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  className={`px-4 py-2 mr-2 rounded-full ${
                    selectedCategory === category
                      ? 'bg-sky-500'
                      : isDark
                      ? 'bg-gray-800'
                      : 'bg-gray-100'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedCategory === category ? 'text-white' : textColor
                    }`}
                  >
                    {CATEGORY_LABELS[category]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Pattern Grid */}
            <View className="flex-row flex-wrap">
              {getPatternsByCategory(selectedCategory).map((pattern) => {
                const patternAsset = PATTERN_ASSETS[pattern.assetName];
                return (
                  <TouchableOpacity
                    key={pattern.id}
                    onPress={() => handleSelectPattern(pattern)}
                    className="w-1/3 p-1"
                  >
                    <View
                      className={`aspect-square rounded-xl border-2 overflow-hidden ${
                        isSelected('pattern', pattern.id)
                          ? 'border-sky-500'
                          : borderColor
                      }`}
                      style={{
                        backgroundColor: isDark ? '#374151' : '#F9FAFB',
                      }}
                    >
                      {/* Pattern preview image - tile manually for preview */}
                      {patternAsset ? (
                        <View className="flex-1 flex-row flex-wrap">
                          {[...Array(9)].map((_, i) => (
                            <Image
                              key={i}
                              source={patternAsset}
                              style={{
                                width: '33.33%',
                                height: '33.33%',
                                opacity: 0.7,
                              }}
                              resizeMode="cover"
                            />
                          ))}
                        </View>
                      ) : (
                        <View className="flex-1 items-center justify-center">
                          <ImageIcon
                            size={24}
                            color={isDark ? '#6B7280' : '#9CA3AF'}
                          />
                        </View>
                      )}
                      {/* Pattern name overlay */}
                      <View
                        className="absolute bottom-0 left-0 right-0 py-1 px-1"
                        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                      >
                        <Text className="text-white text-xs text-center" numberOfLines={1}>
                          {pattern.name}
                        </Text>
                      </View>
                      {/* Selected indicator */}
                      {isSelected('pattern', pattern.id) && (
                        <View className="absolute top-1 right-1 bg-sky-500 rounded-full p-0.5">
                          <Check size={12} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Spacing at bottom */}
          <View className="h-20" />
        </ScrollView>

        {/* Done Button */}
        <View className={`px-4 py-4 border-t ${borderColor}`}>
          <TouchableOpacity
            onPress={onClose}
            className="bg-sky-500 py-4 rounded-xl items-center"
          >
            <Text className="text-white font-semibold text-lg">Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default BackgroundPicker;
