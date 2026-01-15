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
    const { imageData, mimeType, themeId, baseColors } = req.body;

    console.log(`Extracting colors for ${themeId} theme...`);

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Analyze this image and extract colors that would harmonize with the following base theme colors:

Base Theme Colors:
- Background: ${baseColors?.background || '#FFFFFF'}
- Title: ${baseColors?.title || '#000000'}
- Body: ${baseColors?.body || '#333333'}
- Accent: ${baseColors?.accent || '#0ea5e9'}
- Border: ${baseColors?.border || '#E5E7EB'}

Theme ID: ${themeId}

Extract colors from the image that:
1. Complement or enhance the base theme colors
2. Maintain readability (good contrast between background and text)
3. Feel cohesive with the theme's aesthetic

Return a JSON object with ONLY the colors you want to override (don't include colors that should stay the same):
{
  "colors": {
    "background": "#HEXCOLOR (optional)",
    "title": "#HEXCOLOR (optional)",
    "body": "#HEXCOLOR (optional)",
    "accent": "#HEXCOLOR (optional)",
    "border": "#HEXCOLOR (optional)"
  }
}

Only include colors that you're confident would improve the theme based on the image.
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

    // Clean up the response
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    console.log('Color extraction response:', text);

    const colorData = JSON.parse(text);

    return res.status(200).json(colorData);

  } catch (error: any) {
    console.error('Error extracting colors:', error);

    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: 60
      });
    }

    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
