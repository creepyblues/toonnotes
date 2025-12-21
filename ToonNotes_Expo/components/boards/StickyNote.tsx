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
  const designs = useDesignStore((s) => s.designs);
  const design = note.designId
    ? designs.find((d) => d.id === note.designId)
    : undefined;

  // Get composed style if design exists
  const composedStyle = design ? composeStyle(design, note.color, 'grid', isDark) : null;

  // Get transforms based on note ID
  const transform = useMemo(() => getStickyTransform(note.id), [note.id]);

  // Determine background color - use note's actual color
  const backgroundColor = note.color || NoteColor.Yellow;

  // Text color - ensure contrast
  const textColor = composedStyle?.titleColor || (isDark ? '#1F2937' : '#1F2937');

  // Get title snippet
  const titleSnippet = note.title
    ? note.title.slice(0, 20) + (note.title.length > 20 ? '...' : '')
    : '';

  // Border styling from design
  const borderStyle = composedStyle?.showBorder
    ? {
        borderWidth: Math.min(composedStyle.borderWidth || 2, 3), // Cap at 3 for small size
        borderColor: composedStyle.borderColor,
        borderRadius: Math.min(composedStyle.borderRadius || 4, 8),
      }
    : {
        borderRadius: 2,
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
      {/* Note content */}
      <View style={styles.content}>
        {titleSnippet ? (
          <Text
            style={[
              styles.titleText,
              { color: textColor, fontSize: size * 0.11 },
            ]}
            numberOfLines={composedStyle?.stickerUri ? 2 : 3}
          >
            {titleSnippet}
          </Text>
        ) : (
          <View style={[styles.placeholder, { backgroundColor: textColor + '20' }]} />
        )}
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
      {composedStyle?.showBorder && (
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
    lineHeight: 14,
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
