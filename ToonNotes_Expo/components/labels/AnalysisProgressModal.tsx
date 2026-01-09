/**
 * AnalysisProgressModal - Engaging progress indicator during note analysis
 *
 * Shows a beautiful modal with pulsing icon and rotating messages
 * while AI analyzes note content for label suggestions.
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Sparkle } from 'phosphor-react-native';
import { useTheme } from '@/src/theme';

const ANIMATION_DURATION_MS = 200;
const MESSAGE_ROTATION_MS = 1500;
const MESSAGE_CROSSFADE_MS = 150;

const MESSAGES = [
  { title: 'Analyzing your notes...', subtitle: 'Looking for patterns' },
  { title: 'Finding topics & themes...', subtitle: 'Understanding your content' },
  { title: 'Detecting mood...', subtitle: 'Getting the vibe right' },
  { title: 'Matching labels...', subtitle: 'Almost there!' },
];

export function AnalysisProgressModal() {
  const { isDark } = useTheme();

  // Entrance animation values
  const [scale] = useState(new Animated.Value(0.9));
  const [opacity] = useState(new Animated.Value(0));

  // Icon pulse animation
  const [iconScale] = useState(new Animated.Value(1));
  const iconAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Message rotation
  const [messageIndex, setMessageIndex] = useState(0);
  const [textOpacity] = useState(new Animated.Value(1));

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: ANIMATION_DURATION_MS,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: ANIMATION_DURATION_MS,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Icon pulse loop
  useEffect(() => {
    iconAnimationRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(iconScale, {
          toValue: 1.15,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(iconScale, {
          toValue: 1.0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    iconAnimationRef.current.start();

    return () => {
      iconAnimationRef.current?.stop();
    };
  }, []);

  // Message rotation with crossfade
  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: MESSAGE_CROSSFADE_MS,
        useNativeDriver: true,
      }).start(() => {
        // Update message index
        setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
        // Fade in
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: MESSAGE_CROSSFADE_MS,
          useNativeDriver: true,
        }).start();
      });
    }, MESSAGE_ROTATION_MS);

    return () => clearInterval(interval);
  }, []);

  const currentMessage = MESSAGES[messageIndex];

  return (
    <View
      style={styles.overlay}
      accessibilityLabel="Analyzing note content"
      accessibilityRole="progressbar"
      accessibilityHint="Please wait while we find relevant labels for your note"
      accessible={true}
    >
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: isDark ? '#292524' : '#FFFFFF',
            transform: [{ scale }],
            opacity,
            shadowColor: '#000000',
          },
        ]}
      >
        {/* Pulsing icon */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: isDark ? '#367272' : '#C2E4E3' },
          ]}
        >
          <Animated.View style={{ transform: [{ scale: iconScale }] }}>
            <Sparkle
              size={32}
              color={isDark ? '#70BFBD' : '#4C9C9B'}
              weight="fill"
            />
          </Animated.View>
        </View>

        {/* Rotating messages */}
        <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
          <Text
            style={[
              styles.title,
              { color: isDark ? '#70BFBD' : '#4C9C9B' },
            ]}
          >
            {currentMessage.title}
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: isDark ? '#A8A29E' : '#78716C' },
            ]}
          >
            {currentMessage.subtitle}
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  container: {
    width: 280,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default AnalysisProgressModal;
