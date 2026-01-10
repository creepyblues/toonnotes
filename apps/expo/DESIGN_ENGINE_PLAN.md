# Design Engine Implementation Plan

## Current State

The Expo app has:
- `NoteDesign` type with colors, background, border, typography, sticker
- `DesignViewContext` type defined: `'grid' | 'list' | 'detail' | 'share'`
- No central engine to compose styles based on context
- `NoteCard.tsx` ignores designs (only uses basic `note.color`)
- `[id].tsx` manually extracts colors from design

## Goal

Create a **DesignEngine** service that generates view-ready styles adapted to each display context, similar to the iOS implementation.

---

## Architecture

### 1. ComposedStyle Interface

View-ready styling output from DesignEngine:

```typescript
interface ComposedStyle {
  // Colors
  backgroundColor: string;
  titleColor: string;
  bodyColor: string;
  accentColor: string;
  borderColor: string;

  // Border
  borderWidth: number;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  borderRadius: number;

  // Effects
  shadowRadius: number;
  shadowOpacity: number;
  showBorder: boolean;

  // Sticker (only in detail/share)
  showSticker: boolean;
  stickerScale: number;
  stickerPosition: StickerPosition;
}
```

### 2. Context-Specific Rendering Rules

| Property | Grid | List | Detail | Share |
|----------|------|------|--------|-------|
| Border width | thin (1px) | none | full | full |
| Shadow | subtle | none | medium | strong |
| Border radius | 12px | 8px | 16px | 16px |
| Sticker | hidden | hidden | visible | visible |
| Sticker scale | - | - | 1.0 | 1.2 |

### 3. DesignEngine Service

```
services/
└── designEngine.ts
```

**Functions:**

```typescript
// Main composition function
composeStyle(
  design: NoteDesign | null,
  fallbackColor: NoteColor,
  context: DesignViewContext,
  isDark: boolean
): ComposedStyle

// Helper for notes without designs
composeBasicStyle(
  color: NoteColor,
  context: DesignViewContext,
  isDark: boolean
): ComposedStyle
```

---

## Implementation Steps

### Step 1: Create Types (types/design.ts)

- [ ] Add `ComposedStyle` interface
- [ ] Add `BorderStyleConfig` for border rendering
- [ ] Update `DesignViewContext` if needed

### Step 2: Create DesignEngine Service (services/designEngine.ts)

- [ ] Implement `composeStyle()` function
- [ ] Implement `composeBasicStyle()` for fallback
- [ ] Add context-specific rule maps
- [ ] Handle dark mode color adjustments

### Step 3: Create Styled Components (components/design/)

- [ ] `StyledNoteContainer.tsx` - Applies ComposedStyle to note wrapper
- [ ] `StyledBorder.tsx` - Renders border based on template (panel, webtoon, sketch, etc.)
- [ ] `StickerOverlay.tsx` - Positions sticker based on design

### Step 4: Update NoteCard.tsx

- [ ] Import and use DesignEngine
- [ ] Pass `context: 'grid'` or `'list'`
- [ ] Apply ComposedStyle to card
- [ ] Show design preview colors

### Step 5: Update Note Editor ([id].tsx)

- [ ] Use DesignEngine with `context: 'detail'`
- [ ] Show sticker overlay when design has sticker
- [ ] Apply full border styling

### Step 6: Add Share View (Future)

- [ ] Use `context: 'share'` for export
- [ ] Higher resolution sticker
- [ ] Stronger shadows for depth

---

## Pre-defined Border Templates

Reference: `toonnotes-design-preview.html` contains CSS implementations.

### Panel Styles (Classic Comic/Manga)

| Template | CSS Implementation | Thickness Variants |
|----------|-------------------|-------------------|
| `panel` | `border: 3px solid #1a1a1a; border-radius: 0;` | thin: 2px, medium: 3px, thick: 5px |
| `webtoon` | `border: 1px solid rgba(0,0,0,0.15); border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);` | Varies shadow intensity |
| `sketch` | `border: 2px solid; border-radius: 255px 15px 225px 15px/15px 225px 15px 255px;` + inner pseudo-border | thin: 1px, medium: 2px, thick: 3px |

### Shoujo/Romance

| Template | CSS Implementation |
|----------|-------------------|
| `shoujo` | `border: 2px solid; border-radius: 20px; box-shadow: 0 0 20px rgba(255,182,193,0.4);` + flower (✿) and sparkle (✧) decorations |
| `vintage_manga` | `border: 3px solid #2a2a2a; box-shadow: 4px 4px 0 rgba(0,0,0,0.2);` + dashed inset |
| `watercolor` | No border, `box-shadow: inset 0 0 30px rgba(255,255,255,0.5);` + blurred pseudo-element |

### Chibi/Fun

| Template | CSS Implementation |
|----------|-------------------|
| `speech_bubble` | `border: 3px solid #1a1a1a; border-radius: 24px;` + triangle tail via ::after |
| `pop` | `border: 4px solid #1a1a1a; box-shadow: 6px 6px 0 #1a1a1a;` + halftone dot overlay |
| `sticker` | `border: 4px solid #ffffff; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.25);` |

### Action/Shonen

| Template | CSS Implementation |
|----------|-------------------|
| `speed_lines` | `border: 3px solid;` + motion line pseudo-elements extending right |
| `impact` | `border: 4px solid;` + jagged clip-path polygon |
| `ink_splash` | Multiple box-shadows creating brush stroke effect + ink dot pseudo-elements |

### React Native Implementation Strategy

**Phase 1 - Core Borders (MVP):**
- `panel`, `webtoon`, `sticker`, `pop` - Pure View styles (border, shadow, radius)

**Phase 2 - Decorative Borders:**
- `shoujo`, `sketch` - Add emoji/character decorations via positioned Text
- `speech_bubble` - Triangle tail via rotated View or SVG

**Phase 3 - Complex Borders:**
- `speed_lines`, `impact`, `ink_splash` - Require react-native-svg for full effect
- `watercolor` - Blur effect via expo-blur or image overlay

---

## File Structure After Implementation

```
ToonNotes_Expo/
├── services/
│   ├── geminiService.ts
│   └── designEngine.ts        # NEW
├── components/
│   ├── design/                 # NEW
│   │   ├── StyledNoteContainer.tsx
│   │   ├── StyledBorder.tsx
│   │   └── StickerOverlay.tsx
│   └── notes/
│       └── NoteCard.tsx        # UPDATED
├── types/
│   └── index.ts                # UPDATED (ComposedStyle)
```

---

## Usage Example

```tsx
// In NoteCard.tsx
import { composeStyle } from '@/services/designEngine';

function NoteCard({ note, context = 'grid', isDark }) {
  const design = note.designId ? getDesignById(note.designId) : null;
  const style = composeStyle(design, note.color, context, isDark);

  return (
    <StyledNoteContainer style={style}>
      <Text style={{ color: style.titleColor }}>{note.title}</Text>
      <Text style={{ color: style.bodyColor }}>{note.content}</Text>
    </StyledNoteContainer>
  );
}
```

---

## Priority Order

1. **High:** DesignEngine service + ComposedStyle types
2. **High:** Update NoteCard to show design colors in grid
3. **Medium:** Full border styling in detail view
4. **Medium:** Sticker overlay in detail view
5. **Low:** Decorative borders (SVG-based)
6. **Low:** Share context with export functionality
