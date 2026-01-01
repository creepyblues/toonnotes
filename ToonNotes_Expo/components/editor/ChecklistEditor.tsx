/**
 * ChecklistEditor - Google Keep Style
 *
 * Key differences from previous approach:
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

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface ChecklistEditorProps {
  items: ChecklistItem[];
  onItemsChange: (items: ChecklistItem[]) => void;
  style: ComposedStyle;
  isDark: boolean;
}

// Convert markdown content to checklist items
export function parseChecklistFromContent(content: string): ChecklistItem[] {
  if (!content.trim()) {
    return [{ id: generateUUID(), text: '', checked: false }];
  }

  const lines = content.split('\n');
  return lines.map(line => {
    const isChecked = /\[x\]/i.test(line);
    const text = line.replace(/^-?\s*\[[ xX]\]\s*/, '');
    return {
      id: generateUUID(),
      text,
      checked: isChecked,
    };
  });
}

// Convert checklist items back to markdown
export function checklistToContent(items: ChecklistItem[]): string {
  return items
    .map(item => `- [${item.checked ? 'x' : ' '}] ${item.text}`)
    .join('\n');
}

export function ChecklistEditor({
  items,
  onItemsChange,
  style,
  isDark,
}: ChecklistEditorProps) {
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
    onItemsChange(newItems);
  }, [items, onItemsChange]);

  // Update text for an item
  const handleTextChange = useCallback((itemId: string, text: string) => {
    const newItems = items.map(item =>
      item.id === itemId ? { ...item, text } : item
    );
    onItemsChange(newItems);
  }, [items, onItemsChange]);

  // Handle Enter key - add new item after current
  const handleSubmit = useCallback((itemId: string) => {
    const index = items.findIndex(item => item.id === itemId);
    if (index === -1) return;

    const newId = generateUUID();
    const newItems = [...items];
    newItems.splice(index + 1, 0, { id: newId, text: '', checked: false });
    onItemsChange(newItems);

    // Focus the new item after render
    focusItem(newId);
  }, [items, onItemsChange, focusItem]);

  // Handle backspace on empty item - remove it and focus previous
  const handleKeyPress = useCallback((itemId: string, key: string, text: string) => {
    if (key === 'Backspace' && text === '' && items.length > 1) {
      const index = items.findIndex(item => item.id === itemId);
      if (index <= 0) return; // Don't remove first item

      const prevItemId = items[index - 1].id;
      const newItems = items.filter(item => item.id !== itemId);
      onItemsChange(newItems);

      // Focus previous item
      focusItem(prevItemId);
    }
  }, [items, onItemsChange, focusItem]);

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
        <View key={item.id} style={styles.itemRow}>
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
            placeholder="List item"
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
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 11,
    paddingVertical: 1,
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
    paddingVertical: 2,
    ...Platform.select({
      ios: {},
      android: {
        paddingVertical: 1,
      },
    }),
  },
});

export default ChecklistEditor;
