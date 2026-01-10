// ToonNotes Design Tokens - Spacing
// Base unit: 4pt

export const Spacing = {
  xxxs: 2,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,

  // Semantic spacing
  cardPadding: 16,
  screenMargin: 16,
  sectionGap: 24,
  itemGap: 12,
  inlineGap: 8,

  // Grid
  gridGutter: 12,              // Gap between cards in grid
};

export type SpacingKey = keyof typeof Spacing;
