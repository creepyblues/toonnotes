/**
 * ModeSelectSheet - Bottom sheet for assigning mode to a board
 *
 * Features:
 * - Lists 4 modes + "Remove mode" option
 * - Each row: icon, label, description
 * - Highlights current mode
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { X, Check } from 'phosphor-react-native';
import { MODE_TAB_CONFIGS, ModeTabId } from '@/constants/modeConfig';
import { Mode } from '@/types';
import { useTheme } from '@/src/theme';

interface ModeSelectSheetProps {
  visible: boolean;
  onClose: () => void;
  currentMode: Mode | undefined;
  onSelectMode: (mode: Mode | undefined) => void;
  boardHashtag: string;
}

export function ModeSelectSheet({
  visible,
  onClose,
  currentMode,
  onSelectMode,
  boardHashtag,
}: ModeSelectSheetProps) {
  const { colors, isDark } = useTheme();

  // Filter out 'uncategorized' from mode options
  const modeOptions = MODE_TAB_CONFIGS.filter((c) => c.id !== 'uncategorized');

  const handleSelectMode = (modeId: ModeTabId) => {
    if (modeId === 'uncategorized') {
      onSelectMode(undefined);
    } else {
      onSelectMode(modeId as Mode);
    }
    onClose();
  };

  const handleRemoveMode = () => {
    onSelectMode(undefined);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: colors.backgroundPrimary },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                Set Mode
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                #{boardHashtag}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeButton,
                {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.05)',
                },
              ]}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Mode Options */}
          <View style={styles.options}>
            {modeOptions.map((config) => {
              const isSelected = currentMode === config.id;
              const IconComponent = config.icon;

              return (
                <TouchableOpacity
                  key={config.id}
                  onPress={() => handleSelectMode(config.id)}
                  activeOpacity={0.7}
                  style={[
                    styles.option,
                    {
                      backgroundColor: isSelected
                        ? `${config.color}20`
                        : 'transparent',
                      borderColor: isSelected
                        ? config.color
                        : isDark
                          ? 'rgba(255,255,255,0.1)'
                          : 'rgba(0,0,0,0.08)',
                    },
                  ]}
                  accessibilityLabel={`${config.label}: ${config.description}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: `${config.color}30` },
                    ]}
                  >
                    <IconComponent
                      size={22}
                      weight="fill"
                      color={config.color}
                    />
                  </View>
                  <View style={styles.optionText}>
                    <Text
                      style={[
                        styles.optionLabel,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {config.label}
                    </Text>
                    <Text
                      style={[
                        styles.optionDescription,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {config.description}
                    </Text>
                  </View>
                  {isSelected && (
                    <Check size={20} weight="bold" color={config.color} />
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Remove Mode Option */}
            {currentMode && (
              <TouchableOpacity
                onPress={handleRemoveMode}
                activeOpacity={0.7}
                style={[
                  styles.option,
                  styles.removeOption,
                  {
                    borderColor: isDark
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.08)',
                  },
                ]}
                accessibilityLabel="Remove mode assignment"
                accessibilityRole="button"
              >
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(0,0,0,0.05)',
                    },
                  ]}
                >
                  <X size={22} color={colors.textSecondary} />
                </View>
                <View style={styles.optionText}>
                  <Text
                    style={[
                      styles.optionLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Remove mode
                  </Text>
                  <Text
                    style={[
                      styles.optionDescription,
                      { color: colors.textTertiary },
                    ]}
                  >
                    Move to Uncategorized
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  options: {
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  removeOption: {
    marginTop: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 13,
    marginTop: 2,
  },
});

export default ModeSelectSheet;
