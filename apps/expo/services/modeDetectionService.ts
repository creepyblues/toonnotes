/**
 * Mode Detection Service - MODE Framework v2.0
 *
 * Detects the appropriate cognitive mode for notes and boards based on:
 * - Label presets and their associated modes
 * - Content patterns (keywords, structure)
 * - User behavior patterns
 * - Board context
 *
 * The four modes are:
 * - MANAGE: Getting things done (tasks, checklists, deadlines)
 * - DEVELOP: Growing ideas (brainstorming, creativity, drafts)
 * - ORGANIZE: Keeping for later (references, bookmarks, learning)
 * - EXPERIENCE: Recording life (journal, memories, reflections)
 */

import {
  DevelopContentType,
  Mode,
  Note,
  OrganizeStage,
} from '@/types';
import {
  getPresetForLabelFuzzy,
  getModeForLabel,
  LABEL_PRESETS,
  LabelPreset,
} from '@/constants/labelPresets';

// ============================================
// Content Pattern Definitions
// ============================================

/**
 * Keywords and patterns that suggest MANAGE mode
 */
const MANAGE_PATTERNS = {
  keywords: [
    'todo', 'task', 'do', 'finish', 'complete', 'done', 'deadline', 'due',
    'meeting', 'call', 'schedule', 'appointment', 'reminder', 'urgent',
    'priority', 'important', 'asap', 'buy', 'get', 'pick up', 'return',
    'pay', 'submit', 'send', 'email', 'contact', 'follow up', 'check',
  ],
  patterns: [
    /^\s*[-*\[\]]\s/m,           // Bullet or checkbox at start of line
    /\[\s*[xX]?\s*\]/,           // Checkbox pattern [x] or [ ]
    /\d{1,2}[\/\-]\d{1,2}/,      // Date patterns
    /by\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    /due\s+/i,
    /deadline/i,
  ],
  structureIndicators: {
    hasCheckboxes: true,
    hasBulletPoints: true,
    hasNumberedList: true,
  },
};

/**
 * Keywords and patterns that suggest DEVELOP mode
 */
const DEVELOP_PATTERNS = {
  keywords: [
    'idea', 'concept', 'brainstorm', 'draft', 'outline', 'plan', 'design',
    'create', 'build', 'develop', 'think', 'explore', 'consider', 'maybe',
    'what if', 'could', 'might', 'story', 'character', 'plot', 'chapter',
    'project', 'feature', 'product', 'startup', 'business', 'app', 'website',
    'blog', 'article', 'post', 'content', 'script', 'video', 'podcast',
  ],
  patterns: [
    /what\s+if/i,
    /how\s+about/i,
    /maybe\s+we/i,
    /could\s+be/i,
    /brainstorm/i,
    /idea:/i,
    /draft/i,
    /v\d+/,                      // Version numbers
    /wip/i,                      // Work in progress
  ],
  structureIndicators: {
    hasQuestions: true,
    hasOpenEnded: true,
    isLongForm: true,
  },
};

/**
 * Keywords and patterns that suggest ORGANIZE mode
 */
const ORGANIZE_PATTERNS = {
  keywords: [
    'save', 'bookmark', 'reference', 'resource', 'link', 'article', 'video',
    'recipe', 'tutorial', 'guide', 'how to', 'documentation', 'manual',
    'quote', 'note', 'info', 'information', 'learn', 'study', 'remember',
    'watch', 'read', 'listen', 'review', 'rating', 'recommend', 'list',
  ],
  patterns: [
    /https?:\/\//,              // URLs
    /www\./,
    /^recipe:/i,
    /^from:/i,
    /^source:/i,
    /rating:\s*\d/i,
    /\d+\s*\/\s*\d+/,           // Ratings like 8/10
    /⭐/,                        // Star ratings
  ],
  structureIndicators: {
    hasUrls: true,
    hasRatings: true,
    isReference: true,
  },
};

/**
 * Keywords and patterns that suggest EXPERIENCE mode
 */
const EXPERIENCE_PATTERNS = {
  keywords: [
    'today', 'yesterday', 'this morning', 'tonight', 'felt', 'feeling',
    'grateful', 'thankful', 'happy', 'sad', 'excited', 'worried', 'anxious',
    'met', 'saw', 'went', 'visited', 'traveled', 'trip', 'vacation',
    'birthday', 'anniversary', 'wedding', 'graduation', 'celebration',
    'memory', 'remember', 'moment', 'experience', 'life', 'day', 'week',
    'dear diary', 'journal', 'reflection', 'thought', 'wonder',
  ],
  patterns: [
    /^dear\s+diary/i,
    /today\s+i/i,
    /i\s+feel/i,
    /i\s+am\s+(so\s+)?(grateful|thankful|happy|sad)/i,
    /this\s+(morning|afternoon|evening|week|month)/i,
    /on\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    /^\d{4}[-\/]\d{2}[-\/]\d{2}/,  // Date at start
  ],
  structureIndicators: {
    isPersonal: true,
    hasEmotions: true,
    hasTimeReference: true,
  },
};

// ============================================
// Detection Result Types
// ============================================

export interface ModeDetectionResult {
  mode: Mode;
  confidence: number;         // 0-1
  organizeStage?: OrganizeStage;
  developContentType?: DevelopContentType;
  signals: ModeSignal[];
}

export interface ModeSignal {
  type: 'label' | 'keyword' | 'pattern' | 'structure' | 'context';
  mode: Mode;
  value: string;
  weight: number;
}

// ============================================
// Detection Functions
// ============================================

/**
 * Detect mode from note labels
 * This is the primary detection method - labels are explicit user intent
 */
function detectModeFromLabels(labels: string[]): ModeSignal[] {
  const signals: ModeSignal[] = [];

  for (const labelName of labels) {
    const preset = getPresetForLabelFuzzy(labelName);
    if (preset) {
      signals.push({
        type: 'label',
        mode: preset.mode,
        value: labelName,
        weight: 1.0, // Labels are high confidence
      });
    }
  }

  return signals;
}

/**
 * Detect mode from content keywords
 */
function detectModeFromKeywords(content: string): ModeSignal[] {
  const signals: ModeSignal[] = [];
  const lowerContent = content.toLowerCase();

  const checkKeywords = (keywords: string[], mode: Mode, weight: number) => {
    for (const keyword of keywords) {
      if (lowerContent.includes(keyword)) {
        signals.push({
          type: 'keyword',
          mode,
          value: keyword,
          weight,
        });
      }
    }
  };

  checkKeywords(MANAGE_PATTERNS.keywords, 'manage', 0.3);
  checkKeywords(DEVELOP_PATTERNS.keywords, 'develop', 0.3);
  checkKeywords(ORGANIZE_PATTERNS.keywords, 'organize', 0.3);
  checkKeywords(EXPERIENCE_PATTERNS.keywords, 'experience', 0.3);

  return signals;
}

/**
 * Detect mode from content patterns (regex)
 */
function detectModeFromPatterns(content: string): ModeSignal[] {
  const signals: ModeSignal[] = [];

  const checkPatterns = (patterns: RegExp[], mode: Mode, weight: number) => {
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        signals.push({
          type: 'pattern',
          mode,
          value: pattern.source,
          weight,
        });
      }
    }
  };

  checkPatterns(MANAGE_PATTERNS.patterns, 'manage', 0.4);
  checkPatterns(DEVELOP_PATTERNS.patterns, 'develop', 0.4);
  checkPatterns(ORGANIZE_PATTERNS.patterns, 'organize', 0.4);
  checkPatterns(EXPERIENCE_PATTERNS.patterns, 'experience', 0.4);

  return signals;
}

/**
 * Detect mode from content structure
 */
function detectModeFromStructure(content: string): ModeSignal[] {
  const signals: ModeSignal[] = [];

  // Check for checkboxes (MANAGE)
  const checkboxCount = (content.match(/\[\s*[xX]?\s*\]/g) || []).length;
  if (checkboxCount > 0) {
    signals.push({
      type: 'structure',
      mode: 'manage',
      value: `${checkboxCount} checkboxes`,
      weight: 0.5,
    });
  }

  // Check for bullet points (MANAGE if short items, DEVELOP if long)
  const bulletLines = content.split('\n').filter((line) => /^\s*[-*•]\s/.test(line));
  if (bulletLines.length > 0) {
    const avgLength = bulletLines.reduce((sum, line) => sum + line.length, 0) / bulletLines.length;
    signals.push({
      type: 'structure',
      mode: avgLength < 50 ? 'manage' : 'develop',
      value: `${bulletLines.length} bullet points`,
      weight: 0.3,
    });
  }

  // Check for URLs (ORGANIZE)
  const urlCount = (content.match(/https?:\/\/[^\s]+/g) || []).length;
  if (urlCount > 0) {
    signals.push({
      type: 'structure',
      mode: 'organize',
      value: `${urlCount} URLs`,
      weight: 0.5,
    });
  }

  // Check for questions (DEVELOP)
  const questionCount = (content.match(/\?/g) || []).length;
  if (questionCount >= 2) {
    signals.push({
      type: 'structure',
      mode: 'develop',
      value: `${questionCount} questions`,
      weight: 0.3,
    });
  }

  // Check for emotional/personal writing (EXPERIENCE)
  const personalPronouns = (content.match(/\b(i|me|my|myself|we|our)\b/gi) || []).length;
  const wordCount = content.split(/\s+/).length;
  const personalRatio = wordCount > 0 ? personalPronouns / wordCount : 0;
  if (personalRatio > 0.05 && wordCount > 50) {
    signals.push({
      type: 'structure',
      mode: 'experience',
      value: `${Math.round(personalRatio * 100)}% personal pronouns`,
      weight: 0.3,
    });
  }

  return signals;
}

/**
 * Calculate mode scores from signals
 */
function calculateModeScores(signals: ModeSignal[]): Record<Mode, number> {
  const scores: Record<Mode, number> = {
    manage: 0,
    develop: 0,
    organize: 0,
    experience: 0,
  };

  for (const signal of signals) {
    scores[signal.mode] += signal.weight;
  }

  return scores;
}

/**
 * Determine winning mode from scores
 */
function determineWinningMode(scores: Record<Mode, number>): { mode: Mode; confidence: number } {
  const modes = Object.keys(scores) as Mode[];
  const sortedModes = modes.sort((a, b) => scores[b] - scores[a]);
  const topMode = sortedModes[0];
  const topScore = scores[topMode];
  const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);

  // Confidence is the proportion of the winning score
  const confidence = totalScore > 0 ? topScore / totalScore : 0;

  return { mode: topMode, confidence };
}

// ============================================
// Content Type Detection for DEVELOP Mode
// ============================================

function detectDevelopContentType(content: string): DevelopContentType | undefined {
  const lowerContent = content.toLowerCase();

  // Story/Novel indicators
  const storyIndicators = [
    'character', 'plot', 'chapter', 'story', 'novel', 'fiction',
    'protagonist', 'dialogue', 'scene', 'narrative',
  ];
  const storyMatches = storyIndicators.filter((i) => lowerContent.includes(i)).length;

  // Business indicators
  const businessIndicators = [
    'market', 'customer', 'revenue', 'startup', 'business', 'product',
    'pricing', 'competitor', 'growth', 'monetize', 'user acquisition',
  ];
  const businessMatches = businessIndicators.filter((i) => lowerContent.includes(i)).length;

  // Blog/Content indicators
  const blogIndicators = [
    'post', 'article', 'blog', 'headline', 'reader', 'audience',
    'seo', 'content', 'publish', 'draft',
  ];
  const blogMatches = blogIndicators.filter((i) => lowerContent.includes(i)).length;

  // Design/Product indicators
  const designIndicators = [
    'design', 'ui', 'ux', 'feature', 'app', 'website', 'interface',
    'wireframe', 'prototype', 'user flow', 'mockup',
  ];
  const designMatches = designIndicators.filter((i) => lowerContent.includes(i)).length;

  // Find the highest match
  const scores = {
    story: storyMatches,
    business: businessMatches,
    blog: blogMatches,
    design: designMatches,
  };

  const maxScore = Math.max(...Object.values(scores));
  if (maxScore < 2) return 'general'; // Not enough indicators

  if (scores.story === maxScore) return 'story';
  if (scores.business === maxScore) return 'business';
  if (scores.blog === maxScore) return 'blog';
  if (scores.design === maxScore) return 'design';

  return 'general';
}

// ============================================
// Organize Stage Detection
// ============================================

function detectOrganizeStage(content: string, labels: string[]): OrganizeStage {
  // Check if any label suggests a specific stage
  for (const label of labels) {
    const preset = getPresetForLabelFuzzy(label);
    if (preset?.organizeStage) {
      return preset.organizeStage;
    }
  }

  // Check for learning content indicators
  const learnIndicators = [
    'learn', 'study', 'memorize', 'flashcard', 'quiz', 'practice',
    'vocabulary', 'definition', 'concept', 'term',
  ];
  const hasLearnIndicators = learnIndicators.some((i) =>
    content.toLowerCase().includes(i)
  );
  if (hasLearnIndicators) return 'learn';

  // Default to store for most organized content
  return 'store';
}

// ============================================
// Main Detection Function
// ============================================

/**
 * Detect the appropriate mode for a note
 *
 * @param note - The note to analyze
 * @returns Detection result with mode, confidence, and signals
 */
export function detectModeForNote(note: Note): ModeDetectionResult {
  const content = `${note.title}\n${note.content}`;
  const signals: ModeSignal[] = [];

  // 1. Check labels first (highest priority)
  signals.push(...detectModeFromLabels(note.labels));

  // 2. Check content patterns
  signals.push(...detectModeFromPatterns(content));

  // 3. Check keywords
  signals.push(...detectModeFromKeywords(content));

  // 4. Check structure
  signals.push(...detectModeFromStructure(content));

  // Calculate scores and determine winner
  const scores = calculateModeScores(signals);
  const { mode, confidence } = determineWinningMode(scores);

  // Build result
  const result: ModeDetectionResult = {
    mode,
    confidence,
    signals,
  };

  // Add mode-specific details
  if (mode === 'develop') {
    result.developContentType = detectDevelopContentType(content);
  } else if (mode === 'organize') {
    result.organizeStage = detectOrganizeStage(content, note.labels);
  }

  return result;
}

/**
 * Get the mode for a single label (for board mode inference)
 */
export function getModeForSingleLabel(labelName: string): Mode {
  const mode = getModeForLabel(labelName);
  return mode ?? 'organize'; // Default to organize (inbox)
}

/**
 * Infer mode for a board based on its hashtag
 */
export function inferBoardMode(hashtag: string): ModeDetectionResult {
  const preset = getPresetForLabelFuzzy(hashtag);

  if (preset) {
    return {
      mode: preset.mode,
      confidence: 0.9, // High confidence for preset match
      organizeStage: preset.organizeStage,
      signals: [
        {
          type: 'label',
          mode: preset.mode,
          value: hashtag,
          weight: 1.0,
        },
      ],
    };
  }

  // Fall back to keyword analysis of the hashtag itself
  const signals: ModeSignal[] = [];
  signals.push(...detectModeFromKeywords(hashtag));

  const scores = calculateModeScores(signals);
  const { mode, confidence } = determineWinningMode(scores);

  return {
    mode: confidence > 0.3 ? mode : 'organize', // Default to organize
    confidence: confidence || 0.3,
    organizeStage: 'inbox',
    signals,
  };
}

// ============================================
// Exports
// ============================================

export {
  MANAGE_PATTERNS,
  DEVELOP_PATTERNS,
  ORGANIZE_PATTERNS,
  EXPERIENCE_PATTERNS,
  detectModeFromLabels,
  detectModeFromKeywords,
  detectModeFromPatterns,
  detectModeFromStructure,
  detectDevelopContentType,
  detectOrganizeStage,
};
