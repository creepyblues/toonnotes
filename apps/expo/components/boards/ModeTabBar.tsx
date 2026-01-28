/**
 * ModeTabBar - Horizontal scrollable tab bar for MODE type filtering
 *
 * Features:
 * - Pill-style tabs with icon + label
 * - Active tab highlighted with mode color background
 * - Badge showing board count per tab
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MODE_TAB_CONFIGS, ModeTabId } from '@/constants/modeConfig';
import { useTheme } from '@/src/theme';

interface ModeTabBarProps {
  selectedMode: ModeTabId;
  onSelectMode: (mode: ModeTabId) => void;
  modeCounts: Record<ModeTabId, number>;
}

export function ModeTabBar({
  selectedMode,
  onSelectMode,
  modeCounts,
}: ModeTabBarProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {MODE_TAB_CONFIGS.map((config) => {
          const isSelected = selectedMode === config.id;
          const count = modeCounts[config.id] || 0;
          const IconComponent = config.icon;

          return (
            <TouchableOpacity
              key={config.id}
              onPress={() => onSelectMode(config.id)}
              activeOpacity={0.7}
              style={[
                styles.tab,
                isSelected && { backgroundColor: config.color },
                !isSelected && {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.05)',
                },
              ]}
              accessibilityLabel={`${config.label} tab, ${count} boards`}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
            >
              <IconComponent
                size={16}
                weight={isSelected ? 'fill' : 'regular'}
                color={
                  isSelected
                    ? getContrastColor(config.color)
                    : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isSelected
                      ? getContrastColor(config.color)
                      : colors.textSecondary,
                  },
                ]}
              >
                {config.label}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: isSelected
                        ? 'rgba(255,255,255,0.3)'
                        : isDark
                          ? 'rgba(255,255,255,0.15)'
                          : 'rgba(0,0,0,0.1)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color: isSelected
                          ? getContrastColor(config.color)
                          : colors.textSecondary,
                      },
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

/**
 * Determine if white or black text has better contrast against a background color
 */
function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Parse RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate luminance using sRGB formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light backgrounds, white for dark
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default ModeTabBar;
