/**
 * NoteCard - Clean iOS-style note card
 *
 * Features:
 * - Square aspect ratio
 * - Clean rounded corners with subtle shadow (iOS-native feel)
 * - Stickers and decorations preserved (per user preference)
 * - Memoized to prevent unnecessary re-renders
 */

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Note, NoteDesign, DesignViewContext } from '@/types';
import { composeStyle } from '@/services/designEngine';
import { useFontsLoaded } from '@/app/_layout';
import { SYSTEM_FONT_FALLBACKS, PresetFontStyle } from '@/constants/fonts';
import {
  // Productivity
  CheckSquare,
  Star,
  Archive,
  Target,
  // Reading
  BookOpen,
  Television,
  ChatCircleText,
  HeartStraight,
  // Creative
  Lightbulb,
  Brain,
  UserCircle,
  Heart,
  // Content
  PencilLine,
  NotePencil,
  Quotes,
  MagnifyingGlass,
  // Personal
  Notebook,
  Camera,
  Sparkle,
  Palette,
  IconProps,
} from 'phosphor-react-native';

// Phosphor icon mapping for note cards (small, crisp icons)
const NOTE_ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  // Productivity
  CheckSquare,
  Star,
  Archive,
  Target,
  // Reading
  BookOpen,
  Television,
  ChatCircleText,
  HeartStraight,
  // Creative
  Lightbulb,
  Brain,
  UserCircle,
  Heart,
  // Content
  PencilLine,
  NotePencil,
  Quotes,
  MagnifyingGlass,
  // Personal
  Notebook,
  Camera,
  Sparkle,
  Palette,
};

interface NoteCardProps {
  note: Note;
  design?: NoteDesign | null;
  onPress: () => void;
  isDark?: boolean;
  context?: DesignViewContext;
  compact?: boolean; // For board previews - removes aspect ratio constraint
  hideIcon?: boolean; // Hide label icon (when board already shows it)
}

/**
 * Custom comparison function for React.memo
 * Only re-render if relevant props have changed
 */
function arePropsEqual(
  prevProps: NoteCardProps,
  nextProps: NoteCardProps
): boolean {
  // Check primitive props
  if (prevProps.isDark !== nextProps.isDark) return false;
  if (prevProps.context !== nextProps.context) return false;
  if (prevProps.compact !== nextProps.compact) return false;
  if (prevProps.hideIcon !== nextProps.hideIcon) return false;

  // Check note changes (comparing relevant fields only)
  const prevNote = prevProps.note;
  const nextNote = nextProps.note;
  if (prevNote.id !== nextNote.id) return false;
  if (prevNote.title !== nextNote.title) return false;
  if (prevNote.content !== nextNote.content) return false;
  if (prevNote.color !== nextNote.color) return false;
  if (prevNote.isPinned !== nextNote.isPinned) return false;
  if (prevNote.designId !== nextNote.designId) return false;
  if (prevNote.updatedAt !== nextNote.updatedAt) return false;

  // Check labels (shallow array comparison)
  if (prevNote.labels.length !== nextNote.labels.length) return false;
  for (let i = 0; i < prevNote.labels.length; i++) {
    if (prevNote.labels[i] !== nextNote.labels[i]) return false;
  }

  // Check design changes
  if (prevProps.design?.id !== nextProps.design?.id) return false;
  if (prevProps.design?.createdAt !== nextProps.design?.createdAt) return false;

  // Props are equal, skip re-render
  return true;
}

function NoteCardComponent({
  note,
  design = null,
  onPress,
  isDark = false,
  context = 'grid',
  compact = false,
  hideIcon = false,
}: NoteCardProps) {
  // Check if Google Fonts are loaded
  const fontsLoaded = useFontsLoaded();

  // Get preview text (more chars to fill space above hashtags)
  const previewText = note.content.slice(0, 150);
  const hasMore = note.content.length > 150;

  // Compose style using DesignEngine
  const style = composeStyle(design, note.color, context, isDark);

  // Get font family with fallback
  const getTitleFont = () => {
    if (fontsLoaded && style.titleFontFamily) {
      return style.titleFontFamily;
    }
    // Fallback to system font based on style category
    const fontStyle = (style.fontStyle || 'sans-serif') as PresetFontStyle;
    return SYSTEM_FONT_FALLBACKS[fontStyle] || 'System';
  };

  const getBodyFont = () => {
    if (fontsLoaded && style.bodyFontFamily) {
      return style.bodyFontFamily;
    }
    // Fallback to system font based on style category
    const fontStyle = (style.fontStyle || 'sans-serif') as PresetFontStyle;
    return SYSTEM_FONT_FALLBACKS[fontStyle] || 'System';
  };

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
    <View style={[styles.wrapper, compact && styles.compactWrapper]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={[
          compact ? styles.compactContainer : styles.container,
          {
            backgroundColor: style.backgroundColor,
            borderRadius: compact ? 12 : 16,
            borderWidth: 0.5,
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            // iOS-style shadow
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          },
        ]}
      >
        {/* Decorations (kept per user preference) */}
        {getDecorations()}

        {/* Title */}
        {note.title ? (
          <Text
            style={[
              styles.title,
              {
                color: style.titleColor,
                fontFamily: getTitleFont(),
              },
              // Additional style adjustments per font category
              style.fontStyle === 'mono' && { fontSize: 13 },
              style.fontStyle === 'display' && { letterSpacing: -0.5 },
              // Compact mode: smaller font
              compact && { fontSize: 13, marginBottom: 4 },
            ]}
            numberOfLines={compact ? 1 : 2}
          >
            {note.title}
          </Text>
        ) : null}

        {/* Content preview */}
        <Text
          style={[
            styles.content,
            {
              color: style.bodyColor,
              fontFamily: getBodyFont(),
            },
            // Additional style adjustments per font category
            style.fontStyle === 'mono' && { fontSize: 11 },
            // Compact mode: smaller font
            compact && { fontSize: 11, lineHeight: 15 },
          ]}
          numberOfLines={compact ? 3 : (note.title ? 5 : 6)}
        >
          {previewText}
          {hasMore && '...'}
        </Text>

        {/* Labels - hidden in compact mode */}
        {!compact && note.labels.length > 0 && (
          <View style={styles.labelsContainer}>
            {note.labels.slice(0, 2).map((label) => (
              <View
                key={label}
                style={[
                  styles.labelPill,
                  {
                    backgroundColor: isDark
                      ? 'rgba(167, 139, 250, 0.15)'
                      : 'rgba(124, 58, 237, 0.08)',
                  },
                ]}
              >
                <Text style={[styles.labelText, { color: isDark ? '#C4B5FD' : '#7C3AED' }]}>
                  #{label}
                </Text>
              </View>
            ))}
            {note.labels.length > 2 && (
              <Text style={[styles.moreLabels, { color: isDark ? '#A78BFA' : '#7C3AED' }]}>
                +{note.labels.length - 2}
              </Text>
            )}
          </View>
        )}

        {/* Bottom right icon - stickers only shown in note edit page, not in card previews */}
        {!compact && !hideIcon && (
          style.noteIcon && NOTE_ICON_MAP[style.noteIcon] ? (
            // Phosphor icon for notes (crisp, monochrome)
            (() => {
              const IconComponent = NOTE_ICON_MAP[style.noteIcon];
              return (
                <View style={styles.bottomRightIcon}>
                  <IconComponent
                    size={24}
                    color={style.bodyColor}
                    weight={style.noteIcon === 'Star' || style.noteIcon === 'Heart' ? 'fill' : 'regular'}
                  />
                </View>
              );
            })()
          ) : style.labelIcon ? (
            // Fallback to emoji icon
            <Text style={styles.bottomRightIconEmoji}>
              {style.labelIcon}
            </Text>
          ) : null
        )}

        {/* Design indicator */}
        {design && (
          <View
            style={[
              styles.designIndicator,
              { backgroundColor: style.accentColor },
              compact && { height: 2, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
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
  compactWrapper: {
    flex: 1,
  },
  container: {
    aspectRatio: 1, // Square!
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  compactContainer: {
    flex: 1,
    padding: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  title: {
    fontWeight: '600',
    marginBottom: 6,
    fontSize: 15,
    letterSpacing: -0.24,
  },
  content: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
    opacity: 0.85,
  },
  labelsContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    marginTop: 8,
    gap: 6,
    overflow: 'hidden',
  },
  labelPill: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '500',
  },
  moreLabels: {
    fontSize: 11,
    fontWeight: '500',
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
  bottomRightIcon: {
    position: 'absolute',
    bottom: 6,
    right: 8,
    opacity: 0.5,
    zIndex: 1,
  },
  bottomRightIconEmoji: {
    position: 'absolute',
    bottom: 4,
    right: 8,
    fontSize: 27,
    opacity: 0.4,
    zIndex: 1,
  },
  designIndicator: {
    position: 'absolute',
    bottom: -0.5,
    left: 0,
    right: 0,
    height: 3,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
});

// Export memoized component
export const NoteCard = memo(NoteCardComponent, arePropsEqual);
