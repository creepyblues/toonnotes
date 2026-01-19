/**
 * BulletEditor - Mode-based bullet list editor
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
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import type { ComposedStyle } from '@/types';
import { generateUUID } from '@/utils/uuid';

export interface BulletItem {
  id: string;
  text: string;
}

interface BulletEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  style: ComposedStyle;
  isDark: boolean;
}

// Parse line to extract bullet text
const parseBulletText = (line: string): string => {
  // Remove bullet prefix if present
  return line.replace(/^[•\-\*]\s*/, '');
};

// Convert markdown content to bullet items
export function parseBulletFromContent(content: string): BulletItem[] {
  if (!content.trim()) {
    return [{ id: generateUUID(), text: '' }];
  }

  const lines = content.split('\n');
  return lines.map(line => ({
    id: generateUUID(),
    text: parseBulletText(line),
  }));
}

// Convert bullet items back to markdown
export function bulletToContent(items: BulletItem[]): string {
  return items.map(item => `• ${item.text}`).join('\n');
}

export function BulletEditor({
  content,
  onContentChange,
  style,
  isDark,
}: BulletEditorProps) {
  // Track items with stable IDs internally
  const itemsRef = useRef<BulletItem[]>([]);

  // Initialize items from content if needed
  const lines = content.split('\n');

  // Sync items with content - maintain IDs for existing lines
  if (itemsRef.current.length !== lines.length) {
    // Content structure changed, rebuild with new IDs
    itemsRef.current = lines.map((line, index) => ({
      id: itemsRef.current[index]?.id || generateUUID(),
      text: parseBulletText(line),
    }));
  } else {
    // Update text for existing items
    itemsRef.current = itemsRef.current.map((item, index) => ({
      ...item,
      text: parseBulletText(lines[index]),
    }));
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

  // Update text for an item
  const handleTextChange = useCallback((itemId: string, text: string) => {
    const newItems = items.map(item =>
      item.id === itemId ? { ...item, text } : item
    );
    itemsRef.current = newItems;
    onContentChange(bulletToContent(newItems));
  }, [items, onContentChange]);

  // Handle Enter key - add new item after current
  const handleSubmit = useCallback((itemId: string) => {
    const index = items.findIndex(item => item.id === itemId);
    if (index === -1) return;

    const newId = generateUUID();
    const newItems = [...items];
    newItems.splice(index + 1, 0, { id: newId, text: '' });
    itemsRef.current = newItems;
    onContentChange(bulletToContent(newItems));

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
      onContentChange(bulletToContent(newItems));

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
          {/* Bullet */}
          <Text style={[styles.bullet, { color: style.bodyColor }]}>•</Text>

          {/* Text Input */}
          <TextInput
            multiline={true}
            submitBehavior="submit"
            ref={(ref) => setItemRef(item.id, ref)}
            style={[
              styles.textInput,
              { color: style.bodyColor },
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
    alignItems: 'flex-start',
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
    ...Platform.select({
      ios: {},
      android: {
        paddingVertical: 1,
      },
    }),
  },
});

export default BulletEditor;
