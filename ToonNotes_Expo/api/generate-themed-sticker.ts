import type { VercelRequest, VercelResponse } from '@vercel/node';

// Note: @imgly/background-removal-node is too large for Vercel (250MB limit)
// This endpoint returns the original image as a fallback
// TODO: Integrate with a cloud background removal API (remove.bg, etc.)

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

  try {
    const { themeId, themeName, artStyle, mood, aiPromptHints, imageData, mimeType } = req.body;

    console.log(`Themed sticker for ${themeName}: returning original image (background removal not available)`);

    // If we have image data, return it as-is (fallback mode)
    if (imageData) {
      return res.status(200).json({
        stickerData: imageData,
        mimeType: mimeType || 'image/jpeg',
        themeId: themeId,
        artStyleApplied: artStyle,
        fallback: true,
        message: 'Background removal not available in production - using original image'
      });
    } else {
      // No image provided - return info about what sticker style would be used
      console.log('No image provided, returning theme sticker hints...');

      return res.status(200).json({
        themeId: themeId,
        artStyle: artStyle,
        mood: mood,
        hints: aiPromptHints,
        message: 'No image provided - use these hints for sticker generation'
      });
    }

  } catch (error: any) {
    console.error('Error in themed sticker endpoint:', error);

    return res.status(500).json({
      error: error.message || 'Failed to generate themed sticker',
      fallback: true
    });
  }
}
