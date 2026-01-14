import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme';

export interface SettingsSectionProps {
  /** Section title (displayed as uppercase header) */
  title: string;
  /** Child rows to render inside the section card */
  children: React.ReactNode;
  /** Hide the section title */
  hideTitle?: boolean;
  /** Additional margin top (defaults to 24) */
  marginTop?: number;
}

export function SettingsSection({
  title,
  children,
  hideTitle = false,
  marginTop = 24,
}: SettingsSectionProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { marginTop }]}>
      {!hideTitle && (
        <Text style={[styles.header, { color: colors.textSecondary }]}>
          {title}
        </Text>
      )}
      <View style={[styles.card, { backgroundColor: colors.surfaceCard }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // marginTop set dynamically via props
  },
  header: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
});
