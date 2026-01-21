# ToonNotes - Product Requirements Document

**Version:** 1.x (Current)
**Last Updated:** January 2025
**Status:** Implementation Complete (v1.1.1)

---

> **v2.0 Development:** See [PRD-v2-MODE-Framework.md](./docs/PRD-v2-MODE-Framework.md) for the MODE Framework & Smart Assistant roadmap.

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
12. [Future Considerations](#12-future-considerations)
13. [Appendix](#13-appendix)

---

## 1. Executive Summary

**ToonNotes** is a mobile note-taking application designed for webtoon and anime fans. The core differentiator is AI-powered custom note designs generated from uploaded images (webtoon panels, anime screenshots, etc.). Users can transform their favorite visual content into personalized note themes complete with extracted color palettes, styled borders, and character stickers.

### Key Value Propositions

- **Personalization**: Create unique note designs from beloved webtoon/anime content
- **Aesthetic Expression**: Notes that reflect the user's fandom and visual preferences
- **Smart Organization**: AI-powered label suggestions and hashtag-based boards
- **Simplicity**: Google Keep-like simplicity with added visual customization
- **Cloud Sync**: Seamless sync across devices for Pro subscribers

### Business Model

- **Freemium**: Free basic note-taking + 3 free custom designs
- **Coin-based IAP**: Purchase coins to create additional custom designs
- **Pro Subscription**: $4.99/month for unlimited designs, cloud sync, and 100 coins/month

---

## 2. Problem Statement

### Current Landscape

Existing note-taking apps (Google Keep, Apple Notes, Notion) offer limited personalization options. Users can change background colors, but cannot create deeply personalized themes that reflect their interests and fandoms.

### User Pain Points

1. **Lack of self-expression**: Generic note apps don't allow fans to express their identity
2. **Disconnected experiences**: Fans consume content (webtoons, anime) separately from productivity tools
3. **Organization friction**: Manually organizing notes is tedious; no smart suggestions
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

- **Current**: iOS, Android (Expo/React Native)
- **In Progress**: Web app

### Core Capabilities

| Capability | Description |
|------------|-------------|
| Note Management | Create, edit, archive, delete notes with multiple editor modes |
| Editor Modes | Plain text, checklist (Google Keep style), bullet list |
| Labels | Hashtag-based organization with 30 presets and AI suggestions |
| Boards | Auto-created hashtag collections with custom styling |
| Custom Designs | AI-generated note themes from uploaded images |
| Character Stickers | AI-generated stickers with background removal |
| Cloud Sync | Real-time sync across devices (Pro feature) |
| Sharing | Export notes as images for social sharing |

### Architecture Principles

- **Local-first**: Notes stored on device, works offline
- **Optional cloud**: Cloud sync available for Pro subscribers
- **Privacy-focused**: Images processed via API but not stored on servers
- **AI-enhanced**: Smart label suggestions and design generation

---

## 5. Feature Requirements

### 5.1 Note Management

#### Create & Edit Notes

| Status | Requirement |
|--------|-------------|
| ✅ | Create new note from FAB or + button |
| ✅ | Notes auto-save as user types (debounced 500ms) |
| ✅ | Edit note title and body |
| ✅ | "Saved" indicator appears after auto-save |

#### Delete & Archive

| Status | Requirement |
|--------|-------------|
| ✅ | Archive notes (removes from main list) |
| ✅ | View and manage archived notes |
| ✅ | Delete notes (moves to Trash) |
| ✅ | 30-day soft delete with recovery |
| ✅ | Restore notes from Trash |
| ✅ | Permanently delete notes from Trash |

#### Pin & Search

| Status | Requirement |
|--------|-------------|
| ✅ | Pin important notes to top |
| ✅ | Pinned section appears above others |
| ✅ | Search notes by title and content |
| ✅ | Search results update as user types |

---

### 5.2 Editor Modes

Three distinct editing modes for different use cases:

| Mode | Description | Implementation |
|------|-------------|----------------|
| **Plain Text** | Default mode for free-form notes | Standard TextInput |
| **Checklist** | Google Keep-style with checkboxes | `ChecklistEditor.tsx` with stable UUIDs |
| **Bullet List** | Structured list with bullet points | `BulletEditor.tsx` |

#### Checklist Mode Features

- Visual checkboxes that toggle on tap
- Checked items show strikethrough
- New item created on Enter/Return
- Backspace on empty item deletes it
- Stable UUIDs (not array indices) for performance

---

### 5.3 Labels

#### Hashtag-Based Labels

| Status | Requirement |
|--------|-------------|
| ✅ | Typing #word creates/assigns label |
| ✅ | Hashtags visually distinct (colored) |
| ✅ | Case-insensitive (#Work = #work) |
| ✅ | Label autocomplete while typing |

#### 30 Label Presets

Labels auto-apply matching design when added to notes:

| Category | Labels |
|----------|--------|
| **Productivity** | todo, in-progress, done, waiting, priority |
| **Planning** | goals, meeting, planning, deadline, project |
| **Checklists** | shopping, wishlist, packing, bucket-list, errands |
| **Media** | reading, watchlist, bookmarks, review, recommendation |
| **Creative** | ideas, draft, brainstorm, inspiration, research |
| **Personal** | journal, memory, reflection, gratitude, quotes |
| **System** | uncategorized (fallback) |

#### AI Label Suggestions

| Status | Requirement |
|--------|-------------|
| ✅ | Analyze note content via NLP (Gemini) |
| ✅ | Suggest matching existing labels |
| ✅ | Suggest new labels with categories |
| ✅ | User can accept/decline suggestions |
| ✅ | Generate design for new custom labels |

---

### 5.4 Boards

Boards are auto-created collections based on hashtags:

| Status | Requirement |
|--------|-------------|
| ✅ | Auto-create board from first use of hashtag |
| ✅ | Display notes with matching label |
| ✅ | Show note count and preview |
| ✅ | 20 board styling presets by category |
| ✅ | AI-generated custom board designs |
| ✅ | Board accent decorations (sparkles, stars, hearts, flowers) |

#### Board Categories

| Category | Presets |
|----------|---------|
| **Productivity** | todo, important, archive, goals |
| **Reading** | reading, watchlist, review, recommendation |
| **Creative** | ideas, theory, character, favorites |
| **Content** | blog, draft, quotes, research |
| **Personal** | journal, memory, inspiration, art |

---

### 5.5 Note Appearance

#### Basic Colors (7)

| Color | Hex |
|-------|-----|
| White | #FFFFFF |
| Lavender | #EDE9FE |
| Rose | #FFE4E6 |
| Peach | #FED7AA |
| Mint | #D1FAE5 |
| Sky | #E0F2FE |
| Violet | #DDD6FE |

#### Custom Designs

| Status | Requirement |
|--------|-------------|
| ✅ | Apply custom design from note toolbar |
| ✅ | Design picker shows all saved designs |
| ✅ | Applying design updates background, colors, sticker |
| ✅ | Remove custom design (revert to basic color) |
| ✅ | Label preset designs auto-apply |

---

### 5.6 Custom Design Creation

#### Image Upload

| Status | Requirement |
|--------|-------------|
| ✅ | Access "Create Design" from My Designs or note |
| ✅ | Select image from photo library |
| ✅ | Camera capture option |
| ✅ | Supported formats: JPEG, PNG, HEIC |
| ✅ | Image preview before generation |

#### AI Design Generation

| Status | Requirement |
|--------|-------------|
| ✅ | Extract color palette from image |
| ✅ | Generate typography style |
| ✅ | Generate character sticker with background removal |
| ✅ | "Feeling Lucky" random chaotic designs |
| ✅ | Loading state with progress |
| ✅ | Error retry option |

#### Design Preview & Save

| Status | Requirement |
|--------|-------------|
| ✅ | Preview design applied to sample note |
| ✅ | Name the design before saving |
| ✅ | Save design to My Designs gallery |
| ✅ | Discard without saving |

---

### 5.7 Authentication

| Status | Requirement |
|--------|-------------|
| ✅ | Google OAuth sign-in |
| ✅ | Apple OAuth sign-in (required for App Store) |
| ✅ | Session persistence via secure storage |
| ✅ | Sign out functionality |
| ✅ | Account deletion |

---

### 5.8 Cloud Sync (Pro Feature)

| Status | Requirement |
|--------|-------------|
| ✅ | Bidirectional sync for notes |
| ✅ | Bidirectional sync for designs |
| ✅ | Bidirectional sync for boards |
| ✅ | Bidirectional sync for labels |
| ✅ | Real-time updates via Supabase Realtime |
| ✅ | Local-to-cloud migration on first sign-in |
| ✅ | Fire-and-forget uploads after local changes |

---

### 5.9 Onboarding

| Status | Requirement |
|--------|-------------|
| ✅ | Welcome carousel (3 slides) |
| ✅ | Coach marks system (progressive tooltips) |
| ✅ | Remote config for onboarding flow |
| ✅ | Onboarding version tracking |

---

### 5.10 Sharing

| Status | Requirement |
|--------|-------------|
| ✅ | Share note as image |
| ✅ | Include design (background, sticker) |
| ✅ | Standard share sheet |

---

## 6. Design System

### 6.1 System Themes (7)

Pre-built design themes for quick customization:

| Theme | Description |
|-------|-------------|
| Ghibli | Soft watercolors, dreamy atmosphere |
| Manga | Bold black borders, classic panel style |
| Webtoon | Clean minimal, modern vertical-scroll |
| Shoujo | Soft rounded corners, flower accents |
| Shonen | Dynamic speed lines, energetic |
| Kawaii | Cute pastel colors, playful |
| Vintage | Retro 80s/90s manga aesthetic |

### 6.2 Label Presets (30)

Each preset includes:
- Icon (emoji for boards, Phosphor icon for notes)
- Color scheme (primary, secondary, background, text)
- Background style (solid, gradient, pattern, texture, illustration)
- Font style (sans-serif, serif, display, handwritten, mono)
- Sticker configuration
- AI prompt hints for custom generation

### 6.3 Board Presets (20)

Rich board backgrounds organized by category with:
- Header styling (background, text, badge colors)
- Corkboard area styling
- Decorative elements
- Category-based mood (muted, rich, vibrant, warm)

### 6.4 Color Architecture

Three-layer system for visual hierarchy:

```
┌─────────────────────────────────┐
│  BOARD (Rich/Visible Color)    │  ← Container backdrop
│  ┌───────────────────────────┐ │
│  │  NOTE (Light Pastel)      │ │  ← Paper-like cards
│  │  └── TEXT (Dark)          │ │  ← Readable content
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

### 6.5 Design Adaptation Contexts

Designs render differently based on context:

| Context | Visible Elements | Sticker | Shadow |
|---------|------------------|---------|--------|
| Grid | Background + border only | 0.6x scale | 50% |
| List | Background + border | Hidden | None |
| Detail | Full design | 1x scale | 100% |
| Share | Full design, enhanced | 1.2x scale | 150% |

### 6.6 Typography

| Style | Font | Use Case |
|-------|------|----------|
| sans-serif | Inter | Modern, clean themes |
| serif | Playfair Display | Elegant, literary themes |
| display | Custom | Bold headings |
| handwritten | Caveat | Playful, casual themes |
| mono | Source Code Pro | Technical, research themes |

---

## 7. Economy System

### 7.1 Currency

**Coins** - Virtual currency for design creation

### 7.2 Free Tier

| Feature | Limit |
|---------|-------|
| Notes | Unlimited |
| Basic colors | 7 colors |
| Custom designs | 3 free |
| Label presets | All 30 |
| Cloud sync | Not available |
| AI label suggestions | Limited |

### 7.3 Pro Subscription ($4.99/month)

| Feature | Access |
|---------|--------|
| Custom designs | Unlimited |
| Coins | 100/month |
| Cloud sync | Full sync across devices |
| AI label suggestions | Unlimited |
| Real-time sync | Yes |

### 7.4 Coin Packages (IAP)

| Package | Coins | Price | Bonus |
|---------|-------|-------|-------|
| Starter | 3 | $0.99 | - |
| Popular | 12 | $2.99 | +2 free |
| Best Value | 32 | $5.99 | +7 free |

### 7.5 Economy Rules

| Rule | Implementation |
|------|----------------|
| Check balance before generation | `canAffordDesign()` |
| Deduct after successful generation | `spendCoin()` |
| Failed generations don't consume coins | Refund on error |
| Track free designs used | `freeDesignsUsed` (0-3) |
| Monthly coin grant for Pro | 100 coins on renewal |

---

## 8. Technical Architecture

### 8.1 Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Expo SDK 54 + Expo Router v6 |
| Language | TypeScript (strict mode) |
| UI/Styling | NativeWind v4 (Tailwind CSS) |
| State | Zustand + AsyncStorage |
| Icons | Phosphor Icons + Lucide |
| Validation | Zod |
| Auth | Supabase Auth (OAuth) |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage |
| AI | Gemini 2.0 Flash (via Vercel Edge Functions) |
| Payments | RevenueCat |
| Analytics | Firebase Analytics + Crashlytics |
| Monitoring | Sentry |

### 8.2 Data Models

#### Note

```typescript
interface Note {
  id: string;
  title: string;
  content: string;
  labels: string[];
  color: NoteColor;
  designId?: string;
  activeDesignLabelId?: string;
  backgroundOverride?: BackgroundOverride;
  typographyPosterUri?: string;
  characterMascotUri?: string;
  images?: string[];
  isPinned: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  deletedAt?: number;
  createdAt: number;
  updatedAt: number;
}
```

#### NoteDesign

```typescript
interface NoteDesign {
  id: string;
  name: string;
  sourceImageUri: string;
  createdAt: number;
  background: {
    primaryColor: string;
    secondaryColor?: string;
    style: 'solid' | 'gradient' | 'image' | 'pattern';
    imageUri?: string;
    patternId?: string;
    opacity?: number;
  };
  colors: {
    titleText: string;
    bodyText: string;
    accent: string;
  };
  typography: {
    titleStyle: 'serif' | 'sans-serif' | 'handwritten';
    vibe: 'modern' | 'classic' | 'cute' | 'dramatic';
  };
  sticker: CharacterSticker;
  designSummary: string;
  vibe?: DesignVibe;
  isLucky?: boolean;
  isSystemDefault?: boolean;
  themeId?: ThemeId;
  labelPresetId?: string;
}
```

#### Label

```typescript
interface Label {
  id: string;
  name: string;
  presetId?: string;
  customDesignId?: string;
  isSystemLabel?: boolean;
  createdAt: number;
  lastUsedAt?: number;
}
```

#### Board

```typescript
interface Board {
  id: string;
  hashtag: string;
  customStyle?: BoardStyle;
  boardDesignId?: string;
  createdAt: number;
  updatedAt: number;
}
```

#### User

```typescript
interface User {
  id: string;
  email?: string;
  freeDesignsUsed: number;  // 0-3
  coinBalance: number;
  createdAt: number;
  subscription: Subscription;
}

interface Subscription {
  isPro: boolean;
  plan: 'monthly' | null;
  expiresAt: number | null;
  lastCoinGrantDate: number | null;
  willRenew: boolean;
}
```

### 8.3 Zustand Stores

| Store | Purpose |
|-------|---------|
| `noteStore` | Note CRUD, auto-save, cloud sync |
| `designStore` | Saved designs, cloud sync |
| `labelStore` | Label entities, cloud sync |
| `boardStore` | Board customizations, cloud sync |
| `userStore` | User profile, economy, settings |
| `authStore` | OAuth state, sync orchestration |
| `labelSuggestionStore` | AI label suggestion queue |

### 8.4 Services

| Service | Purpose |
|---------|---------|
| `geminiService` | AI API calls (via Vercel edge functions) |
| `designEngine` | Design composition for different contexts |
| `authService` | OAuth (Google/Apple) |
| `syncService` | Cloud sync bidirectional |
| `purchaseService` | RevenueCat IAP |
| `subscriptionService` | Pro tier management |
| `labelingEngine` | AI label suggestions |
| `onboardingService` | Welcome carousel, coach marks |
| `firebaseAnalytics` | Event tracking |

### 8.5 API Endpoints (Vercel Edge Functions)

| Endpoint | Purpose |
|----------|---------|
| `/api/generate-theme` | AI design from image |
| `/api/generate-lucky-theme` | Random chaotic design |
| `/api/extract-colors` | Color palette extraction |
| `/api/generate-board-design` | Board backgrounds |
| `/api/generate-character-mascot` | AI sticker generation |
| `/api/generate-label-design` | Label-specific designs |
| `/api/generate-typography-poster` | Typography art |
| `/api/analyze-note-content` | NLP for label suggestions |
| `/api/remove-background` | Background removal |
| `/api/onboarding-config` | Remote config |

**Base URL**: `https://toonnotes-api.vercel.app`

---

## 9. User Flows

### 9.1 First-Time User Flow

```
1. App Launch
   └── Welcome Carousel (3 slides)
       ├── "Notes that express you"
       ├── "Create designs from your favorite art"
       └── "Organize with smart labels"

2. Main Screen (Empty State)
   └── "Create your first note" CTA
   └── Coach mark tooltip appears

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

### 9.2 OAuth Authentication Flow

```
1. User taps Sign In
   └── Choose Google or Apple

2. OAuth Flow
   └── Native auth dialog opens
   └── User authenticates
   └── Redirect to app via deep link

3. Callback Handler
   └── Session extracted from URL
   └── Auth store updated
   └── Check beta tester status

4. First Sync (Pro users)
   └── Migrate local data to cloud
   └── Pull remote data
   └── Set up real-time subscriptions

5. Redirect to Main App
```

### 9.3 Create Custom Design Flow

```
1. Entry Points
   ├── My Designs → "Create Design" button
   ├── Note Editor → Design Picker → "Create New"
   └── Settings → My Designs

2. Image Selection
   ├── Photo Library picker
   └── Camera capture

3. Confirmation
   └── Image preview
   └── "Generate Design" / "Feeling Lucky" buttons
   └── Cost indicator (free badge or coin cost)

4. Generation
   └── Loading state with animation
   └── AI extracts colors
   └── AI generates sticker
   └── 15-30 second wait

5. Preview
   └── Design applied to sample note
   └── Name input field
   └── Quality assessment displayed

6. Save
   └── "Save Design" button
   └── Success confirmation
   └── Redirect to My Designs
```

### 9.4 AI Label Suggestion Flow

```
1. Note Editor Close
   └── Content changed detected
   └── Trigger AI analysis

2. API Analysis
   └── Send title + content to /api/analyze-note-content
   └── Receive matched labels + suggested new labels

3. Create Suggestions
   └── Queue LabelSuggestion items
   └── Status: pending

4. User Notification
   └── Toast UI appears
   └── Show suggested labels

5. User Action
   ├── Accept → Apply label to note
   │   └── If preset match → auto-apply design
   │   └── If new label → generate design
   └── Decline → Remove suggestion
```

---

## 10. Non-Functional Requirements

### 10.1 Performance

| Metric | Target |
|--------|--------|
| App launch time | < 2 seconds |
| Note list scroll | 60 FPS |
| Note editor input latency | < 50ms |
| Design generation time | < 30 seconds |
| Auto-save debounce | 500ms |
| Cloud sync latency | < 2 seconds |

### 10.2 Reliability

| Metric | Target |
|--------|--------|
| App crash rate | < 0.1% |
| Data loss incidents | 0 |
| API success rate | > 99% |
| Offline note availability | 100% |

### 10.3 Security

| Requirement | Status |
|-------------|--------|
| Secure storage for tokens | ✅ expo-secure-store |
| API keys not in client | ✅ Via Vercel edge functions |
| OAuth for authentication | ✅ Google/Apple |
| API response validation | ✅ Zod schemas |

### 10.4 Accessibility

| Requirement | Status |
|-------------|--------|
| VoiceOver/TalkBack support | ✅ Accessibility labels |
| Dark mode | ✅ Full support |
| Minimum touch target 44×44pt | ✅ |

---

## 11. Success Metrics

### 11.1 Engagement

| Metric | Target |
|--------|--------|
| DAU/MAU ratio | > 20% |
| Notes created per active user (weekly) | 5+ |
| Designs created per paying user | 3+ |
| Label adoption rate | 50% of notes |

### 11.2 Monetization

| Metric | Target |
|--------|--------|
| Conversion to paid (designs) | 5% |
| Pro subscription conversion | 3% |
| ARPPU | $5.00 |

### 11.3 Retention

| Metric | Target |
|--------|--------|
| Day 1 retention | 40% |
| Day 7 retention | 25% |
| Day 30 retention | 15% |

---

## 12. Future Considerations

### Planned Features

- [ ] Share as image (enhanced)
- [ ] Daily rewards system
- [ ] Offline-first improvements
- [ ] Web app full launch

### Long-term Vision

- Multiple stickers per design
- Community design sharing
- Partner/official IP designs
- Creator monetization program

---

## 13. Appendix

### A. Project Structure

```
apps/expo/
├── api/                      # Vercel Edge Functions (10 endpoints)
├── app/                      # Expo Router pages
│   ├── (tabs)/               # Tab navigator
│   │   ├── index.tsx         # Notes list
│   │   ├── boards.tsx        # Boards view
│   │   ├── designs.tsx       # My Designs
│   │   └── settings.tsx      # Settings
│   ├── auth/                 # OAuth flow
│   ├── note/[id].tsx         # Note editor
│   ├── board/                # Board views
│   └── design/create.tsx     # Design creation
├── components/               # UI components (41 files)
│   ├── notes/                # NoteCard
│   ├── boards/               # BoardCard, StickyNote
│   ├── editor/               # ChecklistEditor, BulletEditor
│   ├── shop/                 # CoinShop, ProSubscriptionCard
│   ├── labels/               # LabelSuggestionSheet
│   └── onboarding/           # WelcomeCarousel, CoachMarks
├── stores/                   # Zustand state (8 stores)
├── services/                 # External services (14 files)
├── constants/                # Presets and config
│   ├── labelPresets.ts       # 30 label presets
│   ├── boardPresets.ts       # 20 board presets
│   ├── themes.ts             # 7 system themes
│   └── products.ts           # IAP products
├── types/index.ts            # TypeScript interfaces
└── utils/                    # Helpers
```

### B. Environment Variables

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# RevenueCat
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxx
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxx

# Monitoring
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn

# AI (Vercel edge functions only)
GEMINI_API_KEY=your-gemini-key
```

### C. Supabase Schema

**Tables:**
- `profiles` - User profiles and beta tester status
- `notes` - User notes with full data
- `designs` - Custom note designs
- `boards` - Board customizations
- `labels` - Label entities

**Storage Buckets:**
- `note-images` - Note attachments
- `design-images` - Stickers and source images

### D. RevenueCat Products

| Product ID | Type | Description |
|------------|------|-------------|
| `toonnotes_coins_3` | Consumable | Starter Pack (3 coins) |
| `toonnotes_coins_12` | Consumable | Popular Pack (12 coins) |
| `toonnotes_coins_32` | Consumable | Best Value (32 coins) |
| `toonnotes_pro_monthly` | Subscription | Pro Monthly ($4.99) |

---

*This PRD reflects the current implementation state of ToonNotes v1.1.1 (January 2025).*
