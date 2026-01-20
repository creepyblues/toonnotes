/**
 * UsefulnessIndicator - MODE Framework v2.0
 *
 * Visual indicator showing how "useful" a note is based on its mode.
 * Each mode has different criteria for usefulness:
 *
 * MANAGE: ⚪ Captured → 🟡 Scheduled → 🟢 Ready → ✅ Complete
 * DEVELOP: 💭 Spark → 🌱 Explored → 🌳 Developed → 🚀 Ready
 * ORGANIZE: 🗂️ Filed → 📖 Accessed → ⭐ Valuable → 🏆 Essential
 * EXPERIENCE: ✏️ Logged → 📝 Detailed → 🔗 Connected → 💎 Memory
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/theme';
import { Mode, NoteBehavior, ManageData, DevelopData, OrganizeData, ExperienceData } from '@/types';

// ============================================
// Types
// ============================================

interface UsefulnessIndicatorProps {
  behavior: NoteBehavior;
  /** Compact mode shows just the emoji */
  compact?: boolean;
  /** Show progress bar */
  showProgress?: boolean;
  /** Callback when tapped */
  onPress?: () => void;
}

interface UsefulnessLevel {
  emoji: string;
  label: string;
  color: string;
  progress: number; // 0-100
}

// ============================================
// Mode-specific Usefulness Calculations
// ============================================

function getManageLevel(data: ManageData): UsefulnessLevel {
  if (data.completedAt) {
    return { emoji: '✅', label: 'Complete', color: '#10B981', progress: 100 };
  }

  let score = 0;
  if (data.hasDeadline) score += 1;
  if (data.hasPriority) score += 1;
  if (data.hasSubtasks) score += 1;

  if (score >= 3) {
    return { emoji: '🟢', label: 'Ready', color: '#22C55E', progress: 75 };
  }
  if (score >= 1) {
    return { emoji: '🟡', label: 'Scheduled', color: '#EAB308', progress: 50 };
  }
  return { emoji: '⚪', label: 'Captured', color: '#9CA3AF', progress: 25 };
}

function getDevelopLevel(data: DevelopData): UsefulnessLevel {
  switch (data.maturityLevel) {
    case 'ready':
      return { emoji: '🚀', label: 'Ready', color: '#8B5CF6', progress: 100 };
    case 'developed':
      return { emoji: '🌳', label: 'Developed', color: '#22C55E', progress: 75 };
    case 'explored':
      return { emoji: '🌱', label: 'Explored', color: '#84CC16', progress: 50 };
    default:
      return { emoji: '💭', label: 'Spark', color: '#F59E0B', progress: 25 };
  }
}

function getOrganizeLevel(data: OrganizeData): UsefulnessLevel {
  const usageCount = data.usageCount ?? 0;

  if (usageCount >= 5) {
    return { emoji: '🏆', label: 'Essential', color: '#F59E0B', progress: 100 };
  }
  if (usageCount >= 3) {
    return { emoji: '⭐', label: 'Valuable', color: '#EAB308', progress: 75 };
  }
  if (usageCount >= 1) {
    return { emoji: '📖', label: 'Accessed', color: '#3B82F6', progress: 50 };
  }
  return { emoji: '🗂️', label: 'Filed', color: '#9CA3AF', progress: 25 };
}

function getExperienceLevel(data: ExperienceData): UsefulnessLevel {
  let score = 0;
  if (data.hasMedia) score += 1;
  if (data.hasLocation) score += 1;
  if (data.peopleTagged && data.peopleTagged.length > 0) score += 1;
  if (data.sentiment) score += 1;

  if (score >= 4) {
    return { emoji: '💎', label: 'Memory', color: '#8B5CF6', progress: 100 };
  }
  if (score >= 2) {
    return { emoji: '🔗', label: 'Connected', color: '#EC4899', progress: 75 };
  }
  if (score >= 1) {
    return { emoji: '📝', label: 'Detailed', color: '#3B82F6', progress: 50 };
  }
  return { emoji: '✏️', label: 'Logged', color: '#9CA3AF', progress: 25 };
}

function getUsefulnessLevel(behavior: NoteBehavior): UsefulnessLevel {
  switch (behavior.mode) {
    case 'manage':
      return getManageLevel(behavior.modeData as ManageData);
    case 'develop':
      return getDevelopLevel(behavior.modeData as DevelopData);
    case 'organize':
      return getOrganizeLevel(behavior.modeData as OrganizeData);
    case 'experience':
      return getExperienceLevel(behavior.modeData as ExperienceData);
    default:
      return { emoji: '📝', label: 'Note', color: '#9CA3AF', progress: 0 };
  }
}

// ============================================
// Component
// ============================================

export function UsefulnessIndicator({
  behavior,
  compact = false,
  showProgress = false,
  onPress,
}: UsefulnessIndicatorProps) {
  const { colors, isDark } = useTheme();
  const level = getUsefulnessLevel(behavior);

  const content = (
    <View style={styles.container}>
      {/* Emoji indicator */}
      <Text style={styles.emoji}>{level.emoji}</Text>

      {/* Label (if not compact) */}
      {!compact && (
        <Text style={[styles.label, { color: level.color }]}>
          {level.label}
        </Text>
      )}

      {/* Progress bar (optional) */}
      {showProgress && (
        <View style={[styles.progressContainer, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}>
          <View
            style={[
              styles.progressBar,
              { width: `${level.progress}%`, backgroundColor: level.color },
            ]}
          />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        accessibilityLabel={`Usefulness: ${level.label}`}
        accessibilityRole="button"
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

// ============================================
// Compact Badge Variant
// ============================================

interface UsefulnessBadgeProps {
  behavior: NoteBehavior;
  size?: 'small' | 'medium';
}

export function UsefulnessBadge({ behavior, size = 'small' }: UsefulnessBadgeProps) {
  const level = getUsefulnessLevel(behavior);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: level.color + '20',
          paddingHorizontal: size === 'small' ? 6 : 8,
          paddingVertical: size === 'small' ? 2 : 4,
        },
      ]}
      accessibilityLabel={`Usefulness: ${level.label}`}
    >
      <Text style={[styles.badgeEmoji, { fontSize: size === 'small' ? 12 : 14 }]}>
        {level.emoji}
      </Text>
      <Text
        style={[
          styles.badgeLabel,
          { color: level.color, fontSize: size === 'small' ? 10 : 12 },
        ]}
      >
        {level.label}
      </Text>
    </View>
  );
}

// ============================================
// Progress Ring Variant
// ============================================

interface UsefulnessRingProps {
  behavior: NoteBehavior;
  size?: number;
  strokeWidth?: number;
}

export function UsefulnessRing({
  behavior,
  size = 40,
  strokeWidth = 3,
}: UsefulnessRingProps) {
  const level = getUsefulnessLevel(behavior);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (level.progress / 100) * circumference;

  return (
    <View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      accessibilityLabel={`Usefulness: ${level.progress}%`}
    >
      {/* Background circle */}
      <View
        style={[
          styles.ringBackground,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: level.color + '30',
          },
        ]}
      />

      {/* Progress arc (simplified - full implementation would use SVG) */}
      <View
        style={[
          styles.ringProgress,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: level.color,
            borderTopColor: 'transparent',
            borderRightColor: level.progress >= 50 ? level.color : 'transparent',
            borderBottomColor: level.progress >= 75 ? level.color : 'transparent',
            transform: [{ rotate: '-45deg' }],
          },
        ]}
      />

      {/* Center emoji */}
      <Text style={[styles.ringEmoji, { fontSize: size * 0.4 }]}>{level.emoji}</Text>
    </View>
  );
}

// ============================================
// Mode Icon
// ============================================

interface ModeIconProps {
  mode: Mode;
  size?: number;
}

export function ModeIcon({ mode, size = 20 }: ModeIconProps) {
  const icons: Record<Mode, string> = {
    manage: '🎯',
    develop: '💡',
    organize: '📚',
    experience: '📔',
  };

  return (
    <Text style={{ fontSize: size }} accessibilityLabel={`Mode: ${mode}`}>
      {icons[mode]}
    </Text>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emoji: {
    fontSize: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    height: 4,
    borderRadius: 2,
    width: 40,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
  },
  badgeEmoji: {
    // Size set dynamically
  },
  badgeLabel: {
    fontWeight: '600',
  },
  ringBackground: {
    position: 'absolute',
  },
  ringProgress: {
    position: 'absolute',
  },
  ringEmoji: {
    position: 'absolute',
  },
});

// ============================================
// Exports
// ============================================

export { getUsefulnessLevel };
export type { UsefulnessLevel };
