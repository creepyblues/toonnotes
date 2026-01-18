# iOS Component Patterns Reference

Production code patterns from ToonNotes demonstrating iOS HIG-compliant component implementations.

## Settings Components

### SettingsSection

Groups related settings with an uppercase header and card container.

**Source**: `apps/expo/components/settings/SettingsSection.tsx`

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme';

export interface SettingsSectionProps {
  /** Section title (displayed as uppercase header) */
  title: string;
  /** Child rows to render inside the section card */
  children: React.ReactNode;
  /** Hide the section title */
  hideTitle?: boolean;
  /** Additional margin top (defaults to 24) */
  marginTop?: number;
}

export function SettingsSection({
  title,
  children,
  hideTitle = false,
  marginTop = 24,
}: SettingsSectionProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { marginTop }]}>
      {!hideTitle && (
        <Text style={[styles.header, { color: colors.textSecondary }]}>
          {title}
        </Text>
      )}
      <View style={[styles.card, { backgroundColor: colors.surfaceCard }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  header: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
});
```

**Key patterns:**
- 12pt uppercase header with 0.5 letter-spacing
- 8pt horizontal padding on header
- 12pt border radius on card
- `overflow: hidden` prevents child content bleeding

### SettingsRow

Flexible row component for settings lists.

**Source**: `apps/expo/components/settings/SettingsRow.tsx`

```typescript
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { CaretRight } from 'phosphor-react-native';
import { useTheme } from '@/src/theme';

export interface SettingsRowProps {
  /** Icon element to display */
  icon: React.ReactNode;
  /** Color for the icon */
  iconColor: string;
  /** Background color for icon container (defaults to iconColor at 15% opacity) */
  iconBackgroundColor?: string;
  /** Primary label text */
  label: string;
  /** Secondary subtitle text (appears below label) */
  subtitle?: string;
  /** Value to display on the right side */
  value?: string | number;
  /** Color for the value text */
  valueColor?: string;
  /** Badge to display */
  badge?: { text: string; color: string };
  /** Accessory type: chevron, switch, none, or custom element */
  accessory?: 'chevron' | 'switch' | 'none' | React.ReactNode;
  /** Switch value (when accessory='switch') */
  switchValue?: boolean;
  /** Switch change handler */
  onSwitchChange?: (value: boolean) => void;
  /** Press handler (makes row tappable) */
  onPress?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Show separator line at bottom */
  showSeparator?: boolean;
  /** Destructive action styling */
  isDestructive?: boolean;
  /** Custom left content instead of icon */
  leftContent?: React.ReactNode;
}

export function SettingsRow({
  icon,
  iconColor,
  iconBackgroundColor,
  label,
  subtitle,
  value,
  valueColor,
  badge,
  accessory = 'chevron',
  switchValue,
  onSwitchChange,
  onPress,
  disabled = false,
  isLoading = false,
  showSeparator = false,
  isDestructive = false,
  leftContent,
}: SettingsRowProps) {
  const { colors } = useTheme();

  const labelColor = isDestructive ? iconColor : colors.textPrimary;
  const computedIconBg = iconBackgroundColor || `${iconColor}26`; // 15% opacity

  const content = (
    <View
      style={[
        styles.row,
        showSeparator && {
          borderBottomWidth: 0.5,
          borderBottomColor: colors.separator
        },
      ]}
    >
      {/* Left: Icon or custom content */}
      {leftContent ? (
        leftContent
      ) : (
        <View style={[styles.iconContainer, { backgroundColor: computedIconBg }]}>
          {icon}
        </View>
      )}

      {/* Middle: Label + Subtitle */}
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* Badge */}
      {badge && (
        <View style={[styles.badge, { backgroundColor: badge.color }]}>
          <Text style={styles.badgeText}>{badge.text}</Text>
        </View>
      )}

      {/* Right: Value + Accessory */}
      {isLoading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <View style={styles.accessory}>
          {value !== undefined && (
            <Text style={[styles.value, { color: valueColor || colors.textSecondary }]}>
              {value}
            </Text>
          )}
          {accessory === 'chevron' && (
            <CaretRight size={16} color={colors.textTertiary} weight="regular" />
          )}
          {accessory === 'switch' && (
            <Switch
              value={switchValue}
              onValueChange={onSwitchChange}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#FFFFFF"
              disabled={disabled}
            />
          )}
          {accessory !== 'chevron' &&
           accessory !== 'switch' &&
           accessory !== 'none' &&
           accessory}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || isLoading}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44, // iOS minimum touch target
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    flex: 1,
    marginLeft: 12,
  },
  label: {
    fontSize: 17,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  badge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  accessory: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  value: {
    fontSize: 17,
    marginRight: 8,
  },
});
```

**Key patterns:**
- `minHeight: 44` ensures touch target compliance
- Icon container: 32x32pt with 8pt radius, 15% opacity background
- 0.5pt separators with separator color (8% opacity)
- Chevron: 16pt size, `textTertiary` color
- Label: 17pt (Body), subtitle: 14pt
- Always includes `accessibilityRole` and `accessibilityLabel`

## Screen Layout Pattern

Standard screen layout with Large Title header.

```typescript
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme';

export default function ExampleScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.backgroundSecondary }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Screen Title
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Sections go here */}
        <SettingsSection title="Section Name" marginTop={0}>
          <SettingsRow ... />
        </SettingsSection>

        <SettingsSection title="Another Section">
          <SettingsRow ... />
        </SettingsSection>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  bottomSpacer: {
    height: 32,
  },
});
```

**Key patterns:**
- `SafeAreaView` with `edges={['top']}` (bottom handled by tab bar)
- `backgroundSecondary` for screen backgrounds
- Large Title: 34pt, 700 weight
- 16pt horizontal padding on header and content
- Bottom spacer (32pt) for scroll overscroll area

## Button Component

Size presets with variant support.

```typescript
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/src/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

const SIZE_STYLES = {
  sm: { height: 36, paddingHorizontal: 16, fontSize: 14, borderRadius: 18 },
  md: { height: 44, paddingHorizontal: 20, fontSize: 16, borderRadius: 22 },
  lg: { height: 52, paddingHorizontal: 24, fontSize: 17, borderRadius: 26 },
};

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
}: ButtonProps) {
  const { colors, semantic } = useTheme();
  const sizeStyle = SIZE_STYLES[size];

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return { bg: colors.accent, text: '#FFFFFF' };
      case 'secondary':
        return { bg: colors.backgroundSecondary, text: colors.textPrimary };
      case 'ghost':
        return { bg: 'transparent', text: colors.accent };
      case 'destructive':
        return { bg: semantic.error, text: '#FFFFFF' };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        height: sizeStyle.height,
        paddingHorizontal: sizeStyle.paddingHorizontal,
        borderRadius: sizeStyle.borderRadius,
        backgroundColor: variantStyles.bg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled || loading ? 0.5 : 1,
        ...(fullWidth && { width: '100%' }),
      }}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.text} size="small" />
      ) : (
        <Text style={{
          fontSize: sizeStyle.fontSize,
          fontWeight: '600',
          color: variantStyles.text
        }}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
```

**Key patterns:**
- Size presets (sm/md/lg) for consistent sizing
- `md` (44pt) is default - matches iOS touch target
- Pill-shaped radius (half of height)
- 0.5 opacity for disabled/loading states
- Always includes `accessibilityRole` and `accessibilityLabel`

## Empty State Pattern

Centered layout for empty content.

```typescript
<View style={styles.emptyContainer}>
  <View style={[styles.emptyIcon, { backgroundColor: `${colors.accent}15` }]}>
    <NotePencil size={40} color={colors.textSecondary} weight="regular" />
  </View>
  <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
    No items yet
  </Text>
  <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
    Descriptive text about how to get started
  </Text>
</View>

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
```

**Key patterns:**
- 80x80pt icon container with accent background (15% opacity)
- Centered layout with generous padding
- Title: 20pt/600, Subtitle: 14pt/400
- 32pt horizontal padding on subtitle for text wrapping

## Search Bar Pattern

iOS system-style search bar.

```typescript
<View
  style={[
    styles.searchBar,
    {
      backgroundColor: isDark
        ? 'rgba(118, 118, 128, 0.24)'
        : 'rgba(118, 118, 128, 0.12)'
    }
  ]}
>
  <MagnifyingGlass size={17} color={colors.textTertiary} weight="regular" />
  <TextInput
    style={[styles.searchInput, { color: colors.textPrimary }]}
    placeholder="Search"
    placeholderTextColor={colors.textTertiary}
    value={searchQuery}
    onChangeText={setSearchQuery}
    accessibilityLabel="Search"
  />
  {searchQuery.length > 0 && (
    <TouchableOpacity
      onPress={() => setSearchQuery('')}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityLabel="Clear search"
      accessibilityRole="button"
    >
      <XCircle size={17} color={colors.textTertiary} weight="fill" />
    </TouchableOpacity>
  )}
</View>

const styles = StyleSheet.create({
  searchBar: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 36,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 17,
    height: 36,
  },
});
```

**Key patterns:**
- iOS system gray background (different opacity for light/dark)
- 36pt height, 12pt radius (iOS standard)
- 17pt search icon and clear button
- Clear button uses `XCircle` filled, with `hitSlop` for touch target

## FAB (Floating Action Button)

Primary action button with accent glow.

```typescript
<TouchableOpacity
  onPress={handleCreate}
  accessibilityLabel="Create new item"
  accessibilityRole="button"
  style={[
    styles.fab,
    {
      backgroundColor: colors.accent,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 8,
    }
  ]}
>
  <Plus size={28} color="#FFFFFF" weight="bold" />
</TouchableOpacity>

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
});
```

**Key patterns:**
- 56x56pt size (larger than minimum for primary action)
- Shadow uses accent color for glow effect
- 28pt icon, bold weight
- 24pt from screen edges
- `zIndex` ensures visibility above content

## List Item Pattern

Memoized list item for FlatList performance.

```typescript
import React, { memo } from 'react';

interface ListItemProps {
  id: string;
  title: string;
  subtitle?: string;
  onPress: (id: string) => void;
}

function ListItemComponent({ id, title, subtitle, onPress }: ListItemProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => onPress(id)}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={[styles.item, { backgroundColor: colors.surfaceCard }]}
    >
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// Custom comparison for memo
function arePropsEqual(
  prevProps: ListItemProps,
  nextProps: ListItemProps
): boolean {
  return (
    prevProps.id === nextProps.id &&
    prevProps.title === nextProps.title &&
    prevProps.subtitle === nextProps.subtitle
  );
}

export const ListItem = memo(ListItemComponent, arePropsEqual);

const styles = StyleSheet.create({
  item: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    minHeight: 44,
  },
  title: {
    fontSize: 17,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
});
```

**Key patterns:**
- `memo()` with custom comparison for FlatList performance
- `minHeight: 44` for touch target
- Callback receives item ID, not full item (avoids re-renders)
- Export props interface for TypeScript consumers

## Modal/Sheet Header Pattern

Standard header for modals and bottom sheets.

```typescript
<View style={[styles.header, { borderBottomColor: colors.separator }]}>
  <TouchableOpacity
    onPress={onClose}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    accessibilityLabel="Close"
    accessibilityRole="button"
  >
    <X size={24} color={colors.textPrimary} weight="regular" />
  </TouchableOpacity>

  <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
    Modal Title
  </Text>

  <TouchableOpacity
    onPress={onSave}
    disabled={!canSave}
    accessibilityLabel="Save"
    accessibilityRole="button"
  >
    <Text style={[
      styles.saveButton,
      { color: canSave ? colors.accent : colors.textTertiary }
    ]}>
      Save
    </Text>
  </TouchableOpacity>
</View>

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    minHeight: 44,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  saveButton: {
    fontSize: 17,
    fontWeight: '600',
  },
});
```

**Key patterns:**
- Close on left, action on right
- 0.5pt bottom separator
- Title centered with `justifyContent: 'space-between'`
- Disabled state uses `textTertiary` color
- `hitSlop` on icon buttons for touch target
