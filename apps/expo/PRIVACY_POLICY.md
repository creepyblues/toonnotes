# ToonNotes Privacy Policy

**Last Updated: January 6, 2026**

## Overview

ToonNotes is a note-taking app that respects your privacy. By default, your notes stay on your device. Pro subscribers can optionally sync to the cloud.

## Data We Collect

### Data Stored on Your Device Only
- Notes (title, content, labels)
- App preferences (dark mode, default note color)
- Custom designs and stickers
- In-app purchase records

This data is stored locally using your device's secure storage.

### User Accounts (Pro)

Pro subscribers can create an account for cloud sync:
- **Email**: From your OAuth provider (Google or Apple Sign-In)
- **User ID**: Unique identifier for your account
- **Notes**: Synced to Supabase cloud servers (encrypted in transit via HTTPS)

Account data is stored on Supabase servers. See [Supabase Privacy Policy](https://supabase.com/privacy).

### Analytics & Crash Reporting

We use Firebase Analytics and Crashlytics to improve app quality:
- **Screen views**: Which features are used (no content captured)
- **Events**: Note creation, design generation, purchases (counts only, no content)
- **Crash reports**: Error diagnostics to fix bugs
- **User ID**: Linked to your account if signed in (Pro users only)

This data is sent to Google Firebase via HTTPS. See [Firebase Privacy Policy](https://firebase.google.com/support/privacy).

### Optional Data You Provide
- **Gemini API Key**: If you choose to use AI-powered design features, you may enter your own Google Gemini API key. This key is stored securely on your device using iOS Keychain / Android EncryptedSharedPreferences.

### Data Sent to Third Parties

| Service | Data Sent | Purpose |
|---------|-----------|---------|
| **Google Gemini API** | Images you select | AI design generation |
| **Firebase Analytics** | Usage events, crash reports | App improvement |
| **Supabase** (Pro only) | Notes, account info | Cloud sync |
| **RevenueCat** | Purchase transactions | Subscription management |

All data is transmitted via HTTPS (encrypted in transit).

## Data We Do NOT Collect
- We do not track your location
- We do not read the content of your notes for analytics
- We do not sell any data to third parties
- We do not share your data with advertisers

## Data Security

All data transmitted from ToonNotes is encrypted in transit using HTTPS/TLS. Sensitive data like API keys and authentication tokens are stored using platform-secure storage (iOS Keychain / Android EncryptedSharedPreferences).

## Photo Library Access

ToonNotes requests access to your photo library solely to let you select images for AI-powered design creation. Selected images are processed by Google's Gemini API and are not stored on our servers.

## Camera Access

ToonNotes may request camera access to capture images for design creation. These images are processed the same way as photo library images.

## In-App Purchases

Purchase transactions are processed by Apple (App Store) or Google (Play Store) and RevenueCat. ToonNotes does not have access to your payment information.

## Children's Privacy

ToonNotes does not knowingly collect data from children under 13.

## Changes to This Policy

We may update this policy from time to time. Updates will be reflected in the "Last Updated" date.

## Contact

For questions about this privacy policy, contact: creepyblues@gmail.com

---

ToonNotes is developed by creepyblues.
