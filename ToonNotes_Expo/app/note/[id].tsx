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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Pin,
  PinOff,
  Palette,
  Archive,
  Trash2,
  MoreVertical,
  Sparkles,
  X,
  Plus,
  Hash,
  ImageIcon,
} from 'lucide-react-native';

import { useNoteStore, useDesignStore, useUserStore } from '@/stores';
import { NoteColor, NoteDesign, BackgroundOverride, TextAnalysis, WebtoonStylePreset, WebtoonSketchResponse } from '@/types';
import { composeStyle } from '@/services/designEngine';
import { createStoryStyle, generateWebtoonSketch, saveWebtoonSketch, WEBTOON_STYLES } from '@/services/geminiService';
import { BackgroundLayer } from '@/components/BackgroundLayer';
import { BackgroundPicker } from '@/components/BackgroundPicker';
import { getPatternById } from '@/constants/patterns';

const NOTE_COLORS = [
  { name: 'White', value: NoteColor.White },
  { name: 'Red', value: NoteColor.Red },
  { name: 'Orange', value: NoteColor.Orange },
  { name: 'Yellow', value: NoteColor.Yellow },
  { name: 'Green', value: NoteColor.Green },
  { name: 'Teal', value: NoteColor.Teal },
  { name: 'Blue', value: NoteColor.Blue },
  { name: 'Purple', value: NoteColor.Purple },
];

// Shoujo-style hashtag selector colors (pastel green theme)
const SHOUJO_HASHTAG_COLORS = {
  light: {
    panelBackground: '#F0FFF4',
    panelBorder: '#9AE6B4',
    headerText: '#276749',
    bodyText: '#48BB78',
    accent: '#38A169',
    createButtonBg: '#C6F6D5',
    createButtonText: '#276749',
    shadowColor: '#9AE6B4',
    pillColors: [
      { bg: 'rgba(154, 230, 180, 0.35)', text: '#276749' },
      { bg: 'rgba(198, 246, 213, 0.4)', text: '#2F855A' },
      { bg: 'rgba(167, 255, 235, 0.35)', text: '#285E61' },
      { bg: 'rgba(178, 245, 234, 0.35)', text: '#234E52' },
      { bg: 'rgba(144, 238, 144, 0.35)', text: '#22543D' },
    ],
  },
  dark: {
    panelBackground: '#1C2A22',
    panelBorder: '#2F855A',
    headerText: '#9AE6B4',
    bodyText: '#68D391',
    accent: '#48BB78',
    createButtonBg: '#22543D',
    createButtonText: '#9AE6B4',
    shadowColor: '#2F855A',
    pillColors: [
      { bg: 'rgba(154, 230, 180, 0.2)', text: '#9AE6B4' },
      { bg: 'rgba(104, 211, 145, 0.2)', text: '#68D391' },
      { bg: 'rgba(167, 255, 235, 0.2)', text: '#81E6D9' },
      { bg: 'rgba(129, 230, 217, 0.2)', text: '#4FD1C5' },
      { bg: 'rgba(144, 238, 144, 0.2)', text: '#9AE6B4' },
    ],
  },
};

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
  } = useNoteStore();
  const { designs, getDesignById } = useDesignStore();
  const { settings } = useUserStore();
  const isDark = settings.darkMode;

  const note = getNoteById(id || '');
  const currentDesign = note?.designId ? getDesignById(note.designId) : null;

  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [color, setColor] = useState<NoteColor>(note?.color || NoteColor.White);
  const [designId, setDesignId] = useState<string | undefined>(note?.designId);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDesignPicker, setShowDesignPicker] = useState(false);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [backgroundOverride, setBackgroundOverride] = useState<BackgroundOverride | undefined>(
    note?.backgroundOverride
  );

  // Hashtag autocomplete state
  const [showHashtagAutocomplete, setShowHashtagAutocomplete] = useState(false);
  const [hashtagQuery, setHashtagQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);

  // Story Style state
  const [isGeneratingStoryStyle, setIsGeneratingStoryStyle] = useState(false);
  const [storyStyleProgress, setStoryStyleProgress] = useState('');
  const [showStoryStyleResult, setShowStoryStyleResult] = useState(false);
  const [storyStyleResult, setStoryStyleResult] = useState<{
    analysis: TextAnalysis;
    design: NoteDesign;
  } | null>(null);

  // Webtoon Artist state
  const [selectedWebtoonStyle, setSelectedWebtoonStyle] = useState<WebtoonStylePreset>('simple');
  const [isGeneratingSketch, setIsGeneratingSketch] = useState(false);
  const [webtoonSketch, setWebtoonSketch] = useState<{
    imageUri: string;
    response: WebtoonSketchResponse;
  } | null>(null);

  // Get active design for styling
  const activeDesign = designId ? getDesignById(designId) : null;

  // Compose style using DesignEngine for detail context
  const baseStyle = composeStyle(activeDesign ?? null, color, 'detail', isDark);

  // Apply backgroundOverride if set
  const style = useMemo(() => {
    if (!backgroundOverride || backgroundOverride.style === 'none') {
      return baseStyle;
    }

    // Get pattern info if applicable
    const pattern = backgroundOverride.style === 'pattern' && backgroundOverride.patternId
      ? getPatternById(backgroundOverride.patternId)
      : null;

    // Merge backgroundOverride into style
    return {
      ...baseStyle,
      showBackground: true,
      backgroundOpacity: backgroundOverride.opacity ?? 0.15,
      backgroundImageUri: backgroundOverride.style === 'image' ? backgroundOverride.imageUri : undefined,
      backgroundPattern: pattern
        ? { patternId: pattern.id, assetName: pattern.assetName }
        : undefined,
    };
  }, [baseStyle, backgroundOverride]);

  // Auto-save on changes
  useEffect(() => {
    if (!note) return;

    const timeout = setTimeout(() => {
      updateNote(note.id, { title, content, color, designId, backgroundOverride });
    }, 500);

    return () => clearTimeout(timeout);
  }, [title, content, color, designId, backgroundOverride]);

  // Regex to detect hashtag being typed
  const HASHTAG_TYPING_REGEX = /#(\w*)$/;

  // Filter existing labels based on hashtag query
  // Show all labels when query is empty, filter when query has text
  const filteredLabels = useMemo(() => {
    const query = hashtagQuery.toLowerCase();
    return labels.filter(
      (l) =>
        (query === '' || l.name.toLowerCase().includes(query)) &&
        !note?.labels.includes(l.name) // Exclude already applied
    );
  }, [labels, hashtagQuery, note?.labels]);

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
    // Replace the partial #tag with the full hashtag
    const textBeforeCursor = content.slice(0, cursorPosition);
    const textAfterCursor = content.slice(cursorPosition);

    // Find where # starts
    const hashIndex = textBeforeCursor.lastIndexOf('#');
    const newContent =
      textBeforeCursor.slice(0, hashIndex) + `#${tagName} ` + textAfterCursor;

    setContent(newContent);

    // Add to note's labels if not already present
    if (note && !note.labels.includes(tagName)) {
      updateNote(note.id, {
        labels: [...note.labels, tagName],
      });
    }

    setShowHashtagAutocomplete(false);
    setHashtagQuery('');
  };

  // Handle creating and inserting a new hashtag
  const handleCreateAndInsertHashtag = (tagName: string) => {
    // Create the label in store
    addLabel(tagName);
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
    // Save before leaving
    updateNote(note.id, { title, content, color });

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
    setShowDesignPicker(false);
  };

  // Handle Story Style - AI text analysis to design
  const handleStoryStyle = async () => {
    const noteText = `${title}\n${content}`.trim();
    if (noteText.length < 10) {
      Alert.alert('Need More Text', 'Add some text to your note to use Story Style (at least 10 characters).');
      return;
    }

    setIsGeneratingStoryStyle(true);
    setStoryStyleProgress('Reading your story...');

    try {
      // Stage 1: Analyze text
      setStoryStyleProgress('Finding the perfect vibe...');
      const result = await createStoryStyle(title, content);

      // Stage 2 is included in createStoryStyle
      setStoryStyleProgress('Designing your style...');

      // Save the design to the store
      const { addDesign } = useDesignStore.getState();
      addDesign(result.design);

      // Apply the design to the note
      setDesignId(result.design.id);
      setShowDesignPicker(false);

      // Store result and show detailed modal
      setStoryStyleResult(result);
      setShowStoryStyleResult(true);
      // Reset webtoon sketch when new analysis is done
      setWebtoonSketch(null);
    } catch (error: any) {
      console.error('Story Style error:', error);
      Alert.alert('Story Style Failed', error.message || 'Could not generate a design from your text. Try again later.');
    } finally {
      setIsGeneratingStoryStyle(false);
      setStoryStyleProgress('');
    }
  };

  // Handle Webtoon Artist sketch generation
  const handleGenerateWebtoonSketch = async () => {
    if (!storyStyleResult || !note) return;

    setIsGeneratingSketch(true);
    try {
      const sketchResponse = await generateWebtoonSketch(
        storyStyleResult.analysis,
        selectedWebtoonStyle,
        title,
        content
      );

      // Save the sketch locally
      const savedUri = await saveWebtoonSketch(sketchResponse);

      setWebtoonSketch({
        imageUri: savedUri,
        response: sketchResponse,
      });

      // Save the sketch URI to the note
      updateNote(note.id, { webtoonSketchUri: savedUri });
    } catch (error: any) {
      console.error('Webtoon sketch error:', error);
      Alert.alert('Sketch Generation Failed', error.message || 'Could not generate the webtoon sketch. Try again later.');
    } finally {
      setIsGeneratingSketch(false);
    }
  };

  // Handle background selection from picker
  const handleBackgroundSelect = (selection: {
    style: 'solid' | 'gradient' | 'image' | 'pattern' | 'none';
    imageUri?: string;
    patternId?: string;
    opacity?: number;
  }) => {
    if (selection.style === 'none') {
      setBackgroundOverride(undefined);
    } else {
      setBackgroundOverride(selection as BackgroundOverride);
    }
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

  // Get decoration emoji for shoujo style
  const getDecorations = () => {
    if (style.decorations?.type === 'shoujo') {
      return (
        <>
          <Text style={{ position: 'absolute', top: 60, left: 16, fontSize: 20, opacity: 0.7 }}>✿</Text>
          <Text style={{ position: 'absolute', bottom: 60, right: 16, fontSize: 20, opacity: 0.7 }}>✧</Text>
        </>
      );
    }
    return null;
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: style.backgroundColor }}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        style={{
          borderWidth: style.showBorder ? style.borderWidth : 0,
          borderColor: style.borderColor,
          borderRadius: 16,
          marginTop: style.showBorder ? 50 : 8,
          marginHorizontal: style.showBorder ? 8 : 0,
          marginBottom: style.showBorder ? 16 : 4,
          // Shadow
          shadowColor: style.shadowColor,
          shadowOffset: style.shadowOffset,
          shadowOpacity: style.shadowOpacity,
          shadowRadius: style.shadowRadius,
          elevation: style.elevation,
          overflow: 'hidden', // Clip background to border radius
        }}
      >
        <BackgroundLayer style={style} context="detail">
        {/* Decorations */}
        {getDecorations()}

        {/* Sticker overlay */}
        {style.showSticker && style.stickerUri && (
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
        )}

        {/* Header */}
        <View className="flex-row items-center justify-between px-2 py-2">
          <TouchableOpacity onPress={handleBack} className="p-2">
            <ArrowLeft size={24} color={style.titleColor} />
          </TouchableOpacity>

          <View className="flex-row items-center">
            {/* Pin button */}
            <TouchableOpacity onPress={handlePin} className="p-2">
              {note.isPinned ? (
                <PinOff size={22} color={style.titleColor} />
              ) : (
                <Pin size={22} color={style.titleColor} />
              )}
            </TouchableOpacity>

            {/* Design picker button */}
            <TouchableOpacity
              onPress={() => setShowDesignPicker(true)}
              className="p-2"
            >
              <Sparkles size={22} color={activeDesign ? '#F59E0B' : style.titleColor} />
            </TouchableOpacity>

            {/* Background picker button (only show if design is active) */}
            {activeDesign && (
              <TouchableOpacity
                onPress={() => setShowBackgroundPicker(true)}
                className="p-2"
              >
                <ImageIcon
                  size={22}
                  color={backgroundOverride ? '#10B981' : style.titleColor}
                />
              </TouchableOpacity>
            )}

            {/* Color picker button */}
            <TouchableOpacity
              onPress={() => setShowColorPicker(!showColorPicker)}
              className="p-2"
            >
              <Palette size={22} color={style.titleColor} />
            </TouchableOpacity>

            {/* More menu */}
            <TouchableOpacity
              onPress={() => setShowMenu(!showMenu)}
              className="p-2"
            >
              <MoreVertical size={22} color={style.titleColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Color picker */}
        {showColorPicker && (
          <View className="flex-row px-4 py-3 gap-2 bg-white/50">
            {NOTE_COLORS.map((c) => (
              <TouchableOpacity
                key={c.value}
                onPress={() => {
                  setColor(c.value);
                  setShowColorPicker(false);
                }}
                className="w-8 h-8 rounded-full border-2"
                style={{
                  backgroundColor: c.value,
                  borderColor: color === c.value ? '#1F2937' : 'transparent',
                }}
              />
            ))}
          </View>
        )}

        {/* Menu dropdown */}
        {showMenu && (
          <View className="absolute top-14 right-4 bg-white rounded-xl shadow-lg z-10 overflow-hidden">
            <TouchableOpacity
              onPress={handleArchive}
              className="flex-row items-center px-4 py-3 border-b border-gray-100"
            >
              <Archive size={18} color="#10B981" />
              <Text className="ml-3 text-ink-dark">Archive</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              className="flex-row items-center px-4 py-3"
            >
              <Trash2 size={18} color="#EF4444" />
              <Text className="ml-3 text-red-500">Delete</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Editor */}
        <ScrollView
          className="flex-1 px-4"
          keyboardShouldPersistTaps="handled"
        >
          {/* Active design indicator */}
          {activeDesign && (
            <View className="flex-row items-center mt-2 mb-1">
              <Sparkles size={14} color="#F59E0B" />
              <Text className="text-xs ml-1" style={{ color: style.bodyColor }}>
                {activeDesign.name}
              </Text>
            </View>
          )}

          {/* Title */}
          <TextInput
            className="text-2xl font-bold py-3"
            style={{ color: style.titleColor }}
            placeholder="Title"
            placeholderTextColor={activeDesign ? `${style.titleColor}80` : '#9CA3AF'}
            value={title}
            onChangeText={setTitle}
            multiline
          />

          {/* Content */}
          <TextInput
            className="text-base flex-1 min-h-[300px]"
            style={{ color: style.bodyColor }}
            placeholder="Start typing... Use # to add hashtags"
            placeholderTextColor={activeDesign ? `${style.bodyColor}80` : '#9CA3AF'}
            value={content}
            onChangeText={handleContentChange}
            onSelectionChange={handleSelectionChange}
            multiline
            textAlignVertical="top"
          />
        </ScrollView>

        {/* Hashtag Autocomplete Panel - Shoujo Style */}
        {showHashtagAutocomplete && (
          <View
            style={{
              backgroundColor: isDark
                ? SHOUJO_HASHTAG_COLORS.dark.panelBackground
                : SHOUJO_HASHTAG_COLORS.light.panelBackground,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              borderTopWidth: 2,
              borderLeftWidth: 1,
              borderRightWidth: 1,
              borderTopColor: isDark
                ? SHOUJO_HASHTAG_COLORS.dark.panelBorder
                : SHOUJO_HASHTAG_COLORS.light.panelBorder,
              borderLeftColor: isDark
                ? SHOUJO_HASHTAG_COLORS.dark.panelBorder
                : SHOUJO_HASHTAG_COLORS.light.panelBorder,
              borderRightColor: isDark
                ? SHOUJO_HASHTAG_COLORS.dark.panelBorder
                : SHOUJO_HASHTAG_COLORS.light.panelBorder,
              maxHeight: 220,
              shadowColor: isDark
                ? SHOUJO_HASHTAG_COLORS.dark.shadowColor
                : SHOUJO_HASHTAG_COLORS.light.shadowColor,
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.4,
              shadowRadius: 20,
              elevation: 25,
              zIndex: 20,
              overflow: 'visible',
            }}
          >
            {/* Flower decoration - top left */}
            <Text style={{
              position: 'absolute',
              top: -10,
              left: 16,
              fontSize: 16,
              opacity: 0.8,
              zIndex: 21,
            }}>✿</Text>

            {/* Sparkle decoration - top right */}
            <Text style={{
              position: 'absolute',
              top: -8,
              right: 20,
              fontSize: 14,
              opacity: 0.7,
              zIndex: 21,
            }}>✧</Text>

            {/* Small sparkle - scattered */}
            <Text style={{
              position: 'absolute',
              top: 6,
              right: 55,
              fontSize: 10,
              opacity: 0.5,
              zIndex: 21,
            }}>✦</Text>

            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: isDark
                  ? 'rgba(255, 182, 193, 0.15)'
                  : 'rgba(255, 105, 180, 0.15)',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 14, marginRight: 4 }}>✿</Text>
                <Text style={{
                  color: isDark
                    ? SHOUJO_HASHTAG_COLORS.dark.headerText
                    : SHOUJO_HASHTAG_COLORS.light.headerText,
                  fontSize: 13,
                  fontWeight: '500',
                }}>
                  {hashtagQuery ? `#${hashtagQuery}` : 'Select hashtag'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowHashtagAutocomplete(false)}
                style={{
                  padding: 4,
                  borderRadius: 12,
                  backgroundColor: isDark
                    ? 'rgba(255, 182, 193, 0.1)'
                    : 'rgba(255, 105, 180, 0.1)',
                }}
              >
                <X
                  size={16}
                  color={isDark
                    ? SHOUJO_HASHTAG_COLORS.dark.accent
                    : SHOUJO_HASHTAG_COLORS.light.accent
                  }
                />
              </TouchableOpacity>
            </View>

            {/* Create New option - Shoujo styled */}
            {hashtagQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => handleCreateAndInsertHashtag(hashtagQuery)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  marginHorizontal: 12,
                  marginTop: 8,
                  marginBottom: 4,
                  borderRadius: 16,
                  backgroundColor: isDark
                    ? SHOUJO_HASHTAG_COLORS.dark.createButtonBg
                    : SHOUJO_HASHTAG_COLORS.light.createButtonBg,
                  borderWidth: 1,
                  borderColor: isDark
                    ? 'rgba(255, 141, 199, 0.3)'
                    : 'rgba(255, 105, 180, 0.3)',
                  shadowColor: isDark ? '#FF8DC7' : '#FF69B4',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                }}
              >
                <Text style={{ fontSize: 12, marginRight: 6 }}>✦</Text>
                <Text style={{
                  color: isDark
                    ? SHOUJO_HASHTAG_COLORS.dark.createButtonText
                    : SHOUJO_HASHTAG_COLORS.light.createButtonText,
                  fontWeight: '600',
                  fontSize: 14,
                }}>
                  Create #{hashtagQuery}
                </Text>
                <Text style={{ fontSize: 10, marginLeft: 4, opacity: 0.7 }}>✧</Text>
              </TouchableOpacity>
            )}

            {/* Existing hashtags as colored pills */}
            <ScrollView
              style={{ maxHeight: 120, paddingHorizontal: 12 }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                paddingVertical: 8,
                gap: 8,
              }}>
                {filteredLabels.slice(0, 8).map((label, index) => {
                  const colorScheme = isDark
                    ? SHOUJO_HASHTAG_COLORS.dark.pillColors
                    : SHOUJO_HASHTAG_COLORS.light.pillColors;
                  const pillColor = colorScheme[index % colorScheme.length];

                  return (
                    <TouchableOpacity
                      key={label.id}
                      onPress={() => handleSelectHashtag(label.name)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: pillColor.bg,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.05)',
                        shadowColor: pillColor.text,
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.15,
                        shadowRadius: 3,
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
                  <Text style={{ fontSize: 16, marginBottom: 4 }}>✿</Text>
                  <Text style={{
                    color: isDark
                      ? SHOUJO_HASHTAG_COLORS.dark.bodyText
                      : SHOUJO_HASHTAG_COLORS.light.bodyText,
                    fontSize: 12,
                    textAlign: 'center',
                  }}>
                    Type a name to create your first hashtag
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Bottom decoration */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              paddingBottom: 8,
              opacity: 0.5,
            }}>
              <Text style={{ fontSize: 8, marginHorizontal: 4 }}>✧</Text>
              <Text style={{ fontSize: 10, marginHorizontal: 2 }}>✿</Text>
              <Text style={{ fontSize: 8, marginHorizontal: 4 }}>✧</Text>
            </View>
          </View>
        )}

        {/* Webtoon Sketch display */}
        {note?.webtoonSketchUri && (
          <View
            style={{
              marginHorizontal: 16,
              marginBottom: 12,
              backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)',
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(236, 72, 153, 0.3)' : 'rgba(236, 72, 153, 0.2)',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, marginRight: 6 }}>🎨</Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#EC4899' }}>
                Webtoon Sketch
              </Text>
            </View>
            <Image
              source={{ uri: note.webtoonSketchUri }}
              style={{
                width: '100%',
                height: 180,
                borderRadius: 8,
                backgroundColor: isDark ? '#1F1F1F' : '#F9FAFB',
              }}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Hashtag pills - pastel green theme (in note area) */}
        <TouchableOpacity
          onPress={() => setShowHashtagAutocomplete(true)}
          activeOpacity={0.7}
          style={{ paddingHorizontal: 16, paddingVertical: 8 }}
        >
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 6 }}>
            {note.labels.length > 0 ? (
              note.labels.map((label, index) => {
                const colorScheme = isDark
                  ? SHOUJO_HASHTAG_COLORS.dark.pillColors
                  : SHOUJO_HASHTAG_COLORS.light.pillColors;
                const pillColor = colorScheme[index % colorScheme.length];

                return (
                  <View
                    key={label}
                    style={{
                      backgroundColor: pillColor.bg,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isDark
                        ? 'rgba(154, 230, 180, 0.2)'
                        : 'rgba(39, 103, 73, 0.15)',
                    }}
                  >
                    <Text style={{ fontSize: 11, color: pillColor.text, fontWeight: '500' }}>
                      #{label}
                    </Text>
                  </View>
                );
              })
            ) : (
              <View
                style={{
                  backgroundColor: isDark
                    ? 'rgba(154, 230, 180, 0.15)'
                    : 'rgba(154, 230, 180, 0.25)',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderStyle: 'dashed',
                  borderColor: isDark
                    ? 'rgba(154, 230, 180, 0.3)'
                    : 'rgba(39, 103, 73, 0.2)',
                }}
              >
                <Text style={{
                  fontSize: 11,
                  color: isDark ? '#68D391' : '#48BB78',
                  fontWeight: '500',
                }}>
                  + Add hashtag
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Bottom Info Bar - Timestamp only */}
        <View className="px-4 py-2 bg-black/5">
          <Text className="text-xs text-ink-light text-center">
            Edited {new Date(note.updatedAt).toLocaleString()}
          </Text>
        </View>
        </BackgroundLayer>
      </KeyboardAvoidingView>

      {/* Design Picker Modal */}
      <Modal
        visible={showDesignPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDesignPicker(false)}
      >
        <View className="flex-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableOpacity
            className="flex-1"
            onPress={() => setShowDesignPicker(false)}
          />
          <View
            className="rounded-t-3xl p-4"
            style={{
              backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
              maxHeight: '70%',
            }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text
                className="text-lg font-semibold"
                style={{ color: isDark ? '#FFFFFF' : '#1F2937' }}
              >
                Apply Design
              </Text>
              <TouchableOpacity onPress={() => setShowDesignPicker(false)}>
                <X size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            {/* Create new design button */}
            <TouchableOpacity
              onPress={() => {
                setShowDesignPicker(false);
                router.push('/design/create');
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 14,
                marginBottom: 12,
                borderRadius: 12,
                backgroundColor: '#0ea5e9',
              }}
            >
              <Plus size={18} color="#FFFFFF" />
              <Text style={{ marginLeft: 8, color: '#FFFFFF', fontWeight: '600' }}>
                Create New Design
              </Text>
            </TouchableOpacity>

            {/* Story Style button - AI text analysis to design */}
            <TouchableOpacity
              onPress={handleStoryStyle}
              disabled={isGeneratingStoryStyle || (!title && !content)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 14,
                marginBottom: 12,
                borderRadius: 12,
                backgroundColor: '#8B5CF6',
                opacity: isGeneratingStoryStyle || (!title && !content) ? 0.6 : 1,
              }}
            >
              {isGeneratingStoryStyle ? (
                <>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={{ marginLeft: 8, color: '#FFFFFF', fontWeight: '600' }}>
                    {storyStyleProgress || 'Generating...'}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={{ marginRight: 6, fontSize: 16 }}>✨</Text>
                  <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
                    Story Style
                  </Text>
                  <Text style={{ marginLeft: 4, color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                    (AI from text)
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Hint when no text */}
            {!title && !content && (
              <Text
                style={{
                  textAlign: 'center',
                  color: '#9CA3AF',
                  fontSize: 12,
                  marginBottom: 8,
                  marginTop: -8,
                }}
              >
                Add some text to your note to use Story Style
              </Text>
            )}

            {/* Clear design button */}
            {activeDesign && (
              <TouchableOpacity
                onPress={handleClearDesign}
                className="flex-row items-center justify-center py-3 mb-4 rounded-xl"
                style={{ backgroundColor: isDark ? '#2D2D2D' : '#F3F4F6' }}
              >
                <X size={18} color="#EF4444" />
                <Text className="ml-2" style={{ color: '#EF4444', fontWeight: '500' }}>
                  Remove Design
                </Text>
              </TouchableOpacity>
            )}

            {/* Design list */}
            {designs.length === 0 ? (
              <View className="items-center py-8">
                <Sparkles size={48} color="#9CA3AF" />
                <Text
                  className="text-center mt-4"
                  style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
                >
                  No designs yet. Create one in the Designs tab!
                </Text>
              </View>
            ) : (
              <FlatList
                data={designs}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleApplyDesign(item)}
                    className="flex-1 m-1 rounded-xl overflow-hidden"
                    style={{
                      backgroundColor: item.background.primaryColor,
                      minHeight: 100,
                      borderWidth: designId === item.id ? 3 : 0,
                      borderColor: '#F59E0B',
                    }}
                    activeOpacity={0.7}
                  >
                    {/* Source image thumbnail */}
                    {item.sourceImageUri && (
                      <Image
                        source={{ uri: item.sourceImageUri }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-lg"
                        resizeMode="cover"
                      />
                    )}

                    {/* Design name */}
                    <View className="absolute bottom-0 left-0 right-0 p-2 bg-black/20">
                      <Text
                        className="font-medium text-xs"
                        style={{ color: item.colors.titleText }}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                    </View>

                    {/* Selected indicator */}
                    {designId === item.id && (
                      <View className="absolute top-2 left-2 w-6 h-6 bg-amber-500 rounded-full items-center justify-center">
                        <Text className="text-white text-xs font-bold">✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Background Picker Modal */}
      <BackgroundPicker
        visible={showBackgroundPicker}
        onClose={() => setShowBackgroundPicker(false)}
        currentBackground={backgroundOverride}
        sourceImageUri={activeDesign?.sourceImageUri}
        onSelect={handleBackgroundSelect}
        isDark={isDark}
      />

      {/* Story Style Result Modal */}
      <Modal
        visible={showStoryStyleResult}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStoryStyleResult(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 }}>
          <View
            style={{
              backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
              borderRadius: 20,
              padding: 20,
              maxHeight: '85%',
            }}
          >
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 20, marginRight: 8 }}>✨</Text>
                <Text style={{ fontSize: 18, fontWeight: '700', color: isDark ? '#FFFFFF' : '#1F2937' }}>
                  Story Style Created!
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowStoryStyleResult(false)}>
                <X size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {storyStyleResult && (
                <>
                  {/* Design Name */}
                  <View
                    style={{
                      backgroundColor: storyStyleResult.design.background.primaryColor,
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 16,
                      borderWidth: 2,
                      borderColor: storyStyleResult.design.colors.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: '700',
                        color: storyStyleResult.design.colors.titleText,
                        textAlign: 'center',
                      }}
                    >
                      "{storyStyleResult.design.name}"
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: storyStyleResult.design.colors.bodyText,
                        textAlign: 'center',
                        marginTop: 4,
                        opacity: 0.8,
                      }}
                    >
                      {storyStyleResult.design.designSummary}
                    </Text>
                  </View>

                  {/* AI Analysis Section */}
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#8B5CF6', marginBottom: 12 }}>
                    🧠 How AI Analyzed Your Text
                  </Text>

                  {/* Context */}
                  <View style={{ backgroundColor: isDark ? '#2D2D2D' : '#F3F4F6', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: 6 }}>
                      CONTEXT
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      <View style={{ backgroundColor: '#8B5CF620', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                        <Text style={{ fontSize: 12, color: '#8B5CF6' }}>
                          📋 {storyStyleResult.analysis.context.purpose}
                        </Text>
                      </View>
                      <View style={{ backgroundColor: '#8B5CF620', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                        <Text style={{ fontSize: 12, color: '#8B5CF6' }}>
                          📝 {storyStyleResult.analysis.context.type}
                        </Text>
                      </View>
                      <View style={{ backgroundColor: '#8B5CF620', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                        <Text style={{ fontSize: 12, color: '#8B5CF6' }}>
                          🎭 {storyStyleResult.analysis.context.formality}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Keywords */}
                  <View style={{ backgroundColor: isDark ? '#2D2D2D' : '#F3F4F6', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: 6 }}>
                      KEYWORDS
                    </Text>
                    <Text style={{ fontSize: 13, color: isDark ? '#E5E7EB' : '#374151', marginBottom: 4 }}>
                      <Text style={{ fontWeight: '600' }}>Category:</Text> {storyStyleResult.analysis.keywords.category}
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                      {storyStyleResult.analysis.keywords.topics.map((topic, i) => (
                        <View key={i} style={{ backgroundColor: '#10B98120', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                          <Text style={{ fontSize: 11, color: '#10B981' }}>#{topic}</Text>
                        </View>
                      ))}
                    </View>
                    {storyStyleResult.analysis.keywords.entities.length > 0 && (
                      <Text style={{ fontSize: 11, color: isDark ? '#9CA3AF' : '#6B7280', marginTop: 6 }}>
                        Entities: {storyStyleResult.analysis.keywords.entities.join(', ')}
                      </Text>
                    )}
                  </View>

                  {/* Mood */}
                  <View style={{ backgroundColor: isDark ? '#2D2D2D' : '#F3F4F6', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: 6 }}>
                      MOOD
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      <View style={{ backgroundColor: '#F59E0B20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                        <Text style={{ fontSize: 12, color: '#F59E0B' }}>
                          💫 {storyStyleResult.analysis.mood.primary}
                        </Text>
                      </View>
                      <View style={{ backgroundColor: '#F59E0B20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                        <Text style={{ fontSize: 12, color: '#F59E0B' }}>
                          ⚡ {storyStyleResult.analysis.mood.energy} energy
                        </Text>
                      </View>
                      <View style={{ backgroundColor: '#F59E0B20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                        <Text style={{ fontSize: 12, color: '#F59E0B' }}>
                          🗣️ {storyStyleResult.analysis.mood.tone}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Style Suggestion */}
                  <View style={{ backgroundColor: isDark ? '#2D2D2D' : '#F3F4F6', borderRadius: 12, padding: 12, marginBottom: 16 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: 6 }}>
                      STYLE RECOMMENDATION
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      <View style={{ backgroundColor: '#EC489920', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                        <Text style={{ fontSize: 12, color: '#EC4899' }}>
                          🎨 {storyStyleResult.analysis.suggestedStyle.aesthetic}
                        </Text>
                      </View>
                      <View style={{ backgroundColor: '#EC489920', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                        <Text style={{ fontSize: 12, color: '#EC4899' }}>
                          🌈 {storyStyleResult.analysis.suggestedStyle.colorMood}
                        </Text>
                      </View>
                      <View style={{ backgroundColor: '#EC489920', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                        <Text style={{ fontSize: 12, color: '#EC4899' }}>
                          ✦ {storyStyleResult.analysis.suggestedStyle.intensity}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Colors Used */}
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#8B5CF6', marginBottom: 12 }}>
                    🎨 Design Colors
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
                    {[
                      { label: 'BG', color: storyStyleResult.design.background.primaryColor },
                      { label: 'Text', color: storyStyleResult.design.colors.titleText },
                      { label: 'Accent', color: storyStyleResult.design.colors.accent },
                      { label: 'Border', color: storyStyleResult.design.colors.border },
                    ].map((item, i) => (
                      <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: item.color,
                            borderWidth: 2,
                            borderColor: isDark ? '#374151' : '#E5E7EB',
                          }}
                        />
                        <Text style={{ fontSize: 10, color: isDark ? '#9CA3AF' : '#6B7280', marginTop: 4 }}>
                          {item.label}
                        </Text>
                        <Text style={{ fontSize: 9, color: isDark ? '#6B7280' : '#9CA3AF' }}>
                          {item.color}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Webtoon Artist Section */}
                  <View style={{ borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#E5E7EB', paddingTop: 16 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#EC4899', marginBottom: 12 }}>
                      🎨 Webtoon Artist
                    </Text>
                    <Text style={{ fontSize: 12, color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: 12 }}>
                      Generate a storyboard sketch based on your note's analysis
                    </Text>

                    {/* Style Selector */}
                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                      {WEBTOON_STYLES.map((styleOption) => (
                        <TouchableOpacity
                          key={styleOption.id}
                          onPress={() => setSelectedWebtoonStyle(styleOption.id)}
                          style={{
                            flex: 1,
                            paddingVertical: 12,
                            paddingHorizontal: 8,
                            borderRadius: 12,
                            backgroundColor: selectedWebtoonStyle === styleOption.id
                              ? '#EC4899'
                              : (isDark ? '#2D2D2D' : '#F3F4F6'),
                            borderWidth: 2,
                            borderColor: selectedWebtoonStyle === styleOption.id
                              ? '#EC4899'
                              : 'transparent',
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ fontSize: 20, marginBottom: 4 }}>{styleOption.emoji}</Text>
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: '600',
                              color: selectedWebtoonStyle === styleOption.id
                                ? '#FFFFFF'
                                : (isDark ? '#E5E7EB' : '#374151'),
                            }}
                          >
                            {styleOption.name}
                          </Text>
                          <Text
                            style={{
                              fontSize: 9,
                              color: selectedWebtoonStyle === styleOption.id
                                ? 'rgba(255,255,255,0.8)'
                                : (isDark ? '#9CA3AF' : '#6B7280'),
                              textAlign: 'center',
                              marginTop: 2,
                            }}
                            numberOfLines={1}
                          >
                            {styleOption.description}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Generate Button */}
                    <TouchableOpacity
                      onPress={handleGenerateWebtoonSketch}
                      disabled={isGeneratingSketch}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 12,
                        borderRadius: 12,
                        backgroundColor: '#EC4899',
                        opacity: isGeneratingSketch ? 0.7 : 1,
                      }}
                    >
                      {isGeneratingSketch ? (
                        <>
                          <ActivityIndicator color="#FFFFFF" size="small" />
                          <Text style={{ marginLeft: 8, color: '#FFFFFF', fontWeight: '600' }}>
                            Drawing sketch...
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text style={{ marginRight: 6, fontSize: 16 }}>🖌️</Text>
                          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
                            Generate Sketch
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>

                    {/* Generated Sketch Display */}
                    {webtoonSketch && (
                      <View style={{ marginTop: 16 }}>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: isDark ? '#E5E7EB' : '#374151', marginBottom: 8 }}>
                          Generated Sketch ({WEBTOON_STYLES.find(s => s.id === webtoonSketch.response.style)?.name})
                        </Text>
                        <View
                          style={{
                            backgroundColor: isDark ? '#2D2D2D' : '#F3F4F6',
                            borderRadius: 12,
                            overflow: 'hidden',
                          }}
                        >
                          <Image
                            source={{ uri: webtoonSketch.imageUri }}
                            style={{
                              width: '100%',
                              height: 200,
                            }}
                            resizeMode="contain"
                          />
                        </View>
                        <Text style={{ fontSize: 11, color: isDark ? '#9CA3AF' : '#6B7280', marginTop: 8, fontStyle: 'italic' }}>
                          {webtoonSketch.response.sceneDescription}
                        </Text>
                        {webtoonSketch.response.artistNotes && (
                          <Text style={{ fontSize: 10, color: isDark ? '#6B7280' : '#9CA3AF', marginTop: 4 }}>
                            Artist notes: {webtoonSketch.response.artistNotes}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                </>
              )}
            </ScrollView>

            {/* Done Button */}
            <TouchableOpacity
              onPress={() => setShowStoryStyleResult(false)}
              style={{
                backgroundColor: '#8B5CF6',
                paddingVertical: 14,
                borderRadius: 12,
                marginTop: 8,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '600', textAlign: 'center', fontSize: 16 }}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
