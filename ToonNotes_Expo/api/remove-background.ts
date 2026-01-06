import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import sharp from 'sharp';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Helper function to convert white background to transparent
async function convertBackgroundToTransparent(imageBase64: string): Promise<string> {
  try {
    const inputBuffer = Buffer.from(imageBase64, 'base64');
    const image = sharp(inputBuffer);
    const metadata = await image.metadata();
    const { width, height } = metadata;

    if (!width || !height) {
      return imageBase64;
    }

    const rawBuffer = await image.ensureAlpha().raw().toBuffer();
    const THRESHOLD = 240;
    const outputBuffer = Buffer.alloc(rawBuffer.length);

    for (let i = 0; i < rawBuffer.length; i += 4) {
      const r = rawBuffer[i];
      const g = rawBuffer[i + 1];
      const b = rawBuffer[i + 2];
      const a = rawBuffer[i + 3];

      if (r >= THRESHOLD && g >= THRESHOLD && b >= THRESHOLD) {
        outputBuffer[i] = r;
        outputBuffer[i + 1] = g;
        outputBuffer[i + 2] = b;
        outputBuffer[i + 3] = 0;
      } else {
        outputBuffer[i] = r;
        outputBuffer[i + 1] = g;
        outputBuffer[i + 2] = b;
        outputBuffer[i + 3] = a;
      }
    }

    const outputPng = await sharp(outputBuffer, {
      raw: { width, height, channels: 4 }
    }).png().toBuffer();

    return outputPng.toString('base64');
  } catch (error) {
    console.error('Error converting background:', error);
    return imageBase64;
  }
}

/**
 * Unified background removal endpoint
 * Consolidates: generate-sticker, generate-lucky-sticker, generate-themed-sticker, generate-image-sticker
 *
 * Input:
 *   - imageData OR imageBase64: base64 encoded image (accepts either for backwards compat)
 *   - mimeType: optional, defaults to image/jpeg
 *   - type: optional, for logging ('basic' | 'lucky' | 'themed' | 'image')
 *   - themeData: optional theme metadata for themed stickers
 *
 * Output:
 *   - stickerData: base64 PNG with transparent background
 *   - stickerBase64: same as stickerData (for backwards compat with image-sticker callers)
 *   - mimeType: always 'image/png'
 *   - fallback: true if original image returned instead
 */
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
    const {
      imageData,      // Field name used by generate-sticker, generate-lucky-sticker, generate-themed-sticker
      imageBase64,    // Field name used by generate-image-sticker
      mimeType,
      type = 'basic', // For logging: 'basic' | 'lucky' | 'themed' | 'image'
      themeData,      // Optional: { themeId, themeName, artStyle, mood }
    } = req.body;

    // Accept either field name
    const inputImage = imageData || imageBase64;

    if (!inputImage) {
      // For themed sticker, if no image provided, return hints
      if (type === 'themed' && themeData) {
        return res.status(200).json({
          themeId: themeData.themeId,
          artStyle: themeData.artStyle,
          mood: themeData.mood,
          hints: themeData.aiPromptHints,
          message: 'No image provided - use these hints for sticker generation'
        });
      }
      return res.status(400).json({ error: 'imageData or imageBase64 is required' });
    }

    const logPrefix = type === 'lucky' ? 'Lucky sticker' :
                      type === 'themed' ? `Themed sticker (${themeData?.themeName || 'unknown'})` :
                      type === 'image' ? 'Image sticker' : 'Sticker';

    console.log(`${logPrefix}: Using Gemini to remove background...`);

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseModalities: ['image', 'text'],
      } as any
    });

    const prompt = `Remove the background from this image.

Instructions:
- Extract the main subject (character, person, animal, or object)
- Replace the background with pure WHITE (#FFFFFF)
- Keep the subject with clean, sharp edges
- The white background should be completely flat with no gradients
- Preserve fine details like hair, fur, or feathers

Output a PNG with the subject on a solid white background.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: inputImage
        }
      }
    ]);

    const response = await result.response;

    // Extract image from response
    let outputImage = null;
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if ((part as any).inlineData) {
        outputImage = (part as any).inlineData.data;
        break;
      }
    }

    if (!outputImage) {
      console.warn(`${logPrefix}: Gemini did not return an image, falling back to original`);
      return res.status(200).json({
        stickerData: inputImage,
        stickerBase64: inputImage,  // For backwards compat
        mimeType: mimeType || 'image/jpeg',
        fallback: true,
        transformed: false,
        ...(themeData?.themeId && { themeId: themeData.themeId }),
        ...(themeData?.artStyle && { artStyleApplied: themeData.artStyle }),
        message: 'Gemini could not process image - using original'
      });
    }

    // Convert white background to transparent
    console.log(`${logPrefix}: Converting white background to transparent...`);
    const transparentSticker = await convertBackgroundToTransparent(outputImage);

    console.log(`${logPrefix}: Background removed and made transparent`);

    return res.status(200).json({
      stickerData: transparentSticker,
      stickerBase64: transparentSticker,  // For backwards compat
      mimeType: 'image/png',
      fallback: false,
      transformed: true,
      ...(themeData?.themeId && { themeId: themeData.themeId }),
      ...(themeData?.artStyle && { artStyleApplied: themeData.artStyle }),
    });

  } catch (error: any) {
    console.error('Error in remove-background endpoint:', error);

    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: 60
      });
    }

    return res.status(500).json({
      error: error.message || 'Failed to remove background',
      fallback: true
    });
  }
}
