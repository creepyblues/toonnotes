/**
 * FormattingToolbar — Native toolbar for the WebView TipTap editor.
 * Shows formatting buttons (bold, italic, underline, strike) and
 * mode buttons (bullet list, checklist, image).
 * Positioned above the keyboard when the editor is focused.
 */
import React, { memo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import {
  TextB,
  TextItalic,
  TextUnderline,
  TextStrikethrough,
  ListBullets,
  CheckSquare,
  ImageSquare,
  IconProps,
} from 'phosphor-react-native';
import type { ToolbarState, FormatType } from '@toonnotes/editor-web';

interface FormattingToolbarProps {
  /** Current toolbar state from the WebView bridge */
  toolbarState: ToolbarState;
  /** Toggle a format in the WebView editor */
  onToggleFormat: (format: FormatType) => void;
  /** Called when the image button is pressed (handled natively) */
  onAddImage: () => void;
  /** Theme colors */
  colors: {
    background: string;
    text: string;
    textSecondary: string;
    accent: string;
    border: string;
  };
}

interface ToolbarButtonConfig {
  format: FormatType;
  Icon: React.ComponentType<IconProps>;
  label: string;
  active: boolean;
}

export const FormattingToolbar = memo(function FormattingToolbar({
  toolbarState,
  onToggleFormat,
  onAddImage,
  colors,
}: FormattingToolbarProps) {
  const formatButtons: ToolbarButtonConfig[] = [
    { format: 'bold', Icon: TextB, label: 'Bold', active: toolbarState.isBold },
    { format: 'italic', Icon: TextItalic, label: 'Italic', active: toolbarState.isItalic },
    { format: 'underline', Icon: TextUnderline, label: 'Underline', active: toolbarState.isUnderline },
    { format: 'strike', Icon: TextStrikethrough, label: 'Strikethrough', active: toolbarState.isStrike },
  ];

  const modeButtons: ToolbarButtonConfig[] = [
    { format: 'bulletList', Icon: ListBullets, label: 'Bullet List', active: toolbarState.isBulletList },
    { format: 'taskList', Icon: CheckSquare, label: 'Checklist', active: toolbarState.isTaskList },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
      {/* Text formatting */}
      <View style={styles.group}>
        {formatButtons.map(({ format, Icon, label, active }) => (
          <TouchableOpacity
            key={format}
            onPress={() => onToggleFormat(format)}
            accessibilityLabel={label}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            style={[
              styles.button,
              active && { backgroundColor: `${colors.accent}20` },
            ]}
          >
            <Icon
              size={20}
              color={active ? colors.accent : colors.textSecondary}
              weight={active ? 'fill' : 'regular'}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Separator */}
      <View style={[styles.separator, { backgroundColor: colors.border }]} />

      {/* Mode buttons */}
      <View style={styles.group}>
        {modeButtons.map(({ format, Icon, label, active }) => (
          <TouchableOpacity
            key={format}
            onPress={() => onToggleFormat(format)}
            accessibilityLabel={label}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            style={[
              styles.button,
              active && { backgroundColor: `${colors.accent}20` },
            ]}
          >
            <Icon
              size={20}
              color={active ? colors.accent : colors.textSecondary}
              weight={active ? 'fill' : 'regular'}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Separator */}
      <View style={[styles.separator, { backgroundColor: colors.border }]} />

      {/* Image button (native action) */}
      <TouchableOpacity
        onPress={onAddImage}
        accessibilityLabel="Add image"
        accessibilityRole="button"
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        style={styles.button}
      >
        <ImageSquare size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    width: StyleSheet.hairlineWidth,
    height: 20,
    marginHorizontal: 8,
  },
});
