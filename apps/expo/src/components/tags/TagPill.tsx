/**
 * TagPill Component
 *
 * A pill-shaped tag for displaying hashtags.
 * Supports multiple color variants from the tag color palette.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Hash, X } from 'phosphor-react-native';
import { useTheme } from '@/src/theme';
import { TagColorKey } from '@/src/theme/tokens/colors';

export type TagPillSize = 'sm' | 'md' | 'lg';

interface TagPillProps {
  /** Tag label (without the # prefix) */
  label: string;
  /** Press handler - if provided, pill is interactive */
  onPress?: () => void;
  /** Remove handler - shows X button when provided */
  onRemove?: () => void;
  /** Color variant from tag palette */
  colorKey?: TagColorKey;
  /** Size preset */
  size?: TagPillSize;
  /** Whether to show the # prefix */
  showHash?: boolean;
  /** Custom style overrides */
  style?: ViewStyle;
}

const SIZE_STYLES: Record<TagPillSize, {
  height: number;
  paddingHorizontal: number;
  fontSize: number;
  iconSize: number;
  borderRadius: number;
}> = {
  sm: { height: 24, paddingHorizontal: 8, fontSize: 11, iconSize: 10, borderRadius: 12 },
  md: { height: 28, paddingHorizontal: 10, fontSize: 13, iconSize: 12, borderRadius: 14 },
  lg: { height: 32, paddingHorizontal: 12, fontSize: 14, iconSize: 14, borderRadius: 16 },
};

export function TagPill({
  label,
  onPress,
  onRemove,
  colorKey = 'purple',
  size = 'md',
  showHash = true,
  style,
}: TagPillProps) {
  const { tagColors, colors } = useTheme();
  const sizeStyle = SIZE_STYLES[size];

  const tagColor = tagColors[colorKey];

  const containerStyle: ViewStyle = {
    height: sizeStyle.height,
    paddingHorizontal: sizeStyle.paddingHorizontal,
    borderRadius: sizeStyle.borderRadius,
    backgroundColor: tagColor.background,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  };

  const textStyle: TextStyle = {
    fontSize: sizeStyle.fontSize,
    fontWeight: '500',
    color: tagColor.text,
  };

  const content = (
    <>
      {showHash && (
        <Hash
          size={sizeStyle.iconSize}
          color={tagColor.text}
          weight="bold"
          style={{ marginRight: 2 }}
        />
      )}
      <Text style={textStyle}>{label}</Text>
      {onRemove && (
        <TouchableOpacity
          onPress={onRemove}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
          style={{ marginLeft: 4 }}
        >
          <X
            size={sizeStyle.iconSize}
            color={tagColor.text}
            weight="bold"
          />
        </TouchableOpacity>
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={[containerStyle, style]}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[containerStyle, style]}>
      {content}
    </View>
  );
}

/**
 * Helper to get a consistent color key based on index
 * Useful for assigning colors to tags in a list
 */
export function getTagColorForIndex(index: number): TagColorKey {
  const colorKeys: TagColorKey[] = ['purple', 'blue', 'green', 'orange', 'pink', 'teal'];
  return colorKeys[index % colorKeys.length];
}
