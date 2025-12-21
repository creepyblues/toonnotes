/**
 * BoardCard - Corkboard-style board display
 *
 * Features:
 * - Full-width single card style (no more hero/grid variants)
 * - Corkboard texture background
 * - Horizontal scrolling sticky notes
 * - Clean header with hashtag and note count
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { Hash } from 'lucide-react-native';
import { BoardData } from '@/types';
import { StickyNotesRow } from './StickyNotesRow';

interface BoardCardProps {
  board: BoardData;
  isDark: boolean;
  onPress: () => void;
  onNotePress?: (noteId: string) => void;
}

// Corkboard texture
const CORKBOARD_TEXTURE = require('@/assets/textures/corkboard.png');

// Fixed card height
const CARD_HEIGHT = 200;

export function BoardCard({
  board,
  isDark,
  onPress,
  onNotePress,
}: BoardCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark ? '#2D2520' : '#C49A6C',
            shadowColor: isDark ? '#000' : '#8B5A2B',
          },
        ]}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.2)',
              borderBottomColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(139,90,43,0.15)',
            },
          ]}
        >
          <View style={styles.headerLeft}>
            <Hash
              size={18}
              color={isDark ? '#E5E7EB' : '#4A3728'}
              strokeWidth={2.5}
            />
            <Text
              style={[
                styles.hashtagText,
                { color: isDark ? '#FFFFFF' : '#3D2914' },
              ]}
              numberOfLines={1}
            >
              {board.hashtag}
            </Text>
          </View>

          <View
            style={[
              styles.countBadge,
              {
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.12)'
                  : 'rgba(74,55,40,0.12)',
              },
            ]}
          >
            <Text
              style={[
                styles.countText,
                { color: isDark ? '#D1D5DB' : '#5D4037' },
              ]}
            >
              {board.noteCount}
            </Text>
          </View>
        </View>

        {/* Corkboard Area with Sticky Notes */}
        <ImageBackground
          source={CORKBOARD_TEXTURE}
          style={styles.corkboard}
          imageStyle={[
            styles.corkboardImage,
            { opacity: isDark ? 0.3 : 0.7 },
          ]}
          resizeMode="repeat"
        >
          <StickyNotesRow
            notes={board.previewNotes}
            isDark={isDark}
            onNotePress={onNotePress ? (note) => onNotePress(note.id) : undefined}
          />
        </ImageBackground>

        {/* Subtle bottom border for depth */}
        <View
          style={[
            styles.bottomBorder,
            {
              backgroundColor: isDark
                ? 'rgba(0,0,0,0.4)'
                : 'rgba(139,90,43,0.25)',
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: CARD_HEIGHT,
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

export default BoardCard;
