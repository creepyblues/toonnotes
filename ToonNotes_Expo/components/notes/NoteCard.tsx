/**
 * NoteCard - Hand-drawn style note card
 *
 * Features:
 * - Square aspect ratio
 * - Wavy/sketchy SVG border (hand-drawn look)
 * - Straight alignment (no tilt)
 * - Applied to all notes regardless of design
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, LayoutChangeEvent } from 'react-native';
import { Pin } from 'lucide-react-native';
import { Note, NoteDesign, DesignViewContext } from '@/types';
import { composeStyle } from '@/services/designEngine';
import { HandDrawnBorder } from './HandDrawnBorder';

interface NoteCardProps {
  note: Note;
  design?: NoteDesign | null;
  onPress: () => void;
  isDark?: boolean;
  context?: DesignViewContext;
}


export function NoteCard({
  note,
  design = null,
  onPress,
  isDark = false,
  context = 'grid',
}: NoteCardProps) {
  // Track card size for hand-drawn border
  const [cardSize, setCardSize] = useState({ width: 0, height: 0 });

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== cardSize.width || height !== cardSize.height) {
      setCardSize({ width, height });
    }
  };

  // Get preview text (more chars to fill space above hashtags)
  const previewText = note.content.slice(0, 150);
  const hasMore = note.content.length > 150;

  // Compose style using DesignEngine
  const style = composeStyle(design, note.color, context, isDark);


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

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        onLayout={handleLayout}
        style={[
          styles.container,
          {
            backgroundColor: style.backgroundColor,
            borderRadius: style.borderRadius,
            // Shadow
            shadowColor: style.shadowColor,
            shadowOffset: style.shadowOffset,
            shadowOpacity: style.shadowOpacity,
            shadowRadius: style.shadowRadius,
            elevation: style.elevation,
          },
        ]}
      >
        {/* Hand-drawn border overlay */}
        {cardSize.width > 0 && (
          <View style={styles.borderOverlay}>
            <HandDrawnBorder
              width={cardSize.width}
              height={cardSize.height}
              color={borderColor}
              strokeWidth={1.5}
              seed={note.id}
              wobble={2.5}
            />
          </View>
        )}

        {/* Decorations */}
        {getDecorations()}

        {/* Pin indicator */}
        {note.isPinned && (
          <View style={styles.pinContainer}>
            <Pin size={12} color={style.bodyColor} />
          </View>
        )}

        {/* Title */}
        {note.title ? (
          <Text
            style={[styles.title, { color: style.titleColor }]}
            numberOfLines={2}
          >
            {note.title}
          </Text>
        ) : null}

        {/* Content preview */}
        <Text
          style={[styles.content, { color: style.bodyColor }]}
          numberOfLines={note.title ? 5 : 6}
        >
          {previewText}
          {hasMore && '...'}
        </Text>

        {/* Labels */}
        {note.labels.length > 0 && (
          <View style={styles.labelsContainer}>
            {note.labels.slice(0, 2).map((label) => (
              <View
                key={label}
                style={[
                  styles.labelPill,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.08)',
                  },
                ]}
              >
                <Text style={[styles.labelText, { color: style.titleColor }]}>
                  #{label}
                </Text>
              </View>
            ))}
            {note.labels.length > 2 && (
              <Text style={[styles.moreLabels, { color: style.bodyColor }]}>
                +{note.labels.length - 2}
              </Text>
            )}
          </View>
        )}

        {/* Sticker overlay */}
        {style.showSticker && style.stickerUri && (
          <Image
            source={{ uri: style.stickerUri }}
            style={[
              styles.sticker,
              {
                width: 60 * style.stickerScale,
                height: 60 * style.stickerScale,
              },
            ]}
            resizeMode="contain"
          />
        )}

        {/* Design indicator */}
        {design && (
          <View
            style={[
              styles.designIndicator,
              { backgroundColor: style.accentColor },
            ]}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    // Allow rotation overflow
  },
  container: {
    aspectRatio: 1, // Square!
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
  pinContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
    fontSize: 13,
  },
  content: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  labelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 4,
  },
  labelPill: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  labelText: {
    fontSize: 9,
  },
  moreLabels: {
    fontSize: 9,
  },
  decoration: {
    position: 'absolute',
    fontSize: 12,
    opacity: 0.7,
    zIndex: 2,
  },
  decorationTopLeft: {
    top: -2,
    left: 8,
  },
  decorationBottomRight: {
    bottom: 0,
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
});
