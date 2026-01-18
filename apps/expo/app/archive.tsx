import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Archive } from 'phosphor-react-native';

import { useNoteStore, useDesignStore } from '@/stores';
import { NoteCard } from '@/components/notes/NoteCard';
import { Note } from '@/types';
import { useTheme } from '@/src/theme';

// Grid constants for consistent 2-column layout
const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_PADDING = 16;
const GRID_GAP = 12;
const ITEM_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;

export default function ArchiveScreen() {
  const router = useRouter();
  const { getArchivedNotes, unarchiveNote } = useNoteStore();
  const { getDesignById } = useDesignStore();
  const { colors, isDark } = useTheme();

  const archivedNotes = getArchivedNotes();

  const handleNotePress = (note: Note) => {
    router.push(`/note/${note.id}`);
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: `${colors.accent}15` }]}>
        <Archive size={40} color={colors.textSecondary} weight="regular" />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
        No archived notes
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Notes you archive will appear here
      </Text>
    </View>
  );

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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Archive
        </Text>
      </View>

      {/* Note Grid */}
      {archivedNotes.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={archivedNotes}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: GRID_PADDING }}
          columnWrapperStyle={{ gap: GRID_GAP }}
          renderItem={({ item }) => (
            <View style={{ width: ITEM_WIDTH, marginBottom: 12 }}>
              <NoteCard
                note={item}
                design={item.designId ? getDesignById(item.designId) : null}
                onPress={() => handleNotePress(item)}
                isDark={isDark}
                context="grid"
              />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
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
