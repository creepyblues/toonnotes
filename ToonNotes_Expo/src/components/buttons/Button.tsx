/**
 * Button Component
 *
 * iOS HIG-compliant button with multiple variants and sizes.
 * Follows the Frame & Canvas architecture - always uses system styling.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/src/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  /** Button label text */
  label: string;
  /** Press handler */
  onPress: () => void;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state - shows spinner */
  loading?: boolean;
  /** Optional icon to render before label */
  icon?: React.ReactNode;
  /** Full width button */
  fullWidth?: boolean;
  /** Custom style overrides */
  style?: ViewStyle;
}

const SIZE_STYLES: Record<ButtonSize, { height: number; paddingHorizontal: number; fontSize: number; borderRadius: number }> = {
  sm: { height: 36, paddingHorizontal: 16, fontSize: 14, borderRadius: 18 },
  md: { height: 44, paddingHorizontal: 20, fontSize: 16, borderRadius: 22 },
  lg: { height: 52, paddingHorizontal: 24, fontSize: 17, borderRadius: 26 },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
}: ButtonProps) {
  const { colors, semantic } = useTheme();

  const sizeStyle = SIZE_STYLES[size];

  // Determine colors based on variant
  const getVariantStyles = (): { bg: string; text: string; border?: string } => {
    switch (variant) {
      case 'primary':
        return {
          bg: colors.accent,
          text: '#FFFFFF',
        };
      case 'secondary':
        return {
          bg: colors.backgroundSecondary,
          text: colors.textPrimary,
        };
      case 'ghost':
        return {
          bg: 'transparent',
          text: colors.accent,
        };
      case 'destructive':
        return {
          bg: semantic.error,
          text: '#FFFFFF',
        };
      default:
        return {
          bg: colors.accent,
          text: '#FFFFFF',
        };
    }
  };

  const variantStyles = getVariantStyles();

  const containerStyle: ViewStyle = {
    height: sizeStyle.height,
    paddingHorizontal: sizeStyle.paddingHorizontal,
    borderRadius: sizeStyle.borderRadius,
    backgroundColor: variantStyles.bg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled || loading ? 0.5 : 1,
    ...(fullWidth && { width: '100%' }),
    ...(variant === 'ghost' && {
      backgroundColor: 'transparent',
    }),
  };

  const textStyle: TextStyle = {
    fontSize: sizeStyle.fontSize,
    fontWeight: '600',
    color: variantStyles.text,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[containerStyle, style]}
    >
      {loading ? (
        <ActivityIndicator
          color={variantStyles.text}
          size={size === 'sm' ? 'small' : 'small'}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[textStyle, icon ? styles.labelWithIcon : undefined]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  labelWithIcon: {
    marginLeft: 8,
  },
});
