// ============================================
// Built-in Pattern Library for Note Backgrounds
// Cross-platform pattern data (no asset loading)
// ============================================

export type PatternCategory = 'dots' | 'lines' | 'paper' | 'manga' | 'artistic';

export interface Pattern {
  id: string;
  name: string;
  assetName: string;          // Asset key for loading
  category: PatternCategory;
  defaultOpacity: number;     // Suggested opacity (0-1)
  isPremium?: boolean;        // Future: premium patterns
}

// Pattern definitions
export const PATTERNS: Pattern[] = [
  // Dots
  {
    id: 'dots-small',
    name: 'Small Dots',
    assetName: 'dots-small',
    category: 'dots',
    defaultOpacity: 0.15,
  },
  {
    id: 'dots-large',
    name: 'Large Dots',
    assetName: 'dots-large',
    category: 'dots',
    defaultOpacity: 0.12,
  },

  // Lines
  {
    id: 'lines-horizontal',
    name: 'Horizontal Lines',
    assetName: 'lines-h',
    category: 'lines',
    defaultOpacity: 0.1,
  },
  {
    id: 'lines-diagonal',
    name: 'Diagonal Lines',
    assetName: 'lines-diag',
    category: 'lines',
    defaultOpacity: 0.12,
  },
  {
    id: 'diagonal-stripes',
    name: 'Diagonal Stripes',
    assetName: 'diagonal-stripes',
    category: 'lines',
    defaultOpacity: 0.15,
  },
  {
    id: 'grid',
    name: 'Grid',
    assetName: 'grid',
    category: 'lines',
    defaultOpacity: 0.08,
  },

  // Paper textures
  {
    id: 'paper-subtle',
    name: 'Subtle Paper',
    assetName: 'paper-subtle',
    category: 'paper',
    defaultOpacity: 0.2,
  },
  {
    id: 'paper-rough',
    name: 'Rough Paper',
    assetName: 'paper-rough',
    category: 'paper',
    defaultOpacity: 0.15,
  },

  // Manga/Comic
  {
    id: 'screentone-light',
    name: 'Light Screentone',
    assetName: 'screentone-light',
    category: 'manga',
    defaultOpacity: 0.1,
  },
  {
    id: 'halftone',
    name: 'Halftone',
    assetName: 'halftone',
    category: 'manga',
    defaultOpacity: 0.12,
  },

  // Artistic
  {
    id: 'watercolor-wash',
    name: 'Watercolor Wash',
    assetName: 'watercolor',
    category: 'artistic',
    defaultOpacity: 0.2,
  },
  {
    id: 'noise',
    name: 'Film Grain',
    assetName: 'noise',
    category: 'artistic',
    defaultOpacity: 0.08,
  },
];

// Helper functions
export const getPatternById = (id: string): Pattern | undefined =>
  PATTERNS.find((p) => p.id === id);

export const getPatternsByCategory = (category: PatternCategory): Pattern[] =>
  PATTERNS.filter((p) => p.category === category);

// Category display names
export const CATEGORY_LABELS: Record<PatternCategory, string> = {
  dots: 'Dots',
  lines: 'Lines',
  paper: 'Paper',
  manga: 'Manga',
  artistic: 'Artistic',
};

// All categories in display order
export const PATTERN_CATEGORIES: PatternCategory[] = [
  'dots',
  'lines',
  'paper',
  'manga',
  'artistic',
];
