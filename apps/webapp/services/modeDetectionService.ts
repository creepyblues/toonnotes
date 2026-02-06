/**
 * Mode Detection Service (Webapp)
 *
 * Standalone keyword-based mode detection for boards.
 * Does NOT depend on label preset `mode` field - uses keyword analysis only.
 */

import { Mode } from '@toonnotes/types';
import { getPresetForLabelFuzzy } from '@toonnotes/constants';

// ============================================
// Keyword Pattern Definitions
// ============================================

const MANAGE_KEYWORDS = [
  'todo', 'task', 'do', 'finish', 'complete', 'done', 'deadline', 'due',
  'meeting', 'call', 'schedule', 'appointment', 'reminder', 'urgent',
  'priority', 'important', 'asap', 'buy', 'get', 'pick up', 'return',
  'pay', 'submit', 'send', 'email', 'contact', 'follow up', 'check',
  'in-progress', 'waiting', 'project', 'planning', 'goals',
  'shopping', 'wishlist', 'packing', 'bucket-list', 'errands',
];

const DEVELOP_KEYWORDS = [
  'idea', 'ideas', 'concept', 'brainstorm', 'draft', 'outline', 'design',
  'create', 'build', 'develop', 'think', 'explore', 'consider', 'maybe',
  'what if', 'story', 'character', 'plot', 'chapter',
  'feature', 'product', 'startup', 'business', 'app', 'website',
  'blog', 'article', 'post', 'content', 'script', 'video', 'podcast',
  'inspiration', 'research',
];

const ORGANIZE_KEYWORDS = [
  'save', 'bookmark', 'bookmarks', 'reference', 'resource', 'link',
  'recipe', 'tutorial', 'guide', 'how to', 'documentation', 'manual',
  'note', 'info', 'information', 'learn', 'study', 'remember',
  'watch', 'watchlist', 'read', 'reading', 'listen', 'review',
  'rating', 'recommend', 'recommendation', 'list',
];

const EXPERIENCE_KEYWORDS = [
  'journal', 'diary', 'today', 'yesterday', 'felt', 'feeling',
  'grateful', 'thankful', 'happy', 'sad', 'excited', 'worried',
  'met', 'saw', 'went', 'visited', 'traveled', 'trip', 'vacation',
  'birthday', 'anniversary', 'wedding', 'graduation', 'celebration',
  'memory', 'memories', 'moment', 'experience', 'reflection',
  'dear diary', 'thought', 'wonder', 'gratitude', 'quotes',
];

// Mapping from label preset categories to modes
const CATEGORY_MODE_MAP: Record<string, Mode> = {
  productivity: 'manage',
  planning: 'manage',
  checklists: 'manage',
  media: 'organize',
  creative: 'develop',
  personal: 'experience',
};

// ============================================
// Detection Result Type
// ============================================

export interface ModeDetectionResult {
  mode: Mode;
  confidence: number; // 0-1
}

// ============================================
// Main Detection Function
// ============================================

/**
 * Infer mode for a board based on its hashtag.
 * Uses label preset matching first, then falls back to keyword analysis.
 */
export function inferBoardMode(hashtag: string): ModeDetectionResult {
  // 1. Try label preset fuzzy match (uses category as proxy for mode)
  const preset = getPresetForLabelFuzzy(hashtag);
  if (preset) {
    const mode = CATEGORY_MODE_MAP[preset.category];
    if (mode) {
      return { mode, confidence: 0.9 };
    }
  }

  // 2. Fall back to keyword analysis of the hashtag
  const lowerHashtag = hashtag.toLowerCase().replace(/[-_]/g, ' ');

  const scores: Record<Mode, number> = {
    manage: 0,
    develop: 0,
    organize: 0,
    experience: 0,
  };

  const checkKeywords = (keywords: string[], mode: Mode) => {
    for (const keyword of keywords) {
      if (lowerHashtag.includes(keyword)) {
        scores[mode] += 0.4;
      }
    }
  };

  checkKeywords(MANAGE_KEYWORDS, 'manage');
  checkKeywords(DEVELOP_KEYWORDS, 'develop');
  checkKeywords(ORGANIZE_KEYWORDS, 'organize');
  checkKeywords(EXPERIENCE_KEYWORDS, 'experience');

  const modes = Object.keys(scores) as Mode[];
  const sortedModes = modes.sort((a, b) => scores[b] - scores[a]);
  const topMode = sortedModes[0];
  const topScore = scores[topMode];
  const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);

  const confidence = totalScore > 0 ? topScore / totalScore : 0;

  if (confidence >= 0.5 && topScore > 0) {
    return { mode: topMode, confidence };
  }

  // No confident match
  return { mode: 'organize', confidence: 0 };
}
