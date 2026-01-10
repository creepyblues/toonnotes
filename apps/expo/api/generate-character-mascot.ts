import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Quality signals interface for type safety
interface QualitySignals {
  hasTransparency: boolean;
  transparencyRatio: number;
  edgeSharpness: 'clean' | 'rough' | 'unknown';
  processingMethod: 'ai' | 'threshold' | 'fallback';
  confidenceScore: number;
}

interface QualityMetadata {
  qualitySignals: QualitySignals;
  warnings: string[];
}

interface CharacterConfig {
  name: string;
  artDirection: string;
  proportions: string;
  expressionStyle: string;
}

/**
 * Extract quality signals from character generation response
 * Analyzes the AI's text output to detect style alignment and potential issues
 */
function extractCharacterQuality(
  description: string | undefined,
  artistNotes: string | undefined,
  config: CharacterConfig,
  requestedMood: string
): QualityMetadata {
  const warnings: string[] = [];
  let confidence = 1.0;

  // Check if description exists and has meaningful content
  if (!description || description.length < 10) {
    warnings.push('Character description missing');
    confidence -= 0.2;
  }

  // Check for style keyword alignment
  const styleWords = config.name.toLowerCase().split(' ').filter(w => w.length > 2);
  const combinedText = ((description || '') + ' ' + (artistNotes || '')).toLowerCase();

  const matchedStyleWords = styleWords.filter(word => combinedText.includes(word));
  if (matchedStyleWords.length < styleWords.length / 2) {
    warnings.push(`Style may not match ${config.name}`);
    confidence -= 0.2;
  }

  // Check mood alignment
  if (!combinedText.includes(requestedMood.toLowerCase())) {
    warnings.push(`Mood may not match "${requestedMood}"`);
    confidence -= 0.15;
  }

  // Check for transparency mention (we requested transparent PNG)
  const mentionsTransparency =
    combinedText.includes('transparent') ||
    combinedText.includes('png') ||
    combinedText.includes('alpha');
  if (!mentionsTransparency) {
    warnings.push('Transparency not confirmed in response');
    confidence -= 0.1;
  }

  // Check for character-related keywords to confirm generation
  const characterKeywords = ['character', 'draw', 'illustrat', 'creat', 'design'];
  const hasCharacterContent = characterKeywords.some(kw => combinedText.includes(kw));
  if (!hasCharacterContent) {
    warnings.push('Character generation not confirmed');
    confidence -= 0.15;
  }

  return {
    qualitySignals: {
      hasTransparency: mentionsTransparency,
      transparencyRatio: 0, // Unknown without image analysis
      edgeSharpness: 'unknown', // Would need image analysis
      processingMethod: 'ai',
      confidenceScore: Math.max(0.2, Math.min(1.0, confidence)),
    },
    warnings,
  };
}

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
    const { analysis, characterType, noteTitle, noteContent } = req.body;

    // Use noteTitle if available, otherwise use first part of noteContent
    const textToUse = noteTitle || (noteContent ? noteContent.slice(0, 100) : '');

    if (!analysis || !characterType || !textToUse) {
      return res.status(400).json({ error: 'analysis, characterType, and either noteTitle or noteContent are required' });
    }

    console.log(`Character Mascot: Generating ${characterType} character for: "${textToUse.slice(0, 30)}..."`);

    // Character type configurations
    const characterConfigs: Record<string, any> = {
      'chibi-anime': {
        name: 'Chibi Anime',
        artDirection: 'Chibi/super-deformed anime style. Large head with small body (2:1 or 3:1 ratio). Big expressive eyes, simplified features. Cute and adorable proportions.',
        proportions: 'chibi 2:1 head to body ratio, oversized head, tiny body',
        expressionStyle: 'exaggerated cute expressions, big sparkly eyes, simple mouth'
      },
      'realistic-anime': {
        name: 'Anime Character',
        artDirection: 'Standard anime/manga proportions. Detailed eyes with highlights, dynamic pose capable. Professional manga illustration quality.',
        proportions: 'standard anime 6-7 head tall, balanced proportions',
        expressionStyle: 'expressive but proportional, detailed eyes with emotion'
      },
      'mascot-cute': {
        name: 'Mascot',
        artDirection: 'Cute mascot character - could be animal, creature, or fantasy being. Kawaii aesthetic, round shapes, friendly appearance. Think brand mascots or game companions.',
        proportions: 'round, simplified, approachable silhouette, blob-like cuteness',
        expressionStyle: 'friendly, simple, iconic expressions, always happy/encouraging'
      }
    };

    const charConfig = characterConfigs[characterType] || characterConfigs['chibi-anime'];

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // Use Gemini 2.0 Flash for image generation
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseModalities: ['image', 'text'],
      } as any
    });

    // Determine character pose/action based on mood
    const moodToPose: Record<string, string> = {
      'happy': 'cheerfully waving or giving thumbs up',
      'excited': 'jumping with joy or pumping fist',
      'calm': 'peaceful smile, hands together',
      'focused': 'pointing forward determinedly',
      'sad': 'looking sympathetic with gentle expression',
      'motivated': 'striking an encouraging pose',
      'reflective': 'thoughtful pose with hand on chin',
      'energetic': 'dynamic action pose'
    };

    const pose = moodToPose[analysis.mood.primary] || 'cheerfully presenting';

    const imagePrompt = `Create an anime character that appears to be announcing or presenting a message:

MESSAGE CONTEXT:
- Title/Content: "${textToUse.slice(0, 50)}"
- Purpose: ${analysis.context.purpose}
- Topics: ${analysis.keywords.topics.join(', ')}

NOTE MOOD:
- Primary: ${analysis.mood.primary} (${analysis.mood.energy} energy)
- Tone: ${analysis.mood.tone}

CHARACTER STYLE: ${charConfig.name}
- ${charConfig.artDirection}
- Proportions: ${charConfig.proportions}
- Expression: ${charConfig.expressionStyle}

REQUIREMENTS:
1. Character should be ${pose} - matching the ${analysis.mood.primary} mood
2. The character appears to be presenting or announcing something (like they're sharing the note's message)
3. Pose ideas: holding a sign, speech bubble gesture, pointing enthusiastically, or announcing pose
4. Expression matches the content mood (${analysis.mood.primary}, ${analysis.mood.tone})
5. TRANSPARENT BACKGROUND (PNG with alpha channel)
6. Full body or 3/4 body shot (not just face)
7. Clean, crisp linework suitable for use as a sticker
8. Character should feel like they "belong" with the note's theme

Draw this as a professional anime illustrator creating a character sticker.
Make the character appealing and full of personality!`;

    const result = await model.generateContent(imagePrompt);
    const response = await result.response;

    let imageBase64 = null;
    let characterDescription = '';
    let artistNotes = '';

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if ((part as any).inlineData) {
        imageBase64 = (part as any).inlineData.data;
      } else if ((part as any).text) {
        const text = (part as any).text;
        if (text.toLowerCase().includes('character') || text.toLowerCase().includes('drawing')) {
          characterDescription = text;
        } else {
          artistNotes = text;
        }
      }
    }

    if (!imageBase64) {
      throw new Error('No image generated');
    }

    // Extract quality signals from the response
    const qualityMetadata = extractCharacterQuality(
      characterDescription,
      artistNotes,
      charConfig,
      analysis.mood.primary
    );

    console.log(`Character Mascot: ${charConfig.name} character generated! (confidence: ${qualityMetadata.qualitySignals.confidenceScore.toFixed(2)})`);

    return res.status(200).json({
      imageBase64,
      mimeType: 'image/png',
      characterType,
      characterDescription: characterDescription || `A ${charConfig.name} style character`,
      poseDescription: `Character is ${pose}, expressing ${analysis.mood.primary} energy`,
      artistNotes: artistNotes || `Created in ${charConfig.name} style with ${charConfig.expressionStyle}`,
      qualityMetadata
    });

  } catch (error: any) {
    console.error('Character Mascot error:', error);

    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: 60
      });
    }

    return res.status(500).json({ error: error.message || 'Failed to generate character' });
  }
}
