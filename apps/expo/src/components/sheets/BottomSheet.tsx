/**
 * BottomSheet Component
 *
 * iOS-style bottom sheet modal with drag handle.
 * Supports multiple snap points and gesture dismissal.
 */

import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X } from 'phosphor-react-native';
import { useTheme } from '@/src/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export type BottomSheetSize = 'auto' | 'small' | 'medium' | 'large' | 'full';

interface BottomSheetProps {
  /** Whether the sheet is visible */
  visible: boolean;
  /** Called when sheet should close */
  onClose: () => void;
  /** Sheet title */
  title?: string;
  /** Size preset or 'auto' for content height */
  size?: BottomSheetSize;
  /** Show close button in header */
  showCloseButton?: boolean;
  /** Show drag handle */
  showHandle?: boolean;
  /** Allow dismissing by tapping backdrop */
  dismissOnBackdrop?: boolean;
  /** Allow dismissing by dragging down */
  dismissOnDrag?: boolean;
  /** Content to render */
  children: React.ReactNode;
  /** Custom header content (replaces title) */
  headerContent?: React.ReactNode;
  /** Footer content (fixed at bottom) */
  footerContent?: React.ReactNode;
  /** Container style for content area */
  contentStyle?: ViewStyle;
}

const SIZE_HEIGHTS: Record<Exclude<BottomSheetSize, 'auto'>, number> = {
  small: SCREEN_HEIGHT * 0.3,
  medium: SCREEN_HEIGHT * 0.5,
  large: SCREEN_HEIGHT * 0.75,
  full: SCREEN_HEIGHT * 0.9,
};

const DRAG_THRESHOLD = 50;

export function BottomSheet({
  visible,
  onClose,
  title,
  size = 'medium',
  showCloseButton = true,
  showHandle = true,
  dismissOnBackdrop = true,
  dismissOnDrag = true,
  children,
  headerContent,
  footerContent,
  contentStyle,
}: BottomSheetProps) {
  const { colors, borderRadius, shadows } = useTheme();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const sheetHeight = size === 'auto' ? undefined : SIZE_HEIGHTS[size];

  // Animation handlers
  const showSheet = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 150,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateY, backdropOpacity]);

  const hideSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [translateY, backdropOpacity, onClose]);

  useEffect(() => {
    if (visible) {
      showSheet();
    }
  }, [visible, showSheet]);

  // Pan responder for drag-to-dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => dismissOnDrag,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return dismissOnDrag && gestureState.dy > 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > DRAG_THRESHOLD) {
          hideSheet();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 20,
            stiffness: 150,
          }).start();
        }
      },
    })
  ).current;

  const handleBackdropPress = () => {
    if (dismissOnBackdrop) {
      hideSheet();
    }
  };

  const handleClosePress = () => {
    hideSheet();
  };

  const sheetStyle: ViewStyle = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: SCREEN_HEIGHT * 0.9,
    ...(sheetHeight && { height: sheetHeight }),
    ...shadows.large,
  };

  const hasHeader = title || headerContent || showCloseButton;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClosePress}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                backgroundColor: colors.overlayDark,
                opacity: backdropOpacity,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Sheet */}
        <Animated.View
          style={[
            sheetStyle,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Drag Handle */}
          {showHandle && (
            <View style={styles.handleContainer} {...panResponder.panHandlers}>
              <View
                style={[
                  styles.handle,
                  { backgroundColor: colors.separator },
                ]}
              />
            </View>
          )}

          {/* Header */}
          {hasHeader && (
            <View
              style={[
                styles.header,
                { borderBottomColor: colors.separator },
              ]}
            >
              {headerContent || (
                <Text
                  style={[styles.title, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {title}
                </Text>
              )}
              {showCloseButton && (
                <TouchableOpacity
                  onPress={handleClosePress}
                  style={[
                    styles.closeButton,
                    { backgroundColor: colors.backgroundSecondary },
                  ]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X size={18} color={colors.textSecondary} weight="bold" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Content */}
          <View style={[styles.content, contentStyle]}>
            {children}
          </View>

          {/* Footer */}
          {footerContent && (
            <View
              style={[
                styles.footer,
                {
                  borderTopColor: colors.separator,
                  backgroundColor: colors.surfaceElevated,
                },
              ]}
            >
              {footerContent}
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
