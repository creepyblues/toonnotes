/**
 * BackgroundPicker - UI component for selecting note background
 *
 * User picks ONE option:
 * - A solid color (White, Red, Orange, Yellow, Green, Teal, Blue, Purple)
 * - Source Image (blurred background from design, when available)
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import { BackgroundStyle, NoteColor } from '@/types';

const NOTE_COLORS = [
  { name: 'White', value: NoteColor.White },
  { name: 'Lavender', value: NoteColor.Lavender },
  { name: 'Rose', value: NoteColor.Rose },
  { name: 'Peach', value: NoteColor.Peach },
  { name: 'Mint', value: NoteColor.Mint },
  { name: 'Sky', value: NoteColor.Sky },
  { name: 'Violet', value: NoteColor.Violet },
];

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
  // Color picker props
  currentColor?: NoteColor;
  onColorChange?: (color: NoteColor) => void;
}

export function BackgroundPicker({
  visible,
  onClose,
  currentBackground,
  sourceImageUri,
  onSelect,
  isDark = false,
  currentColor = NoteColor.White,
  onColorChange,
}: BackgroundPickerProps) {
  const bgColor = isDark ? 'bg-gray-900' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  const isImageSelected = currentBackground?.style === 'image';
  const isColorSelected = !isImageSelected; // Color is selected when image is NOT selected

  const handleSelectColor = (color: NoteColor) => {
    // Select color and clear background image
    onColorChange?.(color);
    onSelect({ style: 'none' });
  };

  const handleSelectImage = () => {
    if (sourceImageUri) {
      onSelect({ style: 'image', imageUri: sourceImageUri, opacity: 0.15 });
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: isDark ? '#0F0D15' : '#FAFAFF' }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#252136' : '#EDE9FE',
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: isDark ? '#F5F3FF' : '#1A1625' }}>
            Choose Background
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: isDark ? '#252136' : '#F5F3FF',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} color={isDark ? '#A8A8B8' : '#6B6B7B'} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ padding: 16 }}>
            {/* Color swatches */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
              {NOTE_COLORS.map((c) => {
                const isThisColorSelected = isColorSelected && currentColor === c.value;
                return (
                  <TouchableOpacity
                    key={c.value}
                    onPress={() => handleSelectColor(c.value)}
                    style={{ alignItems: 'center' }}
                  >
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: c.value,
                        borderWidth: isThisColorSelected ? 3 : 2,
                        borderColor: isThisColorSelected ? '#8B5CF6' : (isDark ? '#3D3654' : '#DDD6FE'),
                        shadowColor: '#8B5CF6',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: isThisColorSelected ? 0.3 : 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isThisColorSelected && (
                        <Check size={20} color={c.value === NoteColor.White ? '#8B5CF6' : '#FFFFFF'} strokeWidth={2.5} />
                      )}
                    </View>
                    <Text
                      style={{
                        fontSize: 11,
                        marginTop: 6,
                        fontWeight: isThisColorSelected ? '600' : '400',
                        color: isThisColorSelected ? '#8B5CF6' : (isDark ? '#A8A8B8' : '#6B6B7B'),
                      }}
                    >
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Source Image option (only show if available) */}
            {sourceImageUri && (
              <TouchableOpacity
                onPress={handleSelectImage}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 12,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor: isImageSelected ? '#8B5CF6' : (isDark ? '#252136' : '#EDE9FE'),
                  backgroundColor: isImageSelected
                    ? isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)'
                    : isDark ? '#1C1826' : '#FFFFFF',
                }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 12, overflow: 'hidden' }}>
                  <Image
                    source={{ uri: sourceImageUri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ fontWeight: '500', color: isDark ? '#F5F3FF' : '#1A1625' }}>
                    Source Image
                  </Text>
                  <Text style={{ fontSize: 12, color: isDark ? '#A8A8B8' : '#6B6B7B' }}>
                    Blurred background from design
                  </Text>
                </View>
                {isImageSelected && (
                  <Check size={22} color="#8B5CF6" strokeWidth={2.5} />
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Spacing at bottom */}
          <View style={{ height: 80 }} />
        </ScrollView>

        {/* Done Button */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderTopWidth: 1,
            borderTopColor: isDark ? '#252136' : '#EDE9FE',
          }}
        >
          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: '#8B5CF6',
              paddingVertical: 16,
              borderRadius: 9999,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default BackgroundPicker;
