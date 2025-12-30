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
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    console.log('Image sticker: returning original image (background removal not available in production)');

    // Return original image as fallback
    return res.status(200).json({
      stickerBase64: imageBase64,
      mimeType: mimeType || 'image/jpeg',
      fallback: true,
      message: 'Background removal not available in production - using original image'
    });

  } catch (error: any) {
    console.error('Error in image sticker endpoint:', error);

    return res.status(500).json({
      error: error.message || 'Failed to process sticker',
    });
  }
}
