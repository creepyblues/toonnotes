/**
 * AccentLayer - Decorative overlay for themed notes
 *
 * Renders themed decorations like sparkles, flowers, speed lines, etc.
 * Positioned based on theme configuration.
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import { AccentType } from '@/types';

interface AccentLayerProps {
  accentType: AccentType;
  color?: string;
  positions: ('corners' | 'edges' | 'scattered' | 'around_sticker')[];
  animated?: boolean;
  containerStyle?: ViewStyle;
}

export function AccentLayer({
  accentType,
  color = '#FFD700',
  positions,
  animated = false,
  containerStyle,
}: AccentLayerProps) {
  if (accentType === 'none') return null;

  return (
    <View style={[styles.container, containerStyle]} pointerEvents="none">
      {positions.includes('corners') && (
        <CornersAccent type={accentType} color={color} animated={animated} />
      )}
      {positions.includes('scattered') && (
        <ScatteredAccent type={accentType} color={color} animated={animated} />
      )}
      {positions.includes('edges') && (
        <EdgesAccent type={accentType} color={color} animated={animated} />
      )}
    </View>
  );
}

// ============================================
// Corner Accents
// ============================================

interface AccentProps {
  type: AccentType;
  color: string;
  animated: boolean;
}

function CornersAccent({ type, color, animated }: AccentProps) {
  const renderCornerElement = (position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight') => {
    const positionStyle = getCornerPosition(position);

    switch (type) {
      case 'sparkles':
        return <Sparkle key={position} style={positionStyle} color={color} animated={animated} size={20} />;
      case 'flowers':
        return <Flower key={position} style={positionStyle} color={color} animated={animated} size={24} />;
      case 'hearts':
        return <Heart key={position} style={positionStyle} color={color} animated={animated} size={18} />;
      case 'clouds':
        return <Cloud key={position} style={positionStyle} color={color} size={30} />;
      case 'retro_shapes':
        return <RetroShape key={position} style={positionStyle} color={color} size={16} />;
      case 'impact_stars':
        return <ImpactStar key={position} style={positionStyle} color={color} animated={animated} size={22} />;
      default:
        return null;
    }
  };

  return (
    <>
      {renderCornerElement('topLeft')}
      {renderCornerElement('topRight')}
      {renderCornerElement('bottomLeft')}
      {renderCornerElement('bottomRight')}
    </>
  );
}

// ============================================
// Scattered Accents
// ============================================

function ScatteredAccent({ type, color, animated }: AccentProps) {
  // Fixed scatter positions for consistency
  const scatterPositions: Array<{
    top: DimensionValue;
    left?: DimensionValue;
    right?: DimensionValue;
    size: number;
  }> = [
    { top: '15%', left: '10%', size: 12 },
    { top: '25%', right: '15%', size: 10 },
    { top: '60%', left: '20%', size: 8 },
    { top: '70%', right: '25%', size: 14 },
    { top: '40%', left: '5%', size: 10 },
  ];

  return (
    <>
      {scatterPositions.map((pos, index) => {
        const style: ViewStyle = {
          position: 'absolute',
          top: pos.top,
          left: pos.left,
          right: pos.right,
          opacity: 0.6,
        };

        switch (type) {
          case 'sparkles':
            return <Sparkle key={index} style={style} color={color} animated={animated} size={pos.size} />;
          case 'flowers':
            return <Flower key={index} style={style} color={color} animated={animated} size={pos.size + 4} />;
          case 'hearts':
            return <Heart key={index} style={style} color={color} animated={animated} size={pos.size} />;
          default:
            return null;
        }
      })}
    </>
  );
}

// ============================================
// Edge Accents
// ============================================

function EdgesAccent({ type, color, animated }: AccentProps) {
  if (type !== 'speed_lines') return null;

  return (
    <>
      {/* Top edge speed lines */}
      <View style={[styles.speedLineContainer, { top: 0 }]}>
        {[...Array(5)].map((_, i) => (
          <View
            key={`top-${i}`}
            style={[
              styles.speedLine,
              {
                backgroundColor: color,
                width: 20 + i * 10,
                height: 2,
                marginLeft: i * 15,
                opacity: 0.3 - i * 0.05,
              },
            ]}
          />
        ))}
      </View>
      {/* Bottom edge speed lines */}
      <View style={[styles.speedLineContainer, { bottom: 0, transform: [{ rotate: '180deg' }] }]}>
        {[...Array(5)].map((_, i) => (
          <View
            key={`bottom-${i}`}
            style={[
              styles.speedLine,
              {
                backgroundColor: color,
                width: 20 + i * 10,
                height: 2,
                marginLeft: i * 15,
                opacity: 0.3 - i * 0.05,
              },
            ]}
          />
        ))}
      </View>
    </>
  );
}

// ============================================
// Accent Element Components
// ============================================

interface ElementProps {
  style?: ViewStyle;
  color: string;
  size: number;
  animated?: boolean;
}

function Sparkle({ style, color, size, animated }: ElementProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animated, pulseAnim]);

  // Four-point star sparkle
  return (
    <Animated.View
      style={[
        style,
        { transform: [{ scale: animated ? pulseAnim : 1 }] },
      ]}
    >
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        {/* Horizontal line */}
        <View
          style={{
            position: 'absolute',
            width: size,
            height: size * 0.15,
            backgroundColor: color,
            borderRadius: size * 0.075,
          }}
        />
        {/* Vertical line */}
        <View
          style={{
            position: 'absolute',
            width: size * 0.15,
            height: size,
            backgroundColor: color,
            borderRadius: size * 0.075,
          }}
        />
        {/* Center dot */}
        <View
          style={{
            width: size * 0.3,
            height: size * 0.3,
            backgroundColor: color,
            borderRadius: size * 0.15,
          }}
        />
      </View>
    </Animated.View>
  );
}

function Flower({ style, color, size, animated }: ElementProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [animated, rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        style,
        { transform: [{ rotate: animated ? rotation : '0deg' }] },
      ]}
    >
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        {/* Petals */}
        {[0, 72, 144, 216, 288].map((angle) => (
          <View
            key={angle}
            style={{
              position: 'absolute',
              width: size * 0.35,
              height: size * 0.6,
              backgroundColor: color,
              borderRadius: size * 0.2,
              transform: [{ rotate: `${angle}deg` }, { translateY: -size * 0.15 }],
              opacity: 0.8,
            }}
          />
        ))}
        {/* Center */}
        <View
          style={{
            width: size * 0.25,
            height: size * 0.25,
            backgroundColor: '#FFD700',
            borderRadius: size * 0.125,
          }}
        />
      </View>
    </Animated.View>
  );
}

function Heart({ style, color, size, animated }: ElementProps) {
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animated, bounceAnim]);

  return (
    <Animated.View
      style={[
        style,
        { transform: [{ scale: animated ? bounceAnim : 1 }] },
      ]}
    >
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        {/* Simple heart shape using two circles and a rotated square */}
        <View style={{ flexDirection: 'row', transform: [{ translateY: -size * 0.15 }] }}>
          <View
            style={{
              width: size * 0.5,
              height: size * 0.5,
              backgroundColor: color,
              borderRadius: size * 0.25,
              marginRight: -size * 0.1,
            }}
          />
          <View
            style={{
              width: size * 0.5,
              height: size * 0.5,
              backgroundColor: color,
              borderRadius: size * 0.25,
              marginLeft: -size * 0.1,
            }}
          />
        </View>
        <View
          style={{
            position: 'absolute',
            width: size * 0.55,
            height: size * 0.55,
            backgroundColor: color,
            transform: [{ rotate: '45deg' }, { translateY: size * 0.05 }],
            borderRadius: size * 0.05,
          }}
        />
      </View>
    </Animated.View>
  );
}

function Cloud({ style, color, size }: ElementProps) {
  return (
    <View style={[style, { opacity: 0.4 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
        <View
          style={{
            width: size * 0.4,
            height: size * 0.4,
            backgroundColor: color,
            borderRadius: size * 0.2,
          }}
        />
        <View
          style={{
            width: size * 0.5,
            height: size * 0.5,
            backgroundColor: color,
            borderRadius: size * 0.25,
            marginLeft: -size * 0.15,
          }}
        />
        <View
          style={{
            width: size * 0.35,
            height: size * 0.35,
            backgroundColor: color,
            borderRadius: size * 0.175,
            marginLeft: -size * 0.1,
          }}
        />
      </View>
    </View>
  );
}

function RetroShape({ style, color, size }: ElementProps) {
  // Simple geometric shapes for vintage theme
  return (
    <View style={style}>
      <View
        style={{
          width: size,
          height: size,
          borderWidth: 2,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

function ImpactStar({ style, color, size, animated }: ElementProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.4,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animated, pulseAnim]);

  // 6-point impact star
  return (
    <Animated.View
      style={[
        style,
        { transform: [{ scale: animated ? pulseAnim : 1 }] },
      ]}
    >
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        {[0, 60, 120].map((angle) => (
          <View
            key={angle}
            style={{
              position: 'absolute',
              width: size * 0.2,
              height: size,
              backgroundColor: color,
              borderRadius: size * 0.1,
              transform: [{ rotate: `${angle}deg` }],
            }}
          />
        ))}
      </View>
    </Animated.View>
  );
}

// ============================================
// Helper Functions
// ============================================

function getCornerPosition(position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'): ViewStyle {
  const offset = 8;
  switch (position) {
    case 'topLeft':
      return { position: 'absolute', top: offset, left: offset };
    case 'topRight':
      return { position: 'absolute', top: offset, right: offset };
    case 'bottomLeft':
      return { position: 'absolute', bottom: offset, left: offset };
    case 'bottomRight':
      return { position: 'absolute', bottom: offset, right: offset };
  }
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  speedLineContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  speedLine: {
    position: 'absolute',
  },
});

export default AccentLayer;
