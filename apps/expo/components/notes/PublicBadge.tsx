/**
 * PublicBadge - Visual indicator for shared notes
 *
 * Shows a green "Public" pill with globe icon on notes that have been shared.
 * Tapping opens the native share sheet with the share URL.
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Share, Platform } from 'react-native';
import { Globe } from 'phosphor-react-native';
import { ShareStatus } from '@/services/shareService';
import { Analytics } from '@/services/firebaseAnalytics';

interface PublicBadgeProps {
  shareStatus: ShareStatus;
  isDark?: boolean;
}

export function PublicBadge({ shareStatus, isDark = false }: PublicBadgeProps) {
  const handlePress = async () => {
    // Track analytics event
    Analytics.shareBadgeTapped(shareStatus.noteId);

    try {
      // Share content differs by platform
      // iOS: uses url field for links
      // Android: uses message field for links
      if (Platform.OS === 'ios') {
        await Share.share({
          url: shareStatus.shareUrl,
          title: 'Shared Note',
        });
      } else {
        await Share.share({
          message: shareStatus.shareUrl,
          title: 'Shared Note',
        });
      }
    } catch (error) {
      console.error('[PublicBadge] Share failed:', error);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.badge,
        { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)' },
      ]}
      accessibilityLabel="Public note - tap to share"
      accessibilityRole="button"
      accessibilityHint="Opens share sheet with the public link"
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
    >
      <Globe
        size={12}
        color={isDark ? '#4ADE80' : '#16A34A'}
        weight="bold"
      />
      <Text style={[styles.text, { color: isDark ? '#4ADE80' : '#16A34A' }]}>
        Public
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '500',
  },
});
