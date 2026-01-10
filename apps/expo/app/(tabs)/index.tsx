import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, MagnifyingGlass, X, PushPin, XCircle } from 'phosphor-react-native';

import { useNoteStore, useUserStore, useDesignStore } from '@/stores';
import { NoteCard } from '@/components/notes/NoteCard';
import { Note, NoteColor } from '@/types';
import { useTheme } from '@/src/theme';
import { LogoPreview } from '@/components/settings/LogoPreview';

// Calculate item dimensions for consistent 2-column grid
const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_PADDING = 12;
const GRID_GAP = 10;
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
    <View style={{ width: ITEM_WIDTH, marginBottom: 10 }}>
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
    <View className="mb-4">
      {/* Pinned Section */}
      {pinnedNotes.length > 0 && (
        <View className="mb-6">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP }}>
            {pinnedNotes.map((note) => (
              <View key={note.id} style={{ width: ITEM_WIDTH, marginBottom: 10 }}>
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
        <View className="flex-row items-center mb-3 px-1">
          <Text className="text-xs uppercase tracking-wider font-medium" style={{ color: colors.textSecondary }}>
            Recent
          </Text>
        </View>
      )}
    </View>
  ), [pinnedNotes, unpinnedNotes, getDesign, handleNotePress, isDark, colors]);

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: `${colors.accent}15`,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Text className="text-4xl">📝</Text>
      </View>
      <Text
        className="text-xl font-semibold mb-2"
        style={{ color: colors.textPrimary }}
      >
        No notes yet
      </Text>
      <Text
        className="text-center px-8"
        style={{ color: colors.textSecondary }}
      >
        Tap the + button to create your first note
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.backgroundSecondary }}
      edges={['top']}
    >
      {/* Header */}
      <View
        className="px-4 py-3"
        style={{ backgroundColor: colors.backgroundSecondary }}
      >
        <View className="flex-row items-center justify-between">
          <LogoPreview
            colorScheme="toonRainbow"
            font="nunito"
            size="large"
            showLabel={false}
            showBackground={false}
          />
          <TouchableOpacity
            onPress={() => setIsSearching(!isSearching)}
            className="p-2 rounded-full"
            style={{
              backgroundColor: isSearching ? `${colors.accent}15` : 'transparent'
            }}
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
            className="mt-3 flex-row items-center rounded-xl px-3"
            style={{
              backgroundColor: isDark ? 'rgba(118, 118, 128, 0.24)' : 'rgba(118, 118, 128, 0.12)',
              height: 36,
            }}
          >
            <MagnifyingGlass size={17} color={colors.textTertiary} weight="regular" />
            <TextInput
              className="flex-1 ml-2"
              style={{
                color: colors.textPrimary,
                fontSize: 17,
                height: 36,
              }}
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
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full items-center justify-center"
        style={{
          backgroundColor: colors.accent,
          shadowColor: colors.accent,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 12,
          elevation: 8,
        }}
        accessibilityLabel="Create new note"
        accessibilityRole="button"
      >
        <Plus size={28} color="#FFFFFF" weight="bold" />
      </TouchableOpacity>

    </SafeAreaView>
  );
}
