# MODE Framework: Nudge Action Implementation

This document outlines the phased implementation plan for making the MODE Framework nudge system fully functional.

## Overview

The MODE Framework infrastructure exists but nudge actions are not wired up. This plan focuses on building complete end-to-end flows where:

```
Note created → Mode detected → Behavior initialized → Skill triggered → Nudge shown → Action executed
```

---

# Phase 1: Manager Agent + Deadline Skill (MVP)

## Goal

Build one complete working flow using the Manager agent's deadline skill as the MVP.

## Current State

| Component | Status |
|-----------|--------|
| Trigger engine | ✅ Wired to note lifecycle |
| Mode detection | ✅ Logic exists in `modeDetectionService.ts` |
| Nudge delivery | ✅ Queue, toast/sheet UI work |
| Skills defined | ✅ 25 skills with triggers |
| Custom handlers | ❌ Not registered |
| Behavior on create | ❌ Not initialized |
| Deadline field | ❌ Schema missing |

## Implementation Tasks

### Task 1: Add Deadline Field

**File:** `types/index.ts`

Add optional deadline field to Note interface:

```typescript
interface Note {
  // existing fields...
  deadline?: string;  // ISO date string "2024-01-26"
}
```

### Task 2: Initialize Behavior on Note Creation

**File:** `stores/noteStore.ts`

In `addNote()`, before emitting events:
1. Call `detectModeForNote(newNote)` to get mode
2. Call `useBehaviorStore.getState().initBehavior(noteId, mode)` to initialize behavior
3. Then call `emitNoteCreated(newNote)` (behavior now exists for trigger evaluation)

### Task 3: Create Custom Handlers

**File:** `services/customHandlers.ts` (NEW)

Register custom action handlers for nudge options:

```typescript
import { nudgeDeliveryService } from './nudgeDeliveryService';
import { useNoteStore } from '@/stores';
import { useBehaviorStore } from '@/stores/behaviorStore';

export function registerCustomHandlers() {
  // Handler for "Today" button on deadline nudge
  nudgeDeliveryService.registerCustomHandler(
    'set_deadline_today',
    async (data: { noteId: string }) => {
      const today = new Date().toISOString().split('T')[0];
      useNoteStore.getState().updateNote(data.noteId, { deadline: today });

      // Update behavior tracking
      useBehaviorStore.getState().updateManageData(data.noteId, {
        hasDeadline: true,
        deadline: Date.now(),
      });

      return { success: true, message: 'Deadline set to today' };
    }
  );
}
```

### Task 4: Register Handlers on Startup

**File:** `app/_layout.tsx`

Import and call handler registration in the initialization useEffect:

```typescript
import { registerCustomHandlers } from '@/services/customHandlers';

// In RootLayout useEffect:
useEffect(() => {
  registerCustomHandlers();
}, []);
```

### Task 5: Verify Deadline Skill

**File:** `services/skills/manager/deadlineSkill.ts`

The skill is already configured with:
- Trigger: `note_created` event
- Pattern: `no_deadline`
- Mode: MANAGE (via `.when()` condition)
- Custom handler: `set_deadline_today`

## User Flow

1. User creates note: `- [ ] Buy groceries`
2. Mode detected as MANAGE (checklist pattern with `[-]` structure)
3. Behavior initialized: `{ mode: 'manage', hasDeadline: false }`
4. `deadlineSkill` triggers (note_created + no_deadline)
5. Toast appears: "When does this need to happen?"
6. Options:
   - **"Set deadline"** → Navigate to note editor with deadline focus
   - **"Today"** → Executes `set_deadline_today` handler → sets `note.deadline = today`
   - **"Later"** → Snooze 4 hours (shows again later)
   - **Dismiss** → Track as dismissed

## Files Modified

| File | Action |
|------|--------|
| `docs/NUDGE-ACTIONS-IMPLEMENTATION.md` | CREATE |
| `types/index.ts` | ADD deadline field to Note interface |
| `stores/noteStore.ts` | ADD behavior initialization before event emission |
| `services/customHandlers.ts` | CREATE with handler registration |
| `app/_layout.tsx` | ADD handler registration call |

## Success Criteria

- [ ] Note with checklist (`- [ ]`) triggers deadline nudge
- [ ] "Today" button sets deadline field on note
- [ ] "Later" button snoozes (nudge reappears after 4h)
- [ ] Outcome tracked in behavior store
- [ ] Analytics events fire correctly

## Testing

1. Create a note with checklist content: `- [ ] Buy groceries`
2. Verify console shows: `[BehaviorStore] Initialized behavior with mode=manage`
3. Wait 3-5 seconds for nudge queue processing
4. Toast appears with deadline prompt
5. Tap "Today" - verify note has deadline field set
6. Check behavior store shows `hasDeadline: true`

---

# Phase 2: Muse Agent + Expand Skill

## Goal

Enable idea expansion for brief notes in DEVELOP mode.

## Trigger

- Event: `note_created`
- Pattern: Brief idea (content < 200 characters)
- Mode: DEVELOP

## Handler

```typescript
nudgeDeliveryService.registerCustomHandler(
  'expand_idea',
  async (data: { noteId: string }) => {
    // Call AI to expand the idea
    // Update note with expanded content
  }
);
```

## User Flow

1. User creates brief note: "App idea: social network for pet owners"
2. Mode detected as DEVELOP
3. Muse nudge: "Want to explore this idea further?"
4. Options: "Expand with AI", "Add details manually", "Later"

---

# Phase 3: Librarian Agent + Enrich Skill

## Goal

Automatically enrich notes containing URLs with metadata.

## Trigger

- Event: `note_created` or `note_updated`
- Pattern: Contains URL
- Mode: ORGANIZE

## Handler

```typescript
nudgeDeliveryService.registerCustomHandler(
  'enrich_url',
  async (data: { noteId: string; url: string }) => {
    // Fetch URL metadata (title, description, thumbnail)
    // Update note with enriched content
  }
);
```

## User Flow

1. User pastes URL into note
2. Mode detected as ORGANIZE
3. Librarian nudge: "Want to save details about this link?"
4. Options: "Fetch metadata", "Just save the link", "Later"

---

# Phase 4: Biographer Agent + Journal Skill

## Goal

Prompt evening journaling when no journal entry exists for today.

## Trigger

- Time: Evening hours (6 PM - 10 PM local)
- Pattern: No journal entry today
- Mode: EXPERIENCE

## Handler

```typescript
nudgeDeliveryService.registerCustomHandler(
  'create_journal_entry',
  async () => {
    // Create new note with journal template
    // Navigate to note editor
  }
);
```

## User Flow

1. User opens app in evening
2. Biographer checks: no journal entry today
3. Nudge: "How was your day?"
4. Options: "Write now", "Remind me later", "Skip today"

---

## Architecture Notes

### Custom Handler Pattern

All custom handlers follow this signature:

```typescript
type CustomHandler = (
  data: Record<string, unknown>,
  nudge: Nudge
) => Promise<ActionResult>;

interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
}
```

### Behavior-Skill Connection

The key insight is that skills check behavior state:

```typescript
.when((ctx: SkillContext) => {
  if (!ctx.behavior) return false;  // Behavior must exist!
  const data = ctx.behavior.modeData as ManageData;
  return !data.hasDeadline;
})
```

This is why initializing behavior BEFORE emitting events is critical.

### Cooldown Management

Skills have cooldown periods to prevent spam:

| Skill | Cooldown |
|-------|----------|
| Deadline | 24 hours per note |
| Expand | 4 hours per note |
| Enrich | Once per URL |
| Journal | Once per day |

Cooldowns are tracked per (skill, noteId) combination in the trigger engine.

---

## Monitoring & Analytics

Track nudge effectiveness with these events:

| Event | Description |
|-------|-------------|
| `nudge_created` | Nudge added to queue |
| `nudge_shown` | Nudge displayed to user |
| `nudge_interacted` | User tapped an option |
| `nudge_dismissed` | User dismissed nudge |
| `nudge_snoozed` | User chose "Later" |
| `nudge_expired` | Nudge expired without interaction |

Use `behaviorLearner.ts` to track acceptance rates and adjust skill confidence.

---

# Phase 5: AI Goal-Agent System

## Goal

Replace rule-based skill nudges with an AI-driven goal system. AI analyzes note content, infers the user's goal, generates an action plan (3-7 steps), and classifies the note into one of three nudge engagement levels.

## Nudge Engagement Levels

| Level | When | Nudge Behavior |
|-------|------|----------------|
| **Active** | Clear actionable goal with urgency/deadline | Proactive scheduled nudges. Cadence: 1h first, then 4h base, back-off on dismiss (2x, max 48h). Max 3/day. |
| **Passive** | Goal exists but no urgency; creative/exploratory | Nudge only on note open if step pending > 7 days. GoalProgressCard visible in editor. |
| **None** | No actionable goal; archival/reference | No goal generated, no nudges. |

## Architecture

### New Files

| File | Purpose |
|------|---------|
| `stores/goalStore.ts` | Zustand store for NoteGoal state, persisted to AsyncStorage |
| `services/goalAnalysisService.ts` | Orchestrates AI calls, content threshold check, debounced analysis |
| `services/goalNudgeScheduler.ts` | Cadence logic for active goals: scheduling, back-off, escalation |
| `components/goals/GoalProgressCard.tsx` | In-note UI showing progress bar, step checklist, controls |
| `components/goals/FeedbackSheet.tsx` | Beta feedback bottom sheet |
| `api/analyze-note-goal.ts` | Edge function: infers goal, steps, and engagement level via Gemini |
| `api/send-goal-feedback.ts` | Edge function: sends feedback to Slack + email |

### Modified Files

| File | Change |
|------|--------|
| `types/index.ts` | Added NoteGoal, ActionStep, NudgeEngagement types + `complete_step` NudgeAction |
| `stores/noteStore.ts` | Triggers goal analysis after `updateNote` |
| `services/nudgeDeliveryService.ts` | Added `complete_step` action handling |
| `services/customHandlers.ts` | Added `complete_goal_step` and `open_goal_feedback` handlers |
| `app/note/[id].tsx` | Renders GoalProgressCard + FeedbackSheet |
| `app/(tabs)/settings.tsx` | Added "AI Goal Suggestions" toggle |
| `app/_layout.tsx` | Starts/stops goalNudgeScheduler |
| `constants/onboardingConfig.ts` | Added GOAL_TIPS coach mark |

## Content Threshold

Goal analysis triggers when: `title.length >= 3` AND (`content.length >= 20` OR `checklist items >= 2`). Debounced 10s after last edit.

## User Flow (Active)

1. User creates note "Trip to Japan" with checklist items
2. Content threshold met → `goalAnalysisService.scheduleAnalysis()` (10s debounce)
3. Edge function returns `{ engagement: 'active', goal: "Plan your Japan trip", steps: [...] }`
4. GoalProgressCard appears in editor
5. Scheduler queues first nudge at +1h → toast with [Done, Later, Feedback]
6. User completes steps → cadence resets; all steps done → achieved

## User Flow (Passive)

1. User creates "Story ideas for novel"
2. AI returns `engagement: 'passive'`
3. GoalProgressCard visible in editor, no scheduled nudges
4. Gentle reminder toast on note open if step pending > 7 days

## Beta Transparency

- Goal detected toast shows engagement level and reasoning
- Feedback button on toasts → FeedbackSheet → sends to Slack/email
- "Was this helpful?" link in GoalProgressCard footer
