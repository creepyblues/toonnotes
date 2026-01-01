/**
 * DesignCard - Renders a design template with iOS-style styling
 *
 * Features:
 * - Square aspect ratio (matches NoteCard)
 * - Background image preview
 * - Large sticker display
 * - Color scheme swatches
 * - Selection state support
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { NoteDesign, NoteColor } from '@/types';
import { composeStyle } from '@/services/designEngine';

interface DesignCardProps {
  design: NoteDesign;
  onPress?: () => void;
  onLongPress?: () => void;
  isDark?: boolean;
  isSelected?: boolean;
  size?: 'normal' | 'compact';
}

export function DesignCard({
  design,
  onPress,
  onLongPress,
  isDark = false,
  isSelected = false,
  size = 'normal',
}: DesignCardProps) {
  // Compose style using DesignEngine
  const style = composeStyle(design, NoteColor.White, 'grid', isDark);

  // Get background image URI
  const backgroundImageUri = design.background?.imageUri || design.sourceImageUri;

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

  // Sticker size is 2x bigger (base 80/120 instead of 40/60)
  const stickerBaseSize = isCompact ? 80 : 120;

  // Background opacity same as note edit page (0.15)
  const backgroundOpacity = design.background?.opacity ?? 0.15;

  const cardContent = (
    <>
      {/* Decorations */}
      {getDecorations()}

      {/* Sticker - bottom right, 2x bigger */}
      {style.showSticker && style.stickerUri && (
        <Image
          source={{ uri: style.stickerUri }}
          style={[
            styles.sticker,
            {
              width: stickerBaseSize * style.stickerScale,
              height: stickerBaseSize * style.stickerScale,
            },
          ]}
          resizeMode="contain"
        />
      )}

      {/* Color scheme swatches at bottom */}
      <View style={styles.colorSwatches}>
        <View style={[styles.colorSwatch, { backgroundColor: design.background?.primaryColor || style.backgroundColor }]} />
        <View style={[styles.colorSwatch, { backgroundColor: design.colors?.accent || style.accentColor }]} />
        <View style={[styles.colorSwatch, { backgroundColor: design.colors?.titleText || style.titleColor }]} />
      </View>

      {/* Selected checkmark */}
      {isSelected && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </>
  );

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={500}
        activeOpacity={0.7}
        style={[
          styles.container,
          {
            borderRadius: 16,
            minHeight,
            // iOS-style shadow
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
            // Clean border
            borderWidth: isSelected ? 2 : 1,
            borderColor: isSelected ? '#F59E0B' : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'),
            overflow: 'hidden',
          },
        ]}
      >
        {/* Background color base */}
        <View style={[styles.backgroundFallback, { backgroundColor: style.backgroundColor }]}>
          {/* Background image with opacity (same as note edit page) */}
          {backgroundImageUri && (
            <Image
              source={{ uri: backgroundImageUri }}
              style={[StyleSheet.absoluteFill, { opacity: backgroundOpacity, borderRadius: 15 }]}
              resizeMode="cover"
            />
          )}
          {cardContent}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {},
  container: {
    aspectRatio: 1,
    position: 'relative',
  },
  backgroundFallback: {
    flex: 1,
    borderRadius: 16,
  },
  sticker: {
    position: 'absolute',
    bottom: 36,
    right: 8,
    zIndex: 10,
  },
  colorSwatches: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    gap: 6,
    zIndex: 5,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  decoration: {
    position: 'absolute',
    fontSize: 14,
    opacity: 0.8,
    zIndex: 2,
  },
  decorationTopLeft: {
    top: 8,
    left: 8,
  },
  decorationBottomRight: {
    bottom: 32,
    right: 8,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
