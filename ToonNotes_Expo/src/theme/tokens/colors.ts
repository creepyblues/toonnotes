// ToonNotes Design Tokens - Colors
// Primary: Hanok Teal (#4C9C9B)
// Highlight: Sunrise Coral (#FF6B6B)
// Neutrals: Warm Gray

// =============================================================================
// COLOR SCALES
// =============================================================================

/** Primary brand color scale - Hanok Teal */
export const TealScale = {
  50: '#E6F4F4',   // very light, backgrounds
  100: '#C2E4E3',  // light accents
  200: '#99D1D0',  // hover states
  300: '#70BFBD',  // secondary elements
  400: '#5CACAB',  // medium tone
  500: '#4C9C9B',  // MAIN - buttons, links, active states
  600: '#428888',  // pressed states
  700: '#367272',  // dark accents
  800: '#2A5B5A',  // headings on light bg
  900: '#1E4544',  // darkest, text
} as const;

/** Highlight/CTA color scale - Sunrise Coral */
export const CoralScale = {
  50: '#FFF0F0',   // very light, backgrounds
  100: '#FFD6D6',  // light accents
  200: '#FFB3B3',  // hover states
  300: '#FF9090',  // secondary highlights
  400: '#FF7D7D',  // medium tone
  500: '#FF6B6B',  // MAIN - CTA, highlights
  600: '#E55A5A',  // pressed states
  700: '#CC4A4A',  // dark accents
  800: '#B33A3A',  // text on light bg
  900: '#992A2A',  // darkest
} as const;

/** Neutral color scale - Warm Gray */
export const NeutralScale = {
  50: '#FAFAF9',   // backgrounds
  100: '#F5F5F4',  // secondary bg
  200: '#E7E5E4',  // borders, dividers
  300: '#D6D3D1',  // disabled states
  400: '#A8A29E',  // placeholder text
  500: '#78716C',  // secondary text
  600: '#57534E',  // body text dark mode
  700: '#44403C',  // dark surfaces
  800: '#292524',  // dark bg secondary
  900: '#1C1917',  // dark bg primary
} as const;

// =============================================================================
// SYSTEM COLORS - LIGHT MODE
// =============================================================================

export const SystemColors = {
  // Backgrounds
  backgroundPrimary: '#FFFFFF',
  backgroundSecondary: NeutralScale[50],
  backgroundTertiary: NeutralScale[100],

  // Surfaces
  surfaceElevated: '#FFFFFF',
  surfaceCard: '#FFFFFF',

  // Text
  textPrimary: NeutralScale[900],
  textSecondary: NeutralScale[500],
  textTertiary: NeutralScale[400],
  textInverse: '#FFFFFF',

  // Borders & Separators
  separator: 'rgba(28, 25, 23, 0.08)',  // neutral-900 @ 8%
  separatorOpaque: NeutralScale[300],
  border: NeutralScale[200],

  // Brand - Primary (Teal)
  accent: TealScale[500],
  accentLight: TealScale[300],
  accentDark: TealScale[700],

  // Brand - Highlight (Coral)
  highlight: CoralScale[500],
  highlightLight: CoralScale[300],
  highlightPressed: CoralScale[600],

  // Interactive States
  buttonPrimary: TealScale[500],
  buttonPrimaryPressed: TealScale[700],
  buttonSecondary: NeutralScale[100],
  buttonSecondaryPressed: NeutralScale[200],
  buttonDestructive: CoralScale[500],
  buttonDestructivePressed: CoralScale[600],

  // Overlays
  overlayLight: 'rgba(255, 255, 255, 0.8)',
  overlayDark: 'rgba(0, 0, 0, 0.4)',
};

// =============================================================================
// SYSTEM COLORS - DARK MODE
// =============================================================================

export const DarkModeColors = {
  // Backgrounds
  backgroundPrimary: NeutralScale[900],
  backgroundSecondary: NeutralScale[800],
  backgroundTertiary: NeutralScale[700],

  // Surfaces
  surfaceElevated: NeutralScale[800],
  surfaceCard: NeutralScale[800],

  // Text
  textPrimary: NeutralScale[50],
  textSecondary: NeutralScale[400],
  textTertiary: NeutralScale[500],
  textInverse: NeutralScale[900],

  // Borders & Separators
  separator: 'rgba(250, 250, 249, 0.1)',  // neutral-50 @ 10%
  separatorOpaque: NeutralScale[600],
  border: NeutralScale[600],

  // Brand - Primary (Teal) - lighter for dark bg
  accent: TealScale[300],
  accentLight: TealScale[200],
  accentDark: TealScale[500],

  // Brand - Highlight (Coral) - lighter for dark bg
  highlight: CoralScale[300],
  highlightLight: CoralScale[200],
  highlightPressed: CoralScale[500],

  // Interactive States
  buttonPrimary: TealScale[300],
  buttonPrimaryPressed: TealScale[500],
  buttonSecondary: NeutralScale[700],
  buttonSecondaryPressed: NeutralScale[600],
  buttonDestructive: CoralScale[300],
  buttonDestructivePressed: CoralScale[500],

  // Overlays
  overlayLight: 'rgba(255, 255, 255, 0.1)',
  overlayDark: 'rgba(0, 0, 0, 0.6)',
};

// =============================================================================
// SEMANTIC COLORS
// =============================================================================

export const SemanticColors = {
  // Success - Green
  success: '#22C55E',
  successDark: '#4ADE80',

  // Warning - Amber
  warning: '#F59E0B',
  warningDark: '#FBBF24',

  // Error - Coral (unified with highlight)
  error: CoralScale[500],
  errorDark: CoralScale[300],

  // Info - Teal (unified with primary)
  info: TealScale[500],
  infoDark: TealScale[300],
};

// =============================================================================
// TAG COLORS (for hashtags/labels)
// =============================================================================

export const TagColors = {
  teal: { background: 'rgba(76, 156, 155, 0.15)', text: TealScale[500] },
  coral: { background: 'rgba(255, 107, 107, 0.15)', text: CoralScale[500] },
  amber: { background: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B' },
  green: { background: 'rgba(34, 197, 94, 0.15)', text: '#22C55E' },
  blue: { background: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6' },
  purple: { background: 'rgba(139, 92, 246, 0.15)', text: '#8B5CF6' },
  // Legacy aliases for backwards compatibility
  orange: { background: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B' },
  pink: { background: 'rgba(255, 107, 107, 0.15)', text: CoralScale[500] },
};

export const TagColorsDark = {
  teal: { background: 'rgba(112, 191, 189, 0.2)', text: TealScale[300] },
  coral: { background: 'rgba(255, 144, 144, 0.2)', text: CoralScale[300] },
  amber: { background: 'rgba(251, 191, 36, 0.2)', text: '#FBBF24' },
  green: { background: 'rgba(74, 222, 128, 0.2)', text: '#4ADE80' },
  blue: { background: 'rgba(96, 165, 250, 0.2)', text: '#60A5FA' },
  purple: { background: 'rgba(167, 139, 250, 0.2)', text: '#A78BFA' },
  // Legacy aliases for backwards compatibility
  orange: { background: 'rgba(251, 191, 36, 0.2)', text: '#FBBF24' },
  pink: { background: 'rgba(255, 144, 144, 0.2)', text: CoralScale[300] },
};

// =============================================================================
// NOTE BACKGROUND COLORS
// =============================================================================

export const NoteColors = {
  white: '#FFFFFF',
  cream: NeutralScale[50],       // warm white
  mint: TealScale[50],           // teal-50
  peach: CoralScale[50],         // coral-50
  lavender: '#EDE9FE',           // purple, creative/dreamy
  sky: '#E0F2FE',                // light blue, open/spacious
  lemon: '#FEF9C3',              // amber-100, energetic/attention
  blush: '#FCE7F3',              // pink-100, soft/personal
};

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type TagColorKey = keyof typeof TagColors;
export type NoteColorKey = keyof typeof NoteColors;
export type ColorScheme = typeof SystemColors;
