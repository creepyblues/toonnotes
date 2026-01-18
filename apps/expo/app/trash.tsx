import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Trash, ArrowCounterClockwise, X } from 'phosphor-react-native';

import { useNoteStore, useDesignStore } from '@/stores';
import { NoteCard } from '@/components/notes/NoteCard';
import { Note } from '@/types';
import { useTheme } from '@/src/theme';

// Grid constants for consistent 2-column layout
const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_PADDING = 16;
const GRID_GAP = 12;
const ITEM_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;

export default function TrashScreen() {
  const router = useRouter();
  const { getDeletedNotes, restoreNote, permanentlyDeleteNote } = useNoteStore();
  const { getDesignById } = useDesignStore();
  const { colors, isDark, semantic } = useTheme();

  const deletedNotes = getDeletedNotes();

  const handleRestore = (noteId: string) => {
    restoreNote(noteId);
  };

  const handlePermanentDelete = (noteId: string) => {
    Alert.alert(
      'Delete Forever',
      'This note will be permanently deleted. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => permanentlyDeleteNote(noteId),
        },
      ]
    );
  };

  const handleEmptyTrash = () => {
    if (deletedNotes.length === 0) return;

    Alert.alert(
      'Empty Trash',
      `Permanently delete ${deletedNotes.length} note${deletedNotes.length > 1 ? 's' : ''}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Empty Trash',
          style: 'destructive',
          onPress: () => {
            deletedNotes.forEach((note) => permanentlyDeleteNote(note.id));
          },
        },
      ]
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: `${semantic.error}15` }]}>
        <Trash size={40} color={colors.textSecondary} weight="regular" />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
        Trash is empty
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Deleted notes will appear here for 30 days
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: Note }) => {
    const deletedDate = item.deletedAt ? new Date(item.deletedAt).toLocaleDateString() : '';

    return (
      <View style={{ width: ITEM_WIDTH, marginBottom: 12 }}>
        {/* Note Card */}
        <NoteCard
          note={item}
          design={item.designId ? getDesignById(item.designId) : null}
          onPress={() => {}}
          isDark={isDark}
          context="grid"
        />

        {/* Deleted date */}
        <Text style={[styles.deletedDate, { color: colors.textTertiary }]}>
          Deleted {deletedDate}
        </Text>

        {/* Action buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            onPress={() => handleRestore(item.id)}
            style={[styles.actionButton, { backgroundColor: isDark ? colors.backgroundTertiary : 'rgba(0,0,0,0.05)' }]}
            accessibilityLabel="Restore note"
            accessibilityRole="button"
          >
            <ArrowCounterClockwise size={16} color={semantic.success} />
            <Text style={[styles.actionButtonText, { color: semantic.success }]}>
              Restore
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handlePermanentDelete(item.id)}
            style={[styles.actionButton, { backgroundColor: isDark ? colors.backgroundTertiary : 'rgba(0,0,0,0.05)' }]}
            accessibilityLabel="Delete note permanently"
            accessibilityRole="button"
          >
            <X size={16} color={semantic.error} />
            <Text style={[styles.actionButtonText, { color: semantic.error }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}
      edges={['top']}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.backgroundSecondary,
            borderBottomColor: colors.separator,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Trash
          </Text>
        </View>

        {deletedNotes.length > 0 && (
          <TouchableOpacity
            onPress={handleEmptyTrash}
            style={styles.emptyTrashButton}
            accessibilityLabel="Empty trash"
            accessibilityRole="button"
          >
            <Text style={[styles.emptyTrashText, { color: semantic.error }]}>
              Empty Trash
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Note Grid */}
      {deletedNotes.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={deletedNotes}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: GRID_PADDING }}
          columnWrapperStyle={{ gap: GRID_GAP }}
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyTrashButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  emptyTrashText: {
    fontWeight: '500',
  },
  // Item styles
  deletedDate: {
    fontSize: 11,
    marginTop: 6,
    marginBottom: 6,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
