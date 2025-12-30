import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    const { hashtag, noteContent, userHint } = req.body;

    if (!hashtag) {
      return res.status(400).json({ error: 'hashtag is required' });
    }

    console.log(`Generating board design for #${hashtag}...`);

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const boardPrompt = `Design a visual theme for a board (collection of notes) in a manga/anime note-taking app.

BOARD HASHTAG: #${hashtag}

NOTES IN THIS BOARD:
${noteContent && noteContent.length > 0 ? noteContent.join('\n') : '(No notes yet)'}

${userHint ? `USER'S STYLE PREFERENCE: ${userHint}` : ''}

Create a cohesive board design that:
1. Reflects the theme suggested by the hashtag "#${hashtag}"
2. Matches the mood and content of the notes (if provided)
3. Appeals to manga/anime fans
4. Works well for a corkboard-style display

Consider these anime aesthetics:
- Shonen (bold, energetic, action-packed)
- Shoujo (soft, romantic, sparkly)
- Slice of Life (cozy, warm, gentle)
- Dark Fantasy (moody, mysterious, gothic)
- Kawaii (cute, pastel, playful)
- Cyberpunk (neon, techy, futuristic)
- Vintage Anime (retro 80s/90s aesthetic)

Return a JSON object with this exact structure:
{
  "name": "Creative 2-4 word board name (e.g., 'Starlit Inspiration Board', 'Shonen Dream Collection')",
  "header": {
    "background_color": "#HEX (header background)",
    "text_color": "#HEX (hashtag text)",
    "badge_color": "#HEX (note count badge background)",
    "badge_text_color": "#HEX (badge text)",
    "accent_color": "#HEX (decorative accents)"
  },
  "corkboard": {
    "background_color": "#HEX (main board area background)",
    "texture_id": "corkboard|paper|fabric|wood|null",
    "texture_opacity": 0.1 to 0.8,
    "border_color": "#HEX (bottom border)"
  },
  "decorations": {
    "icon": "lucide-icon-name or null (e.g., 'heart', 'star', 'zap', 'sparkles', 'book', 'music')",
    "icon_color": "#HEX or null",
    "accent_type": "sparkles|stars|hearts|flowers|none",
    "accent_color": "#HEX or null"
  },
  "design_summary": "1-2 sentence explanation of design choices",
  "source_keywords": ["3-5 keywords extracted from hashtag/notes"],
  "theme_inspiration": "shonen|shoujo|slice_of_life|dark_fantasy|kawaii|cyberpunk|vintage|minimal"
}

Make the design feel unique and tailored to this specific board.
Return ONLY the JSON object.`;

    const result = await model.generateContent(boardPrompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    console.log('Board design response:', text);

    const designData = JSON.parse(text);

    return res.status(200).json(designData);

  } catch (error: any) {
    console.error('Error generating board design:', error);

    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: 60
      });
    }

    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
