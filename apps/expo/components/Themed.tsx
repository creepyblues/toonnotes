/**
 * Theme-aware Text and View components
 *
 * These components automatically adapt to the current color scheme
 * using the ToonNotes design token system.
 */

import { Text as DefaultText, View as DefaultView } from 'react-native';

import { useTheme } from '@/src/theme';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

/**
 * Hook to get theme-aware color
 * @param props - Optional light/dark color overrides
 * @param colorKey - Key from theme colors ('textPrimary', 'backgroundPrimary', etc.)
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorKey: 'textPrimary' | 'backgroundPrimary' | 'accent' | 'textSecondary'
) {
  const { isDark, colors } = useTheme();
  const colorFromProps = isDark ? props.dark : props.light;

  if (colorFromProps) {
    return colorFromProps;
  }

  return colors[colorKey];
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'textPrimary');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'backgroundPrimary'
  );

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}
