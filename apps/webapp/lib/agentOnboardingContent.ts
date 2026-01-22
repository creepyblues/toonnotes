/**
 * Agent Onboarding Content - MODE Framework v2.0 (Web)
 *
 * Defines the content and configuration for the interactive agent onboarding flow.
 * Each agent has:
 * - Discovery card content (shown in agent selection)
 * - Guided note creation instructions
 * - Demo nudge content to preview agent behavior
 */

import { AgentId } from '@toonnotes/types';
import { AGENT_CONFIGS } from '../services/agents';

// ============================================
// Types
// ============================================

export interface AgentDiscoveryCard {
  agentId: AgentId;
  label: string;
  description: string;
  emoji: string;
  color: string;
}

export interface GuidedNoteInstruction {
  agentId: AgentId;
  instruction: string;
  placeholder: string;
  exampleNote: string;
}

export interface DemoNudgeContent {
  agentId: AgentId;
  title: string;
  body: string;
  explanation: string;
  options: DemoNudgeOption[];
  deliveryChannel: 'toast' | 'sheet';
}

export interface DemoNudgeOption {
  id: string;
  label: string;
  isPrimary?: boolean;
}

// ============================================
// Discovery Cards
// ============================================

export const AGENT_DISCOVERY_CARDS: AgentDiscoveryCard[] = [
  {
    agentId: 'manager',
    label: 'Track a task',
    description: 'Stay on top of deadlines',
    emoji: AGENT_CONFIGS.manager.emoji,
    color: AGENT_CONFIGS.manager.color,
  },
  {
    agentId: 'muse',
    label: 'Capture an idea',
    description: 'Let creativity flow',
    emoji: AGENT_CONFIGS.muse.emoji,
    color: AGENT_CONFIGS.muse.color,
  },
  {
    agentId: 'librarian',
    label: 'Save a link',
    description: 'Organize your finds',
    emoji: AGENT_CONFIGS.librarian.emoji,
    color: AGENT_CONFIGS.librarian.color,
  },
  {
    agentId: 'biographer',
    label: 'Journal a moment',
    description: 'Remember what matters',
    emoji: AGENT_CONFIGS.biographer.emoji,
    color: AGENT_CONFIGS.biographer.color,
  },
];

// ============================================
// Guided Note Instructions
// ============================================

export const GUIDED_NOTE_INSTRUCTIONS: Record<AgentId, GuidedNoteInstruction> = {
  manager: {
    agentId: 'manager',
    instruction: 'Create a task like:',
    placeholder: 'Enter your task...',
    exampleNote: 'Finish project report',
  },
  muse: {
    agentId: 'muse',
    instruction: 'Write a one-line idea like:',
    placeholder: 'Capture your idea...',
    exampleNote: 'App for tracking plant watering',
  },
  librarian: {
    agentId: 'librarian',
    instruction: 'Save a reference like:',
    placeholder: 'Paste a link or reference...',
    exampleNote: 'https://example.com - Great design article',
  },
  biographer: {
    agentId: 'biographer',
    instruction: 'Write about your day:',
    placeholder: 'What happened today?',
    exampleNote: 'Had coffee with Sarah this morning...',
  },
};

// ============================================
// Demo Nudge Content
// ============================================

export const DEMO_NUDGE_CONTENT: Record<AgentId, DemoNudgeContent> = {
  manager: {
    agentId: 'manager',
    title: 'When does this need to happen?',
    body: '"Finish project report" doesn\'t have a deadline yet.',
    explanation:
      'When you create tasks without deadlines, the Manager will gently nudge you to add one.',
    options: [
      { id: 'add-deadline', label: 'Add deadline', isPrimary: true },
      { id: 'later', label: 'Maybe later' },
    ],
    deliveryChannel: 'toast',
  },
  muse: {
    agentId: 'muse',
    title: 'Want to develop this idea?',
    body: 'This spark has potential! Here are some angles to explore:',
    explanation:
      'When you capture quick ideas, the Muse offers creative angles to develop them further.',
    options: [
      { id: 'go-deeper', label: 'Go deeper', isPrimary: true },
      { id: 'flip-it', label: 'Flip it' },
      { id: 'combine', label: 'Combine' },
    ],
    deliveryChannel: 'sheet',
  },
  librarian: {
    agentId: 'librarian',
    title: 'New item in your inbox',
    body: 'Would you like to tag this for easy finding later?',
    explanation:
      'The Librarian helps prevent information overload with gentle prompts to organize.',
    options: [
      { id: 'add-tags', label: 'Add tags', isPrimary: true },
      { id: 'file-later', label: 'File later' },
    ],
    deliveryChannel: 'toast',
  },
  biographer: {
    agentId: 'biographer',
    title: 'A moment to reflect',
    body: 'Would you like to add more context to this memory?',
    explanation:
      'The Biographer appears in the evening to encourage reflection and surfaces memories on anniversaries.',
    options: [
      { id: 'add-details', label: 'Add details', isPrimary: true },
      { id: 'keep-simple', label: 'Keep it simple' },
    ],
    deliveryChannel: 'toast',
  },
};

// ============================================
// Agent Descriptions (for UI)
// ============================================

export const AGENT_DESCRIPTIONS: Record<AgentId, string> = {
  manager:
    'The Manager helps you stay on track with deadlines and priorities. It gently reminds you when tasks need attention.',
  muse:
    'The Muse sparks creativity by offering new angles and connections for your ideas. It helps turn sparks into developed concepts.',
  librarian:
    'The Librarian keeps your information organized and findable. It suggests tags and helps prevent clutter.',
  biographer:
    'The Biographer preserves your memories and encourages reflection. It surfaces meaningful moments at the right times.',
};

// ============================================
// Onboarding Flow Text
// ============================================

export const ONBOARDING_TEXT = {
  discoveryStep: {
    title: 'What would you like to try first?',
    subtitle: 'Pick one to meet your AI assistant',
    skipButton: 'Skip for now',
  },
  guidedCreation: {
    createButton: 'Create Note',
    backButton: 'Back',
  },
  demoPreview: {
    demoBadge: 'DEMO',
    gotItButton: 'Got it!',
  },
  continuePrompt: {
    title: 'Nice work!',
    subtitle: (agentName: string) => `You've met the ${agentName} agent.`,
    tryAnotherButton: 'Try Another Agent',
    startButton: 'Start Using ToonNotes',
  },
  agentSelection: {
    title: 'Which agent would you like to meet next?',
    doneLabel: '(done)',
  },
  completion: {
    title: "You're all set!",
    subtitle: 'Your AI assistants are ready to help.',
    subtitle4Agents: "You've met all four AI assistants!",
    startButton: 'Start Using ToonNotes',
  },
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get discovery card for an agent
 */
export function getDiscoveryCard(agentId: AgentId): AgentDiscoveryCard | undefined {
  return AGENT_DISCOVERY_CARDS.find((card) => card.agentId === agentId);
}

/**
 * Get remaining agents that haven't been experienced
 */
export function getRemainingAgents(experiencedAgents: AgentId[]): AgentDiscoveryCard[] {
  return AGENT_DISCOVERY_CARDS.filter(
    (card) => !experiencedAgents.includes(card.agentId)
  );
}

/**
 * Check if all agents have been experienced
 */
export function hasExperiencedAllAgents(experiencedAgents: AgentId[]): boolean {
  return experiencedAgents.length >= AGENT_DISCOVERY_CARDS.length;
}

/**
 * Get agent name from config
 */
export function getAgentName(agentId: AgentId): string {
  return AGENT_CONFIGS[agentId]?.name ?? 'Assistant';
}

/**
 * Get agent emoji from config
 */
export function getAgentEmoji(agentId: AgentId): string {
  return AGENT_CONFIGS[agentId]?.emoji ?? '🤖';
}

/**
 * Get agent color from config
 */
export function getAgentColor(agentId: AgentId): string {
  return AGENT_CONFIGS[agentId]?.color ?? '#4C9C9B';
}
