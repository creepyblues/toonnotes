import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, MagnifyingGlass, X, PushPin, XCircle, NotePencil } from 'phosphor-react-native';

import { useNoteStore, useUserStore, useDesignStore } from '@/stores';
import { NoteCard } from '@/components/notes/NoteCard';
import { Note, NoteColor } from '@/types';
import { useTheme } from '@/src/theme';

// Calculate item dimensions for consistent 2-column grid
const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_PADDING = 16;
const GRID_GAP = 12;
const ITEM_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;
const ITEM_HEIGHT = ITEM_WIDTH + 12; // Square aspect ratio + margin bottom

export default function NotesScreen() {
  const router = useRouter();
  const { notes, getActiveNotes, searchNotes, addNote } = useNoteStore();
  const { colors, isDark } = useTheme();
  const { getDesignById } = useDesignStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Get design by id using the store's method (handles user designs + label presets)
  const getDesign = useCallback((designId?: string) => {
    if (!designId) return null;
    return getDesignById(designId) || null;
  }, [getDesignById]);

  // Get filtered notes
  const filteredNotes = useMemo(() => {
    if (searchQuery.trim()) {
      return searchNotes(searchQuery);
    }
    return getActiveNotes();
  }, [notes, searchQuery]);

  // Separate pinned and unpinned
  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned);

  const handleCreateNote = useCallback(() => {
    const newNote = addNote({
      title: '',
      content: '',
      color: NoteColor.White,
      labels: [],
      isPinned: false,
      isArchived: false,
      isDeleted: false,
    });
    router.push(`/note/${newNote.id}`);
  }, [addNote, router]);

  const handleNotePress = useCallback((noteId: string) => {
    router.push(`/note/${noteId}`);
  }, [router]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  // Memoized keyExtractor
  const keyExtractor = useCallback((item: Note) => item.id, []);

  // Memoized renderItem - fixed width to prevent stretching on odd items
  const renderItem = useCallback(({ item }: { item: Note }) => (
    <View style={{ width: ITEM_WIDTH, marginBottom: 12 }}>
      <NoteCard
        note={item}
        design={getDesign(item.designId)}
        onPress={() => handleNotePress(item.id)}
        isDark={isDark}
        context="grid"
      />
    </View>
  ), [getDesign, handleNotePress, isDark]);

  const renderHeader = useCallback(() => (
    <View style={styles.headerSection}>
      {/* Pinned Section */}
      {pinnedNotes.length > 0 && (
        <View style={styles.pinnedSection}>
          <View style={styles.pinnedGrid}>
            {pinnedNotes.map((note) => (
              <View key={note.id} style={{ width: ITEM_WIDTH, marginBottom: 12 }}>
                <NoteCard
                  note={note}
                  design={getDesign(note.designId)}
                  onPress={() => handleNotePress(note.id)}
                  isDark={isDark}
                  context="grid"
                />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Others Section Header */}
      {unpinnedNotes.length > 0 && pinnedNotes.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            Recent
          </Text>
        </View>
      )}
    </View>
  ), [pinnedNotes, unpinnedNotes, getDesign, handleNotePress, isDark, colors]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: `${colors.accent}15` }]}>
        <NotePencil size={40} color={colors.textSecondary} weight="regular" />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
        No notes yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Tap the + button to create your first note
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Notes</Text>
          <TouchableOpacity
            onPress={() => setIsSearching(!isSearching)}
            style={[
              styles.searchButton,
              { backgroundColor: isSearching ? `${colors.accent}15` : 'transparent' }
            ]}
            accessibilityLabel={isSearching ? "Close search" : "Search notes"}
            accessibilityRole="button"
          >
            {isSearching ? (
              <X size={24} color={colors.accent} weight="regular" />
            ) : (
              <MagnifyingGlass size={24} color={colors.textSecondary} weight="regular" />
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar - Apple Style */}
        {isSearching && (
          <View
            style={[
              styles.searchBar,
              { backgroundColor: isDark ? 'rgba(118, 118, 128, 0.24)' : 'rgba(118, 118, 128, 0.12)' }
            ]}
          >
            <MagnifyingGlass size={17} color={colors.textTertiary} weight="regular" />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search"
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              accessibilityLabel="Search notes"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <XCircle size={17} color={colors.textTertiary} weight="fill" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Note Grid */}
      {filteredNotes.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={unpinnedNotes}
          keyExtractor={keyExtractor}
          numColumns={2}
          contentContainerStyle={{ padding: GRID_PADDING }}
          columnWrapperStyle={{ gap: GRID_GAP }}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={renderItem}
          // Performance optimizations
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          windowSize={5}
          initialNumToRender={8}
          // Improve scroll performance
          getItemLayout={(_, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * Math.floor(index / 2),
            index,
          })}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={handleCreateNote}
        style={[
          styles.fab,
          {
            backgroundColor: colors.accent,
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 8,
          }
        ]}
        accessibilityLabel="Create new note"
        accessibilityRole="button"
      >
        <Plus size={28} color="#FFFFFF" weight="bold" />
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
  },
  searchButton: {
    padding: 8,
    borderRadius: 9999,
  },
  searchBar: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 36,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 17,
    height: 36,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  // Header section styles
  headerSection: {
    marginBottom: 16,
  },
  pinnedSection: {
    marginBottom: 24,
  },
  pinnedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
