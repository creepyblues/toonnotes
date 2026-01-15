import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { applySecurity, validateBody } from './_utils/security';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Apply security middleware (CORS, rate limiting, method validation)
  if (!applySecurity(req, res, { allowedMethods: ['POST'] })) {
    return;
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  // Validate required fields
  if (!validateBody(req, res, ['imageData'])) {
    return;
  }

  try {
    const { imageData, mimeType } = req.body;

    console.log('Generating LUCKY theme from image...');

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 1.8, // High temperature for maximum randomness
        topK: 40,
        topP: 0.95,
      }
    });

    const luckyPrompt = `You are a CHAOTIC design generator. Look at this image and create the most unexpected, quirky, FUNNY note theme.

Rules:
- Pick a RANDOM aesthetic: vaporwave, deep-fried meme, cottagecore, dark academia, Y2K, brutalist, maximalist, ugly-chic, liminal space, fever dream, goblin mode, unhinged energy
- Give it a FUNNY 2-4 word name that sounds ABSURD and MEMORABLE
  Examples: "Goblin Mode Academia", "Unhinged Sunset", "Passive Aggressive Pastels", "Existential Sparkles", "Chaotic Cottagecore", "Dramatic Potato Energy", "Cursed Kawaii", "Feral Minimalism"
- Colors should be BOLD and unexpected - don't play it safe! Clash them if it's funny
- Border style should match the chaos
- The vibe should make people laugh or go "what??"

Return a JSON object with this exact structure:
{
  "name": "Funny absurd theme name",
  "vibe": "chaotic|unhinged|dramatic|cursed|blessed|feral|chaotic",
  "colors": {
    "background": "#HEXCOLOR",
    "text": "#HEXCOLOR",
    "accent": "#HEXCOLOR",
    "border": "#HEXCOLOR"
  },
  "styles": {
    "borderStyle": "solid|dashed|dotted|double",
    "borderWidth": "1px|2px|3px|4px|5px",
    "borderRadius": "0px|4px|8px|16px|24px|50px",
    "boxShadow": "subtle|medium|strong|extreme|none",
    "backgroundGradient": "none|subtle|medium|intense"
  }
}

BE WEIRD. BE BOLD. MAKE IT MEMORABLE AND SHAREABLE.
Return ONLY the JSON object, no other text.`;

    const result = await model.generateContent([
      luckyPrompt,
      {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: imageData
        }
      }
    ]);

    const response = await result.response;
    let text = response.text();

    // Clean up the response
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    console.log('Lucky theme response:', text);

    const themeData = JSON.parse(text);

    return res.status(200).json(themeData);

  } catch (error: any) {
    console.error('Error generating lucky theme:', error);

    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: 60
      });
    }

    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
