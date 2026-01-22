# Agent Onboarding System

This document covers the agent onboarding implementation for ToonNotes, which introduces users to the four AI agents (Manager, Muse, Librarian, Biographer) through a guided, hands-on experience.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [User Flow](#user-flow)
4. [Components](#components)
5. [State Management](#state-management)
6. [Content System](#content-system)
7. [Agent Intro System](#agent-intro-system)
8. [Analytics](#analytics)
9. [Platform Differences](#platform-differences)
10. [Key Files](#key-files)

---

## Overview

The agent onboarding is a multi-step interactive flow that introduces users to ToonNotes' four AI agents. Users experience each agent through:

1. Selecting an agent based on what they want to do
2. Creating a real note with guided instructions
3. Viewing a demo nudge showing how the agent would help
4. Optionally experiencing additional agents

The onboarding creates **real notes** that users keep after completing the flow, making it a meaningful first experience.

---

## Architecture

### State Machine

The onboarding uses a 6-state machine managed in `AgentOnboarding/index.tsx`:

```
┌─────────────────────────────────────────────────────────────────┐
│                     Onboarding Flow States                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  discovery ─────► guided_creation ─────► demo_preview           │
│      ▲                                        │                  │
│      │                                        ▼                  │
│  agent_selection ◄──── continue_prompt ◄─────┘                  │
│      │                      │                                    │
│      │                      │                                    │
│      │               (if all 4 done)                            │
│      │                      │                                    │
│      └──────────────────────┼─────────────────► complete        │
│         (if remaining)      └────────────────────────►          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Core Flow

```
Discovery → Guided Creation → Demo Preview → Continue Prompt →
(Loop) Agent Selection → Completion
```

---

## User Flow

### First-Time User Journey

1. **App launches** → Checks `shouldShowOnboarding()`
2. **Discovery Step**: User sees 4 agent cards in a 2x2 grid
   - "Track a task" (Manager)
   - "Capture an idea" (Muse)
   - "Save a link" (Librarian)
   - "Journal a moment" (Biographer)
3. **User selects** "Track a task" (Manager)
4. **Guided Creation**: Shows instruction "Create a task like:", example "Finish project report"
5. **User types** "Buy groceries" → taps Create Note
6. **Demo Preview**: Shows mock nudge "When does this need to happen?" with DEMO badge
7. **Continue Prompt**: "You've met the Manager agent" - offers "Try Another Agent"
8. **User selects** "Try Another" → back to **Agent Selection** showing Manager as done ✓
9. **User selects** "Capture an idea" (Muse)
10. **Repeats steps 4-8** for remaining agents
11. **After 4th agent** → **Completion** screen with celebration animation
12. **Flow ends** → User sees main app interface with their created notes

---

## Components

### Expo App (`/apps/expo/components/onboarding/`)

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `AgentOnboarding/index.tsx` | Main orchestrator | 6-step state machine, tracks experienced agents, manages note creation |
| `AgentDiscoveryStep.tsx` | "What would you like to try first?" | 2x2 grid of agent cards with emoji, label, description |
| `GuidedNoteCreation.tsx` | Agent-specific instructions + input | Shows agent emoji/description, example note, text input (200 char limit) |
| `DemoNudgePreview.tsx` | Mock nudge demonstration | Shows "DEMO" badge, nudge title/body, sample options, explanation |
| `AgentContinuePrompt.tsx` | "Nice work!" decision screen | Success icon, "Try Another Agent" vs "Start Using ToonNotes" buttons |
| `AgentSelectionGrid.tsx` | Pick remaining agents | Shows 4 agents with checkmarks on completed ones, "(done)" labels |
| `OnboardingComplete.tsx` | Celebration screen | Confetti icon, sparkle animations, agent badges |
| `CoachMarksProvider.tsx` | Spotlight tour system | Progressive feature discovery (separate from agent onboarding) |

### Webapp (`/apps/webapp/components/onboarding/`)

Identical component structure using React/TypeScript with Radix UI Dialog for modals and Tailwind CSS for styling.

---

## State Management

### Expo: useUserStore (Zustand)

State structure in `stores/userStore.ts`:

```typescript
agentOnboarding: {
  hasStartedAgentOnboarding: boolean;      // True when onboarding begins
  hasCompletedAgentOnboarding: boolean;    // True when fully completed
  experiencedAgents: AgentId[];            // ['manager', 'muse', ...]
  firstAgentChosen: AgentId | null;        // Tracks first agent selection
  onboardingStartedAt: number | null;      // Timestamp of start
  onboardingCompletedAt: number | null;    // Timestamp of completion
  skippedAfterAgent: boolean;              // True if user skipped mid-flow
  seenAgentIntros: AgentId[];              // Agents whose intro sheets shown
}
```

### Store Actions

| Action | Purpose |
|--------|---------|
| `startAgentOnboarding()` | Initiates flow, sets timestamp |
| `completeAgentOnboarding()` | Marks complete + sets `hasCompletedWelcome` |
| `recordAgentExperienced(agentId)` | Adds agent to experienced list |
| `setFirstAgentChosen(agentId)` | Records first selection |
| `skipAgentOnboarding()` | Marks complete without finishing all agents |
| `resetAgentOnboarding()` | Resets to initial state (from Settings) |
| `markAgentIntroSeen(agentId)` | Tracks seen intro sheets |

### Webapp: useOnboardingStore

Located at `/apps/webapp/stores/onboardingStore.ts`:

```typescript
{
  hasCompletedWelcome: boolean;        // Legacy welcome carousel
  agentOnboarding: AgentOnboardingState;
  // Same actions as Expo...
  isAgentExperienced(agentId);         // Selector
  getExperiencedAgentsCount();         // Selector
  shouldShowOnboarding();              // Selector
}
```

**Persistence**: Uses localStorage with key `'toonnotes-onboarding'`

---

## Content System

### Content Files

- **Expo**: `/apps/expo/constants/agentOnboardingContent.ts`
- **Webapp**: `/apps/webapp/lib/agentOnboardingContent.ts`

### Discovery Cards

```typescript
const AGENT_DISCOVERY_CARDS = [
  {
    agentId: 'manager',
    label: 'Track a task',
    description: 'Stay on top of deadlines',
    emoji: '📋',
    color: '#4C9C9B'
  },
  {
    agentId: 'muse',
    label: 'Capture an idea',
    description: 'Let creativity flow',
    emoji: '✨',
    color: '#...'
  },
  // ... librarian, biographer
];
```

### Guided Note Instructions

```typescript
const GUIDED_NOTE_INSTRUCTIONS = {
  manager: {
    instruction: 'Create a task like:',
    placeholder: 'Enter your task...',
    exampleNote: 'Finish project report'
  },
  muse: {
    instruction: 'Write a one-line idea like:',
    placeholder: 'Capture your idea...',
    exampleNote: 'App for tracking plant watering'
  },
  // ... librarian, biographer
};
```

### Demo Nudge Content

```typescript
const DEMO_NUDGE_CONTENT = {
  manager: {
    title: 'When does this need to happen?',
    body: '"Finish project report" doesn\'t have a deadline yet.',
    explanation: 'When you create tasks without deadlines, the Manager will gently nudge you to add one.',
    options: [
      { id: 'add-deadline', label: 'Add deadline', isPrimary: true },
      // ...
    ],
    deliveryChannel: 'toast',
  },
  // ... one entry per agent
};
```

### Helper Functions

| Function | Purpose |
|----------|---------|
| `getDiscoveryCard(agentId)` | Retrieves card data for agent |
| `getRemainingAgents(experiencedAgents)` | Gets agents not yet experienced |
| `hasExperiencedAllAgents(experiencedAgents)` | Checks if all 4 experienced |
| `getAgentName(agentId)` | Gets display name from AGENT_CONFIGS |
| `getAgentEmoji(agentId)` | Gets emoji from AGENT_CONFIGS |
| `getAgentColor(agentId)` | Gets color from AGENT_CONFIGS |

---

## Agent Intro System

Separate from onboarding, this system shows an intro sheet when an agent is assigned to a note for the first time.

### Hook: useAgentIntroTrigger

Location: `/apps/expo/hooks/useAgentIntroTrigger.ts`

**Purpose**: Shows agent intro sheet when:
1. Note content is analyzed (mode detection)
2. Agent assigned for first time
3. User hasn't seen that agent's intro yet

```typescript
interface AgentIntroTriggerResult {
  showIntroFor: AgentId | null;
  clearIntro: () => void;
  markIntroSeen: () => void;
  checkForIntro: (note: Note) => void;
}

export function useAgentIntroTrigger(noteId: string | undefined): AgentIntroTriggerResult
```

**Flow**:
1. `detectModeForNote(note)` analyzes content → returns `{ mode, confidence, organizeStage }`
2. If confidence > 0.3 and user hasn't seen this agent's intro: show sheet
3. Delay 500ms for smooth transition
4. Track `Analytics.agentIntroShown(agentId)`

### Agent Intro Content

Location: `/apps/expo/constants/agentIntroContent.ts`

```typescript
interface AgentIntroContent {
  agentId: AgentId;
  headline: string;        // "Meet The Manager"
  subtitle: string;        // "Your task assistant"
  introduction: string;    // From AGENT_DESCRIPTIONS
  skillsPreview: AgentIntroSkillPreview[];  // 3 skills with icons + labels
}

// Example:
{
  manager: {
    headline: 'Meet The Manager',
    subtitle: 'Your task assistant',
    introduction: 'The Manager helps you stay on track...',
    skillsPreview: [
      { icon: 'Clock', label: 'Deadline reminders' },
      { icon: 'ListChecks', label: 'Task breakdown tips' },
      { icon: 'SortAscending', label: 'Priority suggestions' },
    ],
  }
}
```

---

## Analytics

The following analytics events are tracked:

| Event | When Fired |
|-------|------------|
| `agentOnboardingStarted()` | Flow initiated |
| `agentOnboardingCompleted(agents, timeSeconds)` | Flow finished |
| `agentOnboardingAgentChosen(agentId, isFirst)` | Agent selected in discovery/selection |
| `agentOnboardingAgentCompleted(agentId)` | Agent demo viewed |
| `agentOnboardingDemoViewed(agentId)` | Note created in demo step |
| `agentOnboardingSkipped(agentsCount)` | User skipped mid-flow |
| `agentIntroShown(agentId)` | Intro sheet displayed (mode-triggered) |
| `agentIntroDismissed(agentId)` | User dismissed intro |

---

## Platform Differences

| Aspect | Expo | Webapp |
|--------|------|--------|
| **Modal Type** | React Native Modal | Radix UI Dialog |
| **Store Library** | Zustand with AsyncStorage | Zustand with localStorage |
| **Animations** | React Native Reanimated | CSS/Tailwind animations |
| **Styling** | StyleSheet + NativeWind | Tailwind CSS |
| **Keyboard Handling** | KeyboardAvoidingView | Native browser behavior |
| **Trigger Location** | `_layout.tsx` + `settings.tsx` | `(main)/layout.tsx` |
| **Content File** | `/constants/agentOnboardingContent.ts` | `/lib/agentOnboardingContent.ts` |

**Functionality is identical** - implementation differs due to platform requirements.

---

## Key Files

### Expo

```
apps/expo/
├── components/onboarding/
│   ├── index.ts                    # Exports
│   ├── AgentOnboarding/
│   │   └── index.tsx               # Main orchestrator (state machine)
│   ├── AgentDiscoveryStep.tsx      # Agent selection grid
│   ├── GuidedNoteCreation.tsx      # Note creation with instructions
│   ├── DemoNudgePreview.tsx        # Mock nudge demo
│   ├── AgentContinuePrompt.tsx     # Continue/finish prompt
│   ├── AgentSelectionGrid.tsx      # Select remaining agents
│   ├── OnboardingComplete.tsx      # Completion celebration
│   └── CoachMarksProvider.tsx      # Feature spotlight tour
├── constants/
│   ├── agentOnboardingContent.ts   # All onboarding copy/content
│   └── agentIntroContent.ts        # Agent intro sheet content
├── hooks/
│   └── useAgentIntroTrigger.ts     # Trigger for agent intro sheets
├── stores/
│   └── userStore.ts                # agentOnboarding state slice
└── app/
    ├── _layout.tsx                 # Onboarding trigger (initial launch)
    └── (tabs)/settings.tsx         # Re-run onboarding option
```

### Webapp

```
apps/webapp/
├── components/onboarding/
│   ├── AgentOnboarding.tsx         # Main orchestrator (Radix Dialog)
│   ├── AgentDiscoveryStep.tsx
│   ├── GuidedNoteCreation.tsx
│   ├── DemoNudgePreview.tsx
│   ├── AgentContinuePrompt.tsx
│   ├── AgentSelectionGrid.tsx
│   └── OnboardingComplete.tsx
├── lib/
│   └── agentOnboardingContent.ts   # All onboarding copy/content
├── stores/
│   └── onboardingStore.ts          # Dedicated onboarding store
└── app/(main)/
    └── layout.tsx                  # Onboarding trigger
```

---

## Implementation Details

### Real Note Creation

The onboarding creates actual notes using `useNoteStore.addNote()`:

```typescript
const handleCreateNote = () => {
  const noteId = addNote({
    title: '',
    content: userInput,
    // ... other defaults
  });
  setCreatedNoteId(noteId);
  trackDemoViewed(selectedAgent);
  setStep('demo_preview');
};
```

### Animation Patterns

**Entry Animations** (React Native Reanimated):
- `FadeIn`, `FadeInDown`, `FadeInUp`
- `SlideInDown`, `ZoomIn`

**Interactions**:
- Spring-based scale animations on button press
- Staggered sparkle animations in completion screen

### Accessibility

All interactive elements include:
- `accessibilityLabel`
- `accessibilityRole`
- `accessibilityHint`

Example:
```typescript
<TouchableOpacity
  accessibilityLabel={`Select ${card.label}`}
  accessibilityRole="button"
  accessibilityHint={`Choose to ${card.description.toLowerCase()}`}
>
```

### Persistence

- **Expo**: AsyncStorage-backed Zustand with debounced writes
- **Webapp**: localStorage with key `'toonnotes-onboarding'`
- State survives app closes/reloads

---

## Re-Running Onboarding

Users can re-experience the onboarding from Settings:

```typescript
// In settings.tsx
const handleReRunOnboarding = () => {
  resetAgentOnboarding();  // Clears all state
  setShowAgentOnboarding(true);  // Opens modal
};
```

This allows users to:
- Re-familiarize with agents after updates
- Experience agents they may have skipped
- Understand new agent capabilities

---

*Last updated: January 2025*
