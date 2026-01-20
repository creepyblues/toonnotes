# ToonNotes v2.0 PRD: MODE Framework & Smart Assistant

**Version:** 2.0
**Created:** January 2026
**Status:** Planning
**Codename:** Project MODE

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [The MODE Framework](#3-the-mode-framework)
4. [Smart Assistant Architecture](#4-smart-assistant-architecture)
5. [Agent Specifications](#5-agent-specifications)
6. [Technical Architecture](#6-technical-architecture)
7. [Implementation Plan](#7-implementation-plan)
8. [Success Metrics](#8-success-metrics)
9. [File Manifest](#9-file-manifest)
10. [Progress Tracking](#10-progress-tracking)

---

## 1. Executive Summary

### Vision

Transform ToonNotes from a note-taking app into an intelligent life companion that understands the purpose of every note and proactively helps users achieve their goals.

### Core Principle

> Notes are only useful if they lead to **action**, **creation**, **retrieval**, or **memory**. The AI's job is to move every note toward one of these outcomes.

### Key Deliverables

- **4 Cognitive Modes** with distinct AI personalities
- **Smart Assistant** with skills and agents that learn from user behavior
- **Usefulness Score System** that guides notes toward outcomes
- **Proactive Nudges** that engage users at the right moment
- **Cross-Mode Transitions** that help notes evolve

---

## 2. Problem Statement

### Current State

ToonNotes v1.x organizes notes via labels and boards with AI-powered design generation. However:

| Issue | Impact |
|-------|--------|
| Notes accumulate without purpose | Users feel overwhelmed |
| Users forget what they captured | Wasted effort in capturing |
| No behavioral understanding | AI features are reactive only |
| No lifecycle management | Notes stagnate indefinitely |
| Generic assistance | Same AI for tasks vs journals |

### Target State

An intelligent system that:

- Understands the cognitive mode of each note/board
- Proactively engages users at the right moment
- Guides notes toward usefulness through their lifecycle
- Learns from user behavior to improve suggestions
- Provides distinct AI personalities per mode

---

## 3. The MODE Framework

### Four Cognitive Modes

```
┌─────────────────────────────────────────────────────────────────┐
│                        ToonNotes MODE                           │
├─────────────┬─────────────┬─────────────────────┬───────────────┤
│   MANAGE    │   DEVELOP   │      ORGANIZE       │   EXPERIENCE  │
│     🎯      │     💡      │        📚          │      📔       │
├─────────────┼─────────────┼─────────────────────┼───────────────┤
│   Tasks     │   Ideas     │ ┌─────┐   ┌─────┐  │   Journal     │
│   Projects  │   Drafts    │ │INBOX│ → │STORE│  │   Memories    │
│   Goals     │   Concepts  │ └──┬──┘   └──┬──┘  │   Media Log   │
│   Trips     │   Outlines  │    │         │     │   Milestones  │
│             │             │    └────┬────┘     │               │
│             │             │    ┌────▼────┐     │               │
│             │             │    │  LEARN  │     │               │
│             │             │    └─────────┘     │               │
├─────────────┼─────────────┼─────────────────────┼───────────────┤
│ 🤖 Manager  │ 🤖 Muse     │ 🤖 Librarian        │ 🤖 Biographer │
└─────────────┴─────────────┴─────────────────────┴───────────────┘
```

### Mode Definitions

| Mode | Intent | AI Personality | Core Question |
|------|--------|----------------|---------------|
| **MANAGE** 🎯 | Get things done | The Manager | "What needs to happen?" |
| **DEVELOP** 💡 | Grow ideas | The Muse | "What could this become?" |
| **ORGANIZE** 📚 | Keep for later | The Librarian | "Where should this live?" |
| **EXPERIENCE** 📔 | Remember moments | The Biographer | "What do you want to remember?" |

### ORGANIZE Sub-Stages

The ORGANIZE mode contains a 3-stage information lifecycle:

```
INBOX 📥 ──→ STORE 🗄️ ──→ LEARN 🎓
"Save this"   "File this"   "Know this"

Unprocessed → Ready to use → Active retention
Quick dump  → Organized    → Spaced review
Messy       → Formatted    → Internalized
```

### Cross-Mode Flow

Notes don't stay in one mode forever. The AI facilitates natural transitions:

```
                    ┌─────────────┐
                    │   INBOX     │
                    │  (capture)  │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │   MANAGE    │ │   DEVELOP   │ │ STORE/LEARN │
    │  "Do this"  │ │ "Grow this" │ │ "Keep this" │
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
           │               │               │
           │               ▼               │
           │        ┌─────────────┐        │
           │        │  EXPERIENCE │◄───────┘
           │        │  "Remember" │
           │        └─────────────┘
           │               ▲
           └───────────────┘
              (completion becomes memory)
```

---

## 4. Smart Assistant Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    ToonNotes Smart Assistant                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   SENSORS    │───▶│    BRAIN     │───▶│   ACTORS     │      │
│  │              │    │              │    │              │      │
│  │ • Note CRUD  │    │ • Mode       │    │ • Nudges     │      │
│  │ • User time  │    │   Detection  │    │ • Prompts    │      │
│  │ • Edit       │    │ • Pattern    │    │ • Auto-      │      │
│  │   patterns   │    │   Analysis   │    │   actions    │      │
│  │ • Search     │    │ • Behavior   │    │ • Enrichment │      │
│  │ • App state  │    │   Learning   │    │              │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│                              │                                   │
│                              ▼                                   │
│                    ┌──────────────┐                             │
│                    │    MEMORY    │                             │
│                    │              │                             │
│                    │ • User prefs │                             │
│                    │ • Patterns   │                             │
│                    │ • History    │                             │
│                    └──────────────┘                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Agent Architecture

Each mode has a dedicated AI Agent with specialized skills:

```typescript
interface Agent {
  id: AgentId;
  mode: Mode;
  personality: AgentPersonality;
  skills: Skill[];
  triggers: Trigger[];
  responses: ResponseTemplate[];
}

type AgentId = 'manager' | 'muse' | 'librarian' | 'biographer';

interface AgentPersonality {
  tone: string;           // "direct and action-oriented"
  approach: string;       // "breaks down complexity"
  values: string[];       // ["efficiency", "completion", "clarity"]
  avoids: string[];       // ["overwhelm", "guilt", "pressure"]
}
```

---

## 5. Agent Specifications

### 5.1 The Manager 🎯 (MANAGE Mode)

**Tone:** Direct, supportive, action-oriented
**Core Question:** "What needs to happen?"

#### Skills

| Skill ID | Name | Trigger | Action |
|----------|------|---------|--------|
| `mgr-deadline` | Deadline Nudge | Task created without date | Ask "When does this need to happen?" |
| `mgr-relevance` | Relevance Check | Task untouched 7+ days | Ask "Still on your plate, or archive?" |
| `mgr-decompose` | Task Decomposition | Large task detected | Offer to break into subtasks |
| `mgr-celebrate` | Completion Celebration | Task completed | Celebrate + show daily progress |
| `mgr-priority` | Priority Sort | Multiple tasks, no priority | Ask "What's the ONE thing for today?" |
| `mgr-checklist` | Checklist Generation | Trip/event approaching | Generate contextual checklist |

#### Usefulness Score

```
⚪ Captured (no date)
🟡 Scheduled (has date)
🟢 Ready (date + priority + clear next action)
✅ Complete
```

#### Complete Loop Flow

```
Task Created → Date Set? → Priority Set? → Subtasks Needed? → READY
     ↓            ↓             ↓                ↓
   [Nudge]    [Suggest]     [Offer]          [Complete]
```

---

### 5.2 The Muse 💡 (DEVELOP Mode)

**Tone:** Collaborative, generative, never judges
**Core Question:** "What could this become?"

#### Skills

| Skill ID | Name | Trigger | Action |
|----------|------|---------|--------|
| `muse-expand` | Yes And | Single sentence idea abandoned | Offer expansion angles |
| `muse-resurface` | Idea Resurface | Idea untouched 14+ days | Ask "Still sparking joy?" |
| `muse-connect` | Idea Connection | Multiple related ideas | Suggest viewing together |
| `muse-unblock` | Creative Unblock | User stuck mid-draft | Inject creative prompt |
| `muse-bridge` | Mode Bridge | Idea ready for action | Suggest creating MANAGE board |

#### Content-Aware Prompts

| Content Type | Detection Signals | AI Prompt Style |
|--------------|-------------------|-----------------|
| Story/Novel | Character names, plot words | "What does [character] want most?" |
| Business | Market, customer, revenue | "Who would pay? What's their pain?" |
| Blog/Content | Opinion structure | "What's the one takeaway for readers?" |
| Design/Product | Feature lists, UI mentions | "What's the magic moment for users?" |

#### Idea Maturity Lifecycle

```
💭 Spark → 🌱 Explored → 🌳 Developed → 🚀 Ready
[Capture]   [Expand]     [Structure]    [→MANAGE]
```

---

### 5.3 The Librarian 📚 (ORGANIZE Mode)

**Tone:** Organizational, helpful, prevents hoarding
**Core Question:** "Where should this live?"

#### Stage: INBOX 📥

| Skill ID | Name | Trigger | Action |
|----------|------|---------|--------|
| `lib-enrich` | Auto-Enrich | Note is URL | Fetch title, image, summary |
| `lib-daily` | Daily Sweep | 24 hours unprocessed | "Quick look: Keep, Process, or Let Go?" |
| `lib-weekly` | Weekly Review | 7 days unprocessed | "Still valuable?" |
| `lib-monthly` | Force Decision | 30 days unprocessed | "Archive or Delete?" |
| `lib-categorize` | Auto-Categorize | Pattern detected | "This looks like a recipe. Move to Recipes?" |
| `lib-dedupe` | Deduplication | Similar note exists | "You have something similar. Merge?" |

**Daily Inbox Sweep Ritual:**
```
For each item:
  [📁 File It] → Move to STORE with auto-tags
  [📖 Learn It] → Move to LEARN for study
  [💡 Develop It] → Move to DEVELOP
  [🎯 Do It] → Convert to MANAGE task
  [🗑️ Let Go] → Delete
```

#### Stage: STORE 🗄️

| Skill ID | Name | Trigger | Action |
|----------|------|---------|--------|
| `lib-autotag` | Auto-Tag | Note arrives from INBOX | Suggest tags for findability |
| `lib-format` | Auto-Format | Raw paste (messy recipe) | Offer to clean up |
| `lib-summarize` | URL Summary | URL without context | Extract key points |
| `lib-surface` | Contextual Surface | Related to current work | "You saved [related note]..." |
| `lib-archive` | Archive Suggest | 6+ months untouched | "Still useful? Archive?" |

**Use-It Loop:**
```
Recipe saved → Recipe cooked? → [Mark as Made] → Usage count
"You've made this 5 times! Must be a favorite 🌟"
```

**Usefulness Score:**
```
🗂️ Filed → 📖 Accessed → ⭐ Valuable (3+ uses) → 🏆 Essential
```

#### Stage: LEARN 🎓

| Skill ID | Name | Trigger | Action |
|----------|------|---------|--------|
| `lib-flashcard` | Flashcard Extract | Dense note arrives | "Extract key concepts as flashcards?" |
| `lib-schedule` | Spaced Repetition | Learning session ends | Schedule review in 3 days |
| `lib-review` | Review Prompt | Spaced interval reached | "Time to review [topic]" |
| `lib-adapt` | Adapt Schedule | User ignores reviews | "Want shorter reviews?" |
| `lib-graduate` | Graduation | Mastery demonstrated | Move to STORE as reference |

**Know-It Challenge:**
```
"Quick check on your Python notes:
 Q: What does 'list comprehension' do?
 [Show Answer] [I Know This] [Need Review]"
```

**Usefulness Score:**
```
🌱 Learning → 🧠 Reviewing → 💪 Confident → 📚 Archived
```

---

### 5.4 The Biographer 📔 (EXPERIENCE Mode)

**Tone:** Reflective, emotionally intelligent, memory-surfacing
**Core Question:** "What do you want to remember?"

#### Skills

| Skill ID | Name | Trigger | Action |
|----------|------|---------|--------|
| `bio-nudge` | Gentle Nudge | Regular journaling time | "Feel like writing?" (at usual time) |
| `bio-reengage` | Re-engagement | 3-day gap | "Quick catch-up: One word for this week?" |
| `bio-enrich` | Media Enrich | Logs media without details | Add poster, suggest rating |
| `bio-pattern` | Pattern Alert | Negative sentiment pattern | "Noticed tough days. What usually helps?" |
| `bio-timecapsule` | Time Capsule | Anniversary of entry | "One year ago today..." |
| `bio-link` | Memory Link | Mentions logged person | "Last time you wrote about [person] was..." |
| `bio-wrapup` | Trip Wrap-up | Trip completed | "Want to write a final reflection?" |

#### Enrichment at Capture

```
User types: "Had coffee with Sarah today"

AI offers:
- 📍 "Add location?"
- 📸 "Add a photo?"
- 💭 "What did you talk about?"
- 😊 "How are you feeling?"
```

**Usefulness Score:**
```
✏️ Logged → 📝 Detailed → 🔗 Connected → 💎 Memory
```

---

## 6. Technical Architecture

### 6.1 Data Models

```typescript
// Mode and Board Type
type Mode = 'manage' | 'develop' | 'organize' | 'experience';
type OrganizeStage = 'inbox' | 'store' | 'learn';

interface Board {
  id: string;
  hashtag: string;
  mode: Mode;
  organizeStage?: OrganizeStage;  // Only for ORGANIZE mode
  // ... existing fields
}

// Note Behavior Tracking
interface NoteBehavior {
  noteId: string;
  mode: Mode;

  // Lifecycle
  usefulnessScore: number;  // 0-100
  usefulnessLevel: string;  // Mode-specific level

  // Engagement
  lastAccessedAt: number;
  accessCount: number;
  editCount: number;

  // Mode-specific data
  modeData: ManageData | DevelopData | OrganizeData | ExperienceData;
}

// MANAGE mode data
interface ManageData {
  hasDeadline: boolean;
  hasPriority: boolean;
  hasSubtasks: boolean;
  completedAt?: number;
  stateHistory: StateTransition[];
}

// DEVELOP mode data
interface DevelopData {
  maturityLevel: 'spark' | 'explored' | 'developed' | 'ready';
  contentType?: 'story' | 'business' | 'blog' | 'design';
  expansionCount: number;
  linkedIdeas: string[];
}

// ORGANIZE mode data
interface OrganizeData {
  stage: OrganizeStage;
  processedAt?: number;
  usageCount: number;
  lastUsedAt?: number;
  tags: string[];
  // LEARN specific
  masteryLevel?: number;
  nextReviewAt?: number;
}

// EXPERIENCE mode data
interface ExperienceData {
  entryDate: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  hasMedia: boolean;
  hasLocation: boolean;
  peopleTagged: string[];
  streakDays: number;
}
```

### 6.2 Skill System

```typescript
interface Skill {
  id: string;
  agentId: AgentId;
  name: string;
  description: string;

  // Trigger conditions
  triggers: SkillTrigger[];

  // Execution
  execute: (context: SkillContext) => Promise<SkillResult>;

  // Learning
  successMetric: string;
  learningEnabled: boolean;
}

interface SkillTrigger {
  type: 'time' | 'event' | 'pattern' | 'manual';
  condition: TriggerCondition;
  cooldown?: number;  // Prevent spam
}

interface SkillContext {
  note?: Note;
  board?: Board;
  user: User;
  behaviorHistory: NoteBehavior[];
  userPreferences: UserPreferences;
}

interface SkillResult {
  action: 'nudge' | 'prompt' | 'auto_action' | 'none';
  content?: string;
  options?: NudgeOption[];
  metadata?: Record<string, any>;
}
```

### 6.3 Nudge System

```typescript
interface Nudge {
  id: string;
  skillId: string;
  agentId: AgentId;

  // Content
  title: string;
  body: string;
  options: NudgeOption[];

  // Delivery
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deliveryChannel: 'toast' | 'sheet' | 'notification' | 'inline';

  // Timing
  createdAt: number;
  showAt?: number;  // Scheduled delivery
  expiresAt?: number;

  // Tracking
  shownAt?: number;
  interactedAt?: number;
  outcome?: 'accepted' | 'dismissed' | 'snoozed' | 'ignored';
}

interface NudgeOption {
  id: string;
  label: string;
  icon?: string;
  action: NudgeAction;
  isPrimary?: boolean;
}

type NudgeAction =
  | { type: 'navigate'; target: string }
  | { type: 'update_note'; changes: Partial<Note> }
  | { type: 'move_note'; targetBoard: string }
  | { type: 'dismiss' }
  | { type: 'snooze'; duration: number }
  | { type: 'custom'; handler: string };
```

### 6.4 Behavior Learning System

```typescript
interface BehaviorLearner {
  // Track user patterns
  trackEvent(event: UserEvent): void;

  // Get learned patterns
  getPatterns(userId: string): UserPatterns;

  // Predict best engagement time
  predictBestTime(userId: string, skillId: string): Date;

  // Adjust skill confidence
  updateSkillConfidence(skillId: string, outcome: NudgeOutcome): void;
}

interface UserPatterns {
  // Time patterns
  activeHours: number[];  // 0-23
  journalingTime?: number;
  taskCompletionTime?: number;

  // Engagement patterns
  nudgeResponseRate: number;
  preferredNudgeChannel: string;

  // Content patterns
  averageNoteLength: number;
  commonTags: string[];
  modeDistribution: Record<Mode, number>;
}
```

---

## 7. Implementation Plan

### Phase 1: Foundation (Weeks 1-3)

**Goal:** Core data models and mode detection

| Task | Files | Priority | Status |
|------|-------|----------|--------|
| Add Mode enum and Board mode field | `types/index.ts` | P0 | ⬜ |
| Create NoteBehavior interface | `types/index.ts` | P0 | ⬜ |
| Add mode to label presets | `constants/labelPresets.ts` | P0 | ⬜ |
| Create behaviorStore | `stores/behaviorStore.ts` | P0 | ⬜ |
| Create nudgeStore | `stores/nudgeStore.ts` | P0 | ⬜ |
| Implement mode detection | `services/modeDetectionService.ts` | P0 | ⬜ |
| Database schema migration | `supabase/migrations/` | P0 | ⬜ |

### Phase 2: Agent Framework (Weeks 4-6)

**Goal:** Agent and skill infrastructure

| Task | Files | Priority | Status |
|------|-------|----------|--------|
| Create Agent base class | `services/agents/Agent.ts` | P0 | ⬜ |
| Implement skill system | `services/skills/` | P0 | ⬜ |
| Create trigger evaluation | `services/triggerEngine.ts` | P0 | ⬜ |
| Build nudge delivery system | `services/nudgeDeliveryService.ts` | P0 | ⬜ |
| Create NudgeToast component | `components/nudges/NudgeToast.tsx` | P0 | ⬜ |
| Create NudgeSheet component | `components/nudges/NudgeSheet.tsx` | P0 | ⬜ |

### Phase 3: Manager Agent (Weeks 7-8)

**Goal:** MANAGE mode fully functional

| Task | Priority | Status |
|------|----------|--------|
| Implement deadline extraction skill | P0 | ⬜ |
| Implement relevance check skill | P0 | ⬜ |
| Implement task decomposition skill | P1 | ⬜ |
| Implement celebration skill | P1 | ⬜ |
| Implement priority sort skill | P1 | ⬜ |
| Implement checklist generation skill | P2 | ⬜ |
| Add usefulness score UI | P0 | ⬜ |

### Phase 4: Librarian Agent (Weeks 9-11)

**Goal:** ORGANIZE mode with all three stages

| Task | Priority | Status |
|------|----------|--------|
| Implement daily sweep ritual | P0 | ⬜ |
| Implement auto-enrich skill | P0 | ⬜ |
| Implement auto-categorize skill | P1 | ⬜ |
| Implement deduplication skill | P2 | ⬜ |
| Implement spaced repetition for LEARN | P1 | ⬜ |
| Build flashcard system | P2 | ⬜ |
| Add INBOX processing UI | P0 | ⬜ |

### Phase 5: Muse Agent (Weeks 12-13)

**Goal:** DEVELOP mode fully functional

| Task | Priority | Status |
|------|----------|--------|
| Implement idea expansion skill | P0 | ⬜ |
| Implement content-type detection | P1 | ⬜ |
| Implement idea connection skill | P1 | ⬜ |
| Implement mode bridge skill | P0 | ⬜ |
| Add idea maturity UI | P0 | ⬜ |

### Phase 6: Biographer Agent (Weeks 14-15)

**Goal:** EXPERIENCE mode fully functional

| Task | Priority | Status |
|------|----------|--------|
| Implement journaling nudge skill | P0 | ⬜ |
| Implement time capsule skill | P1 | ⬜ |
| Implement sentiment analysis | P2 | ⬜ |
| Implement enrichment prompts | P1 | ⬜ |
| Add streak tracking UI | P0 | ⬜ |

### Phase 7: Learning & Polish (Weeks 16-18)

**Goal:** Behavior learning and refinement

| Task | Priority | Status |
|------|----------|--------|
| Implement behavior learner | P0 | ⬜ |
| Add nudge outcome tracking | P0 | ⬜ |
| Implement confidence adjustment | P1 | ⬜ |
| Add user preference settings | P0 | ⬜ |
| Performance optimization | P1 | ⬜ |
| Analytics integration | P1 | ⬜ |

---

## 8. Success Metrics

### Engagement Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Nudge acceptance rate | > 40% | Accepted nudges / shown nudges |
| Notes reaching "useful" | > 60% | Notes with usefulness > 50 |
| Daily active engagement | > 5 min | Time in app with meaningful actions |
| Mode adoption | > 80% boards | Boards with assigned mode |

### Outcome Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Task completion rate | > 70% | Completed / created tasks |
| INBOX processing rate | < 7 day avg | Days until note processed |
| Idea development rate | > 30% | Ideas reaching "developed" stage |
| Journal consistency | > 4x/week | Journal entries per week |

### Learning Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Prediction accuracy | > 75% | Correct engagement time predictions |
| Personalization score | Improving | User preference match rate |
| Skill confidence | Stabilizing | Skill confidence variance |

---

## 9. File Manifest

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `services/agents/Agent.ts` | Base agent class |
| `services/agents/ManagerAgent.ts` | MANAGE mode agent |
| `services/agents/MuseAgent.ts` | DEVELOP mode agent |
| `services/agents/LibrarianAgent.ts` | ORGANIZE mode agent |
| `services/agents/BiographerAgent.ts` | EXPERIENCE mode agent |
| `services/skills/index.ts` | Skill registry |
| `services/skills/manager/*.ts` | Manager skills |
| `services/skills/muse/*.ts` | Muse skills |
| `services/skills/librarian/*.ts` | Librarian skills |
| `services/skills/biographer/*.ts` | Biographer skills |
| `services/modeDetectionService.ts` | Detect note/board mode |
| `services/triggerEngine.ts` | Evaluate skill triggers |
| `services/nudgeDeliveryService.ts` | Deliver nudges |
| `services/behaviorLearner.ts` | Learn user patterns |
| `stores/behaviorStore.ts` | Behavior data store |
| `stores/nudgeStore.ts` | Nudge queue store |
| `components/nudges/NudgeToast.tsx` | Toast nudge UI |
| `components/nudges/NudgeSheet.tsx` | Sheet nudge UI |
| `components/mode/ModeSelector.tsx` | Mode selection UI |
| `components/mode/UsefulnessIndicator.tsx` | Score display |

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `types/index.ts` | Add Mode, NoteBehavior, Nudge types |
| `constants/labelPresets.ts` | Add `mode` field to presets |
| `stores/noteStore.ts` | Hook behavior tracking |
| `stores/boardStore.ts` | Add mode to board computation |
| `app/(tabs)/boards.tsx` | Mode indicators, transitions |
| `app/note/[id].tsx` | Nudge display, usefulness score |

### Database Schema

```sql
-- Migration: add_mode_framework.sql

-- Add mode to boards
ALTER TABLE boards ADD COLUMN mode TEXT;
ALTER TABLE boards ADD COLUMN organize_stage TEXT;

-- Note behavior tracking
CREATE TABLE note_behaviors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  note_id UUID NOT NULL,
  mode TEXT NOT NULL,
  usefulness_score INTEGER DEFAULT 0,
  usefulness_level TEXT,
  access_count INTEGER DEFAULT 0,
  edit_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  mode_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, note_id)
);

-- AI nudges log
CREATE TABLE nudges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  note_id UUID,
  skill_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  options JSONB DEFAULT '[]',
  priority TEXT DEFAULT 'medium',
  delivery_channel TEXT DEFAULT 'toast',
  shown_at TIMESTAMPTZ,
  interacted_at TIMESTAMPTZ,
  outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User patterns for behavior learning
CREATE TABLE user_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  active_hours INTEGER[] DEFAULT '{}',
  journaling_time INTEGER,
  task_completion_time INTEGER,
  nudge_response_rate DECIMAL(3,2) DEFAULT 0.5,
  preferred_nudge_channel TEXT DEFAULT 'toast',
  mode_distribution JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_note_behaviors_user_mode ON note_behaviors(user_id, mode);
CREATE INDEX idx_nudges_user_pending ON nudges(user_id, shown_at) WHERE outcome IS NULL;
```

---

## 10. Progress Tracking

### Overall Progress

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1: Foundation | ⬜ Not Started | 0% |
| Phase 2: Agent Framework | ⬜ Not Started | 0% |
| Phase 3: Manager Agent | ⬜ Not Started | 0% |
| Phase 4: Librarian Agent | ⬜ Not Started | 0% |
| Phase 5: Muse Agent | ⬜ Not Started | 0% |
| Phase 6: Biographer Agent | ⬜ Not Started | 0% |
| Phase 7: Learning & Polish | ⬜ Not Started | 0% |

### Legend

- ⬜ Not Started
- 🟡 In Progress
- ✅ Complete
- ⏸️ Blocked

---

## Appendix A: Mode Selection UX

### On Board Creation

```
┌─────────────────────────────────────────────────────────┐
│  What's this board for?                                  │
│                                                          │
│  🎯  Getting things done        → MANAGE mode           │
│  💡  Growing an idea            → DEVELOP mode          │
│  📚  Saving for later           → ORGANIZE mode         │
│  📔  Recording my life          → EXPERIENCE mode       │
│                                                          │
│  Not sure yet? Start in INBOX and we'll figure it out.  │
└─────────────────────────────────────────────────────────┘
```

### Mode Indicators

Each board shows its mode with icon and color:
- 🎯 MANAGE - Blue accent
- 💡 DEVELOP - Yellow accent
- 📚 ORGANIZE - Green accent
- 📔 EXPERIENCE - Purple accent

---

## Appendix B: Research Sources

- [PARA Method](https://fortelabs.com/blog/para/) - Tiago Forte
- [GTD Productivity](https://todoist.com/productivity-methods/getting-things-done) - Todoist
- [PKM Guide](https://capacities.io/blog/guide-to-pkm) - Capacities
- [AI Note Tools 2025](https://superagi.com/ai-note-taking-tools-compared-which-app-offers-the-best-smart-organization-features-in-2025/) - SuperAGI
- [AI Task Management](https://clickup.com/blog/ai-for-time-management/) - ClickUp
- [Habit Trackers](https://www.cohorty.app/blog/best-habit-tracker-apps-with-reminders-smart-notifications-2025) - Cohorty
