/**
 * Auto-Categorize Skill - Librarian Agent
 *
 * Detects content patterns and suggests appropriate categories/tags.
 * "This looks like a recipe. Move to Recipes?"
 */

import { SkillBuilder, skillRegistry, createNudgeResult, noAction, dismissOption } from '../index';
import type { SkillContext, SkillResult, NudgeParams } from '../../agents/Agent';
import { OrganizeData } from '@/types';
import { LIBRARIAN_SKILL_IDS } from '../../agents/LibrarianAgent';

// ============================================
// Category Detection
// ============================================

interface CategoryPattern {
  id: string;
  label: string;
  emoji: string;
  patterns: RegExp[];
  suggestedBoard?: string;
}

const CATEGORY_PATTERNS: CategoryPattern[] = [
  {
    id: 'recipe',
    label: 'Recipe',
    emoji: '🍳',
    patterns: [
      /ingredients?:/i,
      /instructions?:/i,
      /(?:cup|tbsp|tsp|oz|lb|gram|ml)\b/i,
      /(?:preheat|bake|cook|simmer|boil|fry|sauté)/i,
      /serves?\s+\d+/i,
    ],
    suggestedBoard: '#recipes',
  },
  {
    id: 'article',
    label: 'Article',
    emoji: '📰',
    patterns: [
      /^https?:\/\/(?:medium|substack|dev\.to|blog)/i,
      /\b(?:read|article|post|published)\b/i,
      /by\s+[A-Z][a-z]+\s+[A-Z]/i,
    ],
    suggestedBoard: '#reading',
  },
  {
    id: 'video',
    label: 'Video',
    emoji: '🎬',
    patterns: [
      /youtube\.com|youtu\.be|vimeo\.com/i,
      /\b(?:watch|video|episode|tutorial)\b/i,
    ],
    suggestedBoard: '#watch-later',
  },
  {
    id: 'book',
    label: 'Book',
    emoji: '📚',
    patterns: [
      /\b(?:book|novel|author|chapter|page\s+\d+)\b/i,
      /ISBN/i,
      /goodreads\.com/i,
    ],
    suggestedBoard: '#reading',
  },
  {
    id: 'quote',
    label: 'Quote',
    emoji: '💬',
    patterns: [
      /^[""].*[""]$/m,
      /—\s*[A-Z][a-z]+/,
      /\b(?:said|wrote|quote)\b/i,
    ],
    suggestedBoard: '#quotes',
  },
  {
    id: 'code',
    label: 'Code Snippet',
    emoji: '💻',
    patterns: [
      /```[\s\S]*```/,
      /\b(?:function|const|let|var|import|export|class)\b/,
      /github\.com|stackoverflow\.com/i,
    ],
    suggestedBoard: '#dev',
  },
  {
    id: 'product',
    label: 'Product',
    emoji: '🛒',
    patterns: [
      /\$\d+(?:\.\d{2})?/,
      /amazon\.com|ebay\.com/i,
      /\b(?:buy|price|review|rating)\b/i,
    ],
    suggestedBoard: '#wishlist',
  },
  {
    id: 'travel',
    label: 'Travel',
    emoji: '✈️',
    patterns: [
      /\b(?:hotel|flight|airbnb|booking|trip|travel|visit)\b/i,
      /tripadvisor\.com|booking\.com/i,
    ],
    suggestedBoard: '#travel',
  },
];

function detectCategory(content: string): CategoryPattern | null {
  const normalizedContent = content.toLowerCase();

  for (const category of CATEGORY_PATTERNS) {
    const matchCount = category.patterns.filter(p => p.test(content)).length;
    // Require at least 2 pattern matches for confidence
    if (matchCount >= 2) {
      return category;
    }
  }

  return null;
}

// ============================================
// Skill Definition
// ============================================

const categorizeSkill = new SkillBuilder({
  id: LIBRARIAN_SKILL_IDS.CATEGORIZE,
  name: 'Auto-Categorize',
  description: 'Suggests categories based on content patterns',
  agentId: 'librarian',
  cooldownMs: 0, // No cooldown
})
  // Trigger on note creation or update
  .onEvent('note_created')
  .onEvent('note_updated')

  // Custom trigger logic
  .when((ctx: SkillContext) => {
    if (!ctx.note || !ctx.behavior || ctx.behavior.mode !== 'organize') return false;

    const data = ctx.behavior.modeData as OrganizeData;

    // Only categorize inbox items without tags
    if (data.stage !== 'inbox') return false;
    if (data.tags.length > 0) return false;

    // Check if category can be detected
    const category = detectCategory(ctx.note.content);
    return category !== null;
  })

  // Execute skill
  .do(async (ctx: SkillContext): Promise<SkillResult> => {
    if (!ctx.note || !ctx.behavior) return noAction();

    const data = ctx.behavior.modeData as OrganizeData;

    // Already has tags
    if (data.tags.length > 0) return noAction();

    const category = detectCategory(ctx.note.content);
    if (!category) return noAction();

    const itemTitle = ctx.note.title || ctx.note.content.split('\n')[0].slice(0, 30);

    const nudgeParams: NudgeParams = {
      title: `${category.emoji} This looks like a ${category.label.toLowerCase()}`,
      body: `"${itemTitle}" matches ${category.label.toLowerCase()} patterns.${category.suggestedBoard ? ` Move to ${category.suggestedBoard}?` : ''}`,
      priority: 'low',
      deliveryChannel: 'toast',
      options: [
        {
          id: 'accept',
          label: category.suggestedBoard ? `Move to ${category.suggestedBoard}` : `Tag as ${category.label}`,
          isPrimary: true,
          action: category.suggestedBoard
            ? {
                type: 'move_note',
                noteId: ctx.note.id,
                targetBoard: category.suggestedBoard,
              }
            : {
                type: 'custom',
                handler: 'add_tag',
                data: { noteId: ctx.note.id, tag: category.id },
              },
        },
        {
          id: 'different',
          label: 'Different category',
          action: {
            type: 'navigate',
            target: `/note/${ctx.note.id}?focus=labels`,
          },
        },
        dismissOption(),
      ],
    };

    return createNudgeResult(nudgeParams);
  })

  .build();

// ============================================
// Registration
// ============================================

skillRegistry.register(categorizeSkill, 'librarian');

export { categorizeSkill, detectCategory, CATEGORY_PATTERNS };
export default categorizeSkill;
