# ToonNotes Manual Test Scenarios

Pre-launch testing checklist covering all user flows. Test on both iOS and Android.

---

## Table of Contents

1. [First Launch & Onboarding](#1-first-launch--onboarding)
2. [Authentication](#2-authentication)
3. [Notes - Basic Operations](#3-notes---basic-operations)
4. [Note Editor](#4-note-editor)
5. [Checklist & Bullet Modes](#5-checklist--bullet-modes)
6. [Labels & Organization](#6-labels--organization)
7. [Boards Tab](#7-boards-tab)
8. [Designs Tab](#8-designs-tab)
9. [AI Design Generation](#9-ai-design-generation)
10. [Settings](#10-settings)
11. [Archive & Trash](#11-archive--trash)
12. [In-App Purchases](#12-in-app-purchases)
13. [Pro Features & Cloud Sync](#13-pro-features--cloud-sync)
14. [Dark Mode](#14-dark-mode)
15. [Error Handling & Edge Cases](#15-error-handling--edge-cases)
16. [Performance](#16-performance)
17. [Accessibility](#17-accessibility)
18. [Pre-Launch Checklist](#18-pre-launch-checklist)

---

## 1. First Launch & Onboarding

### 1.1 Welcome Carousel
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Fresh install, open app | Welcome carousel appears | [ ] |
| 2 | Swipe through all slides | Each slide displays correctly | [ ] |
| 3 | Complete carousel | Navigates to auth screen | [ ] |
| 4 | Force close during carousel, reopen | Resumes or restarts appropriately | [ ] |
| 5 | Tap "Skip" button | Skips to auth screen | [ ] |

### 1.2 Coach Marks
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | First visit to Boards tab | Coach mark tooltip appears | [ ] |
| 2 | Dismiss coach mark | Tooltip disappears | [ ] |
| 3 | Return to Boards tab | Coach mark does NOT reappear | [ ] |
| 4 | First visit to Designs tab | "First design is free" tooltip | [ ] |

---

## 2. Authentication

### 2.1 Google Sign-In
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Tap "Continue with Google" | Browser OAuth flow opens | [ ] |
| 2 | Complete Google login | Redirected back to app | [ ] |
| 3 | Check auth state | User session active, profile visible in Settings | [ ] |
| 4 | Close and reopen app | Session persists, still logged in | [ ] |

### 2.2 Apple Sign-In (iOS Only)
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Tap "Continue with Apple" | Native Apple ID sheet appears | [ ] |
| 2 | Complete Apple login | Redirected to main app | [ ] |
| 3 | Check Android | Apple button NOT visible on Android | [ ] |

### 2.3 Sign Out
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Settings > Sign Out | Confirmation alert appears | [ ] |
| 2 | Confirm sign out | Redirected to auth screen | [ ] |
| 3 | Check local notes | Notes still available locally | [ ] |

### 2.4 Auth Error States
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Cancel OAuth mid-flow | Returns to auth screen, no crash | [ ] |
| 2 | Network disconnected during OAuth | Error message displayed | [ ] |
| 3 | Session expires | Redirected to auth, can re-login | [ ] |

---

## 3. Notes - Basic Operations

### 3.1 Notes List
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | View notes list | 2-column grid layout | [ ] |
| 2 | Empty state (no notes) | "No notes yet" message with CTA | [ ] |
| 3 | Pull to refresh | Loading indicator, list refreshes | [ ] |

### 3.2 Create Note
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Tap + FAB button | New note created, editor opens | [ ] |
| 2 | Check note defaults | Empty title/content, white color | [ ] |
| 3 | Close editor | Note appears in list | [ ] |

### 3.3 Open & Edit Note
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Tap existing note | Editor modal opens | [ ] |
| 2 | Edit title | Changes saved after 500ms | [ ] |
| 3 | Edit content | Changes saved after 500ms | [ ] |
| 4 | Close and reopen | All changes persisted | [ ] |

### 3.4 Delete Note
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Open note > ... menu > Delete | Confirmation alert appears | [ ] |
| 2 | Confirm delete | Note removed from list | [ ] |
| 3 | Check Trash | Deleted note appears in Trash | [ ] |

### 3.5 Search
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Tap search icon | Search bar appears | [ ] |
| 2 | Type search query | Notes filtered in real-time | [ ] |
| 3 | Search matches title AND content | Both fields searched | [ ] |
| 4 | Clear search | Returns to full list | [ ] |
| 5 | Search with no results | "No notes found" message | [ ] |

### 3.6 Pin Notes
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Open note > Tap pin icon | Note pinned, icon filled | [ ] |
| 2 | Close editor, view list | Note in "PINNED" section at top | [ ] |
| 3 | Unpin note | Note moves to "RECENT" section | [ ] |

---

## 4. Note Editor

### 4.1 Color Picker
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Open color picker | 7 colors displayed | [ ] |
| 2 | Select Lavender | Note background changes | [ ] |
| 3 | Select Mint | Note background changes | [ ] |
| 4 | Close and reopen | Color persisted | [ ] |

**Colors to test:** White, Lavender, Rose, Peach, Mint, Sky, Violet

### 4.2 Archive Note
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Open note > Archive icon | Confirmation shown | [ ] |
| 2 | Confirm archive | Note removed from main list | [ ] |
| 3 | Check Archive view | Note appears there | [ ] |

### 4.3 Share Note
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Open note > Share icon | Note rendered as image | [ ] |
| 2 | Share dialog | Native share sheet opens | [ ] |
| 3 | Share to Messages/Notes | Image received correctly | [ ] |

### 4.4 Apply Design
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Open note > Design icon | Design picker opens | [ ] |
| 2 | Select a design | Design applied to note | [ ] |
| 3 | Note background/colors update | Matches design preview | [ ] |
| 4 | Close and reopen | Design persisted | [ ] |

---

## 5. Checklist & Bullet Modes

### 5.1 Checklist Mode
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Tap checklist icon in toolbar | Checklist editor activates | [ ] |
| 2 | Type item, press Enter | New item created below | [ ] |
| 3 | Tap checkbox | Item marked as checked | [ ] |
| 4 | Tap again | Item unchecked | [ ] |
| 5 | Delete item (backspace on empty) | Item removed, focus moves up | [ ] |
| 6 | Add 10+ items | All items persist correctly | [ ] |
| 7 | Close and reopen | Checklist state preserved | [ ] |

### 5.2 Bullet List Mode
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Tap bullet icon in toolbar | Bullet editor activates | [ ] |
| 2 | Type item, press Enter | New bullet point created | [ ] |
| 3 | Close and reopen | Bullet list preserved | [ ] |

### 5.3 Mode Switching
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Create checklist, switch to bullet | Content converted (or warning) | [ ] |
| 2 | Switch back to plain text | Content preserved | [ ] |

---

## 6. Labels & Organization

### 6.1 Add Label to Note
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Open note > Tap label icon | Label picker opens | [ ] |
| 2 | Select existing label | Label added to note | [ ] |
| 3 | Label pill appears in editor | Shows label name | [ ] |
| 4 | Close and reopen | Label persisted | [ ] |

### 6.2 Create Custom Label
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Label picker > Type new name | "Create [name]" option appears | [ ] |
| 2 | Create label | Label created and applied | [ ] |
| 3 | Check other notes | New label available to select | [ ] |

### 6.3 Hashtag Autocomplete
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Type # in note content | Autocomplete dropdown appears | [ ] |
| 2 | Type partial label name | Filtered suggestions shown | [ ] |
| 3 | Select suggestion | Label added to note | [ ] |

### 6.4 Label Preset Designs
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Add "Todo" label | Design auto-applied | [ ] |
| 2 | Add "Reading" label | Design auto-applied | [ ] |
| 3 | Check note appearance | Colors/fonts match preset | [ ] |

**Test these preset labels:**
- Productivity: Todo, In-Progress, Done, Priority
- Media: Reading, Watchlist, Bookmarks
- Creative: Ideas, Draft, Brainstorm
- Personal: Journal, Memory, Gratitude

### 6.5 Remove Label
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Tap X on label pill | Label removed | [ ] |
| 2 | If design was from label | Design cleared | [ ] |

---

## 7. Boards Tab

### 7.1 View Boards
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Navigate to Boards tab | Board list displayed | [ ] |
| 2 | Empty state (no labels) | "No boards yet" message | [ ] |
| 3 | With labels | Boards created from labels | [ ] |

### 7.2 Board Details
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Tap board card | Board detail modal opens | [ ] |
| 2 | Check content | All notes with that label shown | [ ] |
| 3 | Tap note in board | Note editor opens | [ ] |

### 7.3 Board Preview
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | View board card | Shows note count | [ ] |
| 2 | Shows recent notes | Preview thumbnails visible | [ ] |
| 3 | Board colors | Matches preset styling | [ ] |

---

## 8. Designs Tab

### 8.1 Designs Gallery
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Navigate to Designs tab | 2-column grid of designs | [ ] |
| 2 | Empty state | "No custom designs yet" CTA | [ ] |
| 3 | With designs | Design cards displayed | [ ] |

### 8.2 Free Design Quota
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | New user | "3 of 3 Free Designs" shown | [ ] |
| 2 | Create 1 design | "2 of 3 Free Designs" | [ ] |
| 3 | Create 3 designs | "0 of 3 Free Designs" | [ ] |
| 4 | Try 4th design | Requires coins or upgrade | [ ] |

### 8.3 Delete Design
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Long-press design card | Delete option appears | [ ] |
| 2 | Confirm delete | Design removed from gallery | [ ] |
| 3 | Notes using design | Not deleted (design ref cleared) | [ ] |

### 8.4 Apply Design to Note
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Tap design card | Creates new note with design | [ ] |
| 2 | Check note | Design applied correctly | [ ] |

---

## 9. AI Design Generation

### 9.1 Create Design from Image
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Designs > + or Create | Design creation opens | [ ] |
| 2 | Select image from gallery | Image picker opens | [ ] |
| 3 | Choose image | Processing begins | [ ] |
| 4 | Loading indicator | Shows generation progress | [ ] |
| 5 | Design generated | Colors, typography, sticker shown | [ ] |
| 6 | Save design | Added to gallery | [ ] |

### 9.2 Sticker Generation
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Image with subject | Sticker extracted | [ ] |
| 2 | Background removed | Clean sticker outline | [ ] |
| 3 | Sticker positioned | Appears in design preview | [ ] |

### 9.3 "Feeling Lucky" Design
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Tap "Feeling Lucky" button | Random design generated | [ ] |
| 2 | Design style | Chaotic/dramatic/unique | [ ] |

### 9.4 AI Label Suggestions
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Create note with content | Label suggestion toast appears | [ ] |
| 2 | Tap suggestion | Label applied to note | [ ] |
| 3 | Design auto-applied | If label has preset | [ ] |
| 4 | Dismiss toast | No label added | [ ] |

### 9.5 AI Error Handling
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Disconnect internet | Error message shown | [ ] |
| 2 | API timeout | Retry option available | [ ] |
| 3 | Invalid image | Graceful error, can retry | [ ] |

---

## 10. Settings

### 10.1 Profile Section
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | View profile | Avatar, name, email displayed | [ ] |
| 2 | Matches OAuth provider | Data from Google/Apple | [ ] |

### 10.2 Appearance
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Toggle Dark Mode | App theme switches | [ ] |
| 2 | Setting persists | Survives app restart | [ ] |

### 10.3 Economy Display
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | View coin balance | Current balance shown | [ ] |
| 2 | Tap coins | Opens coin shop | [ ] |

### 10.4 Delete Account
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Tap Delete Account | Alert explains process | [ ] |
| 2 | Tap Continue | Opens web deletion page | [ ] |

### 10.5 Debug Section (Admin Only)
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Login as creepyblues@gmail.com | Debug section visible | [ ] |
| 2 | Add 100 Coins | Balance increases | [ ] |
| 3 | Clear Unpinned Notes | Notes deleted | [ ] |
| 4 | Reset Onboarding | Coach marks reset | [ ] |

---

## 11. Archive & Trash

### 11.1 Archive View
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Settings > Archive | Archive view opens | [ ] |
| 2 | View archived notes | 2-column grid | [ ] |
| 3 | Tap archived note | Editor opens | [ ] |
| 4 | Unarchive note | Returns to main list | [ ] |

### 11.2 Trash View
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Settings > Trash | Trash view opens | [ ] |
| 2 | View deleted notes | Shows deletion date | [ ] |
| 3 | Restore note | Returns to main list | [ ] |
| 4 | Delete forever | Confirmation alert | [ ] |
| 5 | Confirm permanent delete | Note removed completely | [ ] |

### 11.3 Empty Trash
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Trash > Empty Trash | Confirmation with count | [ ] |
| 2 | Confirm | All notes permanently deleted | [ ] |
| 3 | Trash empty | Empty state displayed | [ ] |

---

## 12. In-App Purchases

### 12.1 Coin Shop
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Settings > Tap coins | Coin shop opens | [ ] |
| 2 | View packages | Starter, Popular, Best Value | [ ] |
| 3 | Prices displayed | From RevenueCat | [ ] |

### 12.2 Purchase Coins (Sandbox)
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Select package | Purchase dialog appears | [ ] |
| 2 | Complete with sandbox account | Purchase processed | [ ] |
| 3 | Coins added | Balance updated immediately | [ ] |

### 12.3 Pro Subscription
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | View Pro card | Benefits listed | [ ] |
| 2 | Tap Subscribe | Subscription dialog | [ ] |
| 3 | Complete subscription | Pro status active | [ ] |
| 4 | Settings shows Pro | ACTIVE badge, renewal date | [ ] |

### 12.4 Manage Subscription
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Settings > Manage Subscription | Opens management page | [ ] |
| 2 | Can cancel/modify | Subscription settings accessible | [ ] |

### 12.5 Purchase Errors
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Cancel mid-purchase | No coins deducted | [ ] |
| 2 | Network error | Error message, can retry | [ ] |
| 3 | Expo Go (no native module) | Graceful fallback | [ ] |

---

## 13. Pro Features & Cloud Sync

### 13.1 Cloud Sync Activation
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Subscribe to Pro | Cloud sync enabled | [ ] |
| 2 | Create note | Synced to Supabase | [ ] |
| 3 | Check Supabase | Note in user_notes table | [ ] |

### 13.2 Cross-Device Sync
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Login on Device A (Pro) | Notes loaded | [ ] |
| 2 | Create note on Device A | Note synced | [ ] |
| 3 | Open app on Device B | Note appears | [ ] |
| 4 | Edit on Device B | Changes sync to Device A | [ ] |

### 13.3 Offline Sync
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Go offline | Can still create/edit | [ ] |
| 2 | Create note offline | Saved locally | [ ] |
| 3 | Go online | Note syncs automatically | [ ] |

### 13.4 Monthly Coin Grant
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Pro subscription renews | 100 coins granted | [ ] |
| 2 | Check last grant date | Prevents duplicate grants | [ ] |

### 13.5 Unlimited Designs (Pro)
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | As Pro user | No design limit | [ ] |
| 2 | Create 10+ designs | All succeed without coins | [ ] |

---

## 14. Dark Mode

### 14.1 Theme Switching
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Enable dark mode | Background: dark gray | [ ] |
| 2 | Text colors | White/light gray | [ ] |
| 3 | Note cards | Surface color adjusted | [ ] |
| 4 | Tab bar | Dark background | [ ] |

### 14.2 Note Colors in Dark Mode
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | View white note | Background darkened | [ ] |
| 2 | View colored note | Color preserved or adjusted | [ ] |
| 3 | Text readable | Sufficient contrast | [ ] |

### 14.3 Design Colors in Dark Mode
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | View design in dark mode | Colors still visible | [ ] |
| 2 | Text on design | Readable | [ ] |

### 14.4 Persistence
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Enable dark mode | Applied | [ ] |
| 2 | Close app | --- | [ ] |
| 3 | Reopen app | Still in dark mode | [ ] |

---

## 15. Error Handling & Edge Cases

### 15.1 Network Errors
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Disconnect internet | App continues working | [ ] |
| 2 | Try sync operation | Error message shown | [ ] |
| 3 | Try AI feature | Error with retry option | [ ] |
| 4 | Reconnect | Operations resume | [ ] |

### 15.2 Data Validation
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Enter `<script>` in title | Text sanitized | [ ] |
| 2 | Enter 10,000 characters | Handled gracefully | [ ] |
| 3 | Special characters | Saved correctly | [ ] |
| 4 | Emoji in title/content | Displayed correctly | [ ] |

### 15.3 Image Errors
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Select very large image | Resized or error | [ ] |
| 2 | Select unsupported format | Error message | [ ] |
| 3 | Cancel image picker | No crash | [ ] |

### 15.4 Missing Data
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Note refs deleted design | Fallback styling applied | [ ] |
| 2 | Note refs deleted label | Label name still shown | [ ] |

### 15.5 Concurrent Operations
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Rapid tap create note | Only 1 note created | [ ] |
| 2 | Rapid save edits | Debounced, no duplicates | [ ] |

---

## 16. Performance

### 16.1 List Performance
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Create 100 notes | List loads quickly | [ ] |
| 2 | Scroll rapidly | Smooth 60fps | [ ] |
| 3 | No jank or stuttering | --- | [ ] |

### 16.2 App Startup
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Cold start app | Loads in < 2 seconds | [ ] |
| 2 | With many notes | Still loads quickly | [ ] |

### 16.3 Editor Performance
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Type rapidly | No lag | [ ] |
| 2 | Long note content | Scrolls smoothly | [ ] |
| 3 | Switch designs | Instant update | [ ] |

---

## 17. Accessibility

### 17.1 Screen Reader
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Enable VoiceOver (iOS) | All elements labeled | [ ] |
| 2 | Navigate with gestures | Logical order | [ ] |
| 3 | Buttons announce role | "Button" role spoken | [ ] |
| 4 | Enable TalkBack (Android) | All elements labeled | [ ] |

### 17.2 Text Scaling
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Increase system font size | App text scales | [ ] |
| 2 | Layout still usable | No overflow/clipping | [ ] |

### 17.3 Color Contrast
| # | Step | Expected Result | Pass |
|---|------|-----------------|------|
| 1 | Light mode | Text readable | [ ] |
| 2 | Dark mode | Text readable | [ ] |
| 3 | All note colors | Sufficient contrast | [ ] |

---

## 18. Pre-Launch Checklist

### Environment
| Item | Status |
|------|--------|
| Supabase URL configured | [ ] |
| Supabase anon key configured | [ ] |
| RevenueCat API keys configured | [ ] |
| Firebase configuration active | [ ] |
| Sentry DSN configured | [ ] |
| Vercel edge functions deployed | [ ] |
| Gemini API key set on Vercel | [ ] |

### Build Verification
| Item | Status |
|------|--------|
| `npx tsc --noEmit` passes | [ ] |
| No console errors in production | [ ] |
| iOS build successful | [ ] |
| Android build successful | [ ] |
| TestFlight upload successful | [ ] |
| Play Store upload successful | [ ] |

### Data
| Item | Status |
|------|--------|
| AsyncStorage persistence works | [ ] |
| Data survives app restart | [ ] |
| Cloud sync functional (Pro) | [ ] |

### Security
| Item | Status |
|------|--------|
| OAuth tokens stored securely | [ ] |
| No API keys in client code | [ ] |
| Content sanitization active | [ ] |

### Final Smoke Test
| Item | Status |
|------|--------|
| Create account | [ ] |
| Create 5 notes with different features | [ ] |
| Create 1 custom design | [ ] |
| Apply labels and designs | [ ] |
| Archive and restore note | [ ] |
| Delete and restore note | [ ] |
| Purchase coins (sandbox) | [ ] |
| Dark mode toggle | [ ] |
| Share note | [ ] |
| Sign out and sign back in | [ ] |

---

## Test Data Recommendations

1. **Create 10-20 test notes** with:
   - Different colors (all 7)
   - Various labels (test all preset categories)
   - With and without images
   - Checklist and bullet formats
   - Pinned and unpinned

2. **Test all 30 label presets** across categories:
   - Productivity (5)
   - Planning (5)
   - Checklists (5)
   - Media (5)
   - Creative (5)
   - Personal (5)

3. **Device Matrix**:
   - iPhone (latest iOS)
   - iPhone (iOS 15 minimum)
   - Android phone (latest)
   - Android phone (older version)
   - iPad (if supported)

---

## Bug Report Template

```
**Summary:** [Brief description]
**Steps to Reproduce:**
1.
2.
3.
**Expected:** [What should happen]
**Actual:** [What happened]
**Device:** [iPhone 15 / Pixel 8 / etc.]
**OS Version:** [iOS 17.2 / Android 14]
**App Version:** [1.0.0]
**Screenshot/Video:** [Attach if applicable]
```

---

*Last updated: January 2025*
