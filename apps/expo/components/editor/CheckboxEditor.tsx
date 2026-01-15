/**
 * CheckboxEditor - Mode-based checkbox list editor
 *
 * Key patterns (matching ChecklistEditor):
 * 1. Stable UUIDs as keys (not array indices)
 * 2. Map<string, TextInput> for refs (not array)
 * 3. requestAnimationFrame for focus (not setTimeout)
 * 4. Items as array of objects (not string content)
 */

import React, { useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Check } from 'phosphor-react-native';
import type { ComposedStyle } from '@/types';
import { generateUUID } from '@/utils/uuid';

export interface CheckboxItem {
  id: string;
  text: string;
  checked: boolean;
}

interface CheckboxEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  style: ComposedStyle;
  isDark: boolean;
}

// Parse line to extract checkbox state and text
const parseCheckboxLine = (line: string): { checked: boolean; text: string } => {
  const checkedMatch = line.match(/^-?\s*\[[xX]\]\s*/);
  const uncheckedMatch = line.match(/^-?\s*\[\s*\]\s*/);

  if (checkedMatch) {
    return { checked: true, text: line.replace(/^-?\s*\[[xX]\]\s*/, '') };
  }
  if (uncheckedMatch) {
    return { checked: false, text: line.replace(/^-?\s*\[\s*\]\s*/, '') };
  }
  // Line without checkbox format - treat as unchecked with the whole line as text
  return { checked: false, text: line };
};

// Convert markdown content to checkbox items
export function parseCheckboxFromContent(content: string): CheckboxItem[] {
  if (!content.trim()) {
    return [{ id: generateUUID(), text: '', checked: false }];
  }

  const lines = content.split('\n');
  return lines.map(line => {
    const { checked, text } = parseCheckboxLine(line);
    return {
      id: generateUUID(),
      text,
      checked,
    };
  });
}

// Convert checkbox items back to markdown
export function checkboxToContent(items: CheckboxItem[]): string {
  return items
    .map(item => `- [${item.checked ? 'x' : ' '}] ${item.text}`)
    .join('\n');
}

export function CheckboxEditor({
  content,
  onContentChange,
  style,
  isDark,
}: CheckboxEditorProps) {
  // Track items with stable IDs internally
  const itemsRef = useRef<CheckboxItem[]>([]);

  // Initialize items from content if needed
  const lines = content.split('\n');

  // Sync items with content - maintain IDs for existing lines
  if (itemsRef.current.length !== lines.length) {
    // Content structure changed, rebuild with new IDs
    itemsRef.current = lines.map((line, index) => {
      const { checked, text } = parseCheckboxLine(line);
      return {
        id: itemsRef.current[index]?.id || generateUUID(),
        text,
        checked,
      };
    });
  } else {
    // Update text/checked for existing items
    itemsRef.current = itemsRef.current.map((item, index) => {
      const { checked, text } = parseCheckboxLine(lines[index]);
      return { ...item, text, checked };
    });
  }

  const items = itemsRef.current;

  // Map of refs keyed by stable item ID
  const inputRefs = useRef<Map<string, TextInput>>(new Map());

  // Focus an item by ID after React finishes rendering
  const focusItem = useCallback((itemId: string) => {
    requestAnimationFrame(() => {
      const input = inputRefs.current.get(itemId);
      input?.focus();
    });
  }, []);

  // Toggle checkbox
  const handleToggle = useCallback((itemId: string) => {
    const newItems = items.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    itemsRef.current = newItems;
    onContentChange(checkboxToContent(newItems));
  }, [items, onContentChange]);

  // Update text for an item
  const handleTextChange = useCallback((itemId: string, text: string) => {
    const newItems = items.map(item =>
      item.id === itemId ? { ...item, text } : item
    );
    itemsRef.current = newItems;
    onContentChange(checkboxToContent(newItems));
  }, [items, onContentChange]);

  // Handle Enter key - add new item after current
  const handleSubmit = useCallback((itemId: string) => {
    const index = items.findIndex(item => item.id === itemId);
    if (index === -1) return;

    const newId = generateUUID();
    const newItems = [...items];
    newItems.splice(index + 1, 0, { id: newId, text: '', checked: false });
    itemsRef.current = newItems;
    onContentChange(checkboxToContent(newItems));

    // Focus the new item after render
    focusItem(newId);
  }, [items, onContentChange, focusItem]);

  // Handle backspace on empty item - remove it and focus previous
  const handleKeyPress = useCallback((itemId: string, key: string, text: string) => {
    if (key === 'Backspace' && text === '' && items.length > 1) {
      const index = items.findIndex(item => item.id === itemId);
      if (index <= 0) return; // Don't remove first item

      const prevItemId = items[index - 1].id;
      const newItems = items.filter(item => item.id !== itemId);
      itemsRef.current = newItems;
      onContentChange(checkboxToContent(newItems));

      // Focus previous item
      focusItem(prevItemId);
    }
  }, [items, onContentChange, focusItem]);

  // Set ref for an item
  const setItemRef = useCallback((itemId: string, ref: TextInput | null) => {
    if (ref) {
      inputRefs.current.set(itemId, ref);
    } else {
      inputRefs.current.delete(itemId);
    }
  }, []);

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <View key={item.id} style={styles.lineContainer}>
          {/* Checkbox */}
          <TouchableOpacity
            onPress={() => handleToggle(item.id)}
            style={styles.checkboxTouchable}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: item.checked }}
            accessibilityLabel={item.checked ? 'Checked' : 'Unchecked'}
          >
            <View
              style={[
                styles.checkbox,
                item.checked && styles.checkboxChecked,
                item.checked && { backgroundColor: style.accentColor || '#10B981' },
                !item.checked && { borderColor: isDark ? '#666' : '#CCC' },
              ]}
            >
              {item.checked && <Check size={12} color="#FFF" weight="bold" />}
            </View>
          </TouchableOpacity>

          {/* Text Input */}
          <TextInput
            multiline={true}
            submitBehavior="submit"
            ref={(ref) => setItemRef(item.id, ref)}
            style={[
              styles.textInput,
              {
                color: item.checked ? (isDark ? '#666' : '#999') : style.bodyColor,
                textDecorationLine: item.checked ? 'line-through' : 'none',
              },
            ]}
            value={item.text}
            onChangeText={(text) => handleTextChange(item.id, text)}
            onSubmitEditing={() => handleSubmit(item.id)}
            onKeyPress={({ nativeEvent }) =>
              handleKeyPress(item.id, nativeEvent.key, item.text)
            }
            placeholder={items[0]?.id === item.id ? 'Add item...' : ''}
            placeholderTextColor={isDark ? '#666' : '#999'}
            returnKeyType="next"
            blurOnSubmit={false}
          />
        </View>
      ))}
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
    ...Platform.select({
      ios: {},
      android: {
        paddingVertical: 4,
      },
    }),
  },
});

export default CheckboxEditor;
