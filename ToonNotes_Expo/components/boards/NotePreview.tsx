/**
 * NotePreview - Mini note card for board previews
 *
 * Shows note content and design in a compact format
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Check } from 'phosphor-react-native';
import { Note, NoteColor } from '@/types';
import { useDesignStore } from '@/stores';
import { composeStyle } from '@/services/designEngine';

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

  // Bullet patterns: •, -, * at start (but not if followed by [ which would be checkbox)
  const bulletMatch = line.match(/^([•\*])\s*/);
  const dashBulletMatch = line.match(/^-\s+(?!\[)/); // dash followed by space but NOT [

  if (bulletMatch) {
    return { type: 'bullet', text: line.replace(/^[•\*]\s*/, '') };
  }
  if (dashBulletMatch) {
    return { type: 'bullet', text: line.replace(/^-\s+/, '') };
  }

  return { type: 'text', text: line };
}

interface NotePreviewProps {
  note: Note;
  onPress?: () => void;
  isDark: boolean;
}

export function NotePreview({ note, onPress, isDark }: NotePreviewProps) {
  const { getDesignById } = useDesignStore();

  // Get design if exists
  const design = note.designId ? getDesignById(note.designId) : null;

  // Compose style for preview context (memoized to prevent expensive recalculations)
  const style = useMemo(
    () => composeStyle(design ?? null, note.color || NoteColor.White, 'grid', isDark, note.labels),
    [design, note.color, isDark, note.labels]
  );

  // Parse content lines
  const parsedLines = useMemo(() => {
    if (!note.content) return [];
    const lines = note.content.split('\n').slice(0, 3);
    return lines.map(line => parseLineType(line));
  }, [note.content]);

  // Get background color
  const bgColor = style.backgroundColor || (isDark ? '#374151' : '#FFFFFF');
  const textColor = style.titleColor || (isDark ? '#F3F4F6' : '#1F2937');
  const bodyColor = style.bodyColor || (isDark ? '#9CA3AF' : '#6B7280');
  const accentColor = style.accentColor || '#10B981';

  const content = (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Title */}
      {note.title ? (
        <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
          {note.title}
        </Text>
      ) : null}

      {/* Content preview with formatted checkboxes and bullets */}
      <View style={[styles.contentContainer, { overflow: 'hidden' }]}>
        {parsedLines.length === 0 ? (
          <Text style={[styles.content, { color: bodyColor }]}>Empty note</Text>
        ) : (
          parsedLines.slice(0, 3).map((line, index) => {
            if (line.type === 'checkbox') {
              return (
                <View key={index} style={styles.checkboxLine}>
                  {line.checked ? (
                    <View style={[styles.checkboxChecked, { backgroundColor: accentColor }]}>
                      <Check size={6} color="#FFF" weight="bold" />
                    </View>
                  ) : (
                    <View style={[styles.checkboxUnchecked, { borderColor: isDark ? '#666' : '#CCC' }]} />
                  )}
                  <Text
                    style={[
                      styles.content,
                      {
                        color: line.checked ? (isDark ? '#666' : '#999') : bodyColor,
                        textDecorationLine: line.checked ? 'line-through' : 'none',
                        flex: 1,
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
                  <Text style={[styles.bulletDot, { color: bodyColor }]}>•</Text>
                  <Text style={[styles.content, { color: bodyColor, flex: 1 }]} numberOfLines={1}>
                    {line.text}
                  </Text>
                </View>
              );
            }

            return (
              <Text key={index} style={[styles.content, { color: bodyColor }]} numberOfLines={1}>
                {line.text}
              </Text>
            );
          })
        )}
      </View>

      {/* Label indicator if has labels */}
      {note.labels.length > 0 && (
        <View style={styles.labelIndicator}>
          <Text style={styles.labelDotIndicator}>•</Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.wrapper}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.wrapper}>{content}</View>;
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  contentContainer: {
    flex: 1,
    maxHeight: 50,
  },
  content: {
    fontSize: 10,
    lineHeight: 14,
  },
  checkboxLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  checkboxUnchecked: {
    width: 10,
    height: 10,
    borderRadius: 2,
    borderWidth: 1,
    marginRight: 4,
  },
  checkboxChecked: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginRight: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  bulletDot: {
    fontSize: 10,
    marginRight: 4,
    lineHeight: 14,
  },
  labelIndicator: {
    position: 'absolute',
    bottom: 6,
    right: 6,
  },
  labelDotIndicator: {
    fontSize: 8,
    color: '#7C3AED',
  },
});

export default NotePreview;
