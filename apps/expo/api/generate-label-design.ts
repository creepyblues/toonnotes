/**
 * Generate Label Design API
 *
 * POST /api/generate-label-design
 *
 * Generates a complete visual design preset for a new custom label.
 * The design matches the structure of built-in LabelPreset to ensure
 * consistent styling across the app.
 *
 * Used when users create new custom labels (first 5 free, then 1 coin each).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface GenerateDesignRequest {
  labelName: string;
  context?: string; // Optional context about what this label is for
}

interface GeneratedLabelDesign {
  id: string;
  name: string;
  category: string;
  icon: string;
  noteIcon: string;
  mood: 'energetic' | 'calm' | 'playful' | 'serious' | 'dreamy' | 'bold';
  description: string;
  colors: {
    primary: string;
    secondary: string;
    bg: string;
    text: string;
  };
  bgStyle: 'solid' | 'gradient' | 'pattern' | 'texture' | 'illustration';
  bgGradient?: string[];
  bgPattern?: string;
  fontStyle: 'sans-serif' | 'serif' | 'display' | 'handwritten' | 'mono';
  stickerType: 'corner' | 'floating' | 'border' | 'stamp' | 'none';
  stickerEmoji: string;
  stickerPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  aiPromptHints: string[];
  artStyle: string;
}

// Available patterns for backgrounds
const AVAILABLE_PATTERNS = [
  'lines-horizontal',
  'lines-diagonal',
  'dots-small',
  'grid',
];

// Available Phosphor icons for notes
const AVAILABLE_ICONS = [
  'Note', 'NotePencil', 'Notebook', 'BookOpen', 'File', 'FileText',
  'Star', 'Heart', 'Bookmark', 'Tag', 'Flag', 'Lightning',
  'Sparkle', 'Sun', 'Moon', 'Cloud', 'Fire', 'Leaf',
  'Coffee', 'Music', 'Camera', 'Palette', 'Pencil', 'Pen',
  'Calendar', 'Clock', 'Alarm', 'Timer', 'CheckSquare', 'ListChecks',
  'Target', 'Trophy', 'Medal', 'Gift', 'ShoppingCart', 'Bag',
  'House', 'MapPin', 'Airplane', 'Car', 'Bicycle', 'Train',
  'Users', 'User', 'UserCircle', 'Chat', 'ChatCircle', 'Envelope',
  'Phone', 'Desktop', 'DeviceMobile', 'Television', 'Gamepad',
  'Barbell', 'FirstAid', 'Pill', 'Brain', 'Eye', 'Ear',
  'ForkKnife', 'CookingPot', 'Wine', 'BeerBottle', 'Cookie',
  'Dog', 'Cat', 'Fish', 'Plant', 'Flower', 'Tree',
  'Money', 'CreditCard', 'Bank', 'Receipt', 'Calculator',
  'GraduationCap', 'Student', 'Books', 'Chalkboard', 'Exam',
  'Briefcase', 'Buildings', 'Factory', 'Storefront',
  'Wrench', 'Hammer', 'Scissors', 'Ruler', 'Compass',
  'Lightbulb', 'MagnifyingGlass', 'Binoculars', 'Telescope',
  'Atom', 'Flask', 'TestTube', 'Dna', 'Virus',
  'MusicNote', 'Microphone', 'Headphones', 'SpeakerHigh',
  'VideoCamera', 'FilmSlate', 'Popcorn', 'Ticket',
  'PaintBrush', 'Crayon', 'FrameCorners', 'Image',
  'Quotes', 'TextAa', 'Article', 'Newspaper',
  'Globe', 'World', 'Translate', 'ChatTeardrop',
];

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
    const { labelName, context } = req.body as GenerateDesignRequest;

    if (!labelName) {
      return res.status(400).json({ error: 'labelName is required' });
    }

    console.log(`Generating design for label: ${labelName}`);

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are a visual design system expert creating a note label design. Generate a cohesive, aesthetically pleasing design for this label.

## Label to Design
Name: ${labelName}
${context ? `Context: ${context}` : ''}

## Design Constraints
- Background patterns available: ${AVAILABLE_PATTERNS.join(', ')}
- Note icons available (Phosphor icons): ${AVAILABLE_ICONS.slice(0, 50).join(', ')}... and more

## Style Categories
- Productivity: energetic/bold colors, sans-serif fonts
- Planning: calm/serious tones, clean layout
- Checklists: playful/energetic, fun accents
- Media: dreamy/playful, entertainment vibe
- Creative: energetic/dreamy, artistic feel
- Personal: dreamy/calm, intimate warmth

Generate a JSON object with this exact structure:
{
  "name": "${labelName}",
  "category": "productivity|planning|checklists|media|creative|personal",
  "icon": "Two emojis that represent this label (e.g., '📚✨')",
  "noteIcon": "Single Phosphor icon name from the list",
  "mood": "energetic|calm|playful|serious|dreamy|bold",
  "description": "Short description (max 30 chars)",
  "colors": {
    "primary": "#HEX main accent color",
    "secondary": "#HEX secondary accent",
    "bg": "#HEX soft background (light, not white)",
    "text": "#HEX readable text color"
  },
  "bgStyle": "solid|gradient|pattern",
  "bgGradient": ["#start", "#end"],
  "bgPattern": "pattern name or null",
  "fontStyle": "sans-serif|serif|display|handwritten|mono",
  "stickerType": "corner|floating|stamp|none",
  "stickerEmoji": "Single decorative emoji",
  "stickerPosition": "top-right|bottom-right|top-left|bottom-left",
  "aiPromptHints": ["keyword1", "keyword2", "keyword3", "keyword4"],
  "artStyle": "Anime art style description for sticker generation, ~15 words"
}

## Design Guidelines
1. Colors should be harmonious and readable
2. Background colors should be soft pastels (not pure white)
3. Primary color should be vibrant but not harsh
4. Text color should have good contrast with background
5. Choose mood and style that match the label's semantic meaning
6. Icon should visually represent the label concept
7. If bgStyle is "gradient", provide bgGradient array
8. If bgStyle is "pattern", provide bgPattern from available list
9. artStyle should describe a cute anime character related to the label

Return ONLY the JSON object, no other text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    console.log('Gemini response:', text);

    let designData: any;

    try {
      designData = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      // Return a default design on parse failure
      return res.status(200).json(createDefaultDesign(labelName));
    }

    // Validate and sanitize the response
    const sanitizedDesign: GeneratedLabelDesign = {
      id: labelName.toLowerCase().replace(/\s+/g, '-'),
      name: labelName,
      category: validateCategory(designData.category),
      icon: designData.icon || '📝✨',
      noteIcon: validateIcon(designData.noteIcon),
      mood: validateMood(designData.mood),
      description: (designData.description || `Notes about ${labelName}`).slice(0, 30),
      colors: validateColors(designData.colors),
      bgStyle: validateBgStyle(designData.bgStyle),
      bgGradient: designData.bgStyle === 'gradient' && Array.isArray(designData.bgGradient)
        ? designData.bgGradient.slice(0, 2)
        : undefined,
      bgPattern: designData.bgStyle === 'pattern' && AVAILABLE_PATTERNS.includes(designData.bgPattern)
        ? designData.bgPattern
        : undefined,
      fontStyle: validateFontStyle(designData.fontStyle),
      stickerType: validateStickerType(designData.stickerType),
      stickerEmoji: designData.stickerEmoji || '✨',
      stickerPosition: validatePosition(designData.stickerPosition),
      aiPromptHints: Array.isArray(designData.aiPromptHints)
        ? designData.aiPromptHints.slice(0, 4)
        : [labelName, 'notes', 'organized'],
      artStyle: designData.artStyle || `anime character related to ${labelName}, cute style`,
    };

    return res.status(200).json(sanitizedDesign);

  } catch (error: any) {
    console.error('Error generating label design:', error);

    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: 60,
      });
    }

    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

// Helper functions for validation

function createDefaultDesign(labelName: string): GeneratedLabelDesign {
  return {
    id: labelName.toLowerCase().replace(/\s+/g, '-'),
    name: labelName,
    category: 'personal',
    icon: '📝✨',
    noteIcon: 'Note',
    mood: 'calm',
    description: `Notes about ${labelName}`.slice(0, 30),
    colors: {
      primary: '#6C5CE7',
      secondary: '#A29BFE',
      bg: '#F3F0FF',
      text: '#2D3436',
    },
    bgStyle: 'solid',
    fontStyle: 'sans-serif',
    stickerType: 'none',
    stickerEmoji: '✨',
    stickerPosition: 'bottom-right',
    aiPromptHints: [labelName.toLowerCase(), 'notes', 'organized', 'personal'],
    artStyle: `cute anime character with ${labelName} theme, soft colors`,
  };
}

function validateCategory(category: string): string {
  const valid = ['productivity', 'planning', 'checklists', 'media', 'creative', 'personal'];
  return valid.includes(category) ? category : 'personal';
}

function validateMood(mood: string): GeneratedLabelDesign['mood'] {
  const valid: GeneratedLabelDesign['mood'][] = ['energetic', 'calm', 'playful', 'serious', 'dreamy', 'bold'];
  return valid.includes(mood as any) ? mood as GeneratedLabelDesign['mood'] : 'calm';
}

function validateBgStyle(style: string): GeneratedLabelDesign['bgStyle'] {
  const valid: GeneratedLabelDesign['bgStyle'][] = ['solid', 'gradient', 'pattern', 'texture', 'illustration'];
  return valid.includes(style as any) ? style as GeneratedLabelDesign['bgStyle'] : 'solid';
}

function validateFontStyle(style: string): GeneratedLabelDesign['fontStyle'] {
  const valid: GeneratedLabelDesign['fontStyle'][] = ['sans-serif', 'serif', 'display', 'handwritten', 'mono'];
  return valid.includes(style as any) ? style as GeneratedLabelDesign['fontStyle'] : 'sans-serif';
}

function validateStickerType(type: string): GeneratedLabelDesign['stickerType'] {
  const valid: GeneratedLabelDesign['stickerType'][] = ['corner', 'floating', 'border', 'stamp', 'none'];
  return valid.includes(type as any) ? type as GeneratedLabelDesign['stickerType'] : 'none';
}

function validatePosition(position: string): GeneratedLabelDesign['stickerPosition'] {
  const valid: GeneratedLabelDesign['stickerPosition'][] = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];
  return valid.includes(position as any) ? position as GeneratedLabelDesign['stickerPosition'] : 'bottom-right';
}

function validateIcon(icon: string): string {
  // Return the icon if it looks valid, otherwise default
  if (icon && typeof icon === 'string' && icon.length > 0 && icon.length < 50) {
    return icon;
  }
  return 'Note';
}

function validateColors(colors: any): GeneratedLabelDesign['colors'] {
  const defaultColors = {
    primary: '#6C5CE7',
    secondary: '#A29BFE',
    bg: '#F3F0FF',
    text: '#2D3436',
  };

  if (!colors || typeof colors !== 'object') {
    return defaultColors;
  }

  const isValidHex = (c: string) => /^#[0-9A-Fa-f]{6}$/.test(c);

  return {
    primary: isValidHex(colors.primary) ? colors.primary : defaultColors.primary,
    secondary: isValidHex(colors.secondary) ? colors.secondary : defaultColors.secondary,
    bg: isValidHex(colors.bg) ? colors.bg : defaultColors.bg,
    text: isValidHex(colors.text) ? colors.text : defaultColors.text,
  };
}
