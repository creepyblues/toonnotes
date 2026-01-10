// ToonNotes Icon Component
// Unified wrapper for Phosphor Icons with consistent sizing and active state handling

import React from 'react';
import * as Phosphor from 'phosphor-react-native';
import { SystemColors } from '../theme/tokens/colors';

export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';

// All available Phosphor icon names we use in the app
export type IconName =
  // Tab Bar
  | 'NotePencil'
  | 'SquaresFour'
  | 'Sparkle'
  | 'Gear'
  // Navigation
  | 'CaretLeft'
  | 'CaretRight'
  | 'X'
  | 'DotsThreeVertical'
  | 'MagnifyingGlass'
  // Actions
  | 'Plus'
  | 'PushPin'
  | 'Trash'
  | 'Archive'
  | 'ShareNetwork'
  | 'PencilSimple'
  | 'Check'
  | 'ArrowClockwise'
  // Features
  | 'PaintBrush'
  | 'MagicWand'
  | 'Image'
  | 'ImageSquare'
  // Settings
  | 'Coin'
  | 'Key'
  | 'Moon'
  | 'Sun'
  | 'Info'
  // Content
  | 'Hash'
  | 'FileText'
  // Board Icons
  | 'Square'
  | 'Star'
  | 'Heart'
  | 'Book'
  | 'Lightbulb'
  | 'Folder'
  | 'Tag'
  | 'BookmarkSimple'
  | 'Fire'
  | 'MusicNotes'
  | 'Code'
  | 'Camera'
  | 'Gift'
  | 'Trophy'
  | 'Palette'
  | 'Lightning'
  | 'Leaf'
  | 'GameController'
  | 'Warning'
  | 'CheckCircle'
  | 'Shuffle';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  weight?: IconWeight;
  isActive?: boolean;
}

export const IconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  xxl: 48,
};

export function Icon({
  name,
  size = IconSizes.md,
  color,
  weight = 'regular',
  isActive = false,
}: IconProps) {
  const IconComponent = Phosphor[name] as React.ComponentType<{
    size: number;
    color: string;
    weight: IconWeight;
  }>;

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in Phosphor`);
    return null;
  }

  // Determine color and weight based on active state
  const resolvedColor = color ?? (isActive ? SystemColors.accent : SystemColors.textSecondary);
  const resolvedWeight = isActive ? 'fill' : weight;

  return (
    <IconComponent
      size={size}
      color={resolvedColor}
      weight={resolvedWeight}
    />
  );
}

// Board icon options for user selection
export const BoardIcons: IconName[] = [
  'Square',
  'Hash',
  'Star',
  'Heart',
  'Book',
  'Lightbulb',
  'Folder',
  'Tag',
  'BookmarkSimple',
  'Fire',
  'MusicNotes',
  'Code',
  'Camera',
  'Gift',
  'Trophy',
  'Palette',
  'Sparkle',
  'Lightning',
  'Leaf',
  'GameController',
];
