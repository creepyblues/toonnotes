// ToonNotes Theme Hook
// Provides theme-aware colors based on dark mode setting

import { useMemo } from 'react';
import { useUserStore } from '@/stores';
import {
  SystemColors,
  DarkModeColors,
  SemanticColors,
  TagColors,
  TagColorsDark,
  NoteColors,
  TealScale,
  CoralScale,
  NeutralScale,
} from './tokens/colors';
import { Typography } from './tokens/typography';
import { Spacing } from './tokens/spacing';
import { BorderRadius, Shadows } from './tokens/effects';

export function useTheme() {
  const { settings } = useUserStore();
  const isDark = settings.darkMode;

  const colors = useMemo(() => {
    return isDark ? DarkModeColors : SystemColors;
  }, [isDark]);

  const semantic = useMemo(() => {
    return {
      success: isDark ? SemanticColors.successDark : SemanticColors.success,
      warning: isDark ? SemanticColors.warningDark : SemanticColors.warning,
      error: isDark ? SemanticColors.errorDark : SemanticColors.error,
      info: isDark ? SemanticColors.infoDark : SemanticColors.info,
    };
  }, [isDark]);

  const tagColors = useMemo(() => {
    return isDark ? TagColorsDark : TagColors;
  }, [isDark]);

  return {
    isDark,
    colors,
    semantic,
    tagColors,
    noteColors: NoteColors,
    // Color scales for custom styling
    scales: {
      teal: TealScale,
      coral: CoralScale,
      neutral: NeutralScale,
    },
    typography: Typography,
    spacing: Spacing,
    borderRadius: BorderRadius,
    shadows: Shadows,
  };
}

export type Theme = ReturnType<typeof useTheme>;
