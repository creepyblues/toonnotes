/**
 * Board Detail Screen - Shows all notes in a board
 *
 * Uses custom board design if available, otherwise preset colors.
 */

import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  // Productivity
  CheckCircle,
  StarFour,
  Archive,
  Crosshair,
  // Reading
  Books,
  FilmSlate,
  ChatTeardrop,
  HeartHalf,
  // Creative
  LightbulbFilament,
  Atom,
  UsersFour,
  HeartBreak,
  // Content
  Feather,
  FileText,
  ChatCenteredDots,
  Flask,
  // Personal
  BookBookmark,
  ImageSquare,
  Sparkle,
  PaintBrush,
  IconProps,
} from 'phosphor-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useNoteStore, useDesignStore, useBoardStore, useBoardDesignStore } from '@/stores';
import { NoteCard } from '@/components/notes/NoteCard';
import { Note } from '@/types';
import { getPresetForHashtag } from '@/constants/boardPresets';
import { useTheme } from '@/src/theme';

// Phosphor icon mapping for board background (same as BoardCard)
const BOARD_ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  // Productivity
  CheckCircle,
  StarFour,
  Archive,
  Crosshair,
  // Reading
  Books,
  FilmSlate,
  ChatTeardrop,
  HeartHalf,
  // Creative
  LightbulbFilament,
  Atom,
  UsersFour,
  HeartBreak,
  // Content
  Feather,
  FileText,
  ChatCenteredDots,
  Flask,
  // Personal
  BookBookmark,
  ImageSquare,
  Sparkle,
  PaintBrush,
};

// Helper to lighten a hex color
function lightenColor(hex: string, amount: number = 0.3): string {
  // Remove # if present
  const color = hex.replace('#', '');

  // Parse RGB
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // Lighten by blending with white
  const newR = Math.round(r + (255 - r) * amount);
  const newG = Math.round(g + (255 - g) * amount);
  const newB = Math.round(b + (255 - b) * amount);

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

// Grid layout constants
const GRID_PADDING = 12;
const GRID_GAP = 10;

export default function BoardDetailScreen() {
  const router = useRouter();
  const { hashtag } = useLocalSearchParams<{ hashtag: string }>();
  const { getNotesByLabel } = useNoteStore();
  const { getDesignById } = useDesignStore();
  const { getBoardByHashtag } = useBoardStore();
  const { getDesignById: getBoardDesignById } = useBoardDesignStore();
  const { colors, isDark } = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  // Calculate item width based on current screen width (responsive)
  const itemWidth = (screenWidth - GRID_PADDING * 2 - GRID_GAP) / 2;

  // Decode hashtag from URL
  const decodedHashtag = decodeURIComponent(hashtag || '');

  // Get notes with this hashtag
  const notes = getNotesByLabel(decodedHashtag);

  // Get board and its custom design (if any)
  const board = getBoardByHashtag(decodedHashtag);
  const customBoardDesign = board?.boardDesignId
    ? getBoardDesignById(board.boardDesignId)
    : null;

  // Get preset for this hashtag as fallback
  const preset = getPresetForHashtag(decodedHashtag);

  // Use custom board design colors if available, otherwise fall back to preset or defaults
  const boardColors = useMemo(() => {
    if (customBoardDesign) {
      return {
        headerBg: customBoardDesign.header.backgroundColor,
        textColor: customBoardDesign.header.textColor,
        badgeBg: customBoardDesign.header.badgeColor,
        badgeTextColor: customBoardDesign.header.badgeTextColor,
        accentColor: customBoardDesign.header.badgeColor,
        boardIcon: '', // Custom designs don't have preset icons
      };
    }
    if (preset) {
      return {
        headerBg: preset.colors.bg,
        textColor: preset.colors.labelText,
        badgeBg: preset.colors.badge,
        badgeTextColor: preset.colors.badgeText,
        accentColor: preset.colors.accent,
        boardIcon: preset.boardIcon || '',
      };
    }
    return {
      headerBg: colors.backgroundSecondary,
      textColor: colors.textPrimary,
      badgeBg: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
      badgeTextColor: colors.textSecondary,
      accentColor: colors.accent,
      boardIcon: '',
    };
  }, [customBoardDesign, preset, colors, isDark]);

  const { headerBg, textColor, badgeBg, badgeTextColor, accentColor, boardIcon } = boardColors;

  // Get the icon component
  const IconComponent = boardIcon ? BOARD_ICON_MAP[boardIcon] : null;

  // Create gradient colors - header color to lighter version
  const gradientColors = useMemo(() => {
    const lighterBg = lightenColor(headerBg, 0.5);
    return [headerBg, lighterBg] as const;
  }, [headerBg]);

  const handleNotePress = (note: Note) => {
    router.push(`/note/${note.id}`);
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📝</Text>
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
        No notes
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Notes with #{decodedHashtag} will appear here
      </Text>
    </View>
  );

  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.4 }}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Background Icon - Phosphor icon with accent color */}
        {IconComponent ? (
          <View style={styles.backgroundIcon}>
            <IconComponent
              size={140}
              color={accentColor}
              weight={boardIcon === 'HeartBreak' ? 'fill' : 'duotone'}
            />
          </View>
        ) : null}

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={textColor} />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={[styles.hashtag, { color: textColor }]} numberOfLines={1}>
              # {decodedHashtag}
            </Text>
          </View>

          <View style={[styles.badge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.badgeText, { color: badgeTextColor }]}>
              {notes.length}
            </Text>
          </View>
        </View>

        {/* Note Grid */}
        {notes.length === 0 ? (
          renderEmpty()
        ) : (
          <FlatList
            data={notes}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.gridContent}
            columnWrapperStyle={styles.gridRow}
            renderItem={({ item }) => (
              <View style={{ width: itemWidth, marginBottom: 10 }}>
                <NoteCard
                  note={item}
                  design={item.designId ? getDesignById(item.designId) : null}
                  onPress={() => handleNotePress(item)}
                  isDark={isDark}
                  context="grid"
                  hideIcon
                />
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundIcon: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    opacity: 0.35,
    zIndex: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 24,
    paddingBottom: 12,
    zIndex: 1,
  },
  backButton: {
    padding: 4,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  hashtag: {
    fontSize: 18,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  gridContent: {
    padding: GRID_PADDING,
  },
  gridRow: {
    gap: GRID_GAP,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
