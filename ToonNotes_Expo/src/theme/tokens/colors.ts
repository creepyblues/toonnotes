// ToonNotes Design Tokens - Colors
// Following iOS HIG with custom brand accent

export const SystemColors = {
  // Backgrounds
  backgroundPrimary: '#FFFFFF',
  backgroundSecondary: '#F2F2F7',      // iOS grouped background
  backgroundTertiary: '#FFFFFF',

  // Surfaces
  surfaceElevated: '#FFFFFF',
  surfaceCard: '#FFFFFF',

  // Text
  textPrimary: '#000000',
  textSecondary: '#8E8E93',            // iOS secondary label
  textTertiary: '#C7C7CC',
  textInverse: '#FFFFFF',

  // Borders & Separators
  separator: 'rgba(60, 60, 67, 0.12)', // iOS separator
  separatorOpaque: '#C6C6C8',
  border: '#E5E5EA',

  // Brand
  accent: '#7C3AED',                   // Primary purple
  accentLight: '#A78BFA',
  accentDark: '#5B21B6',

  // Interactive States
  buttonPrimary: '#7C3AED',
  buttonPrimaryPressed: '#5B21B6',
  buttonSecondary: '#F2F2F7',
  buttonSecondaryPressed: '#E5E5EA',
  buttonDestructive: '#FF3B30',

  // Overlays
  overlayLight: 'rgba(255, 255, 255, 0.8)',
  overlayDark: 'rgba(0, 0, 0, 0.4)',
};

export const DarkModeColors = {
  // Backgrounds
  backgroundPrimary: '#000000',
  backgroundSecondary: '#1C1C1E',
  backgroundTertiary: '#2C2C2E',

  // Surfaces
  surfaceElevated: '#1C1C1E',
  surfaceCard: '#1C1C1E',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#48484A',
  textInverse: '#000000',

  // Borders & Separators
  separator: 'rgba(84, 84, 88, 0.65)',
  separatorOpaque: '#38383A',
  border: '#38383A',

  // Brand
  accent: '#A78BFA',
  accentLight: '#C4B5FD',
  accentDark: '#7C3AED',

  // Interactive States
  buttonPrimary: '#A78BFA',
  buttonPrimaryPressed: '#7C3AED',
  buttonSecondary: '#2C2C2E',
  buttonSecondaryPressed: '#3A3A3C',
  buttonDestructive: '#FF453A',

  // Overlays
  overlayLight: 'rgba(255, 255, 255, 0.1)',
  overlayDark: 'rgba(0, 0, 0, 0.6)',
};

export const SemanticColors = {
  success: '#34C759',
  successDark: '#30D158',
  warning: '#FF9500',
  warningDark: '#FF9F0A',
  error: '#FF3B30',
  errorDark: '#FF453A',
  info: '#007AFF',
  infoDark: '#0A84FF',
};

// Tag accent colors (for hashtags)
// Each tag color has a background and text color
export const TagColors = {
  purple: { background: 'rgba(124, 58, 237, 0.15)', text: '#7C3AED' },
  blue: { background: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6' },
  green: { background: 'rgba(16, 185, 129, 0.15)', text: '#10B981' },
  orange: { background: 'rgba(249, 115, 22, 0.15)', text: '#F97316' },
  pink: { background: 'rgba(236, 72, 153, 0.15)', text: '#EC4899' },
  teal: { background: 'rgba(20, 184, 166, 0.15)', text: '#14B8A6' },
};

export const TagColorsDark = {
  purple: { background: 'rgba(167, 139, 250, 0.2)', text: '#A78BFA' },
  blue: { background: 'rgba(96, 165, 250, 0.2)', text: '#60A5FA' },
  green: { background: 'rgba(52, 211, 153, 0.2)', text: '#34D399' },
  orange: { background: 'rgba(251, 146, 60, 0.2)', text: '#FB923C' },
  pink: { background: 'rgba(244, 114, 182, 0.2)', text: '#F472B6' },
  teal: { background: 'rgba(45, 212, 191, 0.2)', text: '#2DD4BF' },
};

export type TagColorKey = keyof typeof TagColors;
export type ColorScheme = typeof SystemColors;
