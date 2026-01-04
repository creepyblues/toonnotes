# Cloud Backup Strategy

> **Status**: Planned (not yet implemented)
> **Last Updated**: January 2026
> **Decision**: Sync = Premium Feature at $24.99/year

---

## Executive Summary

ToonNotes will offer cloud backup as a **premium feature** using Supabase. Free users get local-only storage, while Pro subscribers ($24.99/year) get cross-device sync between iOS and Android.

This follows the industry standard set by Bear ($15/yr), Day One ($35/yr), and Craft ($60/yr).

---

## Pricing Tiers

| Tier | Price | Cloud Sync | AI Designs | Account Required |
|------|-------|------------|------------|------------------|
| **Free** | $0 | Local only | 3 free | No |
| **Pro** | $24.99/year | Full sync | Unlimited | Yes |

**Monthly option**: $2.99/month (for users who prefer flexibility)

---

## Why This Strategy

### 1. Cost Containment
Only paying users consume cloud resources. Free tier has $0 infrastructure cost.

### 2. Clear Value Proposition
"Never lose your notes. Sync across all your devices." is tangible and easy to understand.

### 3. Industry Precedent
| App | Sync Pricing | Notes |
|-----|--------------|-------|
| Bear | $15/year | Sync + themes |
| Day One | $35/year | Sync + photos |
| Standard Notes | $90/year | E2E encryption |
| Craft | $60/year | Collaboration |

### 4. Strong Unit Economics
- **Cost per user**: ~$0.50/year at scale
- **Revenue per user**: $24.99/year (if Pro)
- **Margin**: ~80%

---

## Infrastructure: Supabase

### Why Supabase
1. **Already integrated** - Auth (Google/Apple) working, schema exists
2. **Cross-platform** - Same backend for iOS and Android
3. **Cost-effective** - Generous free tier, predictable Pro pricing
4. **Full control** - We own the data and sync logic

### Supabase Pricing

| Resource | Free Tier | Pro ($25/mo) | Overage |
|----------|-----------|--------------|---------|
| Database | 500 MB | 8 GB | $0.125/GB |
| File Storage | 1 GB | 100 GB | $0.021/GB |
| Bandwidth | 5 GB | 250 GB | $0.09/GB |
| MAUs | 50,000 | 100,000 | $0.00325/MAU |

### Cost Projections

| Active Pro Users | Est. Storage | Est. Bandwidth | Monthly Cost |
|------------------|--------------|----------------|--------------|
| 500 | 2.5 GB | 25 GB | $25 (base) |
| 1,000 | 5 GB | 50 GB | $25 (base) |
| 5,000 | 25 GB | 250 GB | ~$30 |
| 10,000 | 50 GB | 500 GB | ~$55 |
| 50,000 | 250 GB | 2.5 TB | ~$280 |

---

## User Experience

### Free Users

```
┌─────────────────────────────────────────┐
│ Cloud Backup                            │
├─────────────────────────────────────────┤
│                                         │
│  Your notes are stored on this device.  │
│                                         │
│  Upgrade to Pro to:                     │
│  • Sync across all your devices         │
│  • Never lose your notes                │
│  • Get unlimited AI designs             │
│                                         │
│  [  Upgrade to Pro - $24.99/year  ]     │
│                                         │
└─────────────────────────────────────────┘
```

### Pro Users

```
┌─────────────────────────────────────────┐
│ Cloud Backup                     PRO    │
├─────────────────────────────────────────┤
│                                         │
│  Signed in as: user@email.com           │
│                                         │
│  ✓ Sync enabled                         │
│                                         │
│  Last synced: 2 minutes ago             │
│  12 notes • 3 designs synced            │
│                                         │
│  [       Sync Now       ]               │
│                                         │
└─────────────────────────────────────────┘
```

### Upgrade Trigger Points

1. **Settings > Cloud Backup** - Primary upgrade prompt
2. **After 30+ notes created** - "Protect your notes with cloud backup"
3. **App reinstall detected** - "Welcome back! Upgrade to restore your notes"
4. **New device sign-in** - "Sync your notes from your other device"

---

## Technical Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Note CRUD Operation                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Local Store (Zustand)                      │
│                 AsyncStorage persistence                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ (if Pro user, debounced 500ms)
┌─────────────────────────────────────────────────────────────┐
│                      Sync Service                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Online?     │→ │ Upload to   │→ │ Update sync status  │  │
│  │ Yes: sync   │  │ Supabase    │  │ (synced/error)      │  │
│  │ No: queue   │  └─────────────┘  └─────────────────────┘  │
│  └─────────────┘                                             │
│         │                                                    │
│         ▼ (when offline)                                     │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Offline Queue (AsyncStorage)                             ││
│  │ - Pending operations stored                              ││
│  │ - Retry on reconnect                                     ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Cloud                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │
│  │ profiles │  │  notes   │  │ designs  │  │ Storage     │  │
│  │          │  │          │  │          │  │ (images)    │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Paywall Check

```typescript
// Check subscription status before syncing
const shouldSync = () => {
  const { user } = useUserStore.getState();
  return user.subscriptionStatus === 'pro';
};

// In noteStore CRUD operations
if (shouldSync()) {
  await syncService.uploadNote(note);
}
```

### Conflict Resolution

**Strategy**: `latest_wins` (compare `updatedAt` timestamps)

| Scenario | Resolution |
|----------|------------|
| Cloud newer than local | Use cloud version |
| Local newer than cloud | Use local version |
| Same timestamp | Prefer local (active device) |
| Deleted on cloud | Respect deletion |
| Deleted locally | Restore from cloud (on initial sync) |

### What Gets Synced

| Data Type | Synced | Storage Location |
|-----------|--------|------------------|
| Notes (text) | Yes | `notes` table |
| Note images | Yes | Supabase Storage |
| Designs | Yes | `designs` table |
| Labels | Yes | `labels` table |
| Boards | Yes | `boards` table |
| User profile | Yes | `profiles` table |
| Coin balance | Yes | `profiles` table |
| Settings | Yes | `profiles` table |

---

## Implementation Phases

### Prerequisites
- [ ] Configure RevenueCat products (`toonnotes_pro_yearly`, `toonnotes_pro_monthly`)
- [ ] Upgrade Supabase to Pro tier (when launching)
- [ ] Create `note-images` Storage bucket

### Phase 1: Note Sync (MVP)
- [ ] Add subscription status check to sync service
- [ ] Wire `uploadNote()` to note create/update
- [ ] Trigger full sync on Pro user sign-in
- [ ] Add sync status UI in Settings
- [ ] Add upgrade prompt for free users

### Phase 2: Image Storage
- [ ] Create Supabase Storage bucket with RLS
- [ ] Implement image upload service
- [ ] Compress images before upload
- [ ] Replace local URIs with cloud URLs

### Phase 3: Full Sync
- [ ] Sync designs (with source images)
- [ ] Sync labels
- [ ] Sync boards
- [ ] Sync user economy (coins, design usage)

### Phase 4: Polish
- [ ] Offline queue with retry logic
- [ ] Real-time sync (optional)
- [ ] Sync progress indicator
- [ ] Error recovery UI

---

## Files to Modify

| File | Purpose |
|------|---------|
| `services/syncService.ts` | Add status tracking, paywall check, offline queue |
| `stores/noteStore.ts` | Wire sync to CRUD operations |
| `stores/userStore.ts` | Add subscription status, sync economy |
| `app/_layout.tsx` | Trigger sync on auth state change |
| `app/(tabs)/settings.tsx` | Sync status UI, upgrade prompts |
| `services/imageStorageService.ts` | NEW: Image upload to Supabase Storage |
| `services/purchaseService.ts` | Add Pro subscription products |

---

## Marketing Copy

### App Store Description
> **Cloud Backup (Pro)**: Never lose your notes. Sync seamlessly across all your devices - iPhone, iPad, and Android. Your notes are always with you.

### Upgrade Modal
> **Sync Your Notes Everywhere**
>
> With ToonNotes Pro, your notes automatically sync across all your devices. Switch between your iPhone and Android tablet without missing a beat.
>
> • Automatic cloud backup
> • Sync across iOS and Android
> • Restore on any new device
> • Unlimited AI designs
>
> **$24.99/year** (less than $3/month)

### Free User Messaging
> Your notes are stored securely on this device. Upgrade to Pro to sync across all your devices and never lose a note.

---

## Alternatives Considered

### iCloud / Google Drive (Native Cloud)
**Rejected because**:
- No mature React Native library for iCloud
- Would require 2x implementation (iOS + Android separate)
- No cross-platform sync (iOS user couldn't restore on Android)
- Less control over sync behavior

### Free Sync for Everyone (Notion Model)
**Rejected because**:
- Every user costs money (storage, bandwidth)
- Harder to monetize - must sell features instead
- Freemium conversion typically 2-5%, need huge user base

### Limited Free Sync (50 notes)
**Considered but rejected because**:
- Free tier still costs money
- Confusing limits ("why can't I sync this note?")
- Harder upgrade messaging

---

## References

- [Supabase Pricing](https://supabase.com/pricing)
- [Bear App](https://bear.app) - $15/year sync model
- [Day One Pricing](https://dayoneapp.com/pricing/) - $35/year
- [Standard Notes](https://standardnotes.com/plans) - $90/year
- [Freemium Economics - Adapty](https://adapty.io/blog/freemium-app-monetization-strategies/)
