/**
 * Analyze Note Goal API
 *
 * POST /api/analyze-note-goal
 *
 * Uses Gemini AI to:
 * 1. Classify note into nudge engagement level (active/passive/none)
 * 2. Infer the user's goal from note content
 * 3. Generate 3-7 action steps with agent-appropriate voice
 *
 * Input: { noteTitle, noteContent, mode, agentId, completedSteps }
 * Output: { nudgeEngagement, goalStatement, reasoning, engagementReasoning, steps }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { applySecurity } from './_utils/security';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Agent personality descriptions for prompt
const AGENT_VOICES: Record<string, string> = {
  manager:
    'Direct and action-oriented. Breaks tasks into clear steps. Uses concise, motivating language.',
  muse:
    'Playful and encouraging. Frames creative exploration as exciting possibilities. Uses inspiring language.',
  librarian:
    'Organized and methodical. Focuses on categorization and enrichment. Uses precise language.',
  biographer:
    'Warm and reflective. Connects experiences to personal growth. Uses empathetic language.',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Security check
  const securityResult = applySecurity(req, res);
  if (securityResult) return securityResult;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  const { noteTitle, noteContent, mode, agentId, completedSteps } = req.body;

  if (!noteTitle || !noteContent) {
    return res.status(400).json({ error: 'noteTitle and noteContent required' });
  }

  if (noteTitle.length > 500 || noteContent.length > 10000) {
    return res.status(400).json({ error: 'Content too long' });
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const agentVoice = AGENT_VOICES[agentId] || AGENT_VOICES.manager;
    const completedContext =
      completedSteps && completedSteps.length > 0
        ? `\n\nThe user has already completed these steps: ${completedSteps.join(', ')}. Generate remaining steps that build on this progress.`
        : '';

    const prompt = `You are an AI assistant analyzing a note to help the user achieve their goal.

## Note
Title: "${noteTitle}"
Content: "${noteContent}"
Detected mode: ${mode}
${completedContext}

## Your Tasks

### 1. Classify Nudge Engagement Level
Determine how the system should interact with this note:

- **active**: The note has a clear actionable goal with urgency, deadlines, time-sensitive language, or action items with external dependencies. Examples: trip planning with dates, project with deadlines, task lists.
- **passive**: The note has a goal but no urgency. Creative exploration, open-ended planning, personal reflection. Examples: story ideas, recipe collection, journal with reflection prompts.
- **none**: The note is purely reference material. Bookmarks, copied text, simple lists without action intent, archived content. No actionable goal.

### 2. Infer Goal Statement (if not "none")
A short, action-oriented statement (5-10 words) describing what the user is trying to achieve.

### 3. Generate Action Steps (if not "none")
Create 3-7 concrete steps the user should take. Each step should:
- Be specific and actionable
- Use the agent's voice: ${agentVoice}
- Include a description that feels like a helpful nudge
- Specify actionType: "prompt_user" (most common), "auto_detect" (if detectable from note fields), or "manual_check"

## Response Format (JSON)
{
  "nudgeEngagement": "active" | "passive" | "none",
  "goalStatement": "string (5-10 words)",
  "reasoning": "Why this goal was inferred (1 sentence)",
  "engagementReasoning": "Why this engagement level (1 sentence)",
  "steps": [
    {
      "title": "Step title (3-5 words)",
      "description": "Nudge-style description in agent voice (1 sentence)",
      "actionType": "prompt_user" | "auto_detect" | "manual_check",
      "autoDetectField": "optional: note field to check (e.g., 'deadline', 'content')",
      "autoDetectCondition": "optional: 'exists' | 'gt' | 'contains'",
      "autoDetectValue": "optional: value to check against"
    }
  ]
}

If engagement is "none", return empty goalStatement, reasoning, and steps array.

Respond with ONLY valid JSON, no markdown formatting.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON from response (strip markdown fences if present)
    const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    // Validate required fields
    if (!parsed.nudgeEngagement || !['active', 'passive', 'none'].includes(parsed.nudgeEngagement)) {
      return res.status(500).json({ error: 'Invalid engagement level from AI' });
    }

    // Clamp steps to 3-7
    if (parsed.steps && parsed.steps.length > 7) {
      parsed.steps = parsed.steps.slice(0, 7);
    }

    return res.status(200).json({
      nudgeEngagement: parsed.nudgeEngagement,
      goalStatement: parsed.goalStatement || '',
      reasoning: parsed.reasoning || '',
      engagementReasoning: parsed.engagementReasoning || '',
      steps: (parsed.steps || []).map((s: any) => ({
        title: s.title || 'Untitled step',
        description: s.description || '',
        actionType: s.actionType || 'prompt_user',
        autoDetectField: s.autoDetectField,
        autoDetectCondition: s.autoDetectCondition,
        autoDetectValue: s.autoDetectValue,
      })),
    });
  } catch (error: any) {
    console.error('[analyze-note-goal] Error:', error.message);
    return res.status(500).json({ error: 'Failed to analyze note goal' });
  }
}
