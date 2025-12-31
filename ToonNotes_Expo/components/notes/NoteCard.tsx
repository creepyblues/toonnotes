/**
 * NoteCard - Clean iOS-style note card
 *
 * Features:
 * - Square aspect ratio
 * - Clean rounded corners with subtle shadow (iOS-native feel)
 * - Stickers and decorations preserved (per user preference)
 * - Memoized to prevent unnecessary re-renders
 */

import React, { memo, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Check } from 'phosphor-react-native';
import { Note, NoteDesign, DesignViewContext } from '@/types';
import { composeStyle } from '@/services/designEngine';
import { useFontsLoaded } from '@/app/_layout';
import { SYSTEM_FONT_FALLBACKS, PresetFontStyle } from '@/constants/fonts';
import {
  // Productivity
  CheckSquare,
  CheckCircle,
  Spinner,
  Hourglass,
  Star,
  Archive,
  Target,
  // Planning
  Users,
  Calendar,
  Alarm,
  Folder,
  // Checklists
  ShoppingCart,
  Suitcase,
  MapPin,
  MapTrifold,
  // Reading
  BookOpen,
  Television,
  BookmarkSimple,
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
  SunHorizon,
  Tray,
  IconProps,
} from 'phosphor-react-native';

// Phosphor icon mapping for note cards (small, crisp icons)
const NOTE_ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  // Productivity
  CheckSquare,
  CheckCircle,
  Spinner,
  Hourglass,
  Star,
  Archive,
  Target,
  // Planning
  Users,
  Calendar,
  Alarm,
  Folder,
  // Checklists
  ShoppingCart,
  Suitcase,
  MapPin,
  MapTrifold,
  // Reading
  BookOpen,
  Television,
  BookmarkSimple,
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
  SunHorizon,
  Tray,
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

// Parse line to detect checkbox or bullet
function parseLineType(line: string): { type: 'checkbox' | 'bullet' | 'text'; checked?: boolean; text: string } {
  // Checkbox patterns: - [ ], - [], -[ ], -[], [ ], [] (with flexible spacing)
  const uncheckedMatch = line.match(/^-?\s*\[\s*\]\s*/);
  const checkedMatch = line.match(/^-?\s*\[[xX]\]\s*/);

  if (checkedMatch) {
    return { type: 'checkbox', checked: true, text: line.replace(/^-?\s*\[[xX]\]\s*/, '') };
  }
  if (uncheckedMatch) {
    return { type: 'checkbox', checked: false, text: line.replace(/^-?\s*\[\s*\]\s*/, '') };
  }

  // Bullet patterns: •, * at start
  const bulletMatch = line.match(/^([•\*])\s*/);
  // dash followed by space but NOT [ (to avoid matching checkbox prefix)
  const dashBulletMatch = line.match(/^-\s+(?!\[)/);

  if (bulletMatch) {
    return { type: 'bullet', text: line.replace(/^[•\*]\s*/, '') };
  }
  if (dashBulletMatch) {
    return { type: 'bullet', text: line.replace(/^-\s+/, '') };
  }

  return { type: 'text', text: line };
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

  // Parse content into lines with formatting
  const parsedLines = useMemo(() => {
    const lines = note.content.slice(0, 200).split('\n').slice(0, compact ? 4 : 6);
    return lines.map(line => parseLineType(line));
  }, [note.content, compact]);

  const hasMore = note.content.length > 200 || note.content.split('\n').length > (compact ? 4 : 6);

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
    // Always use system font for content text
    return 'System';
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
            elevation: compact ? 0 : 2,
          },
        ]}
        accessibilityLabel={note.title || 'Untitled note'}
        accessibilityHint={note.content ? `Contains: ${note.content.slice(0, 50)}${note.content.length > 50 ? '...' : ''}` : 'Empty note'}
        accessibilityRole="button"
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

        {/* Content preview with formatted checkboxes and bullets */}
        <View style={[styles.content, { flex: 1, overflow: 'hidden' }]}>
          {parsedLines.slice(0, compact ? 3 : (note.labels.length > 0 ? 4 : 5)).map((line, index) => {
            const fontSize = compact ? 11 : (style.fontStyle === 'mono' ? 11 : 13);
            const lineHeight = compact ? 15 : 18;

            if (line.type === 'checkbox') {
              return (
                <View key={index} style={styles.checkboxLine}>
                  {line.checked ? (
                    <View style={[styles.checkboxChecked, { backgroundColor: style.accentColor || '#10B981' }]}>
                      <Check size={8} color="#FFF" weight="bold" />
                    </View>
                  ) : (
                    <View style={[styles.checkboxUnchecked, { borderColor: isDark ? '#666' : '#CCC' }]} />
                  )}
                  <Text
                    style={[
                      styles.checkboxText,
                      {
                        color: line.checked ? (isDark ? '#888' : '#999') : style.bodyColor,
                        fontFamily: getBodyFont(),
                        fontSize,
                        textDecorationLine: line.checked ? 'line-through' : 'none',
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {line.text}
                  </Text>
                </View>
              );
            }

            if (line.type === 'bullet') {
              return (
                <View key={index} style={styles.bulletLine}>
                  <Text style={[styles.bulletDot, { color: style.bodyColor, fontSize }]}>•</Text>
                  <Text
                    style={{
                      color: style.bodyColor,
                      fontFamily: getBodyFont(),
                      fontSize,
                      lineHeight,
                      flex: 1,
                      opacity: 0.85,
                    }}
                    numberOfLines={1}
                  >
                    {line.text}
                  </Text>
                </View>
              );
            }

            // Regular text
            return (
              <Text
                key={index}
                style={{
                  color: style.bodyColor,
                  fontFamily: getBodyFont(),
                  fontSize,
                  lineHeight,
                  opacity: 0.85,
                }}
                numberOfLines={1}
              >
                {line.text}
              </Text>
            );
          })}
          {hasMore && (
            <Text style={{ color: style.bodyColor, opacity: 0.5, fontSize: compact ? 11 : 13 }}>...</Text>
          )}
        </View>

        {/* Bottom row: Labels on left, Icon/Sticker on right - hidden in compact mode */}
        {!compact && (note.labels.length > 0 || !hideIcon) && (
          <View style={styles.bottomRow}>
            {/* Primary Label Only */}
            <View style={styles.labelsContainer}>
              {note.labels.length > 0 && (
                <View
                  style={[
                    styles.labelPill,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.16)'
                        : 'rgba(60, 60, 67, 0.12)',
                    },
                  ]}
                >
                  <Text style={[styles.labelText, { color: isDark ? '#E5E5E7' : '#3C3C43' }]}>
                    #{note.labels[0]}
                  </Text>
                </View>
              )}
              {note.labels.length > 1 && (
                <Text style={[styles.moreLabels, { color: isDark ? '#98989D' : '#8E8E93' }]}>
                  +{note.labels.length - 1}
                </Text>
              )}
            </View>

            {/* Icon or Sticker */}
            {!hideIcon && (
              design?.sticker?.imageUri ? (
                // Character sticker from design
                <Image
                  source={{ uri: design.sticker.imageUri }}
                  style={styles.stickerThumbnail}
                  resizeMode="contain"
                />
              ) : style.noteIcon && NOTE_ICON_MAP[style.noteIcon] ? (
                // Phosphor icon for notes (crisp, monochrome)
                (() => {
                  const IconComponent = NOTE_ICON_MAP[style.noteIcon];
                  return (
                    <IconComponent
                      size={24}
                      color={style.bodyColor}
                      weight={style.noteIcon === 'Star' || style.noteIcon === 'Heart' ? 'fill' : 'regular'}
                      style={styles.bottomIcon}
                    />
                  );
                })()
              ) : style.labelIcon ? (
                // Fallback to emoji icon
                <Text style={[styles.bottomIconEmoji, { color: style.bodyColor }]}>
                  {style.labelIcon}
                </Text>
              ) : null
            )}
          </View>
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
  checkboxLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  checkboxUnchecked: {
    width: 12,
    height: 12,
    borderRadius: 2,
    borderWidth: 1.5,
    marginRight: 6,
  },
  checkboxChecked: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxText: {
    flex: 1,
  },
  bulletLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  bulletDot: {
    width: 14,
    marginRight: 4,
    textAlign: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 8,
  },
  labelsContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    flex: 1,
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
  stickerThumbnail: {
    width: 28,
    height: 28,
    opacity: 0.7,
  },
  bottomIcon: {
    opacity: 0.5,
  },
  bottomIconEmoji: {
    fontSize: 20,
    opacity: 0.5,
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
