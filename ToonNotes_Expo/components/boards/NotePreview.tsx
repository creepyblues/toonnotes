/**
 * NotePreview - Mini note card for board previews
 *
 * Shows note content and design in a compact format
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Note, NoteColor } from '@/types';
import { useDesignStore } from '@/stores';
import { composeStyle } from '@/services/designEngine';

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
    () => composeStyle(design ?? null, note.color || NoteColor.White, 'grid', isDark),
    [design, note.color, isDark]
  );

  // Get background color
  const bgColor = style.backgroundColor || (isDark ? '#374151' : '#FFFFFF');
  const textColor = style.titleColor || (isDark ? '#F3F4F6' : '#1F2937');
  const bodyColor = style.bodyColor || (isDark ? '#9CA3AF' : '#6B7280');

  const content = (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Title */}
      {note.title ? (
        <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
          {note.title}
        </Text>
      ) : null}

      {/* Content preview */}
      <Text style={[styles.content, { color: bodyColor }]} numberOfLines={2}>
        {note.content || 'Empty note'}
      </Text>

      {/* Label indicator if has labels */}
      {note.labels.length > 0 && (
        <View style={styles.labelIndicator}>
          <Text style={styles.labelDot}>•</Text>
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  content: {
    fontSize: 10,
    lineHeight: 14,
    flex: 1,
  },
  labelIndicator: {
    position: 'absolute',
    bottom: 6,
    right: 6,
  },
  labelDot: {
    fontSize: 8,
    color: '#7C3AED',
  },
});

export default NotePreview;
