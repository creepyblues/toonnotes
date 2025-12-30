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
    const { analysis, style, noteTitle, noteContent } = req.body;

    // Use noteTitle if available, otherwise use first part of noteContent
    const textToUse = noteTitle || (noteContent ? noteContent.slice(0, 100) : '');

    if (!analysis || !style || !textToUse) {
      return res.status(400).json({ error: 'analysis, style, and either noteTitle or noteContent are required' });
    }

    console.log(`Typography Poster: Generating ${style} style typography for: "${textToUse.slice(0, 50)}..."`);

    // Style configurations for typography
    const styleConfigs: Record<string, any> = {
      'hand-lettered': {
        name: 'Hand-Lettered',
        artDirection: 'Hand-lettered calligraphy style with flowing, organic letters. Slight imperfections for authentic charm. Mix of thick and thin strokes like brush pen lettering.',
        fontVibe: 'flowing script with personality, organic curves',
        mood: 'personal, warm, artistic'
      },
      'brush-marker': {
        name: 'Brush/Marker',
        artDirection: 'Bold brush or marker strokes with varying thickness. Japanese/Chinese calligraphy influence. Expressive, dynamic, with ink-like texture.',
        fontVibe: 'expressive brushwork, dynamic strokes, varying pressure',
        mood: 'energetic, expressive, bold'
      },
      'designer': {
        name: 'Designer',
        artDirection: 'Professional hand-lettering design with mixed styles. Decorative flourishes, balanced composition. Like vintage sign painting meets modern typography art.',
        fontVibe: 'polished, decorative, multiple lettering styles combined',
        mood: 'crafted, professional, detailed'
      },
      'bold-modern': {
        name: 'Bold Modern',
        artDirection: 'Bold sans-serif inspired lettering, high impact poster style. Thick letters with strong presence. Maximalist, attention-grabbing typography.',
        fontVibe: 'thick bold letters, geometric, maximalist impact',
        mood: 'powerful, attention-grabbing, modern'
      }
    };

    const styleConfig = styleConfigs[style] || styleConfigs['hand-lettered'];

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // Use Gemini 2.0 Flash for image generation
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseModalities: ['image', 'text'],
      } as any
    });

    // Determine text to render (use title or content, limit length for better typography)
    const textToRender = textToUse.length <= 50
      ? textToUse
      : textToUse.slice(0, 50) + '...';

    const imagePrompt = `Create a beautiful typographic poster that renders this text as artistic hand-lettering:

TEXT TO RENDER: "${textToRender}"

NOTE ANALYSIS:
- Mood: ${analysis.mood.primary} (${analysis.mood.energy} energy)
- Tone: ${analysis.mood.tone}
- Purpose: ${analysis.context.purpose}
- Aesthetic: ${analysis.suggestedStyle.aesthetic}
- Color Mood: ${analysis.suggestedStyle.colorMood}

ART STYLE: ${styleConfig.name}
- ${styleConfig.artDirection}
- Font vibe: ${styleConfig.fontVibe}
- Mood: ${styleConfig.mood}

REQUIREMENTS:
1. The text must be READABLE and be the main visual element
2. Use ${styleConfig.name} lettering style throughout
3. Colors should complement the ${analysis.mood.primary} mood and ${analysis.suggestedStyle.colorMood} color palette
4. Simple, clean background (solid color or subtle gradient) - NOT busy
5. The typography IS the artwork - make each letter beautiful
6. Fill the frame well with the text composition
7. Style similar to motivational quote posters or hand-lettered signs
8. Add subtle decorative elements if appropriate (small flourishes, stars, hearts - based on mood)

Create this as if you're a professional hand-lettering artist making a poster print.
Output a high-quality image.`;

    const result = await model.generateContent(imagePrompt);
    const response = await result.response;

    let imageBase64 = null;
    let artistNotes = '';

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if ((part as any).inlineData) {
        imageBase64 = (part as any).inlineData.data;
      } else if ((part as any).text) {
        artistNotes = (part as any).text;
      }
    }

    if (!imageBase64) {
      throw new Error('No image generated');
    }

    console.log(`Typography Poster: ${styleConfig.name} typography generated!`);

    return res.status(200).json({
      imageBase64,
      mimeType: 'image/png',
      style,
      renderedText: textToRender,
      artistNotes: artistNotes || `Created in ${styleConfig.name} style with ${styleConfig.fontVibe}`
    });

  } catch (error: any) {
    console.error('Typography Poster error:', error);

    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: 60
      });
    }

    return res.status(500).json({ error: error.message || 'Failed to generate typography' });
  }
}
