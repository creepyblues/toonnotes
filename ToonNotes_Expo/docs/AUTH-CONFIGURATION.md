# ToonNotes Authentication Configuration

This document contains all authentication configuration details for the ToonNotes app.

---

## Supabase Project

| Setting | Value |
|---------|-------|
| Project URL | `https://wscbybcuzvuwtfncffdf.supabase.co` |
| Project Reference | `wscbybcuzvuwtfncffdf` |
| Organization | Sungho |

### Environment Variables

```bash
EXPO_PUBLIC_SUPABASE_URL=https://wscbybcuzvuwtfncffdf.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzY2J5YmN1enZ1d3RmbmNmZmRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMzAwMTEsImV4cCI6MjA4MjkwNjAxMX0.AC8jfZksoz4rbG-zUlNLgqjXd27zAuPgdP2K1z0itQY
```

---

## Apple OAuth Configuration

| Setting | Value |
|---------|-------|
| Team ID | `T94953BUAS` |
| Bundle ID (App ID) | `com.toonnotes.app` |
| Services ID (Client ID) | `com.toonnotes.app.web` |
| Key ID | `NXBS6K2M5Y` |
| Private Key File | `AuthKey_NXBS6K2M5Y.p8` |

### Apple Developer Portal Setup

1. **App ID**: `com.toonnotes.app`
   - Sign in with Apple capability enabled
   - Location: Certificates, Identifiers & Profiles > Identifiers > App IDs

2. **Services ID**: `com.toonnotes.app.web`
   - Sign in with Apple enabled
   - Domain: `wscbybcuzvuwtfncffdf.supabase.co`
   - Return URL: `https://wscbybcuzvuwtfncffdf.supabase.co/auth/v1/callback`
   - Location: Certificates, Identifiers & Profiles > Identifiers > Services IDs

3. **Sign in with Apple Key**: `NXBS6K2M5Y`
   - Associated with App ID `com.toonnotes.app`
   - Private key file: `AuthKey_NXBS6K2M5Y.p8`
   - Location: Certificates, Identifiers & Profiles > Keys

### Generating Apple Client Secret

The Apple client secret is a JWT that expires every 6 months. Use the provided script to regenerate:

```bash
node scripts/generate-apple-secret.js
```

**Important**: The private key file (`AuthKey_NXBS6K2M5Y.p8`) must be in `scripts/` folder.

After running, copy the generated JWT to:
- Supabase Dashboard > Authentication > Providers > Apple > Secret Key

### Secret Expiration Reminder

Apple client secrets expire after 6 months. Set a calendar reminder to regenerate before expiration.

---

## Google OAuth Configuration

### Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Create OAuth 2.0 Client IDs for:
   - **Web application** (for web platform)
   - **iOS** (for iOS native)
   - **Android** (for Android native)

### Required Credentials

| Platform | Type | Notes |
|----------|------|-------|
| Web | Web application | Authorized redirect: Supabase callback URL |
| iOS | iOS | Bundle ID: `com.toonnotes.app` |
| Android | Android | Package name + SHA-1 fingerprint |

### Supabase Configuration

Add credentials to Supabase Dashboard > Authentication > Providers > Google:
- Client ID (Web)
- Client Secret (Web)

---

## OAuth Redirect URLs

### Supabase Dashboard Configuration

**Site URL**: `https://toonnotes.app` (or your production URL)

**Redirect URLs** (add all of these):
```
toonnotesexpo://auth/callback
https://toonnotes.app/auth/callback
http://localhost:8081/auth/callback
exp://localhost:8081/--/auth/callback
```

### App Configuration

OAuth URL schemes are configured in `app.json`:
- iOS: `toonnotesexpo` scheme via CFBundleURLTypes
- Android: `toonnotesexpo` scheme via intentFilters

---

## Database Schema

The database schema is defined in `supabase/schema.sql`. Run this in Supabase SQL Editor to set up:

- `profiles` - User profiles (extends auth.users)
- `notes` - User notes with all metadata
- `labels` - Note labels/tags
- `designs` - User-created designs
- `boards` - Hashtag boards
- `purchases` - IAP audit trail

All tables have Row Level Security (RLS) enabled.

---

## Quick Reference Commands

```bash
# Generate Apple client secret
node scripts/generate-apple-secret.js

# Type check the auth implementation
npx tsc --noEmit

# Start dev server
npm start
```

---

## Troubleshooting

### Apple Sign In Issues

1. **"Invalid client_id"**: Verify Services ID matches in both Apple Developer Portal and Supabase
2. **"Invalid redirect_uri"**: Ensure Return URL in Apple matches Supabase callback exactly
3. **Secret expired**: Regenerate using the script above

### Google Sign In Issues

1. **"redirect_uri_mismatch"**: Add the exact callback URL to Google Cloud Console
2. **"access_denied"**: Check OAuth consent screen configuration

---

## File Locations

| File | Purpose |
|------|---------|
| `services/supabase.ts` | Supabase client configuration |
| `services/authService.ts` | OAuth flow helpers |
| `stores/authStore.ts` | Auth state management |
| `app/auth/index.tsx` | Sign-in screen |
| `app/auth/callback.tsx` | OAuth callback handler |
| `scripts/generate-apple-secret.js` | Apple secret generator |
| `supabase/schema.sql` | Database schema |

---

*Last updated: January 2026*
