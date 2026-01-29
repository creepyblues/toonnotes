/**
 * ModeTabBar - Framed tab bar for MODE type filtering
 *
 * All tabs shown as framed rectangles (like browser tabs).
 * Active tab: filled tinted background, bold label.
 * Inactive tabs: outlined frame with muted text/icon.
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
  const { colors } = useTheme();

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
                isSelected
                  ? {
                      backgroundColor: config.color + '1F',
                      borderColor: config.color + '60',
                    }
                  : {
                      backgroundColor: 'transparent',
                      borderColor: colors.textTertiary + '40',
                    },
              ]}
              accessibilityLabel={`${config.label} tab, ${count} boards`}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
            >
              <IconComponent
                size={16}
                weight={isSelected ? 'fill' : 'regular'}
                color={isSelected ? config.color : colors.textTertiary}
              />
              <Text
                style={[
                  styles.label,
                  {
                    color: isSelected ? config.color : colors.textTertiary,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {isSelected ? config.label : config.shortLabel}
              </Text>
              {count > 0 && (
                <Text
                  style={[
                    styles.count,
                    {
                      color: isSelected ? config.color : colors.textTertiary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {count}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 6,
    alignItems: 'center',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  label: {
    fontSize: 13,
  },
  count: {
    fontSize: 12,
  },
});

export default ModeTabBar;
