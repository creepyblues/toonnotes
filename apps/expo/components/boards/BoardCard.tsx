/**
 * BoardCard - Magazine Cover style board card
 *
 * Features:
 * - 3:4 aspect ratio for 2-column grid
 * - Diagonal gradient background (preset bg → accent blend)
 * - Label badge (preset name) floating top-left
 * - Mode badge with icon + shortLabel
 * - Large centered board title with auto-contrast
 * - Note-title pills along bottom edge
 * - Decorative circle + emoji overlays
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BoardData, Mode } from '@/types';
import { getModeConfig } from '@/constants/modeConfig';
import { getPresetForHashtag } from '@/constants/boardPresets';
import { Hash } from 'phosphor-react-native';

interface BoardCardProps {
  board: BoardData;
  isDark: boolean;
  onPress: () => void;
  onNotePress?: (noteId: string) => void;
  onLongPress?: () => void;
  mode?: Mode;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getContrastText(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1a1a2e' : '#ffffff';
}

const MAX_PILLS = 4;

export function BoardCard({
  board,
  isDark,
  onPress,
  onNotePress,
  onLongPress,
  mode,
}: BoardCardProps) {
  const preset = getPresetForHashtag(board.hashtag);
  const modeConfig = mode ? getModeConfig(mode) : null;
  const ModeIcon = modeConfig?.icon;

  const textColor = getContrastText(preset.colors.bg);
  const subtleText = hexToRgba(textColor, 0.6);

  const gradientColors = [
    preset.colors.bg,
    hexToRgba(preset.colors.bg, 0.8),
    hexToRgba(preset.colors.accent, 0.3),
  ] as const;

  const previewNotes = board.previewNotes.slice(0, MAX_PILLS);

  return (
    <View style={styles.shadowWrapper}>
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.85}
        style={styles.cardTouchable}
        delayLongPress={400}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Decorative circle (top-right) */}
          <View
            style={[
              styles.decorativeCircle,
              { backgroundColor: preset.colors.accent },
            ]}
          />

          {/* Decorative emoji (faded) */}
          {preset.decorations.length > 0 && (
            <View style={styles.decorativeEmoji}>
              <Text style={styles.decorativeEmojiText}>
                {preset.decorations[0]}
              </Text>
            </View>
          )}

          {/* Top row: label badge + mode badge */}
          <View style={styles.topRow}>
            <View style={styles.topBadges}>
              {/* Label (preset name) badge */}
              <View
                style={[
                  styles.labelBadge,
                  { backgroundColor: hexToRgba(textColor, 0.15) },
                ]}
              >
                <Text
                  style={[styles.labelBadgeText, { color: textColor }]}
                  numberOfLines={1}
                >
                  {preset.name}
                </Text>
              </View>

              {/* Mode badge */}
              {ModeIcon && modeConfig && (
                <View
                  style={[
                    styles.modeBadge,
                    { backgroundColor: hexToRgba(modeConfig.color, 0.2) },
                  ]}
                >
                  <ModeIcon size={10} weight="fill" color={modeConfig.color} />
                  <Text
                    style={[styles.modeBadgeText, { color: modeConfig.color }]}
                  >
                    {modeConfig.shortLabel}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Center: large title + note count */}
          <View style={styles.centerContent}>
            <Text
              style={[styles.title, { color: textColor }]}
              numberOfLines={2}
            >
              {board.hashtag}
            </Text>
            <Text style={[styles.noteCount, { color: subtleText }]}>
              {board.noteCount} {board.noteCount === 1 ? 'note' : 'notes'}
            </Text>
          </View>

          {/* Bottom: note-title pills */}
          <View style={styles.bottomPills}>
            {previewNotes.length > 0 ? (
              <>
                {previewNotes.map((note) => (
                  <View
                    key={note.id}
                    style={[
                      styles.pill,
                      { backgroundColor: hexToRgba(textColor, 0.12) },
                    ]}
                  >
                    <Text
                      style={[styles.pillText, { color: textColor }]}
                      numberOfLines={1}
                    >
                      {note.title || 'Untitled'}
                    </Text>
                  </View>
                ))}
                {board.noteCount > MAX_PILLS && (
                  <Text style={[styles.pillOverflow, { color: subtleText }]}>
                    +{board.noteCount - MAX_PILLS}
                  </Text>
                )}
              </>
            ) : (
              <View style={styles.emptyPill}>
                <Hash size={10} color={preset.colors.accent} />
                <Text
                  style={[styles.emptyPillText, { color: subtleText }]}
                >
                  No notes yet
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderRadius: 16,
  },
  cardTouchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  card: {
    aspectRatio: 3 / 4,
    padding: 14,
    justifyContent: 'space-between',
  },
  // Decorative elements
  decorativeCircle: {
    position: 'absolute',
    top: -24,
    right: -24,
    width: 96,
    height: 96,
    borderRadius: 48,
    opacity: 0.2,
  },
  decorativeEmoji: {
    position: 'absolute',
    bottom: 60,
    right: 8,
    opacity: 0.1,
  },
  decorativeEmojiText: {
    fontSize: 44,
  },
  // Top row
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  topBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
  },
  labelBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  labelBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  modeBadgeText: {
    fontSize: 9,
    fontWeight: '600',
  },
  // Center content
  centerContent: {
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  noteCount: {
    fontSize: 13,
    marginTop: 4,
  },
  // Bottom pills
  bottomPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    alignItems: 'center',
    zIndex: 10,
  },
  pill: {
    maxWidth: 120,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '500',
  },
  pillOverflow: {
    fontSize: 10,
    paddingHorizontal: 4,
  },
  emptyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptyPillText: {
    fontSize: 10,
    fontStyle: 'italic',
  },
});

export default BoardCard;
