import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, CheckCircle, Info, Warning, X } from 'phosphor-react-native';

import { useNudgeStore } from '@/stores/nudgeStore';
import { useTheme } from '@/src/theme';
import type { Nudge } from '@/types';

// Toast state
interface ToastState {
  visible: boolean;
  nudge: Nudge | null;
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
      </View>
      {!isRead && (
        <View style={[styles.unreadDot, { backgroundColor: colors.accent }]} />
      )}
    </TouchableOpacity>
  );
}

function Toast({
  toast,
  colors,
  onDismiss,
}: {
  toast: ToastState;
  colors: ReturnType<typeof useTheme>['colors'];
  onDismiss: () => void;
}) {
  if (!toast.visible || !toast.nudge) return null;

  return (
    <View style={[styles.toastContainer, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={[styles.toastAccent, { backgroundColor: colors.accent }]} />
      <View style={styles.toastContent}>
        <Text style={[styles.toastTitle, { color: colors.textPrimary }]}>
          {toast.nudge.title}
        </Text>
        <Text style={[styles.toastBody, { color: colors.textSecondary }]}>
          {toast.nudge.body}
        </Text>
        {toast.nudge.options && toast.nudge.options.length > 0 && (
          <View style={styles.toastOptions}>
            {toast.nudge.options.map((opt, i) => (
              <Text key={i} style={[styles.toastOption, { color: colors.accent }]}>
                • {opt.label}
              </Text>
            ))}
          </View>
        )}
      </View>
      <TouchableOpacity onPress={onDismiss} style={styles.toastDismiss}>
        <X size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

function getTimeAgo(timestamp: number): string {
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
  const { queue, history, markAsShown } = useNudgeStore();
  const [toast, setToast] = useState<ToastState>({ visible: false, nudge: null });

  // Combine queue and history, sorted by creation time (newest first)
  const allNotifications = useMemo(() => {
    const combined = [...queue, ...history];
    combined.sort((a, b) => b.createdAt - a.createdAt);
    return combined;
  }, [queue, history]);

  const handleNotificationPress = useCallback(
    (nudge: Nudge) => {
      if (!nudge.shownAt) {
        markAsShown(nudge.id);
      }
      setToast({ visible: true, nudge });

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setToast((prev) => (prev.nudge?.id === nudge.id ? { visible: false, nudge: null } : prev));
      }, 5000);
    },
    [markAsShown]
  );

  const dismissToast = useCallback(() => {
    setToast({ visible: false, nudge: null });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Nudge }) => (
      <NotificationItem nudge={item} colors={colors} onPress={handleNotificationPress} />
    ),
    [colors, handleNotificationPress]
  );

  const keyExtractor = useCallback((item: Nudge) => item.id, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundPrimary }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.separator }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Notifications
        </Text>
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
        <FlatList
          data={allNotifications}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Toast toast={toast} colors={colors} onDismiss={dismissToast} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 20,
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
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
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
  // Toast styles
  toastContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  toastAccent: {
    width: 4,
  },
  toastContent: {
    flex: 1,
    padding: 14,
  },
  toastTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  toastBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  toastOptions: {
    marginTop: 8,
  },
  toastOption: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  toastDismiss: {
    padding: 14,
    alignSelf: 'flex-start',
  },
});
