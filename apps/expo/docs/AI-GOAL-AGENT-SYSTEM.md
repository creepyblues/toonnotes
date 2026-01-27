# AI Goal-Agent System

AI analyzes note content to infer goals, generate action steps, and deliver nudges based on engagement level. This system extends the MODE Framework by adding goal inference, step tracking, and adaptive nudge scheduling.

## Overview

When a user writes a note with enough content, the system:

1. Detects the note's MODE (Manage, Develop, Organize, Experience)
2. Sends title + content to Gemini AI for goal inference
3. AI classifies the note into an **engagement level** and generates 3–7 action steps
4. The system nudges the user through each step based on the engagement level

```
Note edited → Content threshold met → Debounce 10s → AI analysis
  → engagement: active  → Scheduled nudges (toast → sheet → notification)
  → engagement: passive → Nudge on note open if step stale > 7 days
  → engagement: none    → No goal, no nudges
```

---

## Nudge Engagement Levels

AI determines the engagement level based on note content and inferred intent:

| Level | When | Nudge Behavior | Examples |
|-------|------|----------------|----------|
| **Active** | Clear actionable goal with urgency/deadline | Scheduled nudges. Cadence: 1h first, 4h base, 2x back-off on dismiss (max 48h). Max 3/day. Quiet hours 10PM–8AM. | "Trip to Japan" with checklist, "Q1 OKRs due Feb 1" |
| **Passive** | Goal exists but no urgency; creative/exploratory | Nudge only on note open if current step pending > 7 days. GoalProgressCard visible in editor. | "Story ideas for novel", journal entries |
| **None** | No actionable goal; archival/reference | No goal generated, no nudges. Note flagged to avoid re-analysis. | Bookmarked URLs, copied text, simple reference lists |

---

## Data Models

### NoteGoal

```typescript
interface NoteGoal {
  id: string;                          // "goal_<timestamp>_<counter>_<random>"
  noteId: string;
  mode: Mode;                          // manage | develop | organize | experience
  agentId: AgentId;                    // manager | muse | librarian | biographer
  nudgeEngagement: NudgeEngagement;    // active | passive | none
  goalStatement: string;               // "Plan your Japan trip"
  reasoning: string;                   // Why AI inferred this goal
  engagementReasoning: string;         // Why this engagement level
  steps: ActionStep[];                 // 3–7 steps
  status: GoalStatus;                  // analyzing | active | paused | achieved | abandoned
  createdAt: number;
  updatedAt: number;
  achievedAt?: number;
  revision: number;                    // Increments on re-analysis
  lastAnalyzedContentHash: string;     // Prevents redundant analysis
  nextNudgeAt?: number;                // Active goals only
  nudgeCadenceMs: number;              // Default 4h, adapts via back-off
  totalNudgesSent: number;
  consecutiveDismissals: number;
}
```

### ActionStep

```typescript
interface ActionStep {
  id: string;
  order: number;
  title: string;                       // "Book flights" (3–5 words)
  description: string;                 // Agent-voice nudge text (1 sentence)
  status: ActionStepStatus;            // pending | in_progress | completed | skipped
  completedAt?: number;
  nudgeCount: number;
  lastNudgedAt?: number;
  actionType: 'prompt_user' | 'auto_detect' | 'manual_check';
  autoDetectField?: string;
  autoDetectCondition?: 'exists' | 'gt' | 'contains';
  autoDetectValue?: string | number;
}
```

### GoalFeedback (Beta)

```typescript
interface GoalFeedback {
  noteId: string;
  goalId: string;
  goalStatement: string;
  engagement: NudgeEngagement;
  feedbackText: string;
  timestamp: number;
  userId?: string;
  appVersion: string;
}
```

---

## Architecture

### Files

| File | Purpose |
|------|---------|
| `types/index.ts` | NoteGoal, ActionStep, NudgeEngagement, GoalFeedback types; `complete_step` NudgeAction |
| `stores/goalStore.ts` | Zustand store — goal CRUD, step management, nudge tracking, back-off logic |
| `services/goalAnalysisService.ts` | Debounced analysis, content threshold, edge function orchestration |
| `services/goalNudgeScheduler.ts` | 30-min interval scheduler for active goals; passive goal evaluation |
| `services/customHandlers.ts` | `complete_goal_step` and `open_goal_feedback` nudge action handlers |
| `components/goals/GoalProgressCard.tsx` | In-editor goal card — progress bar, step checklist, controls |
| `components/goals/FeedbackSheet.tsx` | Beta feedback modal — text input, sends to Slack + email |
| `api/analyze-note-goal.ts` | Gemini edge function — infers goal, steps, engagement level |
| `api/send-goal-feedback.ts` | Edge function — sends feedback to Slack webhook + Resend email |
| `constants/onboardingConfig.ts` | GOAL_TIPS coach mark (order 8) |

### Integration Points

| File | Change |
|------|--------|
| `stores/noteStore.ts` | Calls `goalAnalysisService.scheduleAnalysis()` after `updateNote`; calls `cleanupForNote()` on `deleteNote` |
| `services/nudgeDeliveryService.ts` | Handles `complete_step` action type → delegates to `complete_goal_step` handler |
| `app/note/[id].tsx` | Renders GoalProgressCard + FeedbackSheet for active/passive goals |
| `app/(tabs)/settings.tsx` | "AI Goal Suggestions" toggle in Learning section |
| `app/_layout.tsx` | Starts/stops `goalNudgeScheduler` on mount/unmount |

---

## Analysis Pipeline

### Content Threshold

Analysis triggers when:
- `title.length >= 3` AND
- `content.length >= 20` OR `checklist items >= 2`

### Debounce & Deduplication

1. **Debounce**: 10 seconds after last edit (per noteId)
2. **Content hash**: Simple string hash of `title::content` — skips analysis if hash unchanged
3. **No-goal cache**: Notes classified as `none` are cached with their content hash to avoid re-analysis
4. **Feature toggle**: Respects `goalSuggestionsEnabled` setting

### Analysis Flow

```
scheduleAnalysis(noteId, title, content)
  → Check feature toggle
  → Check content threshold
  → Compare content hash
  → Check no-goal cache
  → Debounce 10s
  → analyzeAndGenerateGoal()
      → Get mode/agent from behavior store
      → Extract completed steps from existing goal
      → POST /api/analyze-note-goal
      → If engagement = 'none' → markAsNoGoal(), return null
      → Build NoteGoal (preserve completed steps across revisions)
      → For active goals: set nextNudgeAt = now + 1 hour
      → Store in goalStore
```

### Edge Function: `/api/analyze-note-goal`

**Input**: `{ noteTitle, noteContent, mode, agentId, completedSteps[] }`

**Validation**: title ≤ 500 chars, content ≤ 10,000 chars

**AI prompt** instructs Gemini to:
1. Classify engagement level (active/passive/none) with reasoning
2. Infer a goal statement (5–10 words)
3. Generate 3–7 action steps in the agent's voice

**Agent voices**:
- **Manager**: Direct and action-oriented
- **Muse**: Playful and encouraging
- **Librarian**: Organized and methodical
- **Biographer**: Warm and reflective

**Output**: `{ nudgeEngagement, goalStatement, reasoning, engagementReasoning, steps[] }`

Steps are clamped to 3–7 range.

---

## Nudge Scheduling

### Active Goals

The `GoalNudgeScheduler` singleton runs a 30-minute interval:

1. Skip if feature disabled or quiet hours (10PM–8AM)
2. For each active goal where `nextNudgeAt <= now`:
   - Skip if daily limit reached (3 nudges/day per goal)
   - Get current step (first pending or in_progress)
   - Send nudge via existing nudge pipeline

**Cadence**:
- First nudge: 1 hour after goal creation
- Base interval: 4 hours
- Back-off: After 2 consecutive dismissals, doubles cadence (max 48h)
- Reset: On step completion (via GoalProgressCard or nudge "Done" button)

**Channel escalation** (based on consecutive dismissals):
| Dismissals | Channel |
|------------|---------|
| 0–1 | Toast |
| 2–3 | Sheet |
| 4+ | Notification |

**Nudge options**: `[Done, Later (active only), Feedback]`

### Passive Goals

No scheduled nudges. Evaluated on note access:
- `evaluatePassiveGoal(noteId)` called when note opens
- Shows gentle reminder toast if current step has been pending > 7 days
- No channel escalation or back-off tracking

---

## UI Components

### GoalProgressCard

Rendered in `note/[id].tsx` for notes with active or passive goals.

**States**:

1. **Analyzing**: Spinner + rotating tip from pool of 5 tips
2. **Achieved**: Celebration emoji + "Goal achieved!" + feedback link
3. **Active/Paused** (main state):

```
┌─────────────────────────────────┐
│ 🎯 Plan your Japan trip    [▾]  │  ← collapse toggle
│ ━━━━━━━━━━━━░░░░ 3/5 steps     │  ← progress bar
│                                  │
│ ✅ Book flights                  │
│ ✅ Reserve hotel                 │
│ ✅ Build itinerary               │
│ ○  Create packing list  [Done]   │  ← current step
│ ○  Set departure deadline        │
│                                  │
│ [Pause Goal]  [Regenerate Plan]  │
│                                  │
│ Was this helpful? Share feedback  │  ← opens FeedbackSheet
└─────────────────────────────────┘
```

**Actions**:
- **Done** (step): Marks step complete + resets nudge cadence
- **Pause/Resume**: Toggles goal status (paused goals don't receive nudges)
- **Regenerate Plan**: Re-calls edge function with current content
- **Feedback link**: Opens FeedbackSheet

### FeedbackSheet (Beta)

Modal bottom sheet for collecting user feedback on AI-generated goals.

- Text input (multiline, max 500 chars)
- Shows goal context: statement + engagement level
- Sends to `/api/send-goal-feedback` → Slack webhook + Resend email
- Accessible from GoalProgressCard footer and nudge "Feedback" button

---

## Settings

**"AI Goal Suggestions"** toggle in Settings → Learning section:
- Controls `goalSuggestionsEnabled` in goalStore
- When disabled: no analysis, no nudges, GoalProgressCard still shows existing goals but no new ones generated
- Default: enabled

---

## Onboarding

**GOAL_TIPS** coach mark (order 8):
- Title: "AI reads your notes"
- Description: "Include dates and action items for smarter nudges and goal tracking"
- Trigger: First time GoalProgressCard appears (`triggerAction: 'first-goal-shown'`)
- Position: top (above GoalProgressCard)

---

## Tips for Users

These tips are rotated in the GoalProgressCard analyzing state:

1. Include dates and action items for smarter suggestions
2. Be specific about your goal for better steps
3. Checklist items help AI break down your plan
4. Mention deadlines to get timely nudges
5. Name people and places for concrete steps

---

## Constants Reference

| Constant | Value | File |
|----------|-------|------|
| Analysis debounce | 10s | goalAnalysisService.ts |
| Min title length | 3 chars | goalAnalysisService.ts |
| Min content length | 20 chars | goalAnalysisService.ts |
| Min checklist items | 2 | goalAnalysisService.ts |
| Default nudge cadence | 4 hours | goalStore.ts |
| Max nudge cadence | 48 hours | goalStore.ts |
| Scheduler interval | 30 minutes | goalNudgeScheduler.ts |
| Max nudges per day | 3 | goalNudgeScheduler.ts |
| Quiet hours | 10PM–8AM | goalNudgeScheduler.ts |
| Passive stale threshold | 7 days | goalNudgeScheduler.ts |
| Back-off trigger | 2 consecutive dismissals | goalStore.ts |
| Step count range | 3–7 | analyze-note-goal.ts |
| Title length limit (API) | 500 chars | analyze-note-goal.ts |
| Content length limit (API) | 10,000 chars | analyze-note-goal.ts |
| Feedback text limit (API) | 2,000 chars | send-goal-feedback.ts |
| First nudge delay (active) | 1 hour | goalAnalysisService.ts |

---

## Beta Feedback System

During beta, the system is explicit about what AI detected:

- **Goal detected toast**: Shows engagement level + reasoning
- **Feedback button**: On nudge toasts and GoalProgressCard footer
- **FeedbackSheet**: Collects free-text feedback with goal context
- **Delivery**: Slack webhook (`#goal-feedback` channel) + email via Resend
- **Env vars**: `SLACK_WEBHOOK_URL`, `RESEND_API_KEY`, `ADMIN_EMAIL`

Removable after beta — all transparency features can be gated behind a flag or removed entirely.

---

## Verification Checklist

- [ ] Create action-item note with deadline → active engagement, scheduled nudges appear
- [ ] Create creative/journal note → passive engagement, no unsolicited nudges
- [ ] Create bookmark/reference note → none engagement, no goal created
- [ ] Complete step via GoalProgressCard → progress updates, cadence resets
- [ ] Dismiss 3 active nudges → back-off doubles interval, channel escalates to sheet
- [ ] Add deadline to passive note → re-analysis may upgrade to active
- [ ] Complete all steps → achievement state, celebration UI
- [ ] Toggle "AI Goal Suggestions" off → all goal nudges stop
- [ ] Tap "Feedback" → FeedbackSheet opens, submit → Slack message received
- [ ] Delete note with pending analysis → timer cancelled, no wasted API call
