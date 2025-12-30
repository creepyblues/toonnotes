import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  Image,
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  CaretLeft,
  PushPin,
  PushPinSlash,
  Archive,
  Trash,
  DotsThreeVertical,
  Sparkle,
  X,
  Plus,
  Hash,
  Check,
  // Label icons for note editor
  CheckSquare,
  Star,
  Archive as ArchiveIcon,
  Target,
  BookOpen,
  Television,
  ChatCircleText,
  HeartStraight,
  Lightbulb,
  Brain,
  UserCircle,
  Heart,
  PencilLine,
  NotePencil,
  Quotes,
  MagnifyingGlass,
  Notebook,
  Camera,
  Palette,
  IconProps,
} from 'phosphor-react-native';

// Phosphor icon mapping for label icons
const NOTE_ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  CheckSquare,
  Star,
  Archive: ArchiveIcon,
  Target,
  BookOpen,
  Television,
  ChatCircleText,
  HeartStraight,
  Lightbulb,
  Brain,
  UserCircle,
  Heart,
  PencilLine,
  NotePencil,
  Quotes,
  MagnifyingGlass,
  Notebook,
  Camera,
  Sparkle,
  Palette,
};

import { useNoteStore, useDesignStore, useUserStore } from '@/stores';
import { useTheme } from '@/src/theme';
import { NoteColor, NoteDesign } from '@/types';
import { composeStyle } from '@/services/designEngine';
import { BackgroundLayer } from '@/components/BackgroundLayer';
import { DesignCard } from '@/components/designs/DesignCard';
import {
  CATEGORY_COLORS,
  LabelPreset,
  LABEL_PRESET_LIST,
} from '@/constants/labelPresets';
import { useFontsLoaded } from '@/app/_layout';
import { SYSTEM_FONT_FALLBACKS, PresetFontStyle } from '@/constants/fonts';

// Note color options for the color picker
const NOTE_COLORS = [
  { name: 'White', value: NoteColor.White },
  { name: 'Lavender', value: NoteColor.Lavender },
  { name: 'Rose', value: NoteColor.Rose },
  { name: 'Peach', value: NoteColor.Peach },
  { name: 'Mint', value: NoteColor.Mint },
  { name: 'Sky', value: NoteColor.Sky },
  { name: 'Violet', value: NoteColor.Violet },
];

// Helper to get tag color by index (cycles through available colors)
const TAG_COLOR_KEYS = ['purple', 'blue', 'green', 'orange', 'pink', 'teal'] as const;

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    getNoteById,
    updateNote,
    deleteNote,
    archiveNote,
    pinNote,
    unpinNote,
    labels,
    addLabel,
    addLabelToNote,
    removeLabelFromNote,
    setActiveDesignLabel,
  } = useNoteStore();
  const { designs, getDesignById } = useDesignStore();
  const { settings } = useUserStore();
  const { isDark, colors, tagColors } = useTheme();

  const note = getNoteById(id || '');
  const currentDesign = note?.designId ? getDesignById(note.designId) : null;

  // Check if Google Fonts are loaded
  const fontsLoaded = useFontsLoaded();

  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [color, setColor] = useState<NoteColor>(note?.color || NoteColor.White);
  const [designId, setDesignId] = useState<string | undefined>(note?.designId);

  // Sync designId from note when it changes (e.g., after navigation, store hydration, or auto-apply)
  useEffect(() => {
    if (note?.designId !== designId) {
      setDesignId(note?.designId);
    }
  }, [note?.designId]);
  const [showMenu, setShowMenu] = useState(false);
  const [showDesignPicker, setShowDesignPicker] = useState(false);

  // Hashtag autocomplete state
  const [showHashtagAutocomplete, setShowHashtagAutocomplete] = useState(false);
  const [hashtagQuery, setHashtagQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [hashtagInputValue, setHashtagInputValue] = useState('');

  // Get active design for styling
  const activeDesign = designId ? getDesignById(designId) : null;

  // Check if the active design is from a label preset
  const activeDesignLabelName = note?.activeDesignLabelId;

  // Compose style using DesignEngine for detail context
  const style = composeStyle(activeDesign ?? null, color, 'detail', isDark);

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

  // Auto-save on changes (use `id` from params to avoid stale closure with `note`)
  useEffect(() => {
    if (!note || !id) return;

    const timeout = setTimeout(() => {
      updateNote(id, { title, content, color, designId });
    }, 500);

    return () => clearTimeout(timeout);
  }, [id, note, title, content, color, designId, updateNote]);

  // Regex to detect hashtag being typed
  const HASHTAG_TYPING_REGEX = /#(\w*)$/;

  // Filter existing labels based on hashtag query or input field
  // Show all labels when query is empty, filter when query has text
  // Sort by lastUsedAt (most recent first), then by createdAt
  const filteredLabels = useMemo(() => {
    // Use input field value if available, otherwise use inline hashtag query
    const query = (hashtagInputValue || hashtagQuery).toLowerCase();
    return labels
      .filter(
        (l) =>
          (query === '' || l.name.toLowerCase().includes(query)) &&
          !note?.labels.includes(l.name) // Exclude already applied
      )
      .sort((a, b) => {
        // Sort by lastUsedAt first (most recent first), then by createdAt
        const aTime = a.lastUsedAt || a.createdAt;
        const bTime = b.lastUsedAt || b.createdAt;
        return bTime - aTime;
      });
  }, [labels, hashtagQuery, hashtagInputValue, note?.labels]);

  // Handle content change with hashtag detection
  const handleContentChange = (text: string) => {
    // Detect if user pressed Enter or Space while autocomplete is showing
    // This creates the hashtag automatically
    if (showHashtagAutocomplete && hashtagQuery.length > 0) {
      const lastChar = text.slice(-1);
      const prevLastChar = content.slice(-1);

      // Check if a newline or space was just added
      if ((lastChar === '\n' || lastChar === ' ') && prevLastChar !== '\n' && prevLastChar !== ' ') {
        // Create the hashtag
        handleCreateAndInsertHashtag(hashtagQuery);
        return; // Don't update content - handleCreateAndInsertHashtag will do it
      }
    }

    setContent(text);

    // Check if user is typing a hashtag
    const adjustedCursor = cursorPosition + (text.length - content.length);
    const textBeforeCursor = text.slice(0, adjustedCursor);
    const match = textBeforeCursor.match(HASHTAG_TYPING_REGEX);

    if (match) {
      setHashtagQuery(match[1]); // Text after #
      setShowHashtagAutocomplete(true);
    } else {
      setShowHashtagAutocomplete(false);
      setHashtagQuery('');
    }
  };

  // Track cursor position
  const handleSelectionChange = (
    event: NativeSyntheticEvent<TextInputSelectionChangeEventData>
  ) => {
    setCursorPosition(event.nativeEvent.selection.end);
  };

  // Handle hashtag selection from autocomplete
  const handleSelectHashtag = (tagName: string) => {
    // Check if we're adding from the input field (no inline # typed)
    const isFromInputField = hashtagInputValue.length > 0 || hashtagQuery.length === 0;

    if (!isFromInputField) {
      // Replace the partial #tag with the full hashtag in content
      const textBeforeCursor = content.slice(0, cursorPosition);
      const textAfterCursor = content.slice(cursorPosition);

      // Find where # starts
      const hashIndex = textBeforeCursor.lastIndexOf('#');
      const newContent =
        textBeforeCursor.slice(0, hashIndex) + `#${tagName} ` + textAfterCursor;

      setContent(newContent);
    }

    // Add label to note using the new action (handles auto-apply design)
    if (note && !note.labels.includes(tagName.toLowerCase())) {
      addLabelToNote(note.id, tagName);
    }

    setShowHashtagAutocomplete(false);
    setHashtagQuery('');
    setHashtagInputValue('');
  };

  // Handle creating and inserting a new hashtag
  const handleCreateAndInsertHashtag = (tagName: string) => {
    // Create the label in store if it doesn't exist
    if (!labels.find(l => l.name.toLowerCase() === tagName.toLowerCase())) {
      addLabel(tagName);
    }
    // Then insert it
    handleSelectHashtag(tagName);
  };

  if (!note) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-ink-light">Note not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 px-4 py-2 bg-primary-500 rounded-lg"
        >
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleBack = () => {
    // Save before leaving (including designId to prevent design loss)
    updateNote(note.id, { title, content, color, designId });

    // If note is empty, delete it
    if (!title.trim() && !content.trim()) {
      deleteNote(note.id);
    }

    router.back();
  };

  const handlePin = () => {
    if (note.isPinned) {
      unpinNote(note.id);
    } else {
      pinNote(note.id);
    }
    setShowMenu(false);
  };

  const handleArchive = () => {
    archiveNote(note.id);
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Note',
      'This note will be moved to trash.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteNote(note.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleApplyDesign = (design: NoteDesign) => {
    setDesignId(design.id);
    setShowDesignPicker(false);
  };

  const handleClearDesign = () => {
    setDesignId(undefined);
    if (note) {
      setActiveDesignLabel(note.id, undefined);
    }
    setShowDesignPicker(false);
  };

  // Handle selecting a label preset design
  const handleSelectLabelDesign = (labelName: string, preset: LabelPreset) => {
    const presetDesignId = `label-preset-${preset.id}`;
    setDesignId(presetDesignId);
    if (note) {
      setActiveDesignLabel(note.id, labelName);
    }
    setShowDesignPicker(false);
  };

  // Get sticker position styles
  const getStickerPositionStyle = () => {
    switch (style.stickerPosition) {
      case 'top-left':
        return { top: 80, left: 16 };
      case 'top-right':
        return { top: 80, right: 16 };
      case 'bottom-left':
        return { bottom: 40, left: 16 };
      case 'bottom-right':
      default:
        return { bottom: 40, right: 16 };
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: style.backgroundColor }}
      edges={['top']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        style={{
          borderRadius: 16,
          marginHorizontal: 0,
          // iOS-style shadow
          shadowColor: style.shadowColor,
          shadowOffset: style.shadowOffset,
          shadowOpacity: style.shadowOpacity,
          shadowRadius: style.shadowRadius,
          elevation: style.elevation,
          overflow: 'hidden', // Clip background to border radius
        }}
      >
        <BackgroundLayer style={style} context="detail">

        {/* Sticker overlay (bottom right) - priority over label icon */}
        {style.showSticker && style.stickerUri ? (
          <Image
            source={{ uri: style.stickerUri }}
            style={[
              {
                position: 'absolute',
                width: 160 * style.stickerScale,
                height: 160 * style.stickerScale,
                zIndex: 10,
              },
              getStickerPositionStyle(),
            ]}
            resizeMode="contain"
          />
        ) : style.noteIcon && NOTE_ICON_MAP[style.noteIcon] ? (
          // Label icon (Phosphor) when no sticker is available
          (() => {
            const IconComponent = NOTE_ICON_MAP[style.noteIcon];
            return (
              <View
                style={{
                  position: 'absolute',
                  bottom: 40,
                  right: 20,
                  opacity: 0.15,
                  zIndex: 10,
                }}
              >
                <IconComponent
                  size={120}
                  color={style.bodyColor}
                  weight={style.noteIcon === 'Star' || style.noteIcon === 'Heart' ? 'fill' : 'regular'}
                />
              </View>
            );
          })()
        ) : null}

        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-3 pb-2">
          <TouchableOpacity onPress={handleBack} className="p-2">
            <CaretLeft size={24} color={style.titleColor} weight="regular" />
          </TouchableOpacity>

          <View className="flex-row items-center">
            {/* Pin button */}
            <TouchableOpacity onPress={handlePin} className="p-2">
              {note.isPinned ? (
                <PushPinSlash size={22} color={style.titleColor} weight="regular" />
              ) : (
                <PushPin size={22} color={style.titleColor} weight="regular" />
              )}
            </TouchableOpacity>

            {/* Design picker button */}
            <TouchableOpacity
              onPress={() => setShowDesignPicker(true)}
              className="p-2"
            >
              <Sparkle size={22} color={activeDesign ? '#F59E0B' : style.titleColor} weight={activeDesign ? 'fill' : 'regular'} />
            </TouchableOpacity>

            {/* More menu */}
            <TouchableOpacity
              onPress={() => setShowMenu(!showMenu)}
              className="p-2"
            >
              <DotsThreeVertical size={22} color={style.titleColor} weight="bold" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu dropdown */}
        {showMenu && (
          <View
            style={{
              position: 'absolute',
              top: 56,
              right: 16,
              backgroundColor: isDark ? '#1C1826' : '#FFFFFF',
              borderRadius: 16,
              shadowColor: '#8B5CF6',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
              zIndex: 10,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: isDark ? '#252136' : '#EDE9FE',
            }}
          >
            <TouchableOpacity
              onPress={handleArchive}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? '#252136' : '#EDE9FE',
              }}
            >
              <Archive size={18} color="#10B981" weight="regular" />
              <Text style={{ marginLeft: 12, color: isDark ? '#F5F3FF' : '#1A1625' }}>Archive</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}
            >
              <Trash size={18} color="#EF4444" weight="regular" />
              <Text style={{ marginLeft: 12, color: '#EF4444' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Editor */}
        <ScrollView
          className="flex-1 px-5"
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <TextInput
            className="text-2xl font-bold py-3"
            style={[
              {
                color: style.titleColor,
                fontFamily: getTitleFont(),
              },
              // Additional style adjustments per font category
              style.fontStyle === 'mono' && { fontSize: 20 },
              style.fontStyle === 'display' && { letterSpacing: -0.5 },
            ]}
            placeholder="Title"
            placeholderTextColor={activeDesign ? `${style.titleColor}80` : '#9CA3AF'}
            value={title}
            onChangeText={setTitle}
            multiline
          />

          {/* Content */}
          <TextInput
            className="text-base flex-1 min-h-[300px]"
            style={[
              {
                color: style.bodyColor,
                fontFamily: getBodyFont(),
              },
              // Additional style adjustments per font category
              style.fontStyle === 'mono' && { fontSize: 14 },
            ]}
            placeholder="Start typing... Use # to add labels"
            placeholderTextColor={activeDesign ? `${style.bodyColor}80` : '#9CA3AF'}
            value={content}
            onChangeText={handleContentChange}
            onSelectionChange={handleSelectionChange}
            multiline
            textAlignVertical="top"
          />
        </ScrollView>

        {/* Labels Panel - iOS Style */}
        {showHashtagAutocomplete && (
          <View
            style={{
              backgroundColor: colors.backgroundSecondary,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              borderTopWidth: 1,
              borderTopColor: colors.separator,
              maxHeight: 280,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 10,
              zIndex: 20,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.separator,
              }}
            >
              <Text style={{
                color: colors.textPrimary,
                fontSize: 16,
                fontWeight: '600',
              }}>
                Labels
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowHashtagAutocomplete(false);
                  setHashtagInputValue('');
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color={colors.textSecondary} weight="regular" />
              </TouchableOpacity>
            </View>

            {/* Input field */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: 16,
                marginTop: 12,
                marginBottom: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: isDark ? colors.backgroundTertiary : '#EFEFF0',
              }}
            >
              <Hash size={16} color={colors.textSecondary} weight="regular" />
              <TextInput
                style={{
                  flex: 1,
                  marginLeft: 8,
                  fontSize: 15,
                  color: colors.textPrimary,
                  paddingVertical: 0,
                }}
                placeholder="Type label name..."
                placeholderTextColor={colors.textSecondary}
                value={hashtagInputValue}
                onChangeText={setHashtagInputValue}
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={() => {
                  if (hashtagInputValue.trim()) {
                    handleCreateAndInsertHashtag(hashtagInputValue.trim());
                    setHashtagInputValue('');
                  }
                }}
                returnKeyType="done"
              />
              {hashtagInputValue.trim().length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    handleCreateAndInsertHashtag(hashtagInputValue.trim());
                    setHashtagInputValue('');
                  }}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor: colors.accent,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
                    Add
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Current labels */}
            {note && note.labels.length > 0 && (
              <View style={{ marginHorizontal: 16, marginTop: 8, marginBottom: 4 }}>
                <Text style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  fontWeight: '600',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                  Current
                </Text>
                <View style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 8,
                }}>
                  {note.labels.map((label, index) => {
                    const colorKey = TAG_COLOR_KEYS[index % TAG_COLOR_KEYS.length];
                    const pillColor = tagColors[colorKey];

                    return (
                      <View
                        key={label}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: pillColor.background,
                          paddingLeft: 10,
                          paddingRight: 6,
                          paddingVertical: 6,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ fontSize: 13, color: pillColor.text, fontWeight: '500' }}>
                          #{label}
                        </Text>
                        <TouchableOpacity
                          onPress={() => removeLabelFromNote(note.id, label)}
                          style={{ marginLeft: 6, padding: 2 }}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <X size={14} color={colors.textSecondary} weight="bold" />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Create new option */}
            {hashtagQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => handleCreateAndInsertHashtag(hashtagQuery)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  marginHorizontal: 16,
                  marginTop: 8,
                  marginBottom: 4,
                  borderRadius: 10,
                  backgroundColor: isDark ? colors.backgroundTertiary : '#EFEFF0',
                }}
              >
                <Plus size={16} color={colors.accent} weight="bold" />
                <Text style={{
                  color: colors.accent,
                  fontWeight: '600',
                  fontSize: 15,
                  marginLeft: 8,
                }}>
                  Create "{hashtagQuery}"
                </Text>
              </TouchableOpacity>
            )}

            {/* Suggested labels */}
            {filteredLabels.length > 0 && (
              <Text style={{
                fontSize: 12,
                color: colors.textSecondary,
                fontWeight: '600',
                marginTop: 12,
                marginBottom: 8,
                marginHorizontal: 16,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                Suggestions
              </Text>
            )}

            {/* Labels list */}
            <ScrollView
              style={{ maxHeight: 120, paddingHorizontal: 16 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                paddingBottom: 16,
                gap: 8,
              }}>
                {filteredLabels.map((label, index) => {
                  const colorKey = TAG_COLOR_KEYS[index % TAG_COLOR_KEYS.length];
                  const pillColor = tagColors[colorKey];

                  return (
                    <TouchableOpacity
                      key={label.id}
                      onPress={() => handleSelectHashtag(label.name)}
                      style={{
                        backgroundColor: pillColor.background,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{
                        color: pillColor.text,
                        fontSize: 13,
                        fontWeight: '500',
                      }}>
                        #{label.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Empty state */}
              {filteredLabels.length === 0 && labels.length === 0 && (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{
                    color: colors.textSecondary,
                    fontSize: 14,
                    textAlign: 'center',
                  }}>
                    Type to create a new label
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}

        {/* Label pills in note area */}
        <TouchableOpacity
          onPress={() => setShowHashtagAutocomplete(true)}
          activeOpacity={0.7}
          style={{ paddingHorizontal: 16, paddingVertical: 8 }}
        >
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 6 }}>
            {note.labels.length > 0 ? (
              note.labels.map((label, index) => {
                const colorKey = TAG_COLOR_KEYS[index % TAG_COLOR_KEYS.length];
                const pillColor = tagColors[colorKey];

                return (
                  <View
                    key={label}
                    style={{
                      backgroundColor: pillColor.background,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: pillColor.text, fontWeight: '500' }}>
                      #{label}
                    </Text>
                  </View>
                );
              })
            ) : (
              <View
                style={{
                  backgroundColor: isDark ? colors.backgroundTertiary : '#EFEFF0',
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 8,
                }}
              >
                <Text style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  fontWeight: '500',
                }}>
                  + Add label
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        </BackgroundLayer>
      </KeyboardAvoidingView>

      {/* Bottom Info Bar - Attached to screen bottom */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: isDark ? 'rgba(37, 33, 54, 0.8)' : 'rgba(237, 233, 254, 0.8)',
        }}
      >
        <Text
          style={{
            fontSize: 12,
            textAlign: 'center',
            color: isDark ? '#A8A8B8' : '#6B6B7B',
          }}
        >
          Edited {new Date(note.updatedAt).toLocaleString()}
        </Text>
      </View>

      {/* Design Picker Modal */}
      <Modal
        visible={showDesignPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDesignPicker(false)}
      >
        <View className="flex-1" style={{ backgroundColor: isDark ? 'rgba(15, 13, 21, 0.9)' : 'rgba(0,0,0,0.5)' }}>
          <TouchableOpacity
            className="flex-1"
            onPress={() => setShowDesignPicker(false)}
          />
          <View
            className="rounded-t-3xl"
            style={{
              backgroundColor: isDark ? '#1C1826' : '#FFFFFF',
              maxHeight: '80%',
            }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 pb-2">
              <Text
                className="text-lg font-semibold"
                style={{ color: isDark ? '#F5F3FF' : '#1A1625' }}
              >
                Apply Design
              </Text>
              <TouchableOpacity
                onPress={() => setShowDesignPicker(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: isDark ? '#252136' : '#F5F3FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} color={isDark ? '#A8A8B8' : '#6B6B7B'} weight="regular" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            >

            {/* Create new design button */}
            <TouchableOpacity
              onPress={() => {
                setShowDesignPicker(false);
                router.push({
                  pathname: '/design/create',
                  params: { returnTo: 'note', noteId: id },
                });
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 14,
                marginBottom: 12,
                borderRadius: 9999,
                backgroundColor: '#8B5CF6',
              }}
            >
              <Plus size={18} color="#FFFFFF" weight="bold" />
              <Text style={{ marginLeft: 8, color: '#FFFFFF', fontWeight: '600' }}>
                Create New Design
              </Text>
            </TouchableOpacity>

            {/* Clear design button */}
            {activeDesign && (
              <TouchableOpacity
                onPress={handleClearDesign}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 12,
                  marginBottom: 16,
                  borderRadius: 16,
                  backgroundColor: isDark ? '#252136' : '#F5F3FF',
                }}
              >
                <X size={18} color="#EF4444" weight="regular" />
                <Text style={{ marginLeft: 8, color: '#EF4444', fontWeight: '500' }}>
                  Remove Design
                </Text>
              </TouchableOpacity>
            )}

            {/* Note Color Section - disabled when a design is applied */}
            <View style={{ marginBottom: 20, opacity: activeDesign ? 0.4 : 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#10B981',
                    marginRight: 8,
                  }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: isDark ? '#A8A8B8' : '#6B6B7B',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Note Color
                </Text>
                {activeDesign && (
                  <Text
                    style={{
                      marginLeft: 8,
                      fontSize: 11,
                      color: isDark ? '#6B6B7B' : '#9CA3AF',
                      fontStyle: 'italic',
                    }}
                  >
                    (remove design to change)
                  </Text>
                )}
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {NOTE_COLORS.map((c) => {
                  const isSelected = color === c.value;
                  return (
                    <TouchableOpacity
                      key={c.value}
                      onPress={() => !activeDesign && setColor(c.value)}
                      disabled={!!activeDesign}
                      style={{ alignItems: 'center' }}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: c.value,
                          borderWidth: isSelected ? 3 : 2,
                          borderColor: isSelected ? '#8B5CF6' : (isDark ? '#3D3654' : '#DDD6FE'),
                          shadowColor: '#8B5CF6',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: isSelected ? 0.3 : 0.1,
                          shadowRadius: 4,
                          elevation: 3,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isSelected && (
                          <Check
                            size={18}
                            color={c.value === NoteColor.White ? '#8B5CF6' : '#FFFFFF'}
                            weight="bold"
                          />
                        )}
                      </View>
                      <Text
                        style={{
                          fontSize: 10,
                          marginTop: 4,
                          fontWeight: isSelected ? '600' : '400',
                          color: isSelected ? '#8B5CF6' : (isDark ? '#A8A8B8' : '#6B6B7B'),
                        }}
                      >
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* All Label Styles Section - 20 presets to choose from */}
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#F59E0B',
                    marginRight: 8,
                  }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: isDark ? '#A8A8B8' : '#6B6B7B',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  All Label Styles
                </Text>
                <View
                  style={{
                    marginLeft: 8,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                    backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.15)',
                  }}
                >
                  <Text style={{ fontSize: 10, color: '#F59E0B', fontWeight: '500' }}>
                    20 PRESETS
                  </Text>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 4, gap: 8 }}
              >
                {LABEL_PRESET_LIST.map((preset) => {
                  const presetDesignId = `label-preset-${preset.id}`;
                  const isSelected = designId === presetDesignId;

                  return (
                    <TouchableOpacity
                      key={preset.id}
                      onPress={() => handleSelectLabelDesign(preset.name, preset)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 16,
                        backgroundColor: isSelected
                          ? preset.colors.primary
                          : isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : preset.colors.bg,
                        borderWidth: isSelected ? 0 : 1,
                        borderColor: isDark
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(0, 0, 0, 0.08)',
                        marginRight: 8,
                      }}
                    >
                      {/* Category dot */}
                      <View
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: isSelected ? '#FFFFFF' : CATEGORY_COLORS[preset.category],
                          marginRight: 6,
                        }}
                      />
                      {/* Icon */}
                      <Text style={{ fontSize: 14, marginRight: 4 }}>{preset.icon}</Text>
                      {/* Label name */}
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '500',
                          color: isSelected
                            ? '#FFFFFF'
                            : isDark
                            ? '#F5F3FF'
                            : preset.colors.text,
                        }}
                      >
                        {preset.name}
                      </Text>
                      {/* Selected checkmark */}
                      {isSelected && (
                        <View style={{ marginLeft: 6 }}>
                          <Check size={12} color="#FFFFFF" weight="bold" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Hint text */}
              <Text
                style={{
                  fontSize: 11,
                  color: isDark ? '#6B6B7B' : '#9CA3AF',
                  marginTop: 8,
                  paddingHorizontal: 4,
                }}
              >
                Tap any label to apply its design style
              </Text>
            </View>

            {/* My Designs Section */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#8B5CF6',
                  marginRight: 8,
                }}
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: isDark ? '#A8A8B8' : '#6B6B7B',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                My Designs
              </Text>
            </View>

            {designs.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                <Sparkle size={36} color={isDark ? '#A78BFA' : '#8B5CF6'} weight="duotone" />
                <Text
                  style={{
                    textAlign: 'center',
                    marginTop: 12,
                    color: isDark ? '#A8A8B8' : '#6B6B7B',
                    fontSize: 13,
                  }}
                >
                  No custom designs yet
                </Text>
              </View>
            ) : (
              <FlatList
                data={designs}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={{ paddingBottom: 20 }}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View className="flex-1 m-1">
                    <DesignCard
                      design={item}
                      onPress={() => handleApplyDesign(item)}
                      isDark={isDark}
                      isSelected={designId === item.id}
                      size="compact"
                    />
                  </View>
                )}
              />
            )}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
