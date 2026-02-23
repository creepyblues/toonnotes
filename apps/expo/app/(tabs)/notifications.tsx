import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, CaretRight } from 'phosphor-react-native';
import { useRouter } from 'expo-router';

import { useNudgeStore } from '@/stores/nudgeStore';
import { useNoteStore } from '@/stores/noteStore';
import { useTheme } from '@/src/theme';
import type { Nudge } from '@/types';

function groupNotificationsByDate(notifications: Nudge[]): { title: string; data: Nudge[] }[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
  const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;

  const today: Nudge[] = [];
  const yesterday: Nudge[] = [];
  const thisWeek: Nudge[] = [];
  const older: Nudge[] = [];

  for (const n of notifications) {
    if (n.createdAt >= todayStart) today.push(n);
    else if (n.createdAt >= yesterdayStart) yesterday.push(n);
    else if (n.createdAt >= weekStart) thisWeek.push(n);
    else older.push(n);
  }

  const sections: { title: string; data: Nudge[] }[] = [];
  if (today.length > 0) sections.push({ title: 'Today', data: today });
  if (yesterday.length > 0) sections.push({ title: 'Yesterday', data: yesterday });
  if (thisWeek.length > 0) sections.push({ title: 'This Week', data: thisWeek });
  if (older.length > 0) sections.push({ title: 'Older', data: older });
  return sections;
}

function NotificationItem({
  nudge,
  colors,
  onPress,
}: {
  nudge: Nudge;
  colors: ReturnType<typeof useTheme>['colors'];
  onPress: (nudge: Nudge) => void;
}) {
  const getNoteById = useNoteStore((s) => s.getNoteById);
  const noteTitle = nudge.noteId ? getNoteById(nudge.noteId)?.title : undefined;
  const isRead = !!nudge.shownAt;
  const timeAgo = getTimeAgo(nudge.createdAt);

  const priorityColor =
    nudge.priority === 'urgent'
      ? '#EF4444'
      : nudge.priority === 'high'
        ? '#F59E0B'
        : colors.textSecondary;

  return (
    <TouchableOpacity
      onPress={() => onPress(nudge)}
      activeOpacity={0.7}
      style={[
        styles.notificationItem,
        {
          backgroundColor: isRead
            ? colors.backgroundPrimary
            : colors.backgroundSecondary,
          borderBottomColor: colors.separator,
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: priorityColor + '18' },
        ]}
      >
        <Bell size={20} color={priorityColor} weight={isRead ? 'regular' : 'fill'} />
      </View>
      <View style={styles.contentContainer}>
        <Text
          style={[
            styles.title,
            {
              color: colors.textPrimary,
              fontWeight: isRead ? '400' : '600',
            },
          ]}
          numberOfLines={1}
        >
          {nudge.title}
        </Text>
        <Text
          style={[styles.body, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {nudge.body}
        </Text>
        <Text style={[styles.time, { color: colors.textTertiary }]}>
          {timeAgo}
        </Text>
        {noteTitle ? (
          <Text style={[styles.noteSource, { color: colors.textTertiary }]} numberOfLines={1}>
            From: {noteTitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.rightSection}>
        {!isRead && (
          <View style={[styles.unreadDot, { backgroundColor: colors.accent }]} />
        )}
        <CaretRight size={16} color={colors.textTertiary} weight="regular" />
      </View>
    </TouchableOpacity>
  );
}

export function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { queue, history, markAsShown, dismissNudge } = useNudgeStore();
  const queueRef = React.useRef(queue);
  queueRef.current = queue;

  // Combine queue and history, sorted by creation time (newest first)
  const allNotifications = useMemo(() => {
    const combined = [...queue, ...history];
    combined.sort((a, b) => b.createdAt - a.createdAt);
    return combined;
  }, [queue, history]);

  const sections = useMemo(
    () => groupNotificationsByDate(allNotifications),
    [allNotifications]
  );

  const handleNotificationPress = useCallback(
    (nudge: Nudge) => {
      // Mark as shown for queue items
      if (!nudge.shownAt && queueRef.current.some((n) => n.id === nudge.id)) {
        markAsShown(nudge.id);
      }
      // Navigate to source note if available
      if (nudge.noteId) {
        router.push(`/note/${nudge.noteId}`);
      }
    },
    [markAsShown, router]
  );

  const handleClearAll = useCallback(() => {
    // Dismiss all queue items (moves them to history with 'dismissed' outcome)
    const currentQueue = useNudgeStore.getState().queue;
    for (const nudge of currentQueue) {
      dismissNudge(nudge.id);
    }
    // Clear the history
    useNudgeStore.setState({ history: [] });
  }, [dismissNudge]);

  const renderItem = useCallback(
    ({ item }: { item: Nudge }) => (
      <NotificationItem nudge={item} colors={colors} onPress={handleNotificationPress} />
    ),
    [colors, handleNotificationPress]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string } }) => (
      <View style={[styles.sectionHeader, { backgroundColor: colors.backgroundPrimary }]}>
        <Text style={[styles.sectionHeaderText, { color: colors.textSecondary }]}>
          {section.title}
        </Text>
      </View>
    ),
    [colors]
  );

  const keyExtractor = useCallback((item: Nudge) => item.id, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundPrimary }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.separator }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Notifications
        </Text>
        {allNotifications.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} activeOpacity={0.7}>
            <Text style={[styles.clearButton, { color: colors.accent }]}>
              Clear
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {allNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Bell size={48} color={colors.textTertiary} weight="light" />
          <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
            No notifications yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
            You'll see nudges and updates here
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  clearButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    marginBottom: 2,
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
    marginTop: 4,
  },
  noteSource: {
    fontSize: 11,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    gap: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
});
