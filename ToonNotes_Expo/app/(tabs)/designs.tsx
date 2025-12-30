import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useNoteStore } from '@/stores';
import { NoteColor } from '@/types';
import { useTheme } from '@/src/theme';
import {
  CATEGORY_ORDER,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  LabelPreset,
  LabelCategory,
  PRESETS_BY_CATEGORY,
} from '@/constants/labelPresets';

export default function DesignsScreen() {
  const router = useRouter();
  const { addNote } = useNoteStore();
  const { colors, isDark } = useTheme();

  const handlePresetPress = (preset: LabelPreset) => {
    // Create a new note with this label preset design applied
    const presetDesignId = `label-preset-${preset.id}`;
    const newNote = addNote({
      title: '',
      content: '',
      color: NoteColor.White,
      labels: [preset.name.toLowerCase()], // Add the label to the note
      isPinned: false,
      isArchived: false,
      isDeleted: false,
      designId: presetDesignId,
    });
    router.push(`/note/${newNote.id}`);
  };

  const renderPresetCard = (preset: LabelPreset) => (
    <TouchableOpacity
      key={preset.id}
      onPress={() => handlePresetPress(preset)}
      style={{
        width: '47%',
        marginBottom: 12,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: isDark ? '#1C1826' : preset.colors.bg,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        shadowColor: preset.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* Card Header with gradient accent */}
      <View
        style={{
          height: 6,
          backgroundColor: preset.colors.primary,
        }}
      />

      {/* Card Content */}
      <View style={{ padding: 14 }}>
        {/* Icon and Name Row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 24, marginRight: 8 }}>{preset.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: isDark ? '#F5F3FF' : preset.colors.text,
              }}
            >
              {preset.name}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text
          style={{
            fontSize: 12,
            color: isDark ? '#A8A8B8' : '#6B7280',
            marginBottom: 10,
          }}
          numberOfLines={2}
        >
          {preset.description}
        </Text>

        {/* Style Tags */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
          {/* Font style tag */}
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 8,
              backgroundColor: isDark
                ? 'rgba(139, 92, 246, 0.15)'
                : 'rgba(139, 92, 246, 0.1)',
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '500',
                color: isDark ? '#A78BFA' : '#7C3AED',
              }}
            >
              {preset.fontStyle}
            </Text>
          </View>

          {/* Mood tag */}
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 8,
              backgroundColor: isDark
                ? `${preset.colors.primary}20`
                : `${preset.colors.primary}15`,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '500',
                color: preset.colors.primary,
              }}
            >
              {preset.mood}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = (category: LabelCategory) => {
    const presets = PRESETS_BY_CATEGORY[category];
    const categoryColor = CATEGORY_COLORS[category];
    const categoryLabel = CATEGORY_LABELS[category];

    return (
      <View key={category} style={{ marginBottom: 24 }}>
        {/* Category Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
            paddingHorizontal: 4,
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: categoryColor,
              marginRight: 8,
            }}
          />
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: isDark ? '#A8A8B8' : '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {categoryLabel}
          </Text>
          <View
            style={{
              marginLeft: 8,
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
              backgroundColor: `${categoryColor}20`,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '500',
                color: categoryColor,
              }}
            >
              {presets.length}
            </Text>
          </View>
        </View>

        {/* Presets Grid */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          {presets.map(renderPresetCard)}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.backgroundSecondary }}
      edges={['top']}
    >
      {/* Header */}
      <View
        className="px-4 py-3"
        style={{ backgroundColor: colors.backgroundSecondary }}
      >
        <Text
          style={{
            fontSize: 34,
            fontWeight: '700',
            color: colors.textPrimary,
          }}
        >
          Designs
        </Text>
        <Text
          className="text-sm mt-1"
          style={{ color: colors.textSecondary }}
        >
          20 label-based styles for your notes
        </Text>
      </View>

      {/* Presets by Category */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {CATEGORY_ORDER.map(renderCategory)}
      </ScrollView>
    </SafeAreaView>
  );
}
