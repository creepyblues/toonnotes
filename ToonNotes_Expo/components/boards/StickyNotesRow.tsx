/**
 * StickyNotesRow - Horizontal scrolling row of sticky notes
 *
 * Displays notes within a board as hand-placed sticky notes.
 * Supports horizontal scrolling for boards with many notes.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { FileText } from 'lucide-react-native';
import { Note } from '@/types';
import { StickyNote } from './StickyNote';

interface StickyNotesRowProps {
  notes: Note[];
  isDark: boolean;
  onNotePress?: (note: Note) => void;
  maxVisible?: number; // Max notes to show before "and X more"
}

const NOTE_SIZE = 80;
const NOTE_SPACING = 16;

export function StickyNotesRow({
  notes,
  isDark,
  onNotePress,
  maxVisible = 6,
}: StickyNotesRowProps) {
  // Take up to maxVisible notes for display
  const displayNotes = notes.slice(0, maxVisible);
  const remainingCount = notes.length - displayNotes.length;

  if (notes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View
          style={[
            styles.emptyPlaceholder,
            {
              borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
            },
          ]}
        >
          <FileText
            size={24}
            color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}
          />
          <Text
            style={[
              styles.emptyText,
              { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)' },
            ]}
          >
            No notes yet
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scrollView}
    >
      {displayNotes.map((note, index) => (
        <View
          key={note.id}
          style={[
            styles.noteWrapper,
            { marginLeft: index === 0 ? NOTE_SPACING : NOTE_SPACING / 2 },
          ]}
        >
          <StickyNote
            note={note}
            isDark={isDark}
            size={NOTE_SIZE}
            onPress={onNotePress ? () => onNotePress(note) : undefined}
          />
        </View>
      ))}

      {/* Show remaining count */}
      {remainingCount > 0 && (
        <View style={styles.remainingBadge}>
          <Text
            style={[
              styles.remainingText,
              { color: isDark ? '#9CA3AF' : '#6B7280' },
            ]}
          >
            +{remainingCount}
          </Text>
        </View>
      )}

      {/* Right padding */}
      <View style={{ width: NOTE_SPACING }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  noteWrapper: {
    // Add some padding for shadow/rotation overflow
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyPlaceholder: {
    width: 100,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  emptyText: {
    fontSize: 11,
    fontWeight: '500',
  },
  remainingBadge: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  remainingText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StickyNotesRow;
