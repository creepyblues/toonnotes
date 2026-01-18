# UI Alignment Audit - Apple HIG Compliance

**Date**: January 2025
**Status**: Completed
**Priority**: High

## Objective

Comprehensive UI audit to ensure all screens in the ToonNotes Expo app are balanced, aligned, and consistent with Apple Human Interface Guidelines (HIG).

---

## Executive Summary

An audit of all screens revealed several inconsistencies that need to be addressed:

| Issue | Severity | Screens Affected |
|-------|----------|------------------|
| Notes tab missing large title | Critical | Notes tab |
| Inconsistent grid spacing | Critical | All grid screens |
| Trash uses single-column (others use 2-col) | Critical | Trash |
| className mixed with StyleSheet | High | Notes, Archive, Trash |
| Hardcoded colors instead of theme | High | Designs, Settings, Trash |
| Empty state styling varies | Medium | All screens |

---

## Progress Tracker

### Phase 1: Notes Tab Header ✅
- [x] Replace `LogoPreview` with "Notes" large title
- [x] Add `title` style to StyleSheet (fontSize: 34, fontWeight: 700)

### Phase 2: Grid Spacing Standardization ✅
- [x] `index.tsx`: Update GRID_PADDING from 12 to 16, GRID_GAP from 10 to 12
- [x] `designs.tsx`: Update padding from 10 to 16, gap from 6 to 12
- [x] `archive.tsx`: Update padding from 12 to 16, gap from 8 to 12
- [x] `trash.tsx`: Update padding from 12 to 16

### Phase 3: Convert Trash to 2-Column Grid ✅
- [x] Add grid constants (SCREEN_WIDTH, GRID_PADDING, GRID_GAP, ITEM_WIDTH)
- [x] Import `useDesignStore` and `NoteCard`
- [x] Update FlatList with `numColumns={2}` and `columnWrapperStyle`
- [x] Simplify `renderItem` to use `NoteCard` + action buttons

### Phase 4: Replace className with StyleSheet ✅
- [x] `index.tsx`: Convert className in renderHeader and renderEmpty
- [x] `archive.tsx`: Convert all className to StyleSheet
- [x] `trash.tsx`: Convert all className to StyleSheet

### Phase 5: Replace Hardcoded Colors ✅
- [x] `designs.tsx`: Replace #A78BFA, #8B5CF6, #7C3AED with `tagColors.purple.text`
- [x] `settings.tsx`: Replace #FF3B30 with `semantic.error`
- [x] `trash.tsx`: Replace rgba(255,59,48,0.1), #9CA3AF, #10B981, #EF4444 with theme tokens

### Phase 6: Empty State Standardization ✅
- [x] `index.tsx`: Replace emoji with NotePencil icon
- [x] All screens: Ensure 80x80 icon container, fontSize 20 title, fontSize 14 subtitle

---

## Detailed Findings

### 1. Header Inconsistency (Critical)

**Current State:**
| Tab | Header Content |
|-----|----------------|
| Notes | LogoPreview (no title) |
| Boards | "Boards" large title |
| Designs | "Designs" large title |
| Settings | "Settings" large title |

**Issue**: Notes tab breaks the pattern - users expect consistent large titles across all tabs per iOS HIG.

**Fix**: Replace `LogoPreview` with "Notes" text in large title style.

---

### 2. Grid Spacing Inconsistency (Critical)

**Current State:**
| Screen | Padding | Gap | Columns |
|--------|---------|-----|---------|
| Notes | 12px | 10px | 2 |
| Designs | 10px | 6px | 2 |
| Archive | 12px | 8px | 2 |
| Trash | 12px | N/A | 1 |

**iOS HIG Standard**: 16px screen margins, consistent spacing between elements.

**Fix**: Standardize to:
- `GRID_PADDING = 16`
- `GRID_GAP = 12`
- All grids use 2 columns

---

### 3. Trash Screen Layout (Critical)

**Current State**: Single-column list with custom card implementation

**Issue**: Breaks visual consistency with Archive screen which uses 2-column grid with NoteCard.

**Fix**: Convert to 2-column grid using NoteCard component with action buttons below each card.

---

### 4. Styling Pattern Mixing (High)

**Current State**: Some screens mix NativeWind `className` with `style` props

**Issue**: Per CLAUDE.md, this causes iOS vs Android rendering inconsistencies.

**Files with className violations:**
- `index.tsx`: Lines 96, 99, 118, 128, 142-143, 148-149
- `archive.tsx`: Multiple locations
- `trash.tsx`: Lines 64, 79, 84-85, 106, 112, etc.

**Fix**: Convert all layout/container className to StyleSheet. Only use className for static utility classes that don't mix with style props.

---

### 5. Hardcoded Colors (High)

**Current State**: Several files use hardcoded hex colors instead of theme tokens.

**designs.tsx:**
```tsx
// Current (hardcoded)
color: isDark ? '#A78BFA' : '#8B5CF6'
backgroundColor: isDark ? '#7C3AED' : '#8B5CF6'

// Should be
color: colors.accent
backgroundColor: colors.accent
```

**settings.tsx:**
```tsx
// Current (hardcoded)
color: '#FF3B30'  // Sign out button

// Should be
color: semantic.error
```

**trash.tsx:**
```tsx
// Current (hardcoded)
backgroundColor: 'rgba(255, 59, 48, 0.1)'
color: '#10B981'  // Restore
color: '#EF4444'  // Delete

// Should be
backgroundColor: `${semantic.error}15`
color: semantic.success
color: semantic.error
```

---

### 6. Empty State Inconsistency (Medium)

**Current State:**
| Screen | Icon | Icon Size | Container | Title Style |
|--------|------|-----------|-----------|-------------|
| Notes | Emoji (📝) | N/A | 80x80 | className text-xl |
| Trash | Phosphor | 40px | 80x80 | className text-xl |
| Archive | Phosphor | 40px | 80x80 | className text-xl |
| Boards | Phosphor | 40px | 80x80 | StyleSheet |

**Standard Pattern:**
```tsx
emptyIcon: { width: 80, height: 80, borderRadius: 40 }
emptyTitle: { fontSize: 20, fontWeight: '600' }
emptySubtitle: { fontSize: 14, textAlign: 'center', paddingHorizontal: 32 }
```

---

## Files to Modify

| File | Priority | Changes |
|------|----------|---------|
| `apps/expo/app/(tabs)/index.tsx` | Critical | Large title, spacing, className, empty state |
| `apps/expo/app/trash.tsx` | Critical | 2-col grid, spacing, className, colors |
| `apps/expo/app/(tabs)/designs.tsx` | High | Spacing, hardcoded colors |
| `apps/expo/app/(tabs)/settings.tsx` | High | Hardcoded colors |
| `apps/expo/app/archive.tsx` | High | Spacing, className |

---

## Code Patterns

### Standard Screen Header
```tsx
<SafeAreaView
  style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}
  edges={['top']}
>
  <View style={[styles.header, { backgroundColor: colors.backgroundSecondary }]}>
    <Text style={[styles.title, { color: colors.textPrimary }]}>Screen Title</Text>
  </View>
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
});
```

### Standard Grid Layout
```tsx
const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_PADDING = 16;
const GRID_GAP = 12;
const ITEM_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;

<FlatList
  data={items}
  numColumns={2}
  contentContainerStyle={{ padding: GRID_PADDING }}
  columnWrapperStyle={{ gap: GRID_GAP }}
  renderItem={({ item }) => (
    <View style={{ width: ITEM_WIDTH, marginBottom: 12 }}>
      <Card item={item} />
    </View>
  )}
/>
```

### Standard Empty State
```tsx
<View style={styles.emptyContainer}>
  <View style={[styles.emptyIcon, { backgroundColor: `${colors.accent}15` }]}>
    <Icon size={40} color={colors.textSecondary} weight="regular" />
  </View>
  <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
    No items yet
  </Text>
  <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
    Description text here
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

---

## Verification Checklist

### Visual Testing
- [ ] All 4 tabs display large title headers (34px bold)
- [ ] All grids have consistent 16px padding, 12px gap
- [ ] Trash screen matches Archive with 2-column grid
- [ ] Dark mode works correctly on all modified screens
- [ ] Empty states look identical across all screens

### Code Quality
- [ ] No className on SafeAreaView or header containers
- [ ] No hardcoded hex colors (grep for `#[0-9A-Fa-f]{6}`)
- [ ] All colors use `colors.*` or `semantic.*` from useTheme
- [ ] Type check passes: `npx tsc --noEmit`

### Device Testing
- [ ] iPhone SE (smallest screen)
- [ ] iPhone 15 Pro (standard)
- [ ] iPhone 15 Pro Max (largest)
- [ ] Light mode
- [ ] Dark mode

---

## References

- [Apple Human Interface Guidelines - iOS](https://developer.apple.com/design/human-interface-guidelines/ios)
- [ToonNotes CLAUDE.md - Styling Guidelines](../CLAUDE.md)
- [Theme System](../src/theme/README.md)
