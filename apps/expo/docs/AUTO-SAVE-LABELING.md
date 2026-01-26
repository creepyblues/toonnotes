# Auto-Save & Smart Auto-Labeling System

## Overview

This document describes the auto-save and smart auto-labeling architecture for ToonNotes. The system balances seamless UX with cost-effective API usage through intelligent triggers and caching.

## Auto-Save Strategy

### Hybrid Debounce + Throttle

The auto-save system uses a hybrid approach combining debounce and throttle:

```
User typing: ▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮
Debounce (500ms):                    ▼ save (after pause)
Throttle (5s max):      ▼ save          ▼ save    ▼ save
```

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| `DEBOUNCE_MS` | 500ms | Industry standard for responsive auto-save |
| `THROTTLE_MAX_MS` | 5000ms | Guarantees periodic saves during continuous typing |

### Why This Approach?

**Industry Research:**
- **Google Docs**: Real-time operational transform + server sync every few seconds
- **Notion**: ~300ms debounce + periodic sync
- **Apple Notes**: Immediate local save, background cloud sync
- **Obsidian**: 2-second configurable debounce

**Key Insight**: Pure debounce risks data loss during long typing sessions. Adding a throttle ceiling ensures saves happen at least every 5 seconds.

### Implementation

Located in: `/hooks/editor/useAutoSave.ts`

```typescript
interface UseAutoSaveOptions {
  debounceMs?: number;      // Default: 500
  throttleMs?: number;      // Default: 5000
  onSave?: () => void;
  onContentStable?: (snapshot: ContentSnapshot) => void;
}
```

The `onContentStable` callback integrates with the smart labeling system.

---

## Smart Auto-Labeling System

### Problem

Previously, label analysis was triggered only when the user exited the note editor. This caused:
- 1-3 second wait for API response
- Poor UX - felt like app was blocking exit
- User frustration

### Solution: Background Analysis with Smart Triggers

Run analysis **before** user exits, so results are cached and ready when needed.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                SMART TRIGGER DECISION TREE                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Content Change] ───> [Update Change Tracker]              │
│                           │                                  │
│                           ▼                                  │
│  [Check Triggers] ───> Should Analyze?                      │
│        │                                                     │
│        ├──> Idle timeout (3s no typing)? ──────────> YES    │
│        ├──> Content stability (same for 5s)? ──────> YES    │
│        ├──> Significant change (>50 chars)? ───────> YES    │
│        ├──> Already analyzed this content? ────────> NO     │
│        └──> Too soon (cooldown 30s)? ──────────────> NO     │
│                           │                                  │
│                           ▼                                  │
│  [Queue Background Analysis] ───> [Cache Result by Hash]    │
│                                                              │
│  [User Exits] ───> [Check Cache] ───> Results Ready? > Show!│
└─────────────────────────────────────────────────────────────┘
```

### Trigger Heuristics

| Trigger | Condition | Priority | Rationale |
|---------|-----------|----------|-----------|
| **Idle Timeout** | 3s no keystroke | High | User paused to think/review |
| **Content Stability** | Same content hash for 5s | High | Content has settled |
| **Significant Change** | +50 chars since last analysis | Medium | Meaningful new content |
| **Min Content** | Title >3 chars OR content >20 chars | Gate | Avoid analyzing empty notes |
| **Cooldown** | 30s since last analysis | Gate | Prevent API spam |
| **Hash Match** | Content unchanged from cache | Block | Avoid redundant calls |

### Caching Strategy

```typescript
interface AnalysisCache {
  contentHash: string;        // Hash of (title + content)
  result: LabelAnalysisResponse;
  timestamp: number;
  ttl: number;               // 10 minutes
}
```

**Cache Invalidation:**
- TTL expiration (10 minutes)
- New label created (existing labels list changed)
- Max entries exceeded (LRU eviction)

### Configuration

Located in: `/constants/autoLabeling.ts`

```typescript
export const AUTO_LABELING_CONFIG = {
  // Trigger timings
  IDLE_TIMEOUT_MS: 3000,          // 3 seconds of no typing
  STABILITY_TIMEOUT_MS: 5000,     // 5 seconds of unchanged content
  SIGNIFICANT_CHANGE_CHARS: 50,   // Characters changed threshold
  COOLDOWN_MS: 30000,             // 30 seconds between analyses

  // Content thresholds
  MIN_TITLE_LENGTH: 3,
  MIN_CONTENT_LENGTH: 20,

  // Cache settings
  CACHE_TTL_MS: 600000,           // 10 minutes
  MAX_CACHE_ENTRIES: 50,
} as const;
```

### Implementation Files

| File | Purpose |
|------|---------|
| `/services/autoLabelingService.ts` | Core service with triggers and caching |
| `/hooks/editor/useSmartAutoLabeling.ts` | React hook for editor integration |
| `/constants/autoLabeling.ts` | Configuration constants |

---

## Cost Optimization

### API Cost Profile
- Gemini 2.0 Flash: ~$0.00015 per 1K input tokens
- Average note: ~200 tokens input
- Cost per analysis: ~$0.00003

### Projected Savings

| Metric | Before | After |
|--------|--------|-------|
| Analyses per session | 1 per note exit | 1-2 per note (cached) |
| Cache hit rate | 0% | ~60-70% |
| Redundant calls | ~30% | ~5% |
| **Net API calls** | Baseline | **-20% to -40%** |

**Why smart triggers reduce costs:**
1. Hash deduplication prevents identical content re-analysis
2. Background analysis catches stable content early
3. Cooldown prevents rapid-fire analyses
4. Cached results eliminate exit-time analysis

---

## User Experience Flow

### Before (Blocking)
```
User clicks back → Wait 1-3s → Toast appears → Navigate
```

### After (Non-blocking)
```
User types → [3s idle] → Background analysis → Cache result
User clicks back → Instant toast → Navigate immediately
```

### Sequence Diagram

```
User          Editor           AutoSave         SmartLabeling      API
 │              │                 │                  │               │
 │──typing──────│                 │                  │               │
 │              │──debounce 500ms─│                  │               │
 │──pause 3s────│                 │                  │               │
 │              │                 │──idle trigger────│               │
 │              │                 │                  │──analyze────→ │
 │              │                 │                  │←───result──── │
 │              │                 │                  │──cache─────── │
 │──exit────────│                 │                  │               │
 │              │──beforeRemove───│                  │               │
 │              │                 │──immediate save──│               │
 │              │                 │                  │──get cache─── │
 │              │←─show toast (INSTANT!)─────────────│               │
 │←─navigate────│                 │                  │               │
```

---

## Testing & Verification

### Manual Tests

1. **Auto-save throttle**: Type continuously for 10+ seconds, verify saves happen at most every 5s
2. **Idle trigger**: Pause typing for 3s, check console for background analysis log
3. **Cache hit**: Exit note immediately after idle analysis, verify instant navigation
4. **Cooldown**: Trigger analysis, edit within 30s, verify no redundant analysis
5. **Exit UX**: Close note with content, verify toast appears without blocking

### Success Metrics

| Metric | Target |
|--------|--------|
| Exit latency | <200ms (down from 1-3s) |
| Cache hit rate | 60-70% |
| API cost reduction | 20-40% |

---

## Related Documentation

- [UX Documentation](./UX-DOCUMENTATION.md) - User flow specifications
- [Analytics](./ANALYTICS.md) - Event tracking for auto-labeling
