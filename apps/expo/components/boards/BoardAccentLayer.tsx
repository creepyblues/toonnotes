/**
 * BoardAccentLayer - Decorative accents for board cards
 *
 * Renders sparkles, stars, hearts, or flowers as decorative
 * elements around the board card edges.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BoardAccentType } from '@/types';

interface BoardAccentLayerProps {
  accentType: BoardAccentType;
  color?: string;
}

const ACCENT_EMOJIS: Record<BoardAccentType, string[]> = {
  sparkles: ['✨', '✦', '✧', '⋆'],
  stars: ['★', '☆', '✫', '✯'],
  hearts: ['♡', '♥', '❤', '💕'],
  flowers: ['✿', '❀', '✾', '❁'],
  none: [],
};

export function BoardAccentLayer({ accentType, color }: BoardAccentLayerProps) {
  if (accentType === 'none') {
    return null;
  }

  const emojis = ACCENT_EMOJIS[accentType];

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Top left */}
      <Text style={[styles.accent, styles.topLeft, color ? { color } : null]}>
        {emojis[0]}
      </Text>
      {/* Top right */}
      <Text style={[styles.accent, styles.topRight, color ? { color } : null]}>
        {emojis[1] || emojis[0]}
      </Text>
      {/* Bottom left */}
      <Text style={[styles.accent, styles.bottomLeft, color ? { color } : null]}>
        {emojis[2] || emojis[0]}
      </Text>
      {/* Bottom right */}
      <Text style={[styles.accent, styles.bottomRight, color ? { color } : null]}>
        {emojis[3] || emojis[0]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'visible',
  },
  accent: {
    position: 'absolute',
    fontSize: 16,
    opacity: 0.7,
  },
  topLeft: {
    top: 4,
    left: 8,
  },
  topRight: {
    top: 4,
    right: 8,
  },
  bottomLeft: {
    bottom: 8,
    left: 8,
  },
  bottomRight: {
    bottom: 8,
    right: 8,
  },
});

export default BoardAccentLayer;
