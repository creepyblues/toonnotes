import React, { memo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Plus, CheckSquare, ListBullets, ImageSquare } from 'phosphor-react-native';
import { useTheme } from '@/src/theme';

// Label colors configuration (shared with HashtagAutocomplete)
const LABEL_COLORS = {
  primary: {
    light: { background: 'rgba(60, 60, 67, 0.12)', text: '#3C3C43' },
    dark: { background: 'rgba(255, 255, 255, 0.16)', text: '#E5E5E7' },
  },
  secondary: {
    light: { background: 'rgba(142, 142, 147, 0.08)', text: '#8E8E93' },
    dark: { background: 'rgba(142, 142, 147, 0.12)', text: '#98989D' },
  },
};

const getLabelColor = (index: number, isDark: boolean) => {
  const colorType = index === 0 ? 'primary' : 'secondary';
  return isDark ? LABEL_COLORS[colorType].dark : LABEL_COLORS[colorType].light;
};

interface EditorToolbarProps {
  noteLabels: string[];
  onAddLabel: () => void;
  onAddCheckbox: () => void;
  onAddBullet: () => void;
  onAddImage: () => void;
}

/**
 * Toolbar at the bottom of the note editor
 * Shows label pills and format menu (+)
 */
export const EditorToolbar = memo(function EditorToolbar({
  noteLabels,
  onAddLabel,
  onAddCheckbox,
  onAddBullet,
  onAddImage,
}: EditorToolbarProps) {
  const { isDark, colors } = useTheme();
  const [showFormatMenu, setShowFormatMenu] = useState(false);

  const handleFormatMenuToggle = useCallback(() => {
    setShowFormatMenu((prev) => !prev);
  }, []);

  const handleCheckbox = useCallback(() => {
    onAddCheckbox();
    setShowFormatMenu(false);
  }, [onAddCheckbox]);

  const handleBullet = useCallback(() => {
    onAddBullet();
    setShowFormatMenu(false);
  }, [onAddBullet]);

  const handleImage = useCallback(() => {
    onAddImage();
    setShowFormatMenu(false);
  }, [onAddImage]);

  return (
    <View style={styles.container}>
      {/* Label pills on left - tappable to open label picker */}
      <TouchableOpacity
        onPress={onAddLabel}
        activeOpacity={0.7}
        style={styles.labelsContainer}
        accessibilityLabel="Add or manage labels"
        accessibilityRole="button"
      >
        <View style={styles.labelRow}>
          {noteLabels.length > 0 ? (
            noteLabels.map((label, index) => {
              const labelColor = getLabelColor(index, isDark);
              return (
                <View
                  key={label}
                  style={[styles.labelPill, { backgroundColor: labelColor.background }]}
                >
                  <Text style={[styles.labelText, { color: labelColor.text }]}>
                    #{label}
                  </Text>
                </View>
              );
            })
          ) : (
            <View
              style={[
                styles.labelPill,
                { backgroundColor: isDark ? colors.backgroundTertiary : '#EFEFF0' },
              ]}
            >
              <Text style={[styles.addLabelText, { color: colors.textSecondary }]}>
                + Add label
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* + button on right */}
      <View style={styles.formatMenuContainer}>
        <TouchableOpacity
          onPress={handleFormatMenuToggle}
          style={[
            styles.formatButton,
            {
              borderColor: isDark ? '#555' : '#CCC',
              backgroundColor: isDark ? '#2A2A2A' : '#FFF',
            },
          ]}
          accessibilityLabel="Open format menu"
          accessibilityRole="button"
        >
          <Plus size={18} color={isDark ? '#AAA' : '#666'} />
        </TouchableOpacity>

        {/* Format menu popup */}
        {showFormatMenu && (
          <View
            style={[
              styles.formatMenu,
              { backgroundColor: isDark ? '#333' : '#FFF' },
            ]}
          >
            <TouchableOpacity
              onPress={handleCheckbox}
              style={styles.formatMenuItem}
              accessibilityLabel="Add checkbox"
            >
              <CheckSquare size={20} color={isDark ? '#AAA' : '#666'} />
              <Text style={[styles.formatMenuText, { color: isDark ? '#EEE' : '#333' }]}>
                Checkbox
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleBullet}
              style={styles.formatMenuItem}
              accessibilityLabel="Add bullet point"
            >
              <ListBullets size={20} color={isDark ? '#AAA' : '#666'} />
              <Text style={[styles.formatMenuText, { color: isDark ? '#EEE' : '#333' }]}>
                Bullet
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleImage}
              style={styles.formatMenuItem}
              accessibilityLabel="Add image"
            >
              <ImageSquare size={20} color={isDark ? '#AAA' : '#666'} />
              <Text style={[styles.formatMenuText, { color: isDark ? '#EEE' : '#333' }]}>
                Image
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 100,
  },
  labelsContainer: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 6,
  },
  labelPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '500',
  },
  addLabelText: {
    fontSize: 12,
    fontWeight: '500',
  },
  formatMenuContainer: {
    position: 'relative',
    zIndex: 100,
  },
  formatButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  formatMenu: {
    position: 'absolute',
    bottom: 40,
    right: 0,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 999,
    minWidth: 140,
  },
  formatMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  formatMenuText: {
    marginLeft: 12,
    fontSize: 14,
  },
});

export default EditorToolbar;
