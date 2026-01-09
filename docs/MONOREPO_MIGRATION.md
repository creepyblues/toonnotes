# ToonNotes Monorepo Migration Plan

> **Status**: Planning
> **Created**: January 2025
> **Goal**: Restructure into Turborepo monorepo with `app.toonnotes.com` as separate deployment

---

## Overview

Migrate from the current flat structure to a proper Turborepo monorepo that enables:
- Shared packages across mobile and web apps
- Independent deployments for marketing site and web app
- Better code organization and reusability

## Current vs Target Structure

### Current Structure
```
toonnotes/
├── ToonNotes_Expo/      # Mobile app (active)
├── ToonNotes_Web/       # Marketing + web app (mixed)
├── ToonNotes/           # Legacy Swift
├── ToonNotes_Native/    # Legacy
├── ToonNotes_React/     # Legacy
└── ToonNotes_React_AIStudio/  # Legacy
```

### Target Structure
```
toonnotes/
├── apps/
│   ├── expo/                    # Mobile app (React Native/Expo)
│   ├── web/                     # Marketing site (toonnotes.com)
│   └── webapp/                  # Web app (app.toonnotes.com)
├── packages/
│   ├── types/                   # Shared TypeScript types
│   ├── design-engine/           # Design composition logic
│   ├── supabase/                # Supabase client & types
│   └── constants/               # Presets, patterns, themes
├── docs/                        # Documentation
├── turbo.json
├── package.json
├── pnpm-workspace.yaml
└── .gitignore
```

---

## Deployment Architecture

| App | Domain | Vercel Project | Purpose |
|-----|--------|----------------|---------|
| `apps/web` | toonnotes.com | toonnotes-web | Marketing, landing pages |
| `apps/webapp` | app.toonnotes.com | toonnotes-webapp | Full web application |
| `apps/expo` | N/A | N/A | iOS/Android mobile app |

---

## Shared Packages

### @toonnotes/types
Shared TypeScript types extracted from `ToonNotes_Expo/types/index.ts`:
- `Note`, `NoteDesign`, `Label`, `Board` interfaces
- `NoteColor`, `BackgroundStyle`, `TypographyStyle` types
- Platform-agnostic (no React Native imports)

### @toonnotes/design-engine
Design composition logic:
- `composeStyle()` - Converts NoteDesign to rendered styles
- `composedStyleToCSS()` - CSS output for web
- Pattern/texture registry
- Color utilities

### @toonnotes/supabase
Supabase client configuration:
- Browser client (for client components)
- Server client (for Next.js server components)
- Generated database types
- Common query helpers

### @toonnotes/constants
Shared constants:
- `labelPresets.ts` - 30 label styling presets
- `boardPresets.ts` - 20 board category presets
- `patterns.ts` - Background pattern definitions
- `themes.ts` - Pre-made design themes

---

## Migration Checklist

### Phase 1: Setup Turborepo
- [ ] Install pnpm globally
- [ ] Create root `package.json` with workspaces
- [ ] Create `pnpm-workspace.yaml`
- [ ] Create `turbo.json` configuration
- [ ] Create `.npmrc` for workspace settings

### Phase 2: Extract Packages
- [ ] Create `packages/types/`
  - [ ] Extract types from ToonNotes_Expo
  - [ ] Remove React Native specific code
  - [ ] Add package.json
- [ ] Create `packages/constants/`
  - [ ] Copy labelPresets, boardPresets, patterns, themes
  - [ ] Add package.json
- [ ] Create `packages/design-engine/`
  - [ ] Merge logic from Expo and Web
  - [ ] Add package.json with types dependency
- [ ] Create `packages/supabase/`
  - [ ] Extract client creation
  - [ ] Add generated types
  - [ ] Add package.json

### Phase 3: Move Apps
- [ ] Move `ToonNotes_Expo/` → `apps/expo/`
  - [ ] Update package.json name to @toonnotes/expo
  - [ ] Add workspace dependencies
  - [ ] Update tsconfig paths
  - [ ] Update imports to use @toonnotes/*
- [ ] Move `ToonNotes_Web/` → `apps/web/`
  - [ ] Update package.json name to @toonnotes/web
  - [ ] Remove /app routes (moving to webapp)
  - [ ] Add workspace dependencies
  - [ ] Update imports
- [ ] Create `apps/webapp/`
  - [ ] Initialize new Next.js project
  - [ ] Move app routes from ToonNotes_Web/app/app/
  - [ ] Move app components
  - [ ] Configure for app.toonnotes.com
  - [ ] Set up middleware for auth

### Phase 4: Vercel Configuration
- [ ] Update `toonnotes-web` project
  - [ ] Change root directory to `apps/web`
  - [ ] Verify toonnotes.com still works
- [ ] Create `toonnotes-webapp` project
  - [ ] Set root directory to `apps/webapp`
  - [ ] Add app.toonnotes.com domain
  - [ ] Configure environment variables
- [ ] Add Supabase OAuth redirect URL
  - [ ] `https://app.toonnotes.com/auth/callback`

### Phase 5: Cleanup
- [ ] Verify all apps build successfully
- [ ] Verify all apps run in development
- [ ] Test cross-package imports
- [ ] Remove legacy directories:
  - [ ] `ToonNotes/`
  - [ ] `ToonNotes_Native/`
  - [ ] `ToonNotes_React/`
  - [ ] `ToonNotes_React_AIStudio/`

---

## Configuration Files

### Root package.json
```json
{
  "name": "toonnotes",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "dev:expo": "turbo dev --filter=@toonnotes/expo",
    "dev:web": "turbo dev --filter=@toonnotes/web",
    "dev:webapp": "turbo dev --filter=@toonnotes/webapp"
  },
  "devDependencies": {
    "turbo": "^2.3.0"
  },
  "packageManager": "pnpm@9.15.0"
}
```

### pnpm-workspace.yaml
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

---

## Package Dependencies

```
@toonnotes/expo
  └── @toonnotes/types
  └── @toonnotes/design-engine
  └── @toonnotes/constants

@toonnotes/web
  └── @toonnotes/types
  └── @toonnotes/design-engine
  └── @toonnotes/supabase

@toonnotes/webapp
  └── @toonnotes/types
  └── @toonnotes/design-engine
  └── @toonnotes/supabase
  └── @toonnotes/constants

@toonnotes/design-engine
  └── @toonnotes/types

@toonnotes/supabase
  └── @toonnotes/types
```

---

## Import Changes

### Before (local imports)
```typescript
// In ToonNotes_Expo
import { Note, NoteDesign } from '../types';
import { composeStyle } from '../services/designEngine';
import { LABEL_PRESETS } from '../constants/labelPresets';
```

### After (package imports)
```typescript
// In apps/expo
import { Note, NoteDesign } from '@toonnotes/types';
import { composeStyle } from '@toonnotes/design-engine';
import { LABEL_PRESETS } from '@toonnotes/constants';
```

---

## Verification Commands

```bash
# Install all dependencies
pnpm install

# Build all packages and apps
pnpm build

# Run type checking
pnpm typecheck

# Run specific app in dev mode
pnpm dev:expo
pnpm dev:web
pnpm dev:webapp

# Run all apps (parallel)
pnpm dev
```

---

## Rollback Plan

If migration fails, the original directories are preserved until Phase 5 cleanup. To rollback:

1. Restore original package.json files from git
2. Remove `apps/` and `packages/` directories
3. Rename back if directories were moved

---

## References

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Vercel Monorepo Guide](https://vercel.com/docs/monorepos)
