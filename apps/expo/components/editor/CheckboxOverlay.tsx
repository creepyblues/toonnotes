import React, { memo } from 'react';
import { TouchableOpacity, View, StyleSheet, I18nManager } from 'react-native';
import { Check } from 'phosphor-react-native';
import type { CheckboxPosition } from '@/hooks/editor';

interface CheckboxOverlayProps {
  position: CheckboxPosition;
  onToggle: () => void;
  accentColor?: string;
  isDark?: boolean;
}

/**
 * Absolutely positioned checkbox overlay for the editor
 * Renders over the TextInput at the correct Y position
 */
export const CheckboxOverlay = memo(function CheckboxOverlay({
  position,
  onToggle,
  accentColor = '#007AFF',
  isDark = false,
}: CheckboxOverlayProps) {
  const { y, height, isChecked } = position;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          top: y,
          height: Math.max(height, 28),
          [I18nManager.isRTL ? 'right' : 'left']: 0,
        },
      ]}
      onPress={onToggle}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isChecked }}
      accessibilityLabel={isChecked ? 'Checked checkbox' : 'Unchecked checkbox'}
    >
      {isChecked ? (
        <View style={[styles.checkedBox, { backgroundColor: accentColor }]}>
          <Check size={14} color="#FFF" weight="bold" />
        </View>
      ) : (
        <View
          style={[
            styles.uncheckedBox,
            { borderColor: isDark ? '#666' : '#CCC' },
          ]}
        />
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  checkedBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uncheckedBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
});

export default CheckboxOverlay;
