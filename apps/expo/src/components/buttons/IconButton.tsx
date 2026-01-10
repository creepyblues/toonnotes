/**
 * IconButton Component
 *
 * A circular button containing only an icon.
 * Used for toolbar actions, close buttons, etc.
 */

import React from 'react';
import {
  TouchableOpacity,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/src/theme';

export type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps {
  /** Icon element to render */
  icon: React.ReactNode;
  /** Press handler */
  onPress: () => void;
  /** Visual variant */
  variant?: IconButtonVariant;
  /** Size preset */
  size?: IconButtonSize;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Accessibility label */
  accessibilityLabel: string;
  /** Custom style overrides */
  style?: ViewStyle;
}

const SIZE_MAP: Record<IconButtonSize, number> = {
  sm: 32,
  md: 40,
  lg: 48,
};

export function IconButton({
  icon,
  onPress,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  loading = false,
  accessibilityLabel,
  style,
}: IconButtonProps) {
  const { colors, semantic } = useTheme();

  const buttonSize = SIZE_MAP[size];

  const getVariantStyles = (): { bg: string; iconColor: string } => {
    switch (variant) {
      case 'primary':
        return {
          bg: colors.accent,
          iconColor: '#FFFFFF',
        };
      case 'secondary':
        return {
          bg: colors.backgroundSecondary,
          iconColor: colors.textPrimary,
        };
      case 'ghost':
        return {
          bg: 'transparent',
          iconColor: colors.textSecondary,
        };
      case 'destructive':
        return {
          bg: semantic.error,
          iconColor: '#FFFFFF',
        };
      default:
        return {
          bg: 'transparent',
          iconColor: colors.textSecondary,
        };
    }
  };

  const variantStyles = getVariantStyles();

  const containerStyle: ViewStyle = {
    width: buttonSize,
    height: buttonSize,
    borderRadius: buttonSize / 2,
    backgroundColor: variantStyles.bg,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled || loading ? 0.5 : 1,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={[containerStyle, style]}
    >
      {loading ? (
        <ActivityIndicator
          color={variantStyles.iconColor}
          size="small"
        />
      ) : (
        icon
      )}
    </TouchableOpacity>
  );
}
