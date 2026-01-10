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
    const { imageData, mimeType } = req.body;

    if (!imageData) {
      return res.status(400).json({ error: 'imageData is required' });
    }

    console.log('Generating theme from image...');

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Analyze this image and create a note theme based on its visual style and colors.

Return a JSON object with this exact structure:
{
  "name": "A creative 2-3 word theme name",
  "colors": {
    "background": "#HEXCOLOR for note background",
    "text": "#HEXCOLOR for text",
    "accent": "#HEXCOLOR for accents/highlights",
    "border": "#HEXCOLOR for borders"
  },
  "styles": {
    "borderStyle": "solid|dashed|dotted|double",
    "borderWidth": "1px|2px|3px",
    "borderRadius": "8px|12px|16px",
    "boxShadow": "subtle|medium|strong|none",
    "backgroundGradient": "none|subtle|medium"
  }
}

Extract colors directly from the image. Make the theme feel cohesive and inspired by the image's mood and aesthetic.
Return ONLY the JSON object, no other text.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: imageData
        }
      }
    ]);

    const response = await result.response;
    let text = response.text();

    // Clean up the response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    console.log('Gemini response:', text);

    const themeData = JSON.parse(text);

    return res.status(200).json(themeData);

  } catch (error: any) {
    console.error('Error generating theme:', error);

    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: 60
      });
    }

    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
