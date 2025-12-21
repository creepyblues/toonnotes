/**
 * HandDrawnBorder - SVG-based wavy/sketchy border
 *
 * Creates an imperfect, hand-drawn looking rectangle border
 * using SVG paths with randomized wobble at corners and midpoints.
 * Uses seeded random for consistent appearance per note.
 */

import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface HandDrawnBorderProps {
  width: number;
  height: number;
  color: string;
  strokeWidth?: number;
  seed: string; // Note ID for consistent randomness
  wobble?: number; // Max pixel deviation (default: 3)
}

// Seeded random number generator
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function createSeededRandom(seed: number) {
  let currentSeed = seed;
  return () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return (currentSeed / 233280) * 2 - 1; // Returns -1 to 1
  };
}

function generateWavyRectPath(
  width: number,
  height: number,
  seed: number,
  wobble: number = 3
): string {
  const rng = createSeededRandom(seed);
  const w = wobble;

  // Inset slightly to keep stroke within bounds
  const inset = wobble + 1;
  const innerW = width - inset * 2;
  const innerH = height - inset * 2;

  // Corner points with random offset
  const tl = { x: inset + w * rng(), y: inset + w * rng() };
  const tr = { x: inset + innerW + w * rng(), y: inset + w * rng() };
  const br = { x: inset + innerW + w * rng(), y: inset + innerH + w * rng() };
  const bl = { x: inset + w * rng(), y: inset + innerH + w * rng() };

  // Midpoints with wobble for more organic feel
  const tm = { x: inset + innerW / 2 + w * rng(), y: inset + w * rng() * 0.5 };
  const rm = { x: inset + innerW + w * rng() * 0.5, y: inset + innerH / 2 + w * rng() };
  const bm = { x: inset + innerW / 2 + w * rng(), y: inset + innerH + w * rng() * 0.5 };
  const lm = { x: inset + w * rng() * 0.5, y: inset + innerH / 2 + w * rng() };

  // Build path with quadratic curves for smooth wobble
  // Top edge: TL -> TM -> TR
  // Right edge: TR -> RM -> BR
  // Bottom edge: BR -> BM -> BL
  // Left edge: BL -> LM -> TL
  return `
    M ${tl.x} ${tl.y}
    Q ${tm.x} ${tm.y} ${tr.x} ${tr.y}
    Q ${rm.x} ${rm.y} ${br.x} ${br.y}
    Q ${bm.x} ${bm.y} ${bl.x} ${bl.y}
    Q ${lm.x} ${lm.y} ${tl.x} ${tl.y}
    Z
  `.trim();
}

export function HandDrawnBorder({
  width,
  height,
  color,
  strokeWidth = 2,
  seed,
  wobble = 3,
}: HandDrawnBorderProps) {
  const path = useMemo(() => {
    const seedNum = hashCode(seed);
    return generateWavyRectPath(width, height, seedNum, wobble);
  }, [width, height, seed, wobble]);

  return (
    <View style={[styles.container, { width, height }]} pointerEvents="none">
      <Svg width={width} height={height}>
        <Path
          d={path}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

export default HandDrawnBorder;
