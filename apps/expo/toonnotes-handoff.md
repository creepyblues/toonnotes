# ToonNotes - Project Handoff Document

> **Purpose**: This document captures all decisions and context from initial planning conversations. Use this as the foundation for continued development in Claude Code.

---

## Project Overview

**ToonNotes** is a Google Keep-style mobile note-taking app designed for webtoon/anime fans. The key differentiator is AI-powered custom note designs generated from uploaded images (webtoon panels, anime screenshots, etc.).

### Target User
- Primary: Webtoon and anime fans
- Secondary: Anyone who wants aesthetically customized notes

### Business Model
- Free: Basic note-taking + 1 custom design
- Paid: Coin-based purchases for additional custom designs
- Future: Potential subscription model, premium pre-made designs

---

## Technical Stack (Decided)

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | Expo (React Native) + TypeScript | Cross-platform optionality, React familiarity, faster iteration |
| UI Library | TBD (Tamagui or NativeWind recommended) | - |
| State | Zustand + AsyncStorage | Local-first architecture |
| Rich Text | TBD (react-native-pell-rich-editor or custom) | - |
| Backend | Supabase | Auth + future multi-device sync |
| Payments | RevenueCat | Handles iOS IAP complexity |
| AI - Analysis | Gemini API (gemini-1.5-pro or flash) | Image analysis for design extraction |
| AI - Stickers | Gemini Imagen 3 | Character sticker generation |

### Architecture Principles
- **Local-first**: Notes stored on device, no account required initially
- **Single device for v1**: Multi-device sync is future scope
- **iOS primary**: Android/web are future considerations

---

## Core Features (v1 Scope)

### Note Management
- [x] Create, edit, delete notes
- [x] Basic formatting: H1, H2, Bold, Italic, Underline, Strikethrough, Text color
- [x] Undo/redo
- [x] Labels via #hashtag (inline creation, like Keep)
- [x] Label list in left panel/drawer
- [x] Pin notes (appear at top)
- [x] Archive notes
- [x] Note background color picker (standard Keep colors)
- [x] Full-text search across notes

### Custom Design Feature (Core Differentiator)
- [x] Upload image to create custom design
- [x] AI analyzes image → generates design system
- [x] AI generates character stickers from image
- [x] 1 free design, additional designs cost coins
- [x] "My Designs" gallery to view/manage saved designs
- [x] Apply design to any note

### Sharing
- [x] Share note as image (square 1080x1080 or full-length)
- [ ] Share note as web link (future scope)

### NOT in v1
- No image/drawing in notes
- No collaborators
- No web app
- No multi-device sync
- No Android

---

## Design Decomposition Engine

This is the AI system that converts an uploaded image into a reusable note design.

### Pipeline

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  User uploads   │────▶│  Gemini Vision   │────▶│  Design JSON    │
│  image          │     │  analyzes image  │     │  (colors, mood, │
└─────────────────┘     └──────────────────┘     │  border, etc.)  │
                                                  └────────┬────────┘
                                                           │
                                                           ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Final design   │◀────│  Gemini Imagen 3 │◀────│  Character      │
│  ready to use   │     │  generates       │     │  descriptions   │
└─────────────────┘     │  stickers        │     │  from step 1    │
                        └──────────────────┘     └─────────────────┘
```

### Design System Output Schema

```typescript
interface NoteDesign {
  id: string;
  name: string;
  sourceImageUri: string; // Original uploaded image
  createdAt: Date;
  
  background: {
    primaryColor: string;      // Hex
    secondaryColor?: string;   // For gradients
    style: 'solid' | 'gradient';
  };
  
  colors: {
    titleText: string;
    bodyText: string;
    accent: string;           // For highlights, links, tags
    border: string;
  };
  
  border: {
    template: BorderTemplate;  // See border templates below
    thickness: 'thin' | 'medium' | 'thick';
  };
  
  typography: {
    titleStyle: 'serif' | 'sans-serif' | 'handwritten';
    vibe: 'modern' | 'classic' | 'cute' | 'dramatic';
  };
  
  mood: {
    tone: 'playful' | 'elegant' | 'dark' | 'warm' | 'cool' | 'energetic';
    theme: string;  // e.g., "romance", "action", "fantasy"
  };
  
  characters: CharacterSticker[];
  
  designSummary: string;  // AI-generated description
}

interface CharacterSticker {
  id: string;
  imageUri: string;         // Generated sticker image
  description: string;      // What it depicts
  suggestedPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  scale: 'small' | 'medium' | 'large';
}

type BorderTemplate =
  // Panel Styles (Classic Comic/Manga)
  | 'panel'           // Bold black border, sharp corners
  | 'webtoon'         // Clean minimal, modern vertical-scroll style
  | 'sketch'          // Hand-drawn storyboard feel
  // Shoujo / Romance
  | 'shoujo'          // Soft glow with flower & sparkle accents
  | 'vintage_manga'   // Retro 80s/90s manga with offset shadow
  | 'watercolor'      // Dreamy bleed effect
  // Chibi / Fun
  | 'speech_bubble'   // Comic dialogue bubble with tail
  | 'pop'             // Bold offset shadow + halftone dots
  | 'sticker'         // White outline + drop shadow (die-cut look)
  // Action / Shonen
  | 'speed_lines'     // Motion lines shooting off edge
  | 'impact'          // Jagged explosive frame
  | 'ink_splash';     // Brush stroke with ink splatters
```

### Design Adaptation Rules

The same design must render correctly across different contexts:

| Context | Size | What's Visible |
|---------|------|----------------|
| Grid view | 150×150pt | Background + border only, characters hidden |
| List view | Full width × 80pt | Background + border + 1 small character in corner |
| Detail view | Full screen, variable height | Full design, all characters visible |
| Share (square) | 1080×1080px | Full design, characters prominent, "ToonNotes" watermark |
| Share (full) | 1080×variable | Full design, full note content |

### Gemini Prompt (Current Version)

```
Analyze this image and extract a "note design system" for a mobile note-taking app.

The design must work across different note sizes:
- Small thumbnail (150x150px): only background + border visible
- List view (350x80px): background + border + tiny character corner
- Full detail (full screen): all elements visible
- Share export (1080x1080px): full design, character prominent

Return ONLY valid JSON (no markdown, no explanation):
{
  "background": {
    "primary_color": "#hex",
    "secondary_color": "#hex or null",
    "style": "solid | gradient"
  },
  "colors": {
    "title_text": "#hex",
    "body_text": "#hex",
    "accent": "#hex",
    "border": "#hex"
  },
  "border": {
    "template": "panel | webtoon | sketch | shoujo | vintage_manga | watercolor | speech_bubble | pop | sticker | speed_lines | impact | ink_splash",
    "thickness": "thin | medium | thick"
  },
  "typography": {
    "title_style": "serif | sans-serif | handwritten",
    "vibe": "modern | classic | cute | dramatic"
  },
  "mood": {
    "tone": "playful | elegant | dark | warm | cool | energetic",
    "theme": "one word like fantasy, romance, action"
  },
  "characters": [
    {
      "description": "detailed description of character/element to generate as sticker",
      "suggested_position": "top-right | bottom-right | bottom-left | top-left",
      "scale": "small | medium | large"
    }
  ],
  "design_summary": "1-2 sentence description of the overall aesthetic"
}
```

---

## Border Templates (12 Total)

Comic/webtoon/storyboard inspired borders. Each template takes `color` and `thickness` as parameters. See `toonnotes-design-preview.html` for live demos.

### Panel Styles (Classic Comic/Manga)
1. **panel** - Bold black border, sharp corners. Classic manga panel frame.
2. **webtoon** - Clean minimal border with subtle shadow. Modern vertical-scroll aesthetic.
3. **sketch** - Hand-drawn storyboard feel with rough pencil-like edges.

### Shoujo / Romance
4. **shoujo** - Soft rounded corners with pink glow, flower & sparkle decorations.
5. **vintage_manga** - Retro 80s/90s manga style with offset shadow and dashed inset.
6. **watercolor** - Dreamy bleed effect with soft blurred edges.

### Chibi / Fun
7. **speech_bubble** - Comic dialogue bubble with tail pointer.
8. **pop** - Bold offset shadow + halftone dot pattern. American comics/pop art style.
9. **sticker** - White outline + drop shadow, die-cut look for chibi characters.

### Action / Shonen
10. **speed_lines** - Motion lines shooting off the right edge. For action moments.
11. **impact** - Jagged explosive frame with clip-path. Dramatic shonen style.
12. **ink_splash** - Brush stroke border with ink splatter accents.

---

## Coin Economy (Needs Further Design)

### Current Thinking
- 1 custom design = 1 coin (tentative)
- First design is free
- Failed generation still costs coin (one-shot, no retries without payment)

### Open Questions
- Coin pack pricing (e.g., 5 coins for $2.99, 15 for $6.99?)
- Should pre-made designs cost coins or be free?
- Subscription alternative: X coins per month?

### Future Coin Uses (Expansion)
- Premium border templates
- Premium pre-made designs (official IP partnerships)
- Additional character stickers for existing design
- Higher resolution exports

---

## Character Stickers

### Generation Approach
1. Gemini Vision extracts character descriptions from uploaded image
2. Gemini Imagen 3 generates **1 sticker** per design
3. Stickers have transparent backgrounds
4. Stored as PNG with the design

### Sticker Count Decision: 1 per design
**Rationale:**
- Cleaner visuals across all view contexts (grid, list, detail, share)
- Simpler positioning logic (no collision detection needed)
- Faster generation (1 Imagen 3 call vs multiple)
- Stronger brand identity (one iconic character per design)
- Future upsell opportunity ("add a second sticker" as premium feature)

### Open Question: Sticker Style
Could let user pick style (future consideration):
- Chibi (cute, big-head style)
- Portrait (face/bust only)
- Emoji-style (super simplified)
- Original crop (extract from source)

### Legal Consideration
Since Sungho is working directly with IP owners, sticker generation is legally covered. The app should still:
- Store reference to original source image
- Not allow users to export stickers separately (only as part of note design)
- Include attribution where required by IP agreements

---

## Pre-made Designs

### Vanilla Designs (Free, Built-in)
- 5-10 generic designs that ship with app
- Neutral themes: minimal light, minimal dark, warm paper, cool modern, etc.
- No character stickers (just colors + borders)

### Partner Designs (TBD Pricing)
- Created in partnership with IP owners
- Include official character stickers
- Examples: "Under the Oak Tree" theme, "Solo Leveling" theme
- Could be free (promotional) or premium (coin purchase)

---

## Data Models

```typescript
// Note
interface Note {
  id: string;
  title: string;
  content: string;           // Rich text (format TBD - HTML, Markdown, or custom)
  labels: string[];          // Array of hashtag labels
  color: string;             // Basic background color (Keep-style)
  designId?: string;         // Reference to custom NoteDesign
  isPinned: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Label (derived from notes, not stored separately?)
interface Label {
  name: string;              // Without # prefix
  noteCount: number;         // Computed
}

// User (for future multi-device)
interface User {
  id: string;
  email?: string;
  freeDesignUsed: boolean;
  coinBalance: number;
  createdAt: Date;
}

// Design - see NoteDesign interface above

// Purchase
interface Purchase {
  id: string;
  userId: string;
  productId: string;         // RevenueCat product ID
  coinsGranted: number;
  purchasedAt: Date;
}
```

---

## File Structure (Suggested)

```
toonnotes/
├── app/                     # Expo Router pages
│   ├── (tabs)/
│   │   ├── index.tsx        # Notes list (grid/list view)
│   │   ├── search.tsx       # Search
│   │   └── settings.tsx     # Settings
│   ├── note/
│   │   └── [id].tsx         # Note detail/editor
│   ├── design/
│   │   ├── index.tsx        # My Designs gallery
│   │   ├── create.tsx       # Create new design (upload flow)
│   │   └── [id].tsx         # Design detail
│   └── _layout.tsx
├── components/
│   ├── notes/
│   │   ├── NoteCard.tsx     # Grid/list item
│   │   ├── NoteEditor.tsx   # Rich text editor
│   │   └── NoteDesignRenderer.tsx  # Renders design on note
│   ├── design/
│   │   ├── DesignPreview.tsx
│   │   ├── BorderTemplates.tsx    # All 12 borders
│   │   └── CharacterSticker.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   └── labels/
│       ├── LabelDrawer.tsx
│       └── LabelPill.tsx
├── hooks/
│   ├── useNotes.ts
│   ├── useDesigns.ts
│   ├── useLabels.ts
│   └── useCoins.ts
├── services/
│   ├── gemini.ts            # Gemini API calls
│   ├── storage.ts           # AsyncStorage helpers
│   └── purchases.ts         # RevenueCat integration
├── stores/
│   ├── noteStore.ts         # Zustand store
│   ├── designStore.ts
│   └── userStore.ts
├── utils/
│   ├── colors.ts
│   ├── formatting.ts
│   └── share.ts             # Image export logic
├── constants/
│   ├── borders.ts           # Border template definitions
│   ├── colors.ts            # Keep-style color palette
│   └── designs.ts           # Vanilla pre-made designs
└── types/
    └── index.ts             # All TypeScript interfaces
```

---

## Open Questions / Needs Iteration

### High Priority
1. ~~**Character sticker count per design**~~ - **DECIDED: 1 sticker per design**
2. **Coin pricing** - Research competitor pricing, test willingness to pay
3. **Gemini prompt refinement** - Test with more images, iterate on output quality

### Medium Priority
4. **Rich text format** - HTML, Markdown, or custom JSON?
5. ~~**Border template SVGs**~~ - **DONE: 12 templates implemented in CSS** (see `toonnotes-design-preview.html`)
6. **Sticker generation prompt** - Iterate for consistent chibi/sticker style

### Lower Priority (Post-v1)
7. Web sharing (note as link)
8. Multi-device sync
9. Android version
10. Widgets

---

## Assets Needed

- [ ] App icon
- [ ] Splash screen
- [ ] 12 border template implementations (CSS/SVG)
- [ ] Vanilla pre-made designs (5-10)
- [ ] Empty state illustrations
- [ ] Onboarding screens

---

## Reference Files

- **PRD**: `PRD.md` - Comprehensive Product Requirements Document with acceptance criteria
- **Design Preview Tool**: `toonnotes-design-preview.html` - HTML tool to visualize Gemini JSON output and border templates

---

## Next Steps

1. ~~Finalize character sticker count decision~~ - **DONE: 1 sticker**
2. ~~Create visual mockups of all 12 border templates~~ - **DONE: See preview tool**
3. ~~Write comprehensive PRD with acceptance criteria~~ - **DONE: See PRD.md**
4. Set up Expo project with basic navigation
5. Implement core note CRUD before AI features

---

*Last updated: December 2024*
*Source: Claude.ai conversation with Sungho*
