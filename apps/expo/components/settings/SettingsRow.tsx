import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { CaretRight } from 'phosphor-react-native';
import { useTheme } from '@/src/theme';

export interface SettingsRowProps {
  /** Icon element to display (e.g., <User size={20} weight="regular" />) */
  icon: React.ReactNode;
  /** Color for the icon */
  iconColor: string;
  /** Background color for icon container (defaults to iconColor at 15% opacity) */
  iconBackgroundColor?: string;
  /** Primary label text */
  label: string;
  /** Secondary subtitle text (appears below label) */
  subtitle?: string;
  /** Value to display on the right side */
  value?: string | number;
  /** Color for the value text */
  valueColor?: string;
  /** Badge to display (appears after label, right-aligned) */
  badge?: { text: string; color: string };
  /** Accessory type: chevron, switch, none, or custom element */
  accessory?: 'chevron' | 'switch' | 'none' | React.ReactNode;
  /** Switch value (when accessory='switch') */
  switchValue?: boolean;
  /** Switch change handler (when accessory='switch') */
  onSwitchChange?: (value: boolean) => void;
  /** Press handler (makes row tappable) */
  onPress?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state (shows spinner instead of accessory) */
  isLoading?: boolean;
  /** Show separator line at bottom */
  showSeparator?: boolean;
  /** Destructive action styling (uses error color for label) */
  isDestructive?: boolean;
  /** Custom left content instead of icon */
  leftContent?: React.ReactNode;
}

export function SettingsRow({
  icon,
  iconColor,
  iconBackgroundColor,
  label,
  subtitle,
  value,
  valueColor,
  badge,
  accessory = 'chevron',
  switchValue,
  onSwitchChange,
  onPress,
  disabled = false,
  isLoading = false,
  showSeparator = false,
  isDestructive = false,
  leftContent,
}: SettingsRowProps) {
  const { colors } = useTheme();

  // Determine label color
  const labelColor = isDestructive ? iconColor : colors.textPrimary;

  // Calculate icon background (default: 15% opacity of icon color)
  const computedIconBg = iconBackgroundColor || `${iconColor}26`;

  // Render content
  const content = (
    <View
      style={[
        styles.row,
        showSeparator && { borderBottomWidth: 0.5, borderBottomColor: colors.separator },
      ]}
    >
      {/* Left: Icon or custom content */}
      {leftContent ? (
        leftContent
      ) : (
        <View style={[styles.iconContainer, { backgroundColor: computedIconBg }]}>
          {icon}
        </View>
      )}

      {/* Middle: Label + Subtitle */}
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* Badge (if provided) */}
      {badge && (
        <View style={[styles.badge, { backgroundColor: badge.color }]}>
          <Text style={styles.badgeText}>{badge.text}</Text>
        </View>
      )}

      {/* Right: Value + Accessory */}
      {isLoading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <View style={styles.accessory}>
          {value !== undefined && (
            <Text style={[styles.value, { color: valueColor || colors.textSecondary }]}>
              {value}
            </Text>
          )}
          {accessory === 'chevron' && (
            <CaretRight size={16} color={colors.textTertiary} weight="regular" />
          )}
          {accessory === 'switch' && (
            <Switch
              value={switchValue}
              onValueChange={onSwitchChange}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#FFFFFF"
              disabled={disabled}
            />
          )}
          {accessory !== 'chevron' && accessory !== 'switch' && accessory !== 'none' && accessory}
        </View>
      )}
    </View>
  );

  // If onPress is provided, wrap in TouchableOpacity
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || isLoading}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44, // iOS minimum touch target
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    flex: 1,
    marginLeft: 12,
  },
  label: {
    fontSize: 17,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  badge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  accessory: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  value: {
    fontSize: 17,
    marginRight: 8,
  },
});
