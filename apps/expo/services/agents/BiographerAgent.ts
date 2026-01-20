/**
 * Biographer Agent - EXPERIENCE Mode
 *
 * The reflective companion for capturing and remembering moments.
 * Helps users build a meaningful personal archive through gentle
 * prompts, enrichment suggestions, and memory surfacing.
 *
 * Personality: Emotionally intelligent, memory-surfacing, never intrusive
 */

import { Agent, AgentConfig, AGENT_CONFIGS } from './Agent';
import type { Note, ExperienceData } from '@/types';

// ============================================
// Constants
// ============================================

export const BIOGRAPHER_SKILL_IDS = {
  NUDGE: 'bio-nudge',
  REENGAGE: 'bio-reengage',
  ENRICH: 'bio-enrich',
  PATTERN: 'bio-pattern',
  TIMECAPSULE: 'bio-timecapsule',
  LINK: 'bio-link',
  WRAPUP: 'bio-wrapup',
} as const;

// ============================================
// Sentiment Analysis
// ============================================

export type Sentiment = 'positive' | 'neutral' | 'negative' | 'mixed';

interface SentimentMarkers {
  positive: RegExp[];
  negative: RegExp[];
}

const SENTIMENT_MARKERS: SentimentMarkers = {
  positive: [
    /\b(?:happy|glad|excited|grateful|thankful|amazing|wonderful|love|enjoy|great|awesome|fantastic|beautiful|joy|blessed)\b/i,
    /😊|😄|😃|🥰|❤️|💕|🎉|✨|🌟|😁|🤗|💪|🙏/,
    /\b(?:finally|success|achieved|accomplished|proud|celebrate)\b/i,
  ],
  negative: [
    /\b(?:sad|angry|frustrated|worried|anxious|stressed|tired|exhausted|overwhelmed|disappointed|upset|hurt|alone|scared)\b/i,
    /😢|😭|😔|😞|😩|😤|😰|💔|😫|😪/,
    /\b(?:failed|lost|miss|hate|regret|struggle|difficult|hard time)\b/i,
  ],
};

/**
 * Analyze sentiment of journal entry
 */
export function analyzeSentiment(content: string): Sentiment {
  const positiveCount = SENTIMENT_MARKERS.positive.filter(p => p.test(content)).length;
  const negativeCount = SENTIMENT_MARKERS.negative.filter(p => p.test(content)).length;

  if (positiveCount > 0 && negativeCount > 0) return 'mixed';
  if (positiveCount >= 2) return 'positive';
  if (negativeCount >= 2) return 'negative';
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

// ============================================
// Person/Entity Detection
// ============================================

/**
 * Extract mentioned people from content
 */
export function extractPeopleMentioned(content: string): string[] {
  const people: string[] = [];

  // Common patterns for mentioning people
  const patterns = [
    /(?:with|met|saw|called|texted|talked to|visited|had (?:coffee|lunch|dinner) with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g,
    /(?:my\s+)?(?:mom|dad|mother|father|sister|brother|friend|boyfriend|girlfriend|wife|husband|partner)\s+([A-Z][a-z]+)?/gi,
    /@([A-Za-z]+)/g,  // Social-media style mentions
  ];

  for (const pattern of patterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        people.push(match[1].trim());
      }
    }
  }

  // Also look for standalone capitalized names after prepositions
  const namePattern = /\b(?:with|from|to|and)\s+([A-Z][a-z]{2,})\b/g;
  const nameMatches = content.matchAll(namePattern);
  for (const match of nameMatches) {
    if (match[1] && !['The', 'This', 'That', 'Then', 'Today', 'Tomorrow', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(match[1])) {
      people.push(match[1]);
    }
  }

  // Return unique names
  return [...new Set(people)];
}

// ============================================
// Entry Analysis
// ============================================

export interface JournalAnalysis {
  sentiment: Sentiment;
  peopleMentioned: string[];
  hasMedia: boolean;
  hasLocation: boolean;
  wordCount: number;
  entryType: EntryType;
}

export type EntryType = 'daily' | 'event' | 'reflection' | 'gratitude' | 'travel' | 'media_log';

const ENTRY_TYPE_PATTERNS: Array<{ type: EntryType; patterns: RegExp[] }> = [
  {
    type: 'travel',
    patterns: [
      /\b(?:trip|travel|visited|flew|hotel|airport|vacation|holiday|destination)\b/i,
      /\b(?:explored|toured|sightseeing|wandered|arrived at)\b/i,
    ],
  },
  {
    type: 'media_log',
    patterns: [
      /\b(?:watched|read|listened to|finished|started|episode|movie|book|album|podcast|show|series)\b/i,
      /\b(?:rating|stars|recommend|review)\b/i,
    ],
  },
  {
    type: 'gratitude',
    patterns: [
      /\b(?:grateful|thankful|blessed|appreciate|fortunate)\b/i,
      /\b(?:gratitude|blessings)\b/i,
    ],
  },
  {
    type: 'event',
    patterns: [
      /\b(?:birthday|wedding|party|celebration|anniversary|graduation|concert|festival)\b/i,
      /\b(?:attended|went to|hosted)\b/i,
    ],
  },
  {
    type: 'reflection',
    patterns: [
      /\b(?:thinking about|reflecting on|realized|learned|growth|change|decision)\b/i,
      /\b(?:looking back|moving forward|starting fresh)\b/i,
    ],
  },
];

/**
 * Detect entry type from content
 */
export function detectEntryType(content: string): EntryType {
  for (const { type, patterns } of ENTRY_TYPE_PATTERNS) {
    const matchCount = patterns.filter(p => p.test(content)).length;
    if (matchCount >= 1) return type;
  }
  return 'daily';
}

/**
 * Analyze a journal entry
 */
export function analyzeJournalEntry(note: Note): JournalAnalysis {
  const content = note.content;

  return {
    sentiment: analyzeSentiment(content),
    peopleMentioned: extractPeopleMentioned(content),
    hasMedia: /\.(jpg|jpeg|png|gif|mp4|mov)$/i.test(content) || content.includes('📷') || content.includes('🎬'),
    hasLocation: /📍|@\s*[A-Z]|located at|at the|visited/i.test(content),
    wordCount: content.split(/\s+/).filter(w => w.length > 0).length,
    entryType: detectEntryType(content),
  };
}

/**
 * Analyze content string directly (for enrichment suggestions)
 */
export function analyzeContent(content: string): JournalAnalysis {
  return {
    sentiment: analyzeSentiment(content),
    peopleMentioned: extractPeopleMentioned(content),
    hasMedia: /\.(jpg|jpeg|png|gif|mp4|mov)$/i.test(content) || content.includes('📷') || content.includes('🎬'),
    hasLocation: /📍|@\s*[A-Z]|located at|at the|visited/i.test(content),
    wordCount: content.split(/\s+/).filter(w => w.length > 0).length,
    entryType: detectEntryType(content),
  };
}

// ============================================
// Enrichment Suggestions
// ============================================

export interface EnrichmentSuggestion {
  id: string;
  emoji: string;
  prompt: string;
  field: 'location' | 'photo' | 'people' | 'feeling' | 'detail';
}

/**
 * Generate enrichment suggestions based on content
 */
export function getEnrichmentSuggestions(content: string): EnrichmentSuggestion[] {
  const suggestions: EnrichmentSuggestion[] = [];
  const analysis = analyzeContent(content);

  // Suggest location if not present
  if (!analysis.hasLocation) {
    suggestions.push({
      id: 'add-location',
      emoji: '📍',
      prompt: 'Add location?',
      field: 'location',
    });
  }

  // Suggest photo if not present
  if (!analysis.hasMedia) {
    suggestions.push({
      id: 'add-photo',
      emoji: '📸',
      prompt: 'Add a photo?',
      field: 'photo',
    });
  }

  // Suggest tagging people if mentioned but not linked
  if (analysis.peopleMentioned.length > 0) {
    suggestions.push({
      id: 'tag-people',
      emoji: '👥',
      prompt: `Tag ${analysis.peopleMentioned[0]}?`,
      field: 'people',
    });
  }

  // Suggest feeling if sentiment is neutral
  if (analysis.sentiment === 'neutral') {
    suggestions.push({
      id: 'add-feeling',
      emoji: '💭',
      prompt: 'How are you feeling?',
      field: 'feeling',
    });
  }

  // Always offer to add detail for short entries
  if (analysis.wordCount < 30) {
    suggestions.push({
      id: 'add-detail',
      emoji: '✏️',
      prompt: 'Add more details?',
      field: 'detail',
    });
  }

  return suggestions.slice(0, 4); // Max 4 suggestions
}

// ============================================
// Streak Tracking
// ============================================

/**
 * Calculate journaling streak
 */
export function calculateStreak(entryDates: number[]): number {
  if (entryDates.length === 0) return 0;

  // Sort dates descending
  const sorted = [...entryDates].sort((a, b) => b - a);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  let streak = 0;
  let currentDate = todayMs;

  for (const entryDate of sorted) {
    const entryDay = new Date(entryDate);
    entryDay.setHours(0, 0, 0, 0);
    const entryDayMs = entryDay.getTime();

    const dayDiff = Math.floor((currentDate - entryDayMs) / (24 * 60 * 60 * 1000));

    if (dayDiff === 0) {
      // Entry on current date
      streak++;
      currentDate = entryDayMs - 24 * 60 * 60 * 1000;
    } else if (dayDiff === 1) {
      // Entry on previous day (streak continues)
      streak++;
      currentDate = entryDayMs - 24 * 60 * 60 * 1000;
    } else {
      // Gap in streak
      break;
    }
  }

  return streak;
}

// ============================================
// Memory Prompts
// ============================================

const REFLECTION_PROMPTS = [
  "What's one thing you're grateful for today?",
  "What was the highlight of your day?",
  "What challenged you today?",
  "What made you smile?",
  "What did you learn today?",
  "Who made a difference in your day?",
  "What are you looking forward to?",
  "What's on your mind right now?",
  "How did you take care of yourself today?",
  "What's something you want to remember?",
];

const RE_ENGAGEMENT_PROMPTS = [
  "One word to describe this week?",
  "Quick check-in: How are you?",
  "What's been keeping you busy?",
  "Anything worth remembering lately?",
  "Just a thought or a moment from today?",
];

// ============================================
// Biographer Agent Class
// ============================================

let biographerInstance: BiographerAgent | null = null;

export class BiographerAgent extends Agent {
  constructor() {
    super('biographer');
  }

  /**
   * Initialize biographer-specific skills
   * Called automatically when agent is created
   */
  initializeSkills(): void {
    // Skills are registered via skillRegistry in individual skill files
    // Import biographer skills to trigger registration
    console.log('[BiographerAgent] Skills initialized');
  }

  protected generateGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning. How did you sleep?";
    if (hour < 17) return "Good afternoon. How's your day going?";
    if (hour < 21) return "Good evening. Time to reflect on the day?";
    return "Late night thoughts? I'm here to listen.";
  }

  protected generateHelpText(): string {
    return "I help you capture and remember meaningful moments. I'll gently remind you to journal, surface past memories on anniversaries, and help you see patterns in your experiences. Your story matters.";
  }

  /**
   * Get a random reflection prompt
   */
  getReflectionPrompt(): string {
    return REFLECTION_PROMPTS[Math.floor(Math.random() * REFLECTION_PROMPTS.length)];
  }

  /**
   * Get a re-engagement prompt for when user hasn't journaled
   */
  getReEngagementPrompt(): string {
    return RE_ENGAGEMENT_PROMPTS[Math.floor(Math.random() * RE_ENGAGEMENT_PROMPTS.length)];
  }

  /**
   * Analyze journal entry for the agent context
   */
  analyzeEntry(note: Note): JournalAnalysis {
    return analyzeJournalEntry(note);
  }

  /**
   * Get enrichment suggestions for an entry
   */
  suggestEnrichments(content: string): EnrichmentSuggestion[] {
    return getEnrichmentSuggestions(content);
  }

  /**
   * Calculate current journaling streak
   */
  calculateJournalStreak(entryDates: number[]): number {
    return calculateStreak(entryDates);
  }

  /**
   * Get sentiment label for display
   */
  getSentimentLabel(sentiment: Sentiment): string {
    switch (sentiment) {
      case 'positive': return 'Feeling good';
      case 'negative': return 'Challenging day';
      case 'mixed': return 'Mixed feelings';
      default: return 'Reflective';
    }
  }

  /**
   * Get sentiment emoji
   */
  getSentimentEmoji(sentiment: Sentiment): string {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '💙';
      case 'mixed': return '🤔';
      default: return '💭';
    }
  }

  /**
   * Get entry type label
   */
  getEntryTypeLabel(entryType: EntryType): string {
    switch (entryType) {
      case 'travel': return 'Travel Log';
      case 'media_log': return 'Media Log';
      case 'gratitude': return 'Gratitude';
      case 'event': return 'Event';
      case 'reflection': return 'Reflection';
      default: return 'Daily Entry';
    }
  }

  /**
   * Get entry type emoji
   */
  getEntryTypeEmoji(entryType: EntryType): string {
    switch (entryType) {
      case 'travel': return '✈️';
      case 'media_log': return '🎬';
      case 'gratitude': return '🙏';
      case 'event': return '🎉';
      case 'reflection': return '💭';
      default: return '📔';
    }
  }
}

// ============================================
// Singleton Accessor
// ============================================

export function getBiographerAgent(): BiographerAgent {
  if (!biographerInstance) {
    biographerInstance = new BiographerAgent();
  }
  return biographerInstance;
}

export default BiographerAgent;
