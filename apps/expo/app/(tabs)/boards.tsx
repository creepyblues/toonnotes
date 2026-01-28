/**
 * Boards Screen - Single column layout with note previews
 *
 * Displays all boards in a vertical scroll, one board per row.
 * Each board shows actual note content/design previews.
 * Boards are filtered by MODE type tabs.
 */

import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Tag } from 'phosphor-react-native';

import {
  useNoteStore,
  useBoardStore,
  computeBoardsFromNotes,
} from '@/stores';
import { BoardCard } from '@/components/boards/BoardCard';
import { ModeTabBar } from '@/components/boards/ModeTabBar';
import { ModeSelectSheet } from '@/components/boards/ModeSelectSheet';
import { BoardData, Mode } from '@/types';
import { ModeTabId, getModeConfig } from '@/constants/modeConfig';
import { useTheme } from '@/src/theme';
import { useBoardsTabCoachMark } from '@/hooks/useCoachMark';
import { CoachMarkTooltip } from '@/components/onboarding';

export default function BoardsScreen() {
  const router = useRouter();
  const { notes } = useNoteStore();
  const { boards: boardCustomizations, updateBoardMode } = useBoardStore();
  const { colors, isDark } = useTheme();

  // Coach mark for first visit
  const { shouldShow: showCoachMark, dismiss: dismissCoachMark } = useBoardsTabCoachMark();
  const [showTooltip, setShowTooltip] = useState(false);

  // MODE tab state
  const [selectedModeTab, setSelectedModeTab] = useState<ModeTabId>('uncategorized');

  // Mode selection sheet state
  const [modeSheetVisible, setModeSheetVisible] = useState(false);
  const [selectedBoardForMode, setSelectedBoardForMode] = useState<string | null>(null);

  // Show coach mark after a delay on first visit
  useEffect(() => {
    if (showCoachMark) {
      const timer = setTimeout(() => setShowTooltip(true), 500);
      return () => clearTimeout(timer);
    }
  }, [showCoachMark]);

  const handleDismissTooltip = () => {
    setShowTooltip(false);
    dismissCoachMark();
  };

  // Compute boards from notes (sorted by most recent activity)
  const allBoards = useMemo((): BoardData[] => {
    return computeBoardsFromNotes(notes, boardCustomizations);
  }, [notes, boardCustomizations]);

  // Get board mode by hashtag
  const getBoardMode = useCallback((hashtag: string): Mode | undefined => {
    const customization = boardCustomizations.find(
      (b) => b.hashtag.toLowerCase() === hashtag.toLowerCase()
    );
    return customization?.mode;
  }, [boardCustomizations]);

  // Calculate mode counts for tab badges
  const modeCounts = useMemo((): Record<ModeTabId, number> => {
    const counts: Record<ModeTabId, number> = {
      manage: 0,
      develop: 0,
      organize: 0,
      experience: 0,
      uncategorized: 0,
    };

    for (const board of allBoards) {
      const mode = getBoardMode(board.hashtag);
      if (mode) {
        counts[mode]++;
      } else {
        counts.uncategorized++;
      }
    }

    return counts;
  }, [allBoards, getBoardMode]);

  // Filter boards by selected mode
  const filteredBoards = useMemo((): BoardData[] => {
    return allBoards.filter((board) => {
      const boardMode = getBoardMode(board.hashtag);

      if (selectedModeTab === 'uncategorized') {
        return !boardMode;
      }
      return boardMode === selectedModeTab;
    });
  }, [allBoards, getBoardMode, selectedModeTab]);

  const handleBoardPress = useCallback((hashtag: string) => {
    router.push(`/board/${encodeURIComponent(hashtag)}`);
  }, [router]);

  const handleNotePress = useCallback((noteId: string) => {
    router.push(`/note/${noteId}`);
  }, [router]);

  const handleBoardLongPress = useCallback((hashtag: string) => {
    setSelectedBoardForMode(hashtag);
    setModeSheetVisible(true);
  }, []);

  const handleSelectMode = useCallback((mode: Mode | undefined) => {
    if (selectedBoardForMode) {
      updateBoardMode(selectedBoardForMode, mode);
    }
  }, [selectedBoardForMode, updateBoardMode]);

  const handleCloseSheet = useCallback(() => {
    setModeSheetVisible(false);
    setSelectedBoardForMode(null);
  }, []);

  // Memoized keyExtractor for FlatList
  const keyExtractor = useCallback((item: BoardData) => item.hashtag, []);

  // Memoized renderItem for FlatList
  const renderBoard = useCallback(({ item }: { item: BoardData }) => (
    <BoardCard
      board={item}
      isDark={isDark}
      onPress={() => handleBoardPress(item.hashtag)}
      onNotePress={handleNotePress}
      onLongPress={() => handleBoardLongPress(item.hashtag)}
      mode={getBoardMode(item.hashtag)}
    />
  ), [isDark, handleBoardPress, handleNotePress, handleBoardLongPress, getBoardMode]);

  const renderEmpty = () => {
    const modeConfig = getModeConfig(selectedModeTab);
    const ModeIcon = modeConfig.icon;

    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIcon, { backgroundColor: `${modeConfig.color}15` }]}>
          <ModeIcon size={40} color={modeConfig.color} weight="regular" />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
          No boards in {modeConfig.label}
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Long-press a board to assign it to this mode
        </Text>
      </View>
    );
  };

  // Get total count for header subtitle
  const totalBoardCount = allBoards.length;

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
          {totalBoardCount > 0
            ? `${totalBoardCount} ${totalBoardCount === 1 ? 'board' : 'boards'}`
            : 'Notes organized by labels'}
        </Text>
      </View>

      {/* MODE Tab Bar */}
      <ModeTabBar
        selectedMode={selectedModeTab}
        onSelectMode={setSelectedModeTab}
        modeCounts={modeCounts}
      />

      {/* Single Column Board List - Optimized with FlatList */}
      <FlatList
        data={filteredBoards}
        keyExtractor={keyExtractor}
        renderItem={renderBoard}
        contentContainerStyle={[
          styles.scrollContent,
          filteredBoards.length === 0 && styles.emptyListContent,
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

      {/* Mode Selection Sheet */}
      <ModeSelectSheet
        visible={modeSheetVisible}
        onClose={handleCloseSheet}
        currentMode={selectedBoardForMode ? getBoardMode(selectedBoardForMode) : undefined}
        onSelectMode={handleSelectMode}
        boardHashtag={selectedBoardForMode || ''}
      />

      {/* Coach Mark Tooltip */}
      <CoachMarkTooltip
        title="Your boards live here"
        description="Labels are automatically added to your notes and organize them into boards"
        visible={showTooltip}
        onDismiss={handleDismissTooltip}
        accentColor="#8B5CF6"
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
