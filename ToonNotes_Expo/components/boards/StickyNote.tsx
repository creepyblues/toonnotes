/**
 * StickyNote - Hand-placed sticky note for board display
 *
 * Features:
 * - Random rotation based on note ID (seeded for consistency)
 * - Uses note's actual NoteColor as background
 * - Subtle folded corner effect on top-right
 * - Paper-like shadow styling
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Note, NoteColor } from '@/types';
import { useDesignStore } from '@/stores';
import { composeStyle } from '@/services/designEngine';

interface StickyNoteProps {
  note: Note;
  isDark: boolean;
  onPress?: () => void;
  size?: number; // Default 80
}

// Seeded random number generator for consistent transforms
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function seededRandom(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  const normalized = x - Math.floor(x); // 0-1
  return min + normalized * (max - min);
}

export function getStickyTransform(noteId: string): {
  rotation: number;
  offsetX: number;
  offsetY: number;
} {
  const seed = hashCode(noteId);
  return {
    rotation: seededRandom(seed, -8, 8),
    offsetX: seededRandom(seed + 1, -6, 6),
    offsetY: seededRandom(seed + 2, -4, 4),
  };
}

export function StickyNote({
  note,
  isDark,
  onPress,
  size = 80,
}: StickyNoteProps) {
  const { getDesignById } = useDesignStore();
  const design = note.designId ? getDesignById(note.designId) : undefined;

  // Get composed style if design exists (memoized to prevent expensive recalculations)
  const composedStyle = useMemo(
    () => (design ? composeStyle(design, note.color, 'grid', isDark) : null),
    [design, note.color, isDark]
  );

  // Get transforms based on note ID
  const transform = useMemo(() => getStickyTransform(note.id), [note.id]);

  // Determine background color - use note's actual color
  const backgroundColor = note.color || NoteColor.Peach;

  // Text color - ensure contrast
  const textColor = composedStyle?.titleColor || (isDark ? '#1F2937' : '#1F2937');

  // Get title snippet
  const titleSnippet = note.title
    ? note.title.slice(0, 20) + (note.title.length > 20 ? '...' : '')
    : '';

  // Get content snippet (for 2 lines below title)
  const contentSnippet = note.content
    ? note.content.slice(0, 50) + (note.content.length > 50 ? '...' : '')
    : '';

  // Clean iOS-style border radius
  const borderStyle = {
    borderRadius: composedStyle?.borderRadius ? Math.min(composedStyle.borderRadius, 8) : 4,
  };

  const noteContent = (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          backgroundColor: composedStyle?.backgroundColor || backgroundColor,
          transform: [
            { translateX: transform.offsetX },
            { translateY: transform.offsetY },
            { rotate: `${transform.rotation}deg` },
          ],
          // Paper shadow - offset based on rotation direction
          shadowOffset: {
            width: transform.rotation > 0 ? 2 : -2,
            height: 3,
          },
          ...borderStyle,
        },
      ]}
    >
      {/* Note content - 3 lines: title (1 line) + content (2 lines) */}
      <View style={styles.content}>
        {titleSnippet ? (
          <Text
            style={[
              styles.titleText,
              { color: textColor, fontSize: size * 0.13 },
            ]}
            numberOfLines={1}
          >
            {titleSnippet}
          </Text>
        ) : (
          <View style={[styles.placeholder, { backgroundColor: textColor + '20' }]} />
        )}
        {contentSnippet ? (
          <Text
            style={[
              styles.contentText,
              { color: textColor, fontSize: size * 0.1, opacity: 0.75 },
            ]}
            numberOfLines={composedStyle?.stickerUri ? 1 : 2}
          >
            {contentSnippet}
          </Text>
        ) : null}
      </View>

      {/* Character sticker image */}
      {composedStyle?.stickerUri && (
        <Image
          source={{ uri: composedStyle.stickerUri }}
          style={[
            styles.stickerImage,
            {
              width: size * 0.5,
              height: size * 0.5,
            },
          ]}
          resizeMode="contain"
        />
      )}

      {/* Design accent indicator */}
      {composedStyle && (
        <View
          style={[
            styles.designAccent,
            { backgroundColor: composedStyle.accentColor },
          ]}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.pressable}>
        {noteContent}
      </Pressable>
    );
  }

  return noteContent;
}

const styles = StyleSheet.create({
  pressable: {
    // Allow transforms to show
  },
  container: {
    overflow: 'visible', // Allow shadow to show
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    position: 'relative',
  },
  content: {
    flex: 1,
    padding: 8,
    paddingTop: 10,
  },
  titleText: {
    fontWeight: '600',
    lineHeight: 16,
  },
  contentText: {
    fontWeight: '400',
    lineHeight: 12,
    marginTop: 2,
  },
  placeholder: {
    width: '60%',
    height: 8,
    borderRadius: 2,
    marginTop: 4,
  },
  designAccent: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 12,
    height: 3,
    borderRadius: 2,
    opacity: 0.8,
  },
  stickerImage: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    zIndex: 5,
  },
});

export default StickyNote;
