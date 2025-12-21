/**
 * Boards Screen - Single column corkboard layout
 *
 * Displays all boards in a vertical scroll, one board per row.
 * Each board shows as a corkboard with sticky notes.
 */

import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Hash } from 'lucide-react-native';

import {
  useNoteStore,
  useUserStore,
  useBoardStore,
  computeBoardsFromNotes,
} from '@/stores';
import { BoardCard } from '@/components/boards/BoardCard';
import { BoardData } from '@/types';

export default function BoardsScreen() {
  const router = useRouter();
  const { notes, labels } = useNoteStore();
  const { boards: boardCustomizations } = useBoardStore();
  const { settings } = useUserStore();
  const isDark = settings.darkMode;

  // Compute boards from notes (sorted by most recent activity)
  const allBoards = useMemo((): BoardData[] => {
    const labelNames = labels.map((l) => l.name);
    return computeBoardsFromNotes(notes, labelNames, boardCustomizations);
  }, [notes, labels, boardCustomizations]);

  const handleBoardPress = (hashtag: string) => {
    router.push(`/board/${encodeURIComponent(hashtag)}`);
  };

  const handleNotePress = (noteId: string) => {
    router.push(`/note/${noteId}`);
  };

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View
        className="w-20 h-20 rounded-full items-center justify-center mb-4"
        style={{ backgroundColor: isDark ? '#1E1E1E' : '#F3F4F6' }}
      >
        <Hash size={40} color={isDark ? '#6B7280' : '#9CA3AF'} />
      </View>
      <Text
        className="text-xl font-semibold mb-2"
        style={{ color: isDark ? '#FFFFFF' : '#1F2937' }}
      >
        No boards yet
      </Text>
      <Text
        className="text-center px-8"
        style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
      >
        Add hashtags to your notes using # to organize them into boards
      </Text>
    </View>
  );

  // If no boards, show empty state
  if (allBoards.length === 0) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: isDark ? '#121212' : '#F5F0EB' }}
        edges={['top']}
      >
        {/* Header */}
        <View
          className="px-4 py-3 border-b"
          style={{
            backgroundColor: isDark ? '#121212' : '#F5F0EB',
            borderBottomColor: isDark ? '#2D2D2D' : '#E5DDD5',
          }}
        >
          <Text
            className="text-2xl font-bold"
            style={{ color: isDark ? '#FFFFFF' : '#1F2937' }}
          >
            Boards
          </Text>
          <Text
            className="text-sm mt-1"
            style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
          >
            Organize notes with hashtags
          </Text>
        </View>
        {renderEmpty()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: isDark ? '#121212' : '#F5F0EB' }}
      edges={['top']}
    >
      {/* Header */}
      <View
        className="px-4 py-3 border-b"
        style={{
          backgroundColor: isDark ? '#121212' : '#F5F0EB',
          borderBottomColor: isDark ? '#2D2D2D' : '#E5DDD5',
        }}
      >
        <Text
          className="text-2xl font-bold"
          style={{ color: isDark ? '#FFFFFF' : '#3D2914' }}
        >
          Boards
        </Text>
        <Text
          className="text-sm mt-1"
          style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
        >
          {allBoards.length} {allBoards.length === 1 ? 'board' : 'boards'}
        </Text>
      </View>

      {/* Single Column Board List */}
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
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
