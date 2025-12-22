/**
 * DesignCard - Renders a design template with NoteCard-like styling
 *
 * Features:
 * - Square aspect ratio (matches NoteCard)
 * - Hand-drawn SVG border
 * - Design name at TOP
 * - Sample text to preview title/body colors
 * - Sticker overlay
 * - Decorations (shoujo, etc.)
 * - Selection state support
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Image } from 'expo-image';
import { NoteDesign, NoteColor, DesignViewContext } from '@/types';
import { composeStyle } from '@/services/designEngine';
import { HandDrawnBorder } from '@/components/notes/HandDrawnBorder';

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
  const [cardSize, setCardSize] = useState({ width: 0, height: 0 });

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== cardSize.width || height !== cardSize.height) {
      setCardSize({ width, height });
    }
  };

  // Compose style using DesignEngine
  const style = composeStyle(design, NoteColor.White, 'grid', isDark);

  // Border color for hand-drawn border
  const borderColor = style.showBorder ? style.borderColor : (isDark ? '#4B5563' : '#D1D5DB');

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
      <Text
        style={[
          styles.designName,
          { color: isDark ? '#FFFFFF' : '#1F2937', fontSize: isCompact ? 11 : 13 },
        ]}
        numberOfLines={1}
      >
        {design.name}
      </Text>

      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        onLayout={handleLayout}
        style={[
          styles.container,
          {
            backgroundColor: style.backgroundColor,
            borderRadius: style.borderRadius,
            minHeight,
            // Shadow
            shadowColor: style.shadowColor,
            shadowOffset: style.shadowOffset,
            shadowOpacity: style.shadowOpacity,
            shadowRadius: style.shadowRadius,
            elevation: style.elevation,
            // Selection border
            borderWidth: isSelected ? 3 : 0,
            borderColor: isSelected ? '#F59E0B' : 'transparent',
          },
        ]}
      >
        {/* Hand-drawn border overlay */}
        {cardSize.width > 0 && !isSelected && (
          <View style={styles.borderOverlay}>
            <HandDrawnBorder
              width={cardSize.width}
              height={cardSize.height}
              color={borderColor}
              strokeWidth={1.5}
              seed={design.id}
              wobble={2.5}
            />
          </View>
        )}

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
            contentFit="contain"
            cachePolicy="memory-disk"
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
  borderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    pointerEvents: 'none',
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
