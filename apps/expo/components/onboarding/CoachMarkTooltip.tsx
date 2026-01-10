/**
 * Coach Mark Tooltip
 *
 * A simple, non-intrusive tooltip that appears at the bottom of the screen
 * to guide users through features. Dismisses on tap.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { X, Lightbulb } from 'phosphor-react-native';
import { useTheme } from '@/src/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// Props
// ============================================================================

interface CoachMarkTooltipProps {
  /** Title of the tooltip */
  title: string;
  /** Description text */
  description: string;
  /** Callback when dismissed */
  onDismiss: () => void;
  /** Whether the tooltip is visible */
  visible: boolean;
  /** Optional accent color */
  accentColor?: string;
}

// ============================================================================
// Component
// ============================================================================

export function CoachMarkTooltip({
  title,
  description,
  onDismiss,
  visible,
  accentColor = '#4C9C9B',
}: CoachMarkTooltipProps) {
  const { isDark, colors } = useTheme();
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide up and fade in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide down and fade out
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#292524' : '#FFFFFF',
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      {/* Accent bar */}
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: `${accentColor}15` }]}>
        <Lightbulb size={20} color={accentColor} weight="fill" />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[styles.title, { color: isDark ? '#FAFAF9' : '#1C1917' }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          style={[styles.description, { color: isDark ? '#A8A29E' : '#57534E' }]}
          numberOfLines={2}
        >
          {description}
        </Text>
      </View>

      {/* Dismiss button */}
      <TouchableOpacity
        style={styles.dismissButton}
        onPress={onDismiss}
        accessibilityLabel="Dismiss tip"
        accessibilityRole="button"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <X size={18} color={isDark ? '#78716C' : '#A8A29E'} weight="bold" />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100, // Above tab bar
    left: 16,
    right: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'Inter_600SemiBold',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Inter_400Regular',
  },
  dismissButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CoachMarkTooltip;
