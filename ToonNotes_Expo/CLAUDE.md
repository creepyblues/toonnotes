# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

ToonNotes is a mobile note-taking app for webtoon/anime fans built with Expo (React Native). The app features AI-powered custom note designs generated from uploaded images.

**Project Root**: `/Users/sungholee/code/toonnotes/ToonNotes_Expo`

## Documentation

- **PRD.md** - Product Requirements Document with full feature specifications
- **toonnotes-handoff.md** - Developer handoff documentation
- **toonnotes-design-preview.html** - Visual design preview (open in browser)

## Development Commands

```bash
npm install          # Install dependencies
npm start            # Start Expo dev server
npm run ios          # Run on iOS simulator
npm run android      # Run on Android emulator
npm run web          # Run in browser
```

## Tech Stack

- **Framework**: Expo SDK 54 with Expo Router v6
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State**: Zustand with AsyncStorage persistence
- **Icons**: Lucide React Native

## Project Structure

```
ToonNotes_Expo/
├── app/                      # Expo Router pages
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Tab navigator
│   │   ├── index.tsx         # Notes list (with dark mode)
│   │   ├── designs.tsx       # My Designs (with dark mode)
│   │   └── settings.tsx      # Settings (API key, dark mode toggle)
│   ├── note/
│   │   └── [id].tsx          # Note editor modal (with design picker)
│   ├── design/
│   │   └── create.tsx        # Design creation flow
│   ├── archive.tsx           # Archived notes view
│   ├── trash.tsx             # Deleted notes view
│   └── _layout.tsx           # Root layout (theme provider)
├── components/               # Reusable UI components
│   ├── notes/
│   │   └── NoteCard.tsx      # Note list item (dark mode aware)
│   └── useColorScheme.ts     # Custom hook for dark mode
├── stores/                   # Zustand state management
│   ├── noteStore.ts          # Note state & actions
│   ├── userStore.ts          # User, economy & settings state
│   ├── designStore.ts        # Saved designs state
│   └── index.ts              # Export all stores
├── types/
│   └── index.ts              # TypeScript interfaces
├── services/                 # API services
│   └── geminiService.ts      # Gemini AI integration
├── utils/                    # Utility functions
├── PRD.md                    # Product requirements
├── toonnotes-handoff.md      # Developer handoff doc
├── tailwind.config.js        # Tailwind theme (with dark colors)
├── global.css                # Tailwind imports
└── metro.config.js           # Metro + NativeWind
```

## Data Models

- **Note**: Core entity with title, content, color, labels, designId reference, archive/delete status
- **NoteDesign**: AI-generated theme with colors (background, title, body, accent, border), border style, sticker
- **User**: Economy state (coins, free design flag)
- **AppSettings**: User preferences (darkMode, defaultNoteColor, geminiApiKey)
- **Label**: Tag for note organization

## Key Patterns

- Zustand stores with AsyncStorage persistence (`zustand/middleware`)
- NativeWind v4 for Tailwind CSS styling
- Expo Router file-based navigation
- Modal presentation for note editor, archive, trash views
- Dark mode via custom `useColorScheme` hook that reads from userStore

## Economy System

- Users get 1 free design
- Additional designs cost 1 coin each
- Coins purchased via IAP (TODO: RevenueCat integration)

## Implemented Features

- [x] Dark mode (toggle in Settings, persisted)
- [x] Gemini API key management (Settings → API key input)
- [x] Archive view (view and manage archived notes)
- [x] Trash view (restore or permanently delete notes)
- [x] Design application to notes (picker in note editor)
- [x] Image picker for design creation
- [x] Gemini API integration (local server at port 3001)

## TODO

- [ ] Implement rich text editing
- [ ] Add RevenueCat for IAP
- [ ] Add share as image functionality
- [ ] Background removal for stickers
- [ ] Daily rewards system
