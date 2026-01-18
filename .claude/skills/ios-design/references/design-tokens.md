# iOS Design Tokens Reference

Complete design token specifications for ToonNotes following iOS Human Interface Guidelines.

## Spacing Scale

Base unit: **4pt**

| Token | Value | Import | Use Case |
|-------|-------|--------|----------|
| xxxs | 2pt | `Spacing.xxxs` | Fine adjustments |
| xxs | 4pt | `Spacing.xxs` | Icon internal spacing |
| xs | 8pt | `Spacing.xs` | Inline gaps, icon margins |
| sm | 12pt | `Spacing.sm` | Row padding (vertical), item gaps |
| md | 16pt | `Spacing.md` | Card padding, screen margins |
| lg | 20pt | `Spacing.lg` | - |
| xl | 24pt | `Spacing.xl` | Section gaps |
| xxl | 32pt | `Spacing.xxl` | Large section spacing |
| xxxl | 40pt | `Spacing.xxxl` | Extra large gaps |

### Semantic Spacing

| Token | Value | Use |
|-------|-------|-----|
| cardPadding | 16pt | Inside card containers |
| screenMargin | 16pt | Screen edge margins |
| sectionGap | 24pt | Between sections |
| itemGap | 12pt | Between list items |
| inlineGap | 8pt | Between inline elements |
| gridGutter | 12pt | Grid card gaps |

### Common Spacing Patterns

```typescript
// Screen header
paddingHorizontal: 16,  // screenMargin
paddingVertical: 12,    // sm

// Settings row
paddingHorizontal: 16,  // md
paddingVertical: 12,    // sm
minHeight: 44,          // touch target

// Section gap
marginTop: 24,          // xl / sectionGap

// Icon to label
marginLeft: 12,         // sm
```

## Typography Scale

iOS HIG typography with SF Pro (system font) approximation.

### Complete Scale

| Style | Size | Line | Weight | Letter | Use |
|-------|------|------|--------|--------|-----|
| largeTitle | 34pt | 41pt | 700 | 0.37 | Screen titles |
| title1 | 28pt | 34pt | 700 | 0.36 | Modal/sheet headers |
| title2 | 22pt | 28pt | 700 | 0.35 | Card titles |
| title3 | 20pt | 25pt | 600 | 0.38 | Subsection headers |
| headline | 17pt | 22pt | 600 | -0.41 | Row labels, buttons |
| body | 17pt | 22pt | 400 | -0.41 | Primary content |
| callout | 16pt | 21pt | 400 | -0.32 | Callouts |
| subhead | 15pt | 20pt | 400 | -0.24 | Secondary text |
| footnote | 13pt | 18pt | 400 | -0.08 | Footnotes |
| caption1 | 12pt | 16pt | 400 | 0 | Section headers |
| caption2 | 11pt | 13pt | 400 | 0.07 | Badges, small labels |

### Usage Examples

```typescript
import { Typography } from '@/src/theme';

// Use spread operator
<Text style={[Typography.largeTitle, { color: colors.textPrimary }]}>
  Screen Title
</Text>

// Or manual values
const styles = StyleSheet.create({
  title: {
    fontSize: 34,
    fontWeight: '700',
  },
  body: {
    fontSize: 17,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
```

### Section Header Pattern

```typescript
// Settings-style uppercase section headers
const styles = StyleSheet.create({
  header: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 8,
    marginBottom: 8,
    color: colors.textSecondary,
  },
});
```

## Color System

Three-tier architecture: **Scales -> System -> Semantic**

### Brand Colors

| Scale | 500 (Main) | Use |
|-------|------------|-----|
| Teal | #4C9C9B | Primary brand, buttons, links |
| Coral | #FF6B6B | CTAs, highlights, errors |

### Color Scales

**Teal Scale (Primary)**
```
50: #E6F4F4   - Very light backgrounds
100: #C2E4E3  - Light accents
200: #99D1D0  - Hover states
300: #70BFBD  - Secondary elements (dark mode accent)
400: #5CACAB  - Medium tone
500: #4C9C9B  - MAIN - buttons, links
600: #428888  - Pressed states
700: #367272  - Dark accents
800: #2A5B5A  - Headings on light bg
900: #1E4544  - Darkest, text
```

**Coral Scale (Highlight/CTA)**
```
50: #FFF0F0   - Very light backgrounds
100: #FFD6D6  - Light accents
200: #FFB3B3  - Hover states
300: #FF9090  - Secondary highlights (dark mode)
400: #FF7D7D  - Medium tone
500: #FF6B6B  - MAIN - CTA, highlights
600: #E55A5A  - Pressed states
700: #CC4A4A  - Dark accents
800: #B33A3A  - Text on light bg
900: #992A2A  - Darkest
```

**Neutral Scale (Grays)**
```
50: #FAFAF9   - Backgrounds
100: #F5F5F4  - Secondary bg
200: #E7E5E4  - Borders, dividers
300: #D6D3D1  - Disabled states
400: #A8A29E  - Placeholder text
500: #78716C  - Secondary text
600: #57534E  - Body text dark mode
700: #44403C  - Dark surfaces
800: #292524  - Dark bg secondary
900: #1C1917  - Dark bg primary
```

### System Colors (Light Mode)

| Token | Value | Use |
|-------|-------|-----|
| backgroundPrimary | #FFFFFF | Main background |
| backgroundSecondary | #FAFAF9 | Screen backgrounds |
| surfaceCard | #FFFFFF | Card backgrounds |
| textPrimary | #1C1917 | Main text |
| textSecondary | #78716C | Secondary text, labels |
| textTertiary | #A8A29E | Placeholder, disabled |
| separator | rgba(28,25,23,0.08) | Dividers (8% opacity) |
| border | #E7E5E4 | Input borders |
| accent | #4C9C9B | Brand color |
| highlight | #FF6B6B | CTA color |

### System Colors (Dark Mode)

| Token | Value | Use |
|-------|-------|-----|
| backgroundPrimary | #1C1917 | Main background |
| backgroundSecondary | #292524 | Screen backgrounds |
| surfaceCard | #292524 | Card backgrounds |
| textPrimary | #FAFAF9 | Main text |
| textSecondary | #A8A29E | Secondary text |
| textTertiary | #78716C | Placeholder, disabled |
| separator | rgba(250,250,249,0.1) | Dividers (10% opacity) |
| accent | #70BFBD | Brand color (lighter) |
| highlight | #FF9090 | CTA color (lighter) |

### Semantic Colors

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| success | #22C55E | #4ADE80 | Success states |
| warning | #F59E0B | #FBBF24 | Warning states |
| error | #FF6B6B | #FF9090 | Error states |
| info | #4C9C9B | #70BFBD | Info states |

### Usage with Theme Hook

```typescript
import { useTheme } from '@/src/theme';

const { colors, semantic, isDark } = useTheme();

<View style={{ backgroundColor: colors.backgroundSecondary }}>
  <Text style={{ color: colors.textPrimary }}>Primary text</Text>
  <Text style={{ color: colors.textSecondary }}>Secondary text</Text>
</View>

// Semantic colors for feedback
<Text style={{ color: semantic.error }}>Error message</Text>
<Text style={{ color: semantic.success }}>Success message</Text>
```

## Effects

### Border Radius

| Token | Value | Use |
|-------|-------|-----|
| none | 0pt | - |
| xs | 4pt | Small pills |
| sm | 8pt | Tags, icon containers |
| md | 12pt | Cards, buttons |
| lg | 16pt | Large cards |
| xl | 20pt | Bottom sheets |
| full | 9999pt | Circles, pills |

**Semantic:**
| Token | Value | Use |
|-------|-------|-----|
| card | 16pt | Note cards |
| button | 12pt | Buttons |
| input | 10pt | Text inputs |
| tag | 8pt | Tags, badges |
| thumbnail | 8pt | Thumbnails |
| sheet | 20pt | Bottom sheets |

### Shadows

| Level | Offset | Opacity | Radius | Elevation | Use |
|-------|--------|---------|--------|-----------|-----|
| none | 0, 0 | 0 | 0 | 0 | - |
| sm | 0, 1 | 0.05 | 2pt | 1 | Subtle elevation |
| md | 0, 2 | 0.08 | 8pt | 3 | General cards |
| lg | 0, 4 | 0.12 | 16pt | 6 | Modals |
| card | 0, 2 | 0.06 | 8pt | 2 | Note cards |
| elevated | 0, 8 | 0.15 | 24pt | 8 | Bottom sheets |

```typescript
// Card shadow pattern
{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,  // Android
}
```

## Icon Patterns

### Icon Container

```typescript
// Settings row icon container
const styles = StyleSheet.create({
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${iconColor}26`, // 15% opacity
  },
});
```

### Icon Sizes by Context

| Context | Size | Weight |
|---------|------|--------|
| Settings row | 20pt | regular |
| Tab bar (inactive) | 24pt | regular |
| Tab bar (active) | 24pt | fill |
| FAB | 28pt | bold |
| Empty state | 40pt | regular |
| Search input | 17pt | regular |
| Chevron accessory | 16pt | regular |

## Touch Target Requirements

| Element Type | Minimum | Recommended |
|--------------|---------|-------------|
| Row/List item | 44pt height | 48pt height |
| Button | 44pt height | 48pt height |
| Icon button | 44x44pt | Use hitSlop |
| FAB | 56x56pt | - |
| Tab bar item | 44pt | Full tab width |

```typescript
// Ensure touch target compliance
const styles = StyleSheet.create({
  row: {
    minHeight: 44,  // NOT height: 44
  },
});

// For small visual elements
<TouchableOpacity
  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
>
  <Icon size={16} />
</TouchableOpacity>
```
