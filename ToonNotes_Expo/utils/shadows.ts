/**
 * Centralized shadow styles for cross-platform consistency.
 *
 * iOS uses shadow* properties, Android uses elevation.
 * These presets are calibrated to look similar on both platforms.
 */

import { ViewStyle } from 'react-native';

export type ShadowLevel = 'none' | 'subtle' | 'medium' | 'prominent' | 'elevated';

interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export const SHADOWS: Record<ShadowLevel, ShadowStyle> = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  prominent: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
};

/**
 * Get shadow style for a given level.
 * Can be spread directly into a style object.
 *
 * @example
 * <View style={[styles.card, getShadow('medium')]} />
 */
export function getShadow(level: ShadowLevel): ShadowStyle {
  return SHADOWS[level];
}

/**
 * Create a custom shadow with specific color.
 * Useful for colored shadows on cards.
 */
export function getColoredShadow(
  level: ShadowLevel,
  color: string,
  opacity?: number
): ShadowStyle {
  const baseShadow = SHADOWS[level];
  return {
    ...baseShadow,
    shadowColor: color,
    shadowOpacity: opacity ?? baseShadow.shadowOpacity,
  };
}
