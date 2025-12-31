/**
 * Boards Screen - Single column layout with note previews
 *
 * Displays all boards in a vertical scroll, one board per row.
 * Each board shows actual note content/design previews.
 */

import React, { useMemo, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Hash } from 'phosphor-react-native';

import {
  useNoteStore,
  useBoardStore,
  computeBoardsFromNotes,
} from '@/stores';
import { BoardCard } from '@/components/boards/BoardCard';
import { BoardData } from '@/types';
import { useTheme } from '@/src/theme';

export default function BoardsScreen() {
  const router = useRouter();
  const { notes } = useNoteStore();
  const { boards: boardCustomizations } = useBoardStore();
  const { colors, isDark } = useTheme();

  // Compute boards from notes (sorted by most recent activity)
  const allBoards = useMemo((): BoardData[] => {
    return computeBoardsFromNotes(notes, boardCustomizations);
  }, [notes, boardCustomizations]);

  const handleBoardPress = useCallback((hashtag: string) => {
    router.push(`/board/${encodeURIComponent(hashtag)}`);
  }, [router]);

  const handleNotePress = useCallback((noteId: string) => {
    router.push(`/note/${noteId}`);
  }, [router]);

  // Memoized keyExtractor for FlatList
  const keyExtractor = useCallback((item: BoardData) => item.hashtag, []);

  // Memoized renderItem for FlatList
  const renderBoard = useCallback(({ item }: { item: BoardData }) => (
    <BoardCard
      board={item}
      isDark={isDark}
      onPress={() => handleBoardPress(item.hashtag)}
      onNotePress={handleNotePress}
    />
  ), [isDark, handleBoardPress, handleNotePress]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: `${colors.accent}15` }]}>
        <Hash size={40} color={colors.textSecondary} weight="regular" />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
        No boards yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Add hashtags to your notes using # to organize them into boards
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.backgroundSecondary }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Boards
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {allBoards.length > 0
            ? `${allBoards.length} ${allBoards.length === 1 ? 'board' : 'boards'}`
            : 'Organize notes with hashtags'}
        </Text>
      </View>

      {/* Single Column Board List - Optimized with FlatList */}
      <FlatList
        data={allBoards}
        keyExtractor={keyExtractor}
        renderItem={renderBoard}
        contentContainerStyle={[
          styles.scrollContent,
          allBoards.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        windowSize={5}
        initialNumToRender={4}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  emptyListContent: {
    flex: 1,
  },
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
