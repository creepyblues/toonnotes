/**
 * BoardCard - Full-width board card with note previews
 *
 * Features:
 * - Full-width single column layout
 * - Gradient background (bg → bgSecondary) for softer visual feel
 * - Shows actual note content/design previews using NoteCard
 * - Phosphor icons for board decoration
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BoardData } from '@/types';
import { getPresetForHashtag } from '@/constants/boardPresets';
import { useDesignStore } from '@/stores';
import { NoteCard } from '@/components/notes/NoteCard';
import { useFontsLoaded } from '@/app/_layout';
import { getPresetFonts, PresetFontStyle, SYSTEM_FONT_FALLBACKS } from '@/constants/fonts';
import { LabelPresetId, getPresetById } from '@/constants/labelPresets';
import {
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
  // Auto-generated theme icons
  ForkKnife,
  CookingPot,
  Coffee,
  Hamburger,
  BowlFood,
  Desktop,
  Code,
  Cpu,
  DeviceMobile,
  CloudArrowUp,
  Tree,
  Leaf,
  Mountains,
  Compass,
  Sun,
  MusicNotes,
  Palette,
  Camera,
  PencilLine,
  Microphone,
  Heartbeat,
  Barbell,
  PersonSimpleRun,
  Heart,
  Bicycle,
  CurrencyDollar,
  PiggyBank,
  ChartLineUp,
  Wallet,
  Coins,
  Users,
  Gift,
  Confetti,
  HandHeart,
  ChatCircle,
  GraduationCap,
  BookOpen,
  Brain,
  Student,
  Notebook,
  Hash,
  IconProps,
} from 'phosphor-react-native';

// Phosphor icon mapping for board cards (large, expressive, duotone)
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
  // Auto-generated theme icons
  ForkKnife,
  CookingPot,
  Coffee,
  Hamburger,
  BowlFood,
  Desktop,
  Code,
  Cpu,
  DeviceMobile,
  CloudArrowUp,
  Tree,
  Leaf,
  Mountains,
  Compass,
  Sun,
  MusicNotes,
  Palette,
  Camera,
  PencilLine,
  Microphone,
  Heartbeat,
  Barbell,
  PersonSimpleRun,
  Heart,
  Bicycle,
  CurrencyDollar,
  PiggyBank,
  ChartLineUp,
  Wallet,
  Coins,
  Users,
  Gift,
  Confetti,
  HandHeart,
  ChatCircle,
  GraduationCap,
  BookOpen,
  Brain,
  Student,
  Notebook,
  Hash,
};

interface BoardCardProps {
  board: BoardData;
  isDark: boolean;
  onPress: () => void;
  onNotePress?: (noteId: string) => void;
}

const CARD_HEIGHT = 260;
const NOTE_SIZE = 150; // Square notes

export function BoardCard({
  board,
  isDark,
  onPress,
  onNotePress,
}: BoardCardProps) {
  // Get preset for this board's hashtag
  const preset = getPresetForHashtag(board.hashtag);
  const { getDesignById } = useDesignStore();
  const fontsLoaded = useFontsLoaded();

  // Get font for this preset (from label preset which has fontStyle)
  const getHashtagFont = () => {
    if (preset) {
      const labelPreset = getPresetById(preset.id as LabelPresetId);
      const fontStyle = labelPreset?.fontStyle || 'sans-serif';

      if (fontsLoaded) {
        const fonts = getPresetFonts(preset.id as LabelPresetId, fontStyle as PresetFontStyle);
        return fonts.titleFontFamily;
      }
      // Return system fallback while fonts load (Android loads fonts async)
      return SYSTEM_FONT_FALLBACKS[fontStyle as PresetFontStyle] || 'System';
    }
    return undefined;
  };

  // Colors from preset or defaults
  const bgColor = preset?.colors.bg ?? (isDark ? '#2D3436' : '#F5F5F5');
  const bgSecondary = preset?.colors.bgSecondary ?? (isDark ? '#4A4A4A' : '#E8E8E8');
  const textColor = preset?.colors.labelText ?? (isDark ? '#FFFFFF' : '#2D3436');
  const badgeBg = preset?.colors.badge ?? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)');
  const badgeTextColor = preset?.colors.badgeText ?? (isDark ? '#FFFFFF' : '#2D3436');

  // Gradient colors: primary at top, lighter secondary at bottom (softens intensity)
  const gradientColors = [bgColor, bgSecondary] as const;

  // Get board icon component
  const boardIconName = preset?.boardIcon ?? '';
  const IconComponent = boardIconName ? BOARD_ICON_MAP[boardIconName] : null;

  // Get all preview notes for horizontal scroll
  const previewNotes = board.previewNotes;

  return (
    <View style={styles.shadowWrapper}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={styles.cardTouchable}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.7 }}
          style={styles.card}
        >
          {/* Background Icon - Phosphor icon with accent color */}
          {IconComponent && preset ? (
            <View style={styles.backgroundIcon}>
              <IconComponent
                size={80}
                color={preset.colors.accent}
                weight={boardIconName === 'HeartBreak' ? 'fill' : 'duotone'}
              />
            </View>
          ) : null}

          {/* Header Row */}
          <View style={styles.header}>
            <Text style={[
              styles.hashtag,
              { color: textColor, fontFamily: getHashtagFont() },
              // Remove bold weight for custom fonts (Android can't synthesize weights)
              getHashtagFont() && { fontWeight: 'normal' },
            ]} numberOfLines={1}>
              #{board.hashtag}
            </Text>
            <View style={[styles.badge, { backgroundColor: badgeBg }]}>
              <Text style={[styles.badgeText, { color: badgeTextColor }]}>
                {board.noteCount}
              </Text>
            </View>
          </View>

          {/* Note Previews - Horizontal Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.notesScroll}
            contentContainerStyle={styles.notesScrollContent}
          >
            {previewNotes.map((note) => (
              <View key={note.id} style={styles.noteWrapper}>
                <NoteCard
                  note={note}
                  design={note.designId ? getDesignById(note.designId) : null}
                  onPress={onNotePress ? () => onNotePress(note.id) : () => {}}
                  isDark={isDark}
                  context="grid"
                  compact
                />
              </View>
            ))}
            {/* Show placeholder if no notes */}
            {previewNotes.length === 0 && (
              <View style={styles.emptySlot}>
                <Text style={styles.emptyText}>No notes yet</Text>
              </View>
            )}
          </ScrollView>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    // Subtle shadow (light from top-left)
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderRadius: 16,
  },
  cardTouchable: {
    borderRadius: 16,
    overflow: 'hidden', // Clip gradient to rounded corners
  },
  card: {
    height: CARD_HEIGHT,
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  backgroundIcon: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    opacity: 0.35,
    zIndex: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  hashtag: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  notesScroll: {
    flex: 1,
    marginHorizontal: -24, // Extend to card edges
    paddingHorizontal: 24,
  },
  notesScrollContent: {
    gap: 12,
    paddingRight: 24,
  },
  noteWrapper: {
    width: NOTE_SIZE,
    height: NOTE_SIZE,
    opacity: 0.9,
  },
  emptySlot: {
    width: NOTE_SIZE,
    height: NOTE_SIZE,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    opacity: 0.5,
    color: '#FFF',
  },
});

export default BoardCard;
