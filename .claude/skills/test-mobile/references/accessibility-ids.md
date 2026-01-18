# Accessibility ID Reference

Map of component accessibility labels used for Maestro testing in ToonNotes.

> **Note**: This document includes both documented accessibility labels AND verified working selectors from actual Maestro testing (January 2026).

---

## Verified Working Selectors

These selectors have been tested and confirmed working with Maestro 2.1.0:

| Screen | Selector | Type | Status |
|--------|----------|------|--------|
| Home | `"Recent"` | Visible text | **VERIFIED** |
| Home | `"ToonNotes"` | Logo text | **FAILS** (letters rendered separately) |
| Tab Bar | `"Notes"` | Tab label | Needs verification |
| Tab Bar | `"Boards"` | Tab label | Needs verification |
| Tab Bar | `"Designs"` | Tab label | Needs verification |
| Tab Bar | `"Settings"` | Tab label | Needs verification |
| Home | `id: "Create new note"` | FAB button | Needs verification |

---

## Tab Navigation

| Tab | accessibilityLabel | Screen |
|-----|-------------------|--------|
| Notes tab | `Notes` | Home/Notes list |
| Boards tab | `Boards` | Boards view |
| Designs tab | `Designs` | My Designs |
| Settings tab | `Settings` | Settings |

## Home Screen (`app/(tabs)/index.tsx`)

| Element | accessibilityLabel | accessibilityRole |
|---------|-------------------|-------------------|
| Search button | `Search notes` | button |
| Close search | `Close search` | button |
| Search input | `Search notes` | search |
| Create note FAB | `Create new note` | button |
| Note card | (dynamic based on title) | button |

## Note Editor (`app/note/[id].tsx`)

| Element | accessibilityLabel | accessibilityRole |
|---------|-------------------|-------------------|
| Title input | `Note title` | none (text input) |
| Content input | `Note content` | none (text input) |
| Back button | `Go back` | button |
| Toolbar | `Editor toolbar` | toolbar |
| Checklist toggle | `Toggle checklist mode` | button |
| Bullet toggle | `Toggle bullet mode` | button |
| Color picker | `Change note color` | button |
| Design picker | `Apply design` | button |

## Boards Screen (`app/(tabs)/boards.tsx`)

| Element | accessibilityLabel | accessibilityRole |
|---------|-------------------|-------------------|
| Board card | `BoardCard` | button |
| Create board | `Create new board` | button |
| Empty state | `Create your first board` | text |

## Designs Screen (`app/(tabs)/designs.tsx`)

| Element | accessibilityLabel | accessibilityRole |
|---------|-------------------|-------------------|
| Design card | `DesignCard` | button |
| Create design | `Create new design` | button |

## Settings Screen (`app/(tabs)/settings.tsx`)

| Element | accessibilityLabel | accessibilityRole |
|---------|-------------------|-------------------|
| Dark mode toggle | `Dark Mode` | switch |
| Sign in button | `Sign In` | button |
| Sign out button | `Sign Out` | button |
| Account section | `Account` | none |
| Appearance section | `Appearance` | none |

## Auth Screen (`app/auth/index.tsx`)

| Element | accessibilityLabel | accessibilityRole |
|---------|-------------------|-------------------|
| Google sign in | `Continue with Google` | button |
| Apple sign in | `Continue with Apple` | button |
| Skip button | `Skip for now` | button |

## Common Components

### NoteCard (`components/notes/NoteCard.tsx`)

```tsx
accessibilityLabel={note.title || "Untitled note"}
accessibilityRole="button"
accessibilityHint="Opens note for editing"
```

### BoardCard (`components/boards/BoardCard.tsx`)

```tsx
accessibilityLabel="BoardCard"
accessibilityRole="button"
accessibilityHint="Opens board detail"
```

## Adding New Accessibility Labels

When adding new interactive components, include accessibility props:

```tsx
<TouchableOpacity
  accessibilityLabel="Action description"
  accessibilityRole="button"
  accessibilityHint="What happens when tapped"
  accessible={true}
>
  {/* content */}
</TouchableOpacity>
```

### Best Practices

1. **Use descriptive labels**: "Create new note" not "FAB" or "Plus button"
2. **Include hints for complex actions**: Explain what happens on tap
3. **Use correct roles**: `button`, `link`, `search`, `switch`, `text`, etc.
4. **Test with VoiceOver/TalkBack**: Ensure labels make sense when read aloud
5. **Keep labels concise**: 2-4 words is ideal

### Roles Reference

| Role | Use For |
|------|---------|
| `button` | Clickable elements that perform an action |
| `link` | Navigation to another screen or URL |
| `search` | Search input fields |
| `switch` | Toggle controls |
| `text` | Static text (usually not needed) |
| `header` | Section headers |
| `image` | Decorative or informative images |

## Testing Accessibility Labels

### In Maestro

```yaml
# By accessibilityLabel (id)
- tapOn:
    id: "Create new note"

# By visible text
- tapOn: "Notes"

# Assert visible
- assertVisible:
    id: "Editor toolbar"
```

### In React Native Debugger

1. Open React Native Debugger
2. Enable "Inspect Element"
3. Check `accessibilityLabel` in element properties

### With Expo

```bash
# Run with accessibility inspector
npx expo start --ios
# Then: Simulator > Accessibility Inspector
```
