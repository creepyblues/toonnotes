import React, { useRef, useState, useCallback, useMemo, memo } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData,
  TextLayoutEventData,
  LayoutChangeEvent,
  I18nManager,
} from 'react-native';
import {
  useEditorContent,
  useCheckboxPositions,
  useHashtagDetection,
  ContentChangeResult,
} from '@/hooks/editor';
import { CheckboxOverlay } from './CheckboxOverlay';
import type { ComposedStyle } from '@/types';

interface EditorContentProps {
  title: string;
  content: string;
  style: ComposedStyle;
  isDark: boolean;
  fontsLoaded: boolean;
  onTitleChange: (text: string) => void;
  onContentChange: (text: string) => void;
  onCursorChange?: (position: number) => void;
  onHashtagDetected?: (query: string, isTyping: boolean) => void;
  getTitleFont: () => string;
  getBodyFont: () => string;
  placeholder?: string;
}

/**
 * Main editor content component with single TextInput and checkbox overlays
 */
export const EditorContent = memo(function EditorContent({
  title,
  content,
  style,
  isDark,
  fontsLoaded,
  onTitleChange,
  onContentChange,
  onCursorChange,
  onHashtagDetected,
  getTitleFont,
  getBodyFont,
  placeholder = "Your thoughts",
}: EditorContentProps) {
  const contentInputRef = useRef<TextInput>(null);
  const [selection, setSelection] = useState<{ start: number; end: number } | undefined>();
  const [contentLayout, setContentLayout] = useState({ width: 0, height: 0 });

  // Parse content and get manipulation functions
  const {
    parsedLines,
    checkboxLines,
    toggleCheckbox,
    handleContentChange: processChange,
  } = useEditorContent(content);

  // Get checkbox positions for overlays
  const {
    checkboxPositions,
    handleTextLayout,
    hasListItems,
  } = useCheckboxPositions(parsedLines);

  // Hashtag detection
  const cursorPosition = selection?.start ?? 0;
  const {
    detection: hashtagDetection,
    updateDetection,
  } = useHashtagDetection(content, cursorPosition);

  // Handle content change with auto-continue/remove logic
  const handleContentChangeInternal = useCallback((text: string) => {
    const cursor = selection?.start ?? text.length;
    const result: ContentChangeResult = processChange(text, cursor);

    onContentChange(result.content);

    // Set cursor position if specified
    if (result.selection) {
      setSelection(result.selection);
    }

    // Update hashtag detection
    const newCursor = result.selection?.start ?? cursor;
    updateDetection(result.content, newCursor);

    // Notify parent of hashtag state
    if (onHashtagDetected) {
      const textBeforeCursor = result.content.slice(0, newCursor);
      const match = textBeforeCursor.match(/#(\w*)$/);
      if (match) {
        onHashtagDetected(match[1] || '', true);
      } else {
        onHashtagDetected('', false);
      }
    }
  }, [selection, processChange, onContentChange, updateDetection, onHashtagDetected]);

  // Handle selection change
  const handleSelectionChange = useCallback((
    event: NativeSyntheticEvent<TextInputSelectionChangeEventData>
  ) => {
    const newSelection = event.nativeEvent.selection;
    setSelection(newSelection);
    onCursorChange?.(newSelection.start);

    // Update hashtag detection on cursor move
    updateDetection(content, newSelection.start);
  }, [content, onCursorChange, updateDetection]);

  // Handle checkbox toggle
  const handleCheckboxToggle = useCallback((lineIndex: number) => {
    const newContent = toggleCheckbox(lineIndex);
    onContentChange(newContent);
  }, [toggleCheckbox, onContentChange]);

  // Handle layout change
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setContentLayout({
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height,
    });
  }, []);

  // Calculate left padding for checkbox/bullet space
  const contentPaddingLeft = hasListItems ? 36 : 0;

  // Memoize title style
  const titleStyle = useMemo(() => ({
    color: style.titleColor,
    fontFamily: getTitleFont(),
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 16,
    padding: 0,
  }), [style.titleColor, getTitleFont]);

  // Memoize content style
  const contentStyle = useMemo(() => ({
    color: style.bodyColor,
    fontFamily: getBodyFont(),
    fontSize: 16,
    padding: 0,
    paddingLeft: contentPaddingLeft,
    minHeight: 300,
    textAlignVertical: 'top' as const,
  }), [style.bodyColor, getBodyFont, contentPaddingLeft]);

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Title Input */}
      <TextInput
        style={titleStyle}
        value={title}
        onChangeText={onTitleChange}
        placeholder="Title"
        placeholderTextColor={isDark ? '#666' : '#999'}
        multiline
        scrollEnabled={false}
        accessibilityLabel="Note title"
        accessibilityHint="Enter your note title"
      />

      {/* Content Container */}
      <View style={styles.contentContainer} onLayout={handleLayout}>
        {/* Main Text Input */}
        <TextInput
          ref={contentInputRef}
          style={contentStyle}
          value={content}
          onChangeText={handleContentChangeInternal}
          onSelectionChange={handleSelectionChange}
          selection={selection}
          placeholder={placeholder}
          placeholderTextColor={style.bodyColor ? `${style.bodyColor}80` : '#9CA3AF'}
          multiline
          scrollEnabled={false}
          textAlignVertical="top"
          accessibilityLabel="Note content"
          accessibilityHint="Enter your note content. Use # to add labels."
        />

        {/* Checkbox Overlays */}
        <View style={styles.overlayContainer} pointerEvents="box-none">
          {checkboxPositions.map((position) => (
            <CheckboxOverlay
              key={`checkbox-${position.lineIndex}`}
              position={position}
              onToggle={() => handleCheckboxToggle(position.lineIndex)}
              accentColor={style.accentColor || '#007AFF'}
              isDark={isDark}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  contentContainer: {
    position: 'relative',
    flex: 1,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
});

export default EditorContent;
