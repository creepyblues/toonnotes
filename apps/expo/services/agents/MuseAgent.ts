/**
 * Muse Agent - MODE Framework v2.0
 *
 * The Muse 💡 - "What could this become?"
 *
 * AI agent for DEVELOP mode notes. Helps users:
 * - Expand raw ideas into developed concepts
 * - Connect related ideas
 * - Overcome creative blocks
 * - Bridge ideas to action (MANAGE mode)
 *
 * Personality: Collaborative, generative, never judges
 * Values: Creativity, exploration, connection, growth
 * Avoids: Criticism, premature closure, perfectionism
 */

import { Agent, AgentConfig, agentRegistry, AGENT_CONFIGS } from './Agent';
import { skillRegistry } from '../skills';
import type { Skill, SkillContext, SkillResult } from './Agent';
import { DevelopData, Note, NoteBehavior } from '@/types';

// ============================================
// Muse Skill IDs
// ============================================

export const MUSE_SKILL_IDS = {
  EXPAND: 'muse-expand',
  RESURFACE: 'muse-resurface',
  CONNECT: 'muse-connect',
  UNBLOCK: 'muse-unblock',
  BRIDGE: 'muse-bridge',
} as const;

// ============================================
// Content Type Detection
// ============================================

export type ContentType = 'story' | 'business' | 'blog' | 'design' | 'music' | 'general';

interface ContentTypePattern {
  type: ContentType;
  patterns: RegExp[];
  prompts: string[];
}

const CONTENT_TYPE_PATTERNS: ContentTypePattern[] = [
  {
    type: 'story',
    patterns: [
      /\b(?:character|protagonist|antagonist|plot|scene|chapter|dialogue)\b/i,
      /\b(?:once upon|story|novel|fiction|narrative)\b/i,
      /[""].*[""].*(?:said|asked|replied)/i,
    ],
    prompts: [
      'What does your main character want most?',
      'What stands in their way?',
      'What would happen if the opposite occurred?',
      'What secret is someone keeping?',
    ],
  },
  {
    type: 'business',
    patterns: [
      /\b(?:market|customer|revenue|profit|startup|business)\b/i,
      /\b(?:MVP|product|service|pricing|competitor)\b/i,
      /\b(?:user|growth|monetize|scale)\b/i,
    ],
    prompts: [
      "Who would pay for this? What's their pain?",
      'What makes this different from alternatives?',
      "What's the smallest version you could test?",
      'How would you reach your first 10 customers?',
    ],
  },
  {
    type: 'blog',
    patterns: [
      /\b(?:article|post|blog|essay|opinion)\b/i,
      /\b(?:reader|audience|publish|draft)\b/i,
      /\b(?:thesis|argument|point|takeaway)\b/i,
    ],
    prompts: [
      "What's the one takeaway for readers?",
      'What would make someone share this?',
      "What's the contrarian view?",
      'What story illustrates your point?',
    ],
  },
  {
    type: 'design',
    patterns: [
      /\b(?:UI|UX|interface|design|layout|wireframe)\b/i,
      /\b(?:user flow|prototype|mockup|component)\b/i,
      /\b(?:feature|screen|button|modal)\b/i,
    ],
    prompts: [
      "What's the magic moment for users?",
      'What would delight someone using this?',
      'What can you remove and still deliver value?',
      'How would a first-time user feel?',
    ],
  },
  {
    type: 'music',
    patterns: [
      /\b(?:song|melody|lyrics|chord|verse|chorus)\b/i,
      /\b(?:beat|tempo|rhythm|hook|bridge)\b/i,
      /\b(?:album|track|instrumental)\b/i,
    ],
    prompts: [
      'What emotion should this evoke?',
      "What's the hook that sticks in your head?",
      'What story is this song telling?',
      'What would make someone play this on repeat?',
    ],
  },
];

/**
 * Detect the content type of an idea
 */
export function detectContentType(content: string): ContentType {
  for (const pattern of CONTENT_TYPE_PATTERNS) {
    const matchCount = pattern.patterns.filter(p => p.test(content)).length;
    if (matchCount >= 1) {
      return pattern.type;
    }
  }
  return 'general';
}

/**
 * Get prompts for a content type
 */
export function getPromptsForType(type: ContentType): string[] {
  const pattern = CONTENT_TYPE_PATTERNS.find(p => p.type === type);
  if (pattern) return pattern.prompts;

  // General prompts
  return [
    'What excites you most about this idea?',
    'What would need to be true for this to work?',
    'Who else might find this interesting?',
    'What would the ideal outcome look like?',
  ];
}

// ============================================
// Maturity Level
// ============================================

export type IdeaMaturity = 'spark' | 'explored' | 'developed' | 'ready';

export function getMaturityEmoji(level: IdeaMaturity): string {
  switch (level) {
    case 'spark': return '💭';
    case 'explored': return '🌱';
    case 'developed': return '🌳';
    case 'ready': return '🚀';
  }
}

export function getMaturityLabel(level: IdeaMaturity): string {
  switch (level) {
    case 'spark': return 'Spark';
    case 'explored': return 'Explored';
    case 'developed': return 'Developed';
    case 'ready': return 'Ready';
  }
}

// ============================================
// Muse Agent Implementation
// ============================================

export class MuseAgent extends Agent {
  constructor() {
    super('muse');
  }

  /**
   * Initialize all Muse skills
   */
  initializeSkills(): void {
    console.log('[MuseAgent] Initialized with skills:', Object.values(MUSE_SKILL_IDS));
  }

  /**
   * Generate greeting in agent's voice
   */
  protected generateGreeting(): string {
    const greetings = [
      "Hey there, creative soul! What's brewing?",
      "Ready to explore some ideas together?",
      "Let's see what we can dream up today!",
      "Your ideas are waiting to grow. Where shall we start?",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  /**
   * Generate help text in agent's voice
   */
  protected generateHelpText(): string {
    return "I'm here to help your ideas grow. I'll never judge - just help you explore possibilities, make connections, and develop your thoughts into something actionable.";
  }

  /**
   * Analyze an idea note
   */
  analyzeIdea(note: Note, behavior: NoteBehavior): IdeaAnalysis {
    const data = behavior.modeData as DevelopData;
    const suggestions: IdeaSuggestion[] = [];
    const contentType = detectContentType(note.content);

    // Check if it's a raw spark that needs expansion
    if (this.isSingleLineIdea(note)) {
      suggestions.push({
        type: 'expand',
        message: "This spark has potential! Let's explore it.",
        priority: 'high',
      });
    }

    // Check if unexpanded for a while
    if (data.expansionCount === 0 && this.isOlderThan(behavior, 3)) {
      suggestions.push({
        type: 'resurface',
        message: 'This idea has been waiting. Still interested?',
        priority: 'medium',
      });
    }

    // Check if mature enough to bridge to action
    if (data.maturityLevel === 'developed' || data.maturityLevel === 'ready') {
      suggestions.push({
        type: 'bridge',
        message: 'This idea seems ready. Time to make it happen?',
        priority: 'medium',
      });
    }

    // Suggest connections if there are linked ideas
    if (data.linkedIdeas && data.linkedIdeas.length > 0) {
      suggestions.push({
        type: 'connect',
        message: `This relates to ${data.linkedIdeas.length} other ideas.`,
        priority: 'low',
      });
    }

    return {
      maturity: data.maturityLevel,
      contentType,
      suggestions,
      expansionPrompts: getPromptsForType(contentType),
      nextAction: suggestions[0]?.type ?? null,
    };
  }

  /**
   * Check if a note is a single-line idea
   */
  private isSingleLineIdea(note: Note): boolean {
    const lines = note.content.split('\n').filter(l => l.trim().length > 0);
    return lines.length <= 2 && note.content.length < 200;
  }

  /**
   * Check if behavior is older than N days
   */
  private isOlderThan(behavior: NoteBehavior, days: number): boolean {
    const threshold = days * 24 * 60 * 60 * 1000;
    return Date.now() - behavior.createdAt > threshold;
  }

  /**
   * Generate expansion angles for an idea
   */
  generateExpansionAngles(note: Note): ExpansionAngle[] {
    const contentType = detectContentType(note.content);
    const angles: ExpansionAngle[] = [];

    // Universal angles
    angles.push({
      id: 'why',
      label: 'Go deeper',
      prompt: 'Why does this matter? What problem does it solve?',
      emoji: '🔍',
    });

    angles.push({
      id: 'opposite',
      label: 'Flip it',
      prompt: 'What if the opposite were true? What would that look like?',
      emoji: '🔄',
    });

    angles.push({
      id: 'combine',
      label: 'Combine',
      prompt: 'What if you combined this with something unexpected?',
      emoji: '🔗',
    });

    // Content-type specific angles
    switch (contentType) {
      case 'story':
        angles.push({
          id: 'character',
          label: 'Character',
          prompt: "Who's the most interesting person in this story and why?",
          emoji: '👤',
        });
        break;
      case 'business':
        angles.push({
          id: 'customer',
          label: 'Customer',
          prompt: 'Describe your ideal customer in detail.',
          emoji: '🎯',
        });
        break;
      case 'blog':
        angles.push({
          id: 'hook',
          label: 'Hook',
          prompt: 'What opening line would stop someone scrolling?',
          emoji: '🪝',
        });
        break;
      case 'design':
        angles.push({
          id: 'delight',
          label: 'Delight',
          prompt: 'What unexpected detail would make users smile?',
          emoji: '✨',
        });
        break;
      default:
        angles.push({
          id: 'audience',
          label: 'Audience',
          prompt: 'Who would love this and why?',
          emoji: '👥',
        });
    }

    return angles;
  }

  /**
   * Generate creative unblock prompts
   */
  getUnblockPrompts(): string[] {
    return [
      "What if there were no constraints?",
      "What would a child do with this?",
      "What's the laziest way to achieve this?",
      "What would your hero do?",
      "What if you had to finish in one hour?",
      "What if money wasn't a factor?",
      "What's the most ridiculous version of this?",
      "What would you do if no one was watching?",
    ];
  }

  /**
   * Check if an idea is ready to bridge to MANAGE mode
   */
  isReadyToBridge(data: DevelopData): boolean {
    return (
      data.maturityLevel === 'developed' ||
      data.maturityLevel === 'ready' ||
      data.expansionCount >= 3
    );
  }
}

// ============================================
// Types
// ============================================

export interface IdeaSuggestion {
  type: 'expand' | 'resurface' | 'connect' | 'bridge' | 'unblock';
  message: string;
  priority: 'high' | 'medium' | 'low';
}

export interface IdeaAnalysis {
  maturity: IdeaMaturity;
  contentType: ContentType;
  suggestions: IdeaSuggestion[];
  expansionPrompts: string[];
  nextAction: IdeaSuggestion['type'] | null;
}

export interface ExpansionAngle {
  id: string;
  label: string;
  prompt: string;
  emoji: string;
}

// ============================================
// Singleton Instance
// ============================================

let museInstance: MuseAgent | null = null;

export function getMuseAgent(): MuseAgent {
  if (!museInstance) {
    museInstance = new MuseAgent();
    agentRegistry.register(museInstance);
  }
  return museInstance;
}

// Auto-initialize on import
getMuseAgent();
