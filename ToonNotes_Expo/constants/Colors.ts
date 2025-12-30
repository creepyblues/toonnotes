/**
 * @deprecated This file is deprecated. Use the new design token system instead:
 *
 * import { useTheme } from '@/src/theme';
 *
 * const { colors, semantic, tagColors } = useTheme();
 *
 * The new system provides:
 * - iOS HIG compliant colors (SystemColors, DarkModeColors)
 * - Automatic dark mode switching
 * - Semantic colors (success, warning, error, info)
 * - Tag colors with proper light/dark variants
 *
 * This file is kept for backward compatibility only.
 */

// ToonNotes Design System Colors (Superlist-inspired) - LEGACY
const primaryPurple = '#8B5CF6';
const primaryPurpleLight = '#A78BFA';

export default {
  light: {
    text: '#1A1625',
    textSecondary: '#6B6B7B',
    background: '#FAFAFF',
    surface: '#FFFFFF',
    surfaceElevated: '#F5F3FF',
    tint: primaryPurple,
    tabIconDefault: '#9CA3AF',
    tabIconSelected: primaryPurple,
    border: '#EDE9FE',
  },
  dark: {
    text: '#F5F3FF',
    textSecondary: '#A8A8B8',
    background: '#0F0D15',
    surface: '#1C1826',
    surfaceElevated: '#252136',
    tint: primaryPurpleLight,
    tabIconDefault: '#6B6B7B',
    tabIconSelected: primaryPurpleLight,
    border: '#252136',
  },
  // Brand colors
  primary: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },
  accent: {
    coral: '#FF6B6B',
    pink: '#FF8ED4',
    mint: '#6EE7B7',
    amber: '#FBBF24',
  },
};
