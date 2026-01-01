/**
 * CheckboxEditor - Mode-based checkbox list editor
 *
 * Renders each line as a tappable checkbox with text input.
 * Used when editor is in "checkbox" mode.
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
} from 'react-native';
import { Check } from 'phosphor-react-native';
import type { ComposedStyle } from '@/types';

interface CheckboxEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  style: ComposedStyle;
  isDark: boolean;
}

export function CheckboxEditor({
  content,
  onContentChange,
  style,
  isDark,
}: CheckboxEditorProps) {
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const lines = content.split('\n');

  // Parse line to extract checkbox state and text
  const parseLine = (line: string) => {
    const checkedMatch = line.match(/^-?\s*\[[xX]\]\s*/);
    const uncheckedMatch = line.match(/^-?\s*\[\s*\]\s*/);

    if (checkedMatch) {
      return { isChecked: true, text: line.replace(/^-?\s*\[[xX]\]\s*/, '') };
    }
    if (uncheckedMatch) {
      return { isChecked: false, text: line.replace(/^-?\s*\[\s*\]\s*/, '') };
    }
    // Line without checkbox format - treat as unchecked with the whole line as text
    return { isChecked: false, text: line };
  };

  // Toggle checkbox state for a line
  const toggleLine = (index: number) => {
    const newLines = [...lines];
    const { isChecked, text } = parseLine(newLines[index]);
    newLines[index] = `- [${isChecked ? ' ' : 'x'}] ${text}`;
    onContentChange(newLines.join('\n'));
  };

  // Update text for a specific line
  const updateLine = (index: number, newText: string) => {
    const newLines = [...lines];
    const { isChecked } = parseLine(newLines[index]);
    newLines[index] = `- [${isChecked ? 'x' : ' '}] ${newText}`;
    onContentChange(newLines.join('\n'));
  };

  // Handle Enter key - add new line
  const handleSubmit = (index: number) => {
    const newLines = [...lines];
    newLines.splice(index + 1, 0, '- [ ] ');
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
        const { isChecked, text } = parseLine(line);

        return (
          <View key={index} style={styles.lineContainer}>
            {/* Checkbox */}
            <TouchableOpacity
              onPress={() => toggleLine(index)}
              style={styles.checkboxTouchable}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isChecked }}
              accessibilityLabel={isChecked ? 'Checked' : 'Unchecked'}
            >
              <View
                style={[
                  styles.checkbox,
                  isChecked && styles.checkboxChecked,
                  isChecked && { backgroundColor: style.accentColor || '#10B981' },
                  !isChecked && { borderColor: isDark ? '#666' : '#CCC' },
                ]}
              >
                {isChecked && <Check size={12} color="#FFF" weight="bold" />}
              </View>
            </TouchableOpacity>

            {/* Text Input */}
            <TextInput
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[
                styles.textInput,
                {
                  color: isChecked ? (isDark ? '#666' : '#999') : style.bodyColor,
                  textDecorationLine: isChecked ? 'line-through' : 'none',
                },
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
    minHeight: 40,
    paddingVertical: 4,
  },
  checkboxTouchable: {
    padding: 8,
    marginRight: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderWidth: 0,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
});

export default CheckboxEditor;
