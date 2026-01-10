# ToonNotes UX Documentation

This document covers user flows, page layouts, design specifications, and identified UX issues with suggested fixes.

---

## Table of Contents

1. [Navigation Architecture](#navigation-architecture)
2. [User Flows](#user-flows)
3. [Page Layouts](#page-layouts)
4. [Design System](#design-system)
5. [UX Issues & Suggested Fixes](#ux-issues--suggested-fixes)

---

## Navigation Architecture

### Root Structure

```
Root Stack (Expo Router)
├── (tabs)/              # Main tab navigator
│   ├── index.tsx        # Notes list (home)
│   ├── boards.tsx       # Boards list
│   ├── designs.tsx      # Design presets gallery
│   └── settings.tsx     # App settings
├── note/[id].tsx        # Note editor (modal)
├── board/[hashtag].tsx  # Board detail (modal)
├── design/create.tsx    # Design creation flow (modal)
├── archive.tsx          # Archived notes (modal)
└── trash.tsx            # Deleted notes (modal)
```

### Tab Bar

| Tab | Icon | Description |
|-----|------|-------------|
| Notes | NotePencil | Primary note list with 2-column grid |
| Boards | SquaresFour | Hashtag-based note collections |
| Designs | Sparkle | 20 label preset designs |
| Settings | Gear | App configuration |

---

## User Flows

### 1. Note Creation Flow

```
Notes Tab → FAB (+) → New note created → Note Editor opens
                                              ↓
                                     User types title/content
                                              ↓
                                     User can add labels via:
                                     - Type # inline (autocomplete)
                                     - Tap "+ Add label" area
                                              ↓
                                     User can apply design via:
                                     - Sparkle icon → Design Picker
                                              ↓
                                     Auto-save on changes (500ms debounce)
                                              ↓
                                     Back button → Returns to Notes list
```

### 2. Label & Design Application Flow

```
Note Editor → Type # → Autocomplete panel opens (shoujo style)
                              ↓
                    Choose existing label OR create new
                              ↓
                    Label added to note → Design auto-applies
                    (if label matches a preset like "todo", "reading")
                              ↓
                    User can manually change design via:
                    Sparkle icon → Design Picker Modal
                              ↓
                    Options:
                    - Note Color (7 colors)
                    - Label Designs (from note's labels)
                    - All Label Styles (20 presets)
                    - My Designs (custom created)
                    - Create New Design
```

### 3. Board Flow

```
Boards Tab → Shows boards computed from note hashtags
                    ↓
            Tap board card → Board Detail screen
                    ↓
            View all notes with that hashtag
                    ↓
            Tap note → Note Editor
```

### 4. Custom Design Creation Flow

```
Note Editor → Sparkle icon → Design Picker
                    ↓
            "Create New Design" button
                    ↓
            design/create.tsx modal opens
                    ↓
            Step 1: Select image from library
                    ↓
            AI generates sticker (background removal)
                    ↓
            Step 2: Choose what to apply:
            - Sticker only
            - Background only
            - Both
                    ↓
            Apply → Design saved + applied to note
```

### 5. Archive & Trash Flow

```
Note Editor → Menu (⋮) → Archive
                    ↓
            Note moves to Archive

Settings → Archive → View archived notes
                    ↓
            Tap note → Opens in editor
            Can unarchive via menu

Note Editor → Menu → Delete
                    ↓
            Note moves to Trash

Settings → Trash → View deleted notes
                    ↓
            Options per note:
            - Restore (back to active)
            - Delete permanently
            - Empty Trash (all)
```

### 6. Settings Flow

```
Settings Tab
    ├── Account: Coins balance (IAP placeholder)
    ├── AI Configuration: Gemini API Key modal
    ├── Appearance: Dark mode toggle
    ├── Notes: Archive / Trash links
    ├── About: Version info
    └── Debug: Add coins, clear notes/designs
```

---

## Page Layouts

### Notes Screen (`app/(tabs)/index.tsx`)

```
┌─────────────────────────────────────┐
│ [Safe Area Top]                     │
├─────────────────────────────────────┤
│ ToonNotes              [Search 🔍]   │  ← Header (34pt bold)
├─────────────────────────────────────┤
│ [Search bar - conditional]          │
├─────────────────────────────────────┤
│ 📌 PINNED                           │  ← Section header
│ ┌─────────┐ ┌─────────┐             │
│ │ Note    │ │ Note    │             │  ← 2-column grid
│ │ Card    │ │ Card    │             │
│ └─────────┘ └─────────┘             │
├─────────────────────────────────────┤
│ RECENT                              │
│ ┌─────────┐ ┌─────────┐             │
│ │ Note    │ │ Note    │             │
│ │ Card    │ │ Card    │             │
│ └─────────┘ └─────────┘             │
│ ┌─────────┐ ┌─────────┐             │
│ │ Note    │ │ Note    │             │
│ └─────────┘ └─────────┘             │
├─────────────────────────────────────┤
│                            [+ FAB]  │  ← Floating action button
├─────────────────────────────────────┤
│ [Tab Bar]                           │
└─────────────────────────────────────┘

Grid specs:
- Screen padding: 12px
- Grid gap: 10px
- Item width: (screenWidth - 24 - 10) / 2
- Item aspect ratio: 1:1 (square)

Note card layout:
┌─────────────────────┐
│ [Title]             │
│ [Content preview]   │
│ ...                 │
│ #label1 #label2 +1  │  ← Labels (single row, overflow hidden)
│                  🎬 │  ← Sticker or Icon (50% opacity)
└─────────────────────┘

- Bottom decoration: Shows sticker (if exists) OR preset icon
- Both at 50% opacity, positioned bottom-right
- Labels stay in single row with overflow clipping
```

### Note Editor (`app/note/[id].tsx`)

```
┌─────────────────────────────────────┐
│ [Safe Area Top]                     │
├─────────────────────────────────────┤
│ [←] [BackgroundLayer]   [📌][✨][⋮]│  ← Header with actions
├─────────────────────────────────────┤
│                                     │
│ [Title Input - 24pt bold]           │
│                                     │
│ [Content Input]                     │
│ Start typing... Use # to add labels │
│                                     │
│ [Sticker overlay - if design has]   │
│                                     │
├─────────────────────────────────────┤
│ [Hashtag pills row - tappable]      │  ← Opens label panel
│ #label1  #label2  + Add label       │
├─────────────────────────────────────┤
│ Edited [timestamp]                  │  ← Bottom info bar
└─────────────────────────────────────┘

Hashtag Autocomplete Panel (shoujo style):
┌─────────────────────────────────────┐
│ ✿ Update Label                [✕]  │
├─────────────────────────────────────┤
│ # [Type label name...]        [Add] │
├─────────────────────────────────────┤
│ CURRENT LABELS                      │
│ #label1 [✕]  #label2 [✕]           │
├─────────────────────────────────────┤
│ ✦ Create #newlabel                  │  ← If typing new
├─────────────────────────────────────┤
│ SUGGESTED                           │
│ #todo  #reading  #ideas  ...        │  ← Colored pills
└─────────────────────────────────────┘
```

### Boards Screen (`app/(tabs)/boards.tsx`)

```
┌─────────────────────────────────────┐
│ [Safe Area Top]                     │
├─────────────────────────────────────┤
│ Boards                              │  ← Header (34pt bold)
│ 5 boards                            │  ← Subtitle
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ # hashtag1                 [3]  │ │  ← Board card header (no icon)
│ │ ┌─────┐ ┌─────┐ ┌─────┐         │ │
│ │ │Note │ │Note │ │Note │         │ │  ← 3 note previews
│ │ └─────┘ └─────┘ └─────┘         │ │
│ │                           🎬    │ │  ← Background icon (50% opacity)
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ # hashtag2                 [7]  │ │
│ │ ...                        📖  │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ [Tab Bar]                           │
└─────────────────────────────────────┘

Board card specs:
- Height: 200px fixed
- Padding: 16px top, 24px horizontal, 30px bottom
- Border radius: 16px
- Note preview: 3 slots with 10px gap
- Background icon: 70px, bottom-right, 50% opacity
```

### Board Detail Screen (`app/board/[hashtag].tsx`)

```
┌─────────────────────────────────────┐
│ [Safe Area Top]                     │
├─────────────────────────────────────┤
│ [←] # important               [2]   │  ← Header (no icon in title)
├─────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐             │
│ │ Note    │ │ Note    │             │  ← 2-column grid
│ │ Card    │ │ Card    │             │
│ └─────────┘ └─────────┘             │
│                                     │
│                              🔥     │  ← Background icon (120px, 50%)
└─────────────────────────────────────┘

Board detail specs:
- Gradient background: headerBg → lighter variant
- Background icon: 120px, bottom: 40px, right: 20px, 50% opacity
- Note grid: 2 columns, 12px padding, 10px gap
```

### Designs Screen (`app/(tabs)/designs.tsx`)

```
┌─────────────────────────────────────┐
│ [Safe Area Top]                     │
├─────────────────────────────────────┤
│ Designs                             │  ← Header (34pt bold)
│ 20 label-based styles for your notes│
├─────────────────────────────────────┤
│ ● PRODUCTIVITY                  [4] │  ← Category header
│ ┌──────────────┐ ┌──────────────┐   │
│ │[Color bar]   │ │[Color bar]   │   │
│ │ ☑️ Todo      │ │ ⭐ Important │   │
│ │ Tasks &...   │ │ Priority...  │   │
│ │ [sans-serif] │ │ [display]    │   │
│ │ [energetic]  │ │ [bold]       │   │
│ └──────────────┘ └──────────────┘   │
│                                     │
│ ● READING                       [4] │
│ ...                                 │
├─────────────────────────────────────┤
│ [Tab Bar]                           │
└─────────────────────────────────────┘

Design card specs:
- Width: 47% of screen
- Border radius: 16px
- Color bar: 6px height at top
- Padding: 14px
```

### Settings Screen (`app/(tabs)/settings.tsx`)

```
┌─────────────────────────────────────┐
│ [Safe Area Top]                     │
├─────────────────────────────────────┤
│ Settings                            │  ← Header (34pt bold)
├─────────────────────────────────────┤
│ ACCOUNT                             │
│ ┌─────────────────────────────────┐ │
│ │ [🪙] Coins              100  [>]│ │
│ └─────────────────────────────────┘ │
│                                     │
│ AI CONFIGURATION                    │
│ ┌─────────────────────────────────┐ │
│ │ [🔑] Gemini API Key  AIza... [>]│ │
│ └─────────────────────────────────┘ │
│                                     │
│ APPEARANCE                          │
│ ┌─────────────────────────────────┐ │
│ │ [🌙] Dark Mode          [Toggle]│ │
│ └─────────────────────────────────┘ │
│                                     │
│ NOTES                               │
│ ┌─────────────────────────────────┐ │
│ │ [📦] Archive               2 [>]│ │
│ ├─────────────────────────────────┤ │
│ │ [🗑️] Trash                 5 [>]│ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ [Tab Bar]                           │
└─────────────────────────────────────┘

Setting row specs:
- Icon container: 32x32px, 8px border radius
- Font size: 17px (iOS body)
- Row padding: 16px horizontal, 12px vertical
```

---

## Design System

### Color Palette

#### Light Mode (SystemColors)

| Token | Value | Usage |
|-------|-------|-------|
| `backgroundPrimary` | #FFFFFF | Main screen background |
| `backgroundSecondary` | #F2F2F7 | Grouped background (iOS style) |
| `surfaceCard` | #FFFFFF | Card backgrounds |
| `textPrimary` | #000000 | Primary text |
| `textSecondary` | #8E8E93 | Secondary labels |
| `textTertiary` | #C7C7CC | Placeholder text |
| `accent` | #7C3AED | Primary purple brand |
| `accentLight` | #A78BFA | Lighter purple variant |
| `separator` | rgba(60,60,67,0.12) | iOS separator |
| `border` | #E5E5EA | Border color |

#### Dark Mode (DarkModeColors)

| Token | Value | Usage |
|-------|-------|-------|
| `backgroundPrimary` | #000000 | Main background |
| `backgroundSecondary` | #1C1C1E | Grouped background |
| `surfaceCard` | #1C1C1E | Card backgrounds |
| `textPrimary` | #FFFFFF | Primary text |
| `textSecondary` | #8E8E93 | Secondary labels |
| `accent` | #A78BFA | Lighter purple for dark mode |
| `separator` | rgba(84,84,88,0.65) | iOS dark separator |

#### Note Colors

| Name | Hex | Purpose |
|------|-----|---------|
| White | #FFFFFF | Default |
| Lavender | #EDE9FE | Purple tint |
| Rose | #FFE4E6 | Pink tint |
| Peach | #FED7AA | Orange tint |
| Mint | #D1FAE5 | Green tint |
| Sky | #E0F2FE | Blue tint |
| Violet | #DDD6FE | Deep purple |

#### Category Colors (for label presets)

| Category | Color | Hex |
|----------|-------|-----|
| Productivity | Coral | #FF6B6B |
| Reading | Purple | #6C5CE7 |
| Creative | Teal | #00CEC9 |
| Content | Blue | #0984E3 |
| Personal | Yellow | #FDCB6E |

### Typography (iOS HIG + Google Fonts)

| Style | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| largeTitle | 34px | 700 | 41px | Screen titles |
| title1 | 28px | 700 | 34px | Section headers |
| title2 | 22px | 700 | 28px | Subsections |
| headline | 17px | 600 | 22px | Card titles |
| body | 17px | 400 | 22px | Body text |
| subhead | 15px | 400 | 20px | Secondary text |
| footnote | 13px | 400 | 18px | Small labels |
| caption1 | 12px | 400 | 16px | Badges |
| caption2 | 11px | 400 | 13px | Tags |

#### Google Fonts by Label Preset

Each of the 20 label presets has unique font pairings loaded via `@expo-google-fonts`:

| Category | Font Families |
|----------|---------------|
| Sans-serif | Inter, Poppins, Nunito |
| Serif | Playfair Display, Lora, Merriweather |
| Display | Outfit, Bebas Neue, Righteous |
| Handwritten | Caveat, Dancing Script, Pacifico, Indie Flower |
| Mono | JetBrains Mono, Fira Code |

Preset font mappings (defined in `constants/fonts.ts`):
- `todo` → Inter
- `important` → Outfit
- `reading` → Playfair Display
- `journal` → Pacifico + Caveat
- `theory` → JetBrains Mono
- etc.

Fonts are loaded via `useFontsLoaded()` context with system font fallbacks during loading.

### Spacing

| Token | Value | Usage |
|-------|-------|-------|
| xs | 8px | Tight spacing |
| sm | 12px | Small gaps |
| md | 16px | Standard padding |
| lg | 20px | Section spacing |
| xl | 24px | Large gaps |
| cardPadding | 16px | Inside cards |
| screenMargin | 16px | Screen edges |
| gridGutter | 12px | Grid gaps |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| Card | 16px | Note cards, board cards |
| Button | 12px | Buttons |
| Tag | 8-14px | Label pills |
| Full | 9999px | FAB, circular buttons |

### Shadows (iOS style)

```typescript
// Light shadow for cards
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.06,
shadowRadius: 8,
elevation: 2

// Elevated shadow for modals/FAB
shadowColor: '#8B5CF6',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.35,
shadowRadius: 12,
elevation: 8
```

---

## UX Issues & Suggested Fixes

### Critical Issues

#### 1. ~~Archive/Trash Screens Use Hardcoded Colors~~ ✅ FIXED
**Location:** `app/archive.tsx`, `app/trash.tsx`

**Status:** Fixed - Now uses theme colors via `useTheme()` hook.

---

#### 2. ~~Design Create Screen Missing Dark Mode Support~~ ✅ FIXED
**Location:** `app/design/create.tsx`

**Status:** Fixed - Full dark mode support added throughout the design creation flow.

---

#### 3. Inconsistent Header Styling
**Issue:** Different screens use different header implementations:
- Notes: Custom header with search toggle
- Boards: StyleSheet-based header
- Designs: Mix of Tailwind and inline styles
- Settings: Tailwind classes

**Suggested Fix:** Create a reusable `ScreenHeader` component:
```typescript
// components/ScreenHeader.tsx
export function ScreenHeader({ title, subtitle, rightAction }) {
  const { colors } = useTheme();
  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      {rightAction}
    </View>
  );
}
```

---

### Medium Issues

#### 4. No Visual Feedback on Note Save
**Location:** `app/note/[id].tsx:163-168`

**Issue:** Notes auto-save after 500ms debounce, but users have no visual confirmation. They may not trust that changes are saved.

**Suggested Fix:** Add a subtle "Saved" indicator that appears briefly after save:
```typescript
// In bottom info bar
<Text>
  {isSaved ? '✓ Saved' : 'Saving...'} • Edited {timestamp}
</Text>
```

---

#### 5. Empty State Inconsistency
**Issue:** Empty states across screens have different visual styles:
- Notes: Icon in circle + text
- Boards: Hash icon + text
- Archive/Trash: Just icon + text (no circle background)

**Suggested Fix:** Create a reusable `EmptyState` component with consistent styling:
```typescript
<EmptyState
  icon={<Archive size={48} />}
  title="No archived notes"
  description="Notes you archive will appear here"
/>
```

---

#### 6. Tab Bar Height Hard-coded
**Location:** `app/(tabs)/_layout.tsx:45-48`

**Issue:** Tab bar height is hardcoded to 85px with 28px bottom padding. This may not adapt well to all device sizes.

**Current:**
```typescript
tabBarStyle: {
  height: 85,
  paddingBottom: 28,
}
```

**Suggested Fix:** Use `useSafeAreaInsets()` for dynamic bottom padding.

---

#### 7. ~~Note Card Labels Truncation~~ ✅ FIXED
**Location:** `components/notes/NoteCard.tsx`

**Status:** Fixed - Labels now stay in a single row with `flexWrap: 'nowrap'` and `overflow: 'hidden'`. Overflow is clipped instead of wrapping to multiple lines.

---

### Minor Issues

#### 8. Hashtag Panel Uses Pink Colors in Header (Inconsistent)
**Location:** `app/note/[id].tsx:604-607`

**Issue:** The "Update Label" panel header uses pink border colors while the actual panel uses green (shoujo) theme. This creates visual inconsistency.

**Current:**
```typescript
borderBottomColor: isDark
  ? 'rgba(255, 182, 193, 0.15)'  // Pink
  : 'rgba(255, 105, 180, 0.15)', // Pink
```

**Suggested Fix:** Use consistent green colors from SHOUJO_HASHTAG_COLORS.

---

#### 9. ~~Board Card Star Decoration Hardcoded~~ ✅ FIXED
**Location:** `components/boards/BoardCard.tsx`

**Status:** Fixed - Board cards now show the preset's emoji icon as a large (70px) background decoration at bottom-right with 50% opacity. Small header icon was removed.

---

#### 10. Design Picker Modal Scrolling Area
**Location:** `app/note/[id].tsx:1046-1458`

**Issue:** The design picker modal is very tall with many sections. On smaller devices, users may not realize they can scroll to see all options.

**Suggested Fix:** Add section collapse/expand or tabs for organization:
- Tab 1: Colors & Labels
- Tab 2: All Presets
- Tab 3: My Designs

---

#### 11. No Haptic Feedback
**Issue:** The app lacks haptic feedback on interactions like:
- FAB press
- Toggle switches
- Note deletion
- Design application

**Suggested Fix:** Add `expo-haptics` for tactile feedback:
```typescript
import * as Haptics from 'expo-haptics';

const handleCreateNote = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  // ... rest of logic
};
```

---

#### 12. Search Not Persisted
**Location:** `app/(tabs)/index.tsx:33`

**Issue:** Search query is local state and clears when navigating away.

**Suggested Fix:** For complex use cases, consider persisting search query in Zustand store, though for a note app this may be intentional behavior.

---

### Accessibility Issues

#### 13. Missing Accessibility Labels
**Issue:** Many interactive elements lack `accessibilityLabel` props:
- FAB button
- Icon-only buttons (pin, sparkle, menu)
- Color picker circles

**Suggested Fix:**
```typescript
<TouchableOpacity
  accessibilityLabel="Create new note"
  accessibilityRole="button"
>
  <Plus />
</TouchableOpacity>
```

---

#### 14. Color Contrast in Label Pills
**Issue:** Some label preset colors may not have sufficient contrast, especially:
- Light yellow backgrounds with light text
- Pastel backgrounds in dark mode

**Suggested Fix:** Audit all 20 presets for WCAG AA contrast ratios (4.5:1 for text).

---

### Performance Considerations

#### 15. FlatList getItemLayout Calculation
**Location:** `app/(tabs)/index.tsx:240-244`

**Issue:** `getItemLayout` uses `Math.floor(index / 2)` which is correct for 2-column grid but assumes all items have same height.

**Current calculation works correctly** but should be documented as requiring square aspect ratio cards.

---

#### 16. Design Picker Renders All Presets
**Location:** `app/note/[id].tsx:1324-1385`

**Issue:** All 20 label presets are rendered in a horizontal ScrollView. Could use `FlatList` with lazy rendering for better performance.

**Suggested Fix:** Convert to `FlatList` with horizontal mode:
```typescript
<FlatList
  horizontal
  data={LABEL_PRESET_LIST}
  renderItem={...}
  initialNumToRender={5}
  maxToRenderPerBatch={5}
/>
```

---

## Summary

### Completed Fixes ✅

| Issue | Status |
|-------|--------|
| Dark mode in design/create.tsx | ✅ Fixed |
| Hardcoded colors in archive/trash | ✅ Fixed |
| Board card decoration | ✅ Fixed - Background icon at bottom-right |
| Note card labels overflow | ✅ Fixed - Single row with overflow hidden |
| Google Fonts integration | ✅ Added - 15 font families for 20 presets |

### Remaining Priority Matrix

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| Medium | No save indicator | Low | Medium |
| Medium | Empty state inconsistency | Low | Low |
| Medium | Haptic feedback | Low | Medium |
| Low | Header component standardization | Medium | Low |
| Low | Tab bar dynamic height | Low | Low |
| Low | Hashtag panel color inconsistency | Low | Low |

### Recommended Next Steps

1. **Short-term:** Add save indicator to note editor
2. **Short-term:** Create reusable EmptyState component
3. **Medium-term:** Add haptic feedback throughout app
4. **Medium-term:** Standardize header component

---

*Last updated: December 2024*
*Recent updates: Google Fonts integration, Board/NoteCard icon improvements, dark mode fixes*
