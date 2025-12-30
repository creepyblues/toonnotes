/**
 * DesignCard - Renders a design template with iOS-style styling
 *
 * Features:
 * - Square aspect ratio (matches NoteCard)
 * - Clean iOS-style border and shadow
 * - Design name at TOP
 * - Sample text to preview title/body colors
 * - Sticker overlay
 * - Decorations (shoujo, etc.)
 * - Selection state support
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { NoteDesign, NoteColor } from '@/types';
import { composeStyle } from '@/services/designEngine';

interface DesignCardProps {
  design: NoteDesign;
  onPress?: () => void;
  isDark?: boolean;
  isSelected?: boolean;
  size?: 'normal' | 'compact';
}

export function DesignCard({
  design,
  onPress,
  isDark = false,
  isSelected = false,
  size = 'normal',
}: DesignCardProps) {
  // Compose style using DesignEngine
  const style = composeStyle(design, NoteColor.White, 'grid', isDark);

  // Get decoration emoji for shoujo style
  const getDecorations = () => {
    if (style.decorations?.type === 'shoujo') {
      return (
        <>
          <Text style={[styles.decoration, styles.decorationTopLeft]}>✿</Text>
          <Text style={[styles.decoration, styles.decorationBottomRight]}>✧</Text>
        </>
      );
    }
    return null;
  };

  const isCompact = size === 'compact';
  const minHeight = isCompact ? 100 : 150;

  return (
    <View style={styles.wrapper}>
      {/* Design name above card */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <Text
          style={[
            styles.designName,
            { color: isDark ? '#FFFFFF' : '#1F2937', fontSize: isCompact ? 11 : 13, marginBottom: 0 },
          ]}
          numberOfLines={1}
        >
          {design.name}
        </Text>
        {design.isSystemDefault && (
          <View
            style={{
              marginLeft: 6,
              paddingHorizontal: 4,
              paddingVertical: 1,
              borderRadius: 3,
              backgroundColor: isDark ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.15)',
            }}
          >
            <Text style={{ fontSize: 8, color: '#F59E0B', fontWeight: '600' }}>
              ★
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={[
          styles.container,
          {
            backgroundColor: style.backgroundColor,
            borderRadius: 16,
            minHeight,
            // iOS-style shadow
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
            // Clean border
            borderWidth: isSelected ? 2 : 1,
            borderColor: isSelected ? '#F59E0B' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
          },
        ]}
      >

        {/* Decorations */}
        {getDecorations()}

        {/* Sample text preview */}
        <View style={styles.contentArea}>
          <Text
            style={[
              styles.sampleTitle,
              { color: style.titleColor, fontSize: isCompact ? 11 : 13 },
            ]}
            numberOfLines={1}
          >
            Sample Note
          </Text>
          <Text
            style={[
              styles.sampleBody,
              { color: style.bodyColor, fontSize: isCompact ? 9 : 11 },
            ]}
            numberOfLines={isCompact ? 2 : 3}
          >
            This is how your notes will look with this design applied.
          </Text>
        </View>

        {/* Sticker overlay */}
        {style.showSticker && style.stickerUri && (
          <Image
            source={{ uri: style.stickerUri }}
            style={[
              styles.sticker,
              {
                width: (isCompact ? 40 : 60) * style.stickerScale,
                height: (isCompact ? 40 : 60) * style.stickerScale,
              },
            ]}
            resizeMode="contain"
          />
        )}

        {/* Design indicator bar at bottom */}
        <View
          style={[
            styles.designIndicator,
            { backgroundColor: style.accentColor },
          ]}
        />

        {/* Selected checkmark */}
        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {},
  container: {
    aspectRatio: 1,
    padding: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  designName: {
    fontWeight: '600',
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  contentArea: {
    flex: 1,
    paddingRight: 40,
  },
  sampleTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  sampleBody: {
    lineHeight: 16,
  },
  decoration: {
    position: 'absolute',
    fontSize: 12,
    opacity: 0.7,
    zIndex: 2,
  },
  decorationTopLeft: {
    top: 24,
    left: 8,
  },
  decorationBottomRight: {
    bottom: 8,
    right: 8,
  },
  designIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  sticker: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    zIndex: 10,
  },
  checkmark: {
    position: 'absolute',
    top: 28,
    left: 8,
    width: 22,
    height: 22,
    backgroundColor: '#F59E0B',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 6,
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
