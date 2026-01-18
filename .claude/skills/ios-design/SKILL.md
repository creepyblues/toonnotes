---
name: ios-design
description: Guides iOS app interface design following Apple's Human Interface Guidelines. This skill should be used when creating iOS UI components, screens, or layouts in React Native/Expo projects, ensuring Apple-native feel with proper spacing, typography, colors, and accessibility.
---

# iOS Design Skill

Design iOS app interfaces that feel native and intuitive by following Apple's Human Interface Guidelines and the established ToonNotes design system.

## When to Use This Skill

- Creating new screens or views
- Designing UI components (buttons, rows, cards, forms)
- Implementing settings, list views, or detail screens
- Reviewing existing UI for Apple compliance
- Ensuring accessibility and touch target requirements

## Apple's Design Philosophy

### The Three Pillars

1. **Clarity** - Text is legible at every size, icons are precise and lucid, adornments are subtle and appropriate
2. **Deference** - Content is king; the UI helps users understand and interact without competing with content
3. **Depth** - Visual layers and realistic motion impart vitality and heighten delight and understanding

### Key Principles

- Content comes first; chrome is minimized
- Respect safe areas and system UI
- Support both light and dark modes
- Use standard system controls where possible
- **44pt minimum touch targets** (CRITICAL - this is non-negotiable)

## Core Design Rules

### Touch Targets

| Element Type | Minimum | Recommended |
|--------------|---------|-------------|
| Row/List item | 44pt height | 48pt height |
| Button | 44pt height | 48pt height |
| Icon button | 44x44pt | Use hitSlop |
| FAB | 56x56pt | - |
| Tab bar item | 44pt | Full tab width |

```typescript
// For small visual elements, use hitSlop to expand touch area
<TouchableOpacity
  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
>
```

### Spacing Quick Reference

| Token | Value | Use Case |
|-------|-------|----------|
| xs | 8pt | Inline gaps, icon margins |
| sm | 12pt | Item gaps, row padding (vertical) |
| md | 16pt | Card padding, screen margins |
| xl | 24pt | Section gaps |

See `references/design-tokens.md` for complete scale.

### Typography Quick Reference

| Style | Size/Weight | Use |
|-------|-------------|-----|
| Large Title | 34pt/700 | Screen titles |
| Headline | 17pt/600 | Row labels, buttons |
| Body | 17pt/400 | Primary content |
| Subhead | 15pt/400 | Secondary content |
| Caption | 12pt/500 | Section headers (uppercase) |

See `references/design-tokens.md` for complete scale with line heights and letter spacing.

### Color Guidelines

- **Always use semantic colors** (`textPrimary`, `textSecondary`) not raw hex values
- **Section headers**: `textSecondary` with 12pt uppercase, 0.5 letter-spacing
- **Separators**: 8% opacity of neutral color, 0.5pt width
- **Icon backgrounds**: 15% opacity of icon color (`${iconColor}26`)
- **Light/dark mode**: Use `useTheme()` hook, never hardcode colors

## Required Patterns

### Screen Layout (StyleSheet Only)

**CRITICAL**: Never mix NativeWind `className` with `style` props for layout properties. This causes iOS rendering bugs.

```typescript
// CORRECT - StyleSheet only for layout
<SafeAreaView
  style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}
  edges={['top']}
>
  <View style={[styles.header, { backgroundColor: colors.backgroundSecondary }]}>
    <Text style={[styles.title, { color: colors.textPrimary }]}>
      Title
    </Text>
  </View>
  <ScrollView style={styles.content}>
    {/* content */}
  </ScrollView>
</SafeAreaView>

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
```

```typescript
// WRONG - Mixing className and style for layout
<SafeAreaView className="flex-1" style={{ backgroundColor: colors.bg }}>
```

### Settings Screen Pattern

Use `SettingsSection` and `SettingsRow` components for settings-style lists.

See `references/component-patterns.md` for full implementations.

```typescript
<SettingsSection title="Profile">
  <SettingsRow
    icon={<User size={20} weight="regular" />}
    iconColor={colors.accent}
    label="Account"
    accessory="chevron"
    onPress={handleAccountPress}
    showSeparator
  />
  <SettingsRow
    icon={<Moon size={20} weight="regular" />}
    iconColor={colors.textSecondary}
    label="Dark Mode"
    accessory="switch"
    switchValue={isDark}
    onSwitchChange={toggleDarkMode}
  />
</SettingsSection>
```

### Accessibility Requirements

Every interactive element MUST have accessibility attributes:

```typescript
<TouchableOpacity
  accessibilityLabel="Create new note"
  accessibilityRole="button"
  accessibilityHint="Opens the note editor"
>
```

| Attribute | Purpose |
|-----------|---------|
| `accessibilityLabel` | Short description of the element |
| `accessibilityRole` | Semantic role (button, link, switch, search) |
| `accessibilityHint` | What happens when activated (complex actions) |

## Workflow

### When Creating a New Screen

1. Check `references/design-tokens.md` for spacing/typography values
2. Use `SafeAreaView` with `edges={['top']}` for proper status bar handling
3. Use `StyleSheet.create()` for all layout styles
4. Apply theme colors via `useTheme()` hook
5. Verify 44pt minimum touch targets on all interactive elements
6. Add accessibility labels to all buttons and interactive elements
7. Test in both light and dark modes

### When Creating a New Component

1. Review `references/component-patterns.md` for similar patterns
2. Follow the size preset pattern (sm/md/lg) for flexibility
3. Use theme hook for colors: `const { colors, semantic } = useTheme()`
4. Include loading and disabled states where appropriate
5. Memoize with `React.memo()` for list items
6. Export props interface for TypeScript autocompletion

## Anti-Patterns to Avoid

| Wrong | Right | Reason |
|-------|-------|--------|
| `className="flex-1" style={{...}}` | `style={{ flex: 1, ... }}` | iOS rendering bugs |
| `fontSize: 16` for body | `fontSize: 17` | iOS HIG standard |
| Fixed pixel heights | `minHeight: 44` | Touch target compliance |
| `#000000` text color | `colors.textPrimary` | Dark mode support |
| Inline styles everywhere | `StyleSheet.create()` | Performance, consistency |
| Array indices as list keys | Stable UUIDs | Re-render issues |

## Quick Checklist

Before completing any iOS UI work, verify:

- [ ] All interactive elements have 44pt minimum touch target
- [ ] All colors use `useTheme()` hook (no hardcoded hex)
- [ ] All interactive elements have `accessibilityLabel` and `accessibilityRole`
- [ ] Screen layout uses StyleSheet only (no className for layout)
- [ ] Typography follows iOS HIG scale (17pt body, 34pt large title)
- [ ] Spacing follows 4pt base unit scale
- [ ] UI tested in both light and dark modes

## Reference Files

- `references/design-tokens.md` - Complete spacing, typography, color, and effects specifications
- `references/component-patterns.md` - Production code examples from ToonNotes

## Source Files

These are the actual ToonNotes implementations this skill is based on:

| File | Content |
|------|---------|
| `apps/expo/components/settings/SettingsRow.tsx` | Row component with 44pt touch target |
| `apps/expo/components/settings/SettingsSection.tsx` | Section wrapper with uppercase header |
| `apps/expo/src/theme/tokens/spacing.ts` | Spacing scale |
| `apps/expo/src/theme/tokens/typography.ts` | Typography scale |
| `apps/expo/src/theme/tokens/colors.ts` | Color system |
| `apps/expo/src/theme/tokens/effects.ts` | Border radius, shadows |
| `apps/expo/src/theme/useTheme.ts` | Theme hook |
