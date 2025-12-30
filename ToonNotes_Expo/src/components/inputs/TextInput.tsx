/**
 * TextInput Component
 *
 * iOS HIG-compliant text input with various styles.
 * Supports labels, placeholders, error states, and icons.
 */

import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  TouchableOpacity,
  TextInputProps as RNTextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Eye, EyeSlash, X, MagnifyingGlass } from 'phosphor-react-native';
import { useTheme } from '@/src/theme';

export type TextInputVariant = 'default' | 'filled' | 'outline';
export type TextInputSize = 'sm' | 'md' | 'lg';

interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  /** Optional label above input */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Helper text below input */
  helperText?: string;
  /** Visual variant */
  variant?: TextInputVariant;
  /** Size preset */
  size?: TextInputSize;
  /** Left icon element */
  leftIcon?: React.ReactNode;
  /** Show search icon on left */
  isSearch?: boolean;
  /** Show clear button when has value */
  showClear?: boolean;
  /** Called when clear button pressed */
  onClear?: () => void;
  /** For password fields - shows toggle */
  isPassword?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Container style overrides */
  containerStyle?: ViewStyle;
}

const SIZE_STYLES: Record<TextInputSize, {
  height: number;
  fontSize: number;
  paddingHorizontal: number;
  borderRadius: number;
  labelSize: number;
}> = {
  sm: { height: 36, fontSize: 14, paddingHorizontal: 12, borderRadius: 8, labelSize: 12 },
  md: { height: 44, fontSize: 16, paddingHorizontal: 14, borderRadius: 10, labelSize: 13 },
  lg: { height: 52, fontSize: 17, paddingHorizontal: 16, borderRadius: 12, labelSize: 14 },
};

export const TextInput = forwardRef<RNTextInput, TextInputProps>(({
  label,
  error,
  helperText,
  variant = 'filled',
  size = 'md',
  leftIcon,
  isSearch = false,
  showClear = false,
  onClear,
  isPassword = false,
  disabled = false,
  containerStyle,
  value,
  onChangeText,
  ...props
}, ref) => {
  const { colors, semantic } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const sizeStyle = SIZE_STYLES[size];
  const hasError = !!error;
  const hasValue = !!value && value.length > 0;

  // Determine background and border colors based on variant and state
  const getInputStyles = (): { backgroundColor: string; borderColor: string; borderWidth: number } => {
    const baseBorder = hasError ? semantic.error : (isFocused ? colors.accent : colors.border);

    switch (variant) {
      case 'filled':
        return {
          backgroundColor: colors.backgroundSecondary,
          borderColor: hasError ? semantic.error : 'transparent',
          borderWidth: hasError ? 1 : 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: baseBorder,
          borderWidth: 1,
        };
      case 'default':
      default:
        return {
          backgroundColor: colors.backgroundPrimary,
          borderColor: baseBorder,
          borderWidth: 1,
        };
    }
  };

  const inputStyles = getInputStyles();

  const containerViewStyle: ViewStyle = {
    opacity: disabled ? 0.5 : 1,
  };

  const inputContainerStyle: ViewStyle = {
    height: sizeStyle.height,
    borderRadius: sizeStyle.borderRadius,
    backgroundColor: inputStyles.backgroundColor,
    borderWidth: inputStyles.borderWidth,
    borderColor: inputStyles.borderColor,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sizeStyle.paddingHorizontal,
  };

  const textInputStyle: TextStyle = {
    flex: 1,
    fontSize: sizeStyle.fontSize,
    color: colors.textPrimary,
    paddingVertical: 0,
  };

  const labelStyle: TextStyle = {
    fontSize: sizeStyle.labelSize,
    fontWeight: '500',
    color: hasError ? semantic.error : colors.textSecondary,
    marginBottom: 6,
  };

  const helperStyle: TextStyle = {
    fontSize: 12,
    color: hasError ? semantic.error : colors.textSecondary,
    marginTop: 4,
  };

  const iconColor = isFocused ? colors.accent : colors.textSecondary;

  return (
    <View style={[containerViewStyle, containerStyle]}>
      {label && <Text style={labelStyle}>{label}</Text>}

      <View style={inputContainerStyle}>
        {/* Left icon */}
        {isSearch && (
          <MagnifyingGlass
            size={20}
            color={iconColor}
            weight="regular"
            style={{ marginRight: 8 }}
          />
        )}
        {leftIcon && !isSearch && (
          <View style={{ marginRight: 8 }}>{leftIcon}</View>
        )}

        {/* Text Input */}
        <RNTextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          style={textInputStyle}
          placeholderTextColor={colors.textTertiary}
          editable={!disabled}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {/* Clear button */}
        {showClear && hasValue && !disabled && (
          <TouchableOpacity
            onPress={() => {
              onChangeText?.('');
              onClear?.();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ marginLeft: 8 }}
          >
            <X size={18} color={colors.textSecondary} weight="regular" />
          </TouchableOpacity>
        )}

        {/* Password toggle */}
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ marginLeft: 8 }}
          >
            {showPassword ? (
              <EyeSlash size={20} color={colors.textSecondary} weight="regular" />
            ) : (
              <Eye size={20} color={colors.textSecondary} weight="regular" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Helper/Error text */}
      {(helperText || error) && (
        <Text style={helperStyle}>{error || helperText}</Text>
      )}
    </View>
  );
});

TextInput.displayName = 'TextInput';
