/**
 * BackgroundLayer - Reusable component for rendering note backgrounds
 *
 * Handles solid colors, gradients, images, and patterns with proper opacity
 * and context-aware rendering (backgrounds only shown in detail/share views).
 */

import React from 'react';
import { View, ImageBackground, StyleSheet, ViewStyle, Image } from 'react-native';
import { ComposedStyle, DesignViewContext } from '@/types';
import { PATTERN_ASSETS } from '@/constants/patterns';

// Note: LinearGradient removed due to compatibility issues
// Gradients can be added back when expo-linear-gradient is properly configured

interface BackgroundLayerProps {
  style: ComposedStyle;
  context: DesignViewContext;
  children: React.ReactNode;
  containerStyle?: ViewStyle;
}

/**
 * Renders a layered background with support for:
 * - Solid color backgrounds
 * - Gradient backgrounds
 * - Image backgrounds (blurred for readability)
 * - Pattern overlays (tiled)
 */
export function BackgroundLayer({
  style,
  context,
  children,
  containerStyle,
}: BackgroundLayerProps) {
  const hasBackgroundImage = style.showBackground && style.backgroundImageUri;
  const hasPattern = style.showBackground && style.backgroundPattern;

  // Base container style with background color
  const baseStyle: ViewStyle = {
    flex: 1,
    backgroundColor: style.backgroundColor,
  };

  // If no special background, just render with solid color
  if (!hasBackgroundImage && !hasPattern) {
    return (
      <View style={[baseStyle, containerStyle]}>
        {children}
      </View>
    );
  }

  // Render with background image (blurred for subtle effect)
  if (hasBackgroundImage) {
    return (
      <View style={[baseStyle, containerStyle]}>
        {/* Background image - absolutely positioned to fill entire container */}
        <Image
          source={{ uri: style.backgroundImageUri }}
          style={[StyleSheet.absoluteFill, { opacity: style.backgroundOpacity }]}
          resizeMode="cover"
          blurRadius={3}
        />
        {/* Children render on top of the image */}
        {children}
      </View>
    );
  }

  // Render with pattern background
  if (hasPattern) {
    const patternAsset = PATTERN_ASSETS[style.backgroundPattern!.assetName];

    return (
      <View style={[baseStyle, containerStyle]}>
        {/* Pattern layer - use ImageBackground for better tiling support */}
        {patternAsset && (
          <ImageBackground
            source={patternAsset}
            style={StyleSheet.absoluteFill}
            imageStyle={{
              opacity: style.backgroundOpacity,
              resizeMode: 'repeat',
              tintColor: style.patternTintColor, // Apply color tint
            }}
            resizeMode="repeat"
          />
        )}
        {children}
      </View>
    );
  }

  // Fallback (shouldn't reach here)
  return (
    <View style={[baseStyle, containerStyle]}>
      {children}
    </View>
  );
}

export default BackgroundLayer;
