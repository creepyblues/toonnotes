import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { NotePencil, SquaresFour, Sparkle, Gear } from 'phosphor-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/src/theme';
import type { IconWeight } from '@/src/components/Icon';

// Tab icon component with iOS-style active states
function TabIcon({
  Icon,
  color,
  focused,
}: {
  Icon: typeof NotePencil;
  color: string;
  focused: boolean;
}) {
  const weight: IconWeight = focused ? 'fill' : 'regular';

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={24} color={color} weight={weight} />
    </View>
  );
}

export default function TabLayout() {
  const { isDark, colors } = useTheme();
  const insets = useSafeAreaInsets();

  // Calculate tab bar height dynamically based on safe area
  const tabBarPaddingBottom = Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + tabBarPaddingBottom;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.backgroundPrimary,
          borderTopWidth: 0.5,
          borderTopColor: colors.separator,
          height: tabBarHeight,
          paddingTop: 8,
          paddingBottom: tabBarPaddingBottom,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 4,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={NotePencil} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="boards"
        options={{
          title: 'Boards',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={SquaresFour} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="designs"
        options={{
          title: 'Designs',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Sparkle} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Gear} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
