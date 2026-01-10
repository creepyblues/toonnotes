import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme';

// Word-based logo color schemes
export const LOGO_COLOR_SCHEMES = {
  brandSplit: {
    name: 'Brand Split',
    description: 'Teal + Coral',
    toon: ['#4C9C9B', '#4C9C9B', '#4C9C9B', '#4C9C9B'],
    notes: ['#FF6B6B', '#FF6B6B', '#FF6B6B', '#FF6B6B', '#FF6B6B'],
  },
  reversed: {
    name: 'Reversed',
    description: 'Coral + Teal',
    toon: ['#FF6B6B', '#FF6B6B', '#FF6B6B', '#FF6B6B'],
    notes: ['#4C9C9B', '#4C9C9B', '#4C9C9B', '#4C9C9B', '#4C9C9B'],
  },
  toonRainbow: {
    name: 'Toon Rainbow',
    description: 'Colorful Toon',
    toon: ['#4C9C9B', '#FF6B6B', '#F59E0B', '#22C55E'],
    notes: ['#4C9C9B', '#4C9C9B', '#4C9C9B', '#4C9C9B', '#4C9C9B'],
  },
  toonGradient: {
    name: 'Gradient',
    description: 'Teal to Coral',
    toon: ['#4C9C9B', '#6B9A8F', '#A87E7E', '#FF6B6B'],
    notes: ['#78716C', '#78716C', '#78716C', '#78716C', '#78716C'],
  },
  monochrome: {
    name: 'Monochrome',
    description: 'All Teal',
    toon: ['#4C9C9B', '#4C9C9B', '#4C9C9B', '#4C9C9B'],
    notes: ['#70BFBD', '#70BFBD', '#70BFBD', '#70BFBD', '#70BFBD'],
  },
} as const;

// Logo font options
export const LOGO_FONTS = {
  outfit: {
    name: 'Outfit',
    description: 'Modern display',
    fontFamily: 'Outfit_700Bold',
  },
  nunito: {
    name: 'Nunito',
    description: 'Rounded friendly',
    fontFamily: 'Nunito_700Bold',
  },
  righteous: {
    name: 'Righteous',
    description: 'Retro anime',
    fontFamily: 'Righteous_400Regular',
  },
} as const;

export type LogoColorScheme = keyof typeof LOGO_COLOR_SCHEMES;
export type LogoFont = keyof typeof LOGO_FONTS;

interface LogoPreviewProps {
  colorScheme: LogoColorScheme;
  font?: LogoFont;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  showBackground?: boolean;
}

const TOON = 'Toon';
const NOTES = 'Notes';

export function LogoPreview({
  colorScheme,
  font = 'outfit',
  size = 'medium',
  showLabel = true,
  showBackground = true,
}: LogoPreviewProps) {
  const { colors, isDark } = useTheme();
  const scheme = LOGO_COLOR_SCHEMES[colorScheme];
  const fontConfig = LOGO_FONTS[font];

  const fontSize = size === 'small' ? 18 : size === 'medium' ? 24 : 32;
  const letterSpacing = size === 'small' ? -0.5 : size === 'medium' ? -1 : -1.5;

  const letterRow = (
    <View style={styles.letterRow}>
          {/* Toon */}
          {TOON.split('').map((letter, index) => (
            <Text
              key={`toon-${index}`}
              style={[
                styles.letter,
                {
                  color: scheme.toon[index],
                  fontSize,
                  fontFamily: fontConfig.fontFamily,
                  letterSpacing,
                },
              ]}
            >
              {letter}
            </Text>
          ))}
      {/* Notes */}
      {NOTES.split('').map((letter, index) => (
        <Text
          key={`notes-${index}`}
          style={[
            styles.letter,
            {
              color: scheme.notes[index],
              fontSize,
              fontFamily: fontConfig.fontFamily,
              letterSpacing,
            },
          ]}
        >
          {letter}
        </Text>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {showBackground ? (
        <View
          style={[
            styles.logoContainer,
            {
              backgroundColor: isDark ? colors.backgroundTertiary : colors.backgroundSecondary,
              paddingHorizontal: size === 'small' ? 12 : 16,
              paddingVertical: size === 'small' ? 8 : 12,
            },
          ]}
        >
          {letterRow}
        </View>
      ) : (
        letterRow
      )}
      {showLabel && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {scheme.name}
        </Text>
      )}
    </View>
  );
}

interface LogoFontPreviewProps {
  font: LogoFont;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export function LogoFontPreview({
  font,
  size = 'medium',
  showLabel = true,
}: LogoFontPreviewProps) {
  const { colors, isDark } = useTheme();
  const fontConfig = LOGO_FONTS[font];
  // Use brandSplit for font preview
  const scheme = LOGO_COLOR_SCHEMES.brandSplit;

  const fontSize = size === 'small' ? 18 : size === 'medium' ? 24 : 32;
  const letterSpacing = size === 'small' ? -0.5 : size === 'medium' ? -1 : -1.5;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.logoContainer,
          {
            backgroundColor: isDark ? colors.backgroundTertiary : colors.backgroundSecondary,
            paddingHorizontal: size === 'small' ? 12 : 16,
            paddingVertical: size === 'small' ? 8 : 12,
          },
        ]}
      >
        <View style={styles.letterRow}>
          {/* Toon */}
          {TOON.split('').map((letter, index) => (
            <Text
              key={`toon-${index}`}
              style={[
                styles.letter,
                {
                  color: scheme.toon[index],
                  fontSize,
                  fontFamily: fontConfig.fontFamily,
                  letterSpacing,
                },
              ]}
            >
              {letter}
            </Text>
          ))}
          {/* Notes */}
          {NOTES.split('').map((letter, index) => (
            <Text
              key={`notes-${index}`}
              style={[
                styles.letter,
                {
                  color: scheme.notes[index],
                  fontSize,
                  fontFamily: fontConfig.fontFamily,
                  letterSpacing,
                },
              ]}
            >
              {letter}
            </Text>
          ))}
        </View>
      </View>
      {showLabel && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {fontConfig.name}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logoContainer: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  letter: {
    fontWeight: '700',
  },
  label: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
  },
});
