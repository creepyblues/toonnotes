/**
 * Analyze Note Content API
 *
 * POST /api/analyze-note-content
 *
 * Analyzes note content using Gemini AI to:
 * 1. Match against existing labels with confidence scores
 * 2. Suggest new labels when existing ones don't fit
 * 3. Extract content analysis (topics, mood, type)
 *
 * Used by the auto-labeling system to organize notes automatically.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { applySecurity } from './_utils/security';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// The 30 preset label names for matching
const PRESET_LABELS = [
  // Productivity
  'todo', 'in-progress', 'done', 'waiting', 'priority',
  // Planning
  'goals', 'meeting', 'planning', 'deadline', 'project',
  // Checklists
  'shopping', 'wishlist', 'packing', 'bucket-list', 'errands',
  // Media
  'reading', 'watchlist', 'bookmarks', 'review', 'recommendation',
  // Creative
  'ideas', 'draft', 'brainstorm', 'inspiration', 'research',
  // Personal
  'journal', 'memory', 'reflection', 'gratitude', 'quotes',
];

// Valid mood values that match the client-side Zod schema
const VALID_MOODS = ['energetic', 'calm', 'playful', 'serious', 'dreamy', 'bold'] as const;
type ValidMood = typeof VALID_MOODS[number];

// Category mapping for new label suggestions
const LABEL_CATEGORIES = {
  productivity: ['todo', 'in-progress', 'done', 'waiting', 'priority'],
  planning: ['goals', 'meeting', 'planning', 'deadline', 'project'],
  checklists: ['shopping', 'wishlist', 'packing', 'bucket-list', 'errands'],
  media: ['reading', 'watchlist', 'bookmarks', 'review', 'recommendation'],
  creative: ['ideas', 'draft', 'brainstorm', 'inspiration', 'research'],
  personal: ['journal', 'memory', 'reflection', 'gratitude', 'quotes'],
};

interface AnalyzeRequest {
  noteTitle: string;
  noteContent: string;
  existingLabels?: string[]; // User's existing custom labels to also match against
}

interface MatchedLabel {
  labelName: string;
  confidence: number;
  reason: string;
}

interface SuggestedNewLabel {
  name: string;
  category: string;
  reason: string;
}

interface AnalysisResult {
  matchedLabels: MatchedLabel[];
  suggestedNewLabels: SuggestedNewLabel[];
  analysis: {
    topics: string[];
    mood: string;
    contentType: string;
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Apply security middleware (CORS, rate limiting, method validation)
  if (!applySecurity(req, res, { allowedMethods: ['POST'] })) {
    return;
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    const { noteTitle, noteContent, existingLabels = [] } = req.body as AnalyzeRequest;

    if (!noteTitle && !noteContent) {
      return res.status(400).json({ error: 'noteTitle or noteContent is required' });
    }

    console.log('Analyzing note content for labeling...');

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Combine preset labels with user's existing custom labels
    const allLabels = [...PRESET_LABELS, ...existingLabels.filter(l => !PRESET_LABELS.includes(l.toLowerCase()))];

    const prompt = `You are a note organization assistant. You understand content in ANY language (Korean, Japanese, Chinese, Spanish, French, German, etc.). Analyze notes regardless of their language and suggest appropriate labels from the English label list.

## Note to Analyze
Title: ${noteTitle || '(Untitled)'}
Content: ${noteContent || '(Empty)'}

## Available Labels
These are the labels that can be matched (case-insensitive):
${allLabels.join(', ')}

## Label Categories for Reference
- Productivity: todo, in-progress, done, waiting, priority (for tasks, action items)
- Planning: goals, meeting, planning, deadline, project (for schedules, goals)
- Checklists: shopping, wishlist, packing, bucket-list, errands (for lists of items)
- Media: reading, watchlist, bookmarks, review, recommendation (for books, shows, links)
- Creative: ideas, draft, brainstorm, inspiration, research (for creative work)
- Personal: journal, memory, reflection, gratitude, quotes (for personal thoughts)

## Instructions
1. Analyze the note's content and intent
2. Match to existing labels with confidence scores (0.0 to 1.0)
3. If existing labels don't fit well, suggest NEW label names (max 2)
4. Extract content analysis

Return a JSON object with this exact structure:
{
  "matchedLabels": [
    {
      "labelName": "exact label name from available list",
      "confidence": 0.95,
      "reason": "Brief explanation why this label fits"
    }
  ],
  "suggestedNewLabels": [
    {
      "name": "new-label-name",
      "category": "productivity|planning|checklists|media|creative|personal",
      "reason": "Why a new label is needed and what gap it fills"
    }
  ],
  "analysis": {
    "topics": ["main topic 1", "topic 2"],
    "mood": "energetic|calm|playful|serious|dreamy|bold",
    "contentType": "todo|list|journal|review|notes|brainstorm|plan|reference"
  }
}

## Rules
- Only include matchedLabels with confidence >= 0.3
- Order matchedLabels by confidence (highest first)
- Maximum 5 matchedLabels
- IMPORTANT: Use exact label names from the Available Labels list (e.g., "goals" not "goal", "ideas" not "idea", "shopping" not "shoppings")
- suggestedNewLabels should be lowercase, hyphenated (e.g., "meal-prep", "fitness-log")
- Only suggest new labels if existing ones don't fit well (max confidence < 0.7)
- Maximum 2 suggestedNewLabels
- Return ONLY the JSON object, no other text`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    console.log('Gemini response:', text);

    let analysisResult: AnalysisResult;

    try {
      analysisResult = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      // Return default structure on parse failure
      return res.status(200).json({
        matchedLabels: [],
        suggestedNewLabels: [],
        analysis: {
          topics: [],
          mood: 'calm',
          contentType: 'notes',
        },
      });
    }

    // Validate and sanitize the response
    const sanitizedResult: AnalysisResult = {
      matchedLabels: (analysisResult.matchedLabels || [])
        .filter((m: MatchedLabel) =>
          m.labelName &&
          typeof m.confidence === 'number' &&
          m.confidence >= 0.3
        )
        .map((m: MatchedLabel) => ({
          labelName: m.labelName.toLowerCase(),
          confidence: Math.min(1, Math.max(0, m.confidence)),
          reason: m.reason || '',
        }))
        .sort((a: MatchedLabel, b: MatchedLabel) => b.confidence - a.confidence)
        .slice(0, 5),
      suggestedNewLabels: (analysisResult.suggestedNewLabels || [])
        .filter((s: SuggestedNewLabel) => s.name && s.category)
        .map((s: SuggestedNewLabel) => ({
          name: s.name.toLowerCase().replace(/\s+/g, '-'),
          category: s.category,
          reason: s.reason || '',
        }))
        .slice(0, 2),
      analysis: {
        topics: analysisResult.analysis?.topics || [],
        // Validate mood against allowed values, default to 'calm' if invalid
        mood: VALID_MOODS.includes(analysisResult.analysis?.mood as ValidMood)
          ? analysisResult.analysis.mood
          : 'calm',
        contentType: analysisResult.analysis?.contentType || 'notes',
      },
    };

    return res.status(200).json(sanitizedResult);

  } catch (error: any) {
    console.error('Error analyzing note content:', error);

    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: 60,
      });
    }

    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
