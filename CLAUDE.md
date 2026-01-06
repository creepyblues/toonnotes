# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a **monorepo** containing multiple ToonNotes app implementations. Each subdirectory is a standalone app project targeting different platforms or frameworks.

### Project Directory Overview

| Directory | Status | Description |
|-----------|--------|-------------|
| `ToonNotes_Expo/` | **Active** | React Native/Expo app (iOS & Android). Primary development focus. |
| `ToonNotes/` | Legacy | Original Swift/SwiftUI iOS/macOS app |
| `ToonNotes_Native/` | Legacy | Native app experiment |
| `ToonNotes_React/` | Legacy | React web app with Capacitor |
| `ToonNotes_React_AIStudio/` | Legacy | React web app for Google AI Studio |

### Active Development

**ToonNotes_Expo** is the current active project. See `ToonNotes_Expo/CLAUDE.md` for development guidance.

### Adding New Projects

This monorepo structure supports adding new platform-specific apps:
- iOS native (Swift/SwiftUI): Create `ToonNotes_iOS/`
- Android native (Kotlin): Create `ToonNotes_Android/`
- Other frameworks: Follow naming convention `ToonNotes_<Platform>/`

Each new project should include its own `CLAUDE.md` with project-specific guidance.

---

## Legacy: Swift/SwiftUI Version (Reference Only)

The documentation below describes the original iOS/macOS Swift implementation (`ToonNotes/`) for reference purposes.

## Project Overview

ToonNotes is an iOS/macOS note-taking application built with Swift, SwiftUI, and SwiftData. The app features AI-powered content generation (using Gemini API), template-based note creation, label organization, and an in-app economy system with virtual currency (Sparks ⭐ and Gems 💎) and StoreKit integration.

## Development Commands

### Building and Running
```bash
# Navigate to the Xcode project directory
cd ToonNotes

# Build the project
xcodebuild -project ToonNotes.xcodeproj -scheme ToonNotes -configuration Debug build

# Run tests
xcodebuild -project ToonNotes.xcodeproj -scheme ToonNotes -destination 'platform=iOS Simulator,name=iPhone 15' test

# Run a single test class
xcodebuild -project ToonNotes.xcodeproj -scheme ToonNotes -destination 'platform=iOS Simulator,name=iPhone 15' -only-testing:ToonNotesTests/ToonNotesTests test
```

Alternatively, open `ToonNotes/ToonNotes.xcodeproj` in Xcode and use Cmd+B to build, Cmd+R to run, and Cmd+U to test.

## Architecture

### Data Models (SwiftData)
All models use SwiftData's `@Model` macro and are registered in the `ModelContainer` schema in [ToonNotesApp.swift](ToonNotes/ToonNotes/ToonNotesApp.swift):

- **Note**: Core entity with title, content, timestamps, archive/delete status, custom styling (colors, images), labels relationship, and optional template association. Images stored with `@Attribute(.externalStorage)`.
- **Label**: Tag system for organizing notes with many-to-many relationship via `@Relationship(inverse: \Label.notes)`.
- **Template**: Pre-designed note layouts with AI-generated content, images, thumbnails, and usage tracking.
- **UserSettings**: App preferences including dark mode, Gemini API key, free design usage flag, and default note color.
- **UserTokenBalance**: Virtual economy tracking with Sparks and Gems balances, login streaks, daily rewards, and lifetime earn/purchase statistics.
- **TokenTransaction**: Audit log for all token operations (earn, spend, purchase, gift) with type, amount, balance snapshots, and source tracking.
- **NoteDesign**: Reusable design configurations extracted from images via AI. Stores color palette (primary, accent, text, border as hex strings), border style/width, texture ID/opacity, and optional source image. Has many-to-one relationship with Notes (multiple notes can share one design).

### Services (Singletons)

**EconomyService** ([EconomyService.swift](ToonNotes/ToonNotes/Services/EconomyService.swift))
- Manages in-app virtual currency (Sparks and Gems)
- Balance queries, spending validation, and transaction logging
- Daily reward system with login streak tracking
- All operations require `ModelContext` parameter

**GeminiService** ([GeminiService.swift](ToonNotes/ToonNotes/Services/GeminiService.swift))
- Currently uses **mock implementations** with simulated network delays (2-3 seconds)
- `generateContent()`: AI content generation based on prompts
- `generateTemplate()`: Template creation with structured content
- `generateDesign()`: "Nano Banana" feature for analyzing images and extracting design themes (colors, styles, borders)
- When integrating real API, add Gemini API key handling via `UserSettings.geminiAPIKey`

**StoreKitService** ([StoreKitService.swift](ToonNotes/ToonNotes/Services/StoreKitService.swift))
- In-app purchase integration for buying tokens
- Product IDs: `com.toonnotes.sparks.{10,50}`, `com.toonnotes.gems.{5,20}`
- Transaction verification and finishing handled automatically
- Includes mock purchase method for simulator testing

**DesignEngine** ([DesignEngine.swift](ToonNotes/ToonNotes/Services/DesignEngine.swift))
- Central service for creating and composing note designs
- `createDesign(from:tier:sourceImageData:context:)`: Converts AI-generated `DesignTheme` into persistent `NoteDesign`
- `compose(design:for:)`: Generates view-ready `ComposedStyle` adapted to context (editor, listRow, thumbnail, widget)
- `compose(backgroundColor:borderColor:for:)`: Fallback composition for notes without designs
- Adaptive rendering rules: textures only in editor, reduced borders/shadows in list views

**TextureRegistry** ([TextureRegistry.swift](ToonNotes/ToonNotes/Utilities/TextureRegistry.swift))
- Singleton mapping texture IDs to bundled assets
- Categories: paper, comic, artistic (premium)
- Each texture has: id, assetName, displayName, defaultOpacity, isPremium flag

### View Architecture

- **ContentView**: Root view that initializes daily rewards and user settings
- **NoteListView**: Main notes interface with filtering (all/archived/deleted), search, and grid/list layout
- **NoteEditorView**: Rich note editor with toolbar for styling, labels, AI generation, PhotosPicker integration, and design picker. Uses DesignEngine for composing styles with three-layer architecture (Desk background, Paper, Decorations).
- **DesignPickerView**: Sheet for browsing and applying saved designs to notes
- **SidebarView**: Navigation sidebar for labels and archive access
- **TemplateGalleryView** & **TemplateCreatorView**: Template browsing and creation with AI generation
- **TokenShopView**: In-app purchase interface for buying Sparks and Gems
- **LabelManagerView**: Label creation and management
- **SettingsView**: App preferences including dark mode toggle and API key configuration

### Critical Implementation Rules

**Economy System**
- Always check `canAfford()` before token-dependent operations
- Token costs: Sparks for basic AI features, Gems for premium features
- Daily rewards auto-grant on app launch via `ContentView.onAppear`
- When adding new token operations, always create corresponding `TokenTransaction` records

**Data Field Changes**
- When modifying model schemas (Note, UserSettings, etc.), update documentation to reflect data field changes
- Schema changes affect the `ModelContainer` initialization in [ToonNotesApp.swift](ToonNotes/ToonNotes/ToonNotesApp.swift:13-21)

**OAuth Integration**
- NEVER use parameters in OAuth callback URLs (per global user instructions)

**User Settings Flow**
- Settings are initialized in ContentView if empty on first launch
- Dark mode preference applies globally via `.preferredColorScheme()` modifier
- API keys and preferences persist in SwiftData

## Key Patterns

- SwiftData querying uses `@Query` property wrapper in views
- Use `@Bindable` for two-way binding with SwiftData models in editors
- Image data stored with `@Attribute(.externalStorage)` for large binary data
- Services use singleton pattern (`shared` static property) with private initializers
- All async operations (AI generation, purchases) use Swift concurrency (async/await)
- Cross-platform compatibility: Use `#if canImport(UIKit)` for iOS-specific APIs (Color(uiColor:), navigationBarTitleDisplayMode)
- Platform image handling: Use `PlatformImage` typealias and `Image(platformImage:)` extension from [PlatformCompat.swift](ToonNotes/ToonNotes/Utilities/PlatformCompat.swift)

## Design System Architecture

The app uses a layered design system for note styling:

### DesignViewContext
Adapts styling based on where the note is displayed:
- `editor`: Full styling with textures, shadows, larger borders
- `listRow`: Simplified for performance (no textures, reduced shadows)
- `thumbnail`: Minimal styling
- `widget`: Future support for iOS widgets

### ComposedStyle
View-ready styling output from DesignEngine containing:
- Colors: backgroundColor, accentColor, textColor, borderColor
- Border: width, style (solid, dashed, dotted, inkStroke, glow)
- Texture: assetName, opacity, showTexture flag
- Layout: cornerRadius, shadowRadius, showBorder flag

### Design Tiers
- `basic`: 1 Spark cost, standard texture access
- `premium`: 3 Sparks cost, access to premium textures (watercolor, canvas, screentone)
