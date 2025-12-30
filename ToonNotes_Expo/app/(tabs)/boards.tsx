/**
 * Boards Screen - Single column layout with note previews
 *
 * Displays all boards in a vertical scroll, one board per row.
 * Each board shows actual note content/design previews.
 */

import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
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

  const handleBoardPress = (hashtag: string) => {
    router.push(`/board/${encodeURIComponent(hashtag)}`);
  };

  const handleNotePress = (noteId: string) => {
    router.push(`/note/${noteId}`);
  };

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

  // If no boards, show empty state
  if (allBoards.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
        edges={['top']}
      >
        <View style={[styles.header, { backgroundColor: colors.backgroundSecondary }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Boards
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Organize notes with hashtags
          </Text>
        </View>
        {renderEmpty()}
      </SafeAreaView>
    );
  }

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
          {allBoards.length} {allBoards.length === 1 ? 'board' : 'boards'}
        </Text>
      </View>

      {/* Single Column Board List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {allBoards.map((board) => (
          <BoardCard
            key={board.hashtag}
            board={board}
            isDark={isDark}
            onPress={() => handleBoardPress(board.hashtag)}
            onNotePress={handleNotePress}
          />
        ))}
      </ScrollView>
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
