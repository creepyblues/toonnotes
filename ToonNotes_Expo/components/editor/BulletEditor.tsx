/**
 * BulletEditor - Mode-based bullet list editor
 *
 * Renders each line as a bullet point with text input.
 * Used when editor is in "bullet" mode.
 */

import React, { useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
} from 'react-native';
import type { ComposedStyle } from '@/types';

interface BulletEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  style: ComposedStyle;
  isDark: boolean;
}

export function BulletEditor({
  content,
  onContentChange,
  style,
  isDark,
}: BulletEditorProps) {
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const lines = content.split('\n');

  // Parse line to extract bullet text
  const parseLine = (line: string) => {
    // Remove bullet prefix if present
    const bulletMatch = line.match(/^[•\-\*]\s*/);
    if (bulletMatch) {
      return line.replace(/^[•\-\*]\s*/, '');
    }
    return line;
  };

  // Update text for a specific line
  const updateLine = (index: number, newText: string) => {
    const newLines = [...lines];
    newLines[index] = `• ${newText}`;
    onContentChange(newLines.join('\n'));
  };

  // Handle Enter key - add new line
  const handleSubmit = (index: number) => {
    const newLines = [...lines];
    newLines.splice(index + 1, 0, '• ');
    onContentChange(newLines.join('\n'));

    // Focus the new line after render
    setTimeout(() => {
      inputRefs.current[index + 1]?.focus();
    }, 50);
  };

  // Handle backspace on empty line - remove it
  const handleKeyPress = (index: number, key: string, text: string) => {
    if (key === 'Backspace' && text === '' && lines.length > 1) {
      const newLines = [...lines];
      newLines.splice(index, 1);
      onContentChange(newLines.join('\n'));

      // Focus previous line
      setTimeout(() => {
        const prevIndex = Math.max(0, index - 1);
        inputRefs.current[prevIndex]?.focus();
      }, 50);
    }
  };

  return (
    <View style={styles.container}>
      {lines.map((line, index) => {
        const text = parseLine(line);

        return (
          <View key={index} style={styles.lineContainer}>
            {/* Bullet */}
            <Text style={[styles.bullet, { color: style.bodyColor }]}>•</Text>

            {/* Text Input */}
            <TextInput
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[
                styles.textInput,
                { color: style.bodyColor },
              ]}
              value={text}
              onChangeText={(newText) => updateLine(index, newText)}
              onSubmitEditing={() => handleSubmit(index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key, text)}
              placeholder={index === 0 ? 'Add item...' : ''}
              placeholderTextColor={isDark ? '#666' : '#999'}
              returnKeyType="next"
              blurOnSubmit={false}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 10,
    paddingVertical: 1,
  },
  bullet: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 2,
  },
});

export default BulletEditor;
