/**
 * Agent Intro Content - First-time Agent Assignment UX
 *
 * Defines the content for the AgentIntroSheet that appears when a user
 * first encounters each agent through mode detection (note content analysis).
 */

import { AgentId } from '@/types';
import { AGENT_CONFIGS } from '@/services/agents/Agent';
import { AGENT_DESCRIPTIONS } from '@/constants/agentOnboardingContent';

// ============================================
// Types
// ============================================

export interface AgentIntroSkillPreview {
  icon: string; // Phosphor icon name
  label: string;
}

export interface AgentIntroContent {
  agentId: AgentId;
  headline: string; // "Meet The Manager"
  subtitle: string; // "Your task assistant"
  introduction: string; // From AGENT_DESCRIPTIONS
  skillsPreview: AgentIntroSkillPreview[];
}

// ============================================
// Content Definitions
// ============================================

export const AGENT_INTRO_CONTENT: Record<AgentId, AgentIntroContent> = {
  manager: {
    agentId: 'manager',
    headline: 'Meet The Manager',
    subtitle: 'Your task assistant',
    introduction: AGENT_DESCRIPTIONS.manager,
    skillsPreview: [
      { icon: 'Clock', label: 'Deadline reminders' },
      { icon: 'ListChecks', label: 'Task breakdown tips' },
      { icon: 'SortAscending', label: 'Priority suggestions' },
    ],
  },
  muse: {
    agentId: 'muse',
    headline: 'Meet The Muse',
    subtitle: 'Your creative partner',
    introduction: AGENT_DESCRIPTIONS.muse,
    skillsPreview: [
      { icon: 'ArrowsOutSimple', label: 'Idea expansion' },
      { icon: 'Shuffle', label: 'Creative angles' },
      { icon: 'Link', label: 'Idea connections' },
    ],
  },
  librarian: {
    agentId: 'librarian',
    headline: 'Meet The Librarian',
    subtitle: 'Your information curator',
    introduction: AGENT_DESCRIPTIONS.librarian,
    skillsPreview: [
      { icon: 'FolderSimple', label: 'Organization tips' },
      { icon: 'Tag', label: 'Tag suggestions' },
      { icon: 'GraduationCap', label: 'Learning prompts' },
    ],
  },
  biographer: {
    agentId: 'biographer',
    headline: 'Meet The Biographer',
    subtitle: 'Your memory keeper',
    introduction: AGENT_DESCRIPTIONS.biographer,
    skillsPreview: [
      { icon: 'PencilLine', label: 'Journaling nudges' },
      { icon: 'Sparkle', label: 'Memory surfacing' },
      { icon: 'ChatCircleText', label: 'Reflection prompts' },
    ],
  },
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get intro content for an agent
 */
export function getAgentIntroContent(agentId: AgentId): AgentIntroContent {
  return AGENT_INTRO_CONTENT[agentId];
}

/**
 * Get the agent's core question for display
 */
export function getAgentCoreQuestion(agentId: AgentId): string {
  return AGENT_CONFIGS[agentId]?.coreQuestion ?? '';
}

/**
 * Get the agent's emoji
 */
export function getAgentEmoji(agentId: AgentId): string {
  return AGENT_CONFIGS[agentId]?.emoji ?? '';
}

/**
 * Get the agent's color
 */
export function getAgentColor(agentId: AgentId): string {
  return AGENT_CONFIGS[agentId]?.color ?? '#4C9C9B';
}
