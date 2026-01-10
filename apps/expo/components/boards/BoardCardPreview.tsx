/**
 * BoardCardPreview - Preview component for board design creation
 *
 * Displays a preview of how the board will look with the generated design.
 */

import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { Hash } from 'lucide-react-native';
import * as LucideIcons from 'lucide-react-native';
import { BoardDesign, Note } from '@/types';
import { StickyNotesRow } from './StickyNotesRow';
import { BoardAccentLayer } from './BoardAccentLayer';

interface BoardCardPreviewProps {
  hashtag: string;
  noteCount: number;
  previewNotes: Note[];
  boardDesign: BoardDesign;
  isDark: boolean;
}

// Corkboard texture
const CORKBOARD_TEXTURE = require('@/assets/textures/corkboard.png');

export function BoardCardPreview({
  hashtag,
  noteCount,
  previewNotes,
  boardDesign,
  isDark,
}: BoardCardPreviewProps) {
  // Get icon component if specified
  const IconComponent = boardDesign.decorations.icon
    ? (LucideIcons as any)[
        boardDesign.decorations.icon.charAt(0).toUpperCase() +
          boardDesign.decorations.icon.slice(1)
      ] || Hash
    : null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: boardDesign.corkboard.backgroundColor,
          shadowColor: isDark ? '#000' : '#8B5A2B',
        },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: boardDesign.header.backgroundColor,
            borderBottomColor: boardDesign.corkboard.borderColor,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          {IconComponent ? (
            <IconComponent
              size={18}
              color={boardDesign.decorations.iconColor || boardDesign.header.accentColor}
              strokeWidth={2.5}
            />
          ) : (
            <Hash
              size={18}
              color={boardDesign.header.textColor}
              strokeWidth={2.5}
            />
          )}
          <Text
            style={[styles.hashtagText, { color: boardDesign.header.textColor }]}
            numberOfLines={1}
          >
            {hashtag}
          </Text>
        </View>

        <View
          style={[
            styles.countBadge,
            { backgroundColor: boardDesign.header.badgeColor },
          ]}
        >
          <Text
            style={[
              styles.countText,
              { color: boardDesign.header.badgeTextColor },
            ]}
          >
            {noteCount}
          </Text>
        </View>
      </View>

      {/* Corkboard Area with Sticky Notes */}
      <ImageBackground
        source={CORKBOARD_TEXTURE}
        style={styles.corkboard}
        imageStyle={[
          styles.corkboardImage,
          { opacity: boardDesign.corkboard.textureOpacity },
        ]}
        resizeMode="repeat"
      >
        <StickyNotesRow
          notes={previewNotes}
          isDark={isDark}
          maxVisible={4}
        />

        {/* Decorative accents */}
        {boardDesign.decorations.accentType !== 'none' && (
          <BoardAccentLayer
            accentType={boardDesign.decorations.accentType}
            color={boardDesign.decorations.accentColor}
          />
        )}
      </ImageBackground>

      {/* Bottom border */}
      <View
        style={[
          styles.bottomBorder,
          { backgroundColor: boardDesign.corkboard.borderColor },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  hashtagText: {
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 6,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 12,
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
  },
  corkboard: {
    flex: 1,
    justifyContent: 'center',
  },
  corkboardImage: {
    // Texture tiling handled by resizeMode="repeat"
  },
  bottomBorder: {
    height: 3,
  },
});

export default BoardCardPreview;
