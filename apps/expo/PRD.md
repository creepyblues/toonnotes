# ToonNotes - Product Requirements Document

**Version:** 1.0
**Last Updated:** December 2024
**Author:** Product Team
**Status:** Draft for v1

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Target Users](#3-target-users)
4. [Product Overview](#4-product-overview)
5. [Feature Requirements](#5-feature-requirements)
6. [Design System](#6-design-system)
7. [Economy System](#7-economy-system)
8. [Technical Architecture](#8-technical-architecture)
9. [User Flows](#9-user-flows)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [Success Metrics](#11-success-metrics)
12. [Out of Scope (v1)](#12-out-of-scope-v1)
13. [Future Considerations](#13-future-considerations)
14. [Appendix](#14-appendix)

---

## 1. Executive Summary

**ToonNotes** is a mobile note-taking application designed for webtoon and anime fans. The core differentiator is AI-powered custom note designs generated from uploaded images (webtoon panels, anime screenshots, etc.). Users can transform their favorite visual content into personalized note themes complete with extracted color palettes, styled borders, and character stickers.

### Key Value Propositions

- **Personalization**: Create unique note designs from beloved webtoon/anime content
- **Aesthetic Expression**: Notes that reflect the user's fandom and visual preferences
- **Simplicity**: Google Keep-like simplicity with added visual customization
- **Shareability**: Export beautifully designed notes as images for social sharing

### Business Model

- **Freemium**: Free basic note-taking + 1 free custom design
- **Coin-based IAP**: Purchase coins to create additional custom designs
- **Future**: Partner designs with IP owners, potential subscription tier

---

## 2. Problem Statement

### Current Landscape

Existing note-taking apps (Google Keep, Apple Notes, Notion) offer limited personalization options. Users can change background colors, but cannot create deeply personalized themes that reflect their interests and fandoms.

### User Pain Points

1. **Lack of self-expression**: Generic note apps don't allow fans to express their identity
2. **Disconnected experiences**: Fans consume content (webtoons, anime) separately from productivity tools
3. **Sharing friction**: Notes aren't designed to be visually appealing for social sharing
4. **Design complexity**: Creating custom themes typically requires design skills

### Opportunity

Webtoon and anime fans are highly engaged, willing to pay for fan merchandise, and active on social media. ToonNotes bridges their fandom passion with everyday productivity.

---

## 3. Target Users

### Primary Persona: The Webtoon/Anime Fan

**Demographics:**
- Age: 16-35
- Heavy consumers of webtoons (LINE Webtoon, Tapas, Lezhin) and anime
- Active on social media (Instagram, Twitter/X, TikTok)
- Mobile-first behavior

**Behaviors:**
- Screenshots favorite panels/scenes
- Shares fandom content on social media
- Purchases merchandise and fan goods
- Uses note apps for lists, journaling, and planning

**Needs:**
- Express fandom identity in daily tools
- Create aesthetically pleasing content to share
- Simple, quick note-taking without complex features

### Secondary Persona: The Aesthetic Note-Taker

**Demographics:**
- Age: 18-30
- Values visual aesthetics in digital tools
- May not be specifically into anime/webtoons but appreciates customization

**Needs:**
- Personalized, visually pleasing notes
- Easy way to create custom themes without design skills

---

## 4. Product Overview

### Platform

- **v1**: iOS (iPhone and iPad)
- **Future**: Android, Web

### Core Capabilities

| Capability | Description |
|------------|-------------|
| Note Management | Create, edit, archive, delete notes with rich text formatting |
| Labels | Organize notes with hashtag-based labels |
| Custom Designs | AI-generated note themes from uploaded images |
| Character Stickers | AI-generated stickers from source images |
| Sharing | Export notes as images for social sharing |

### Architecture Principles

- **Local-first**: Notes stored on device, no account required for basic use
- **Single device (v1)**: Multi-device sync is future scope
- **Offline capable**: Core note-taking works without internet
- **Privacy-focused**: Images processed via API but not stored on servers

---

## 5. Feature Requirements

### 5.1 Note Management

#### 5.1.1 Create Note

**Description:** Users can create new notes with a title and body content.

**Requirements:**
| ID | Requirement | Priority |
|----|-------------|----------|
| NM-001 | User can create a new note from the main screen via FAB or + button | P0 |
| NM-002 | New notes open in edit mode immediately | P0 |
| NM-003 | Notes auto-save as user types (debounced 1 second) | P0 |
| NM-004 | Untitled notes use first line of content as display title | P1 |
| NM-005 | Empty notes are discarded when user navigates away | P1 |

**Acceptance Criteria:**
- [ ] Tapping "+" creates a new note and opens editor
- [ ] Typing in editor updates note content in real-time
- [ ] Navigating away from editor saves note automatically
- [ ] Note appears in list immediately after creation
- [ ] Empty note is not saved to note list

#### 5.1.2 Edit Note

**Description:** Users can edit existing notes with rich text formatting.

**Requirements:**
| ID | Requirement | Priority |
|----|-------------|----------|
| NM-010 | User can edit note title and body | P0 |
| NM-011 | Support formatting: Bold, Italic, Underline, Strikethrough | P0 |
| NM-012 | Support headings: H1, H2 | P1 |
| NM-013 | Support text color selection (8 preset colors) | P1 |
| NM-014 | Undo/Redo functionality | P1 |
| NM-015 | Changes auto-save with visual confirmation | P0 |

**Acceptance Criteria:**
- [ ] Selecting text shows formatting toolbar
- [ ] Applying Bold wraps text in bold styling
- [ ] Applying Italic wraps text in italic styling
- [ ] Applying heading changes text size and weight
- [ ] Text color picker shows 8 color options
- [ ] Undo reverses last action; Redo reapplies
- [ ] "Saved" indicator appears after auto-save

#### 5.1.3 Delete & Archive Notes

**Description:** Users can archive notes (soft hide) or delete notes (soft delete with 30-day recovery).

**Requirements:**
| ID | Requirement | Priority |
|----|-------------|----------|
| NM-020 | User can archive a note (removes from main list) | P0 |
| NM-021 | User can view archived notes in Archive section | P0 |
| NM-022 | User can unarchive a note (returns to main list) | P0 |
| NM-023 | User can delete a note (moves to Trash) | P0 |
| NM-024 | Deleted notes remain in Trash for 30 days | P1 |
| NM-025 | User can restore notes from Trash | P1 |
| NM-026 | User can permanently delete notes from Trash | P1 |
| NM-027 | Trash auto-empties notes older than 30 days | P2 |

**Acceptance Criteria:**
- [ ] Swiping left on note shows Archive action
- [ ] Archived notes disappear from main list
- [ ] Archive section shows all archived notes
- [ ] Tapping "Unarchive" returns note to main list
- [ ] Delete action moves note to Trash section
- [ ] Trash shows days remaining before permanent deletion
- [ ] "Restore" returns note to main list
- [ ] "Delete Forever" permanently removes note

#### 5.1.4 Pin Notes

**Description:** Users can pin important notes to the top of their list.

**Requirements:**
| ID | Requirement | Priority |
|----|-------------|----------|
| NM-030 | User can pin a note | P1 |
| NM-031 | Pinned notes appear at top of list in "Pinned" section | P1 |
| NM-032 | User can unpin a note | P1 |
| NM-033 | Multiple notes can be pinned simultaneously | P1 |

**Acceptance Criteria:**
- [ ] Pin action available in note menu/toolbar
- [ ] Pinned notes show pin icon indicator
- [ ] Pinned section appears above "Others" section
- [ ] Unpinning moves note back to chronological position

#### 5.1.5 Search Notes

**Description:** Users can search across all notes by title and content.

**Requirements:**
| ID | Requirement | Priority |
|----|-------------|----------|
| NM-040 | User can search notes via search bar | P0 |
| NM-041 | Search queries title and body content | P0 |
| NM-042 | Search results update as user types (debounced) | P1 |
| NM-043 | Search highlights matching text in results | P2 |
| NM-044 | Search includes archived notes with indicator | P2 |

**Acceptance Criteria:**
- [ ] Search icon/bar visible on main screen
- [ ] Typing query filters note list in real-time
- [ ] Matching notes show title and content preview
- [ ] "No results" state shown when query has no matches
- [ ] Clearing search restores full note list

---

### 5.2 Labels

#### 5.2.1 Create Labels via Hashtags

**Description:** Users create labels by typing #hashtag inline in notes (like Google Keep).

**Requirements:**
| ID | Requirement | Priority |
|----|-------------|----------|
| LB-001 | Typing #word in note body creates/assigns label | P0 |
| LB-002 | Hashtags are visually distinct (colored, tappable) | P0 |
| LB-003 | Tapping hashtag in note navigates to label view | P1 |
| LB-004 | Labels are case-insensitive (#Work = #work) | P1 |
| LB-005 | Labels support alphanumeric and underscore only | P1 |

**Acceptance Criteria:**
- [ ] Typing "#shopping" in note creates "shopping" label
- [ ] Hashtag appears as colored pill/link in note
- [ ] Tapping hashtag shows all notes with that label
- [ ] Same label applied regardless of capitalization
- [ ] Special characters end the hashtag (e.g., "#test!" = "test")

#### 5.2.2 Label Management

**Description:** Users can view, rename, and delete labels.

**Requirements:**
| ID | Requirement | Priority |
|----|-------------|----------|
| LB-010 | Left drawer/sidebar shows all labels | P0 |
| LB-011 | Labels show note count | P1 |
| LB-012 | Tapping label filters notes to that label | P0 |
| LB-013 | User can rename labels | P2 |
| LB-014 | User can delete labels (removes from all notes) | P2 |

**Acceptance Criteria:**
- [ ] Sidebar lists all labels alphabetically
- [ ] Each label shows (n) note count
- [ ] Tapping label shows filtered note list
- [ ] "Edit Labels" mode allows rename/delete
- [ ] Deleting label removes hashtag from all notes

---

### 5.3 Note Appearance

#### 5.3.1 Basic Background Colors

**Description:** Users can set a background color for notes (Keep-style).

**Requirements:**
| ID | Requirement | Priority |
|----|-------------|----------|
| NA-001 | User can select note background color | P0 |
| NA-002 | 8 preset colors available (white, red, orange, yellow, green, teal, blue, purple) | P0 |
| NA-003 | Color visible in both editor and list view | P0 |
| NA-004 | Default color is white | P0 |

**Acceptance Criteria:**
- [ ] Color picker accessible from note toolbar
- [ ] 8 color swatches displayed in picker
- [ ] Selecting color immediately updates note background
- [ ] Color persists after closing and reopening note
- [ ] List view shows note card in selected color

#### 5.3.2 Apply Custom Design

**Description:** Users can apply a saved custom design to any note.

**Requirements:**
| ID | Requirement | Priority |
|----|-------------|----------|
| NA-010 | User can apply custom design from note toolbar | P0 |
| NA-011 | Design picker shows all saved designs as thumbnails | P0 |
| NA-012 | Applying design updates background, colors, border, and sticker | P0 |
| NA-013 | User can remove custom design (revert to basic color) | P1 |
| NA-014 | Design adapts to note context (grid, list, detail, share) | P0 |

**Acceptance Criteria:**
- [ ] "Apply Design" option in note toolbar
- [ ] Design picker displays design thumbnails in grid
- [ ] Tapping design applies it to current note
- [ ] Note editor shows full design (background, border, sticker)
- [ ] List view shows simplified design (background, border only)
- [ ] "Remove Design" reverts note to basic white

---

### 5.4 Custom Design Creation

#### 5.4.1 Upload Image for Design

**Description:** Users upload an image to generate a custom note design.

**Requirements:**
| ID | Requirement | Priority |
|----|-------------|----------|
| CD-001 | User can access "Create Design" from My Designs or FAB | P0 |
| CD-002 | User can select image from photo library | P0 |
| CD-003 | User can take new photo with camera | P1 |
| CD-004 | Supported formats: JPEG, PNG, HEIC | P0 |
| CD-005 | Maximum image size: 10MB | P1 |
| CD-006 | Image preview shown before generation | P0 |

**Acceptance Criteria:**
- [ ] "Create Design" button visible in My Designs section
- [ ] Photo picker allows selection from library
- [ ] Camera option available for new photos
- [ ] Unsupported formats show error message
- [ ] Oversized images show error with size limit
- [ ] Selected image displays in preview before proceeding

#### 5.4.2 AI Design Generation

**Description:** AI analyzes uploaded image and generates design system.

**Requirements:**
| ID | Requirement | Priority |
|----|-------------|----------|
| CD-010 | System extracts color palette from image | P0 |
| CD-011 | System determines appropriate border template | P0 |
| CD-012 | System generates 1 character sticker from image | P0 |
| CD-013 | System generates design summary/name | P1 |
| CD-014 | Generation shows loading state with progress | P0 |
| CD-015 | Generation completes within 30 seconds | P1 |
| CD-016 | Generation errors show retry option | P0 |

**Acceptance Criteria:**
- [ ] Tapping "Generate" starts AI analysis
- [ ] Loading indicator shows generation in progress
- [ ] Color palette extracted (primary, secondary, text, accent, border)
- [ ] Border template selected from 12 options
- [ ] One character sticker generated with transparent background
- [ ] Design preview shown upon completion
- [ ] Error state offers "Try Again" button

#### 5.4.3 Design Preview & Save

**Description:** User previews generated design and saves to My Designs.

**Requirements:**
| ID | Requirement | Priority |
|----|-------------|----------|
| CD-020 | Preview shows design applied to sample note | P0 |
| CD-021 | Preview shows all 4 contexts (grid, list, detail, share) | P1 |
| CD-022 | User can name the design before saving | P1 |
| CD-023 | User can save design to My Designs | P0 |
| CD-024 | User can discard design without saving | P0 |
| CD-025 | Saved design appears in My Designs gallery | P0 |

**Acceptance Criteria:**
- [ ] Preview screen shows sample note with design applied
- [ ] Context switcher shows grid/list/detail/share previews
- [ ] Name field pre-filled with AI-generated name
- [ ] "Save" button adds design to gallery
- [ ] "Discard" returns to previous screen without saving
- [ ] New design appears at top of My Designs

#### 5.4.4 My Designs Gallery

**Description:** Users can view, manage, and apply saved designs.

**Requirements:**
| ID | Requirement | Priority |
|----|-------------|----------|
| CD-030 | My Designs accessible from sidebar/tab | P0 |
| CD-031 | Designs displayed as thumbnail grid | P0 |
| CD-032 | Thumbnail shows design preview with source image | P0 |
| CD-033 | Tapping design shows full preview | P1 |
| CD-034 | User can delete saved designs | P1 |
| CD-035 | Design shows creation date | P2 |
| CD-036 | Design shows usage count (notes using it) | P2 |

**Acceptance Criteria:**
- [ ] "My Designs" section in sidebar/navigation
- [ ] Grid displays design thumbnails (2-3 columns)
- [ ] Each thumbnail shows source image corner + design preview
- [ ] Tap opens design detail with full preview
- [ ] Delete option available (with confirmation)
- [ ] Empty state shows "Create your first design" CTA

---

### 5.5 Sharing

#### 5.5.1 Share Note as Image

**Description:** Users can export notes as images for social sharing.

**Requirements:**
| ID | Requirement | Priority |
|----|-------------|----------|
| SH-001 | User can share note as image from note menu | P0 |
| SH-002 | Square format option: 1080x1080px | P0 |
| SH-003 | Full-length format option: 1080px width, variable height | P1 |
| SH-004 | Export includes design (background, border, sticker) | P0 |
| SH-005 | Export includes "ToonNotes" watermark | P0 |
| SH-006 | Watermark placement: bottom-right, subtle | P1 |
| SH-007 | Share sheet opens with standard iOS options | P0 |

**Acceptance Criteria:**
- [ ] "Share" option in note toolbar/menu
- [ ] Format picker offers Square and Full options
- [ ] Generated image matches design preview
- [ ] Sticker visible in appropriate position
- [ ] Watermark visible but not obtrusive
- [ ] iOS share sheet allows saving, messaging, social sharing

---

## 6. Design System

### 6.1 Border Templates

12 comic/webtoon-inspired border templates, each supporting `thin`, `medium`, and `thick` variants.

| Category | Template | Description |
|----------|----------|-------------|
| **Panel Styles** | `panel` | Bold black border, sharp corners. Classic manga panel. |
| | `webtoon` | Clean minimal border with subtle shadow. Modern vertical-scroll. |
| | `sketch` | Hand-drawn storyboard feel with rough pencil edges. |
| **Shoujo/Romance** | `shoujo` | Soft rounded corners with pink glow, flower & sparkle accents. |
| | `vintage_manga` | Retro 80s/90s manga with offset shadow and dashed inset. |
| | `watercolor` | Dreamy bleed effect with soft blurred edges. |
| **Chibi/Fun** | `speech_bubble` | Comic dialogue bubble with tail pointer. |
| | `pop` | Bold offset shadow + halftone dot pattern. American comics style. |
| | `sticker` | White outline + drop shadow, die-cut look. |
| **Action/Shonen** | `speed_lines` | Motion lines shooting off the right edge. |
| | `impact` | Jagged explosive frame with clip-path. |
| | `ink_splash` | Brush stroke border with ink splatter accents. |

### 6.2 Design Adaptation Rules

Designs must render correctly across different view contexts:

| Context | Dimensions | Visible Elements |
|---------|------------|------------------|
| Grid thumbnail | 150×150pt | Background + border only |
| List row | Full width × 80pt | Background + border + sticker (small, corner) |
| Detail/Editor | Full screen | Full design with sticker |
| Share (square) | 1080×1080px | Full design, sticker prominent, watermark |
| Share (full) | 1080×variable | Full design, full content, watermark |

### 6.3 Typography

| Style | Font | Use Case |
|-------|------|----------|
| `serif` | Playfair Display | Elegant, romance themes |
| `sans-serif` | Inter | Modern, clean themes |
| `handwritten` | Caveat | Playful, casual themes |

### 6.4 Color Palette Extraction

AI extracts the following colors from source images:

| Color | Usage |
|-------|-------|
| `primaryBackground` | Main note background |
| `secondaryBackground` | Gradient end (if applicable) |
| `titleText` | Heading text color |
| `bodyText` | Body content color |
| `accent` | Highlights, links, hashtags |
| `border` | Border color |

---

## 7. Economy System

### 7.1 Virtual Currency

| Currency | Symbol | Primary Use |
|----------|--------|-------------|
| Coins | (coin icon) | Create custom designs |

### 7.2 Pricing Structure

| Action | Cost |
|--------|------|
| First custom design | Free |
| Additional custom designs | 1 coin each |

### 7.3 Coin Packages (IAP)

| Package | Coins | Price (USD) | Bonus |
|---------|-------|-------------|-------|
| Starter | 3 | $0.99 | - |
| Popular | 10 | $2.99 | +2 free |
| Best Value | 25 | $5.99 | +7 free |

*Prices are tentative and subject to market research.*

### 7.4 Economy Rules

**Requirements:**
| ID | Requirement | Priority |
|----|-------------|----------|
| EC-001 | First design is free for all users | P0 |
| EC-002 | Check coin balance before design generation | P0 |
| EC-003 | Deduct coin after successful generation | P0 |
| EC-004 | Failed generations do not consume coins | P1 |
| EC-005 | Coin balance visible in settings/profile | P0 |
| EC-006 | Purchase flow via iOS StoreKit | P0 |
| EC-007 | Restore purchases functionality | P0 |

**Acceptance Criteria:**
- [ ] New user sees "Free" badge on first design creation
- [ ] Insufficient coins shows purchase prompt
- [ ] Successful generation deducts 1 coin
- [ ] API error refunds coin automatically
- [ ] Coin balance updates in real-time after purchase
- [ ] "Restore Purchases" recovers prior transactions

---

## 8. Technical Architecture

### 8.1 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | Expo (React Native) + TypeScript | Cross-platform optionality, rapid iteration |
| UI Library | NativeWind or Tamagui | Tailwind-style or headless components |
| State | Zustand + AsyncStorage | Simple, local-first state management |
| Rich Text | TBD (react-native-pell-rich-editor) | Rich text editing capability |
| Backend | Supabase | Auth + future sync capability |
| Payments | RevenueCat | iOS IAP abstraction |
| AI - Vision | Gemini 1.5 Pro/Flash | Image analysis for design extraction |
| AI - Images | Gemini Imagen 3 | Character sticker generation |

### 8.2 Data Models

```typescript
interface Note {
  id: string;
  title: string;
  content: string;           // Rich text format TBD
  labels: string[];          // Array of label names
  color: string;             // Basic background color hex
  designId?: string;         // Reference to NoteDesign
  isPinned: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  deletedAt?: Date;          // For 30-day trash
  createdAt: Date;
  updatedAt: Date;
}

interface NoteDesign {
  id: string;
  name: string;
  sourceImageUri: string;
  createdAt: Date;

  background: {
    primaryColor: string;
    secondaryColor?: string;
    style: 'solid' | 'gradient';
  };

  colors: {
    titleText: string;
    bodyText: string;
    accent: string;
    border: string;
  };

  border: {
    template: BorderTemplate;
    thickness: 'thin' | 'medium' | 'thick';
  };

  typography: {
    titleStyle: 'serif' | 'sans-serif' | 'handwritten';
    vibe: 'modern' | 'classic' | 'cute' | 'dramatic';
  };

  sticker: CharacterSticker;

  designSummary: string;
}

interface CharacterSticker {
  id: string;
  imageUri: string;
  description: string;
  suggestedPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  scale: 'small' | 'medium' | 'large';
}

type BorderTemplate =
  | 'panel' | 'webtoon' | 'sketch'
  | 'shoujo' | 'vintage_manga' | 'watercolor'
  | 'speech_bubble' | 'pop' | 'sticker'
  | 'speed_lines' | 'impact' | 'ink_splash';

interface User {
  id: string;
  email?: string;
  freeDesignUsed: boolean;
  coinBalance: number;
  createdAt: Date;
}

interface Purchase {
  id: string;
  productId: string;
  coinsGranted: number;
  purchasedAt: Date;
  transactionId: string;
}
```

### 8.3 Local Storage Schema

```
AsyncStorage Keys:
├── @toonnotes/notes          // Note[]
├── @toonnotes/designs        // NoteDesign[]
├── @toonnotes/user           // User
├── @toonnotes/purchases      // Purchase[]
└── @toonnotes/settings       // AppSettings
```

### 8.4 API Integration

**Gemini Vision API** (Design Extraction)
- Endpoint: Gemini 1.5 Pro/Flash
- Input: Base64 encoded image
- Output: JSON design specification
- Timeout: 30 seconds
- Retry: 1 automatic retry on failure

**Gemini Imagen 3** (Sticker Generation)
- Endpoint: Imagen 3
- Input: Character description from Vision output
- Output: PNG with transparency
- Size: 512x512px
- Timeout: 30 seconds

---

## 9. User Flows

### 9.1 First-Time User Flow

```
1. App Launch
   └── Onboarding screens (3 slides)
       ├── Slide 1: "Notes that express you"
       ├── Slide 2: "Create designs from your favorite art"
       └── Slide 3: "Share beautifully"

2. Main Screen (Empty State)
   └── "Create your first note" CTA

3. Create First Note
   └── Note editor opens
   └── User writes content
   └── Note saved automatically

4. Discover Custom Designs
   └── "Try a custom design - it's free!" prompt
   └── User uploads image
   └── Design generated
   └── Design applied to note
```

### 9.2 Create Custom Design Flow

```
1. Entry Points
   ├── My Designs → "Create Design" button
   ├── Note Editor → Design Picker → "Create New"
   └── Empty Designs State → CTA

2. Image Selection
   ├── Photo Library picker
   └── Camera capture

3. Confirmation
   └── Image preview
   └── "Generate Design" button
   └── Coin cost indicator (or "Free" badge)

4. Generation
   └── Loading state with animation
   └── Progress indicator (analyzing → extracting → generating)
   └── 15-30 second wait

5. Preview
   └── Design applied to sample note
   └── Context switcher (Grid/List/Detail/Share)
   └── Name input field

6. Save
   └── "Save Design" button
   └── Success confirmation
   └── Redirect to My Designs
```

### 9.3 Apply Design to Note Flow

```
1. Open Note Editor
   └── Tap design icon in toolbar

2. Design Picker Sheet
   ├── "My Designs" section with thumbnails
   ├── "Basic Colors" section
   └── "Create New Design" option

3. Select Design
   └── Tap design thumbnail
   └── Design applied immediately
   └── Sheet closes

4. Editor Updates
   └── Background, border, sticker visible
   └── Text colors updated
```

### 9.4 Share Note Flow

```
1. Note Editor/Detail
   └── Tap share icon

2. Format Selection
   ├── "Square (1080×1080)" - Best for Instagram
   └── "Full Length" - Best for stories/long notes

3. Preview
   └── Generated image preview
   └── Watermark visible

4. Share Sheet
   ├── Save to Photos
   ├── Share to Messages
   ├── Share to Instagram/Twitter/etc.
   └── Copy image
```

---

## 10. Non-Functional Requirements

### 10.1 Performance

| Metric | Target | Priority |
|--------|--------|----------|
| App launch time | < 2 seconds | P0 |
| Note list scroll | 60 FPS | P0 |
| Note editor input latency | < 50ms | P0 |
| Design generation time | < 30 seconds | P1 |
| Image export time | < 3 seconds | P1 |
| App size | < 50MB | P1 |

### 10.2 Reliability

| Metric | Target | Priority |
|--------|--------|----------|
| App crash rate | < 0.1% | P0 |
| Data loss incidents | 0 | P0 |
| API success rate | > 99% | P1 |
| Offline note availability | 100% | P0 |

### 10.3 Security

| Requirement | Priority |
|-------------|----------|
| Local data encrypted at rest | P1 |
| API keys not exposed in client | P0 |
| Uploaded images not persisted on server | P1 |
| IAP receipt validation | P0 |

### 10.4 Accessibility

| Requirement | Priority |
|-------------|----------|
| VoiceOver support for core flows | P1 |
| Dynamic Type support | P2 |
| Minimum touch target 44×44pt | P1 |
| Color contrast ratios (WCAG AA) | P2 |

### 10.5 Localization

| Requirement | Priority |
|-------------|----------|
| English (primary) | P0 |
| Korean | P1 |
| Japanese | P2 |
| RTL support | P3 |

---

## 11. Success Metrics

### 11.1 Acquisition

| Metric | Target (90 days post-launch) |
|--------|------------------------------|
| App Store downloads | 10,000 |
| Organic discovery rate | 40% |

### 11.2 Activation

| Metric | Target |
|--------|--------|
| First note created (Day 0) | 70% of installs |
| First design created | 30% of installs |

### 11.3 Engagement

| Metric | Target |
|--------|--------|
| DAU/MAU ratio | > 20% |
| Notes created per active user (weekly) | 5+ |
| Designs created per paying user | 3+ |
| Share rate (notes shared / notes created) | 10% |

### 11.4 Monetization

| Metric | Target |
|--------|--------|
| Conversion to paid | 5% of free design users |
| ARPPU (Average Revenue Per Paying User) | $4.00 |
| Day 7 LTV | $0.30 |

### 11.5 Retention

| Metric | Target |
|--------|--------|
| Day 1 retention | 40% |
| Day 7 retention | 25% |
| Day 30 retention | 15% |

---

## 12. Out of Scope (v1)

The following features are explicitly **not** included in v1:

| Feature | Reason |
|---------|--------|
| Multi-device sync | Requires account system, adds complexity |
| Android app | Focus on iOS first for quality |
| Web app | Mobile-first product |
| Checklists/Todos | Keep scope focused on notes |
| Images in notes | Technical complexity, storage costs |
| Drawing/Sketching | Significant development effort |
| Collaboration | Requires backend infrastructure |
| Reminders/Notifications | Not core to value proposition |
| Folders (beyond labels) | Labels sufficient for v1 |
| Custom fonts | Design system complexity |
| Sticker export (standalone) | IP/legal considerations |
| Multiple stickers per design | Decided: 1 sticker per design for simplicity |

---

## 13. Future Considerations

### v1.1 Potential Features
- Checklist support
- Note reminders
- Widget support (iOS)
- Additional border templates

### v2 Potential Features
- Account system & cloud sync
- Multi-device support
- Android app
- Partner/official IP designs
- Subscription tier
- Sticker packs (multiple stickers per design)
- Sticker marketplace

### Long-term Vision
- Web app for cross-platform access
- API for third-party integrations
- Community design sharing
- Creator monetization program

---

## 14. Appendix

### A. Gemini Prompt Template

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
  "character": {
    "description": "detailed description of main character/element to generate as sticker",
    "suggested_position": "top-right | bottom-right | bottom-left | top-left",
    "scale": "small | medium | large"
  },
  "design_summary": "1-2 sentence description of the overall aesthetic"
}
```

### B. File Structure

```
toonnotes/
├── app/                     # Expo Router pages
│   ├── (tabs)/
│   │   ├── index.tsx        # Notes list
│   │   ├── designs.tsx      # My Designs
│   │   └── settings.tsx     # Settings
│   ├── note/
│   │   └── [id].tsx         # Note editor
│   ├── design/
│   │   ├── create.tsx       # Create design flow
│   │   └── [id].tsx         # Design detail
│   └── _layout.tsx
├── components/
│   ├── notes/
│   │   ├── NoteCard.tsx
│   │   ├── NoteEditor.tsx
│   │   └── NoteDesignRenderer.tsx
│   ├── design/
│   │   ├── DesignPreview.tsx
│   │   ├── BorderTemplates.tsx
│   │   └── StickerView.tsx
│   ├── ui/
│   └── labels/
├── hooks/
├── services/
│   ├── gemini.ts
│   ├── storage.ts
│   └── purchases.ts
├── stores/
├── utils/
├── constants/
│   ├── borders.ts
│   └── colors.ts
└── types/
```

### C. Related Documents

- `toonnotes-handoff.md` - Initial planning decisions
- `toonnotes-design-preview.html` - Border template visual reference

---

*This PRD is a living document and will be updated as decisions are made and requirements evolve.*
